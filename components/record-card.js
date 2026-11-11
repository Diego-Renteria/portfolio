import {mountRecordCarousel} from './record-carousel.js?v=b477ce33502c';
export const RECORD_DESIGNS=[
  {id:'turntable',name:'Listening room',note:'Warm wood, a spinning record, and two favorites.'},
  {id:'sleeve',name:'Sleeve notes',note:'Two matching sleeves, one favorite album and one favorite song.'},
  {id:'receiver',name:'After hours',note:'Brushed metal, amber meters, and late-night radio.'},
  {id:'mixtape',name:'The mixtape',note:'A cassette for the song. Side B for the album.'},
  {id:'crate',name:'Crate digger',note:'A small record-store find, straight from the bins.'}
];
export const MUSIC_FAVORITES={placeholder:false,song:{title:'Fade Into You',artist:'Mazzy Star',url:'https://open.spotify.com/track/1LzNfuep1bnAUR9skqdHCK',art:'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0289a392107ebd79818022b3ea'},album:{title:'Whole Lotta Red',artist:'Playboi Carti',url:'https://open.spotify.com/album/2QRedhP5RmKJiJ1i8VgDGR',art:'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e0298ea0e689c91f8fea726d9bb'}};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const record=()=>`<div class="rc-vinyl" aria-hidden="true"><div class="rc-vinyl-label">d.<small>ON REPEAT</small></div></div>`;
const favorite=(label,item)=>`<span class="rc-small">${label}</span><h3>${item.url?`<a class="rc-listen-title" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${escape(item.title)} on Spotify">${escape(item.title)} <span aria-hidden="true">↗</span></a>`:escape(item.title)}</h3><span class="rc-artist">${escape(item.artist)}</span>`;

export function renderRecordDesign(id,favorites=MUSIC_FAVORITES){
 const {song,album}=favorites;
 const cover=(kind='album',className='')=>{const item=favorites[kind];const img=`<img class="rc-art ${className}" src="${escape(item.art||`assets/music/${kind}-study.svg`)}" alt="${escape(item.title)} artwork" width="300" height="300">`;return item.url?`<a class="rc-art-link" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escape(item.title)} on Spotify">${img}</a>`:img;};
 switch(id){
  case 'turntable':return `<div class="rc-room"><div class="rc-room-top"><span>THE LISTENING ROOM</span><span>33⅓ RPM</span></div><div class="rc-deck"><div class="rc-platter">${record()}</div><div class="rc-arm"><i></i></div><span class="rc-deck-brand">DIEGO / HI-FI</span><i class="rc-power"></i></div><div class="rc-song">${favorite('01 / FAVORITE SONG',song)}</div><div class="rc-album-row">${cover()}<div>${favorite('02 / FAVORITE ALBUM',album)}</div></div></div>`;
  case 'sleeve':return `<div class="rc-sleeve-duet">${[['album',album,'FAVORITE ALBUM'],['song',song,'FAVORITE SONG']].map(([kind,item,label],i)=>`<article class="rc-collection-card" aria-label="${label}"><div class="rc-editorial-top"><span>THE COLLECTION</span><span>0${i+1}</span></div><div class="rc-collection-stage">${record()}${cover(kind)}</div><div class="rc-collection-copy">${favorite(label,item)}</div></article>`).join('')}</div>`;
  case 'receiver':return `<div class="rc-receiver"><div class="rc-hi-fi"><div class="rc-device-top"><span>D. SOUND SYSTEM</span><span>STEREO / FM</span></div><div class="rc-meter-pair">${[1,2].map((n)=>`<div class="rc-meter"><span>−20 &nbsp; −10 &nbsp; 0 &nbsp; +3</span><i style="--meter:${n}"></i><small>${n===1?'LEFT':'RIGHT'}</small></div>`).join('')}</div><div class="rc-tuner"><span>88 &nbsp; 92 &nbsp; 96 &nbsp; 100 &nbsp; 104 &nbsp; 108</span><i></i></div><div class="rc-knobs"><span><i class="rc-power"></i> AUX</span><i></i><i></i><b></b></div></div><div class="rc-radio-song"><span class="rc-small">TUNED IN / FAVORITE SONG</span><h3>${escape(song.title)}</h3><span class="rc-artist">${escape(song.artist)}</span><div class="rc-sound-bars" aria-hidden="true">${Array.from({length:26},(_,i)=>`<i style="--bar:${i};--height:${12+(i*13)%29}px"></i>`).join('')}</div></div><div class="rc-album-row">${cover()}<div>${favorite('FAVORITE ALBUM / ON THE SHELF',album)}</div></div></div>`;
  case 'mixtape':return `<div class="rc-mixtape"><div class="rc-paper-heading"><span>A LITTLE MIX<br>OF MY WORLD.</span><span class="rc-hand">For the ride home ↘</span></div><div class="rc-cassette"><div class="rc-tape-label"><span>DIEGO’S MIX</span><b>A</b><div>songs to keep.</div></div><div class="rc-tape-window"><i></i><span></span><i></i></div><div class="rc-tape-bottom"></div><span class="rc-screw a">+</span><span class="rc-screw b">+</span><span class="rc-screw c">+</span><span class="rc-screw d">+</span></div><div class="rc-tape-track"><b>A</b><div>${favorite('FAVORITE SONG',song)}</div></div><div class="rc-tape-track"><b>B</b><div>${favorite('FAVORITE ALBUM',album)}</div>${cover()}</div><span class="rc-hand rc-tape-signoff">Made with a little obsession. — d.</span></div>`;
  case 'crate':return `<div class="rc-crate"><div class="rc-shop-heading"><span>STAFF PICKS</span><span class="rc-small">DIEGO’S RECORD STORE</span></div><div class="rc-crate-stage"><div class="rc-bin-back"></div><div class="rc-back-sleeve one"></div><div class="rc-back-sleeve two"></div><div class="rc-front-sleeve">${cover()}<span>PERSONAL FAVORITES</span></div><div class="rc-bin-front"><span>KEEPERS</span><i>01—02</i></div></div><div class="rc-crate-album">${favorite('FAVORITE ALBUM / THE TAKE-HOME',album)}</div><div class="rc-crate-song"><span class="rc-small">FAVORITE SONG / SHOP SPEAKERS</span><div>${cover('song')}<div>${favorite("ON REPEAT",song)}</div><span aria-hidden="true">♪</span></div></div></div>`;
  default:throw new Error('Unknown record card design');
 }
}

