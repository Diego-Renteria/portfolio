import {renderMakerCard} from './components/engineering-work.js?v=b477ce33502c';
import {createFrameResize,cameraRainDensity} from './components/frame-resize.js?v=b477ce33502c';
import { THREE as T, createContext } from './components/context.js?v=b477ce33502c';
import { buildTerrain } from './components/terrain.js?v=b477ce33502c';
import { buildSkyline } from './components/skyline.js?v=b477ce33502c';
import { buildStreets } from './components/streets.js?v=b477ce33502c';
import { buildTraffic } from './components/traffic.js?v=b477ce33502c';
import { buildGreenery } from './components/greenery.js?v=b477ce33502c';
import { buildPark } from './components/park.js?v=b477ce33502c';
import { createRenderBudget } from './components/render-budget.js?v=b477ce33502c';
import { buildPortfolio } from './components/portfolio.js?v=b477ce33502c';
import {buildUrbanDetails} from './components/urban-details.js?v=b477ce33502c';
import {createBackdrops} from './components/scene-backdrops.js?v=b477ce33502c';
import {buildRainAtmosphere} from './components/rain-atmosphere.js?v=b477ce33502c';
import {buildCityLighting,createLightingEnvironment} from './components/city-lighting.js?v=b477ce33502c';
import {mountApartmentTV} from './components/apartment-tv.js?v=b477ce33502c';
import {createFurnishedCity} from './components/furnished-city.js?v=b477ce33502c';
import {applyPageAtmosphere,atmosphereHref} from './components/page-atmosphere.js?v=b477ce33502c';
import {loadSurfaceMaps} from './components/surface-maps.js?v=b477ce33502c';
import {createWeatherMaterials} from './components/weather-materials.js?v=b477ce33502c';
import {mountApartmentLighting} from './components/apartment-lighting.js?v=b477ce33502c';
import {mountRecordCard} from './components/record-card.js?v=b477ce33502c';
import {createCuratedTrees} from './components/curated-trees.js?v=b477ce33502c';
import {createCuratedCityAssets,upgradeCitySurfaces} from './components/curated-city-assets.js?v=b477ce33502c';
import {loadImportedTowers} from './components/imported-towers.js?v=b477ce33502c';
const content={music:{k:'04 / THE RECORD STORE',title:'On repeat.',body:''},projects:{k:'01 / THE MAKER SPACE',title:'Projects & Experiences',body:'<p>The places I’ve worked, the things I build, and the thinking that connects them.</p><div class="entry"><h3>Along the way</h3><p>SpaceX · Keysight · Elevate Systems · UTSA</p></div><p>Explore the work and the stories behind it.</p>'},experience:{k:'WORK & EXPERIENCE',title:'Work in progress.',body:'<p>The experience, skills, and decisions that shape my work.</p><div class="entry"><h3>Experience & résumé</h3><p>A space for your roles, education, and downloadable résumé.</p></div><p class="placeholder">Content awaiting your résumé.</p>'},about:{k:'02 / ABOVE THE CITY',title:'A little more me.',body:'<p>I’m Diego. I like cities that make you want to turn another corner, soccer, time outdoors, and the Pacific Northwest in fall.</p><div class="entry"><h3>Outside the studio</h3><span class="tag">Cities & skylines</span><span class="tag">Soccer</span><span class="tag">Hiking</span><span class="tag">Music</span></div><p class="placeholder">A starting sketch based on what you’ve shared. We’ll make this more personal together.</p>'},lately:{k:'03 / THE LIBRARY',title:'On the side.',body:'<p>Books, passages, and ideas that stay with me.</p><div class="entry"><h3>On the bookshelf</h3><p>What you’re reading and the ideas that stay with you.</p></div><div class="entry"><h3>Out & about</h3><p>Hikes, city walks, photographs, and little discoveries.</p></div>'}};

