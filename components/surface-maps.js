/** Original CC0 scans from Poly Haven; see assets/materials/CREDITS.md. */
export async function loadSurfaceMaps(T){
 const loader=new T.TextureLoader(),sets={};
 await Promise.all([['brick','red_brick_03'],['concrete','plastered_wall_04'],['deck','wood_floor_deck']].map(async([kind,asset])=>{
  try{const textures=await Promise.all(['diff','rough','nor_gl'].map(async(role)=>{const texture=await loader.loadAsync(new URL('../assets/materials/'+asset+'_'+role+'_768.webp',import.meta.url).href);texture.colorSpace=role==='diff'?T.SRGBColorSpace:T.NoColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(kind==='brick'?2:3,kind==='brick'?3:3);texture.anisotropy=8;return texture;}));sets[kind]={map:textures[0],roughnessMap:textures[1],normalMap:textures[2]};}
  catch(error){console.warn('Using procedural '+kind+' surface; scan unavailable.');}
 }));return sets;
}

