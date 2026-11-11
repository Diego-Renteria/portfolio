import * as T from './three.module.js?v=b477ce33502c';
import {SKIES,createAtlasSky,createOrbitalShips} from './components/atlas-sky.js?v=atlas-1';
import {RADIUS,buildAtlasCity,disposeAtlasCity} from './components/atlas-world.js?v=atlas-1';

const $=id=>document.getElementById(id);
const container=$('atlas-scene'),status=$('atlas-status');
const globeURL='index.html?view=block';
const configs={
  sea:{
    name:'Seattle',summary:'Pike Place, the downtown hills, and the piers of Elliott Bay.',
    center:[-122.3379,47.6071],angle:-.49,
    places:[
      ['market','Pike Place Market',-122.34019,47.60880,'The Public Market Center sign looks down Pike Street toward the Market’s main arcade.'],
      ['wheel','Great Wheel',-122.3424999,47.6061669,'The waterfront wheel stands on Pier 57, above Elliott Bay.'],
      ['library','Central Library',-122.33262,47.60671,'Seattle’s Central Library occupies the block between Fourth and Fifth avenues.'],
      ['block','Diego’s block',-122.33829,47.60778,'Enter the fictional portfolio block to explore the Maker Space, apartment, library, and record store.'],
    ],
  },
  nyc:{
    name:'Lower Manhattan',summary:'From Wall and Broad through Stone Street to the East River.',
    center:[-74.00995,40.7062],angle:.67,
    places:[
      ['exchange','Wall & Broad',-74.01020,40.70713,'The Stock Exchange and Federal Hall face the historic junction of Wall and Broad streets.'],
      ['stone','Stone Street',-74.0104174,40.7042693,'The narrow, cobbled stretch is part of the Stone Street Historic District.'],
      ['seaport','South Street Seaport',-74.00399,40.70655,'The old waterfront district meets the East River here, near Fulton Street and the Seaport piers.'],
      ['block','Diego’s block',-74.00985,40.70543,'Enter the fictional portfolio block to explore the Maker Space, apartment, library, and record store.'],
    ],
  },
};

function local(config,lng,lat){
  return [(lng-config.center[0])*111320*Math.cos(config.center[1]*Math.PI/180),(config.center[1]-lat)*111132];
}
function maps(lng,lat){return 'https://www.google.com/maps/search/?api=1&query='+lat+','+lng;}
function locationText(lng,lat){return lat.toFixed(5)+'°, '+lng.toFixed(5)+'°';}

