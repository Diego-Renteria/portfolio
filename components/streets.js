import {terrainHeight,insideLand,flatRoadXs,flatRoadZs,hillRoadCenterlines,inStadiumReserve,roadExtent} from './geography.js?v=b477ce33502c';
/** A connected, scaled street grid. Details are batched by material and geometry. */
export function buildStreets(ctx) {
  const {THREE:T,world}=ctx;
  const root=new T.Group(),stadiumRoads=new T.Group();root.name='streets-and-public-realm';stadiumRoads.name='stadium-interior-roads';root.add(stadiumRoads);world.add(root);
  const mats={
    asphalt:ctx.material('#53585a','asphalt'), sidewalk:ctx.material('#c0bdb2','concrete'),
    curb:ctx.material('#dfd9c9','concrete'), joints:ctx.material('#96988e'),
    white:ctx.material('#eae6d7'), yellow:ctx.material('#cfa957'),bike:ctx.material('#5f8c78'),divider:ctx.material('#d8ddce'), iron:ctx.material('#354644'),
    steel:ctx.material('#82918a'), wood:ctx.material('#976f49'), red:ctx.material('#a85036'),
    drain:ctx.material('#414947'), brass:ctx.material('#bca775'),
    lamp:new T.MeshStandardMaterial({color:'#ffedbc',emissive:'#ffcf77',emissiveIntensity:.1,roughness:.4}),
    pool:new T.MeshBasicMaterial({color:'#ffd58b',transparent:true,opacity:0,depthWrite:false})
  };
  ctx.glowMaterials?.push(mats.lamp);
  // Low reflected sky fill between fixtures preserves asphalt aggregate and
  // markings. Shared uniforms survive the rain material clones as well.
  const roadNightFill={value:0};
  for(const material of[mats.asphalt,mats.sidewalk,mats.curb]){
    const before=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
    material.onBeforeCompile=shader=>{before.call(material,shader);shader.uniforms.roadNightFill=roadNightFill;shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float roadNightFill;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * roadNightFill;');};
    material.customProgramCacheKey=()=>key()+'-night-pavement-fill-v1';
  }
  const batches=new Map();
  function put(kind,key,x,y,z,w,h,d,ry=0){const zone=inStadiumReserve(x,z)?'stadium':'permanent',id=zone+':'+kind+':'+key;if(!batches.has(id))batches.set(id,[]);batches.get(id).push({x,y,z,w,h,d,ry});}
  function flat(x,z){return insideLand(x,z,7)&&terrainHeight(x,z)<.3;}
  const b=(key,w,h,d,x,y,z,ry=0)=>{for(const sx of [-.5,0,.5])for(const sz of [-.5,0,.5])if(!flat(x+w*sx,z+d*sz))return;put('box',key,x,y,z,w,h,d,ry);};
  const c=(key,r,h,x,y,z)=>{if(flat(x,z))put('cyl',key,x,y,z,r,h,r);};
  const xs=flatRoadXs,zs=flatRoadZs,half=3.3,crossHalf=2.8;
  const gaps=(centers,lo,hi,edge=half)=>centers.map((p,i)=>[i?centers[i-1]+edge:lo,p-edge]).concat([[centers[centers.length-1]+edge,hi]]);
  const blockCenters=[(-153+xs[0])/2,...xs.slice(0,-1).map((x,i)=>(x+xs[i+1])/2),(xs.at(-1)+153)/2];
  // Build a union of road rectangles, so crossing surfaces never flicker.
  for(const z of zs){const range=roadExtent('x',z);if(!range)continue;for(let x=range[0];x<range[1];x+=2){const w=Math.min(2,range[1]-x);b('asphalt',w,.07,5.6,x+w/2,.0,z);}}
  const verticalGaps=gaps(zs,-104,126,crossHalf);
  for(const x of xs){const range=roadExtent('z',x);if(!range)continue;for(const [lo,hi]of verticalGaps)for(let z=Math.max(lo,range[0]);z<Math.min(hi,range[1]);z+=2){const d=Math.min(2,hi-z,range[1]-z);b('asphalt',6.6,.07,d,x,0,z+d/2);}}
  // Deliberate end curbs and green terminal islands, clear of every drivable junction.
  for(const x of xs){const range=roadExtent('z',x);if(!range)continue;for(const z of range){b('curb',6.6,.23,.28,x,.13,z);b('sidewalk',7.2,.15,.75,x,.075,z+Math.sign(z-11)*.55);}}
  for(const z of zs){const range=roadExtent('x',z);if(!range)continue;for(const x of range){b('curb',.28,.23,5.6,x,.13,z);b('sidewalk',.75,.15,6.2,x+Math.sign(x)*.55,.075,z);}}
  const xBlocks=gaps(xs,-153,153),zBlocks=verticalGaps;
  // Pavement surrounds each parcel; the open center remains available to buildings.
  for(const [xl,xr]of xBlocks)for(const [za,zb]of zBlocks){
    const w=xr-xl,d=zb-za,sw=1.1;
    for(const x of [xl+sw/2,xr-sw/2])b('sidewalk',sw,.15,d,x,.075,(za+zb)/2);
    for(const z of [za+sw/2,zb-sw/2])b('sidewalk',w-sw*2,.15,sw,(xl+xr)/2,.075,z);
    for(const x of [xl+.06,xr-.06])b('curb',.12,.19,d,x,.075,(za+zb)/2);
    for(const z of [za+.06,zb-.06])b('curb',w-.24,.19,.12,(xl+xr)/2,.075,z);
    // Expansion joints, kept out of building lots.
    for(let x=xl+1.3;x<xr-.8;x+=1.3)for(const z of [za+.44,zb-.44])b('joints',.016,.006,.65,x,.154,z);
    for(let z=za+1.3;z<zb-.8;z+=1.3)for(const x of [xl+.44,xr-.44])b('joints',.65,.006,.016,x,.154,z);
  }
  // Double yellow centerlines stop well before each junction.
  for(const x of xs)for(const [lo,hi]of verticalGaps){
    const range=roadExtent('z',x),a=Math.max(lo+(lo===-104?0:3.15),range?.[0]??Infinity),end=Math.min(hi-(hi===126?0:2.15),range?.[1]??-Infinity);
    if(end>a)for(const side of [-1,1])b('yellow',.055,.008,end-a,x+side*.09,.041,(a+end)/2);
  }
  const horizontalGaps=xBlocks;
  for(const z of zs)for(const [lo,hi]of horizontalGaps){
    const range=roadExtent('x',z),a=Math.max(lo+(lo===-153?0:2.15),range?.[0]??Infinity),end=Math.min(hi-(hi===153?0:2.15),range?.[1]??-Infinity);
    if(end>a)for(const side of [-1,1])b('yellow',end-a,.008,.055,(a+end)/2,.041,z+side*.09);
  }
  for(const x of xs)for(const z of zs){
    for(const side of [-1,1]){
      // White bands run across both lanes, parallel with pedestrian travel.
      for(let lane=-2.82;lane<=2.85;lane+=.49){
        b('white',.26,.009,.88,x+lane,.044,z+side*4.2);
        b('white',.88,.009,.26,x+side*4.2,.044,z+lane);
      }
    }
    // Contrasting tactile paving at all four pedestrian corners.
    for(const sx of [-1,1])for(const sz of [-1,1]){
      b('brass',.57,.012,.57,x+sx*3.84,.163,z+sz*3.84);
      for(let q=-1;q<=1;q++)for(let r=-1;r<=1;r++)c('curb',.025,.015,x+sx*3.84+q*.15,.178,z+sz*3.84+r*.15);
    }
  }
  // Storm drains and utility covers add useful city-scale cues.
  for(const z of zs)for(const x of blockCenters){
    b('drain',.68,.012,.26,x,.045,z+3.13);
    for(let j=-2;j<=2;j++)b('steel',.035,.016,.22,x+j*.11,.054,z+3.13);
    c('drain',.29,.012,x+2,.045,z-1.15);
    c('steel',.23,.014,x+2,.052,z-1.15);
    for(let k=-1;k<=1;k++)b('drain',.31,.016,.025,x+2,.061,z-1.15+k*.10);
  }
  const lampSites=[];
  for(const z of zs)for(const x of blockCenters)lampSites.push({x,z:z+3.35,ry:0});
  for(const x of xs)for(let i=0;i<zs.length-1;i++)lampSites.push({x:x-3.95,z:(zs[i]+zs[i+1])/2,ry:Math.PI/2});
  // One foreground fixture is offset along its curb, rather than mirroring
  // the lamp on the opposite park. Lighting uses these same final positions.
  const makerLamp=lampSites.find(p=>p.x===-13&&Math.abs(p.z-25.35)<.01);
  if(makerLamp)makerLamp.x=-11.4;
  for(const p of lampSites){
    c('iron',.15,.14,p.x,.22,p.z);c('iron',.065,3.65,p.x,2.04,p.z);
    c('brass',.09,.12,p.x,1.04,p.z);c('iron',.12,.12,p.x,3.88,p.z);
    const dx=Math.sin(p.ry)*.35,dz=-Math.cos(p.ry)*.35;
    b('iron',.08,.08,.8,p.x+dx,3.83,p.z+dz,p.ry);
    b('iron',.32,.13,.55,p.x+dx*2,3.76,p.z+dz*2,p.ry);
    b('lamp',.25,.035,.45,p.x+dx*2,3.68,p.z+dz*2,p.ry);
  }
  const benchSites=[];
  function bench(x,z,ry=0){
    if(!flat(x,z))return;benchSites.push({x,z,ry,width:1.6,depth:.6});
    for(let i=0;i<4;i++)b('wood',1.45,.065,.075,x,.57,z-.14+i*.095,ry);
    for(let i=0;i<3;i++)b('wood',1.45,.075,.065,x,.77+i*.11,z+.18,ry);
    for(const s of [-1,1]){
      b('iron',.065,.5,.42,x+s*.56,.35,z,ry);
      b('iron',.065,.63,.065,x+s*.56,.75,z+.2,ry);
      b('iron',.065,.055,.36,x+s*.68,.76,z,ry);
    }
  }
  for(const [row,z]of zs.map(v=>v+3.35).entries())for(const [column,x]of blockCenters.entries()){
    // Separate seats from fixture bases everywhere, with a restrained rhythm
    // rather than identical centered lamp-and-bench pairs.
    let seatX=x+((row+column)%3===0?-2.6:2.0);
    if(Math.abs(z-25.35)<.01){if(x===-13)seatX=-18.1;if(x===13)seatX=9.5;}
    bench(seatX,z);
  }
  for(const z of zs.map(v=>v+3.35))for(const x of [-91,-39,13,65]){
    const binX=[0,1.5,-1.5,3.8,-3.8].map(dx=>x+dx).find(px=>flat(px,z)&&lampSites.every(p=>Math.hypot(px-p.x,z-p.z)>.6)&&benchSites.every(p=>Math.hypot(Math.max(0,Math.abs(px-p.x)-p.width/2),Math.max(0,Math.abs(z-p.z)-p.depth/2))>.4));
    if(binX===undefined)continue;
    c('iron',.21,.62,binX,.47,z);c('steel',.23,.08,binX,.81,z);
    b('drain',.2,.01,.12,binX,.855,z);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;b('steel',.025,.44,.025,binX+Math.cos(a)*.216,.46,z+Math.sin(a)*.216);}
  }
  for(const x of xs.map(v=>v-3.95))for(const z of [-31.5,-13.5,13.5,31.5]){
    c('red',.11,.5,x,.42,z);c('red',.15,.11,x,.7,z);c('brass',.055,.045,x,.78,z);
    b('red',.38,.13,.14,x,.48,z);b('brass',.055,.105,.16,x-.21,.48,z);
  }
  // Editable municipal placeholder names until Diego names his city.
  const signs=[];
  const defaults=xs.map((_,i)=>['Cedar','Maple','Pine','Alder','Union','Mercer','Westlake','Birch','Oak','Willow','Ash','Spruce','Elm','Grove','Cascade'][i]+' Avenue').concat(zs.map((_,i)=>(i+1)+' Street'));
  const signPositions=xs.map((x,i)=>[x-3.95,zs[i%zs.length]+3.15]).concat(zs.map((z,i)=>[xs[(i+2)%xs.length]+3.15,z+3.95]));
  for(let i=0;i<signPositions.length;i++){
    const [x,z]=signPositions[i];if(!flat(x,z)){signs.push(null);continue;}c('iron',.04,2.65,x,1.49,z);
    const sign=ctx.label(defaults[i],2,.38,x,2.7,z,'#315b4e','#f2ead7',inStadiumReserve(x,z)?stadiumRoads:root);
    if(i<xs.length)sign.rotation.y=Math.PI/2;
    signs.push(sign);
  }
  const curveable=[],unitBox=new T.BoxGeometry(1,1,1),curvedBox=new T.BoxGeometry(1,1,1,8,1,8),unitCylinder=new T.CylinderGeometry(1,1,1,12);
  const dummy=new T.Object3D();
  for(const [id,items]of batches){
    const [zone,kind,key]=id.split(':');const mesh=new T.InstancedMesh(kind==='box'?unitBox:unitCylinder,mats[key],items.length);
    if(kind==='box'&&['sidewalk','curb','yellow'].includes(key)&&items.some(p=>Math.max(p.w,p.d)>10))curveable.push(mesh);
    mesh.name=`streets-${id}`;mesh.receiveShadow=key!=='pool';mesh.castShadow=['iron','wood','red','steel'].includes(key);
    items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.ry,0);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.instanceMatrix.needsUpdate=true;(zone==='stadium'?stadiumRoads:root).add(mesh);
  }
  // Scenic hillside ribbons conform to the shared surface at both road edges.
  const roadPos=[],roadIndices=[],stripePos=[],stripeIndices=[];
  for(const points of hillRoadCenterlines){
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p.x,0,p.z))),steps=Math.ceil(curve.getLength()*1.4);
    const roadStart=roadPos.length/3,stripeStart=stripePos.length/3;
    for(let i=0;i<=steps;i++){
      const t=i/steps,p=curve.getPoint(t),dir=curve.getTangent(t),nx=-dir.z,nz=dir.x;
      for(const side of [-1,1]){const x=p.x+nx*1.65*side,z=p.z+nz*1.65*side;roadPos.push(x,terrainHeight(x,z)+.07,z);const sx=p.x+nx*.035*side,sz=p.z+nz*.035*side;stripePos.push(sx,terrainHeight(sx,sz)+.085,sz);}
      if(i<steps){const a=roadStart+i*2,b=stripeStart+i*2;roadIndices.push(a,a+1,a+2,a+1,a+3,a+2);stripeIndices.push(b,b+1,b+2,b+1,b+3,b+2);}
    }
  }
  for(const [positions,indices,mat,name]of [[roadPos,roadIndices,mats.asphalt,'Winding hillside roads'],[stripePos,stripeIndices,mats.yellow,'Hillside road centerline']]){
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new T.Mesh(geo,mat);mesh.name=name;mesh.receiveShadow=true;mesh.material.side=T.DoubleSide;root.add(mesh);
  }
  function setStreetNames(names){
    signs.forEach((sign,i)=>{
      if(!sign)return;
      const canvas=sign.material.map.image,cx=canvas.getContext('2d');
      cx.fillStyle='#315b4e';cx.fillRect(0,0,1024,256);cx.strokeStyle='#e8dfc8';cx.lineWidth=4;cx.strokeRect(16,16,992,224);
      cx.fillStyle='#f2ead7';cx.font='600 68px Georgia';cx.textAlign='center';cx.textBaseline='middle';
      cx.fillText(String(names?.[i]||defaults[i]),512,132,940);sign.material.map.needsUpdate=true;
    });
  }
  root.userData.benchSites=benchSites;
  return {group:root,setGlobe(active){for(const mesh of curveable)mesh.geometry=active?curvedBox:unitBox;},benchSites,roadNightFill,lampSites:lampSites.filter(p=>flat(p.x,p.z)),setStadium(enabled){stadiumRoads.visible=!enabled;},setNight(night){roadNightFill.value=night?.14:0;mats.lamp.emissiveIntensity=night?4.8:.015;mats.pool.opacity=0;},setStreetNames};
}