export const RECORD_THEMES=[
 {id:'porcelain',name:'Porcelain · White & Ink'},
 {id:'silver',name:'Silver · Pearl & Chrome'},
 {id:'cobalt',name:'Cobalt · White & Electric Blue'},
 {id:'rose',name:'Rose · Ivory & Merlot'},
 {id:'aurora',name:'Aurora · Frost & Lilac'}
];

export function mountRecordCard(host,{favorites=MUSIC_FAVORITES,storage}={}){
 let selected='silver',paused=false;
 try{storage??=globalThis.localStorage;}catch{}
 try{const remembered=storage?.getItem('diego-record-card-theme-v4');if(RECORD_THEMES.some(t=>t.id===remembered))selected=remembered;}catch{}
 host.innerHTML=`<div class="rc-switcher"><div><label for="record-theme">THE COLLECTION / COLOR THEMES</label><span id="record-theme-count" aria-live="polite"></span></div><div class="rc-switcher-controls"><button type="button" data-rc-prev aria-label="Previous color theme">←</button><select id="record-theme" aria-label="Music card color theme">${RECORD_THEMES.map((t,i)=>`<option value="${t.id}">${String(i+1).padStart(2,'0')} · ${t.name}</option>`).join('')}</select><button type="button" data-rc-next aria-label="Next color theme">→</button></div></div><div class="rc-design" id="record-design-content" data-design="sleeve" aria-label="Favorite album and favorite song">${renderRecordDesign('sleeve',favorites)}</div><section class="rc-album-carousel" aria-label="Albums I like" aria-roledescription="carousel"></section><div class="rc-design-footer"><p class="rc-preview-note">Two favorites. 113 records on the shelves.</p><button type="button" class="rc-motion" aria-pressed="false">Pause motion</button></div>`;
 const select=host.querySelector('#record-theme'),stage=host.querySelector('.rc-design');
 const carousel=mountRecordCarousel(host.querySelector('.rc-album-carousel'));
 const show=id=>{selected=id;const index=RECORD_THEMES.findIndex(t=>t.id===id);select.value=id;host.dataset.recordTheme=id;host.querySelector('#record-theme-count').textContent=`${index+1} / 5`;try{storage?.setItem('diego-record-card-theme-v4',id);}catch{}};
 select.onchange=()=>show(select.value);
 const step=direction=>show(RECORD_THEMES[(RECORD_THEMES.findIndex(t=>t.id===selected)+direction+5)%5].id);
 host.querySelector('[data-rc-prev]').onclick=()=>step(-1);host.querySelector('[data-rc-next]').onclick=()=>step(1);
 host.querySelector('.rc-motion').onclick=e=>{paused=!paused;carousel.setPaused(paused);stage.dataset.paused=String(paused);e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.textContent=paused?'Resume motion':'Pause motion';};
 show(selected);
 return()=>carousel.dispose();
}
