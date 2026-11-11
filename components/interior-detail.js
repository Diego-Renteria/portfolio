import {detailKit} from './detail-kit.js?v=b477ce33502c';
import {APARTMENT_LIGHT_SCENES} from './apartment-lighting-settings.js?v=b477ce33502c';
import {albumSleeves} from './album-sleeves.js?v=b477ce33502c';
export {APARTMENT_LIGHT_SCENES} from './apartment-lighting-settings.js?v=b477ce33502c';

// Artist interpretations of Hue's scene families, not proprietary preset RGBs.
// Saturated indirect accents stay dim enough to preserve the nighttime mood.

// Native-scale detail layers share instanced geometry. Millwork, textiles and
// small useful objects give each destination a finished, inhabited character.
export function buildInteriorDetails(ctx,parent,id){
  const k=detailKit(ctx,parent,id+' layered interior finishes'),{T,box,soft,cyl,round,rod}=k;
  const walnut=k.mat('#694a34','wood'),oak=k.mat('#b38c5c','wood'),stone=k.mat('#b7b4a6','stone'),steel=k.mat('#8b999a','metal'),brass=k.mat('#b49358','metal');
  const dark='#293737',cream='#e5ddc8',orange='#d38342',colors=['#a45e48','#7c978b','#c29c54','#5b7e8a','#9c7f85','#d3c6a7'];
  const cloth=c=>k.mat(c,'fabric'),glow=k.mat('#edd6a7').clone();glow.emissive=new T.Color(id==='lately'?'#ffc687':'#ffd59b');glow.emissiveIntensity=.65;ctx.glowMaterials.push(glow);
  let objects=0;const features=[];
  function light(x,y,z,intensity=5,distance=4.8,color=id==='projects'?'#e4eee8':id==='about'?'#ffdfbd':id==='lately'?'#ffd398':'#ffe7ca'){
    const l=new T.PointLight(color,intensity*4,distance,2);
    l.name=id+' installed interior fixture';l.position.set(x,y,z);l.castShadow=false;k.group.add(l);
    // The visible fixture and illumination now share the same physical position.
    const diffuser=glow.clone();diffuser.color.set(color);diffuser.emissive.set(color);
    cyl(.15,.07,steel,x,y+.07,z);cyl(.12,.018,diffuser,x,y+.025,z);rod([x,y+.1,z],[x,y+.33,z],.018,steel);
    l.diffuserMaterial=diffuser;return l;
  }
  function stack(x,y,z,n=4,w=.3){for(let i=0;i<n;i++){box(w-i*.012,.045,.23,colors[i%6],x+(i%2)*.018,y+i*.047,z,[0,(i%2-.5)*.13,0]);box(w-.035,.024,.224,cream,x+(i%2)*.018,y+.004+i*.047,z,[0,(i%2-.5)*.13,0]);}objects+=n;}
  function cup(x,y,z,c=cream){cyl(.06,.11,c,x,y+.055,z);cyl(.05,.009,'#664c36',x,y+.114,z);k.put('torus',.039,.039,.039,c,x+.065,y+.06,z,[0,Math.PI/2,0]);objects++;}
  function vase(x,y,z,h=.3,c=cream){cyl(.07,h*.6,c,x,y+h*.3,z);round(.2,h*.62,.2,c,x,y+h*.37,z);cyl(.045,h*.4,c,x,y+h*.8,z);for(let i=0;i<3;i++){rod([x,y+h,z],[x+(i-1)*.07,y+h+.24+i*.05,z+.025*i],.008,'#788466');round(.07,.12,.035,'#8a9c78',x+(i-1)*.08,y+h+.2+i*.04,z+.025*i,[0,0,i*.45]);}objects++;}
  function frame(x,y,z,w=.65,h=.5,style=0){
    box(w+.08,h+.08,.06,walnut,x,y,z);box(w,h,.015,cream,x,y,z+.039);
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;const c=canvas.getContext('2d');
    c.fillStyle=['#d8c7a7','#d0d7c6','#d2ac8a','#9ab2b2'][style%4];c.fillRect(0,0,768,512);
    if(style%2===0){
      c.fillStyle='#e9ddba';c.beginPath();c.arc(575,125,65,0,Math.PI*2);c.fill();
      for(let row=0;row<4;row++){c.fillStyle=['#a8ad91','#7a9184','#57766d','#3d5b53'][row];c.beginPath();c.moveTo(0,512);for(let i=0;i<=12;i++)c.lineTo(i*64,190+row*65+Math.sin(i*.8+row)*45);c.lineTo(768,512);c.fill();}
    }else{
      c.fillStyle='#334c49';c.fillRect(80,70,170,340);c.fillStyle='#be815c';c.fillRect(270,170,320,190);c.fillStyle='#e9d4aa';c.beginPath();c.arc(535,170,90,0,Math.PI*2);c.fill();c.fillStyle='#6b8a83';c.fillRect(390,320,280,65);
    }
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
    const m=new T.Mesh(new T.PlaneGeometry(w-.06,h-.06),new T.MeshStandardMaterial({map,roughness:.72}));m.position.set(x,y,z+.052);k.group.add(m);objects++;
  }
  function rug(x,y,z,w,d,c){soft(w,.025,d,cloth(c),x,y,z);for(const side of[-1,1]){box(w-.12,.007,.045,cloth('#cabc9e'),x,y+.018,z+side*(d/2-.11));for(let i=0;i<18;i++)box(.018,.01,.1,cream,x-w/2+.1+i*(w-.2)/17,y,z+side*(d/2+.025));}objects++;}
  function sconce(x,y,z){box(.14,.4,.06,brass,x,y,z);rod([x,y-.03,z+.04],[x,y-.03,z+.23],.018,brass);k.put('cone',.17,.21,.17,cream,x,y+.04,z+.25);cyl(.13,.025,glow,x,y-.075,z+.25);}
  function drawers(x,y,z,w=1.25,h=.8,d=.5,c=oak){box(w,h,d,c,x,y+h/2,z);box(w+.04,.055,d+.04,stone,x,y+h+.028,z);for(let row=0;row<4;row++){const yy=y+.12+row*(h-.1)/4;box(w-.06,.025,.015,dark,x,yy,z+d/2+.012);box(w*.28,.025,.035,brass,x,yy+.055,z+d/2+.035);}objects++;}
  function kitchen(x,y,z,w=2.2,c=oak){
    drawers(x,y,z,w,.78,.62,c);box(w+.08,.065,.69,stone,x,y+.84,z);box(.56,.025,.38,dark,x+w*.25,y+.887,z);
    for(const a of[-1,1])for(const b of[-1,1])cyl(.066,.011,steel,x+w*.25+a*.14,y+.909,z+b*.095);
    box(.48,.02,.31,steel,x-w*.25,y+.887,z);box(.35,.015,.22,dark,x-w*.25,y+.906,z);
    rod([x-w*.25,y+.9,z-.12],[x-w*.25,y+1.12,z-.12],.015,brass);rod([x-w*.25,y+1.12,z-.12],[x-w*.25,y+1.12,z+.02],.015,brass);
    box(w,.045,.3,c,x,y+1.56,z-.12);box(w-.1,.015,.04,glow,x,y+1.527,z+.015);
    for(let i=0;i<5;i++)cyl(.045,.17,colors[i],x-w*.35+i*w*.16,y+1.67,z-.11);
    cup(x+.1,y+.89,z+.05);vase(x-w*.4,y+.89,z,.18);objects+=10;
  }
  if(id==='lately'){
    features.push('paneled reading hall','coffer ceiling','textured reading rug','book-filled bays','reading nook','framed landscapes','warm sconces');
    // Full-height side millwork and a continuous coffer ceiling unify the hall.
    for(const x of[4.98,11.62])for(let z=5.45;z<16.5;z+=1.1){
      box(.07,1.15,1.04,walnut,x,1.02,z);box(.09,.055,1.08,oak,x,1.62,z);box(.09,.055,1.08,oak,x,.48,z);
      for(const dz of[-.49,.49])box(.09,1.12,.045,oak,x,1.05,z+dz);
      box(.035,.89,.82,k.mat('#93704c','wood'),x+(x<8?1:-1)*.04,1.04,z);
    }
    for(let z=5.2;z<16.7;z+=1.55)box(6.55,.15,.14,walnut,8.3,8.25,z);
    for(const x of[5.15,6.73,8.3,9.87,11.45])box(.12,.15,11.5,walnut,x,8.25,10.9);
    for(const x of[6,7.55,9.1,10.65])for(const z of[6,9.1,12.2,15.3])box(1.42,.045,1.4,cloth('#d9d0b8'),x,8.34,z);
    rug(8.65,.439,12.9,4.55,6.8,'#8d7059');rug(10.43,.462,12.8,2.0,1.9,'#a38c67');
    for(const x of[6.2,10.95])sconce(x,3.13,5.01);
    frame(5.9,7.25,5.02,.68,.62,0);frame(10.9,7.25,5.02,.68,.62,2);
    // A tucked-away nook alongside the main study tables.
    for(const [x,yaw]of[[9.7,.18],[11.05,-.18]]){
      soft(.66,.18,.68,cloth('#637c6c'),x,.83,12.4,[0,yaw,0]);soft(.68,.65,.14,cloth('#637c6c'),x,1.16,12.09,[.12,yaw,0]);
      for(const side of[-1,1])soft(.13,.35,.66,cloth('#637c6c'),x+side*.32,1.01,12.4,[0,yaw,0]);
      soft(.31,.27,.1,cloth('#bd9a64'),x,1.25,12.18,[.2,yaw,.1]);
    }
    cyl(.38,.065,walnut,10.4,.94,13.1);cyl(.055,.48,brass,10.4,.67,13.1);stack(10.4,.99,13.1,3);cup(10.62,.98,13.15);
    for(const x of[7.44,7.54])stack(x,1.29,11.17,2,.23);
    frame(10.7,1.46,15.45,.28,.34,2);vase(10.42,1.303,15.7,.22);
    light(7.4,7.95,13.6,11,10);light(10.3,7.95,8.3,10,10);
    // The gallery floor cannot illuminate the ground-floor reading tables alone.
    light(6.5,3.45,13.7,10,6.2,'#ffcf92');light(10.1,3.45,9.1,9,6.2,'#ffdbad');
  }
  if(id==='projects'){
    features.push('electronic workbench','native-scale drawer storage','cable looms','safety shields','material racks','zoned workshop floor');
    // Robot-cell cabinetry fits underneath the existing two-metre work table.
    drawers(-18.95,4.06,14.58,1.6,.69,.88,steel);drawers(-19.01,.33,12.625,1.3,.65,.6,steel);
    for(let col=0;col<7;col++)for(let row=0;row<3;row++){
      box(.19,.15,.23,k.mat('#819395','metal'),-19.65+col*.21,1.47+row*.17,5.19);box(.12,.035,.015,cream,-19.65+col*.21,1.48+row*.17,5.315);
      for(let n=0;n<3;n++)cyl(.016,.035,colors[(n+col)%6],-19.7+col*.21+n*.045,1.56+row*.17,5.2);
    }
    for(let row=0;row<3;row++)box(1.58,.035,.29,steel,-19.02,1.377+row*.17,5.19);
    for(const x of[-19.79,-18.25])box(.04,.75,.04,steel,x,1.62,5.08);
    // Oscilloscope, soldering stand, PCB and organized hand tools.
    drawers(-15.15,.33,7.35,1.25,.73,.58,oak);soft(.53,.33,.37,steel,-15.4,1.3,7.3);box(.34,.22,.018,dark,-15.44,1.32,7.5);box(.3,.18,.01,k.mat('#5f9187'),-15.44,1.32,7.515);
    for(let i=0;i<10;i++)box(.013,.018,.008,'#b6d2a8',-15.58+i*.031,1.32+Math.sin(i*1.2)*.045,7.525);
    for(let i=0;i<4;i++)cyl(.024,.023,steel,-15.14,1.4-i*.07,7.51,[Math.PI/2,0,0]);
    box(.4,.025,.3,'#496f57',-14.9,1.13,7.45);for(let i=0;i<5;i++)box(.04,.025,.07,dark,-15.05+i*.065,1.16,7.45);
    for(const x of[-14.98,-14.82])rod([x,1.17,7.44],[x+.05,1.17,7.52],.007,'#b79b59');
    rod([-15.03,1.13,7.3],[-14.82,1.35,7.3],.027,steel);rod([-14.82,1.35,7.3],[-14.74,1.3,7.4],.012,dark);
    // Dedicated material rack and floor tool cart, separated from printer travel.
    for(const x of[-20.05,-19.35])box(.055,2.15,.055,steel,x,1.4,8.05);
    for(let row=0;row<4;row++){box(.8,.06,.55,oak,-19.7,.48+row*.53,8.05);for(let n=0;n<3;n++)cyl(.06,.55,colors[(n+row)%6],-19.94+n*.24,.64+row*.53,8.05,[Math.PI/2,0,0]);}
    for(const y of[.34,4.06]){
      box(2.5,.008,.055,'#cfb365',-18.7,y,13.2);for(let i=0;i<14;i++)box(.1,.008,.24,dark,-19.82+i*.17,y+.006,13.22,[0,-.55,0]);
    }
    const shield=k.mat('#accac9','glass').clone();shield.transparent=true;shield.opacity=.13;shield.depthWrite=false;
    box(.026,1.1,1.2,shield,-20.02,5.62,14.62);for(const z of[14.03,15.21])rod([-20.03,5.09,z],[-20.03,6.18,z],.02,steel);
    for(let i=0;i<4;i++)rod([-20.1,3.5,6.1+i*.22],[-20.1,3.5,16.1],.025,colors[i]);
    for(let i=0;i<3;i++){const x=-16.0+i*.14;rod([x,4.82,9.2],[x,4.2,9.2],.012,i%2?orange:dark);rod([x,4.2,9.2],[x+.24,4.2,10],.012,i%2?orange:dark);}
    frame(-17.2,2.12,4.96,1.1,.7,3);
    light(-18.6,6.87,14.6,12,6.1);light(-15.5,2.85,13.0,12,6.1);
    light(-15.6,6.87,8.3,8,5.4,'#f4f1e4');light(-18.8,2.85,8.4,8,5.4,'#dcecf1');
  }
  if(id==='music'){
    const collectionFaces=[];
    features.push('additional record bins','sleeve artwork','wood acoustic slats','poster wall','listening textiles','speaker wiring');
    for(let x=13.75;x<20.5;x+=.16)box(.055,3.7,.09,walnut,x,2.3,4.94);
    for(const [x,index]of[[14.91,0],[19.29,8]]){
      box(1.17,.35,.9,oak,x,1.23,11.65);box(1.2,.08,.92,walnut,x,1.04,11.65);
      for(const dx of[-.5,.5])for(const dz of[-.32,.32])cyl(.035,.73,dark,x+dx,.67,11.65+dz);
      for(const dx of[-.55,0,.55])box(.045,.42,.92,oak,x+dx,1.32,11.65);
      for(let n=0;n<10;n++)for(const dx of[-.27,.27]){
        box(.49,.49,.035,colors[(n+index)%6],x+dx,1.48,11.32+n*.068,[-.15,0,0]);
        collectionFaces.push({position:[x+dx,1.48,11.32+n*.068+.0198],size:.475,tilt:-.15,index:36+index*5+n*2+(dx>0?1:0)});
      }
    }
    k.group.add(albumSleeves(T,collectionFaces,'40 additional browsing sleeves — all from Diego’s collection'));
    for(let i=0;i<5;i++)frame(14.4+i*1.35,4.32,5.04,.83,.64,i);
    rug(14.98,.322,9.85,2.0,2.0,'#9c7458');rug(17.1,.325,14.0,2.15,4.6,'#a08a68');
    soft(.42,.29,.12,cloth('#c59a63'),14.97,1.3,9.55,[.2,0,.18]);soft(.61,.04,.66,cloth('#bc8c63'),14.99,.93,10.05,[.04,0,.04]);
    stack(15.72,.88,9.86,4,.32);cup(18.8,1.25,9.53);vase(19.2,1.25,9.52,.25);
    for(const x of[14.1,20.08]){
      rod([x,1.6,5.8],[x,.4,5.8],.018,dark);rod([x,.4,5.8],[x,.4,8.5],.018,dark);
      for(let n=0;n<4;n++)k.put('torus',.11+n*.014,.11+n*.014,.11+n*.014,dark,x,.35,8.55,[Math.PI/2,0,0]);
    }
    box(1.4,.07,.55,oak,19.6,1.2,7.2);for(let n=0;n<6;n++)box(.16,.35,.25,colors[n],19.11+n*.19,1.41,7.2);
    sconce(14.05,3.1,5.04);sconce(20.1,3.1,5.04);
    light(15.5,4.45,9.6,13,7.0,'#ffe4bf');light(18.8,3.8,14.5,16,6.5,'#fff0dc');
  }
  if(id==='about'){
    features.push('six individual textile palettes','drawn-back curtains','framed art','apartment millwork','compact kitchens','decorative ceramics');
    const floors=[3.456,5.832,8.208,10.584,12.96,15.336];
    const palettes=['#d4b6a0','#85877b','#dbd7bd','#394d63','#a7b897','#ddd8c6'];
    for(const[y,i]of floors.map((y,i)=>[y,i])){
      rod([-11.53,y+2.16,16.77],[-5.07,y+2.16,16.77],.018,brass);
      for(const side of[-1,1])for(let fold=0;fold<7;fold++)cyl(.043,1.98,cloth(palettes[i]),-8.3+side*(2.91+fold*.055),y+1.12,16.73+(fold%2)*.045);
      const cove=glow.clone();cove.color.set(APARTMENT_LIGHT_SCENES[i].strip);cove.emissive.set(APARTMENT_LIGHT_SCENES[i].strip);cove.emissiveIntensity=.48;
      cove.userData.apartmentLight={floor:i,role:'strip'};
      box(6.45,.06,.05,walnut,-8.3,y+.2,5.06);box(6.42,.035,.06,cove,-8.3,y+2.17,5.1);
      frame(-10.7,y+1.28,5.1,.48,.66,i);vase(-5.55,y+.16,6.9,.3,colors[i]);
      box(1.65,.12,.31,walnut,-10.23,y+.22,6.7);
      for(let j=0;j<4;j++)box(.31,.23,.23,colors[(i+j)%6],-10.8+j*.38,y+.37,6.7);
    }
    // Each program gains its own functional rear millwork, not identical sofas.
    kitchen(-9.55,8.38,6.15,2.15,oak);kitchen(-9.5,15.5,6.1,2.2,k.mat('#b3b9a9','wood'));
    drawers(-6.25,3.62,6.2,1.45,.72,.58,walnut);cup(-6.4,4.4,6.2);vase(-5.9,4.4,6.2,.25);
    drawers(-9.1,6.0,6.2,2.1,.7,.6,steel);for(let i=0;i<6;i++)cyl(.055,.24,colors[i],-9.9+i*.28,6.88,6.23);
    for(let i=0;i<12;i++)box(.075,1.75,.1,walnut,-10.9+i*.22,11.62,5.2);
    sconce(-10.9,11.9,5.14);sconce(-5.7,11.9,5.14);
    drawers(-9.5,13.13,6.1,2.2,.67,.58,oak);for(let i=0;i<5;i++){cyl(.11,.18,'#a8815c',-10.3+i*.38,13.96,6.1);round(.2,.25,.2,'#7b976a',-10.3+i*.38,14.13,6.1);}
    // Woven throws, pillows and bedside books soften the upper suite.
    soft(.72,.035,1.3,cloth('#c6ae87'),-9.58,16.08,14.0,[0,.05,0]);for(let i=0;i<9;i++)box(.018,.012,1.18,cloth('#ece3c9'),-9.9+i*.08,16.107,14.0,[0,.05,0]);
    stack(-8.6,16.09,13.5,3,.24);soft(.32,.25,.12,cloth('#bca16d'),-7.1,4.18,14.05,[.16,0,.1]);
    frame(-7.7,16.51,8.65,.3,.39,0);
    for(const [i,y]of floors.entries()){
      const scene=APARTMENT_LIGHT_SCENES[i];
      const key=light(-9.9+(i%2?.35:0),y+1.25,7.2,scene.power,6.4,scene.key);
      const accent=light(-6.5-(i%2?.25:0),y+.95,13.7,scene.power*.78,5.8,scene.accent);
      key.userData={floor:i,scene:scene.name,role:'practical'};accent.userData={floor:i,scene:scene.name,role:'accent'};
      key.userData.apartmentLight={floor:i,role:'key'};accent.userData.apartmentLight={floor:i,role:'accent'};
      key.diffuserMaterial.userData.apartmentLight={floor:i,role:'key'};accent.diffuserMaterial.userData.apartmentLight={floor:i,role:'accent'};
      // Broad indirect wall bounce, with the furniture still depth-occluding it.
      // Two overlapping falloffs reproduce the reference's violet/amber blend.
      for(const [side,color]of[[-1,scene.key],[1,scene.accent]]){
        const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
          uniforms:{tint:{value:new T.Color(color)},strength:{value:.24}},
          vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
          fragmentShader:'varying vec2 v;uniform vec3 tint;uniform float strength;void main(){vec2 p=(v-.5)*2.;float a=exp(-dot(p,p)*1.8)*(1.-smoothstep(.65,1.,abs(p.x)))*(1.-smoothstep(.7,1.,abs(p.y)));gl_FragColor=vec4(tint,a*strength);}' });
        const wash=new T.Mesh(new T.PlaneGeometry(3.6,2.14),mat);wash.name='Apartment indirect wall wash';
        mat.userData.apartmentLight={floor:i,role:side<0?'key':'accent'};
        wash.position.set(-8.3+side*1.23,y+1.18,5.36);wash.userData.nightWash=true;k.group.add(wash);
      }
    }
  }
  k.finish();let instances=0;k.group.traverse(o=>{if(o.isInstancedMesh)instances+=o.count;});
  k.group.userData={destination:id,features,detailInstances:instances,decorativeObjects:objects,nativeFurniture:true};
  return{group:k.group,features,detailInstances:instances,nativeFurniture:true};
}
