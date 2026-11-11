import * as T from '../three.module.js?v=b477ce33502c';
import {GLTFLoader} from '../vendor/loaders/GLTFLoader.js?v=b477ce33502c';

export const SKIES=[
  ['milky-way','Milky Way','A soft band of real starlight and dust behind the city.'],
  ['orbital-battle','Orbital Battle','Two worlds on the horizon, with fighters and brief exchanges of light high above downtown.'],
  ['ringed-giant','Ringed Giant','A pale crescent and fine, icy rings cut diagonally through the sky.'],
  ['aurora','Aurora','Muted green and violet curtains drift over a deep blue night.'],
  ['ember-nebula','Ember Nebula','Rust, plum, and charcoal clouds give the warm city windows a darker backdrop.'],
  ['moonrise','Moonrise','A cratered moon rises beside the globe in near monochrome.'],
  ['blue-horizon','Blue Horizon','A distant planetary limb glows electric blue along the horizon.'],
  ['meteor-stream','Meteor Stream','Pairs of faint meteors cross the upper sky and leave short, fading trails.'],
  ['distant-fleet','Distant Fleet','A small convoy moves in formation with warm navigation lights and an amber moon.'],
  ['binary-dusk','Binary Dusk','Two suns at different temperatures share a dark bronze horizon.'],
];

const names=new Set(SKIES.map(([id])=>id));
const palette={
  'milky-way':['#080e1d','#141e33'],'orbital-battle':['#090b18','#211b32'],
  'ringed-giant':['#070d19','#1d2939'],aurora:['#06131d','#122c32'],
  'ember-nebula':['#140d19','#37252f'],moonrise:['#0a1018','#202831'],
  'blue-horizon':['#070f20','#10264b'],'meteor-stream':['#070d1d','#1e2a46'],
  'distant-fleet':['#0c1322','#332b2c'],'binary-dusk':['#131325','#3e2530'],
};
function seeded(seed){
  return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}

function haze(ctx,x,y,r,inner,outer='transparent'){
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,inner);g.addColorStop(1,outer);
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}

function sphere(ctx,x,y,r,colors,{ring=false,texture=false}={}){
  if(ring){
    ctx.save();ctx.translate(x,y);ctx.rotate(-.34);ctx.scale(1,.26);
    for(let i=0;i<19;i++){
      ctx.beginPath();ctx.strokeStyle=i%5===0?'#d5c4a14a':'#e2c8b425';
      ctx.lineWidth=i%5===0?r*.065:r*.024;ctx.arc(0,0,r*(1.18+i*.062),0,Math.PI*2);ctx.stroke();
    }ctx.restore();
  }
  haze(ctx,x,y,r*1.18,'#aacbea28');
  ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
  const g=ctx.createLinearGradient(x-r*.82,y-r*.85,x+r*.75,y+r*.72);
  colors.forEach((c,i)=>g.addColorStop(i/(colors.length-1),c));
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  const random=seeded(7382);
  if(texture)for(let i=0;i<95;i++){
    const size=r*(.015+random()*.125),a=x+(random()*2-1)*r,b=y+(random()*2-1)*r;
    haze(ctx,a,b,size,i%3?'#07101b44':'#d6dce426');
  }
  if(ring)for(let i=0;i<28;i++){
    ctx.fillStyle=i%3?'#d3b19514':'#0d152d24';
    ctx.fillRect(x-r,y-r+i*r/14,r*2,r*(.012+random()*.05));
  }
  ctx.restore();
  if(ring){
    ctx.save();ctx.translate(x,y);ctx.rotate(-.34);ctx.scale(1,.26);
    for(let i=0;i<19;i++){
      ctx.beginPath();ctx.strokeStyle=i%5===0?'#d5c4a15a':'#e2c8b42f';
      ctx.lineWidth=i%5===0?r*.065:r*.024;ctx.arc(0,0,r*(1.18+i*.062),0,Math.PI);ctx.stroke();
    }ctx.restore();
  }
}

