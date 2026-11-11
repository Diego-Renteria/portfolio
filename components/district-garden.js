import {detailKit} from './detail-kit.js?v=b477ce33502c';
import {facadeMaterial} from './facade-material.js?v=b477ce33502c';

/** A contemporary city of staggered terraces, paired towers and a civic landmark. */
export function buildGardenArchitecture(ctx,parcels){
 const {THREE:T,world}=ctx,group=new T.Group();group.name='Canopy / contemporary terraced skyline';world.add(group);
 const k=detailKit(ctx,group),facadeMaterials=[],batches=new Map(),designMetadata=[];
 const schemes=[['#aec1c4','#5a8e9e'],['#d0d8d1','#8baaaa'],['#3e5c68','#3c6a80'],['#ad9277','#69858a'],['#b4bfc4','#789ba9'],['#e3e0d7','#6b929a']];
 for(let i=0;i<schemes.length;i++)facadeMaterials.push(facadeMaterial(T,{frame:schemes[i][0],glass:schemes[i][1],stone:i===3||i===5,kind:i===3?'iron':'glass',pitchX:1.8,pitchY:2.8,seed:71001+i*887,surfaceMaps:ctx.surfaceMaps}));
 const porcelain=ctx.material('#d7dcd4','concrete'),bronze=ctx.material('#8e7961','metal'),steel=ctx.material('#4c6972','metal'),roof=ctx.material('#6d7979','concrete'),wood=ctx.material('#a58c66','wood'),leaf=ctx.material('#64815c','grass');
 const glazing=new T.MeshPhysicalMaterial({color:'#b2d1d2',roughness:.1,metalness:.1,opacity:.1,transparent:true,depthWrite:false,side:T.DoubleSide}),light=new T.MeshStandardMaterial({color:'#e8e0cb',emissive:'#f1ddbd',emissiveIntensity:.08});
 const geos={box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(.5,.5,1,32)};let address={id:0,program:1};
 function facade(type,mat,w,h,d,x,y,z,ry=0){const key=type+mat;let b=batches.get(key);if(!b){b={geo:geos[type],mat:facadeMaterials[mat],items:[]};batches.set(key,b);}b.items.push({w,h,d,x,y,z,ry,...address});}
 const roofGroveSites=[];
 // Individual folded leaf silhouettes keep these small roof trees airy rather
 // than turning the terraces into rows of identical green spheres.
 const leafEdge=[[0,.8],[-.16,.42],[-.45,.48],[-.30,.12],[-.46,-.04],[-.15,-.25],[0,-.60],[.15,-.25],[.46,-.04],[.30,.12],[.45,.48],[.16,.42]],leafPositions=[0,.10,.045],leafIndices=[];
 for(const [x,y]of leafEdge)leafPositions.push(x,y,Math.abs(x)>.3?-.02:0);
 for(let i=0;i<leafEdge.length;i++)leafIndices.push(0,i+1,(i+1)%leafEdge.length+1);
 const roofLeafGeometry=new T.BufferGeometry();roofLeafGeometry.setAttribute('position',new T.Float32BufferAttribute(leafPositions,3));roofLeafGeometry.setIndex(leafIndices);roofLeafGeometry.computeVertexNormals();k.geos.roofLeaf=roofLeafGeometry;
 const roofBark=k.mat('#75634f','bark'),roofLeaves=['#567c55','#72905e','#8c9d66'].map(c=>{const m=k.mat(c);m.side=T.DoubleSide;return m;});
 function roofTree(x,y,z,seed){
  let n=seed+711;const random=()=>{n=n*16807%2147483647;return(n-1)/2147483646;};
  k.box(1.45,.50,1.45,wood,x,y+.34,z);k.box(1.30,.055,1.30,ctx.material('#544a3b','soil'),x,y+.62,z);
  const height=2.5+random()*.65;k.cyl(.065,height*.65,roofBark,x,y+.64+height*.325,z);
  for(let branch=0;branch<5;branch++){
   const a=branch*Math.PI*2/5+random()*.38,reach=.64+random()*.27,tip=[x+Math.cos(a)*reach,y+height*(.76+random()*.22),z+Math.sin(a)*reach];
   k.rod([x,y+.65+height*.40,z],tip,.028,roofBark);
   for(let j=0;j<27;j++){const angle=random()*Math.PI*2,vertical=random()*2-1,r=Math.cbrt(random())*.64,horizontal=Math.sqrt(1-vertical*vertical)*r;
    k.put('roofLeaf',.25+random()*.17,.27+random()*.19,.25+random()*.17,roofLeaves[(branch+j)%3],tip[0]+Math.cos(angle)*horizontal,tip[1]+vertical*r*.72,tip[2]+Math.sin(angle)*horizontal,[random()*Math.PI,random()*Math.PI*2,random()*Math.PI*2]);
   }
  }
 }
 function terrace(x,z,w,d,y,groveSeed=null){
  k.box(w+.4,.22,d+.4,porcelain,x,y,z);
  for(const s of[-1,1]){k.box(w+.1,.055,.055,bronze,x,y+1,z+s*d/2);k.box(.055,.055,d,bronze,x+s*w/2,y+1,z);}
  const grove=groveSeed!==null&&(groveSeed%7===0||groveSeed%11===3)&&w>9&&d>8&&y>12&&y<60&&roofGroveSites.length<12;
  for(let j=0;j<3;j++){if(grove&&j!==1)continue;const xx=x-w*.3+j*w*.3;k.box(w*.19,.45,1,wood,xx,y+.36,z+d*.34);k.round(w*.18,.7,1.2,leaf,xx,y+.9,z+d*.34);}
  if(grove){roofGroveSites.push({x,z,y});roofTree(x-w*.29,y,z+d*.34,groveSeed*19+1);roofTree(x+w*.29,y,z+d*.34,groveSeed*19+7);}
 }
 function services(x,z,w,d,y,id){
  k.box(w-.2,.15,d-.2,roof,x,y+.11,z);
  k.box(w*.3,1.25,d*.25,porcelain,x-w*.18,y+.8,z-d*.18);k.box(w*.32,.12,d*.27,steel,x-w*.18,y+1.47,z-d*.18);
  for(let j=0;j<2;j++){k.box(1.4,.68,1.8,steel,x+w*.22,y+.48,z+(j-.5)*2.1);k.cyl(.37,.06,'#3e535d',x+w*.22,y+.84,z+(j-.5)*2.1);for(let i=0;i<5;i++)k.box(1.12,.045,.04,'#253b47',x+w*.22,y+.28+i*.1,z+(j-.5)*2.1+.91);}
  if(id%2===0&&!roofGroveSites.some(g=>Math.abs(g.x-x)<w*.15&&Math.abs(g.z-z)<.1&&Math.abs(g.y-y)<.2))for(let j=0;j<3;j++)k.box(1.5,.08,2,ctx.material('#3a5667','metal'),x-w*.28+j*w*.26,y+.6,z+d*.24,[.2,0,0]);
 }
 function lobby(p,id){
  const{x,z,w,d}=p;k.box(w,3.4,.16,porcelain,x,1.9,z-d/2);k.box(.18,3.4,d,porcelain,x-w/2,1.9,z);k.box(.18,3.4,d,porcelain,x+w/2,1.9,z);
  k.box(w,.12,d,ctx.material('#c2c4b5','stone'),x,.2,z);k.box(w,.18,d,porcelain,x,3.65,z);
  facade('box',id%6,w,2.8,.07,x,1.7,z-d/2-.1);
  for(let i=0;i<3;i++){const xx=x+(i-1)*w*.28;k.box(.10,3.4,.17,bronze,xx,1.9,z+d/2);k.box(w*.27,2.9,.025,glazing,xx,1.7,z+d/2+.1);}
  k.box(w*.65,.15,1.8,steel,x,3.1,z+d/2+.5);
  if(z>-35){
   // Mixed-use ground floors have room to circulate around furniture.
   for(let i=0;i<3;i++){const xx=x+(i-1)*w*.27;k.soft(1.7,.45,.85,ctx.material(i%2?'#7f938c':'#a68b6a','fabric'),xx,.47,z+d*.08);k.soft(1.7,.6,.2,ctx.material('#7f938c','fabric'),xx,.86,z+d*.08-.34);k.cyl(.4,.05,wood,xx,.49,z+d*.28);k.cyl(.035,.45,bronze,xx,.25,z+d*.28);k.plant(xx,.1,z-d*.3,.65);}
   k.box(w*.32,.95,.7,wood,x-w*.25,.68,z-d*.25);k.box(w*.34,.07,.8,ctx.material('#dad9ce','stone'),x-w*.25,1.19,z-d*.25);
   for(const s of[-1,1])k.box(w*.28,.035,.35,light,x+s*w*.23,3.48,z);
  }
 }
 for(const [i,p]of parcels.entries()){
  const{x,z,w,d}=p,h=p.h,addressId=12000+i*13;address={id:addressId,program:p.kind==='residential'?0:p.kind==='civic'?5:1};lobby(p,i);
  const family=i%5,base=3.7;let total=h;
  if(family===0){
   const levels=4;for(let j=0;j<levels;j++){const ratio=1-j*.14,hh=(h-base)/levels,xx=x+(j%2?1:-1)*w*.045;facade('box',i%6,w*ratio,hh,d*ratio,xx,base+hh*(j+.5),z-j*.35);terrace(xx,z-j*.35,w*ratio,d*ratio,base+hh*(j+1),j===levels-1?i:null);}services(x,z-1.05,w*.58,d*.58,h,i);
  }else if(family===1){
   const bh=h*.35;facade('box',i%6,w,bh-base,d,x,(base+bh)/2,z);terrace(x,z,w,d,bh);facade('box',(i+2)%6,w*.47,h-bh,d*.68,x-w*.22,(h+bh)/2,z-d*.1);facade('box',(i+1)%6,w*.32,(h-bh)*.7,d*.48,x+w*.3,bh+(h-bh)*.35,z+d*.16);services(x-w*.22,z-d*.1,w*.47,d*.68,h,i);
   k.box(w*.48,.38,d*.32,steel,x+w*.04,h*.62,z,[0,0,.08]);
  }else if(family===2){
   facade('cyl',(i+1)%6,w*.82,h-base,d*.82,x,(h+base)/2,z);for(let y=base+3;y<h;y+=6)k.put('torus',w*.43,d*.43,.5,porcelain,x,y,z,[Math.PI/2,0,0]);services(x,z,w*.57,d*.57,h,i);
  }else if(family===3){
   const sh=h*.48;facade('box',i%6,w,h-base,d*.48,x,(h+base)/2,z-d*.25);facade('box',(i+3)%6,w*.46,sh-base,d*.52,x-w*.27,(sh+base)/2,z+d*.24);terrace(x-w*.27,z+d*.24,w*.46,d*.52,sh,i);services(x,z-d*.25,w,d*.48,h,i);
   for(let j=0;j<3;j++)k.box(.14,h*.6,.24,bronze,x-w*.35+j*w*.35,h*.4,z+d*.01);
  }else{
   for(let j=0;j<3;j++){const hh=(h-base)/3,xx=x+(j-1)*w*.08,zz=z+(j%2?-.08:.08)*d;facade('box',(i+j)%6,w*.76,hh,d*.74,xx,base+hh*(j+.5),zz);terrace(xx,zz,w*.76,d*.74,base+hh*(j+1),j===2?i:null);}services(x+w*.08,z+d*.08,w*.76,d*.74,h,i);
  }
  designMetadata.push({id:p.id,x,z,width:w,depth:d,height:total,family:['terraced-garden','paired-offset-wings','elliptical-tower','courtyard-campus','stacked-pavilions'][family],interiorProgram:{code:address.program,use:['residential','office','studio','hotel','retail','civic'][address.program]}});
 }
 // The landmark has a tapered structural core, an occupied ring and radial ribs.
 const tx=65,tz=-66;
 k.cyl(5.8,1.2,porcelain,tx,.7,tz);k.cyl(3.5,3.2,glazing,tx,2.7,tz);
 k.put('cone',2.6,85,2.6,porcelain,tx,44,tz);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;k.rod([tx+Math.cos(a)*4,.8,tz+Math.sin(a)*4],[tx+Math.cos(a)*1.2,82,tz+Math.sin(a)*1.2],.09,steel);}
 address={id:15551,program:4};facade('cyl',2,12,4.3,12,tx,84,tz);
 k.cyl(7,.5,bronze,tx,81.7,tz);k.cyl(7.2,.4,porcelain,tx,86.4,tz);k.put('cone',6.9,2.7,6.9,porcelain,tx,87.9,tz);k.cyl(.16,18,steel,tx,97.3,tz);
 for(let i=0;i<24;i++){const a=i*Math.PI/12;k.rod([tx+Math.cos(a)*6.8,86.7,tz+Math.sin(a)*6.8],[tx,89.2,tz],.045,bronze);}
 designMetadata.push({id:'canopy-observation-tower',x:tx,z:tz,width:14.4,depth:14.4,height:106.3,family:'radial-observation-landmark',interiorProgram:{code:4,use:'retail'}});
 k.finish();const o=new T.Object3D();
 for(const b of batches.values()){const geo=b.geo.clone();geo.setAttribute('interiorAddress',new T.InstancedBufferAttribute(new Float32Array(b.items.flatMap(a=>[a.program,a.id,0])),3));const mesh=new T.InstancedMesh(geo,b.mat,b.items.length);b.items.forEach((a,i)=>{o.position.set(a.x,a.y,a.z);o.scale.set(a.w,a.h,a.d);o.rotation.set(0,a.ry,0);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);}
 group.userData.buildingCount=designMetadata.length;return{group,facadeMaterials,designMetadata,setNight(value){for(const m of facadeMaterials)m.emissiveIntensity=value?1.1:.035;light.emissiveIntensity=value?1.8:.08;},update(){}};
}
