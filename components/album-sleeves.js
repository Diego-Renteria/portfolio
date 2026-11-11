import {ALBUM_ATLAS,ALBUM_INVENTORY} from './album-inventory.js?v=b477ce33502c';
let sharedTexture;
// Face-out shop curation only; the complete Music-page collection is unchanged.
export const STORE_ALBUM_SWAPS={65:12,36:11,54:4,94:3};
export function albumTexture(T){
 if(!sharedTexture){
  sharedTexture=new T.Texture();sharedTexture.colorSpace=T.SRGBColorSpace;sharedTexture.anisotropy=8;
  // Headless geometry checks don't require a browser or image requests.
  if(typeof window!=='undefined')new T.ImageLoader().load(new URL('../assets/music/collection-atlas.webp',import.meta.url).href,image=>{sharedTexture.image=image;sharedTexture.needsUpdate=true;});
 }
 return sharedTexture;
}
export function albumSleeves(T,faces,name='Albums from Diego’s collection'){
 const positions=[],normals=[],uvs=[],indices=[],q=new T.Vector3(),axis=new T.Vector3(1,0,0),{columns,rows,tile,gutter}=ALBUM_ATLAS;
 for(const face of faces){
  const index=STORE_ALBUM_SWAPS[face.index]??face.index%ALBUM_INVENTORY.length,offset=positions.length/3,col=index%columns,row=Math.floor(index/columns),tilt=face.tilt??0;
  for(const[u,v]of[[0,0],[1,0],[1,1],[0,1]]){
   q.set((u-.5)*face.size,(v-.5)*face.size,0).applyAxisAngle(axis,tilt);
   positions.push(q.x+face.position[0],q.y+face.position[1],q.z+face.position[2]);normals.push(0,-Math.sin(tilt),Math.cos(tilt));
   uvs.push((col+(gutter+(tile-gutter*2)*u)/tile)/columns,(rows-1-row+(gutter+(tile-gutter*2)*v)/tile)/rows);
  }indices.push(offset,offset+1,offset+2,offset,offset+2,offset+3);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeBoundingSphere();
 const material=new T.MeshStandardMaterial({map:albumTexture(T),roughness:.78,metalness:0});material.name='Diego’s actual album sleeves';
 const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.receiveShadow=true;mesh.userData.albumIds=faces.map(f=>ALBUM_INVENTORY[STORE_ALBUM_SWAPS[f.index]??f.index%ALBUM_INVENTORY.length].id);return mesh;
}
