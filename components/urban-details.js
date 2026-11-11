import {LAND,insideLand,flatRoadXs,flatRoadZs,inStadiumReserve} from './geography.js?v=b477ce33502c';
import {buildPerimeterPlanting} from './perimeter-planting.js?v=b477ce33502c';

/** Small planted margins and inhabited street details; destination forecourts stay open. */
export function buildUrbanDetails(ctx){
  const {THREE:T,world,glowMaterials=[],material}=ctx;
  const group=new T.Group();group.name='planted-margins-and-neighborhood-details';world.add(group);
  const mats={},colors={green:'#728b61',fern:'#5f795b',lime:'#8b9d71',dry:'#a89967',soil:'#706c53',metal:'#9ca6a0',iron:'#354d47',wood:'#a17f57',cream:'#e3d5b6',orange:'#ba7951',black:'#263c3b',glass:'#708c8a',paper:'#d9d3bd',berry:'#ae695c',gold:'#d2ab54',flower:'#cdbb9a'};
  for(const[k,color]of Object.entries(colors))mats[k]=new T.MeshStandardMaterial({color,roughness:k==='metal'?.38:.9,metalness:k==='metal'?.65:0,side:['green','fern','lime','dry','berry','gold','flower'].includes(k)?T.DoubleSide:T.FrontSide});
  mats.stone=material?material('#9da58e','stone'):new T.MeshStandardMaterial({color:'#9da58e',roughness:1});
  mats.path=material?material('#c1bba6','stone'):new T.MeshStandardMaterial({color:'#c1bba6',roughness:1});
  mats.lamp=new T.MeshStandardMaterial({color:'#f0c995',emissive:'#ffbb70',emissiveIntensity:.35});glowMaterials.push(mats.lamp);
  const batches={};function part(kind,key,w,h,d,x,y,z,rx=0,ry=0,rz=0){(batches[kind+':'+key]??=[]).push({w,h,d,x,y,z,rx,ry,rz});}
  const b=(key,w,h,d,x,y,z,rx=0,ry=0,rz=0)=>part('box',key,w,h,d,x,y,z,rx,ry,rz);
  const ball=(key,w,h,d,x,y,z)=>part('shrub',key,w,h,d,x,y,z);
  let seed=913491;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  const footprints=[];world.traverse(o=>{if(o.userData.designMetadata)footprints.push(...o.userData.designMetadata);});
  const plantingSites=[];
  function vacant(x,z,r=.7){
    if(!insideLand(x,z,2.8)||inStadiumReserve(x,z,1))return false;
    if(flatRoadXs.some(v=>Math.abs(v-x)<4.65+r)||flatRoadZs.some(v=>Math.abs(v-z)<4.65+r))return false;
    if(Math.abs(x)<23&&z>2.5&&z<40)return false;
    if(footprints.some(a=>Math.abs(x-a.x)<a.width/2+1.2+r&&Math.abs(z-a.z)<a.depth/2+1.25+r))return false;
    return true;
  }
  function tuft(x,z,y,s,material='green'){
    part('tuft',material,s,s*(.75+random()*.5),s,x,y,z,0,random()*Math.PI*2);
  }
  // The outer green band is interrupted at avenue and street ends.
  for(let attempt=0;attempt<9000&&plantingSites.length<470;attempt++){
    const x=LAND.cx+(random()-.5)*LAND.rx*2,z=LAND.cz+(random()-.5)*LAND.rz*2;
    const margin=!insideLand(x,z,13),s=.28+random()*.48;
    if(!margin&&random()>.11)continue;if(!vacant(x,z,s*.5))continue;
    plantingSites.push({x,z,size:s});
    for(let n=0;n<4;n++)tuft(x+(random()-.5)*s*1.8,z+(random()-.5)*s*1.8,.05,s*(.55+random()*.5),n===3?'dry':n%2?'fern':'green');
    if(random()<.45)ball(random()<.5?'fern':'lime',s*.9,s*.43,s*.7,x,.08+s*.15,z);
    if(random()<.28)for(let n=0;n<3;n++){
      const xx=x+(random()-.5)*s,zz=z+(random()-.5)*s,yy=.22+s*.33;
      part('flower',n%2?'gold':'flower',.12,.12,.12,xx,yy,zz,Math.PI/2+(random()-.5)*.6,random()*6.28);
    }
  }
  // Plant within the existing beds, rather than introducing obstacles to the plaza.
  for(const x of[-20,-6,6,20])for(let j=0;j<11;j++){
    const z=30.9+j*.42;
    tuft(x-.18,z,.58,.31,j%3===0?'dry':'green');tuft(x+.15,z+.12,.58,.37,'fern');
    if(j%2===0){
      b('green',.025,.35,.025,x,.77,z);
      for(let f=0;f<3;f++)part('flower',f===0?'berry':f===1?'gold':'flower',.13,.13,.13,x+(f-1)*.11,.94+f*.03,z+.05*f,Math.PI/2,.3*f);
    }
  }
  // A low planted promenade resolves the city edge into an intentional boundary.
  // It tracks the actual organic island silhouette, rather than a rectangular fence.
  const boundary=[];
  for(let i=0;i<420;i++){
    const a=i/420*Math.PI*2,c=Math.cos(a),s=Math.sin(a),edge=1+Math.sin(a*3+.8)*.042+Math.sin(a*7+.3)*.026+Math.sin(a*17)*.009;
    boundary.push({x:LAND.cx+Math.sign(c)*Math.pow(Math.abs(c),.28)*LAND.rx*edge*.94,z:LAND.cz+Math.sign(s)*Math.pow(Math.abs(s),.28)*LAND.rz*edge*.94});
  }
  const endCaps=[];
  function roadEnd(x,z,axis,sign){
    const half=axis==='x'?3.3:2.8,xx=x+(axis==='x'?sign*.6:0),zz=z+(axis==='z'?sign*.6:0);
    // The planters close unused road stubs beyond the outermost traffic circuits.
    b('path',axis==='x'?2.1:half*2,.09,axis==='z'?2.1:half*2,x,.09,z);
    for(const q of[-1.65,0,1.65]){
      const px=xx+(axis==='z'?q:0),pz=zz+(axis==='x'?q:0);
      b('stone',axis==='x'?.75:1.32,.57,axis==='z'?.75:1.32,px,.35,pz);
      ball('fern',.64,.3,.64,px,.75,pz);
      for(let j=0;j<3;j++)tuft(px+(random()-.5)*.4,pz+(random()-.5)*.4,.67,.37,'green');
    }
    endCaps.push({x:xx,z:zz,axis});
  }
  for(const x of flatRoadXs)for(const sign of[-1,1]){
    let last=null;for(let z=11;Math.abs(z-11)<122;z+=sign*.5)if(insideLand(x,z,8))last=z;else break;
    if(last!==null)roadEnd(x,last-1.5*sign,'z',sign);
  }
  for(const z of flatRoadZs)for(const sign of[-1,1]){
    let last=null;for(let x=0;Math.abs(x)<160;x+=sign*.5)if(insideLand(x,z,8))last=x;else break;
    if(last!==null)roadEnd(last-1.5*sign,z,'x',sign);
  }
  for(let i=0;i<boundary.length;i++){
    const p=boundary[i],next=boundary[(i+1)%boundary.length],dx=next.x-p.x,dz=next.z-p.z,len=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx);
    const nearRoad=flatRoadXs.some(x=>Math.abs(x-p.x)<4.3)||flatRoadZs.some(z=>Math.abs(z-p.z)<3.8);
    if(!nearRoad){
      b('path',len+ .06,.075,1.45,(p.x+next.x)*.5,.065,(p.z+next.z)*.5,0,angle);
      const nx=(p.x-LAND.cx)/LAND.rx,nz=(p.z-LAND.cz)/LAND.rz;
      if(i%3!==0)b('stone',len+.04,.41,.38,p.x+nx*.85,.25,p.z+nz*.85,0,angle);
      if(i%2===0){ball(i%4?'fern':'lime',.42+random()*.36,.3+random()*.22,.42+random()*.3,p.x+nx*1.6,.28,p.z+nz*1.6);for(let n=0;n<4;n++)tuft(p.x+nx*2.2+(random()-.5),p.z+nz*2.2+(random()-.5),.06,.4+random()*.28,n%2?'fern':'dry');}
      if(i%19===0){b('wood',1.5,.11,.5,p.x-nx*.2,.53,p.z-nz*.2,0,angle);for(const side of[-.5,.5])b('iron',.1,.4,.45,p.x+Math.cos(angle)*side,.29,p.z-Math.sin(angle)*side,0,angle);}
    }
  }
  group.userData.roadEndCaps=endCaps;
  // Subway stairs fit in the western sidewalk, outside the destination footprints.
  const sx=-22.06,sz=14.1;
  b('iron',.98,.055,3.5,sx,.18,sz);b('black',.8,.06,3.25,sx,.21,sz);
  for(let i=0;i<8;i++)b('metal',.78,.055,.12,sx,.25,sz-1.45+i*.38);
  for(const side of[-1,1]){
    b('iron',.07,.07,3.5,sx+side*.49,1.09,sz);
    for(let i=0;i<5;i++)b('iron',.055,.9,.055,sx+side*.49,.64,sz-1.65+i*.825);
    b('iron',.08,1.55,.08,sx+side*.49,.95,sz-1.55);
    ball('cream',.18,.18,.18,sx+side*.49,1.81,sz-1.55);
  }
  b('iron',1.04,.29,.1,sx,1.44,sz-1.64);b('cream',.79,.07,.015,sx,1.44,sz-1.701);
  const verts=[];
  for(let k=0;k<5;k++){
    const a=k*Math.PI*.4,dx=Math.cos(a),dz=Math.sin(a),bend=.1+(k%3)*.05;
    verts.push(-dz*.055,0,dx*.055,dz*.055,0,-dx*.055,dx*bend,.55+(k%3)*.13,dz*bend);
  }
  const tuftGeometry=new T.BufferGeometry();tuftGeometry.setAttribute('position',new T.Float32BufferAttribute(verts,3));tuftGeometry.computeVertexNormals();
  const flowerShape=new T.Shape();for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,r=.65+.35*Math.cos(a*5),x=Math.cos(a)*r,y=Math.sin(a)*r;i?flowerShape.lineTo(x,y):flowerShape.moveTo(x,y);}flowerShape.closePath();
  const geos={box:new T.BoxGeometry(1,1,1),shrub:new T.IcosahedronGeometry(1,1),wheel:new T.CylinderGeometry(1,1,1,12),tuft:tuftGeometry,flower:new T.ShapeGeometry(flowerShape,4)},dummy=new T.Object3D();
  for(const[key,parts]of Object.entries(batches)){
    const[kind,material]=key.split(':'),mesh=new T.InstancedMesh(geos[kind],mats[material],parts.length);mesh.name='urban-'+key;
    parts.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=!['tuft','flower'].includes(kind);mesh.receiveShadow=true;group.add(mesh);
  }
  group.userData.plantingSites=plantingSites;
  const benches=[];world.traverse(o=>{if(o.userData.benchSites)benches.push(...o.userData.benchSites);});
  const edgePlanting=buildPerimeterPlanting({...ctx,world:group},{buildings:footprints,benches});
  return{group,edgePlanting,plantingCount:plantingSites.length,setQuality:edgePlanting.setQuality,setRain:edgePlanting.setRain,update:edgePlanting.update,setNight(night){mats.lamp.emissiveIntensity=night?1.1:.35;}};
}
