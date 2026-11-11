import * as THREE from '../three.module.js?v=b477ce33502c';
export { THREE };
export function createContext(world,surfaceMaps={}){
  const materials=new Map(),glowMaterials=[]; let seed=2187;
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  const noiseTextures=new Map(),dataTextures=new Map();
  function dataTexture(type,color){const key=type+color;if(!dataTextures.has(key)){const t=texture(type,color).clone();t.colorSpace=THREE.NoColorSpace;t.needsUpdate=true;dataTextures.set(key,t);}return dataTextures.get(key);}
  function texture(type,color){
    const key=type+color;if(noiseTextures.has(key))return noiseTextures.get(key);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
    c.fillStyle=color;c.fillRect(0,0,256,256);let n=717;
    const noise=()=>{n=(n*16807)%2147483647;return(n-1)/2147483646;};
    for(let i=0;i<12000;i++){const k=noise();c.fillStyle=k>.5?'rgba(255,255,255,.045)':'rgba(0,0,0,.05)';c.fillRect(noise()*256,noise()*256,1+noise()*2,1+noise()*2)}
    if(type==='wood'||type==='bark'){
      for(let row=-5;row<262;row+=1.8){c.strokeStyle=row%3<1?'rgba(47,31,18,.11)':'rgba(240,225,188,.09)';c.lineWidth=.45+noise()*.65;c.beginPath();for(let x=0;x<=256;x+=4){const y=row+Math.sin(x*.026+row*.15)*1.6+Math.sin(x*.071+row*.06)*.7;x===0?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
      for(let row=0;row<256;row+=64){c.strokeStyle='rgba(58,40,24,.14)';c.lineWidth=1;c.beginPath();c.moveTo(0,row);c.lineTo(256,row);c.stroke()}
    }
    if(type==='fabric'){
      for(let k=0;k<256;k+=3){c.fillStyle=k%2?'rgba(250,235,210,.16)':'rgba(35,31,28,.13)';c.fillRect(k,0,1,256);c.fillRect(0,k,256,1)}
    }
    if(['stone','concrete','asphalt','gravel','soil','grass'].includes(type)){
      for(let i=0;i<2300;i++){const x=noise()*256,y=noise()*256,r=.4+noise()*(type==='gravel'?3.5:1.4);c.fillStyle=noise()>.55?'rgba(240,234,213,.20)':'rgba(30,39,33,.19)';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
      if(type==='stone')for(let k=0;k<8;k++){c.strokeStyle='rgba(32,44,37,.18)';c.lineWidth=.6;c.beginPath();c.moveTo(noise()*256,0);c.bezierCurveTo(noise()*256,90,noise()*256,170,noise()*256,256);c.stroke();}
      if(type==='grass')for(let i=0;i<700;i++){const x=noise()*256,y=noise()*256;c.strokeStyle=noise()>.5?'rgba(48,80,42,.2)':'rgba(180,195,125,.16)';c.beginPath();c.moveTo(x,y);c.lineTo(x+noise()*4-2,y-2-noise()*4);c.stroke();}
    }
    if(type==='metal')for(let y=0;y<256;y++){c.fillStyle=noise()>.5?'rgba(236,240,234,.06)':'rgba(30,38,39,.05)';c.fillRect(0,y,256,1)}
    if(type==='brick'){

      for(let y=0;y<256;y+=16)for(let x=(y%32===0?-32:-16);x<256;x+=32){c.fillStyle=noise()>.5?'rgba(70,36,23,.10)':'rgba(239,213,169,.08)';c.fillRect(x+2,y+2,28,12)}
      c.strokeStyle='rgba(211,202,180,.5)';c.lineWidth=1.6;
      for(let y=0;y<=256;y+=16){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();for(let x=(y%32===0?0:16);x<256;x+=32){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+16);c.stroke()}}
    }
    const t=new THREE.CanvasTexture(canvas);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(type==='brick'?2:3,type==='brick'?3:3);t.anisotropy=4;noiseTextures.set(key,t);return t;
  }
  function material(color,kind='plain'){
    if(color?.isMaterial)return color;const key=color+'|'+kind;if(materials.has(key))return materials.get(key);
    const m=new THREE.MeshStandardMaterial({color:kind==='plain'?color:'#ffffff',roughness:kind==='glass'?.16:kind==='ceramic'?.24:kind==='lacquer'?.18:kind==='rubber'?.97:kind==='metal'?.28:kind==='fabric'?.96:.8,metalness:kind==='glass'?.12:kind==='metal'?.8:0});
    if(kind!=='plain'&&kind!=='glass'){m.map=texture(kind,color);m.bumpMap=dataTexture(kind,'#999999');m.bumpScale=kind==='brick'?.055:kind==='fabric'?.018:kind==='stone'?.05:kind==='wood'?.028:.02;m.roughnessMap=dataTexture('roughness','#e5e5e5');}
    if(kind==='ceramic'){m.bumpScale=.003;m.envMapIntensity=1.1;}
    if(kind==='glass'){m.color.set(color);m.envMapIntensity=1.4;}
    if(surfaceMaps[kind]){
      Object.assign(m,surfaceMaps[kind]);m.color.set(color);m.bumpMap=null;m.normalScale.setScalar(kind==='brick'?.4:.18);
      // Preserve each building's palette; the scan supplies real variation and
      // relief rather than tinting every material the same photographic brown.
      m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('diffuseColor *= sampledDiffuseColor;','sampledDiffuseColor.rgb = vec3(clamp(dot(sampledDiffuseColor.rgb,vec3(.2126,.7152,.0722))*3.5,.28,1.55));\n diffuseColor *= sampledDiffuseColor;');};
      m.customProgramCacheKey=()=> 'photographic-surface-'+kind+'-v1';m.userData.scannedSurface=kind;
    }
    m.userData.surface=kind;materials.set(key,m);return m;
  }
  const geos=new Map();
  function box(w,h,d,color,x,y,z,parent=world){const key=`b${w}|${h}|${d}`;let geo=geos.get(key);if(!geo){geo=new THREE.BoxGeometry(w,h,d);geos.set(key,geo)}const m=new THREE.Mesh(geo,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  function cylinder(r,h,color,x,y,z,parent=world){const key=`c${r}|${h}`;let geo=geos.get(key);if(!geo){geo=new THREE.CylinderGeometry(r,r,h,10);geos.set(key,geo)}const m=new THREE.Mesh(geo,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  function label(text,w,h,x,y,z,bg='#25463c',fg='#f3e7cf',parent=world){
    const canvas=document.createElement('canvas'),scale=new THREE.Vector3();parent.getWorldScale(scale);
    const aspect=Math.max(.2,w*Math.abs(scale.x)/(h*Math.abs(scale.y)));
    canvas.width=2048;canvas.height=Math.max(128,Math.round(canvas.width/aspect));
    const c=canvas.getContext('2d'),cw=canvas.width,ch=canvas.height,pad=ch*.11;
    c.fillStyle=bg;c.fillRect(0,0,cw,ch);c.strokeStyle=fg;c.lineWidth=Math.max(2,ch*.012);c.strokeRect(pad,pad,cw-pad*2,ch-pad*2);
    let size=ch*.49;c.font='600 '+size+'px Arial, sans-serif';const measured=c.measureText(text).width;if(measured>cw-pad*4){size*=((cw-pad*4)/measured);c.font='600 '+size+'px Arial, sans-serif';}
    c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';c.fillText(text,cw/2,ch*.515);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.anisotropy=8;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,roughness:.55,side:THREE.DoubleSide}));m.position.set(x,y,z);parent.add(m);return m;
  }
  return {THREE,world,materials,material,box,cylinder,random,label,glowMaterials,texture,surfaceMaps};
}