const host=document.querySelector('#scene'),panel=document.querySelector('#panel');
let currentView='overview',currentPlace=null,navigate=()=>{},setHovered=()=>{},recordCardCleanup=null;
document.body.dataset.view=currentView;
function syncHeader(){const header=document.querySelector('header'),hidden=currentView==='block';header.inert=hidden;header.setAttribute('aria-hidden',String(hidden));}
function openPlace(id){
  recordCardCleanup?.();recordCardCleanup=null;
  const c=content[id];currentPlace=id;panel.dataset.place=id;panel.dataset.number=c.k.match(/^\d+/)?.[0]||'↗';
  document.querySelector('#panel-kicker').textContent=c.k;document.querySelector('#panel-title').textContent=c.title;
  const page=({projects:'projects',experience:'experience',about:'about',lately:'library',music:'music'})[id]+'.html';
  document.querySelector('#panel-body').innerHTML=c.body+'<a class="page-link" href="'+atmosphereHref(page,document.documentElement.dataset.atmosphere)+'">Go to the page <span>↗</span></a>';
  if(id==='music')recordCardCleanup=mountRecordCard(document.querySelector('#panel-body'));
  if(id==='projects')document.querySelector('#panel-body').innerHTML=renderMakerCard();
  panel.hidden=false;currentView='place';document.body.dataset.view=currentView;document.querySelector('#reset').hidden=false;
  syncHeader();setHovered(null);navigate('place',id);document.querySelector('#close').focus({preventScroll:true});
}
function viewBlock(){recordCardCleanup?.();recordCardCleanup=null;panel.hidden=true;currentPlace=null;currentView='block';document.body.dataset.view=currentView;syncHeader();document.querySelector('#reset').hidden=false;document.querySelector('#view-caption').textContent='A LITTLE CORNER OF MY WORLD';document.querySelector('#view-hint').textContent='Choose a building to look inside.';setHovered(null);navigate('block');document.querySelector('#reset').focus({preventScroll:true});}
function overview(){recordCardCleanup?.();recordCardCleanup=null;panel.hidden=true;currentPlace=null;currentView='overview';document.body.dataset.view=currentView;syncHeader();document.querySelector('#reset').hidden=true;document.querySelector('#view-caption').textContent='A CITY OF MY OWN';document.querySelector('#view-hint').textContent='Start downtown. Stay a while.';setHovered(null);navigate('overview');document.querySelector('#explore').focus({preventScroll:true});}
document.querySelectorAll('[data-place]').forEach(b=>{b.onclick=()=>openPlace(b.dataset.place);for(const e of['pointerenter','focus'])b.addEventListener(e,()=>setHovered(b.dataset.place));for(const e of['pointerleave','blur'])b.addEventListener(e,()=>setHovered(null));});
document.querySelector('#explore').onclick=viewBlock;document.querySelector('#reset').onclick=overview;document.querySelector('.brand').onclick=e=>{e.preventDefault();overview()};document.querySelector('#close').onclick=viewBlock;
const blockLabel=document.querySelector('#block-label');blockLabel.onclick=viewBlock;for(const e of['pointerenter','focus'])blockLabel.addEventListener(e,()=>setHovered('block'));for(const e of['pointerleave','blur'])blockLabel.addEventListener(e,()=>setHovered(null));
document.addEventListener('keydown',e=>{if(e.key==='Escape')currentView==='place'?viewBlock():overview()});
try{
  const scene=new T.Scene(),world=new T.Group();scene.add(world);const ctx=createContext(world,await loadSurfaceMaps(T));
  let lightingPreview=false;
  const camera=new T.PerspectiveCamera(34,1,.6,1000),renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.domElement.dataset.build='b477ce33502c';host.appendChild(renderer.domElement);
  const selectEnvironment=createLightingEnvironment(T,renderer,scene);selectEnvironment('night');scene.environmentIntensity=.65;
  const nightEnvironmentReady=selectEnvironment.loadNightScan().then(()=>{renderer.domElement.dataset.nightEnvironment='scan';}).catch(error=>{renderer.domElement.dataset.nightEnvironment='fallback';console.warn('Keeping fallback night environment',error);});
  const hemi=new T.HemisphereLight('#d6e6ef','#625a43',.68);scene.add(hemi);
  const sun=new T.DirectionalLight('#ffd7a6',3.5);sun.position.set(-175,225,200);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-190,right:190,top:170,bottom:-170,near:1,far:850});sun.shadow.bias=-.00012;sun.shadow.normalBias=.022;scene.add(sun);sun.target.position.set(0,0,11);scene.add(sun.target);
  const fill=new T.DirectionalLight('#bdd3e1',.22);fill.position.set(90,65,-70);scene.add(fill);
  const terrain=buildTerrain(ctx),skyline=buildSkyline(ctx),streets=buildStreets(ctx),park=buildPark(ctx),greenery=buildGreenery(ctx),systems=[terrain,skyline,streets,park,greenery];
  const traffic=buildTraffic(ctx,{carCount:208,perimeterCars:48}),urban=buildUrbanDetails(ctx);systems.push(traffic,urban);const portfolio=buildPortfolio(ctx);systems.push(portfolio);
  const rainAtmosphere=buildRainAtmosphere(ctx);systems.push(rainAtmosphere);
  const lighting=buildCityLighting(ctx,streets.lampSites);systems.push(lighting);
  rainAtmosphere.setLampSites(streets.lampSites);
  const weatherMaterials=createWeatherMaterials();for(const g of[terrain.group,skyline.group,streets.group,park.group])weatherMaterials.register(g);
  const furnishedCity=createFurnishedCity({THREE:T,renderer,scene,ctx,skyline});systems.push(furnishedCity);
  async function prepareCityInteriors(){
    renderer.domElement.dataset.interiors='preparing';
    const started=performance.now();
    try{
      await furnishedCity.setEnabled(true);
      renderer.domElement.dataset.interiors='on';
      renderer.domElement.dataset.interiorRoomTypes=String(furnishedCity.catalog.length);
      renderer.domElement.dataset.interiorPreparationMs=String(Math.round(performance.now()-started));
    }catch(error){console.error('City interiors could not load',error);renderer.domElement.dataset.interiors='unavailable';}
  }
  // Warm occupied rooms remain visible in afternoon, without changing the time of day.
  ctx.glowMaterials.forEach(m=>m.emissiveIntensity=m.userData.afternoonEmission??.38);skyline.setNight?.(false);
  function applyRenderProfile(mode,profile){renderer.setPixelRatio(Math.min(devicePixelRatio,profile.pixelRatioCap));if(sun.shadow.mapSize.x!==profile.shadowSize){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(profile.shadowSize,profile.shadowSize);renderer.shadowMap.needsUpdate=true;}systems.forEach(s=>s?.setQuality?.(mode,currentView));renderer.domElement.dataset.quality=mode;renderer.domElement.dataset.pixelRatio=String(renderer.getPixelRatio());}
  const renderBudget=createRenderBudget({onChange:applyRenderProfile,fixed:new URLSearchParams(location.search).get('quality')});applyRenderProfile(renderBudget.mode,renderBudget.profile);let qualityView=currentView;
  function focusShadows(view){const close=view!=='overview',c=sun.shadow.camera;Object.assign(c,{left:close?-58:-190,right:close?58:190,top:close?53:170,bottom:close?-53:-170});sun.target.position.set(0,close?6:0,11);c.updateProjectionMatrix();sun.shadow.normalBias=close?.012:.022;sun.shadow.bias=close?-.000055:-.00012;renderer.shadowMap.needsUpdate=true;}
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),sg=sc.createRadialGradient(64,64,4,64,64,64);sg.addColorStop(0,'rgba(54,67,58,.18)');sg.addColorStop(.65,'rgba(54,67,58,.05)');sg.addColorStop(1,'rgba(54,67,58,0)');sc.fillStyle=sg;sc.fillRect(0,0,128,128);const shadow=new T.Mesh(new T.PlaneGeometry(400,300),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-76,11);scene.add(shadow);
  const rainFog=new T.FogExp2('#1a2c3c',0);scene.fog=rainFog;
  const dayEmissions=new Map(ctx.glowMaterials.map(m=>[m,m.emissiveIntensity]));
  const selectBackdrop=createBackdrops(T,scene);function chooseBackdrop(id){id=selectBackdrop(id);applyPageAtmosphere(id);const night=id!=='sky',rain=id==='rain';document.body.dataset.backdrop=id;renderer.domElement.dataset.backdrop=id;lighting.setAtmosphere(id);selectEnvironment(id);sun.castShadow=!night;sun.color.set(night?'#9ebde7':'#ffd7a6');sun.intensity=rain?.045:night?.10:3.5;hemi.color.set(night?'#9db8df':'#d6e6ef');hemi.groundColor.set(night?'#50617d':'#625a43');hemi.intensity=rain?.62:night?.78:.68;fill.color.set(night?'#799ed4':'#bdd3e1');fill.intensity=rain?.30:night?.38:.22;scene.environmentIntensity=selectEnvironment.intensity(id);renderer.toneMappingExposure=rain?1.06:night?1.12:1.04;for(const[m,value]of dayEmissions)m.emissiveIntensity=value*(night?3:1);systems.forEach(s=>s?.setNight?.(night));greenery.setRain?.(rain);urban.setRain?.(rain);weatherMaterials.setRain(rain);rainAtmosphere.setRain(rain);document.querySelectorAll('button[data-backdrop]').forEach(b=>{const active=b.dataset.backdrop===id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});try{localStorage.setItem('diego-city-backdrop',id)}catch{}}
  chooseBackdrop('night');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,target=new T.Vector3(0,-2,11),wantedTarget=target.clone(),eye=new T.Vector3(285,205,355),wantedEye=eye.clone();let viewShift=.10,wantedShift=.10,viewLift=0,wantedLift=0,wantedFov=34,wantedNear=5;
  const apartmentTV=mountApartmentTV({THREE:T,host,renderer,screen:portfolio.interiors[0].cinemaScreen,reduced,highlight:portfolio.highlights.about.uniform});
  const anchors=portfolio.anchors;const anchor=id=>anchors[id==='experience'?'about':id];
  navigate=(view,id)=>{const mobile=host.clientWidth<700;wantedFov=34;wantedNear=view==='overview'?(mobile?15:5):.5;camera.far=2000;wantedLift=mobile&&view==='place'?.19:0;if(view==='overview'){wantedTarget.set(0,-2,11);wantedEye.set(mobile?790:285,mobile?570:205,mobile?1000:355);wantedShift=mobile?0:.10;}else if(view==='block'){wantedTarget.set(0,10.4,12);wantedEye.set(1.5,14,49);wantedFov=T.MathUtils.radToDeg(2*Math.atan(31/(wantedEye.distanceTo(wantedTarget)*camera.aspect)));wantedShift=0;}else{const place=portfolio.viewTargets[id==='experience'?'about':id],center=place.center,nominalDistance=Math.max(21,place.height*1.9)*(mobile?1.6:1),distance=Math.min(27,nominalDistance);wantedFov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(17))*nominalDistance/distance));wantedTarget.copy(center);wantedTarget.z=16;wantedEye.set(center.x+distance*.10,center.y+distance*.10,17+distance);wantedShift=lightingPreview?0:mobile?0:-.15;}};
  const hoverTarget=new T.Vector3(),hoverValue=new T.Vector3();
  const islandHover=new T.Mesh(new T.BoxGeometry(316,120,232),new T.MeshBasicMaterial());islandHover.position.set(0,24,11);islandHover.visible=false;world.add(islandHover);
  const blockProxy=new T.Mesh(new T.BoxGeometry(45,24,15),new T.MeshBasicMaterial());blockProxy.position.set(0,12,11);blockProxy.visible=false;world.add(blockProxy);
  const blockHalo=new T.Mesh(new T.PlaneGeometry(45,15),new T.MeshBasicMaterial({color:'#e9b76f',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));blockHalo.rotation.x=-Math.PI/2;blockHalo.position.set(0,.24,11);world.add(blockHalo);
  let hovered=null;setHovered=id=>{hovered=id==='experience'?'about':id;renderer.domElement.dataset.highlight=hovered||'';document.querySelectorAll('[data-anchor]').forEach(b=>b.classList.toggle('is-hovered',b.dataset.anchor===hovered));blockLabel.classList.toggle('is-hovered',hovered==='block');};
  const ray=new T.Raycaster(),pointer=new T.Vector2(),clickables=portfolio.clickables;
  function hit(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);if(currentView==='overview')return ray.intersectObject(blockProxy).length?'block':null;let obj=ray.intersectObjects(clickables,true)[0]?.object;while(obj&&!obj.userData.place)obj=obj.parent;return obj?.userData.place;}
  renderer.domElement.addEventListener('pointermove',e=>{const id=hit(e);setHovered(id);if(!reduced&&currentView!=='place'){const over=currentView==='block'||ray.intersectObject(islandHover).length>0,close=currentView==='block';hoverTarget.set(over?pointer.y*(close?.004:.012):0,over?pointer.x*(close?.008:.025):0,over?(close?.003:.018):0);}renderer.domElement.style.cursor=id?'pointer':'default';});
  renderer.domElement.addEventListener('pointerleave',()=>{setHovered(null);hoverTarget.set(0,0,0)});renderer.domElement.addEventListener('click',e=>{const id=hit(e);if(id)id==='block'?viewBlock():openPlace(id)});
  const frameResize=createFrameResize({renderer,host,onResize(width,height){rainAtmosphere.setViewport(width,height);camera.aspect=width/height;navigate(currentView,currentPlace);}});
  window.addEventListener('resize',frameResize.invalidate);new ResizeObserver(frameResize.invalidate).observe(host);
  if(new URLSearchParams(location.search).get('view')==='block')viewBlock();const requestedCard=new URLSearchParams(location.search).get('card');if(['music','projects'].includes(requestedCard))openPlace(requestedCard);frameResize.flush();eye.copy(wantedEye);target.copy(wantedTarget);camera.position.copy(eye);camera.lookAt(target);camera.near=wantedNear;camera.fov=wantedFov;camera.updateProjectionMatrix();
  await nightEnvironmentReady;await renderer.compileAsync(scene,camera);document.querySelector('#loading').remove();const startedAt=performance.now();let last=startedAt,elapsed=0;const labelButtons=[...document.querySelectorAll('[data-anchor]')],projected=new T.Vector3();
  // Prepare the furnished façades progressively after the first city frame.
  void prepareCityInteriors();
  // Imports enhance an already visible city; a failed asset keeps its fallback.
  renderer.domElement.dataset.curatedAssets='loading';
  const legacyTrees=[];greenery.group.traverse(o=>{if(/^(tapered-tree-branches-|fine-tree-twigs-|individually-folded-maple-leaves|distant-folded-autumn-leaves|fine-autumn-sprigs)/.test(o.name))legacyTrees.push(o);});
  urban.edgePlanting.group.traverse(o=>{if(/^Perimeter \/ (wood|maple|birch|ginkgo|cedar)$/.test(o.name))legacyTrees.push(o);});
  let treesReady=false;const hideLegacy=()=>{if(treesReady)for(const o of legacyTrees)o.visible=false;};
  const importedTrees=createCuratedTrees(T,world,[...greenery.treeSites,...urban.edgePlanting.treeSites.map(s=>({...s,baseY:.03}))],{onReady(){treesReady=true;hideLegacy();}});
  const treeQuality=importedTrees.setQuality;importedTrees.setQuality=(mode,view)=>{treeQuality(mode,view);hideLegacy();};systems.push(importedTrees);importedTrees.setQuality(renderBudget.mode,currentView);importedTrees.setNight(true);
  const curatedAssets=createCuratedCityAssets(ctx,portfolio,terrain);systems.push(curatedAssets);curatedAssets.setQuality(renderBudget.mode,currentView);
  renderer.domElement.dataset.signatureBuildings=String(skyline.signatureArchitecture.designs.length);
  void loadImportedTowers(T,skyline.signatureArchitecture).ready.then(installed=>{renderer.domElement.dataset.importedTowers=String(installed.length);});
  void Promise.all([curatedAssets.ready,importedTrees.ready,upgradeCitySurfaces(ctx)]).then(()=>{renderer.domElement.dataset.curatedAssets=curatedAssets.metrics.failed||!importedTrees.metrics.loaded?'partial':'ready';renderer.domElement.dataset.curatedObjects=String(curatedAssets.metrics.instances);renderer.domElement.dataset.curatedTrees=String(importedTrees.metrics.trees);renderer.domElement.dataset.curatedModels=String(curatedAssets.metrics.loaded);}).catch(error=>{console.warn('Some enhancements are unavailable',error);renderer.domElement.dataset.curatedAssets='partial';});
  void mountApartmentLighting(portfolio.apartmentLighting,{onPreview({atmosphere}){
    lightingPreview=true;chooseBackdrop(atmosphere);currentPlace='about';currentView='place';document.body.dataset.view=currentView;panel.hidden=true;syncHeader();navigate('place','about');wantedShift=0;wantedLift=0;
  }});
  function placeLabel(button,point,visible,gap=20){projected.copy(point).applyMatrix4(world.matrixWorld).project(camera);const hw=button.offsetWidth/2+10;button.style.left=Math.max(hw,Math.min(host.clientWidth-hw,(projected.x*.5+.5)*host.clientWidth))+'px';button.style.top=Math.max(button.offsetHeight+20,(-projected.y*.5+.5)*host.clientHeight-gap)+'px';button.style.visibility=visible&&projected.z<1?'visible':'hidden';}
  function frame(now){requestAnimationFrame(frame);frameResize.flush();const frameMs=now-last,dt=Math.min(frameMs/1000,.05);last=now;elapsed+=dt;renderBudget.sample(frameMs,now-startedAt,!document.hidden&&eye.distanceToSquared(wantedEye)<.01&&target.distanceToSquared(wantedTarget)<.01);if(qualityView!==currentView){qualityView=currentView;focusShadows(currentView);systems.forEach(s=>s?.setQuality?.(renderBudget.mode,currentView));}if(currentView==='place'||reduced)hoverTarget.set(0,0,0);hoverValue.lerp(hoverTarget,reduced?1:1-Math.exp(-dt*5));world.rotation.set(hoverValue.x,hoverValue.y,0);world.scale.setScalar(1+hoverValue.z);world.updateMatrixWorld(true);renderer.domElement.dataset.hover=hoverValue.toArray().map(v=>v.toFixed(4)).join(',');
    const smoothing=reduced?1:1-Math.exp(-dt*3.5);target.lerp(wantedTarget,smoothing);eye.lerp(wantedEye,smoothing);viewShift+=(wantedShift-viewShift)*smoothing;viewLift+=(wantedLift-viewLift)*smoothing;rainFog.density=cameraRainDensity(eye.distanceTo(target),document.body.dataset.backdrop);camera.position.copy(eye);camera.lookAt(target);camera.fov+=(wantedFov-camera.fov)*smoothing;camera.near+=(wantedNear-camera.near)*smoothing;camera.setViewOffset(host.clientWidth,host.clientHeight,-host.clientWidth*viewShift,host.clientHeight*viewLift,host.clientWidth,host.clientHeight);camera.updateMatrixWorld();
    for(const b of labelButtons){const a=anchor(b.dataset.anchor).clone();placeLabel(b,a,currentView==='block');}placeLabel(blockLabel,new T.Vector3(0,27,11),currentView==='overview');
    const leader=document.querySelector('#block-leader');leader.style.visibility=currentView==='overview'?'visible':'hidden';projected.set(-8.3,8,17).applyMatrix4(world.matrixWorld).project(camera);const line=leader.querySelector('line'),tip=leader.querySelector('circle');line.setAttribute('x1',parseFloat(blockLabel.style.left));line.setAttribute('y1',parseFloat(blockLabel.style.top));line.setAttribute('x2',(projected.x*.5+.5)*host.clientWidth);line.setAttribute('y2',(-projected.y*.5+.5)*host.clientHeight);tip.setAttribute('cx',line.getAttribute('x2'));tip.setAttribute('cy',line.getAttribute('y2'));
    const emphasis=hovered==='block';blockHalo.material.opacity+=((emphasis?.065:0)-blockHalo.material.opacity)*(reduced?1:1-Math.exp(-dt*8));
    portfolio.setHighlight?.(emphasis?'block':hovered);
    for(const s of systems)s?.update?.(reduced?0:dt,elapsed);selectBackdrop.update(reduced?0:dt,camera.aspect);apartmentTV.update(camera,currentView,currentPlace);renderer.render(scene,camera);if(Math.floor(elapsed)%3===0){renderer.domElement.dataset.frameMs=renderBudget.averageMs.toFixed(2);renderer.domElement.dataset.drawCalls=renderer.info.render.calls;renderer.domElement.dataset.triangles=renderer.info.render.triangles;renderer.domElement.dataset.camera=eye.toArray().map(v=>v.toFixed(2)).join(',');}
  }requestAnimationFrame(frame);
  document.body.dataset.cityEdition='original';renderer.domElement.dataset.cityEdition='original';

}catch(error){console.error(error);document.querySelector('#loading')?.remove();document.querySelector('#error').hidden=false;}