export function createAtlasSky(canvas,fx){
  const ctx=canvas.getContext('2d'),effects=fx.getContext('2d');
  const milkyWay=new Image();
  const stars=document.createElement('canvas');
  let id='milky-way',w=1,h=1;
  milkyWay.onload=()=>{
    stars.width=milkyWay.naturalWidth;stars.height=milkyWay.naturalHeight;
    const g=stars.getContext('2d');
    g.drawImage(milkyWay,0,0);
    g.globalCompositeOperation='destination-in';
    for(const [x,y] of [[stars.width,0],[0,stars.height]]){
      const mask=g.createLinearGradient(0,0,x,y);
      mask.addColorStop(0,'transparent');mask.addColorStop(.14,'black');
      mask.addColorStop(.82,'black');mask.addColorStop(1,'transparent');
      g.fillStyle=mask;g.fillRect(0,0,stars.width,stars.height);
    }
    if(id==='milky-way')paint();
  };
  milkyWay.src=new URL('../assets/atlas/milky-way.jpg',import.meta.url).href;

  function paint(){
    const [top,bottom]=palette[id],base=ctx.createLinearGradient(0,0,w*.16,h);
    base.addColorStop(0,top);base.addColorStop(1,bottom);ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
    const dim=Math.min(w,h),random=seeded(77121);
    if(id==='milky-way'){
      if(milkyWay.complete&&milkyWay.naturalWidth){
        ctx.save();ctx.translate(w*.62,h*.32);ctx.rotate(-.18);
        ctx.globalCompositeOperation='screen';ctx.globalAlpha=.49;
        const size=Math.max(w*1.12,h*1.95);
        ctx.drawImage(stars,-size*.5,-size*.24,size,size*.5);ctx.restore();
      }
      haze(ctx,w*.65,h*.47,dim*.72,'#6283a219');
    }
    if(id==='ember-nebula'){
      for(let i=0;i<45;i++){
        const t=random(),x=w*(.25+t*.75),y=h*(.72-t*.60)+(random()-.5)*h*.24;
        haze(ctx,x,y,dim*(.08+random()*.26),i%3?'#bd623314':'#9b537130');
      }
    }
    if(id==='blue-horizon'){
      const x=w*.68,y=h*2.12,r=h*1.51;
      haze(ctx,x,y,r*1.22,'#506dc495');
      const g=ctx.createRadialGradient(x,y,r*.94,x,y,r*1.12);
      g.addColorStop(0,'#071426');g.addColorStop(.33,'#254b76');g.addColorStop(.55,'#5ca8e377');g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    }
    if(id==='binary-dusk'){
      haze(ctx,w*.78,h*.68,dim*.66,'#d6925740');
      haze(ctx,w*.39,h*.68,dim*.56,'#c66b4e37');
    }
    const count=Math.round(w*h/1900);
    for(let i=0;i<count;i++){
      const x=random()*w,y=random()*h,brightness=Math.pow(random(),2.5),r=.35+brightness*.76;
      ctx.globalAlpha=.17+brightness*.57;
      ctx.fillStyle=i%6===0?'#edcbb2':i%4===0?'#aac9ef':'#dbe6f0';
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      if(brightness>.94)haze(ctx,x,y,r*3,'#cadfff54');
    }
    ctx.globalAlpha=1;
    if(id==='orbital-battle'){
      sphere(ctx,w*.18,h*.28,dim*.143,['#a96c5b','#4a3343','#110e22'],{texture:true});
      sphere(ctx,w*.85,h*.23,dim*.135,['#a8c2ce','#435f7e','#11182f'],{texture:true});
    }
    if(id==='ringed-giant')sphere(ctx,w*.79,h*.235,dim*.19,['#ded5bf','#776b6d','#1a1b31'],{ring:true});
    if(id==='moonrise')sphere(ctx,w*.83,h*.31,dim*.21,['#ced7de','#777f8c','#222936'],{texture:true});
    if(id==='distant-fleet')sphere(ctx,w*.81,h*.25,dim*.10,['#d9aa69','#6c4b4a','#201a2b'],{texture:true});
    if(id==='binary-dusk'){
      for(const [x,y,r,c] of [[.77,.40,.027,'#f6bc7d'],[.65,.52,.014,'#ffd9b2']]){
        haze(ctx,w*x,h*y,dim*r*9,c+'50');
        ctx.fillStyle=c;ctx.beginPath();ctx.arc(w*x,h*y,dim*r,0,Math.PI*2);ctx.fill();
      }
    }
  }
  function render(time,reduced=false){
    effects.clearRect(0,0,w,h);
    if(id==='aurora'){
      const movement=reduced?0:time*.19;
      for(let layer=0;layer<9;layer++){
        effects.beginPath();
        for(let i=0;i<=78;i++){
          const u=i/78,x=w*(u*1.1-.05);
          const y=h*(.19+layer*.008+Math.sin(u*9+movement+layer*.16)*.046+Math.sin(u*19+movement*.7)*.012);
          if(i===0)effects.moveTo(x,y);else effects.lineTo(x,y);
        }
        const color=effects.createLinearGradient(0,0,w,0);
        color.addColorStop(0,'transparent');color.addColorStop(.25,'#479f9361');
        color.addColorStop(.60,layer<5?'#7af3bf55':'#9b78e857');color.addColorStop(1,'transparent');
        effects.lineWidth=(layer+1)*h*.0034;effects.strokeStyle=color;effects.stroke();
      }
    }
    if(reduced)return;
    if(id==='meteor-stream'||id==='milky-way'){
      const duration=id==='meteor-stream'?5.4:13.7;
      for(let i=0;i<3;i++){
        const t=((time+i*1.27)%duration)-(i*.08);
        if(t<0||t>1.15)continue;
        const x=w*(.34+i*.19+t*.165),y=h*(.08+i*.075+t*.18),tail=Math.min(t,.32);
        const endX=x-w*tail*.165,endY=y-h*tail*.18;
        const g=effects.createLinearGradient(endX,endY,x,y);
        g.addColorStop(0,'transparent');g.addColorStop(1,'#d5e5ffd9');
        effects.globalAlpha=1-smoothTime(t,.76,1.15);effects.strokeStyle=g;
        effects.lineWidth=1.1;effects.beginPath();effects.moveTo(endX,endY);effects.lineTo(x,y);effects.stroke();
      }
    }
    if(id==='orbital-battle'){
      for(let i=0;i<6;i++){
        const t=(time+i*.21)%3.5;
        if(t>.62)continue;
        const reverse=i%2===0,x=w*(reverse?.24+t*.80:.82-t*.78),y=h*(.18+.028*i+t*.045);
        const end=x+w*(reverse?-.11:.11);
        const g=effects.createLinearGradient(end,y,x,y);
        const color=reverse?'#ffc48c':'#8bc6ff';
        g.addColorStop(0,'transparent');g.addColorStop(1,color);
        effects.globalAlpha=(1-t/.70)*.73;effects.strokeStyle=g;effects.lineWidth=1.2;
        effects.shadowColor=color;effects.shadowBlur=8;effects.beginPath();effects.moveTo(end,y+5);effects.lineTo(x,y);effects.stroke();
      }
    }
    effects.globalAlpha=1;effects.shadowBlur=0;
  }
  return {resize(width,height){
    w=Math.min(1560,Math.round(width));h=Math.max(1,Math.round(height*w/width));
    for(const layer of [canvas,fx]){layer.width=w;layer.height=h;}paint();
  },select(value){
    id=names.has(value)?value:'milky-way';paint();
  },render};
}

