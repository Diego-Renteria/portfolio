import {detailKit} from './detail-kit.js?v=b477ce33502c';
import {buildCityLighting} from './city-lighting.js?v=b477ce33502c';
import {buildDistrictFoliage} from './district-foliage.js?v=b477ce33502c';
import {buildPerimeterPlanting} from './perimeter-planting.js?v=b477ce33502c';

/** Continuous surfaces use world-space UVs: crossings share aggregate and do not shimmer. */
export function buildDistrictRealm(ctx,layout){
 const {THREE:T,world}=ctx,group=new T.Group();group.name=layout.id+' / streets, landscape and working waterfront';world.add(group);
 const k=detailKit(ctx,group),lampSites=[],treeSites=[],waterMaterials=[],wetPositions=[],wetIndices=[];
 let seed=77117,clock=0,night=false;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const roadMat=ctx.material('#465054','asphalt').clone();roadMat.roughness=.92;
 const stone=ctx.material(layout.id==='foundry'?'#9d9b92':'#b4b9b2','concrete'),line=ctx.material('#c4ba92'),white=ctx.material('#d5d4c7'),wood=ctx.material('#94795f','wood'),iron=ctx.material('#354d4e','metal');
 const glow=new T.MeshStandardMaterial({color:'#ede3cb',emissive:'#ffe4bf',emissiveIntensity:.05,roughness:.3});
 function ribbon(points,width,y,mat,closed=false,curved=false){
  const vectors=points.map(p=>new T.Vector3(p[0],y,p[1]));
  const curve=new T.CatmullRomCurve3(vectors,closed,'centripetal'),length=curve.getLength(),steps=curved?Math.ceil(length*1.3):Math.max(1,points.length-1),ps=[],uv=[],ix=[];
  for(let i=0;i<=steps;i++){const p=curve.getPoint(i/steps),v=curve.getTangent(i/steps);for(const s of[-1,1]){const x=p.x-v.z*width*s/2,z=p.z+v.x*width*s/2;ps.push(x,y,z);uv.push(x*.07,z*.07);}if(i<steps){const q=i*2;ix.push(q,q+1,q+2,q+1,q+3,q+2);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(ps,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();if(mat===roadMat){const offset=wetPositions.length/3;for(let i=0;i<ps.length;i+=3)wetPositions.push(ps[i],-ps[i+2],0);wetIndices.push(...ix.map(i=>i+offset));}const mesh=new T.Mesh(geo,mat);mesh.receiveShadow=true;mesh.name='Continuous '+(curved?'curved boulevard':'urban carriageway');group.add(mesh);return curve;
 }
 const boundary=new T.CatmullRomCurve3(layout.loops[0].map(p=>new T.Vector3(p[0],0,p[1])),true,'centripetal'),boundarySamples=boundary.getPoints(1600),edgeJoins=[];
 function boundaryCrossings(axis,value){const out=[];for(let i=1;i<boundarySamples.length;i++){const a=boundarySamples[i-1],b=boundarySamples[i],aa=axis==='x'?a.x:a.z,bb=axis==='x'?b.x:b.z;if((aa-value)*(bb-value)<=0&&Math.abs(bb-aa)>1e-6){const t=(value-aa)/(bb-aa);out.push(axis==='x'?a.z+(b.z-a.z)*t:a.x+(b.x-a.x)*t);}}return out.sort((a,b)=>a-b);}
 for(const road of layout.roads){if(road.closed)continue;const[a,b]=road.points,vertical=a[0]===b[0],values=boundaryCrossings(vertical?'x':'z',vertical?a[0]:a[1]);if(values.length<2)continue;
  if(vertical){if(Math.abs(a[0])>30)a[1]=values[0];b[1]=values.at(-1);}else{a[0]=values[0];b[0]=values.at(-1);}
  edgeJoins.push(a,b);
 }
 const nearJunction=(x,z,r=5.4)=>(layout.xs.some(v=>Math.abs(v-x)<r)&&layout.zs.some(v=>Math.abs(v-z)<r))||edgeJoins.some(p=>Math.hypot(x-p[0],z-p[1])<r);
 for(const road of layout.roads){
  ribbon(road.points,road.width+2.5,.055,stone,road.closed,road.curved);const curve=ribbon(road.points,road.width,.074,roadMat,road.closed,road.curved),len=curve.getLength();
  for(let s=0;s<len;s+=2.7){const p=curve.getPointAt(s/len),v=curve.getTangentAt(s/len),yaw=Math.atan2(v.x,v.z);if(nearJunction(p.x,p.z))continue;
   for(const side of[-1,1])k.box(.055,.014,1.6,line,p.x-v.z*side*.09,.085,p.z+v.x*side*.09,[0,yaw,0]);
   if(s%8.1<.1)for(const side of[-1,1])k.box(.12,.12,.48,'#d3d2bd',p.x-v.z*side*3.38,.13,p.z+v.x*side*3.38,[0,yaw,0]);
  }
 }
 // Main intersection retains generous setbacks and readable crossing markings.
 for(const x of layout.xs)for(const z of layout.zs){
  if(Math.abs(x)>137||z>110)continue;
  for(const axis of[0,1])for(const sign of[-1,1])for(let i=0;i<9;i++){
   const u=-2.7+i*.68,along=sign*4.28;
   k.box(axis?.55:1.15,.014,axis?1.15:.55,white,x+(axis?u:along),.091,z+(axis?along:u));
  }
  for(const axis of[0,1])for(const sign of[-1,1])k.box(axis?2.7:.14,.015,axis?.14:2.7,white,x+(axis?sign*1.55:sign*5.22),.092,z+(axis?sign*5.22:-sign*1.55));
 }
 function lamp(x,z,ry){
  k.cyl(.12,.15,iron,x,.18,z);k.cyl(.045,3.65,iron,x,1.95,z);
  k.box(.12,.12,.88,iron,x+Math.sin(ry)*.35,3.76,z-Math.cos(ry)*.35,[0,ry,0]);
  k.box(.25,.09,.6,iron,x+Math.sin(ry)*.7,3.72,z-Math.cos(ry)*.7,[0,ry,0]);
  k.box(.17,.025,.43,glow,x+Math.sin(ry)*.7,3.66,z-Math.cos(ry)*.7,[0,ry,0]);lampSites.push({x,z,ry});
 }
 // Trees and fixtures occupy separate parts of the curb furnishing strip.
 for(const x of layout.xs)for(let j=0;j<layout.zs.length-1;j++){
  const z=(layout.zs[j]+layout.zs[j+1])/2;if(Math.abs(x)<29&&z>0&&z<44)continue;
  const side=(j+layout.xs.indexOf(x))%2?1:-1,xx=x+side*4.05;
  lamp(xx,z-3.5,side>0?-Math.PI/2:Math.PI/2);
  if(layout.zs[j+1]-layout.zs[j]>20)treeSites.push({x:xx,z:z+3.3,y:.12,size:.75+rand()*.25});
 }
 for(const[x,z,ry]of[[-21.5,25.8,0],[21.6,25.8,0],[-4.1,12.3,Math.PI/2],[4.1,12.3,-Math.PI/2],[-33,18.1,0],[33,18.1,0]])lamp(x,z,ry);
 function bench(x,z,ry=0,y=0){k.box(2.1,.13,.65,wood,x,y+.54,z,[0,ry,0]);k.box(2.1,.51,.10,wood,x+Math.sin(ry)*.25,y+.84,z+Math.cos(ry)*.25,[0,ry,0]);for(const s of[-1,1])k.box(.09,.45,.51,iron,x+s*.78*Math.cos(ry),y+.3,z-s*.78*Math.sin(ry),[0,ry,0]);}
 for(const g of layout.greens){k.box(g.w,.13,g.d,ctx.material('#6c8969','grass'),g.x,.1,g.z);ribbon([[g.x-g.w*.4,g.z+g.d*.25],[g.x,g.z-1],[g.x+g.w*.4,g.z-g.d*.2]],1.4,.19,stone,false,true);treeSites.push({x:g.x-g.w*.25,z:g.z-g.d*.23,y:.19,size:1.2},{x:g.x+g.w*.3,z:g.z+g.d*.25,y:.19,size:1});bench(g.x+2,g.z+1.8,.4);for(let i=0;i<12;i++)k.round(.8,.45,.7,ctx.material(i%2?'#839858':'#60775c','grass'),g.x+(rand()-.5)*g.w*.7,.37,g.z+(rand()-.5)*g.d*.65);}
 if(layout.id==='garden'){
  // Groves stay inside reserved green parcels. Their trunks avoid the diagonal
  // walking route, benches and existing trees; clustered crowns may overlap as
  // real planting does, while all circulation and neighboring lots stay clear.
  const segmentDistance=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-u*dx,z-a[1]-u*dz);};
  for(const [gi,g]of layout.greens.entries()){
   const path=[[g.x-g.w*.4,g.z+g.d*.25],[g.x,g.z-1],[g.x+g.w*.4,g.z-g.d*.2]],limit=g.w>20&&g.d>15?7:3;
   let added=0;
   for(let attempt=0;attempt<70&&added<limit;attempt++){
    const x=g.x+(rand()-.5)*(g.w-5.6),z=g.z+(rand()-.5)*(g.d-5.6);
    if(Math.min(segmentDistance(x,z,path[0],path[1]),segmentDistance(x,z,path[1],path[2]))<2.3||Math.hypot(x-(g.x+2),z-(g.z+1.8))<3.1||treeSites.some(t=>Math.hypot(t.x-x,t.z-z)<2.65))continue;
    const size=1.12+rand()*.30;treeSites.push({x,z,y:.23,size});added++;
    const soil=ctx.material('#665948','soil');
    k.round(2.6+rand()*.8,.13,1.8+rand()*.9,soil,x,.19,z,[0,rand()*Math.PI,0]);
    for(let j=0;j<5;j++){const a=j*2.4+gi,r=.75+rand()*.45;k.round(.48+rand()*.35,.35+rand()*.25,.50,ctx.material(j%2?'#839858':'#60775c','grass'),x+Math.cos(a)*r,.39,z+Math.sin(a)*r);}
   }
  }
 }
 function water(x,z,w,d){
  const mat=new T.MeshPhysicalMaterial({color:'#426e78',roughness:.19,metalness:0,clearcoat:1,clearcoatRoughness:.12,transparent:true,opacity:.91});
  const u={value:0};mat.onBeforeCompile=s=>{s.uniforms.waterTime=u;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float waterTime; varying vec2 waterXZ;').replace('#include <begin_vertex>','#include <begin_vertex>\nwaterXZ=position.xz; transformed.y+=sin(position.x*1.7+waterTime)*cos(position.z*1.5-waterTime*.4)*.018;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 waterXZ; uniform float waterTime;').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor+=sin(waterXZ.x*3.+waterTime)*.025;').replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal+vec3(sin(waterXZ.x*2.3+waterTime)*.045,0.,cos(waterXZ.y*2.8-waterTime*.6)*.045));');};mat.customProgramCacheKey=()=> 'harbor-water-v1';
  const mesh=new T.Mesh(new T.PlaneGeometry(w,d,Math.ceil(w/1.5),Math.ceil(d/1.5)).rotateX(-Math.PI/2),mat);mesh.position.set(x,.16,z);mesh.receiveShadow=true;group.add(mesh);waterMaterials.push({mat,u});
 }
 if(layout.id==='harbor'){
  // A contained tidal basin is framed by a seawall and a broad working promenade.
  ribbon([[-119,92.4],[-60,92.4],[0,92.4],[60,92.4],[115,92.4]],2.1,.15,stone);
  ribbon([[-123,95],[-124,112],[-101,119],[-45,120],[30,120],[100,119],[124,111],[125,98]],2.2,.15,ctx.material('#b9b4a1','gravel'),false,true);
  // Planted overlooks occupy the shore beyond the basin, leaving the quay clear.
  for(const side of[-1,1]){
   for(let j=0;j<5;j++){const x=side*(122+j*.9),z=99+j*3.1;treeSites.push({x,z,y:.12,size:.95+(j%3)*.14});}
   bench(side*119,111.8,side*.6);lamp(side*128,113,side*Math.PI/2);
  }
  for(let x=-101;x<108;x+=8.7){
   k.soft(6,.12,1.5,ctx.material('#665c49','soil'),x,.11,123);
   for(let j=0;j<6;j++){const xx=x-2.35+j*.9;k.round(.85,.45+(j%3)*.17,.72,ctx.material(j%2?'#71835b':'#8d9763','grass'),xx,.36,123+Math.sin(j*2.4)*.25);}
  }
  k.box(229,.2,20,ctx.material('#364b50','stone'),-3,.02,104);water(-3,104,227,18);
  for(const z of[94,114]){for(let x=-117.5;x<112.5;x+=.5){if(z===94&&[-96,-48,12,72].some(p=>Math.abs(x-p)<4.5))continue;k.box(.5,.5,.7,ctx.material('#ada99a','stone'),x,.22,z);k.box(.5,.08,.08,iron,x,1.32,z);if(Math.abs(x%2)<.1)k.box(.08,.95,.08,iron,x,.83,z);}}
  for(const x of[-96,-48,12,72]){
   for(let i=0;i<40;i++)k.box(9,.12,.32,ctx.material('#94795f','deck'),x,.47,94+i*.43);
   for(const s of[-1,1])for(let z=96;z<112;z+=3)k.cyl(.15,1.4,ctx.material('#74664e','wood'),x+s*4.1,.1,z);
   for(let j=0;j<2;j++){const xx=x+(j?6:-6),zz=101+j*6; k.soft(2.2,.4,5.4,'#dad8cb',xx,.41,zz);k.soft(1.8,.4,3.6,'#d2d1c3',xx,.75,zz);k.box(1.2,.6,1.8,ctx.material('#446a76','glass'),xx,1.12,zz-.3);k.cyl(.035,4.8,iron,xx,3.2,zz);k.rod([xx,5.5,zz],[xx+1.8,2.1,zz],.018,'#bebfb2');}
   bench(x+3,93,.1);lamp(x-4,92.4,0);
  }
  for(let i=0;i<16;i++){const x=-121+i*15.2;if(Math.abs(x+83)>15)treeSites.push({x,z:73+(i%3)*1.5,y:.1,size:.95});}
 }else if(layout.id==='foundry'){
  // Reused rail viaduct: supports avoid carriageways and stairs have actual landings.
  const steel=ctx.material('#55453e','metal');
  k.box(226,.65,5.7,steel,-2,5.3,60);k.box(226,.18,5.3,ctx.material('#aeb1a1','concrete'),-2,5.71,60);
  for(const x of layout.xs.slice(1,-1))for(const s of[-1,1]){k.box(.55,5.3,.55,steel,x+6.6,2.66,60+s*2.3);k.box(1.1,.3,1.1,ctx.material('#9c9c8c','concrete'),x+6.6,.21,60+s*2.3);}
  for(const s of[-1,1]){k.box(226,.08,.08,iron,-2,6.77,60+s*2.7);k.box(226,.07,.10,steel,-2,5.94,60+s*2.7);for(let x=-114;x<111;x+=1.8)k.box(.05,1.05,.05,iron,x,6.25,60+s*2.7);}
  for(let x=-110;x<111;x+=4.7){k.box(3.8,.45,1.3,steel,x,5.99,61.6);for(let j=0;j<4;j++)k.round(.65,.65,.65,j%2?'#7e8e58':'#926e40',x-1.2+j*.8,6.42,61.6);if(Math.abs(x%23)<4)bench(x,58.6,0,5.8);}
  for(const x of[-112,109])for(let i=0;i<19;i++)k.box(2,.27,.48,ctx.material('#b5b3a4','stone'),x, .27+i*.29,54.4+i*.30);
  for(const z of[59.2,59.8])k.box(223,.10,.07,steel,-2,5.88,z);
 }else{
  // A slow stormwater landscape, rather than decorative circles scattered on lawn.
  for(const[x,z,w,d]of[[-67,60,22,8],[68,60,22,8],[-109,95,24,9]]){k.box(w+1,.16,d+1,ctx.material('#a8b0a5','stone'),x,.12,z);water(x,z,w,d);for(let i=0;i<9;i++)k.round(1.8,.65,1.2,ctx.material('#657e55','grass'),x-w*.4+i*w*.1,.49,z-d*.4);bench(x+w*.35,z+d*.7,.2);}
 }
 const foliage=buildDistrictFoliage({...ctx,world:group},treeSites);
 const edgePlanting=buildPerimeterPlanting({...ctx,world:group},{layout,buildings:layout.parcels});
 const wetGeometry=new T.BufferGeometry();wetGeometry.setAttribute('position',new T.Float32BufferAttribute(wetPositions,3));wetGeometry.setIndex(wetIndices);wetGeometry.computeVertexNormals();
 const lighting=buildCityLighting({...ctx,world:group,groundElevation:.083},lampSites);k.finish();
 return{group,lampSites,treeSites,lighting,roadMat,wetGeometry,foliage,edgePlanting,setNight(value){night=value;glow.emissiveIntensity=night?2.8:.05;},setAtmosphere(mode){lighting.setAtmosphere(mode);foliage.setRain?.(mode==='rain');edgePlanting.setRain(mode==='rain');roadMat.roughness=.92;roadMat.metalness=0;},setQuality(mode,view){lighting.setQuality(mode,view);foliage.setQuality(mode,view);edgePlanting.setQuality(mode,view);},update(dt){clock+=dt;for(const w of waterMaterials)w.u.value=clock;foliage.update(dt);edgePlanting.update(dt);}};
}
