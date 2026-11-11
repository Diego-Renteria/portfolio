import {GLTFLoader} from '../vendor/loaders/GLTFLoader.js?v=b477ce33502c';

const parcels={'glass-office-tower':[-39,-11],'mixed-use-high-rise':[42,-11]};
export function towerParcelFit(size,parcel){
 const scale=Math.min((parcel.width-.22)/size.x,(parcel.depth-.22)/size.z,parcel.height/size.y);
 if(!Number.isFinite(scale)||scale<=0||size.y*scale<14)throw Error('Tower does not fit the reserved parcel');
 return scale;
}
async function readGLB(url){
 const response=await fetch(url);if(!response.ok)throw Error('Tower download failed: '+response.status);
 const bytes=await response.arrayBuffer();
 // Some static servers decode gzip automatically; accept both representations.
 if(bytes.byteLength>=12&&new DataView(bytes).getUint32(0,true)===0x46546c67)return bytes;
 const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
 return new Response(stream).arrayBuffer();
}
export function loadImportedTowers(T,architecture){
 const catalog=new URL('../assets/curated/buildings/',import.meta.url),version=new URL(import.meta.url).search,loader=new GLTFLoader(),installed=[];
 const ready=(async()=>{
  const response=await fetch(new URL('manifest.json'+version,catalog));if(!response.ok)throw Error('Tower catalog unavailable');
  const {assets}=await response.json();
  for(const entry of assets){
   try{
    const site=parcels[entry.id];if(!site)continue;
    const parcel=architecture.designs.find(p=>Math.abs(p.x-site[0])<.01&&Math.abs(p.z-site[1])<1);if(!parcel)continue;
    const bytes=await readGLB(new URL(entry.file+version,catalog));
    const {scene}=await loader.parseAsync(bytes,catalog.href);scene.updateMatrixWorld(true);
    const bounds=new T.Box3().setFromObject(scene,true),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=towerParcelFit(size,parcel);
    scene.position.x-=center.x;scene.position.y-=bounds.min.y;scene.position.z-=center.z;
    scene.traverse(mesh=>{if(!mesh.isMesh)return;mesh.castShadow=!mesh.material.transparent;mesh.receiveShadow=true;for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material]){m.envMapIntensity=.9;for(const t of[m.map,m.normalMap,m.roughnessMap,m.metalnessMap,m.emissiveMap])if(t){t.anisotropy=4;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;}}});
    const normalized=new T.Group(),root=new T.Group();normalized.scale.setScalar(scale);normalized.add(scene);root.add(normalized);root.position.set(parcel.x,.035,parcel.z);root.name=entry.title;root.userData.importedTower=entry.id;
    await new Promise(resolve=>requestAnimationFrame(resolve));architecture.replaceAddress(parcel,root);parcel.importedModel=entry.id;installed.push(entry.id);
   }catch(error){console.warn('Keeping custom tower at '+entry.id,error);}
  }
  return installed;
 })().catch(error=>{console.warn('Keeping the custom skyline',error);return installed;});
 return{ready,installed};
}
