import {attachCityWindowShader} from './city-window-shader.js?v=b477ce33502c';
import {attachFacadeSurface} from './facade-surface.js?v=b477ce33502c';
/** Mipmapped physical surface maps and inhabited recessed windows, without thin geometry. */
export function facadeMaterial(T,{glass='#587c85',frame='#52666c',stone=false,arch=false,kind='glass',pitchX=1.45,pitchY=2.1,seed=1841,occupancy=masonryOccupancy(kind,stone),surfaceMaps={}}={}){
  const masonry=stone||kind==='brick'||kind==='iron';
  const makeCanvas=()=>{const c=document.createElement('canvas');c.width=512;c.height=1024;return c;};
  const colorCanvas=makeCanvas(),glowCanvas=makeCanvas(),bumpCanvas=makeCanvas(),roughCanvas=makeCanvas(),metalCanvas=makeCanvas();
  const g=colorCanvas.getContext('2d'),glow=glowCanvas.getContext('2d'),bump=bumpCanvas.getContext('2d'),rough=roughCanvas.getContext('2d'),metal=metalCanvas.getContext('2d');
  const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  const fill=(c,color)=>{c.fillStyle=color;c.fillRect(0,0,512,1024);};
  fill(g,frame);fill(glow,'#000000');fill(bump,'#a0a0a0');fill(rough,masonry?'#e0e0e0':'#757575');fill(metal,masonry?'#161616':'#aeaeae');
  const scanned=Boolean(surfaceMaps[kind==='brick'?'brick':'concrete']?.normalMap);
  const course=kind==='brick'&&!scanned?8:masonry?32:64,brickWidth=kind==='brick'&&!scanned?32:masonry?96:64;
  for(let yy=0;yy<1024;yy+=course)for(let xx=-brickWidth;xx<512;xx+=brickWidth){
    const x=xx+((yy/course)%2?brickWidth*.5:0),v=random();
    g.fillStyle=`rgba(${v<.5?'34,28,23':'238,229,207'},${.025+v*.065})`;g.fillRect(x+1,yy+1,brickWidth-2,course-2);
    const height=Math.round(138+v*26);bump.fillStyle=`rgb(${height},${height},${height})`;bump.fillRect(x+1,yy+1,brickWidth-2,course-2);
    rough.fillStyle=`rgb(${Math.round(190+v*50)},${Math.round(190+v*50)},${Math.round(190+v*50)})`;rough.fillRect(x+1,yy+1,brickWidth-2,course-2);
    if(masonry&&!scanned){g.fillStyle='rgba(39,36,29,.13)';g.fillRect(x,yy,brickWidth,kind==='brick'?1:2);bump.fillStyle='#707070';bump.fillRect(x,yy,brickWidth,1);}
  }
  function path(c,x,y,w,h){c.beginPath();if(arch){const r=w/2;c.moveTo(x,y+h);c.lineTo(x,y+r);c.arc(x+r,y+r,r,Math.PI,0);c.lineTo(x+w,y+h);c.closePath();}else c.rect(x,y,w,h);}
  function opening(c,color,x,y,w,h){c.fillStyle=color;path(c,x,y,w,h);c.fill();}
  // Offices share occupied suites along floors; residences have independent rooms.
  const office=!masonry,occupied=new Set(),temperatures=new Set();
  for(let row=0;row<16;row++){
    const suiteStart=Math.floor(random()*6),suiteLength=2+Math.floor(random()*4),floorOn=random()<occupancy;
    for(let col=0;col<8;col++)if(office?(floorOn&&col>=suiteStart&&col<suiteStart+suiteLength)||(random()<.045):random()<occupancy)occupied.add(row*8+col);
  }
  const whites=office?['#e3e7e5','#d5dfe9','#e9dec9']:['#f0d4ad','#e5c9ad','#dbe0df','#eedbc2'];
  for(let row=0;row<16;row++)for(let col=0;col<8;col++){
    const id=row*8+col,x=col*64,y=row*64,inset=masonry?11:3,w=64-inset*2,h=masonry?43:53,px=x+inset,py=y+6,on=occupied.has(id),variation=random();
    opening(g,'rgba(17,28,30,.6)',px-3,py-3,w+6,h+7);
    opening(bump,'#414141',px-2,py-2,w+4,h+4);
    opening(g,glass,px,py,w,h);
    opening(bump,'#555555',px,py,w,h);opening(rough,on?'#838383':variation<.5?'#555555':'#737373',px,py,w,h);opening(metal,variation<.5?'#6c6c6c':'#949494',px,py,w,h);
    g.save();path(g,px,py,w,h);g.clip();
    const reflect=g.createLinearGradient(px,py,px+w,py+h);reflect.addColorStop(0,'rgba(202,218,226,.31)');reflect.addColorStop(.38,'rgba(27,47,51,.04)');reflect.addColorStop(1,'rgba(12,22,29,.42)');g.fillStyle=reflect;g.fillRect(px,py,w,h);
    // Interior ceiling, side wall, back-wall object and shades suggest room depth.
    g.fillStyle='rgba(15,24,31,.4)';g.beginPath();g.moveTo(px,py);g.lineTo(px+w,py);g.lineTo(px+w-5,py+8);g.lineTo(px+5,py+8);g.closePath();g.fill();
    g.fillStyle='rgba(26,33,32,.24)';g.fillRect(px,py,4,h);g.fillRect(px+w-3,py,3,h);
    const curtain=random(),blindHeight=8+random()*20;
    if(curtain<.28){g.fillStyle='rgba(189,192,187,.27)';g.fillRect(px,py,w*.22,h);g.fillRect(px+w*.81,py,w*.19,h);}else if(curtain<.54){g.fillStyle='rgba(167,177,180,.32)';g.fillRect(px,py,w,blindHeight);}
    g.restore();
    if(on){
      const tint=whites[Math.floor(random()*whites.length)],brightness=.52+random()*.42;temperatures.add(tint);
      glow.save();path(glow,px,py,w,h);glow.clip();
      // Light falls across a recessed room instead of turning the entire pane yellow.
      const light=office?glow.createLinearGradient(px,py,px,py+h):glow.createRadialGradient(px+w*.69,py+h*.46,1,px+w*.54,py+h*.55,h*.85);
      light.addColorStop(0,tint);light.addColorStop(.35,office?'#929d9d':'#8c8275');light.addColorStop(1,'#1b242b');glow.globalAlpha=brightness;glow.fillStyle=light;glow.fillRect(px,py,w,h);glow.globalAlpha=1;
      glow.fillStyle='#121b22';glow.fillRect(px,py,w,5);glow.fillRect(px,py,3,h);glow.fillRect(px+w-3,py,3,h);
      if(office){glow.fillStyle=tint;glow.fillRect(px+w*.14,py+7,w*.56,1.7);glow.fillStyle='#202b31';glow.fillRect(px+w*.23,py+h*.68,w*.6,3);glow.fillRect(px+w*.3,py+h*.5,w*.2,h*.16);}
      else{glow.fillStyle='#20262a';glow.fillRect(px+w*.12,py+h*.71,w*.49,h*.29);glow.fillRect(px+w*.69,py+h*.53,1,h*.3);glow.fillStyle=tint;glow.beginPath();glow.moveTo(px+w*.62,py+h*.43);glow.lineTo(px+w*.78,py+h*.43);glow.lineTo(px+w*.82,py+h*.55);glow.lineTo(px+w*.58,py+h*.55);glow.closePath();glow.fill();}
      if(curtain<.28){glow.fillStyle='rgba(17,23,28,.68)';glow.fillRect(px,py,w*.22,h);glow.fillRect(px+w*.81,py,w*.19,h);}else if(curtain<.54){glow.fillStyle='rgba(21,29,34,.74)';glow.fillRect(px,py,w,blindHeight);}
      glow.fillStyle='#000';glow.fillRect(x+31,py+4,2,h-5);glow.fillRect(px,py+h*.55,w,2);glow.fillRect(px,py+h-2,w,3);glow.restore();
    }
    // Recessed jamb, sill highlight and broad crossbars are carried by the texture.
    g.fillStyle='rgba(222,216,192,.45)';g.fillRect(px-2,py+h+1,w+4,3);g.fillStyle='rgba(17,31,34,.5)';g.fillRect(px,py+h-2,w,3);
    g.fillStyle=masonry?'rgba(190,187,163,.65)':'rgba(135,156,157,.55)';g.fillRect(x+31,py+4,2,h-5);g.fillRect(px,py+h*.55,w,2);
    bump.fillStyle='#bbbbbb';bump.fillRect(px-2,py+h+1,w+4,2);bump.fillRect(x+31,py+4,2,h-5);
  }
  function texture(c,srgb=false){const tex=new T.CanvasTexture(c);if(srgb)tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.anisotropy=8;tex.generateMipmaps=true;return tex;}
  const material=new T.MeshPhysicalMaterial({map:texture(colorCanvas,true),emissiveMap:texture(glowCanvas,true),bumpMap:texture(bumpCanvas),roughnessMap:texture(roughCanvas),metalnessMap:texture(metalCanvas),bumpScale:masonry?.055:.018,color:'#ffffff',emissive:'#ffffff',emissiveIntensity:.08,roughness:masonry?.93:.56,metalness:masonry?0:.28,clearcoat:masonry?.04:.4,clearcoatRoughness:.3});
  material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
    varying vec2 vFacadeMeters;
    varying float vFacadeWall;
  `).replace('#include <uv_vertex>',`#include <uv_vertex>
    #ifdef USE_MAP
    vec3 panelScale=vec3(1.0);
    vec3 panelTranslation=vec3(0.0);
    vec2 buildingOffset=vec2(0.0);
    #ifdef USE_INSTANCING
    panelScale=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
    panelTranslation=instanceMatrix[3].xyz;
    vec2 address=instanceMatrix[3].xz;
    buildingOffset=vec2(mod(floor(abs(address.x*7.13+address.y*3.71)),8.0)/8.0,mod(floor(abs(address.y*11.17-address.x*2.39)),16.0)/16.0);
    #endif
    vec3 panelP=position*panelScale;
    float facadeHorizontal=abs(normal.z)>.5?panelP.x:panelP.z;
    float facadeHeight=panelP.y+panelTranslation.y;
    vFacadeMeters=vec2(facadeHorizontal+(abs(normal.z)>.5?panelTranslation.x:panelTranslation.z),facadeHeight);
    vFacadeWall=1.0-step(.45,abs(normal.y));
    vMapUv=vec2(facadeHorizontal,facadeHeight)/vec2(${(pitchX*8).toFixed(4)},${(pitchY*16).toFixed(4)})+.5+buildingOffset+vec2(normal.x>.5?.375:normal.z<-.5?.625:0.0,0.0);
    #ifdef USE_EMISSIVEMAP
    vEmissiveMapUv=vMapUv;
    #endif
    #ifdef USE_BUMPMAP
    vBumpMapUv=vMapUv;
    #endif
    #ifdef USE_ROUGHNESSMAP
    vRoughnessMapUv=vMapUv;
    #endif
    #ifdef USE_METALNESSMAP
    vMetalnessMapUv=vMapUv;
    #endif
    #endif`);};
  material.customProgramCacheKey=()=>`nyc-inhabited-v5-${kind}-${pitchX}-${pitchY}-${arch}`;
  material.userData.architecture={kind,masonry,arch,pitchX,pitchY,frame,glass,mipmapped:true,litFraction:occupied.size/128,physicalMaps:true,daylightEmission:.08,roomLighting:office?'floor-suites':'individual-lamps',lightTemperatures:[...temperatures],instanceAddressVariation:true,continuousFloors:true};attachFacadeSurface(T,material,surfaceMaps);attachCityWindowShader(T,material);return material;
}
function masonryOccupancy(kind,stone){return stone||kind==='brick'||kind==='iron'?.27:.54;}