function landmarks(city,id,config){
  const group=new T.Group(),up=new T.Vector3(0,1,0);
  const objectAt=(key,yaw=0,height=.5)=>{
    const place=config.places.find(p=>p[0]===key),[x,z]=local(config,place[2],place[3]);
    const holder=new T.Group();holder.position.copy(city.point(x,z,height));
    holder.quaternion.setFromUnitVectors(up,holder.position.clone().normalize());
    holder.rotateY(yaw);group.add(holder);return holder;
  };
  const mesh=(holder,geometry,material,x,y,z)=>{
    const object=new T.Mesh(geometry,material);object.position.set(x,y,z);holder.add(object);return object;
  };
  const plaque=(holder,words,background,ink,width,y)=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
    const g=canvas.getContext('2d');g.fillStyle=background;g.fillRect(0,0,256,64);
    g.strokeStyle=ink;g.lineWidth=3;g.strokeRect(4,4,248,56);
    g.fillStyle=ink;g.font='bold 26px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(words,128,33,236);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    mesh(holder,new T.PlaneGeometry(width,width*.25),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}),0,y,.30);
  };
  const metal=new T.MeshStandardMaterial({color:'#7c8e97',metalness:.53,roughness:.46});
  const warm=new T.MeshBasicMaterial({color:'#ffdaa3'});
  let wheel;
  if(id==='sea'){
    const wheelBase=objectAt('wheel',-.58,2.5);
    const radius=25.5;
    wheel=new T.Group();wheel.position.y=radius+2;wheelBase.add(wheel);
    for(const y of [-1,1]){
      const ring=mesh(wheel,new T.TorusGeometry(radius,.34,5,60),metal,0,0,y*1.12);
      ring.material=metal;
    }
    for(let i=0;i<16;i++){
      const angle=i/16*2*Math.PI,x=Math.cos(angle),y=Math.sin(angle);
      const spoke=mesh(wheel,new T.BoxGeometry(radius,.24,.24),metal,x*radius*.5,y*radius*.5,0);
      spoke.rotation.z=angle;
      const cabin=mesh(wheel,new T.BoxGeometry(2.6,2.2,2),warm,x*radius,y*radius,0);cabin.rotation.z=-angle;
    }
    for(const x of [-1,1]){
      const brace=mesh(wheelBase,new T.CylinderGeometry(.58,.70,32,7),metal,x*6.5,14,0);
      brace.rotation.z=x*.40;
    }
    const market=objectAt('market',.82,3.6),canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
    const context=canvas.getContext('2d');
    context.clearRect(0,0,512,128);
    context.textAlign='center';context.textBaseline='middle';context.font='bold 37px Arial';
    context.shadowColor='#f54a35';context.shadowBlur=13;context.fillStyle='#ff7b5d';context.fillText('PUBLIC MARKET',256,40);
    context.font='bold 26px Arial';context.fillText('CENTER',256,78);
    context.beginPath();context.arc(390,82,14,0,Math.PI*2);context.strokeStyle='#ffd9c0';context.lineWidth=3;context.stroke();
    context.beginPath();context.moveTo(390,73);context.lineTo(390,82);context.lineTo(396,86);context.stroke();
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    mesh(market,new T.PlaneGeometry(17,4.25),new T.MeshBasicMaterial({map:texture,transparent:true,side:T.DoubleSide,depthWrite:false}),0,7,0);
    for(const x of [-1,1])mesh(market,new T.BoxGeometry(.20,7,.24),metal,x*6.4,3.4,0);
  }else{
    const hall=objectAt('exchange',-.58,2.6);
    const stone=new T.MeshStandardMaterial({color:'#c3ad86',roughness:.83});
    for(let i=0;i<7;i++)mesh(hall,new T.CylinderGeometry(.48,.58,5.8,12),stone,-6.2+i*1.9,3.3,0);
    mesh(hall,new T.BoxGeometry(13.9,.68,1.9),stone,-.5,6.4,0);
    mesh(hall,new T.BoxGeometry(14.6,.65,2.5),stone,-.5,.45,.45);
    plaque(hall,'FEDERAL HALL','#252c2c','#d7bd8f',5.6,2.8);
    const street=objectAt('stone',.55);
    mesh(street,new T.CylinderGeometry(.07,.09,3.7,6),metal,0,1.8,0);
    plaque(street,'STONE STREET','#293b35','#e1dcca',2.5,3.35);
  }
  city.group.add(group);
  return {update(time){if(wheel)wheel.rotation.z=time*.036;}};
}

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene=new T.Scene();
const camera=new T.PerspectiveCamera(35,1,8,8500),aim=new T.Vector3(0,158,0);
scene.add(new T.HemisphereLight('#d8e7ff','#37404b',1.62));
const moon=new T.DirectionalLight('#dbe9ff',2.0);moon.position.set(-850,1800,1450);scene.add(moon);
const amber=new T.DirectionalLight('#edb48a',.65);amber.position.set(1000,900,-970);scene.add(amber);
const sky=createAtlasSky($('atlas-sky'),$('atlas-fx')),ships=createOrbitalShips(()=>{dirty=true;});
const select=$('sky-select');
select.replaceChildren(...SKIES.map(([id,name])=>new Option(name,id)));
const initial=new URLSearchParams(location.search);
let cityId='',city,features,landmarksFX,loadSequence=0,focused=null,skyId='';
let yaw=-.49,polar=.84,zoom=3300,realYaw=yaw,realPolar=polar,realZoom=zoom;
let width=1,height=1,small=false;
let dirty=true,renderer;
const target=new T.Vector3(0,158,0);
const pinList=[],dataCache=new Map();
const globeCenter=new T.Vector3(),projected=new T.Vector3(),raycaster=new T.Raycaster();

function updateQuery(){
  const url=new URL(location.href);
  if(cityId)url.searchParams.set('city',cityId);
  url.searchParams.set('sky',skyId);
  history.replaceState(null,'',url);
}
function chooseSky(id){
  const item=SKIES.find(option=>option[0]===id)??SKIES[0];
  skyId=item[0];select.value=skyId;$('sky-description').textContent=item[2];
  sky.select(skyId);ships.select(skyId);document.body.dataset.sky=skyId;
  $('sky-on-city').href='index.html?sky='+skyId;
  updateQuery();dirty=true;
}
function reset(snap=false){
  const defaultAngle=configs[cityId]?.angle??-.49;
  yaw=defaultAngle;polar=.70;zoom=small?4060:3300;
  target.set(0,190,0);
  if(snap){realYaw=yaw;realPolar=polar;realZoom=zoom;aim.copy(target);}
  focused=null;$('atlas-inspector').hidden=true;dirty=true;
}
function zoomBy(factor){zoom=T.MathUtils.clamp(zoom*factor,140,4450);dirty=true;}

