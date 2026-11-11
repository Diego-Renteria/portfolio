import {LAND,flatRoadXs,flatRoadZs,roadExtent,inStadiumReserve,curvedRoadSegments} from './geography.js?v=b477ce33502c';

/** Mixed edge groves follow the actual torn-earth contour and leave circulation clear. */
export function buildPerimeterPlanting(ctx,{layout=null,buildings=[],benches=[]}={}){
 const {THREE:T,world}=ctx,group=new T.Group();group.name='Mixed autumn groves and layered island-edge planting';world.add(group);
 let seed=930217,time=0;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const contour=[];
 for(let i=0;i<256;i++){const a=i/256*Math.PI*2,c=Math.cos(a),s=Math.sin(a),edge=1+Math.sin(a*3+.8)*.042+Math.sin(a*7+.3)*.026+Math.sin(a*17)*.009;contour.push({x:LAND.cx+Math.sign(c)*Math.pow(Math.abs(c),.28)*LAND.rx*edge,z:LAND.cz+Math.sign(s)*Math.pow(Math.abs(s),.28)*LAND.rz*edge});}
 const distance=(x,z,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,u=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a.x-u*dx,z-a.z-u*dz);};
 const segments=points=>points.map((p,i)=>({a:p,b:points[(i+1)%points.length]}));
 const edgeSegments=segments(contour),pathSegments=layout?[]:segments(contour.map(p=>({x:LAND.cx+(p.x-LAND.cx)*.94,z:LAND.cz+(p.z-LAND.cz)*.94})));
 const roadSegments=[];
 if(layout){for(const r of layout.roads){
  const v=r.points.map(p=>new T.Vector3(p[0],0,p[1]));
  const points=r.curved?new T.CatmullRomCurve3(v,!!r.closed,'centripetal').getPoints(600):v;
  for(let i=1;i<points.length;i++)roadSegments.push({a:points[i-1],b:points[i],half:r.width/2+1.25});
 }}else{
  for(const x of flatRoadXs){const r=roadExtent('z',x);if(r)roadSegments.push({a:{x,z:r[0]},b:{x,z:r[1]},half:4.5});}
  for(const z of flatRoadZs){const r=roadExtent('x',z);if(r)roadSegments.push({a:{x:r[0],z},b:{x:r[1],z},half:4.0});}
  for(const r of curvedRoadSegments)roadSegments.push({...r,half:r.halfWidth+1.3});
 }
 function inside(x,z){let yes=false;for(let i=0,j=contour.length-1;i<contour.length;j=i++){const a=contour[i],b=contour[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)yes=!yes;}return yes;}
 function vacant(x,z,r=.65){
  if(!inside(x,z)||(!layout&&inStadiumReserve(x,z,r)))return false;
  if(edgeSegments.some(s=>distance(x,z,s.a,s.b)<r+1))return false;
  if(roadSegments.some(s=>distance(x,z,s.a,s.b)<s.half+r))return false;
  if(pathSegments.some(s=>distance(x,z,s.a,s.b)<.9+r))return false;
  if(buildings.some(b=>Math.abs(x-b.x)<(b.width??b.w)/2+r+1&&Math.abs(z-b.z)<(b.depth??b.d)/2+r+1))return false;
  if(benches.some(b=>Math.hypot(x-b.x,z-b.z)<2+r))return false;
  // Keep the harbor's quay, basin and overlook paths untouched.
  if(layout?.id==='harbor'&&z>89&&Math.abs(x)<132)return false;
  return true;
 }
 const treeSites=[],plantingSites=[],batches=new Map(),materials=[];
 const wind={value:0};
 function material(color,type='leaf'){
  const m=ctx.material(color,type==='bark'?'bark':'plain').clone();m.side=type==='leaf'?T.DoubleSide:T.FrontSide;m.roughness=type==='leaf'?.9:1;
  if(type==='leaf'){
   m.onBeforeCompile=s=>{s.uniforms.edgeWind=wind;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float edgeWind;').replace('#include <begin_vertex>',`#include <begin_vertex>
    #ifdef USE_INSTANCING
    transformed.z+=sin(edgeWind*1.25+instanceMatrix[3].x*.39+instanceMatrix[3].z*.21)*.045*max(0.,position.y);
    #endif`);};m.customProgramCacheKey=()=> 'mixed-edge-leaf-sway-v1';
  }
  materials.push({m,roughness:m.roughness,color:m.color.clone()});return m;
 }
 const bark=material('#665346','bark'),birch=material('#c7c4ad','bark');
 const leafMaterial=material('#ffffff'),greenMaterial=material('#ffffff');
 const geos={wood:new T.CylinderGeometry(.55,1,1,9),soil:new T.CylinderGeometry(1,1,.025,18),shrub:new T.SphereGeometry(1,8,6)};
 function folded(edge){const ps=[0,.12,.04],ix=[];for(const[x,y]of edge)ps.push(x,y,Math.abs(x)*-.035);for(let i=0;i<edge.length;i++)ix.push(0,i+1,(i+1)%edge.length+1);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.setIndex(ix);g.computeVertexNormals();return g;}
 geos.maple=folded([[0,.85],[-.2,.5],[-.43,.59],[-.35,.2],[-.6,.1],[-.25,-.16],[0,-.55],[.25,-.16],[.6,.1],[.35,.2],[.43,.59],[.2,.5]]);
 geos.birch=folded(Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,r=i%2?.92:1;return[Math.sin(a)*.37*r,Math.cos(a)*.63*r];}));
 geos.ginkgo=folded([[0,-.55],[-.12,-.13],[-.58,.28],[-.57,.53],[-.38,.72],[-.12,.83],[0,.65],[.12,.83],[.38,.72],[.57,.53],[.58,.28],[.12,-.13]]);
 function fronds(fern){const ps=[];const tri=(a,b,c)=>ps.push(...a,...b,...c);
  for(let arm=0;arm<(fern?7:5);arm++){const angle=arm*2.399,dx=Math.cos(angle),dz=Math.sin(angle);
   for(let j=1;j<=(fern?8:5);j++){const u=j/(fern?9:6),r=u*(fern?.85:.52),y=fern?Math.sin(u*Math.PI*.8)*.55:u*.65,reach=(1-u)*(fern?.25:.18);
    for(const side of[-1,1]){const x=dx*r,z=dz*r;tri([x,y,z],[x-dz*side*reach,y+.04,z+dx*side*reach],[dx*(r+.14),y+.035,dz*(r+.14)]);}
   }
  }const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.computeVertexNormals();return g;
 }
 geos.fern=fronds(true);geos.cedar=fronds(false);
 geos.grass=folded([[-.035,0],[-.025,.42],[.10,.9],[.035,.42],[.035,0]]);
 geos.seed=new T.SphereGeometry(1,8,4).scale(.035,.11,.035);
 const soil=material('#655f46','bark');
 function part(kind,mat,x,y,z,sx,sy=sx,sz=sx,color=null,rotation=null){const key=kind+':'+mat.uuid;if(!batches.has(key))batches.set(key,{kind,mat,parts:[]});batches.get(key).parts.push({x,y,z,sx,sy,sz,color,rotation});}
 function limb(a,b,r,mat){const d=b.clone().sub(a),mid=a.clone().add(b).multiplyScalar(.5),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());part('wood',mat,mid.x,mid.y,mid.z,r,d.length(),r,null,q);}
 const species=['maple','cedar','birch','serviceberry','ginkgo','cedar'];
 const palettes={maple:['#b34428','#db8038','#d8a74b','#8f3d2b'],birch:['#c5a545','#e2bd61','#9caa57'],ginkgo:['#d5b13c','#ebcb5e','#b6ae4d'],serviceberry:['#8c3844','#ae6150','#bc803f'],cedar:['#315d47','#42735a','#547c56']};
 for(let i=0;i<440&&treeSites.length<76;i++){
  const p=contour[(i*83)%256],ring=i%3===0?.904:.973+(random()-.5)*.007;
  const x=LAND.cx+(p.x-LAND.cx)*ring+(random()-.5)*1.2,z=LAND.cz+(p.z-LAND.cz)*ring+(random()-.5)*1.2;
  const kind=species[treeSites.length%species.length],scale=.65+random()*.8,radius=kind==='cedar'?1.15:kind==='birch'?1.1:1.5;
  if(!vacant(x,z,.8)||treeSites.some(t=>Math.hypot(x-t.x,z-t.z)<3.6+(t.scale+scale)*.35))continue;
  const h=(kind==='cedar'?6.8:kind==='birch'?6.2:kind==='serviceberry'?3.3:4.7)*scale,spread=radius*scale,tones=palettes[kind];
  treeSites.push({x,z,species:kind,height:h,spread,scale});
  const trunk=kind==='birch'?birch:bark,base=new T.Vector3(x,.03,z),fork=new T.Vector3(x+.08*scale,h*.50,z-.08*scale);
  limb(base,new T.Vector3(x+.1*scale,h*.90,z),.10*scale,trunk);
  part('soil',soil,x,.018,z,spread*.67,1,spread*.51);
  const clusters=[];
  for(let arm=0;arm<(kind==='cedar'?30:8);arm++){
   const a=arm*2.399+random()*.3,u=kind==='cedar'?arm/30:random(),yy=kind==='cedar'?h*(.25+.68*u):h*(.64+u*.23),reach=spread*(kind==='cedar'?(1-u)*1.1:.55+random()*.30);
   const tip=new T.Vector3(x+Math.cos(a)*reach,yy,z+Math.sin(a)*reach);
   limb(kind==='cedar'?new T.Vector3(x,yy+.09,z):fork,tip,.027*scale,bark);clusters.push(tip);
   if(kind==='cedar')for(let n=0;n<3;n++){const v=.35+n*.25;part('cedar',leafMaterial,x+(tip.x-x)*v,yy+(random()-.5)*.2,z+(tip.z-z)*v,.72*scale,.55*scale,.72*scale,tones[(arm+n)%3],[.15,a+n*.4,0]);}
  }
  if(kind!=='cedar')for(let j=0;j<160;j++){
   const c=clusters[j%clusters.length],a=random()*Math.PI*2,v=random()*2-1,r=Math.cbrt(random()),rr=spread*(kind==='birch'?.55:.68),xz=Math.sqrt(1-v*v)*r*rr;
   part(kind==='serviceberry'?'birch':kind,leafMaterial,c.x+Math.cos(a)*xz,c.y+v*r*rr*(kind==='birch'?1.55:.85),c.z+Math.sin(a)*xz,(.30+random()*.14)*Math.sqrt(scale),undefined,undefined,tones[j%tones.length],[random()*Math.PI,random()*6.28,random()*6.28]);
  }
  // Layer a handful of irregular low plants around each grove, never on a path.
  for(let j=0;j<7;j++){
   const a=random()*Math.PI*2,r=.9+random()*1.5,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
   if(!vacant(px,pz,.4))continue;
   const size=.35+random()*.55,form=j%3===0?'fern':j%3===1?'shrub':'grass';plantingSites.push({x:px,z:pz,form,size});
   if(form==='fern')part('fern',greenMaterial,px,.05,pz,size,size,size,j%2?'#4e7758':'#668852',[0,a,0]);
   else if(form==='shrub')for(let q=0;q<5;q++)part('shrub',greenMaterial,px+Math.cos(q*2.4)*size*.3,.12+size*.20,pz+Math.sin(q*2.4)*size*.3,size*.55,size*(.26+random()*.19),size*.47,j%2?'#647e50':'#864c43',[0,a,0]);
   else for(let q=0;q<10;q++){const angle=q*2.399,h=.35+random()*.6;part('grass',greenMaterial,px+Math.cos(angle)*.16,.05,pz+Math.sin(angle)*.16,.7,h,.7,q%3?'#7c8b51':'#b39a60',[0,angle,0]);if(q%4===0)part('seed',greenMaterial,px+Math.cos(angle)*.16,.05+h*.88,pz+Math.sin(angle)*.16,1,1,1,'#b9a577');}
  }
 }
 const dummy=new T.Object3D(),color=new T.Color(),fine=[];
 for(const batch of batches.values()){
  const mesh=new T.InstancedMesh(geos[batch.kind],batch.mat,batch.parts.length);mesh.name='Perimeter / '+batch.kind;
  batch.parts.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx,p.sy??p.sx,p.sz??p.sx);if(p.rotation?.isQuaternion)dummy.quaternion.copy(p.rotation);else dummy.rotation.set(...(p.rotation||[0,0,0]));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(p.color)mesh.setColorAt(i,color.set(p.color).multiplyScalar(.92+random()*.14));});mesh.castShadow=batch.kind==='wood';mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);if(['grass','seed'].includes(batch.kind))fine.push(mesh);
 }
 group.userData={treeSites,plantingSites,treeCount:treeSites.length};
 return{group,treeSites,plantingSites,inside,vacant,setQuality(mode){for(const mesh of fine)mesh.visible=mode!=='low';},setRain(wet){for(const{m,roughness,color}of materials){m.color.copy(color).multiplyScalar(wet?.82:1);m.roughness=wet?roughness*.73:roughness;}},update(dt){if(dt>0){time+=Math.min(dt,.1);wind.value=time;}}};
}
