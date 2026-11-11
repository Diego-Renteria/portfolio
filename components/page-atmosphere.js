import {BACKDROPS} from './scene-backdrops.js?v=b477ce33502c';

export function atmosphereHref(href,id){
 const [path,fragment]=href.split('#'),[file,query='']=path.split('?');
 const params=new URLSearchParams(query);params.set('atmosphere',Object.hasOwn(BACKDROPS,id)?id:'night');
 return file+'?'+params.toString()+(fragment===undefined?'':'#'+fragment);
}

export function applyPageAtmosphere(id){
 if(!Object.hasOwn(BACKDROPS,id))id='night';
 document.documentElement.dataset.atmosphere=id;document.documentElement.style.colorScheme=id==='sky'?'light':'dark';document.body.dataset.backdrop=id;
 const colors=BACKDROPS[id].colors;
 for(const [i,stop]of ['top','middle','bottom'].entries())document.documentElement.style.setProperty('--atmosphere-'+stop,colors[i]);
 document.querySelectorAll('a[href]').forEach(a=>{const href=a.getAttribute('href');if(/^(?:[\w-]+\.html)(?:[?#]|$)/.test(href))a.setAttribute('href',atmosphereHref(href,id));});
 try{localStorage.setItem('diego-city-backdrop',id);}catch{}
 return id;
}
