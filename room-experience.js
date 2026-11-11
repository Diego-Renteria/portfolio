import * as T from './three.module.js?v=b477ce33502c';
import {applyPageAtmosphere} from './components/page-atmosphere.js?v=b477ce33502c';
import {mountApartmentTV} from './components/apartment-tv.js?v=b477ce33502c';
import {ROOMS,UI_STYLES,TRACK_ID,entriesFor,turntableEntry} from './components/room-catalog.js?v=rooms-1';
import {buildRoom,disposeRoom,createTVScreen} from './components/room-scene.js?v=rooms-1';

const kind=document.body.dataset.room,info=ROOMS[kind],entries=entriesFor(kind);
const root=document.querySelector('#room-content'),$=id=>document.getElementById(id);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const arrow='<span aria-hidden="true">↗</span>';
const query=new URLSearchParams(location.search),requested=Number(query.get('room'));
let preset=Number.isInteger(requested)&&requested>=1&&requested<=10?requested-1:0;
let style=UI_STYLES.some(([id])=>id===query.get('glass'))?query.get('glass'):'pearl';
let shelf=0,active=null,room,renderer,screen,player,tv,returnFocus;
let stageVisible=true;
let catalog=new Map(),collectionOffset=0,roomMotion=!reduced,width=1,height=1;
const stageOptions=kind==='music'?`
  <div class="room-actions">
    <button type="button" id="shelf-back" aria-label="Previous record crate">←</button>
    <span id="shelf-count"></span>
    <button type="button" id="shelf-next" aria-label="Next record crate">→</button>
    <button type="button" id="open-deck">Turntable</button>
  </div>`:'';
const featuredLabel=kind==='about'?'Around the apartment':kind==='library'?'Reading shelf':kind==='maker'?'Project benches':'The collection';
const alternateLink=kind==='maker'?'<a href="projects.html">View the engineering portfolio '+arrow+'</a>':kind==='music'?'<a href="index.html?card=music">Favorites card '+arrow+'</a>':'<a href="#room-collection">Browse below ↓</a>';

