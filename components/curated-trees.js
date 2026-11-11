/** Imported EZ-Tree geometry, generated offline under MIT license. Two shared
 * meshes (bark + alpha-tested leaves) per variant and distance band; no per-tree
 * draw calls or runtime generation. Retains the original site's safe bounds. */
export function createCuratedTrees(T,parent,sites,{onReady=()=>{}}={}){
 const group=new T.Group();group.name='Curated EZ-Tree autumn canopy and evergreens';group.visible=false;parent.add(group);
 const clock={value:0},batches=[],materials=[],geometries=[],textures=[];
 const metrics={trees:sites.length,drawCalls:0,triangles:0,loaded:false};
 let quality='high',view='overview',night=true,rain=false,disposed=false,time=0;
 const origin=new URL('../assets/curated/trees/',import.meta.url),loader=new T.TextureLoader();
 const read=async path=>{const r=await fetch(new URL(path,origin));if(!r.ok)throw Error('Tree asset '+r.status+' '+path);return r;};
 function apply(){
  const close=view!=='overview'&&quality!=='low';let triangles=0;
  for(const b of batches){const index=b.near&&close?0:1;b.mesh.geometry=b.geometries[index];b.mesh.castShadow=b.near&&close&&quality==='high';triangles+=b.triangles[index]*b.count;}
  for(const m of materials){m.emissiveIntensity=m.userData.leaf?(night?.085:.008):0;m.roughness=m.userData.leaf?(rain?.64:.88):(rain?.74:.94);}
  metrics.triangles=triangles;
 }
 const ready=(async()=>{
  const manifest=await(await read('trees.json')).json();
  const [bytes,barkColor,barkNormal,barkRough,...leaves]=await Promise.all([
   read(manifest.buffer).then(r=>r.arrayBuffer()),...['bark-color.jpg','bark-normalgl.jpg','bark-roughness.jpg','ash.webp','aspen.webp','oak.webp','pine.webp'].map(path=>loader.loadAsync(new URL(path,origin).href))
  ]);
  if(disposed)return;
  for(const t of[barkColor,barkNormal,barkRough,...leaves]){t.anisotropy=4;textures.push(t);}
  barkColor.colorSpace=T.SRGBColorSpace;for(const t of[barkColor,barkNormal,barkRough]){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1,5);}
  leaves.forEach(t=>{t.colorSpace=T.SRGBColorSpace;});
  const barkMaterial=new T.MeshStandardMaterial({map:barkColor,normalMap:barkNormal,roughnessMap:barkRough,color:'#9f927f',roughness:.94,normalScale:new T.Vector2(.45,.45)});materials.push(barkMaterial);
  function attribute(a,itemSize){const ctor=a.type==='u16'?Uint16Array:Float32Array;return new T.BufferAttribute(new ctor(bytes,a.offset,a.count),itemSize);}
  function geometry(description){const g=new T.BufferGeometry();for(const[key,size]of[['position',3],['normal',3],['uv',2]])g.setAttribute(key,attribute(description[key],size));g.setIndex(attribute(description.index,1));g.computeBoundingBox();g.computeBoundingSphere();geometries.push(g);return g;}
  const categories=manifest.variants.map(()=>({near:[],far:[]}));
  sites.forEach((s,i)=>{
   const species=String(s.species??'maple'),near=Math.abs(s.x)<39&&s.z>-10&&s.z<45;
   const variant=/cedar|pine|fir/.test(species)?5:/birch|aspen|ginkgo/.test(species)?2:/serviceberry/.test(species)?1:/red/.test(species)?3:[0,1,3,4][i%4];
   categories[variant][near?'near':'far'].push({...s,seed:i});
  });
  const dummy=new T.Object3D(),color=new T.Color();
  manifest.variants.forEach((variant,index)=>{
   const geo=variant.lods.map(l=>({branches:geometry(l.branches),leaves:geometry(l.leaves)}));
   const map=leaves[['ash','aspen','oak','pine'].indexOf(variant.leaf)];
   const leafMaterial=new T.MeshStandardMaterial({map,alphaTest:.45,side:T.DoubleSide,roughness:.88,metalness:0,color:'#ffffff',emissive:'#d7c5a3',emissiveIntensity:.045});leafMaterial.userData.leaf=true;
   leafMaterial.onBeforeCompile=shader=>{
    shader.uniforms.curatedTreeTime=clock;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float curatedTreeTime;').replace('#include <begin_vertex>',`#include <begin_vertex>
      #ifdef USE_INSTANCING
      float treePhase=instanceMatrix[3].x*.31+instanceMatrix[3].z*.23;
      float leafHeight=max(0.,position.y-.12);
      transformed.x+=sin(curatedTreeTime*.78+treePhase+position.y*2.2)*.004*leafHeight;
      transformed.z+=sin(curatedTreeTime*1.13+treePhase+position.x*13.)*.0013*leafHeight;
      #endif`);
    // Rounded crown normals avoid thin cards alternating black and bright when
    // viewed from opposite sides; soft transmission keeps nighttime foliage legible.
    shader.fragmentShader=shader.fragmentShader.replace('normal *= faceDirection;','normal *= 1.0;').replace('#include <opaque_fragment>','outgoingLight += diffuseColor.rgb * 0.022;\n#include <opaque_fragment>');
   };leafMaterial.customProgramCacheKey=()=> 'curated-ez-tree-slow-leaf-sway-v1';materials.push(leafMaterial);
   for(const band of['near','far']){
    const list=categories[index][band];if(!list.length)continue;
    for(const part of['branches','leaves']){
     const mat=part==='branches'?barkMaterial:leafMaterial,mesh=new T.InstancedMesh(geo[1][part],mat,list.length);mesh.name='EZ-Tree / '+variant.id+' / '+band+' / '+part;mesh.receiveShadow=true;
     list.forEach((s,i)=>{
      const spread=Math.max(.3,s.spread??1.5),height=Math.max(1,s.height??4),baseY=s.baseY??s.y??.15;
      dummy.position.set(s.x,baseY,s.z);dummy.rotation.set(0,(s.seed*2.399963)%6.28318,0);dummy.scale.set(spread,height,spread);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
      if(part==='leaves'){color.set(variant.tint);color.offsetHSL((Math.sin(s.seed*12.4))*.018,0,(Math.cos(s.seed*7.1))*.035);mesh.setColorAt(i,color);}
      else mesh.setColorAt(i,color.set(/birch/.test(s.species??'')?'#dad6c5':'#ffffff'));
     });
     mesh.computeBoundingSphere();if(mesh.boundingSphere)mesh.boundingSphere.radius+=.08;group.add(mesh);
     batches.push({mesh,geometries:geo.map(g=>g[part]),triangles:geo.map(g=>g[part].index.count/3),count:list.length,near:band==='near'});
    }
   }
  });
  metrics.loaded=true;metrics.drawCalls=batches.length;apply();onReady();group.visible=true;group.userData.curatedTrees=metrics;return metrics;
 })().catch(error=>{if(!disposed)console.warn('Imported tree canopy unavailable; keeping original planting.',error);return{...metrics,error:String(error)};});
 return{group,ready,metrics,setQuality(mode,currentView='overview'){quality=mode;view=currentView;apply();},setNight(value){night=!!value;apply();},setRain(value){rain=!!value;apply();},update(dt){if(dt>0){time+=Math.min(dt,.1);clock.value=time;}},dispose(){disposed=true;group.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
