import {buildCityRoom,roomCatalog} from './city-room-catalog.js?v=b477ce33502c';
import {createRoomAtlasCache} from './room-atlas-cache.js?v=b477ce33502c';

/** Capture on demand; reuse a browser-local atlas on later visits. */
export function createFurnishedCity({THREE:T,renderer,scene,ctx,skyline,cache=createRoomAtlasCache(),yieldFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve))}){
 const uniforms=skyline.facadeMaterials.map(m=>m.userData.cityInteriors),programs=skyline.designMetadata.map(b=>({id:b.id,...b.interiorProgram}));
 let target=null,pending=null,enabled=false,night=false,ready=false,progressListener=null;
 function sync(){for(const u of uniforms){u.enabled.value=enabled&&ready?1:0;u.night.value=night?1:0;u.atlas.value=ready?target?.texture||null:null;}}
 function valid(record){return (record?.width===384||record?.width===768)&&record?.height===record.width*8&&record?.pixels instanceof Uint8Array&&record.pixels.length===record.width*record.height*4&&record.height<=renderer.capabilities.maxTextureSize;}
 async function remember(atlas){
  if(!renderer.readRenderTargetPixelsAsync)return;
  try{const pixels=new Uint8Array(atlas.width*atlas.height*4);await renderer.readRenderTargetPixelsAsync(atlas,0,0,atlas.width,atlas.height,pixels);await cache.save({width:atlas.width,height:atlas.height,pixels});}catch{/* Cache failure leaves the rendered atlas usable. */}
 }
 async function prepare(){
  const savedAtlas=await cache.load();if(!enabled)return false;
  if(valid(savedAtlas)){
   const texture=new T.DataTexture(savedAtlas.pixels,savedAtlas.width,savedAtlas.height,T.RGBAFormat,T.UnsignedByteType);
   texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;
   target={texture,width:savedAtlas.width,height:savedAtlas.height,dispose:()=>texture.dispose()};ready=true;sync();progressListener?.(1);return true;
  }
  // 128px per face is ample for city windows. Avoid the old 192px atlas
  // and its 2.25x pixel cost on high-end GPUs; small GPUs use 64px faces.
  const tile=renderer.capabilities.maxTextureSize>=6144?128:64,rows=roomCatalog.length*2;
  target=new T.WebGLRenderTarget(tile*6,tile*rows,{depthBuffer:true,minFilter:T.LinearMipmapLinearFilter,magFilter:T.LinearFilter,generateMipmaps:false});target.texture.name='24 detailed city rooms / daylight and lamplight';
  const camera=new T.PerspectiveCamera(90,1,.02,12);camera.position.set(0,1.25,0);
  const directions=[[[1,0,0],[0,1,0]],[[-1,0,0],[0,1,0]],[[0,1,0],[0,0,1]],[[0,-1,0],[0,0,-1]],[[0,0,1],[0,1,0]],[[0,0,-1],[0,1,0]]];
  try{
   for(let id=0;id<roomCatalog.length;id++){
    if(!enabled)return false;
    const room=buildCityRoom(ctx,id);room.scene.environment=scene.environment;room.scene.environmentIntensity=.2;
    try{await renderer.compileAsync?.(room.scene,camera);for(let mood=0;mood<2;mood++){
     room.setNight(Boolean(mood));
     for(let face=0;face<6;face++){
      if(!enabled)return false;
      const[d,up]=directions[face];camera.up.set(...up);camera.lookAt(new T.Vector3(...d).add(camera.position));
      // Restore renderer state before each yield so the city stays interactive.
      const saved={target:renderer.getRenderTarget(),viewport:renderer.getViewport(new T.Vector4()),scissor:renderer.getScissor(new T.Vector4()),scissorTest:renderer.getScissorTest(),autoClear:renderer.autoClear,shadow:renderer.shadowMap.enabled,color:renderer.getClearColor(new T.Color()),alpha:renderer.getClearAlpha()};
      try{
       renderer.shadowMap.enabled=false;renderer.autoClear=false;renderer.setClearColor('#10191b',1);target.scissorTest=true;
       if(id===roomCatalog.length-1&&mood===1&&face===5)target.texture.generateMipmaps=true;
       target.viewport.set(face*tile,(id+mood*roomCatalog.length)*tile,tile,tile);target.scissor.set(face*tile,(id+mood*roomCatalog.length)*tile,tile,tile);renderer.setRenderTarget(target);renderer.clear();renderer.render(room.scene,camera);
      }finally{renderer.setRenderTarget(saved.target);renderer.setViewport(saved.viewport);renderer.setScissor(saved.scissor);renderer.setScissorTest(saved.scissorTest);renderer.autoClear=saved.autoClear;renderer.shadowMap.enabled=saved.shadow;renderer.setClearColor(saved.color,saved.alpha);}
      progressListener?.((id*12+mood*6+face+1)/(roomCatalog.length*12));await yieldFrame();
     }
    }}finally{room.dispose();}
   }
   ready=true;sync();void remember(target);return true;
  }finally{if(!ready){target?.dispose();target=null;sync();}}
 }
 return{programs,catalog:roomCatalog,registerArchitecture(architecture){for(const m of architecture.facadeMaterials){const u=m.userData.cityInteriors;if(u&&!uniforms.includes(u))uniforms.push(u);}sync();},get ready(){return ready;},get enabled(){return enabled;},get atlas(){return target;},async setEnabled(value,onProgress){
  enabled=Boolean(value);progressListener=enabled?onProgress:null;sync();if(!enabled)return false;
  try{while(enabled&&!ready){if(!pending)pending=prepare().finally(()=>{pending=null;});await pending;}sync();return enabled;}
  catch(error){enabled=false;sync();throw error;}
 },setNight(value){night=Boolean(value);sync();}};
}
