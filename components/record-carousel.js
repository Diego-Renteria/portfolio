const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountRecordCarousel(host){
 const abort=new AbortController(),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let albums=[],index=0,paused=false,disposed=false;
 let offset=0,distance=0,lastTime=0,frameId=0,nudge=0,momentum=0,drag=null,suppressClick=false;
 host.innerHTML=`<div class="rc-carousel-heading"><div><span class="rc-carousel-kicker">ALSO ON MY SHELVES</span><h3>Records I come back to.</h3></div><div class="rc-carousel-controls"><button type="button" data-album-prev aria-label="Previous albums">←</button><button type="button" data-album-next aria-label="Next albums">→</button></div></div><div class="rc-carousel-window"><div class="rc-carousel-track"><p role="status">Opening the crates…</p></div></div><span class="rc-carousel-position" aria-live="off"></span>`;
 const track=host.querySelector('.rc-carousel-track'),window=host.querySelector('.rc-carousel-window'),position=host.querySelector('.rc-carousel-position'),prev=host.querySelector('[data-album-prev]'),next=host.querySelector('[data-album-next]');
 const wrap=n=>(n+albums.length)%albums.length;
 function albumNode(n){
  const a=albums[wrap(n)],article=document.createElement('article');article.className='rc-carousel-album';
  article.innerHTML=`<a href="${esc(a.apple||a.spotify)}" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${esc(a.title)} by ${esc(a.artist)} on ${a.apple?'Apple Music':'Spotify'}"><img src="${esc(a.art)}" alt="${esc(a.title)} album cover" width="160" height="160" decoding="async" draggable="false"><span class="rc-carousel-title">${esc(a.title)}</span><span class="rc-carousel-artist">${esc(a.artist)}</span><span class="rc-carousel-listen">${a.apple?'Apple Music':'Spotify'} ↗</span></a>`;return article;
 }
 function announce(isManual=false){position.textContent=`${index+1} / ${albums.length} records`;position.setAttribute('aria-live',isManual?'polite':'off');[...track.children].forEach((node,i)=>{node.querySelector('a').tabIndex=i<3?0:-1})}
 function shift(amount,isManual=false){
  if(!distance||!albums.length)return;offset+=amount;let changed=false;
  while(offset>=distance){index=wrap(index+1);track.firstElementChild.remove();track.append(albumNode(index+3));offset-=distance;changed=true;}
  while(offset<0){index=wrap(index-1);track.lastElementChild.remove();track.prepend(albumNode(index));offset+=distance;changed=true;}
  if(changed)announce(isManual);track.style.transform=`translate3d(${-offset}px,0,0)`;
 }
 function measure(){const nextDistance=(track.getBoundingClientRect().width+12)/3;if(nextDistance<=4)return;const ratio=distance?offset/distance:0;distance=nextDistance;offset=ratio*distance;nudge=0;track.style.transform=`translate3d(${-offset}px,0,0)`}
 function step(direction){
  if(!albums.length||disposed||!distance)return;momentum=0;
  if(motion.matches)shift(direction*distance,true);else nudge+=direction*distance;
 }
 function tick(time){
  if(disposed)return;const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;
  if(!document.hidden&&host.isConnected){
   // Button nudges and drag momentum layer onto the continuous shelf drift.
   let delta=!paused&&!motion.matches?dt*20:0;
   if(nudge){const move=nudge*(1-Math.exp(-dt/ .14));nudge-=move;delta+=move;if(Math.abs(nudge)<.05){delta+=nudge;nudge=0;}}
   if(!drag&&!paused&&!motion.matches&&Math.abs(momentum)>.5){delta+=momentum*dt;momentum*=Math.exp(-dt*4.5);}
   shift(delta,!!nudge);
  }
  track.style.transform=`translate3d(${-offset}px,0,0)`;frameId=requestAnimationFrame(tick);
 }
 prev.onclick=()=>step(-1);next.onclick=()=>step(1);
 window.addEventListener('pointerdown',e=>{
  if(e.button!==0||!distance)return;suppressClick=false;momentum=0;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,previous:e.clientX,time:e.timeStamp,velocity:0,moved:false};
 },{signal:abort.signal});
 window.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved){
   if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}
   if(Math.abs(dx)<6)return;drag.moved=true;nudge=0;window.setPointerCapture(e.pointerId);window.classList.add('is-dragging');
  }
  e.preventDefault();const delta=drag.previous-e.clientX,dt=Math.max(.008,(e.timeStamp-drag.time)/1000);
  drag.velocity=drag.velocity*.25+Math.max(-1400,Math.min(1400,delta/dt))*.75;
  shift(delta,true);drag.previous=e.clientX;drag.time=e.timeStamp;
 },{signal:abort.signal});
 function endDrag(e){
  if(!drag||e.pointerId!==drag.id)return;
  const ended=drag;drag=null;suppressClick=ended.moved;window.classList.remove('is-dragging');
  momentum=ended.moved&&e.type==='pointerup'&&e.timeStamp-ended.time<120?ended.velocity:0;
  if(window.hasPointerCapture(e.pointerId))window.releasePointerCapture(e.pointerId);
 }
 for(const type of['pointerup','pointercancel','lostpointercapture'])window.addEventListener(type,endDrag,{signal:abort.signal});
 window.addEventListener('click',e=>{if(suppressClick&&e.detail!==0){e.preventDefault();e.stopPropagation();suppressClick=false;}},{capture:true,signal:abort.signal});
 window.addEventListener('dragstart',e=>e.preventDefault(),{signal:abort.signal});
 host.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?-1:1)}},{signal:abort.signal});
 const resize=new ResizeObserver(measure);resize.observe(track);
 fetch(new URL('../data/albums.json',import.meta.url),{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error('Unavailable');return r.json()}).then(data=>{
  if(disposed)return;
  // Mix artists across the shelf instead of putting every release by one artist together.
  const buckets=new Map();for(const a of data){if(!buckets.has(a.artist))buckets.set(a.artist,[]);buckets.get(a.artist).push(a)}
  while([...buckets.values()].some(b=>b.length))for(const bucket of buckets.values())if(bucket.length)albums.push(bucket.shift());
  track.replaceChildren(...Array.from({length:4},(_,i)=>albumNode(i)));announce();measure();frameId=requestAnimationFrame(tick);
 }).catch(error=>{if(error.name!=='AbortError'){track.innerHTML='<p>The shelves are on the full Music page.</p>';prev.disabled=next.disabled=true}});
 return{setPaused(value){paused=value;if(value)momentum=0;host.dataset.paused=String(value)},dispose(){disposed=true;cancelAnimationFrame(frameId);resize.disconnect();abort.abort()}};
}
