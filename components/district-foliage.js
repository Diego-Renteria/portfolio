import {createLeafFall} from './autumn-leaves.js?v=b477ce33502c';
import {autumnHabit} from './autumn-botany.js?v=b477ce33502c';

/** Branched street maples, folded leaves, and gravity/drag-driven leaf fall. */
export function buildDistrictFoliage(ctx,treeSites){
  const {THREE:T,world}=ctx,group=new T.Group();group.name='District / individually leafed autumn maples';world.add(group);
  let seed=805147,elapsed=0,currentView='overview',raining=false;
  const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  const palettes=[['#a53d2b','#ce6842','#87372e','#b85a35'],['#d5a54a','#ebc467','#ae8239','#cfa452'],['#c37232','#dfa352','#a45b31','#e3b36d'],['#83935a','#b4a154','#667c48','#c0ae68'],['#b34f3a','#d68151','#853e32','#c45b43']];
  const bark=ctx.material('#635447','bark'),twig=ctx.material('#4e443b','bark');
  const leafMat=new T.MeshStandardMaterial({color:'#ffffff',roughness:.94,side:T.DoubleSide,metalness:0});
  const wind={value:0},sway={value:1};
  function leafShader(shader,anchored=false){
    shader.uniforms.uDistrictLeafTime=wind;shader.uniforms.uDistrictLeafSway=sway;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uDistrictLeafTime;\nuniform float uDistrictLeafSway;\nvarying vec2 vBlade;').replace('#include <begin_vertex>',`#include <begin_vertex>
      vBlade=position.xy;
      #ifdef USE_INSTANCING
      float branchPhase=instanceMatrix[3].x*.63+instanceMatrix[3].z*.39;
      transformed.z+=sin(uDistrictLeafTime*1.7+branchPhase)*${anchored?'0.0':'.048'}*uDistrictLeafSway*max(0.0,position.y+.2);
      #endif`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vBlade;').replace('#include <color_fragment>',`#include <color_fragment>
      float veinWidth=fwidth(vBlade.x)*1.4+.004;
      float rib=1.0-smoothstep(.006,.006+veinWidth,abs(vBlade.x));
      diffuseColor.rgb*=.97+rib*.09;`).replace('#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*.045;\n#include <opaque_fragment>');
  }
  leafMat.onBeforeCompile=shader=>leafShader(shader);leafMat.customProgramCacheKey=()=> 'district-folded-maple-veins-wind-v2';
  const edge=[[0,.87],[-.12,.61],[-.28,.69],[-.24,.4],[-.58,.48],[-.43,.16],[-.61,.1],[-.33,-.15],[-.17,-.33],[0,-.67],[.17,-.33],[.33,-.15],[.61,.1],[.43,.16],[.58,.48],[.24,.4],[.28,.69],[.12,.61]];
  const positions=[0,.12,.053],indices=[];
  for(const [x,y]of edge)positions.push(x,y,Math.abs(x)>.35?-.017:0);
  for(let i=0;i<edge.length;i++)indices.push(0,i+1,(i+1)%edge.length+1);
  const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));leafGeo.setIndex(indices);leafGeo.computeVertexNormals();
  const coarseGeo=new T.BufferGeometry();coarseGeo.setAttribute('position',new T.Float32BufferAttribute([0,.87,0,-.5,.1,0,0,-.67,0,.5,.1,0,0,.12,.05],3));coarseGeo.setIndex([4,0,1,4,1,2,4,2,3,4,3,0]);coarseGeo.computeVertexNormals();
  const mainBranches=[],fineBranches=[],nearLeaves=[],farLeaves=[],groundLeaves=[],fallSources=[],grass=[];
  const sites=treeSites.filter(p=>[p.x,p.z,p.y??.12,p.size??1].every(Number.isFinite)).slice(0,150).map(p=>({...p,y:p.y??.12,size:p.size??1}));
  function branch(a,b,r,fine=false){const delta=b.clone().sub(a);(fine?fineBranches:mainBranches).push({p:a.clone().add(b).multiplyScalar(.5),q:new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.clone().normalize()),s:new T.Vector3(r,delta.length(),r)});}
  const surfaceHeight=(x,z)=>{
    let nearest=null,distance=Infinity;
    for(const t of sites){const d=(x-t.x)**2+(z-t.z)**2;if(d<distance){distance=d;nearest=t;}}
    if(!nearest)return .085;
    return distance<(nearest.y>.15?10:1.5)?nearest.y:.085;
  };
  function leaf(list,x,y,z,size,color,flat=false){list.push({x,y,z,size,color,rx:flat?-Math.PI/2:rand()*Math.PI,ry:flat?0:rand()*Math.PI*2,rz:rand()*Math.PI*2});}
  sites.forEach((t,index)=>{
    const near=Math.abs(t.x)<48&&t.z>-23&&t.z<60,habit=autumnHabit(index,rand,Math.max(.55,Math.min(1.45,t.size??1)),near);
    const s=habit.scale,y=t.y??.12,h=(3.65+rand()*.7)*habit.height,spread=(1.13+rand()*.28)*habit.width;
    Object.assign(t,{species:habit.species,height:h,spread});
    const base=new T.Vector3(t.x,y,t.z),fork=new T.Vector3(t.x+(rand()-.5)*.18*s,y+h*.52,t.z+(rand()-.5)*.18*s);
    branch(base,fork,.1*s);
    for(let r=0;r<4;r++){const a=r*1.57+rand()*.3;branch(new T.Vector3(t.x+Math.cos(a)*.19*s,y+.015,t.z+Math.sin(a)*.19*s),new T.Vector3(t.x,y+.32*s,t.z),.026*s);}
    const centers=[],tones=palettes[index%palettes.length];
    for(let j=0;j<7;j++){
      const angle=j*Math.PI*2/7+rand()*.4,reach=spread*(.52+rand()*.3),tip=new T.Vector3(t.x+Math.cos(angle)*reach,y+h*(.7+rand()*.18),t.z+Math.sin(angle)*reach),mid=fork.clone().lerp(tip,.5);mid.y-=.11*s;
      branch(fork,mid,.046*s);branch(mid,tip,.026*s);
      for(let k=0;k<2;k++){const q=tip.clone().add(new T.Vector3((rand()-.5)*.54*s,.18*s,(rand()-.5)*.54*s));branch(tip,q,.009*s,true);}
      centers.push({p:tip,r:spread*(.56+rand()*.14)});
    }
    centers.push({p:new T.Vector3(t.x+.07*s,y+h*.95,t.z-.05*s),r:spread*.62});
    const total=near?256:88,output=near?nearLeaves:farLeaves;
    for(let j=0;j<total;j++){
      const cluster=centers[j%centers.length],angle=rand()*Math.PI*2,v=rand()*2-1,r=Math.cbrt(rand()),horizontal=Math.sqrt(1-v*v)*r*cluster.r;
      const x=cluster.p.x+Math.cos(angle)*horizontal,z=cluster.p.z+Math.sin(angle)*horizontal,yy=cluster.p.y+v*r*cluster.r*.82*habit.crown;
      const color=new T.Color(tones[Math.floor(rand()*tones.length)]).multiplyScalar(.91+rand()*.17);
      leaf(output,x,yy,z,(near?.22:.35)*s+rand()*.12*s,color);
      if(j%32===0)fallSources.push({x,y:yy,z,color,axis:index%2?'x':'z'});
    }
    for(let j=0;j<(near?21:8);j++){
      const angle=rand()*Math.PI*2,r=.25*s+rand()*1.25*s,x=t.x+Math.cos(angle)*r,z=t.z+Math.sin(angle)*r,size=.06+rand()*.055;
      leaf(groundLeaves,x,surfaceHeight(x,z)+size*.075+.003,z,size,tones[j%4],true);
    }
    for(let j=0;j<12;j++){
      const angle=rand()*Math.PI*2,r=(.16+rand()*.12)*s;
      grass.push({x:t.x+Math.cos(angle)*r,y:y+.014,z:t.z+Math.sin(angle)*r,h:.13+rand()*.16,angle,color:j%4===0?'#a29656':j%2?'#78865a':'#536f4b'});
    }
  });
  // Damp leaves collect beside trunks in the curb furnishing strip, safely
  // outside the carriageway and away from the benches within pocket gardens.
  for(const [index,t]of sites.entries()){
    if(index%4||t.y>.15)continue;
    const direction=index*2.399,cx=t.x+Math.cos(direction)*.38,cz=t.z+Math.sin(direction)*.38;
    for(let j=0;j<12;j++){
      const x=cx+(rand()-.5)*.36,z=cz+(rand()-.5)*.31,size=.055+rand()*.065;
      leaf(groundLeaves,x,surfaceHeight(x,z)+size*.075+.003,z,size,palettes[index%palettes.length][j%4],true);
      groundLeaves[groundLeaves.length-1].wetOnly=true;
    }
  }
  const dummy=new T.Object3D(),color=new T.Color();
  for(const [list,mat,segments,name]of [[mainBranches,bark,12,'tapered bark trunks and limbs'],[fineBranches,twig,6,'fine branching twigs']]){
    const mesh=new T.InstancedMesh(new T.CylinderGeometry(.62,1,1,segments),mat,list.length);mesh.name='District / '+name;
    list.forEach((p,i)=>{dummy.position.copy(p.p);dummy.quaternion.copy(p.q);dummy.scale.copy(p.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);
  }
  function leafBatch(name,list,geo=leafGeo,mat=leafMat){
    const mesh=new T.InstancedMesh(geo,mat,list.length);mesh.name='District / '+name;
    list.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.scale.setScalar(p.wetOnly?0:p.size);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,color.set(p.color||'#bf733c'));});
    mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);return mesh;
  }
  const groundMat=leafMat.clone();groundMat.onBeforeCompile=shader=>leafShader(shader,true);groundMat.customProgramCacheKey=()=> 'district-ground-maple-static-v1';
  const canopy=leafBatch('individual near maple leaves',nearLeaves),farCanopy=leafBatch('individual distant maple leaves',farLeaves,coarseGeo),ground=leafBatch('fallen leaves lying flat',groundLeaves,coarseGeo,groundMat);
  const grassGeo=new T.BufferGeometry();grassGeo.setAttribute('position',new T.Float32BufferAttribute([-.025,0,0,.025,0,0,-.014,.5,.035,.014,.5,.035,-.002,1,.13,.002,1,.13],3));grassGeo.setIndex([0,1,2,1,3,2,2,3,4,3,5,4]);grassGeo.computeVertexNormals();
  const grassMesh=new T.InstancedMesh(grassGeo,new T.MeshStandardMaterial({color:'#ffffff',roughness:1,side:T.DoubleSide}),grass.length);grassMesh.name='District / rooted curb sedges';
  grass.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.angle,0);dummy.scale.set(1,p.h,1);dummy.updateMatrix();grassMesh.setMatrixAt(i,dummy.matrix);grassMesh.setColorAt(i,color.set(p.color));});grassMesh.receiveShadow=true;grassMesh.computeBoundingSphere();group.add(grassMesh);
  const fall=createLeafFall({sources:fallSources,surfaceHeight,random:rand,count:Math.min(180,sites.length*2)}),fadeGeo=leafGeo.clone(),opacity=new T.InstancedBufferAttribute(new Float32Array(fall.particles.length),1);fadeGeo.setAttribute('instanceLeafOpacity',opacity);
  const driftMat=leafMat.clone();driftMat.transparent=true;driftMat.depthWrite=false;driftMat.alphaTest=.015;
  driftMat.onBeforeCompile=shader=>{
    leafShader(shader,true);shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float instanceLeafOpacity;\nvarying float vLeafOpacity;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLeafOpacity=instanceLeafOpacity;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vLeafOpacity;').replace('#include <alphatest_fragment>','diffuseColor.a*=vLeafOpacity;\n#include <alphatest_fragment>');
  };driftMat.customProgramCacheKey=()=> 'district-falling-maple-opacity-v2';
  const drift=leafBatch('tumbling, settling and fading leaves',fall.particles,fadeGeo,driftMat);drift.frustumCulled=false;drift.instanceMatrix.setUsage(T.DynamicDrawUsage);opacity.setUsage(T.DynamicDrawUsage);
  function renderFall(){
    fall.particles.forEach((p,i)=>{
      const grounded=p.stage==='settling'||p.stage==='resting'||p.stage==='fading';
      dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.scale.set(p.size,p.size,p.size*(raining&&grounded?.55:1));dummy.updateMatrix();drift.setMatrixAt(i,dummy.matrix);
      drift.setColorAt(i,color.set(p.color||'#bd7239').multiplyScalar(1-(p.wet||0)*.34));opacity.setX(i,p.opacity);
    });
    drift.instanceMatrix.needsUpdate=true;if(drift.instanceColor)drift.instanceColor.needsUpdate=true;opacity.needsUpdate=true;
  }
  function setQuality(mode,view='overview'){
    currentView=view;const close=view!=='overview';canopy.geometry=close&&mode!=='low'?leafGeo:coarseGeo;canopy.castShadow=close&&mode==='high';farCanopy.castShadow=false;ground.visible=close;grassMesh.visible=close;
    group.children.find(m=>m.name.endsWith('fine branching twigs')).visible=close&&mode!=='low';
  }
  function update(dt){if(!(dt>0))return;elapsed+=Math.min(dt,.1);wind.value=elapsed;fall.update(dt);renderFall();}
  function setRain(enabled){
    const wet=!!enabled;if(wet===raining)return;raining=wet;fall.setRain(wet);sway.value=wet?.65:1;
    leafMat.color.setScalar(wet?.88:1);leafMat.roughness=wet?.62:.94;
    groundMat.color.setScalar(wet?.64:1);groundMat.roughness=wet?.33:.94;
    driftMat.roughness=wet?.42:.94;
    grassMesh.material.color.setScalar(wet?.83:1);grassMesh.material.roughness=wet?.67:1;
    groundLeaves.forEach((p,i)=>{
      const size=p.wetOnly&&!wet?0:p.size;
      dummy.position.set(p.x,wet?surfaceHeight(p.x,p.z)+p.size*.06+.002:p.y,p.z);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.scale.set(size,size,size*(wet?.55:1));dummy.updateMatrix();ground.setMatrixAt(i,dummy.matrix);
    });
    ground.instanceMatrix.needsUpdate=true;renderFall();
  }
  group.userData={treeSites:sites,treeCount:sites.length,nearLeafCount:nearLeaves.length,farLeafCount:farLeaves.length,leafSurface:'folded serrated maple with vein highlights',fallSources:fallSources.length};
  renderFall();setQuality('high','overview');
  return{group,setQuality,setRain,update,treeSites:sites,treeCount:sites.length,foliage:fall};
}
