import {createMeteorShower} from './meteor-shower.js?v=b477ce33502c';
export const BACKDROPS=Object.freeze({
 sky:{label:'Sky',colors:['#a9c5d7','#d9e5e5','#f4e9d4']},
 night:{label:'Night',colors:['#071225','#152a43','#344357']},
 rain:{label:'Rain',colors:['#07101c','#132338','#31414e']}
});
/** A shared sky reaches the page chrome; stars stay behind the city geometry. */
export function createBackdrops(T,scene){
 const maps=new Map();let night=false;
 const meteors=createMeteorShower(T,scene);
 function select(id){
  if(!Object.hasOwn(BACKDROPS,id))id='sky';night=id==='night';meteors.setEnabled(night);
  if(!maps.has(id)){
   const c=document.createElement('canvas');c.width=1024;c.height=1024;const g=c.getContext('2d'),v=g.createLinearGradient(0,0,0,1024);BACKDROPS[id].colors.forEach((color,i)=>v.addColorStop(i/2,color));g.fillStyle=v;g.fillRect(0,0,1024,1024);
   if(night){let seed=3217;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};for(let i=0;i<330;i++){const x=random()*1024,y=random()*820,r=.4+random()*.9;g.fillStyle='rgba(218,235,255,'+(.20+random()*.65)+')';g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}}
   const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.minFilter=T.LinearFilter;maps.set(id,t);
  }
  scene.background=maps.get(id);return id;
 }
 select.update=(dt,aspect=1)=>meteors.update(dt,aspect);select.meteors=meteors;
 return select;
}
