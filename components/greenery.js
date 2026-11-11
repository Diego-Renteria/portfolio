import {terrainHeight,insideLand,flatRoadXs,flatRoadZs,inStadiumReserve,curvedRoadSegments} from './geography.js?v=b477ce33502c';
import {createLeafFall} from './autumn-leaves.js?v=b477ce33502c';
import {autumnHabit} from './autumn-botany.js?v=b477ce33502c';

/** Street trees grown from branches, with individual folded maple leaves and rooted sedges. */
export function buildGreenery(ctx){
  const {THREE:T,world}=ctx,group=new T.Group();group.name='Pacific Northwest autumn street planting';world.add(group);
  let seed=45071,raining=false;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  const treePalettes=[
    ['#b74727','#cf6837','#8f3428'],['#dda642','#ebc566','#b58530'],
    ['#cf772b','#e39b40','#a85728'],['#a79140','#c5b25a','#81763b'],
    ['#a2382d','#c75a40','#7c302e'],['#d9b557','#f0cf78','#b59442'],
    ['#768d4c','#b2a64d','#4d7048'],['#923b42','#ba6650','#6c353e'],['#d3b13c','#e7ca65','#93a351']
  ];
  const bark=ctx.material('#665345','bark'),darkBark=ctx.material('#4d443a','bark'),birchBark=ctx.material('#c3c0ac','bark'),iron=ctx.material('#48534b');
  let currentBark='bark';
  const leafMat=new T.MeshStandardMaterial({color:'#ffffff',roughness:1,metalness:0,side:T.DoubleSide});
  function shadeLeaf(shader){
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vBladeCoord;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBladeCoord=position.xy;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vBladeCoord;').replace('#include <color_fragment>','#include <color_fragment>\nfloat veinAA=fwidth(vBladeCoord.x)*1.5+0.004;\nfloat midrib=1.0-smoothstep(0.006,0.006+veinAA,abs(vBladeCoord.x));\ndiffuseColor.rgb*=1.0+midrib*0.065;').replace('#include <opaque_fragment>',
      'outgoingLight += diffuseColor.rgb * 0.055;\n#include <opaque_fragment>');
  }
  leafMat.onBeforeCompile=shadeLeaf;
  leafMat.customProgramCacheKey=()=> 'autumn-translucent-folded-leaves-v2';
  const stems=[],grates=[],crown=[],distantCrown=[],sprigs=[],ground=[],grass=[],seedheads=[],soil=[],fallSources=[];
  const surfaceHeight=(x,z)=>{
    if(Math.abs(z-33)<3.38&&[-20,-6,6,20].some(cx=>Math.abs(x-cx)<.435))return .57;
    if(Math.abs(z-33)<5.7&&[-13,13].some(cx=>Math.abs(x-cx)<8.7))return .15;
    const dx=Math.min(...flatRoadXs.map(v=>Math.abs(v-x))),dz=Math.min(...flatRoadZs.map(v=>Math.abs(v-z)));
    if(dx<3.3||dz<2.8)return .035;
    if((dx<3.43||dz<2.93))return .17;
    if(dx<4.41||dz<3.91)return .15;
    return terrainHeight(x,z);
  };
  const sites=[],occupied=new Set();
  function site(x,z,axis){
    // Move the record-store sightline tree west into the adjacent pocket park.
    // The complete tree, grate, planting and falling-leaf sources move together.
    if(Math.abs(x-22.13)<.01&&Math.abs(z-30.4)<.01){x=12;z=29.4;axis='x';}
    // Stagger the east foreground tree along its sidewalk. The west tree and
    // the east tree no longer frame the block as an identical mirrored pair.
    if(Math.abs(x-3.87)<.01&&Math.abs(z-35.6)<.01)z=30.2;
    // Leave the four destination facades and their entrances unobstructed.
    if(Math.abs(x)<21.6&&z>3.9&&z<27)return;
    if(!insideLand(x,z,7)||terrainHeight(x,z)>.3||inStadiumReserve(x,z,1.6))return;
    // Root grates stay fully behind both carriageway edges.
    if(flatRoadXs.some(v=>Math.abs(x-v)<3.72)||flatRoadZs.some(v=>Math.abs(z-v)<3.22))return;
    if(curvedRoadSegments.some(({a,b,halfWidth})=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<halfWidth+.6;}))return;
    const key=x.toFixed(1)+':'+z.toFixed(1);if(occupied.has(key))return;occupied.add(key);
    sites.push({x,z,axis,distant:Math.abs(x)>48||Math.abs(z)>38});
  }
  // Plant within actual sidewalk strips, between crossings rather than at traffic signals.
  for(const [xi,x]of flatRoadXs.entries())for(let zi=0;zi<flatRoadZs.length-1;zi++){
    const z=(flatRoadZs[zi]+flatRoadZs[zi+1])/2;
    for(const side of [-1,1])site(x+side*3.87,z+(xi%2?2.6:-2.6),'z');
  }
  for(const [zi,z]of flatRoadZs.entries())for(let xi=0;xi<flatRoadXs.length-1;xi++){
    if((zi+xi)%2)continue;
    const x=(flatRoadXs[xi]+flatRoadXs[xi+1])/2;
    for(const side of [-1,1])site(x+4.1,z+side*3.37,'x');
  }
  for(const x of [-22.1,22.1])site(x,18.1,'x');
  function branch(a,b,r,mat=currentBark){
    const direction=new T.Vector3().subVectors(b,a);
    stems.push({p:a.clone().add(b).multiplyScalar(.5),q:new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),direction.clone().normalize()),s:new T.Vector3(r,direction.length(),r),mat});
  }
  function leaf(array,x,y,z,size,color,flat=false){
    array.push({x,y,z,size,color,rx:flat?-Math.PI/2:rand()*Math.PI,ry:flat?0:rand()*Math.PI*2,rz:rand()*Math.PI*2});
  }
  sites.forEach((s,index)=>{
    const {x,z}=s,baseY=surfaceHeight(x,z),nearFocus=Math.abs(x)<31&&z>-6&&z<37;
    const habit=autumnHabit(index,rand,1,nearFocus),h=((z>18?3.65:4.3)+rand()*.9)*habit.height,spread=(1.25+rand()*.38)*habit.width;
      Object.assign(s,{species:habit.species,height:h,spread,baseY});currentBark=habit.species==='silver birch'?'birch':'bark';
    const base=new T.Vector3(x,baseY,z),fork=new T.Vector3(x+(rand()-.5)*.18,baseY+h*.53,z+(rand()-.5)*.18);
    branch(base,fork,(.105+rand()*.035)*Math.sqrt(habit.height));
    if(habit.species==='serviceberry')for(const side of[-1,1])branch(new T.Vector3(x+side*.12,baseY,z),fork.clone().add(new T.Vector3(side*.32,-.1,.12)),.045);
    for(let j=0;j<5;j++){
      const a=j*Math.PI*.4;branch(new T.Vector3(x+Math.cos(a)*.23,baseY+.012,z+Math.sin(a)*.23),new T.Vector3(x,baseY+.43,z),.035,'dark');
    }
    soil.push({x,z,y:baseY+.006});
    // A dark soil opening is surrounded by a square metal tree grate.
    for(const dx of [-.34,.34])grates.push({x:x+dx,z,y:baseY+.012,w:.035,d:.72});
    for(const dz of [-.34,.34])grates.push({x,z:z+dz,y:baseY+.012,w:.72,d:.035});
    for(let j=-2;j<=2;j++)for(const side of [-1,1])grates.push({x:x+j*.105,z:z+side*.255,y:baseY+.012,w:.025,d:.15});
    // Small tufted sedges have individually curved blades and ochre tips, rather than a flat green tile.
    for(let j=0;j<22;j++){
      const a=rand()*Math.PI*2,r=.18+rand()*.12;
      grass.push({x:x+Math.cos(a)*r,y:baseY+.02,z:z+Math.sin(a)*r,h:.12+rand()*.22,angle:rand()*Math.PI*2,color:j%5===0?'#9c9d58':j%3===0?'#829148':'#5d7947'});
    }
    const centers=[];
    for(let j=0;j<8;j++){
      const a=j*Math.PI*.25+rand()*.3,r=spread*(.38+rand()*.42);
      const tip=new T.Vector3(x+Math.cos(a)*r,baseY+h*(.7+rand()*.16),z+Math.sin(a)*r);
      const mid=fork.clone().lerp(tip,.53);mid.y-=.13;
      branch(fork,mid,.052);branch(mid,tip,.029);
      for(let k=0;k<3;k++){
        const twig=tip.clone().add(new T.Vector3((rand()-.5)*.73,.22+rand()*.3,(rand()-.5)*.73));branch(tip,twig,.011);
        const off=twig.clone().add(new T.Vector3((rand()-.5)*.3,.1,(rand()-.5)*.3));branch(twig,off,.0055);
      }
      centers.push({x:tip.x,y:tip.y+.16,z:tip.z,rad:spread*(.5+rand()*.16)});
    }
    centers.push({x:x+.1,y:baseY+h*.95,z:z-.08,rad:spread*.63});
    const tones=treePalettes[index%treePalettes.length],list=s.distant?distantCrown:crown;
    for(const p of centers){
      const branchTone=rand()>.7?1:0,n=s.distant?34:116;
      for(let j=0;j<n;j++){
        const theta=rand()*Math.PI*2,yy=rand()*2-1,rr=Math.cbrt(rand()),xz=Math.sqrt(1-yy*yy)*rr*p.rad;
        const px=p.x+Math.cos(theta)*xz,py=p.y+yy*rr*p.rad*.81*habit.crown,pz=p.z+Math.sin(theta)*xz;
        const color=new T.Color(tones[rand()>.88?2:branchTone]).multiplyScalar(.93+rand()*.14);
        leaf(list,px,py,pz,(s.distant?.14:.10)+rand()*(s.distant?.12:.11),color);
        if(!s.distant&&j%5===0)leaf(sprigs,px,py,pz,.065+rand()*.06,color);
        if(j===0){
          const source={x:px,y:py,z:pz,color,axis:s.axis};
          fallSources.push(source);if(nearFocus)for(let q=0;q<5;q++)fallSources.push(source);
        }
      }
    }
    for(let j=0;j<(s.distant?12:34);j++){
      const a=rand()*Math.PI*2,r=.4+Math.pow(rand(),.8)*1.45,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,size=.055+rand()*.08;
      leaf(ground,px,surfaceHeight(px,pz)+size*.075+.003,pz,size,tones[j%3],true);
    }
  });
  // A few shallow rain-only accumulations sit just inside the curb, away from
  // crossings and the furnishing strip where benches occupy the pavement.
  for(const [index,s]of sites.entries()){
    if(index%3)continue;
    const vertical=s.axis==='z',roads=vertical?flatRoadXs:flatRoadZs;
    const coordinate=vertical?s.x:s.z,road=roads.reduce((a,b)=>Math.abs(a-coordinate)<Math.abs(b-coordinate)?a:b),side=Math.sign(coordinate-road)||1;
    const cx=vertical?road+side*3.17:s.x+.8,cz=vertical?s.z+.8:road+side*2.67;
    if((vertical?flatRoadZs:flatRoadXs).some(v=>Math.abs(v-(vertical?cz:cx))<5.8))continue;
    if(!insideLand(cx,cz,7))continue;
    for(let j=0;j<11;j++){
      const along=(rand()-.5)*.83,across=(rand()-.5)*.12,x=cx+(vertical?across:along),z=cz+(vertical?along:across),size=.055+rand()*.075;
      leaf(ground,x,surfaceHeight(x,z)+size*.075+.003,z,size,treePalettes[index%treePalettes.length][j%3],true);
      ground[ground.length-1].wetOnly=true;
    }
  }
  // Raised forecourt planters: loose, staggered clumps of Carex-like sedges
  // and taller bronze grasses, with a few airy seed panicles above the blades.
  for(const [index,x]of [-20,-6,6,20].entries())for(let row=0;row<14;row++){
    const cx=x+(row%2?-.15:.15),cz=30.9+row*.32,bronze=(row+index)%3===0;
    const tones=bronze?['#a48b52','#b4a069','#847044']:['#73834d','#94a16a','#5e7546'];
    for(let blade=0;blade<24;blade++){
      const a=rand()*Math.PI*2,r=rand()*.10,height=(bronze?.39:.29)+rand()*(bronze?.39:.25),bend=1.6+rand()*1.4;
      const p={x:cx+Math.cos(a)*r,y:.573,z:cz+Math.sin(a)*r,h:height,angle:a,width:.65+rand()*.55,bend,color:tones[blade%3]};
      grass.push(p);
      if(bronze&&blade%8===0)seedheads.push({x:p.x+Math.sin(a)*.15*bend,y:p.y+height+.055,z:p.z+Math.cos(a)*.15*bend,angle:a,color:blade%2?'#bfa777':'#ad935d'});
    }
  }
  const dummy=new T.Object3D(),color=new T.Color();
  const twigMeshes=[];
  for(const [key,mat]of [['bark',bark],['dark',darkBark],['birch',birchBark]])for(const fine of [false,true]){
    const list=stems.filter(p=>p.mat===key&&(p.s.x<.02)===fine);if(!list.length)continue;
    const mesh=new T.InstancedMesh(new T.CylinderGeometry(.63,1,1,fine?6:12),mat,list.length);mesh.name=(fine?'fine-tree-twigs-':'tapered-tree-branches-')+key;
    list.forEach((p,i)=>{dummy.position.copy(p.p);dummy.quaternion.copy(p.q);dummy.scale.copy(p.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
    if(fine)twigMeshes.push(mesh);
  }
  const grateMesh=new T.InstancedMesh(new T.BoxGeometry(1,.016,1),iron,grates.length);grateMesh.name='sidewalk-tree-grates';
  grates.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,0,0);dummy.scale.set(p.w,1,p.d);dummy.updateMatrix();grateMesh.setMatrixAt(i,dummy.matrix);});grateMesh.receiveShadow=true;group.add(grateMesh);
  const soilMesh=new T.InstancedMesh(new T.CylinderGeometry(.32,.32,.015,24),ctx.material('#58493a'),soil.length);soilMesh.name='rooted-street-tree-soil';
  soil.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.setScalar(1);dummy.rotation.set(0,0,0);dummy.updateMatrix();soilMesh.setMatrixAt(i,dummy.matrix);});soilMesh.receiveShadow=true;group.add(soilMesh);
  // A serrated, folded maple blade. The low central ridge gives each thin leaf soft highlights.
  const edge=[[0,.87],[-.12,.61],[-.28,.69],[-.24,.4],[-.58,.48],[-.43,.16],[-.61,.1],[-.33,-.15],[-.17,-.33],[0,-.67],[.17,-.33],[.33,-.15],[.61,.1],[.43,.16],[.58,.48],[.24,.4],[.28,.69],[.12,.61]];
  const leafGeo=new T.BufferGeometry(),pos=[0,.12,.048],indices=[];
  for(const [x,y]of edge)pos.push(x,y,Math.abs(x)>.35?-.012:0);
  for(let i=0;i<edge.length;i++)indices.push(0,i+1,(i+1)%edge.length+1);
  leafGeo.setAttribute('position',new T.Float32BufferAttribute(pos,3));leafGeo.setIndex(indices);leafGeo.computeVertexNormals();
  const coarseGeo=new T.BufferGeometry();coarseGeo.setAttribute('position',new T.Float32BufferAttribute([0,.86,0,-.49,.09,0,0,-.69,0,.49,.09,0,0,.1,.048],3));coarseGeo.setIndex([4,0,1,4,1,2,4,2,3,4,3,0]);coarseGeo.computeVertexNormals();
  function leafBatch(name,list,geo,mat){
    const mesh=new T.InstancedMesh(geo,mat,list.length);mesh.name=name;
    list.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.scale.setScalar(p.wetOnly?0:p.size);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,color.set(p.color));});
    mesh.castShadow=name!=='fallen-leaves';mesh.receiveShadow=true;group.add(mesh);return mesh;
  }
  const canopyMesh=leafBatch('individually-folded-maple-leaves',crown,leafGeo,leafMat);
  const distantCanopyMesh=leafBatch('distant-folded-autumn-leaves',distantCrown,coarseGeo,leafMat);
  const sprigMesh=leafBatch('fine-autumn-sprigs',sprigs,coarseGeo,leafMat);
  const groundMat=leafMat.clone();groundMat.onBeforeCompile=shadeLeaf;groundMat.customProgramCacheKey=()=> 'ground-maple-veins-static-v1';
  const fallenMesh=leafBatch('fallen-leaves',ground,coarseGeo,groundMat);
  const grassGeo=new T.BufferGeometry();grassGeo.setAttribute('position',new T.Float32BufferAttribute([-.022,0,0,.022,0,0,-.014,.5,.04,.014,.5,.04,-.002,1,.15,.002,1,.15],3));grassGeo.setIndex([0,1,2,1,3,2,2,3,4,3,5,4]);grassGeo.computeVertexNormals();
  const grassMesh=new T.InstancedMesh(grassGeo,new T.MeshStandardMaterial({color:'#ffffff',roughness:1,side:T.DoubleSide}),grass.length);grassMesh.name='curved-sedges-and-forecourt-ornamental-grasses';
  grass.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.angle,0);dummy.scale.set(p.width||1,p.h,p.bend||1);dummy.updateMatrix();grassMesh.setMatrixAt(i,dummy.matrix);grassMesh.setColorAt(i,color.set(p.color));});grassMesh.receiveShadow=true;group.add(grassMesh);
  const seedMesh=new T.InstancedMesh(new T.CapsuleGeometry(.021,.095,3,6),new T.MeshStandardMaterial({color:'#ffffff',roughness:1}),seedheads.length);seedMesh.name='airy-bronze-grass-seedheads';
  seedheads.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(.15,p.angle,.1);dummy.scale.set(1,1,1);dummy.updateMatrix();seedMesh.setMatrixAt(i,dummy.matrix);seedMesh.setColorAt(i,color.set(p.color));});seedMesh.receiveShadow=true;group.add(seedMesh);
  const fall=createLeafFall({sources:fallSources,surfaceHeight,random:rand,count:270});
  const fadeGeo=leafGeo.clone(),opacity=new T.InstancedBufferAttribute(new Float32Array(fall.particles.length),1);fadeGeo.setAttribute('instanceLeafOpacity',opacity);
  const driftMat=leafMat.clone();driftMat.transparent=true;driftMat.depthWrite=false;driftMat.alphaTest=.015;
  driftMat.onBeforeCompile=shader=>{
    shadeLeaf(shader);
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float instanceLeafOpacity;\nvarying float vLeafOpacity;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLeafOpacity=instanceLeafOpacity;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vLeafOpacity;').replace('#include <alphatest_fragment>','diffuseColor.a*=vLeafOpacity;\n#include <alphatest_fragment>');
  };
  driftMat.customProgramCacheKey=()=> 'individually-fading-falling-maple-leaves-v2';
  const driftMesh=leafBatch('falling-settling-and-fading-autumn-leaves',fall.particles,fadeGeo,driftMat);driftMesh.castShadow=false;driftMesh.frustumCulled=false;driftMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);opacity.setUsage(T.DynamicDrawUsage);
  function renderFalling(){
    fall.particles.forEach((p,i)=>{
      const grounded=p.stage==='settling'||p.stage==='resting'||p.stage==='fading';
      dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.scale.set(p.size,p.size,p.size*(raining&&grounded?.55:1));dummy.updateMatrix();driftMesh.setMatrixAt(i,dummy.matrix);
      driftMesh.setColorAt(i,color.set(p.color||'#bd7239').multiplyScalar(1-(p.wet||0)*.34));opacity.setX(i,p.opacity);
    });
    driftMesh.instanceMatrix.needsUpdate=true;driftMesh.instanceColor.needsUpdate=true;opacity.needsUpdate=true;
  }
  renderFalling();
  function update(dt){if(!(dt>0))return;fall.update(dt);renderFalling();}
  function setRain(enabled){
    const wet=!!enabled;if(wet===raining)return;raining=wet;fall.setRain(wet);
    leafMat.color.setScalar(wet?.88:1);leafMat.roughness=wet?.64:1;
    groundMat.color.setScalar(wet?.64:1);groundMat.roughness=wet?.33:1;
    driftMat.roughness=wet?.42:1;
    grassMesh.material.color.setScalar(wet?.83:1);grassMesh.material.roughness=wet?.67:1;
    seedMesh.material.color.setScalar(wet?.78:1);seedMesh.material.roughness=wet?.67:1;
    ground.forEach((p,i)=>{
      const size=p.wetOnly&&!wet?0:p.size;
      dummy.position.set(p.x,wet?surfaceHeight(p.x,p.z)+p.size*.06+.002:p.y,p.z);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.scale.set(size,size,size*(wet?.55:1));dummy.updateMatrix();fallenMesh.setMatrixAt(i,dummy.matrix);
    });
    fallenMesh.instanceMatrix.needsUpdate=true;renderFalling();
  }
  function setQuality(mode,view='overview'){
    const close=view!=='overview';
    sprigMesh.visible=close&&mode==='high';fallenMesh.visible=close;grassMesh.visible=close;
    seedMesh.visible=close&&mode!=='low';
    for(const mesh of twigMeshes)mesh.visible=close&&mode==='high';
    canopyMesh.castShadow=close&&mode==='high';distantCanopyMesh.castShadow=false;sprigMesh.castShadow=false;
    // Coarser leaves preserve the colour of distant crowns without sub-pixel serrated edges.
    canopyMesh.geometry=close?leafGeo:coarseGeo;
  }
  group.userData.treeSites=sites;return{group,update,setQuality,setRain,foliage:fall,treeCount:sites.length,treeSites:sites};
}