function smoothTime(x,a,b){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}

export function createOrbitalShips(onReady){
  const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,.1,50);
  camera.position.z=8;
  scene.add(new T.AmbientLight('#b8cceb',1.3));
  const key=new T.DirectionalLight('#ffe2c1',2.4);key.position.set(-2,5,4);scene.add(key);
  let ready=null,ships=[],active=false,mode;
  function load(){
    if(ready)return;
    const loader=new GLTFLoader(),sources=['craft_speederA','craft_racer','craft_miner'];
    ready=Promise.all(sources.map(name=>loader.loadAsync(new URL('../assets/atlas/'+name+'.glb',import.meta.url).href))).then(models=>{
      ships=Array.from({length:6},(_,i)=>{
        const model=models[i%models.length].scene.clone(true);
        const b=new T.Box3().setFromObject(model),max=Math.max(...b.getSize(new T.Vector3()));
        model.scale.setScalar(1/max);const holder=new T.Group();holder.add(model);scene.add(holder);return holder;
      });
      onReady?.();
    }).catch(error=>console.warn('Orbital models unavailable',error));
  }
  return {select(id){mode=id;active=id==='orbital-battle'||id==='distant-fleet';if(active)load();},
    render(renderer,aspect,time,reduced){
      if(!active||!ships.length)return;
      camera.left=-aspect;camera.right=aspect;camera.updateProjectionMatrix();
      for(const [i,ship] of ships.entries()){
        const battle=mode==='orbital-battle',right=battle&&i%2===1;
        const drift=reduced?0:Math.sin(time*(battle?.37:.18)+i)*.09;
        const x=battle?(right?.57:-.61)+(i%3)*.12: -.56+i*.183;
        ship.position.set((x+drift)*aspect,.48+(i%3)*.108+drift*.8,i*.08);
        ship.rotation.set(.42, right?-.74:.87,right?-.25:.18);
        ship.scale.setScalar((i%3===0?.116:.068)*(battle?1:.88));
      }
      renderer.render(scene,camera);
      renderer.clearDepth();
    },
  };
}

export function mountCitySky(id,host,renderer,scene){
  if(!names.has(id))return null;
  const background=document.createElement('canvas'),effects=document.createElement('canvas');
  for(const canvas of [background,effects]){
    canvas.setAttribute('aria-hidden','true');
    Object.assign(canvas.style,{position:'absolute',inset:'0',pointerEvents:'none'});
  }
  host.prepend(background,effects);
  renderer.domElement.style.position='relative';
  renderer.autoClear=false;
  const sky=createAtlasSky(background,effects),ships=createOrbitalShips();
  sky.select(id);ships.select(id);
  function resize(width,height){sky.resize(Math.max(1,width),Math.max(1,height));}
  resize(host.clientWidth,host.clientHeight);
  return {resize,render(time,aspect,reduced){
    scene.background=null;
    renderer.clear();
    sky.render(time,reduced);
    ships.render(renderer,aspect,time,reduced);
  }};
}
