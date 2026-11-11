import {entriesFor} from './room-catalog.js?v=rooms-1';

const rooms={
  projects:{label:'Maker Space',kind:'maker',shots:[['Fabrication',[-18.25,1.87,15.35],[-16.6,1.49,7.4]],['Design lab',[-18.25,5.73,15.45],[-16.4,5.31,7.2]]]},
  about:{label:'Apartment',kind:'about',shots:[['Living room',[-10.64,12.03,15.46],[-8.15,11.57,10.95]],['TV',[-8.4,11.73,14.6],[-8.45,11.84,10.3]]]},
  lately:{label:'Library',kind:'library',shots:[['Reading hall',[9.72,1.93,14.95],[7.75,1.85,6.0]]]},
  music:{label:'Record Store',kind:'music',shots:[['Shop floor',[18.7,1.81,15.9],[16.36,1.55,7.5]]]},
};
export function mountInsideBlock({enter,leave}){
  const overlay=document.createElement('section');
  overlay.className='inside-block';
  overlay.hidden=true;
  overlay.setAttribute('aria-label','Building interior controls');
  overlay.innerHTML='<div class="inside-top"><button type="button" data-exit>← Back to the block</button><strong></strong><div data-shots></div></div><button type="button" class="inside-browse" aria-expanded="false"></button><div class="inside-reader" hidden><div class="inside-list"></div><article hidden></article></div>';
  document.body.append(overlay);
  const title=overlay.querySelector('strong'),shots=overlay.querySelector('[data-shots]'),browse=overlay.querySelector('.inside-browse'),reader=overlay.querySelector('.inside-reader'),list=overlay.querySelector('.inside-list'),article=overlay.querySelector('article');
  let active=null,index=0;
  function setOpen(open){reader.hidden=!open;browse.setAttribute('aria-expanded',String(open));}
  overlay.querySelector('[data-exit]').onclick=leave;
  browse.onclick=()=>setOpen(reader.hidden);
  function open(id){
    if(!rooms[id])return;
    if(active!==id){
      active=id;index=0;const room=rooms[id],entries=entriesFor(room.kind);
      title.textContent=room.label;
      browse.textContent={maker:'Projects',about:'Around the apartment',library:'Reading shelf',music:'Browse all records'}[room.kind];
      list.replaceChildren();article.hidden=true;setOpen(false);
      if(room.kind==='music'){
        const search=document.createElement('input');search.type='search';search.placeholder='Album or artist';search.setAttribute('aria-label','Find a record');
        list.append(search);
        search.oninput=()=>{const query=fold(search.value);for(const button of list.querySelectorAll('button'))button.hidden=!fold(button.textContent).includes(query);};
      }
      for(const item of entries){
        const button=document.createElement('button');button.type='button';button.textContent=item.title+(item.artist?' · '+item.artist:'');
        button.onclick=()=>{if(item.kind==='tv'){pickShot(1);setOpen(false);}else show(item);};
        list.append(button);
      }
      if(room.kind!=='about'){
        const comparison=document.createElement('a');
        comparison.href=({maker:'makerspace',library:'library',music:'music'})[room.kind]+'.html?pass=0';
        comparison.textContent='Compare room revisions ↗';list.append(comparison);
      }
      shots.replaceChildren();
      room.shots.forEach(([label],i)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>pickShot(i);shots.append(button);});
      if(room.shots.length===1){const button=document.createElement('button');button.type='button';button.textContent='Look outside';button.onclick=()=>pickShot(1);shots.append(button);}
    }
    overlay.hidden=false;pickShot(index);overlay.querySelector('[data-exit]').focus({preventScroll:true});
  }
  function pickShot(i){index=i;[...shots.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));enter(active);}
  function fold(text){return text.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();}
  function show(item){
    article.replaceChildren();
    const head=document.createElement('h2');head.textContent=item.title;article.append(head);
    function copy(value){const p=document.createElement('p');p.textContent=value;article.append(p);}
    function link(label,url){const a=document.createElement('a');a.textContent=label+' ↗';a.href=url;article.append(a);}
    if(item.kind==='project'){copy(item.result);copy(item.role);for(const [name,value] of [['What',item.challenge],['How',item.approach.map(([step,detail])=>step+'. '+detail).join(' ')],['Results',item.outcome]]){const section=document.createElement('details');const summary=document.createElement('summary');summary.textContent=name;section.append(summary,document.createTextNode(value));article.append(section);}link('Full case study','projects.html?project='+encodeURIComponent(item.id));}
    else if(item.kind==='record'){copy(item.artist);link('Find on Spotify','https://open.spotify.com/search/'+encodeURIComponent(item.title+' '+item.artist));}
    else if(item.kind==='book'){copy(item.thoughts||'Placeholder for a book and reading notes.');if(item.rating!=null)copy(item.rating+' / 5');if(item.recommendedFor)copy(item.recommendedFor);}
    else {copy(item.text);if(item.link)link(...item.link);}
    article.hidden=false;head.tabIndex=-1;head.focus({preventScroll:true});
  }
  return {open,close(){overlay.hidden=true;active=null;},shot(id){const room=rooms[id];if(!room)return null;const shot=room.shots[index];if(shot)return shot;const [,eye]=room.shots[0];return ['Street',eye,[eye[0]-.7,eye[1]-.05,27]];}};
}