root.innerHTML=`
  <div class="room-wrap">
    <div class="room-utility"><a href="index.html?view=block">← Back to the block</a>${alternateLink}</div>
    <div class="room-intro">
      <div><p class="room-eyebrow">${info.name}</p><h1>${info.heading}</h1><p class="room-lead">${info.intro}</p></div>
      <div class="room-options">
        <label>Room design <select id="room-design">${info.presets.map((name,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${name}</option>`).join('')}</select></label>
        <label>Glass style <select id="glass-style">${UI_STYLES.map(([id,name],i)=>`<option value="${id}">${String(i+1).padStart(2,'0')} · ${name}</option>`).join('')}</select></label>
      </div>
    </div>
    <section class="room-frame" aria-label="${info.name} interior">
      <div class="room-stage" id="room-stage">
        <p id="room-loading" class="room-loading" role="status">Setting up the room…</p>
        <div class="room-pin-layer" id="room-pins"></div>
        <span class="room-leader" id="room-leader" aria-hidden="true" hidden></span>
        <aside id="room-glass" class="room-glass" aria-labelledby="glass-title" hidden>
          <button class="glass-close" id="glass-close" type="button" aria-label="Close object details">×</button>
          <div id="glass-content"></div>
        </aside>
      </div>
      <div class="room-footer">
        <span id="room-hint">${info.hint}</span>
        ${stageOptions}
        <div class="room-actions">
          <button type="button" id="room-reset" hidden>Back to room</button>
          <button type="button" id="room-motion" aria-pressed="${!roomMotion}">${roomMotion?'Pause motion':'Resume motion'}</button>
        </div>
      </div>
      ${kind==='music'?`<div class="room-footer"><span class="room-song">Now spinning <strong>Fade Into You · Mazzy Star</strong></span><div class="room-actions"><button type="button" id="play-music">Play</button><a href="https://open.spotify.com/track/${TRACK_ID}" target="_blank" rel="noopener">Spotify ${arrow}</a></div><span id="audio-status" class="room-audio-status" role="status"></span></div><div id="room-audio" class="room-audio"></div>`:''}
    </section>
  </div>
  <section class="room-paper" id="room-collection" aria-labelledby="collection-title">
    <div class="room-wrap">
      <h2 id="collection-title">${featuredLabel}</h2>
      <p>${{about:'The objects in the room are another way to get to know me.',library:'A place for current reads, recommendations, and notes as I add them.',music:'Browse the full collection and pull any record into the room.',maker:'The tabletop models are studies based on my portfolio photos. The case studies include the actual builds.'}[kind]}</p>
      <div class="room-collection">
        ${kind==='music'?'<label>Find a record <input id="collection-search" type="search" placeholder="Album or artist"></label>':''}
        ${kind==='library'?'<label>Show <select id="book-filter"><option value="">All books</option><option>Reading list</option><option>Recommendations</option><option>Notes</option></select></label>':''}
        <span id="collection-status" role="status"></span>
      </div>
      <div class="room-grid" id="room-grid"></div>
      ${kind==='music'?'<div class="room-collection"><button type="button" id="collection-prev">Previous records</button><button type="button" id="collection-next">Next records</button></div>':''}
      <div class="room-lists"><a href="about.html">Apartment ${arrow}</a><a href="library.html">Library ${arrow}</a><a href="music.html">Record Store ${arrow}</a><a href="makerspace.html">Maker Space ${arrow}</a></div>
    </div>
  </section>
  <div class="room-wrap room-foot"><a href="assets/room-references.md">Room design and asset references</a></div>`;
applyPageAtmosphere('night');

const stage=$('room-stage'),glass=$('room-glass'),glassContent=$('glass-content'),pins=$('room-pins');
const camera=new T.PerspectiveCamera(38,1,.06,70),scene=new T.Scene();
const eye=new T.Vector3(),aim=new T.Vector3(),wantedEye=new T.Vector3(),wantedAim=new T.Vector3();
const projected=new T.Vector3(),position=new T.Vector3(),ray=new T.Raycaster(),pointer=new T.Vector2();
const pinRecords=[];
const primaryEntry=()=>kind==='maker'?entries[1]:entries[0];

function href(url,label){return `<a href="${esc(url)}"${url.startsWith('https:')?' target="_blank" rel="noopener"':''}>${esc(label)} ${arrow}</a>`;}
function albumArt(entry){
  const x=(entry.index%12)/11*100,y=Math.floor(entry.index/12)/9*100;
  return `<div class="room-art" role="img" aria-label="${esc(entry.title)} cover" style="background-position:${x}% ${y}%"></div>`;
}
function cover(entry){
  if(entry.cover)return `<img src="${esc(entry.cover)}" alt="${esc(entry.title)} cover" loading="lazy">`;
  return `<div class="room-book" style="--book-color:${esc(entry.color)}" aria-label="Book cover placeholder">${String(entry.number).padStart(2,'0')}</div>`;
}
function imageFor(entry){
  if(entry.kind==='record')return albumArt(entry);
  if(entry.kind==='book')return cover(entry);
  if(entry.kind==='project')return `<img src="assets/projects/${esc(entry.image)}.webp" alt="${esc(entry.imageAlt)}" loading="lazy">`;
  if(entry.kind==='photo')return `<div class="room-placeholder">${esc(entry.slot)} placeholder</div>`;
  return '';
}
function detail(entry){
  if(entry.kind==='project'){
    return `<div class="glass-kinds" role="group" aria-label="Project story">
      <button type="button" data-story="what" aria-pressed="true">What</button><button type="button" data-story="how" aria-pressed="false">How</button><button type="button" data-story="results" aria-pressed="false">Results</button>
      </div><p id="story-text">${esc(entry.challenge)}</p><p>Tabletop model based on portfolio photos.</p>
      ${href('projects.html?project='+encodeURIComponent(entry.id),'Open case study')}`;
  }
  if(entry.kind==='book'){
    return `<p><strong>${entry.author?esc(entry.author):'Book placeholder'}</strong></p><p><strong>My notes</strong> · ${esc(entry.thoughts||'To be added')}</p><p><strong>Rating</strong> · ${entry.rating==null?'To be added':esc(entry.rating)+' / 5'}</p><p><strong>Recommended for</strong> · ${esc(entry.recommendedFor||'To be added')}</p>`;
  }
  if(entry.kind==='record'){
    const known=catalog.get(entry.id),url=known?.spotify??'https://open.spotify.com/search/'+encodeURIComponent(entry.title+' '+entry.artist);
    return `<p>${esc(entry.artist)}${known?.year?' · '+esc(known.year):''}</p>${href(url,'Find on Spotify')}${known?.apple?href(known.apple,'Apple Music'):''}`;
  }
  if(entry.kind==='deck')return `<p>${esc(entry.artist)} · Favorite song</p>${href('https://open.spotify.com/track/'+TRACK_ID,'Listen on Spotify')}`;
  return `<p>${esc(entry.text)}</p>${entry.link?href(entry.link[1],entry.link[0]):''}`;
}
function paintPanel(entry){
  const art=imageFor(entry);
  glassContent.innerHTML=`<p class="room-eyebrow">${esc(entry.category)}</p><h2 id="glass-title">${esc(entry.title)}</h2>
    <div class="glass-grid${art?' has-image':''}">${art?`<figure class="glass-image">${art}</figure>`:''}<div class="glass-detail">${detail(entry)}</div></div>`;
  if(entry.kind==='project'){
    const text={what:entry.challenge,how:entry.approach.map(([title,value])=>title+'. '+value).join(' '),results:entry.outcome};
    for(const button of glassContent.querySelectorAll('[data-story]'))button.onclick=()=>{
      $('story-text').textContent=text[button.dataset.story];
      for(const other of glassContent.querySelectorAll('[data-story]'))other.setAttribute('aria-pressed',String(other===button));
    };
  }
}
function remember(){
  const url=new URL(location.href);url.searchParams.set('room',preset+1);url.searchParams.set('glass',style);
  history.replaceState(null,'',url);
}
function setStyle(value,preview=false){
  style=value;document.body.dataset.glass=style;$('glass-style').value=style;
  $('glass-style').title=UI_STYLES.find(([id])=>id===style)[2];
  if(preview&&!active)show(primaryEntry(),false);
}
function layoutRoom(){
  const previous=room;
  if(previous){if(screen)screen.removeFromParent();scene.remove(previous.world);disposeRoom(previous,screen);}
  room=buildRoom(kind,preset,{screen,musicPage:shelf});
  scene.add(room.world);
  pins.replaceChildren();pinRecords.length=0;
  for(const target of room.targets.values()){
    if(!target.label&&!target.screen)continue;
    const button=document.createElement('button');button.className='room-pin';button.type='button';
    button.textContent=target.screen?'TV':target.entry.kind==='deck'?'Turntable':target.entry.title;
    button.setAttribute('aria-label',target.screen?'Focus on the TV':target.entry.title);
    button.addEventListener('click',()=>show(target.entry,true,button));
    pins.append(button);pinRecords.push({button,target});
  }
  if(kind==='music')$('shelf-count').textContent=`Crate ${shelf+1} of ${Math.ceil(entries.length/12)}`;
  stage.dataset.roomDesign=String(preset+1);
  updateShot();
}
function updateShot(){
  if(!room)return;
  const subject=active&&room.targets.get(active.id);
  const narrow=width/height<1.05;
  camera.fov=narrow?47:36;
  if(!subject){
    wantedEye.fromArray(room.camera);
    wantedAim.set(0,1.53,-.97);
    if(narrow)wantedEye.z+=2.40;
  }else if(subject.screen){
    screen.updateWorldMatrix(true,false);
    const p=screen.getWorldPosition(new T.Vector3()),forward=new T.Vector3(0,0,1).transformDirection(screen.matrixWorld);
    wantedAim.copy(p).add(new T.Vector3(.05,.03,.02));
    wantedEye.copy(p).addScaledVector(forward,narrow?5.25:5.35).add(new T.Vector3(.45,-.10,.02));
  }else{
    subject.object.updateWorldMatrix(true,false);
    const p=subject.object.localToWorld(subject.anchor.clone());
    const side=Math.sign(room.camera[0]);
    wantedAim.copy(p).add(new T.Vector3(0,-.08,0));
    wantedEye.copy(p).add(new T.Vector3(side*(narrow?.95:1.65),.74,narrow?4.1:3.72));
    const inside=room.profile.width/2-.45;
    wantedEye.x=T.MathUtils.clamp(wantedEye.x,-inside,inside);
  }
  camera.updateProjectionMatrix();
}
function clearSelection(focus=true){
  active=null;glass.hidden=true;$('room-leader').hidden=true;$('room-reset').hidden=true;stage.dataset.selected='';
  updateShot();
  if(focus&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
  returnFocus=null;
}
function show(entry,focus=true,origin=null){
  if(!entry)return;
  if(kind==='music'&&entry.kind==='record'&&!room?.targets.has(entry.id)&&renderer){
    shelf=Math.floor(entry.index/12);layoutRoom();
  }
  active=entry;returnFocus=origin;
  glass.hidden=false;$('room-reset').hidden=false;stage.dataset.selected=entry.id;
  paintPanel(entry);updateShot();
  if(entry.kind==='tv')tv?.play();
  if(entry.kind==='deck'&&focus)playMusic();
  if(focus)$('glass-close').focus({preventScroll:true});
}
function buildCollection(){
  let list=entries;
  const filter=$('book-filter')?.value;
  const search=$('collection-search')?.value.trim().toLowerCase();
  if(filter)list=list.filter(item=>item.category===filter);
  if(search)list=list.filter(item=>(item.title+' '+item.artist).toLowerCase().includes(search));
  const chunk=kind==='music'?16:list.length,page=list.slice(collectionOffset,collectionOffset+chunk);
  $('room-grid').innerHTML=page.map(entry=>`<button type="button" class="room-item" data-entry="${esc(entry.id)}">${imageFor(entry)}<strong>${esc(entry.title)}</strong><small>${esc(entry.artist||entry.category)}</small></button>`).join('');
  $('collection-status').textContent=kind==='music'&&list.length?`${collectionOffset+1}–${collectionOffset+page.length} of ${list.length} records`:`${list.length} ${kind==='library'?'books':'items'}`;
  if(kind==='music'){
    $('collection-prev').disabled=collectionOffset===0;
    $('collection-next').disabled=collectionOffset+chunk>=list.length;
  }
}
$('room-grid').addEventListener('click',event=>{
  const button=event.target.closest('[data-entry]');if(!button)return;
  show(entries.find(item=>item.id===button.dataset.entry),true,button);
  stage.scrollIntoView({block:'center',behavior:reduced?'instant':'smooth'});
});
for(const id of ['collection-search','book-filter'])$(id)?.addEventListener(id==='book-filter'?'change':'input',()=>{collectionOffset=0;buildCollection();});
$('collection-prev')?.addEventListener('click',()=>{collectionOffset=Math.max(0,collectionOffset-16);buildCollection();});
$('collection-next')?.addEventListener('click',()=>{collectionOffset+=16;buildCollection();});
$('room-design').value=preset;
$('room-design').addEventListener('change',()=>{
  const previous=active;clearSelection(false);preset=Number($('room-design').value);if(renderer)layoutRoom();
  if(previous)show(previous,false);
  remember();
});
$('glass-style').addEventListener('change',()=>{setStyle($('glass-style').value,true);remember();});
$('glass-close').onclick=()=>clearSelection();
$('room-reset').onclick=()=>clearSelection();
$('room-motion').onclick=()=>{
  roomMotion=!roomMotion;$('room-motion').textContent=roomMotion?'Pause motion':'Resume motion';
  $('room-motion').setAttribute('aria-pressed',String(!roomMotion));
};
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active)clearSelection();});
function switchCrate(step){
  clearSelection(false);
  shelf=(shelf+step+Math.ceil(entries.length/12))%Math.ceil(entries.length/12);
  if(renderer)layoutRoom();
}
$('shelf-back')?.addEventListener('click',()=>switchCrate(-1));
$('shelf-next')?.addEventListener('click',()=>switchCrate(1));
$('open-deck')?.addEventListener('click',event=>show(turntableEntry(),true,event.currentTarget));
setStyle(style);buildCollection();

function playMusic(){
  if(kind!=='music')return;
  $('room-audio').classList.add('is-open');
  if(player){player.play();$('audio-status').textContent='';}
  else if(!$('room-audio').querySelector('iframe'))$('audio-status').textContent='Use the Spotify player or the direct Spotify link.';
}
if(kind==='music'){
  $('play-music').onclick=playMusic;
  void fetch('data/albums.json').then(response=>response.json()).then(data=>{
    catalog=new Map(data.map(item=>[item.id,item]));
    if(active?.kind==='record')paintPanel(active);
  }).catch(()=>{});
  const script=document.createElement('script');
  script.src='https://open.spotify.com/embed/iframe-api/v1';script.async=true;
  window.onSpotifyIframeApiReady=api=>{
    const slot=document.createElement('div');$('room-audio').replaceChildren(slot);
    api.createController(slot,{uri:'spotify:track:'+TRACK_ID,width:'100%',height:80},controller=>{
      player=controller;
      controller.addListener('ready',()=>{if(roomMotion)controller.play();});
      controller.addListener('playback_update',({data})=>{
        const playing=!data.isPaused&&data.position>0;
        if(playing){$('room-audio').classList.add('is-open');$('audio-status').textContent='';}
      });
    });
  };
  script.onerror=()=>{
    $('audio-status').textContent='Playback is available on Spotify.';
  };
  document.head.append(script);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)player?.pause();});
}

function sizeScene(){
  width=Math.max(1,stage.clientWidth);height=Math.max(1,stage.clientHeight);
  renderer.setSize(width,height,false);camera.aspect=width/height;updateShot();
}
function pixelFor(target){
  projected.copy(target.anchor);target.object.localToWorld(projected);projected.project(camera);
  return {x:(projected.x*.5+.5)*width,y:(.5-projected.y*.5)*height,visible:projected.z>-1&&projected.z<1};
}
function positionGlass(){
  if(!active)return;
  const subject=room.targets.get(active.id);
  const p=subject?pixelFor(subject):{x:width*.52,y:height*.50};
  const w=glass.offsetWidth,h=glass.offsetHeight;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  let x,y;
  if(width<590||style==='wide'){
    x=clamp(width/2-w/2,9,width-w-9);y=height-h-9;
  }else if(style==='rail'){
    x=width-w-12;y=clamp(p.y-h*.46,11,height-h-11);
  }else{
    const preferRight=p.x<width*.62;
    x=clamp(preferRight?p.x+46:p.x-w-46,11,width-w-11);
    y=clamp(p.y-h*.73,11,height-h-11);
    if(active.kind==='tv'){x=width-w-14;y=height-h-13;}
  }
  glass.style.left=x+'px';glass.style.top=y+'px';
  const line=$('room-leader');
  line.hidden=!subject||active.kind==='tv'||width<590;
  if(!line.hidden){
    const toX=clamp(p.x,x+7,x+w-7),toY=clamp(p.y,y+7,y+h-7),dx=toX-p.x,dy=toY-p.y;
    line.style.left=p.x+'px';line.style.top=p.y+'px';line.style.width=Math.hypot(dx,dy)+'px';line.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';
  }
}
function markPins(){
  const claimed=[];
  for(const {button,target} of pinRecords){
    const p=pixelFor(target);
    const labelMargin=Math.min(68,width*.135);
    button.hidden=!!active||!p.visible||p.x<labelMargin||p.x>width-labelMargin||p.y<37||p.y>height-7||
      claimed.some(q=>Math.abs(p.x-q.x)<92&&Math.abs(p.y-q.y)<29);
    if(button.hidden)continue;
    claimed.push(p);button.style.left=p.x+'px';button.style.top=p.y+'px';
  }
}
let last=0;
function animate(now){
  requestAnimationFrame(animate);
  if(!room||document.hidden||!stageVisible){last=now;return;}
  const dt=Math.min(.05,Math.max(0,(now-last)*.001));last=now;
  const t=roomMotion?1-Math.exp(-dt*7.4):1;
  eye.lerp(wantedEye,t);aim.lerp(wantedAim,t);
  for(const target of room.targets.values()){
    if(!target.movable)continue;
    position.copy(target.rest);
    if(target.entry.id===active?.id)position.add(new T.Vector3(0,.095,.68));
    target.object.position.lerp(position,t);
    target.object.scale.lerp(position.setScalar(target.entry.id===active?.id?1.09:1),t);
  }
  if(roomMotion&&room.record)room.record.rotation.y+=dt*Math.PI*2*33.333/60;
  camera.position.copy(eye);camera.lookAt(aim);camera.updateMatrixWorld();
  scene.updateMatrixWorld(true);
  tv?.update(camera,'place','about');
  renderer.render(scene,camera);markPins();positionGlass();
}
function pick(event){
  if(glass.contains(event.target)||pins.contains(event.target))return;
  const bounds=stage.getBoundingClientRect();
  pointer.set((event.clientX-bounds.left)/width*2-1,1-(event.clientY-bounds.top)/height*2);
  ray.setFromCamera(pointer,camera);
  const hit=ray.intersectObjects(room.world.children,true)[0];
  for(let item=hit?.object;item;item=item.parent){
    const target=room.targets.get(item.userData.entry);
    if(target){show(target.entry,true);return;}
  }
}
try{
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.45));renderer.setClearColor(0,0);
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  stage.prepend(renderer.domElement);
  if(kind==='about'){
    screen=createTVScreen();tv=mountApartmentTV({THREE:T,host:stage,renderer,screen,reduced});
  }
  layoutRoom();sizeScene();eye.copy(wantedEye);aim.copy(wantedAim);
  new ResizeObserver(sizeScene).observe(stage);
  new IntersectionObserver(([entry])=>{
    stageVisible=entry.isIntersecting;
    if(!stageVisible)tv?.update(camera,'outside','about');
  }).observe(stage);
  renderer.domElement.addEventListener('click',pick);
  renderer.compile(scene,camera);
  $('room-loading').hidden=true;
  requestAnimationFrame(animate);
}catch(error){
  console.warn('Room renderer unavailable',error);
  $('room-loading').textContent='The 3D view is unavailable. Use the collection below to explore the room.';
  renderer=null;
}
