import {GLTFLoader} from '../vendor/loaders/GLTFLoader.js?v=b477ce33502c';

// Real scanned objects are loaded after the first frame. Shared meshes/maps keep
// repeated objects cheap; the close-up set stays out of the distant render.
export function createCuratedCityAssets(ctx,portfolio,terrain){
 const {THREE:T}=ctx,loader=new GLTFLoader(),inside=new T.Group(),outside=new T.Group();
 inside.name='Scanned furniture and workshop equipment';outside.name='Scanned island outcrops and park furniture';portfolio.group.add(inside);ctx.world.add(outside);
 let view='overview',mode='high';const metrics={loaded:0,instances:0,failed:0};
 function apply(){inside.visible=view!=='overview';outside.visible=true;}
 const matrix=new T.Matrix4(),position=new T.Vector3(),rotation=new T.Quaternion(),scale=new T.Vector3();
 function clearZone(id,x,y,z,width,depth,height){
  const roots=[...portfolio.interiors,...portfolio.detailLayers].filter(r=>r.group?.userData.destination===id||r.group?.name?.toLowerCase().includes(({projects:'maker',about:'apartment',lately:'library',music:'record'})[id]));
  function contained(px,py,pz){return Math.abs(px-x)<width/2&&Math.abs(pz-z)<depth/2&&py>y+.12&&py<y+height;}
  for(const root of roots)root.group.traverse(mesh=>{
   if(!mesh.isMesh||mesh.isLight)return;
   if(mesh.isInstancedMesh){for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);if(contained(position.x,position.y,position.z)&&Math.max(scale.x,scale.z)<3){scale.set(0,0,0);matrix.compose(position,rotation,scale);mesh.setMatrixAt(i,matrix);}}mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
   else if(contained(mesh.position.x,mesh.position.y,mesh.position.z)){mesh.geometry.computeBoundingBox();const size=mesh.geometry.boundingBox.getSize(new T.Vector3()).multiply(mesh.scale);if(Math.max(size.x,size.y,size.z)<2.9)mesh.visible=false;}
  });
 }
 const placements={
  mid_century_lounge_chair:[
   {id:'about',x:-9.75,y:.48,z:13.55,w:.92,angle:.1,clear:[1.08,1.35,1.45]},
   {id:'about',x:-8.6,y:.48,z:13.55,w:.92,angle:-.1,clear:[1.08,1.35,1.45]},
   {id:'about',x:-7.1,y:13.13,z:14.7,w:1.05,angle:-.25,clear:[1.55,1.7,1.6]},
   {id:'lately',x:10.63,y:.43,z:11.27,w:1,angle:-.18,clear:[1.1,1.5,1.6]}
  ],
  metal_tool_chest:[{id:'projects',x:-19.25,y:.38,z:11.2,w:1.1,angle:0,clear:[1.4,1,1.3]},{id:'projects',x:-14.8,y:4.2,z:8,w:1,angle:0,clear:[1.3,1,1.2]}],
  steel_frame_shelves_03:[{id:'projects',x:-18.9,y:.38,z:6.3,w:2.15,angle:0,clear:[2.5,1.15,2.6]},{id:'projects',x:-14.7,y:4.2,z:6.5,w:1.9,angle:0,clear:[2.2,1.1,2.3]}],
  wooden_bookshelf_worn:[{id:'lately',x:11.5,y:.43,z:9,w:1.25,angle:-Math.PI/2,clear:[.95,1.6,2.5]},{id:'about',x:-10.8,y:5.995,z:8.2,w:1.1,angle:Math.PI/2,clear:[.85,1.4,1.9]}],
  boombox:[{id:'music',x:19.7,y:1.28,z:9.1,w:.83,angle:-.12,clear:[1,.5,.7]}],
  modular_street_seating:[{x:-16.6,y:.225,z:38.15,w:2.2,angle:0},{x:9.8,y:.225,z:38.35,w:2.2,angle:.06}]
 };
 const ready=(async()=>{
  const response=await fetch(new URL('../assets/curated/manifest.json',import.meta.url));if(!response.ok)throw Error('Asset catalog unavailable');const catalog=await response.json();
  for(const entry of catalog.assets){
   try{
    if(entry.type==='texture-atlas'){
     const texture=await new T.TextureLoader().loadAsync(new URL('../'+entry.covers,import.meta.url).href);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
     const cover=new T.MeshStandardMaterial({map:texture,roughness:.7}),paper=new T.MeshStandardMaterial({color:'#ded3b7',roughness:.95}),display=new T.Group(),oak=ctx.material('#8f6b4a','wood');
     const top=new T.Mesh(new T.BoxGeometry(1.4,.075,1.22),oak);top.position.set(9.22,4.65,7.06);display.add(top);
     for(const dx of[-.58,.58])for(const dz of[-.48,.48]){const leg=new T.Mesh(new T.BoxGeometry(.055,.77,.055),oak);leg.position.set(9.22+dx,4.23,7.06+dz);display.add(leg);}inside.add(display);portfolio.registerImported('lately',display);
     for(let i=0;i<8;i++){
      const id=i<6?'lately':'about',root=new T.Group(),g=new T.PlaneGeometry(.36,.48),uv=g.attributes.uv,index=i%6,col=index%3,row=Math.floor(index/3);
      for(let j=0;j<uv.count;j++)uv.setXY(j,(uv.getX(j)+col)/3,(uv.getY(j)+1-row)/2);
      const jacket=new T.Mesh(g,cover),pages=new T.Mesh(new T.BoxGeometry(.34,.46,.045),paper);jacket.position.z=.024;root.add(pages,jacket);root.rotation.x=-Math.PI/2;root.rotation.z=(i%3-.7)*.17;
      root.position.set(i<6?8.8+(i%3)*.42:-9.5+(i-6)*.43,i<6?4.714:6.94,i<6?6.8+Math.floor(i/3)*.52:12.35);if(i>=6)root.rotation.x-=.16;inside.add(root);portfolio.registerImported(id,root);metrics.instances++;
     }
     metrics.loaded++;continue;
    }
    const gltf=await loader.loadAsync(new URL('../'+entry.path,import.meta.url).href),original=gltf.scene;
    original.traverse(mesh=>{if(!mesh.isMesh)return;mesh.castShadow=true;mesh.receiveShadow=true;for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material]){m.envMapIntensity=1.15;for(const t of[m.map,m.normalMap,m.roughnessMap,m.metalnessMap])if(t){t.anisotropy=4;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;}}});
    original.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(original),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
    const list=entry.id==='rock_face_01'?terrain.contour.filter((_,i)=>i%32===4).map((p,i)=>({x:p.x*.985,y:-7-i%3*3,z:p.y*.985,w:12+i%3*3,angle:Math.atan2(p.x,p.y),rock:true})):placements[entry.id]||[];
    for(const p of list){
     if(p.clear)clearZone(p.id,p.x,p.y,p.z,...p.clear);
     const root=new T.Group(),model=original.clone(true),factor=p.w/size.x;model.position.set(-center.x,-bounds.min.y,-center.z);const normalized=new T.Group();normalized.add(model);normalized.scale.setScalar(factor);root.add(normalized);root.position.set(p.x,p.y,p.z);root.rotation.y=p.angle;root.name=entry.id+' / '+(p.id||'landscape');root.userData.curatedAsset=entry.id;
     (p.id?inside:outside).add(root);if(p.id)portfolio.registerImported(p.id,root);metrics.instances++;
    }
    if(entry.id==='modular_street_seating'){
     // Retire only the two matching park benches, including their individual slats.
     const park=ctx.world.children.find(g=>g.name==='Woodland stream and reading garden');park?.traverse(mesh=>{if(!mesh.isInstancedMesh)return;for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);if((Math.abs(position.x+16.6)<1.2&&Math.abs(position.z-38.15)<.4||Math.abs(position.x-9.8)<1.2&&Math.abs(position.z-38.35)<.4)&&position.y>.25&&position.y<1.4){scale.set(0,0,0);matrix.compose(position,rotation,scale);mesh.setMatrixAt(i,matrix);}}mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();});
    }
    metrics.loaded++;apply();await new Promise(resolve=>setTimeout(resolve,30));
   }catch(error){metrics.failed++;console.warn('Keeping original objects for '+entry.id,error);}
  }
  return metrics;
 })();
 return{inside,outside,ready,metrics,setQuality(next,current='overview'){mode=next;view=current;apply();}};
}

export async function upgradeCitySurfaces(ctx){
 const T=ctx.THREE,loader=new T.TextureLoader();
 return Promise.all([['geology','rock_01',1.5],['asphalt','asphalt_track',2],['gravel','leaf_scattered_gravel',.7],['soil','brown_mud_leaves_01',1.2]].map(async([kind,id,repeat])=>{
  const textures=await Promise.all(['diff','normal','rough'].map(async role=>{const t=await loader.loadAsync(new URL('../assets/curated/surfaces/'+id+'_'+role+'.webp',import.meta.url).href);t.colorSpace=role==='diff'?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=8;return t;}));
  const seen=new Set();ctx.world.traverse(mesh=>{if(!mesh.isMesh)return;for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material]){if(seen.has(m)||m.userData.surface!==kind)continue;seen.add(m);m.map=textures[0];m.normalMap=textures[1];m.roughnessMap=textures[2];m.bumpMap=null;m.normalScale.setScalar(kind==='geology'?.65:.32);m.needsUpdate=true;}});return{kind,materials:seen.size};
 }));
}
