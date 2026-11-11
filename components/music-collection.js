import {MUSIC_FAVORITES} from './record-card.js?v=b477ce33502c';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');

export async function mountMusicCollection(host){
 host.innerHTML='<p role="status">Opening the record crates…</p>';
 try{
 const response=await fetch(new URL('../data/albums.json',import.meta.url));if(!response.ok)throw new Error('Catalog unavailable');
 const albums=await response.json(),artists=[...new Set(albums.map(a=>a.artist))].sort((a,b)=>a.localeCompare(b));
 const art=(a,large=false)=>a.art?`<img src="${esc(a.art)}" alt="${esc(a.title)} album cover" width="400" height="400" ${large?'fetchpriority="high"':'loading="lazy"'} decoding="async">`:`<span class="album-no-art"><span>${esc(a.artist)}</span><b>${esc(a.title)}</b><small>RECORD ${a.id.slice(-3)}</small></span>`;
 const favorite=(kind,label)=>{const a=MUSIC_FAVORITES[kind];return `<a class="music-favorite" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer"><div class="favorite-cover"><img src="${esc(a.art)}" alt="${esc(a.title)} cover" width="300" height="300"><i aria-hidden="true"></i></div><div><span class="music-kicker">${label}</span><h2>${esc(a.title)}</h2><p>${esc(a.artist)}</p><small>Listen on Spotify ↗</small></div></a>`};
 host.innerHTML=`<section class="music-favorites" aria-label="Two personal favorites">${favorite('album','FAVORITE ALBUM')}${favorite('song','FAVORITE SONG')}</section><section class="album-collection" aria-labelledby="shelves-heading"><div class="shelves-heading"><div><span class="music-kicker">PULL UP A RECORD</span><h2 id="shelves-heading">The shelves.</h2></div><span class="collection-total">${albums.length} records <i> / </i> ${artists.length} artists</span></div><div class="collection-tools"><label class="record-search"><span aria-hidden="true">⌕</span><input type="search" id="album-search" aria-label="Search albums or artists" placeholder="Find an album or artist…" autocomplete="off"></label><label class="artist-filter"><span class="sr-only">Filter by artist</span><select id="album-artist"><option value="">All artists</option>${artists.map(a=>`<option>${esc(a)}</option>`).join('')}</select></label><button class="record-surprise" type="button">Pick one for me <span aria-hidden="true">↗</span></button></div><div class="collection-meta"><p id="album-results" aria-live="polite"></p><label>Sort <select id="album-sort" aria-label="Sort albums"><option value="personal">My collection order</option><option value="artist">Artist A–Z</option><option value="album">Album A–Z</option></select></label></div><div class="album-grid" id="album-grid"></div><p class="collection-empty" hidden>No records found. Try another title or artist.</p><div class="collection-signoff"><span>GOOD RECORDS. NO PARTICULAR ORDER.</span><a href="index.html?atmosphere=night&view=block">Back to the record store ↗</a></div></section><dialog class="record-dialog" aria-labelledby="record-dialog-title"><button class="record-dialog-close" aria-label="Close album details">×</button><div class="record-dialog-content"></div></dialog>`;
 const grid=host.querySelector('#album-grid'),search=host.querySelector('#album-search'),filter=host.querySelector('#album-artist'),sort=host.querySelector('#album-sort'),dialog=host.querySelector('dialog');let visible=albums,returnFocus=null;
 function openAlbum(a,trigger){
  returnFocus=trigger??document.activeElement;
  dialog.querySelector('.record-dialog-content').innerHTML=`<div class="record-detail-stage"><div class="detail-vinyl" aria-hidden="true"><i></i></div><div class="record-detail-art">${art(a,true)}</div></div><div class="record-detail-copy"><span class="music-kicker">FROM MY COLLECTION / ${a.id.slice(-3)}</span><h2 id="record-dialog-title">${esc(a.title)}</h2><p>${esc(a.artist)}</p>${a.year?`<small>${esc(a.year)}${a.genre?' · '+esc(a.genre):''}</small>`:''}<div class="record-listen"><a href="${esc(a.spotify)}" target="_blank" rel="noopener noreferrer">Find on Spotify ↗</a>${a.apple?`<a class="apple-album-link" href="${esc(a.apple)}" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${esc(a.title)} on Apple Music">♪ <span>Listen on<br><b>Apple Music</b></span></a>`:''}</div></div>`;
  dialog.showModal();document.body.classList.add('record-dialog-open');
 }
 function render(){
  const term=normalize(search.value);visible=albums.filter(a=>(!filter.value||a.artist===filter.value)&&normalize(a.title+' '+a.artist).includes(term));
  if(sort.value==='artist')visible.sort((a,b)=>a.artist.localeCompare(b.artist)||a.title.localeCompare(b.title));
  if(sort.value==='album')visible.sort((a,b)=>a.title.localeCompare(b.title));
  host.querySelector('#album-results').textContent=`${visible.length} of ${albums.length} records${filter.value?' · '+filter.value:''}`;
  host.querySelector('.collection-empty').hidden=!!visible.length;
  grid.innerHTML=visible.map(a=>`<article class="album-item"><button class="album-cover-button" type="button" data-album="${a.id}" aria-label="View ${esc(a.title)} by ${esc(a.artist)}"><span class="album-cover">${art(a)}</span><span class="album-hover" aria-hidden="true">Pull this record ↗</span></button><h3><button type="button" data-album="${a.id}">${esc(a.title)}</button></h3><p>${esc(a.artist)}</p>${a.apple?`<a class="album-store-link" href="${esc(a.apple)}" target="_blank" rel="noopener noreferrer">♪ Apple Music ↗</a>`:''}</article>`).join('');
  host.querySelector('.record-surprise').disabled=!visible.length;
 }
 grid.onclick=e=>{const button=e.target.closest('[data-album]');if(button)openAlbum(albums.find(a=>a.id===button.dataset.album),button)};
 search.oninput=render;filter.onchange=render;sort.onchange=render;
 host.querySelector('.record-surprise').onclick=e=>openAlbum(visible[Math.floor(Math.random()*visible.length)],e.currentTarget);
 dialog.querySelector('.record-dialog-close').onclick=()=>dialog.close();
 dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}};
 dialog.onclose=()=>{document.body.classList.remove('record-dialog-open');returnFocus?.focus()};
 host.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement){const image=e.target;image.parentElement.classList.add('art-unavailable');const fallback=document.createElement('span');fallback.className='cover-retry';fallback.textContent=image.alt.replace(' album cover','').replace(' cover','');image.replaceWith(fallback)}},true);
 render();
 }catch(error){host.innerHTML='<p>The collection couldn’t load. <button type="button" class="collection-retry">Try again</button></p>';host.querySelector('button').onclick=()=>mountMusicCollection(host);console.error(error)}
}
