import {createGardenKit} from './park-helper.js?v=b477ce33502c';

/** Two distinct parks, contained in the original lots and building sightlines. */
export function buildPark(ctx){
 const {THREE:T,world}=ctx,group=new T.Group();group.name='Woodland stream and reading garden';world.add(group);
 const k=createGardenKit(ctx,group),{b,part,random,rock,fern,shrub,ribbon}=k;
 const parkLots=[-13,13].map(x=>({x,z:33,width:17.4,depth:12.6}));
 const paths=[],waterways=[],seats=[],waterClock={value:0};
 const waterMat=new T.MeshPhysicalMaterial({color:'#65877a',roughness:.22,metalness:0,transparent:true,opacity:.62,depthWrite:false,clearcoat:.8,clearcoatRoughness:.15,envMapIntensity:.8});
 waterMat.name='Shallow water / moving capillary normals';
 waterMat.onBeforeCompile=shader=>{
  shader.uniforms.parkTime=waterClock;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vParkWater;').replace('#include <begin_vertex>','#include <begin_vertex>\nvParkWater = position.xz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vParkWater;\nuniform float parkTime;').replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
   float flow = parkTime * .65;
   vec2 ripple = vec2(cos(vParkWater.x*8.0+vParkWater.y*5.0-flow), sin(vParkWater.y*10.0-vParkWater.x*3.0+flow*.7));
   vec2 outlet = vParkWater - vec2(18.74,30.1);
   float radius = max(length(outlet),.01);
   ripple += outlet/radius * sin(radius*30.0-flow*2.0)*exp(-radius)*.6;
   normal = normalize(normal + vec3(ripple.x*.045,ripple.y*.035,0.0));
  `);
 };
 waterMat.customProgramCacheKey=()=> 'park-shallow-water-v1';
 function distanceTo(curve,x,z){let best=Infinity;for(const p of curve.userData.samples)best=Math.min(best,Math.hypot(p.x-x,p.z-z));return best;}
 function path(points,width=1.3){const c=ribbon(points,width,'#c3b9a4',.185,'gravel');c.userData={samples:c.getPoints(150),width};paths.push(c);for(let i=0;i<95;i++){const p=c.getPoint(i/94),v=c.getTangent(i/94);for(const s of[-1,1]){const xx=p.x-v.z*(width/2+.035)*s,zz=p.z+v.x*(width/2+.035)*s;b('#8f9385',.15,.10,.10,xx,.20,zz,-Math.atan2(v.z,v.x),'stone');}}return c;}
 function water(points,width,y){const c=ribbon(points,width,waterMat,y,'plain');c.userData={samples:c.getPoints(150),width};waterways.push(c);return c;}
 function bench(x,z,angle=0){
  seats.push({x,z,width:2.2,depth:.65,angle});
  const at=(dx,dz)=>[x+Math.cos(angle)*dx+Math.sin(angle)*dz,z-Math.sin(angle)*dx+Math.cos(angle)*dz];
  function piece(color,w,h,d,dx,y,dz,kind='wood'){const p=at(dx,dz);b(color,w,h,d,p[0],y,p[1],angle,kind);}
  for(let i=0;i<5;i++)piece('#997449',2.2,.065,.095,0,.57,-.21+i*.108);
  for(let i=0;i<4;i++)piece('#a37b50',2.2,.105,.06,0,.76+i*.12,-.30);
  for(const s of[-1,1]){piece('#354c45',.055,.46,.055,s*.83,.36,.18,'metal');piece('#354c45',.055,.88,.055,s*.83,.56,-.28,'metal');piece('#354c45',.065,.06,.6,s*.83,.52,0,'metal');piece('#354c45',.07,.045,.57,s*.83,.20,0,'metal');piece('#354c45',.055,.055,.62,s*1.02,.76,0,'metal');piece('#354c45',.055,.23,.055,s*1.02,.64,.22,'metal');for(const dz of[-.19,.17])piece('#c0b5a0',.025,.01,.025,s*.83,.607,dz,'metal');}
 }
 function sedge(x,z,s=.45){for(let j=0;j<10;j++){const a=j*2.399,h=s*(.6+random()*.5),r=s*.35;part('leaf',j%3?'#657b45':'#9b9b58',x+Math.cos(a)*r,.18+h*.46,z+Math.sin(a)*r,.045,h,1,-.25,a,.18,'leaf');}}
 function perennial(x,z,s=.4){for(let i=0;i<5;i++){const a=i*2.399,xx=x+Math.cos(a)*s*.35,zz=z+Math.sin(a)*s*.35,h=s*(.9+random()*.6);part('cyl','#64764b',xx,.18+h/2,zz,.012,h,.012,0,0,.08,'plain');for(let j=0;j<5;j++){const f=j/5*Math.PI*2;part('leaf',i%2?'#b593aa':'#d5c2ab',xx+Math.cos(f)*.045,.18+h,zz+Math.sin(f)*.045,.085,.10,1,Math.PI/2,f,0,'leaf');}part('rock0','#806c47',xx,.18+h+.016,zz,.035,.045,.035,0,0,0,'plain');}}
 function mulch(x,z,rx,rz){
  const points=[];for(let i=0;i<20;i++){const a=i/20*Math.PI*2,r=.9+.08*Math.sin(a*3+.7)+.05*Math.cos(a*5);points.push(new T.Vector2(x+Math.cos(a)*rx*r,-(z+Math.sin(a)*rz*r)));}
  const g=new T.ShapeGeometry(new T.Shape(points));g.rotateX(-Math.PI/2);g.translate(0,.151,0);
  const m=new T.Mesh(g,k.mat('#6c6450','soil'));m.receiveShadow=true;group.add(m);
 }
 function scatterBed(x,z,rx,rz,count){
  for(let i=0;i<count;i++){const a=random()*Math.PI*2,r=Math.sqrt(random()),xx=x+Math.cos(a)*rx*r,zz=z+Math.sin(a)*rz*r;
   if(paths.some(c=>distanceTo(c,xx,zz)<c.userData.width/2+.34)||waterways.some(c=>distanceTo(c,xx,zz)<c.userData.width/2+.18)||Math.hypot(xx-12,zz-29.4)<.7||[-20,-6,6,20].some(px=>Math.abs(xx-px)<.9&&Math.abs(zz-33)<2.7))continue;
   if(i%5===0)fern(xx,zz,.35+random()*.25);else if(i%4===0)perennial(xx,zz,.35+random()*.25);else sedge(xx,zz,.25+random()*.3);
   if(i%7===0)rock(xx,.19,zz,.12+random()*.12);
  }
 }
 for(const lot of parkLots){b('#7e975c',17.4,.12,12.6,lot.x,.08,33,0,'grass');for(const s of[-1,1]){b('#beb7a4',17.4,.08,.5,lot.x,.18,33+s*6.03);for(let j=0;j<24;j++)b('#a4a391',.014,.006,.5,lot.x-8.3+j*.72,.223,33+s*6.03);}}
 for(const p of[[-18.1,31.8,1.4,2.3],[-10.2,35.9,1.7,2.1],[-10,28.1,2,.5],[7.6,32.4,.65,1.4],[12.1,30.3,1.35,1.9],[14.1,28.1,1.5,.5],[17.3,37.8,2.4,.55]])mulch(...p);

 // WEST: a shallow rocky rill with a real timber crossing.
 const streamPoints=[[-19.2,28.2],[-17.8,29.4],[-15.8,30.6],[-14.2,32.8],[-11.4,34],[-8.6,36.9],[-7.2,37.8]];
 ribbon(streamPoints,1.5,'#726e5b',.16,'soil');
 const stream=water(streamPoints,.94,.208);
 path([[-21.3,37.7],[-18.1,36.5],[-14.2,32.8],[-10.5,29.3],[-4.7,28]],1.4);
 // Bed pebbles are visible through the water; bank stones are half buried.
 for(let i=0;i<170;i++){const t=random(),p=stream.getPoint(t),v=stream.getTangent(t),side=(random()-.5)*1.15;rock(p.x-v.z*side,.17,p.z+v.x*side,.035+random()*.10);}
 for(let i=0;i<57;i++){const t=(i+.5)/57,p=stream.getPoint(t),v=stream.getTangent(t),side=(i%2?1:-1)*(.59+random()*.14);if(Math.hypot(p.x+14.2,p.z-32.8)<1.35)continue;rock(p.x-v.z*side,.20+random()*.04,p.z+v.x*side,.20+random()*.23);if(i%3===0)sedge(p.x-v.z*(side+.25*Math.sign(side)),p.z+v.x*(side+.25*Math.sign(side)),.37);}
 const bridge={x:-14.2,z:32.8,angle:Math.PI/4,length:3.2,width:1.6};
 for(let j=0;j<21;j++){const d=-1.55+j*.155,xx=bridge.x+Math.cos(bridge.angle)*d,zz=bridge.z-Math.sin(bridge.angle)*d,y=.29+.11*Math.cos(d/1.6*Math.PI/2);b('#9c805a',.145,.075,1.6,xx,y,zz,bridge.angle,'wood');for(const s of[-1,1])b('#3f4a43',.024,.008,.024,xx+Math.sin(bridge.angle)*s*.65,y+.041,zz+Math.cos(bridge.angle)*s*.65,0,'metal');}
 for(const side of[-1,1])b('#524f3d',3.1,.14,.09,bridge.x+Math.sin(bridge.angle)*side*.72,.25,bridge.z+Math.cos(bridge.angle)*side*.72,bridge.angle,'wood');
 b('#c6bba5',3.3,.05,1.5,-16.6,.18,37.7,0,'gravel');bench(-16.6,38.15);
 for(const p of[[-18.6,28.5,.65],[-18.9,28.7,.38],[-17.9,28,.32],[-8,37.7,.43],[-8.5,37.6,.28],[-7,28.7,.55]])rock(p[0],.27,p[1],p[2]);
 scatterBed(-17.2,31.8,2.5,3.4,95);scatterBed(-10,35.7,2.3,2.9,95);scatterBed(-10,28.1,2.3,.65,35);

 // EAST: a paved reading terrace, water garden and perennial borders.
 path([[4.7,38],[8.5,36.6],[12.2,35.3],[16,35],[21.3,37.8]],1.35);
 path([[15.8,35],[16.8,33.7],[17.2,32.5]],1.15);
 for(let ix=0;ix<9;ix++)for(let iz=0;iz<5;iz++)b((ix+iz)%3?'#b9b3a0':'#c9c1ad',.55,.055,.55,8.1+ix*.575,.19,35.8+iz*.575,0,'stone');
 bench(9.8,38.35);bench(11.2,35.95,Math.PI);
 const px=17.1,pz=30.1;
 b('#6b746c',4.5,.20,3.6,px,.23,pz,0,'stone');b('#5b6659',4.03,.025,3.14,px,.336,pz,0,'stone');
 // Dark mosaic floor, individual limestone coping blocks and a thin waterline.
 for(let ix=0;ix<14;ix++)for(let iz=0;iz<11;iz++)b((ix+iz)%4?'#617b72':'#728a7e',.277,.015,.277,px-1.82+ix*.28,.355,pz-1.4+iz*.28,0,'ceramic');
 for(let j=0;j<10;j++)for(const s of[-1,1])b('#b6b6a2',.442,.14,.26,px-2.01+j*.447,.39,pz+s*1.7,0,'stone');
 for(let j=0;j<7;j++)for(const s of[-1,1])b('#b6b6a2',.26,.14,.432,px+s*2.12,.39,pz-1.31+j*.437,0,'stone');
 water([[px-1.96,pz],[px+1.96,pz]],3.08,.399);
 b('#787e67',.36,.60,.32,px+2.02,.65,pz,0,'metal');b('#84907f',.40,.035,.14,px+1.85,.90,pz,0,'metal');
 const sheet=new T.Mesh(new T.PlaneGeometry(.13,.47),waterMat);sheet.position.set(px+1.64,.65,pz);sheet.rotation.y=Math.PI/2;sheet.material=waterMat.clone();sheet.material.side=T.DoubleSide;group.add(sheet);
 for(let i=0;i<90;i++){const a=random()*Math.PI*2,r=.7+random()*.7;rock(8.1+Math.cos(a)*r,.19,29.3+Math.sin(a)*r,.06+random()*.12);}
 for(const p of[[7.7,29.3,.65],[8.2,29.1,.39],[8.7,29.6,.28]])rock(p[0],.25,p[1],p[2]);
 shrub(8,29.6,.65);fern(9.1,29,.5);
 scatterBed(14.1,28.1,1.6,.65,45);scatterBed(17.3,37.8,2.5,.65,60);scatterBed(7.6,32.4,.65,1.4,40);scatterBed(12.1,30.3,1.4,2.1,65);
 // Modest park fixtures; no new trees in the four building sightlines.
 for(const [x,z] of[[-19,38.1],[6.5,38.1]]){b('#45594d',.38,.62,.38,x,.48,z,0,'metal');b('#777f69',.44,.04,.44,x,.81,z,0,'metal');b('#20372e',.24,.025,.17,x,.836,z,0,'plain');}
 for(const [x,z] of[[-21,28],[-5,37.8],[5,28],[21,37.8]]){b('#394f46',.10,.65,.10,x,.49,z,0,'metal');b('#52655a',.20,.055,.20,x,.84,z,0,'metal');const m=new T.Mesh(new T.BoxGeometry(.14,.07,.14),new T.MeshStandardMaterial({color:'#e6d2a5',emissive:'#e6bd7e',emissiveIntensity:.45}));m.position.set(x,.78,z);group.add(m);}
 for(const lot of parkLots)for(let i=0;i<90;i++){const x=lot.x+(random()-.5)*16,z=27.5+random()*10.6;if(waterways.some(c=>distanceTo(c,x,z)<c.userData.width/2+.1))continue;part('leaf',['#a66e36','#bd8d43','#8b633e'][i%3],x,.226,z,.07+random()*.06,.13+random()*.07,1,-Math.PI/2,0,random()*6.28,'leaf');}
 // Shared city greenery roots in these beds; preserve their exact soil height.
 for(const x of[-20,-6,6,20]){b('#879580',1.1,.38,5,x,.34,33);b('#615c42',.87,.04,4.76,x,.55,33);}
 k.flush();group.userData.parkLots=parkLots;group.userData.design='Woodland rill and timber crossing / limestone reading garden';
 group.userData.bridge=bridge;group.userData.seats=seats;
 return{group,parkLots,paths,waterways,waterClock,update(dt){if(dt>0)waterClock.value+=Math.min(dt,.1);}};
}