function inspect(name,type,detail,href,linkText='Open in Google Maps ↗'){
  $('inspector-name').textContent=name;
  $('inspector-type').textContent=type;
  $('inspector-detail').textContent=detail;
  const link=$('inspector-link');link.href=href;link.textContent=linkText;
  link.target=href.startsWith('https:')?'_blank':'_self';link.rel=href.startsWith('https:')?'noopener':'';
  $('atlas-inspector').hidden=false;
}

function focusPlace(place){
  if(!city)return;
  const [key,name,lng,lat,detail]=place,[x,z]=local(configs[cityId],lng,lat);
  focused=key;
  target.copy(city.point(x,z,key==='wheel'?16:12));
  yaw=configs[cityId].angle;
  polar=cityId==='sea'?1.20:1.01;
  zoom=small?510:405;
  inspect(name,key==='block'?'Portfolio destination':'Landmark',detail,key==='block'?globeURL:maps(lng,lat),key==='block'?'Enter the portfolio block ↗':undefined);
  dirty=true;
}

function buildPinList(){
  pinList.length=0;$('atlas-pins').replaceChildren();$('atlas-places').replaceChildren();
  const config=configs[cityId];
  for(const place of config.places){
    const [id,name,lng,lat]=place,[x,z]=local(config,lng,lat),pin=document.createElement('button'),button=document.createElement('button');
    pin.type=button.type='button';pin.className='atlas-pin';
    pin.textContent=button.textContent=name;
    pin.addEventListener('pointerdown',event=>event.stopPropagation());
    pin.addEventListener('click',()=>focusPlace(place));button.addEventListener('click',()=>focusPlace(place));
    $('atlas-pins').append(pin);$('atlas-places').append(button);
    pinList.push({pin,id,point:city.point(x,z,id==='wheel'?53:22)});
  }
}

async function chooseCity(id){
  if(!Object.hasOwn(configs,id))return;
  const sequence=++loadSequence;
  $('city-name').textContent=configs[id].name;
  $('city-summary').textContent=configs[id].summary;
  for(const button of document.querySelectorAll('[data-city]'))button.setAttribute('aria-pressed',String(button.dataset.city===id));
  if(cityId===id&&city){status.hidden=true;return;}
  status.hidden=false;status.textContent='Loading '+configs[id].name+'…';
  try{
    if(!dataCache.has(id)){
      const file=await fetch(new URL('assets/atlas/'+id+'.json?v=atlas-1',import.meta.url));
      if(!file.ok)throw new Error('Map data unavailable');
      dataCache.set(id,await file.json());
    }
    if(sequence!==loadSequence)return;
    features=dataCache.get(id);
    const next=buildAtlasCity(features),detail=landmarks(next,id,configs[id]);
    if(city){scene.remove(city.group);disposeAtlasCity(city);}
    city=next;landmarksFX=detail;cityId=id;
    scene.add(city.group);
    buildPinList();reset(true);updateQuery();
    document.body.dataset.city=id;
    status.hidden=true;
  }catch(error){
    if(sequence!==loadSequence)return;
    status.textContent='The map could not load. Try choosing the city again.';
    console.error(error);
  }
}

function inspectBuilding(event){
  if(!city||realZoom>1500)return;
  const rect=container.getBoundingClientRect();
  const pointer=new T.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  const first=raycaster.intersectObject(city.buildings)[0];
  if(!first)return;
  const id=city.buildings.userData.buildingAtFace(first.faceIndex);
  if(id===undefined)return;
  const [height,,ring,,name,use,method]=features.buildings[id];
  const [x,z]=ring[0],config=configs[cityId];
  const lng=config.center[0]+x/(111320*Math.cos(config.center[1]*Math.PI/180));
  const lat=config.center[1]-z/111132;
  const description=(use&&use!=='yes'?use.replaceAll('_',' ')+' · ':'')+
    (method===2?'Mapped roof height ':method===1?'Height from floor count ':'Estimated height ')+Math.round(height)+' m · '+locationText(lng,lat);
  inspect(name||'Mapped building','Building footprint',description,maps(lng,lat));
}

