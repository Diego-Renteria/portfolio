// Optional browser-local cache; unavailable storage must never hold up the city.
// Bump the key when room geometry, materials or capture settings change.
export function createRoomAtlasCache(database=globalThis.indexedDB){
 const key='detailed-rooms-v2-128';
 function access(mode,value){return new Promise(resolve=>{
  if(!database)return resolve(null);
  let db,done=false;const finish=result=>{if(done)return;done=true;clearTimeout(timer);db?.close();resolve(result);};
  const timer=setTimeout(()=>finish(null),mode==='readonly'?400:3000);
  try{const open=database.open('diego-city-rooms',1);
   open.onupgradeneeded=()=>open.result.createObjectStore('atlas');
   open.onerror=open.onblocked=()=>finish(null);
   open.onsuccess=()=>{db=open.result;if(done){db.close();return;}try{
    const tx=db.transaction('atlas',mode),store=tx.objectStore('atlas');let result=null;
    const request=mode==='readonly'?store.get(key):store.put(value,key);
    request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>finish(result);tx.onerror=tx.onabort=()=>finish(null);
   }catch{finish(null);}};
  }catch{finish(null);}
 });}
 return{load:()=>access('readonly'),save:value=>access('readwrite',value)};
}