let drag=null;
container.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('button'))return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw,polar,moved:false};
  container.setPointerCapture(event.pointerId);container.classList.add('is-dragging');
});
container.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<5)return;
  drag.moved=true;
  yaw=drag.yaw-dx*.006;
  polar=T.MathUtils.clamp(drag.polar-dy*.005,.10,2.72);dirty=true;
});
for(const name of ['pointerup','pointercancel'])container.addEventListener(name,event=>{
  if(!drag||drag.id!==event.pointerId)return;
  if(name==='pointerup'&&!drag.moved)inspectBuilding(event);
  drag=null;container.classList.remove('is-dragging');
});
container.addEventListener('wheel',event=>{
  event.preventDefault();zoomBy(Math.exp(event.deltaY*.0013));
},{passive:false});
container.addEventListener('keydown',event=>{
  const changes={ArrowLeft:[-.16,0],ArrowRight:[.16,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]};
  if(changes[event.key]){
    event.preventDefault();const [a,b]=changes[event.key];yaw+=a;polar=T.MathUtils.clamp(polar+b,.10,2.72);dirty=true;
  }else if(event.key==='+'||event.key==='=')zoomBy(.80);
  else if(event.key==='-')zoomBy(1.25);
  else if(event.key==='Home'){event.preventDefault();reset();}
});
$('zoom-in').onclick=()=>zoomBy(.77);
$('zoom-out').onclick=()=>zoomBy(1.30);
$('reset-atlas').onclick=()=>reset();
$('close-inspector').onclick=()=>{$('atlas-inspector').hidden=true;focused=null;};
document.querySelectorAll('[data-city]').forEach(button=>button.addEventListener('click',()=>void chooseCity(button.dataset.city)));
select.addEventListener('change',()=>chooseSky(select.value));

function resize(){
  const wasSmall=small;
  width=Math.max(1,container.clientWidth);height=Math.max(1,container.clientHeight);
  small=width<650;
  camera.aspect=width/height;camera.updateProjectionMatrix();
  renderer.setSize(width,height,false);sky.resize(width,height);
  if(small!==wasSmall&&zoom>2400)reset(true);
  dirty=true;
}

function projectPins(){
  const cameraDirection=camera.position.clone().sub(globeCenter);
  for(const {id,pin,point} of pinList){
    projected.copy(point).project(camera);
    const facing=point.dot(cameraDirection)>RADIUS*RADIUS*.86;
    const left=(projected.x*.5+.5)*width,top=(.5-projected.y*.5)*height;
    const outside=left<width*(small?.10:.27)||left>width*.91||top<height*(small?.39:.14)||top>height*.83;
    pin.hidden=!facing||outside||projected.z>1||(realZoom>1450&&id!=='block'&&!focused)||focused&&id!==focused;
    pin.style.left=left+'px';pin.style.top=top+'px';pin.setAttribute('aria-pressed',String(id===focused));
  }
}
function render(now){
  requestAnimationFrame(render);
  if(!city||document.hidden||reduced&&!dirty)return;
  const dt=reduced?1:.11;
  const time=reduced?0:now*.001;
  aim.lerp(target,dt);
  realYaw=T.MathUtils.lerp(realYaw,yaw,dt);realPolar=T.MathUtils.lerp(realPolar,polar,dt);realZoom=T.MathUtils.lerp(realZoom,zoom,dt);
  const direction=new T.Vector3(Math.sin(realPolar)*Math.sin(realYaw),Math.cos(realPolar),Math.sin(realPolar)*Math.cos(realYaw));
  camera.position.copy(aim).addScaledVector(direction,realZoom);camera.lookAt(aim);
  const close=1-T.MathUtils.smoothstep(realZoom,820,2350);
  camera.fov=35+(small?20*(1-close):0);
  const shift=small?0:.14*(1-close);
  const lift=small?-.18*(1-close):.015*(1-close);
  camera.setViewOffset(width,height,-width*shift,height*lift,width,height);
  camera.updateMatrixWorld();
  sky.render(time,reduced);landmarksFX.update(time);
  renderer.clear();
  ships.render(renderer,width/height,time,reduced);
  renderer.render(scene,camera);
  projectPins();dirty=false;
}
try{
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
  renderer.setClearColor(0,0);renderer.autoClear=false;renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.93;
  $('atlas-render').append(renderer.domElement);
  new ResizeObserver(resize).observe(container);resize();
  chooseSky(initial.get('sky'));
  void chooseCity(initial.get('city')==='nyc'?'nyc':'sea');
  requestAnimationFrame(render);
}catch(error){
  console.error(error);status.textContent='The 3D atlas needs a browser with WebGL support.';
}
