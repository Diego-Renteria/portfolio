import * as T from '../three.module.js?v=b477ce33502c';
import {GLTFLoader} from '../vendor/loaders/GLTFLoader.js?v=b477ce33502c';
import {ALBUM_ATLAS} from './album-inventory.js?v=b477ce33502c';
import {albumTexture} from './album-sleeves.js?v=b477ce33502c';
import {ARCHITECTURE,entriesFor,turntableEntry} from './room-catalog.js?v=rooms-1';

const unit=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(.5,20,14);
const cone=new T.CylinderGeometry(.5,.5,1,26);
const rounded=new T.BoxGeometry(1,1,1,5,5,5);
for(let i=0;i<rounded.attributes.position.count;i++){
  const p=new T.Vector3().fromBufferAttribute(rounded.attributes.position,i);
  const inside=p.clone().clampScalar(-.36,.36);
  p.sub(inside).normalize().multiplyScalar(.14).add(inside);
  rounded.attributes.position.setXYZ(i,...p);
}
rounded.computeVertexNormals();
const shared=new Set([unit,sphere,cone,rounded]);
const scans=new Map(),assetCache=new Map(),textureLoader=new T.TextureLoader();
const paperColors=['#876052','#797553','#657977','#a27e5d','#9b837d','#656987','#b5a187'];
const views=[
  [3.7,2.77,7.3],[-2.6,2.64,7.6],[3.0,2.94,7.9],[-3.8,2.98,7.6],
  [2.9,3.28,7.8],[-3.2,2.78,8.0],[2.65,2.95,7.3],[-3.7,2.90,7.65],
  [3.75,2.50,7.6],[-2.7,2.70,7.7],
];
const defaultFinishes={
  library:{plan:'archive',wall:'#7d8b74',wood:'#66503a',floor:'#a29482',accent:'#ffbd76',fill:'#bac6b1'},
  music:{plan:'listening',wall:'#505460',wood:'#70534b',floor:'#a8a296',accent:'#bd79af',fill:'#929ec4'},
  maker:{plan:'minimal',wall:'#959b9a',wood:'#9d826d',floor:'#aaa8a1',accent:'#8ba8bd',fill:'#c6d1d8',light:'#fff2df'},
};
const up=new T.Vector3(0,1,0);
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function assetPath(relative){return new URL('../assets/'+relative,import.meta.url).href;}
function scan(file,repeat,color=false){
  const key=file+repeat+color;
  if(!scans.has(key)){
    const texture=textureLoader.load(assetPath('materials/'+file+'_768.webp'));
    texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(...repeat);
    texture.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;texture.anisotropy=4;
    texture.userData.shared=true;scans.set(key,texture);
  }
  return scans.get(key);
}
function material(color,options={}){
  return new T.MeshStandardMaterial({color,roughness:.78,...options});
}
function lightMat(color,intensity=.6){return material(color,{emissive:color,emissiveIntensity:intensity});}

function place(parent,geometry,mat,scale,x,y,z,angle=0){
  const mesh=new T.Mesh(geometry,mat);
  mesh.scale.set(...scale);mesh.position.set(x,y,z);mesh.rotation.y=angle;
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
const box=(g,w,h,d,m,x,y,z,r=0)=>place(g,unit,m,[w,h,d],x,y,z,r);
const soft=(g,w,h,d,m,x,y,z,r=0)=>place(g,rounded,m,[w,h,d],x,y,z,r);
const ball=(g,w,h,d,m,x,y,z)=>place(g,sphere,m,[w,h,d],x,y,z);
const cyl=(g,r,h,m,x,y,z)=>place(g,cone,m,[r*2,h,r*2],x,y,z);
function beam(g,a,b,r,m){
  const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),center=A.lerp(B,.5);
  const mesh=cyl(g,r,d.length(),m,...center);
  mesh.quaternion.setFromUnitVectors(up,d.normalize());return mesh;
}
function group(g,x=0,y=0,z=0,angle=0){
  const holder=new T.Group();holder.position.set(x,y,z);holder.rotation.y=angle;g.add(holder);return holder;
}
function artTexture(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  draw(c.getContext('2d'),w,h);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
function imagePlane(g,w,h,map,x,y,z,angle=0,glow=false){
  const m=glow?new T.MeshBasicMaterial({map,side:T.DoubleSide}):material('#ffffff',{map,side:T.DoubleSide});
  const mesh=place(g,new T.PlaneGeometry(w,h),m,[1,1,1],x,y,z,angle);
  mesh.castShadow=false;return mesh;
}
function lettering(ctx,text,x,y,width,size,color='#f5e5d1'){
  ctx.font='600 '+size+'px sans-serif';ctx.textAlign='left';ctx.fillStyle=color;ctx.fillText(text,x,y,width);
}
function picture(title,i,book=false){
  const colors=['#747e7b','#9a684f','#566475','#82765d','#8a5260','#655b74'];
  return artTexture(256,book?336:288,(ctx,w,h)=>{
    const fill=ctx.createLinearGradient(0,0,w,h);fill.addColorStop(0,colors[i%6]);fill.addColorStop(1,'#1c262c');
    ctx.fillStyle=fill;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#fff7e673';ctx.lineWidth=1;ctx.strokeRect(11,11,w-22,h-22);
    if(i%3===0){
      ctx.fillStyle='#e6be8cb9';ctx.beginPath();ctx.arc(w*.62,h*.33,w*.18,0,Math.PI*2);ctx.fill();
      for(let j=0;j<7;j++){ctx.fillStyle=j%2?'#222c35':'#293741';ctx.fillRect(w*.10+j*23,h*.58-(j*17%55),21,67+j*17%55);}
    }else if(i%3===1){
      for(let j=0;j<12;j++){ctx.strokeStyle='#efdfbd68';ctx.beginPath();ctx.ellipse(w*.48,h*.43,38+j*6,54+j*5,j*.14,0,Math.PI*2);ctx.stroke();}
    }else{
      ctx.fillStyle='#bba894';ctx.beginPath();ctx.moveTo(18,h*.67);ctx.lineTo(w*.43,h*.23);ctx.lineTo(w*.71,h*.53);ctx.lineTo(w-14,h*.32);ctx.lineTo(w-14,h*.75);ctx.lineTo(18,h*.75);ctx.closePath();ctx.fill();
    }
    lettering(ctx,title,22,h-31,w-43,18);
  });
}
function skyline(room,seed){
  return artTexture(700,370,(ctx,w,h)=>{
    const r=rng(seed+393),sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,room.plan==='sunlit'?'#8899ad':'#182b4a');sky.addColorStop(.76,'#637e99');sky.addColorStop(1,'#7b6d7b');
    ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    for(let pass=0;pass<2;pass++)for(let x=-10;x<w;x+=24+22*r()){
      const width=18+35*r(),high=28+r()*155,y=h-high-(pass===0?38:1);
      ctx.fillStyle=pass===0?'#445e76':'#263d54';ctx.fillRect(x,y,width,high+39);
      for(let a=6;a<width-3;a+=9)for(let b=9;b<high-2;b+=12){
        if(r()<.63)continue;
        ctx.fillStyle=r()<.74?'#c2a17a':'#8da9c0';ctx.globalAlpha=.31+r()*.41;ctx.fillRect(x+a,y+b,3,4);
      }
      ctx.globalAlpha=1;
    }
    if(room.plan==='loft'||room.plan==='blue'){
      ctx.strokeStyle='#beddf326';
      for(let i=0;i<125;i++){const x=r()*w,y=r()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+13+r()*13);ctx.stroke();}
    }
  });
}

function loadAsset(id){
  if(!assetCache.has(id))assetCache.set(id,new GLTFLoader().loadAsync(assetPath('curated/'+id+'/'+id+'.gltf')).then(({scene})=>{
    scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
    scene.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;node.userData.shared=true;}});
    return{scene,size,center,base:bounds.min.y};
  }));
  return assetCache.get(id);
}
function furnish(holder,id,width,x,y,z,angle=0){
  const stand=group(holder,x,y,z,angle);
  void loadAsset(id).then(({scene,size,center,base})=>{
    if(stand.parent===null||holder.userData.disposed)return;
    const model=scene.clone(true),scaled=group(stand);scaled.scale.setScalar(width/size.x);
    model.position.set(-center.x,-base,-center.z);scaled.add(model);
  }).catch(()=>{});
}

function roomKit(world,room,seed,kind){
  const P=room,back=-P.depth/2,left=-P.width/2,right=-left,H=P.height;
  const wood=material(P.wood,{normalMap:scan('wood_floor_deck_nor_gl',[2,2])});
  const floor=kind==='maker'&&[0,1,4,5,8].includes(seed)
    ?material(P.floor,{map:scan('plastered_wall_04_diff',[4,4],true),normalMap:scan('plastered_wall_04_nor_gl',[4,4]),roughness:.81,normalScale:new T.Vector2(.36,.36)})
    :material(P.floor,{map:scan('wood_floor_deck_diff',[4,4],true),normalMap:scan('wood_floor_deck_nor_gl',[4,4]),roughnessMap:scan('wood_floor_deck_rough',[4,4]),roughness:.85,normalScale:new T.Vector2(.55,.55)});
  const wall=material(P.wall,{normalMap:scan('plastered_wall_04_nor_gl',[3,2])});
  const trim=material('#303238',{roughness:.53,metalness:.26});
  const cream=material('#d9cdb9'),brass=material('#a18662',{metalness:.54,roughness:.39});
  const fabric=material(P.fabric,{roughness:.97}),rug=material(P.rug,{roughness:1});
  const brick=material(P.wall,{map:scan('red_brick_03_diff',[3,1.4],true),normalMap:scan('red_brick_03_nor_gl',[3,1.4])});
  box(world,P.width,.18,P.depth+.85,floor,0,-.10,.05);
  box(world,.16,H,P.depth,wall,left,H/2,0);box(world,.16,H,P.depth,wall,right,H/2,0);
  const glass=skyline(P,seed);
  const plan=P.plan, side=plan==='corner'||plan==='archive'&&seed!==0?-1:1;
  const windowWidth=plan==='minimal'?5.2:plan==='gallery'?2.6:plan==='timber'?4.2:3.2;
  const windowX=side*(plan==='minimal'?1.5:2.65),winY=H*.61,winH=Math.min(2.35,H-.8);
  const x0=windowX-windowWidth/2,x1=windowX+windowWidth/2,y0=winY-winH/2,y1=winY+winH/2;
  const backing=plan==='loft'||plan==='archive'?brick:wall;
  box(world,x0-left,H,.15,backing,(x0+left)/2,H/2,back);
  box(world,right-x1,H,.15,backing,(x1+right)/2,H/2,back);
  box(world,windowWidth,y0,.15,backing,windowX,y0/2,back);
  box(world,windowWidth,H-y1,.15,backing,windowX,(H+y1)/2,back);
  imagePlane(world,windowWidth,winH,glass,windowX,winY,back+.075,0,true);
  for(const x of [x0,x1,windowX])box(world,.048,winH+.12,.11,trim,x,winY,back+.14);
  for(const y of [y0,y1,winY])box(world,windowWidth+.10,.055,.11,trim,windowX,y,back+.14);
  box(world,windowWidth+.20,.07,.26,wood,windowX,y0-.035,back+.18);
  if(plan==='corner'||plan==='blue')imagePlane(world,3.3,1.88,glass,left+.10,2.04,-1.86,Math.PI/2,true);
  if(plan==='minimal'||plan==='sunlit'){
    for(const x of [x0+.06,x1-.06])for(let i=0;i<8;i++){
      const curtain=material(i%2?'#b3a797':'#cfc4ae',{roughness:1});
      soft(world,.11,winH+.28,.13,curtain,x+(x<windowX?-.07:.07)*i,winY,back+.21+Math.cos(i)*.06);
    }
  }
  if(plan==='timber'||plan==='listening'||plan==='blue'){
    for(let i=0;i<22;i++){
      const z=back+.2+i*.16;
      box(world,.065,H*.9,.070,wood,plan==='blue'?left+.13:right-.13,H*.48,z);
    }
  }
  if(plan==='timber'||plan==='loft'){
    for(let i=0;i<5;i++)box(world,P.width,.14,.13,wood,0,H-.09,back+.42+i*.92);
  }
  if(plan==='gallery'){
    for(const y of [.12,H-.13])box(world,P.width,.10,.10,cream,0,y,back+.13);
    for(const x of [-3.9,-1.3,1.3,3.9])box(world,.044,H,.064,trim,x,H/2,back+.14);
  }
  if(plan==='den')soft(world,7.9,.075,5.8,wood,.2,.01,0);
  box(world,P.width,.11,.10,wood,0,.07,back+.13);
  const hemi=new T.HemisphereLight(P.fill,'#5c4846',1.24);world.add(hemi);
  const key=new T.SpotLight(P.light,55,17,Math.PI*.25,.69,1.6);
  key.position.set(-2.6,H-.12,3);key.target.position.set(-.4,.35,-1.2);
  key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0004;key.shadow.normalBias=.026;
  world.add(key,key.target);
  const fill=new T.DirectionalLight(P.fill,.82);fill.position.set(windowX,3.2,-.6);world.add(fill);
  const accent=new T.PointLight(P.accent,kind==='about'?11:8,6.4,1.58);accent.position.set(2.7,1.8,back+1);world.add(accent);
  return {P,back,left,right,H,wood,trim,cream,brass,fabric,rug,wall};
}

function planter(g,x,z,scale=1){
  const pot=material('#a88469'),stem=material('#537350'),leaf=material('#566746');
  const root=group(g,x,0,z);root.scale.setScalar(scale);
  cyl(root,.22,.35,pot,0,.18,0);cyl(root,.24,.055,pot,0,.355,0);
  for(let i=0;i<9;i++){
    const angle=i*2.399,px=Math.cos(angle)*(.14+i*.027),pz=Math.sin(angle)*(.14+i*.025),h=.62+i*.105;
    beam(root,[0,.36,0],[px,h,pz],.012,stem);
    const f=ball(root,.26,.080,.14,leaf,px,h,pz);f.rotation.set(.35,angle,.45);
  }
}
function lamp(g,k,x,z,height,glow,top=false){
  const brass=k.brass,diffuser=lightMat(glow,.74);
  cyl(g,height*.12,.046,brass,x,.024,z);
  cyl(g,.020,height,brass,x,height*.5,z);
  const shade=new T.Mesh(new T.CylinderGeometry(height*.10,height*.16,height*.145,40,1,true),diffuser);
  shade.material.side=T.DoubleSide;shade.position.set(x,height,z);g.add(shade);
  const bulb=new T.PointLight(glow,top?16:9,top?5:4,1.8);bulb.position.set(x,height-.06,z);g.add(bulb);
}
function table(g,k,x,y,z,width,depth,angle=0){
  const root=group(g,x,0,z,angle);
  soft(root,width,.095,depth,k.wood,0,y,0);
  for(const dx of [-1,1])for(const dz of [-1,1])box(root,.065,y,.065,k.trim,dx*(width*.5-.13),y*.5,dz*(depth*.5-.12));
  return root;
}
function speakers(g,k,x,y,z,scale=1){
  const root=group(g,x,y,z);root.scale.setScalar(scale);
  soft(root,.49,.82,.40,k.wood,0,.42,0);
  box(root,.43,.76,.026,k.trim,0,.42,.209);
  for(const [h,r] of [[.34,.148],[.64,.059]]){
    const coneMesh=cyl(root,r,.035,k.brass,0,h,.229);coneMesh.rotation.x=Math.PI/2;
    const cap=ball(root,r*1.56,r*1.56,.046,k.trim,0,h,.253);cap.castShadow=false;
  }
}

function apartment(world,k,entries,screen,register,seed){
  const {P,back,wood,trim,cream,brass,fabric,rug}=k;
  const places=[
    [-1.05,back+.35,.04,1.40],[-2.1,back+.28,.03,1.25],[-1.6,back+.42,.18,1.72],
    [2.15,back+.37,-.12,1.3],[0,back+.64,0,1.28],[-2.15,back+.31,0,1.63],
    [1.70,back+.35,-.16,1.30],[-2.0,back+.41,.1,1.47],[-.15,back+.40,.16,1.43],
    [-1.78,back+.34,-.09,1.47],
  ];
  const [x,z,angle,sofaZ]=places[seed],tv=group(world,x,0,z,angle),screenY=P.plan==='den'?1.43:1.73;
  const panel=soft(tv,2.87,1.69,.095,trim,0,screenY,0);panel.castShadow=false;
  screen.position.set(0,screenY,.052);tv.add(screen);
  const bias=new T.PointLight(P.accent,9,3.4,1.72);bias.position.set(0,screenY,-.13);tv.add(bias);
  const cabinetY=.28;
  soft(tv,3.36,.50,.61,wood,0,cabinetY,.08);
  for(let i=0;i<16;i++)box(tv,.024,.40,.018,brass,-1.5+i*.2,cabinetY,.39);
  for(const sx of [-1.89,1.89])speakers(tv,k,sx,.04,.06,.63);
  register(entries.find(e=>e.id==='tv'),tv,[0,screenY,.10],{screen:true});
  const sofaX=x+([3,6,8].includes(seed)?-.35:.42),sofaYaw=Math.atan2(sofaX-x,sofaZ-z);
  const couch=group(world,sofaX,0,sofaZ,sofaYaw);
  const cushion=material(P.fabric,{roughness:1}),contrast=material(seed%2?'#8f9b8e':'#986454');
  soft(couch,3.28,.32,1.10,fabric,0,.30,0);
  for(let i=0;i<3;i++){
    soft(couch,.88,.23,.80,cushion,-.92+i*.92,.52,-.06);
    soft(couch,.90,.63,.24,fabric,-.92+i*.92,.80,.41);
  }
  for(const sx of [-1,1]){
    soft(couch,.27,.40,1.07,fabric,sx*1.52,.57,.01);
    const p=soft(couch,.42,.43,.18,contrast,sx*1.01,.79,.26);p.rotation.z=sx*.27;
  }
  for(const sx of [-1,1])for(const zz of [-.36,.36])cyl(couch,.042,.18,wood,sx*1.25,.095,zz);
  if([2,4,7].includes(seed))soft(couch,.9,.42,.82,fabric,-.94,.29,-.74);
  const throwMat=material(seed%2?'#ba987e':'#868d75',{roughness:1});
  soft(couch,.47,.065,.75,throwMat,-1.12,.65,-.10);
  for(let n=0;n<14;n++)box(couch,.017,.105,.014,throwMat,-1.34+n*.034,.57,-.48);
  const mid=(z+sofaZ)*.5;
  soft(world,5.72,.028,3.85,rug,x+.10,.028,mid);
  const coffee=group(world,x+.24,0,mid+.24,.08);
  if([1,2,4,8].includes(seed)){
    cyl(coffee,.62,.080,wood,0,.39,0);cyl(coffee,.18,.34,trim,0,.18,0);
    cyl(coffee,.33,.064,brass,.76,.29,.23);cyl(coffee,.13,.24,trim,.76,.135,.23);
  }else{
    soft(coffee,1.50,.080,.78,wood,0,.40,0);
    for(const sx of [-.59,.59])for(const sz of [-.25,.25])box(coffee,.056,.37,.056,trim,sx,.20,sz);
  }
  cyl(coffee,.10,.125,cream,.39,.49,.12);cyl(coffee,.083,.012,trim,.39,.558,.12);
  soft(coffee,.34,.055,.25,brass,-.20,.47,-.16);
  lamp(world,k,sofaX+(seed%2?-1.98:2.03),sofaZ+.18,1.65,P.light,true);
  planter(world,k.right-1.15,back+1.13,1.05);
  if(seed!==4)furnish(world,'mid_century_lounge_chair',.90,k.right-1.55,0,-.27,-.64);
  const frames=entries.filter(e=>e.kind==='photo');
  const wallX=-Math.sign(views[seed][0]);
  const frameGroup=group(world,wallX*(k.right-.11),0,back+2.09,wallX*-Math.PI/2);
  for(const [i,item] of frames.entries()){
    const column=i%2,row=Math.floor(i/2),holder=group(frameGroup,(column-.5)*1.02,1.28+row*.93,0);
    box(holder,.89,.77,.062,wood,0,0,.04);
    imagePlane(holder,.82,.70,picture(item.slot,i),0,0,.076,0,true);
    register(item,holder,[0,.19,.09],{label:i===0||i===3});
  }
  const stool=table(world,k,sofaX-2.0,.54,sofaZ-.73,.61,.52,-.14);
  lamp(group(stool,0,.60,0),k,0,0,.49,P.accent,false);
}

function bookJacket(entry,i){
  return artTexture(240,320,(ctx,w,h)=>{
    ctx.fillStyle=entry.color;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#f4e7cc99';ctx.lineWidth=2;ctx.strokeRect(11,11,w-22,h-22);
    ctx.strokeRect(15,15,w-30,h-30);
    lettering(ctx,'READING SHELF',26,49,w-52,13);
    for(let n=0;n<12;n++){ctx.strokeStyle='#eadbb64f';ctx.beginPath();ctx.ellipse(w*.5,h*.48,17+n*4,22+n*4,n*.21+i,0,Math.PI*2);ctx.stroke();}
    lettering(ctx,String(entry.number).padStart(2,'0'),29,h-64,w-58,42);
    lettering(ctx,'BOOK PLACEHOLDER',28,h-30,w-56,14);
  });
}
function editorialBookJacket(entry,i){
  return artTexture(240,320,(ctx,w,h)=>{
    const gradient=ctx.createLinearGradient(0,0,w,h);
    gradient.addColorStop(0,entry.color);gradient.addColorStop(1,'#252830');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    const ink='#f0e1bd';
    ctx.strokeStyle='#f0e1bd80';ctx.lineWidth=1.5;ctx.strokeRect(13,13,w-26,h-26);
    lettering(ctx,entry.category.toUpperCase(),25,40,w-50,12,ink);
    switch(i%4){
      case 0:
        ctx.fillStyle='#ecd6a689';ctx.beginPath();ctx.arc(143,114,40,0,Math.PI*2);ctx.fill();
        for(let n=0;n<5;n++){
          ctx.fillStyle=n%2?'#172733bb':'#31444abb';
          ctx.beginPath();ctx.moveTo(25,209-n*13);ctx.lineTo(66+n*13,151-n*6);ctx.lineTo(215,206-n*9);ctx.lineTo(215,219);ctx.lineTo(25,219);ctx.fill();
        }
        break;
      case 1:
        ctx.save();ctx.translate(w*.52,h*.43);ctx.rotate(-.42);
        for(let n=0;n<6;n++){ctx.strokeStyle=n%2?'#e4bd80be':'#f4dec476';ctx.strokeRect(-52+n*7,-54+n*7,104-n*14,109-n*14);}
        ctx.restore();
        break;
      case 2:
        ctx.fillStyle='#e6d5aa';ctx.fillRect(38,63,164,143);
        ctx.strokeStyle='#465852';ctx.lineWidth=2;
        for(let n=0;n<7;n++){
          ctx.beginPath();ctx.ellipse(119,135,11+n*9,15+n*7,n*.19,0,Math.PI*2);ctx.stroke();
        }
        break;
      case 3:
        ctx.strokeStyle='#f5d497b8';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(69,204);ctx.quadraticCurveTo(116,147,171,75);ctx.stroke();
        ctx.fillStyle='#f1d39c9e';
        for(let n=0;n<7;n++){
          const x=82+n*12,y=190-n*16;
          ctx.beginPath();ctx.ellipse(x+(n%2?15:-12),y,20-n,6,n%2?-.45:.7,0,Math.PI*2);ctx.fill();
        }
        break;
    }
    ctx.font='600 23px Georgia,serif';ctx.fillStyle=ink;ctx.fillText(entry.title,25,255,w-50);
    lettering(ctx,'PLACEHOLDER  /  '+String(entry.number).padStart(2,'0'),25,286,w-50,11,ink);
  });
}
function bookMesh(holder,entry,i,edition){
  const paper=material('#d9c5a3'),wrap=material(entry.color);
  soft(holder,.42,.61,.09,paper,0,0,0);
  box(holder,.433,.626,.018,wrap,0,0,-.051);
  box(holder,.061,.626,.104,wrap,-.204,0,0);
  if(edition>=2)box(holder,.433,.626,.018,wrap,0,0,.054);
  const tex=entry.cover?textureLoader.load(entry.cover):edition>=2?editorialBookJacket(entry,i):bookJacket(entry,i);
  tex.colorSpace=T.SRGBColorSpace;
  imagePlane(holder,.421,.608,tex,0,0,edition>=2?.064:.053);
}
function fillerSpines(world,k,x,y,z,count,seed,width){
  const r=rng(seed),o=new T.Object3D(),m=material('#ffffff'),mesh=new T.InstancedMesh(unit,m,count);
  for(let i=0;i<count;i++){
    const h=.23+r()*.33;o.position.set(x+(i+.5)*width/count,y+h*.5,z);
    o.scale.set(width/count*.86,h,.245+r()*.06);o.rotation.z=(r()-.5)*.10;o.updateMatrix();
    mesh.setMatrixAt(i,o.matrix);mesh.setColorAt(i,new T.Color(paperColors[i%paperColors.length]).multiplyScalar(.74+r()*.25));
  }
  mesh.castShadow=true;mesh.receiveShadow=true;world.add(mesh);
}
function lightReadingDesk(desk,k){
  const {P,brass,cream,trim,wood}=k,x=-.55,z=-.17;
  cyl(desk,.105,.023,brass,x,.84,z);
  beam(desk,[x,.86,z],[x-.10,1.19,z],.018,brass);
  beam(desk,[x-.10,1.19,z],[x+.16,1.27,z+.045],.018,brass);
  const shade=place(desk,new T.CylinderGeometry(.067,.14,.112,22),trim,[1,1,1],x+.16,1.23,z+.05);
  shade.rotation.z=.32;
  cyl(desk,.095,.01,lightMat(P.light,.65),x+.18,1.178,z+.05).rotation.z=.32;
  const taskLight=new T.SpotLight(P.light,2.9,1.65,Math.PI/4,.78,1.8);
  taskLight.position.set(x+.18,1.16,z+.05);taskLight.target.position.set(.13,.83,.14);
  desk.add(taskLight,taskLight.target);

  const book=group(desk,.16,0,.13,.10),spread=artTexture(320,220,(ctx,w,h)=>{
    ctx.fillStyle='#e8d6b0';ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#a68e66';ctx.fillRect(w/2-1,9,2,h-18);
    ctx.fillStyle='#79694c';
    for(const offset of [25,184])for(let i=0;i<11;i++)ctx.fillRect(offset,39+i*11,i===10?72:110,2);
  });
  soft(book,.53,.020,.34,wood,0,.837,0);
  soft(book,.49,.024,.31,cream,0,.854,0);
  const pages=imagePlane(book,.48,.30,spread,0,.867,0);
  pages.rotation.x=-Math.PI/2;
}
function library(world,k,entries,register,seed,edition=0){
  const {P,back,wood,cream,rug,brass}=k;
  const shelfPlans={minimal:{x:-3.16,width:2.90},sunlit:{x:-1.98,width:4.40},timber:{x:-2.0,width:4.60},corner:{x:1.86,depth:.72},gallery:{depth:.72},archive:{x:seed===6?1.90:-1.50}};
  const plan=edition>=1?shelfPlans[P.plan]:null;
  const rail=group(world,plan?.x??(seed===3||seed===6?1.75:-1.50),0,back+(plan?.depth??.42),seed===3?-.20:seed===5?.19:0);
  const width=plan?.width??(seed===5?5.8:5.45),rows=[1.02,1.77,2.52];
  const shelfCap=edition>=1?3.22:2.88;
  const stileHeight=edition>=1?3.25:2.90,backingHeight=edition>=1?3.21:2.83;
  box(rail,width+.20,backingHeight,.09,wood,0,edition>=1?1.62:1.43,-.24);
  const stiles=edition>=1?[-width/2,0,width/2]:[-width/2,-width/6,width/6,width/2];
  for(const x of stiles)box(rail,.076,stileHeight,.62,wood,x,stileHeight/2,.02);
  for(const y of [.25,...rows,shelfCap]){
    box(rail,width,.055,.65,wood,0,y,.042);
    box(rail,width,.019,.025,brass,0,y+.027,.365);
  }
  fillerSpines(rail,k,-width*.49,.29,.03,41,seed+49,width*.98);
  const shelfCategories=['Reading list','Recommendations','Notes'];
  const categoryRows=shelfCategories.map(category=>entries.filter(entry=>entry.category===category));
  const organized=edition>=2&&categoryRows.every(row=>row.length===4);
  const shelfEntries=organized?categoryRows.flat():entries;
  const labels={reading:'Reading now',quote:'A passage',rating:'Rating notes'};
  for(const [slot,entry] of shelfEntries.entries()){
    const r=Math.floor(slot/4),x=(slot%4-1.5)*width*.235,holder=group(rail,x,rows[r]+.33,.32,-.05+(slot%4)*.035);
    const index=entry.number-1;
    bookMesh(holder,entry,index,edition);
    register(entry,holder,[0,.22,.06],{movable:true,label:Boolean(labels[entry.id]),labelText:edition>=1?labels[entry.id]:undefined});
  }
  if(organized)for(const [row,category] of shelfCategories.entries()){
    const plaque=artTexture(256,32,(ctx,w,h)=>{
      ctx.fillStyle='#433322';ctx.fillRect(0,0,w,h);lettering(ctx,category.toUpperCase(),12,23,w-24,20);
    });
    imagePlane(rail,.73,.055,plaque,0,rows[row],.381);
  }
  if(edition>=2){
    const led=lightMat(P.light,.50);
    for(const y of [...rows.slice(1),shelfCap]){
      const bar=box(rail,width-.34,.012,.025,led,0,y-.035,.306);bar.castShadow=false;
    }
    for(const x of [-width*.25,width*.25]){
      const shelfLight=new T.PointLight(P.light,1.85,2.5,1.65);
      shelfLight.position.set(x,2.40,.59);rail.add(shelfLight);
    }
  }
  const side=seed===3||seed===6?-1:1;
  const reading=table(world,k,side*2.65,.78,-.83,1.84,1.01,seed===2?.45:.09);
  soft(world,3.05,.035,2.34,rug,side*2.64,.025,-.40,.08);
  furnish(world,'mid_century_lounge_chair',.94,side*2.4,0,.98,Math.PI-.18);
  if(edition>=1)furnish(world,'wooden_bookshelf_worn',.85,side*(k.right-.55),0,.45,-side*Math.PI/2);
  else furnish(world,'wooden_bookshelf_worn',1.02,-side*(k.right-1.3),0,-1.85,side*Math.PI/2);
  if(edition>=2)lightReadingDesk(reading,k);
  else{
    lamp(reading,k,-.54,-.18,1.16,P.light,false);
    soft(reading,.39,.064,.28,cream,.24,.84,.12,.12);
  }
  cyl(reading,.081,.13,cream,.58,.89,.22);
  planter(world,side*(k.right-1.0),back+1.25,.85);
  const wallSide=-Math.sign(views[seed][0]);
  const sideShelf=group(world,wallSide*(k.right-.39),0,edition>=1&&P.plan==='blue'?1.12:back+2.04,-wallSide*Math.PI/2);
  const sideWidth=seed===5?1.83:2.28;
  box(sideShelf,sideWidth,.094,.48,wood,0,1.11,0);
  for(const x of [-1,1])box(sideShelf,.068,1.1,.38,wood,x*(sideWidth/2-.09),.55,0);
  fillerSpines(sideShelf,k,-sideWidth*.48,1.16,-.12,16,seed+73,sideWidth*.80);
  imagePlane(sideShelf,.78,.98,picture('Reading room',seed+1),.38,2.12,-.18);
  if([2,6,7].includes(seed)){
    const ladder=group(rail,-width*.45,0,.66,-.07);
    for(const sx of [-.18,.18])beam(ladder,[sx,.03,.32],[sx,2.54,-.10],.022,brass);
    for(let i=0;i<8;i++)box(ladder,.36,.026,.064,wood,0,.28+i*.29,.29-i*.048);
  }
}

function albumJacket(g,entry,size){
  const {columns,rows,tile,gutter}=ALBUM_ATLAS,index=entry.index,col=index%columns,row=Math.floor(index/columns);
  const geo=new T.PlaneGeometry(size,size),uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(col+(gutter+(tile-2*gutter)*uv.getX(i))/tile)/columns,
    (rows-1-row+(gutter+(tile-2*gutter)*uv.getY(i))/tile)/rows);
  const m=material('#ffffff',{map:albumTexture(T),roughness:.73});
  m.map.userData.shared=true;
  const cover=place(g,geo,m,[1,1,1],0,0,.031);cover.castShadow=false;
  soft(g,size,size,.056,material('#27252a'),0,0,0);
}
function recordShop(world,k,entries,register,seed,page,edition=0){
  const {P,back,wood,cream,trim,brass}=k;
  const wallX=seed===3||seed===8?1.38:-1.49,display=group(world,wallX,0,back+.44,seed===5?.14:0);
  box(display,5.20,2.43,.10,wood,0,1.43,-.18);
  for(const y of [.78,1.63,2.48])box(display,5.20,.065,.41,wood,0,y,.10);
  if(edition>=1){
    const warm=lightMat('#ffdeb0',.68);
    for(const y of [.76,1.59,2.45])box(display,4.98,.028,.034,warm,0,y,.22);
    const light=new T.PointLight('#ffcb99',10,5,1.7);light.position.set(0,2.25,1.15);display.add(light);
  }
  if(edition>=2){
    const sign=artTexture(768,124,(ctx,w,h)=>{ctx.fillStyle='#251e1b';ctx.fillRect(0,0,w,h);lettering(ctx,'RECORDS / LISTENING ROOM',32,80,w-64,51);});
    imagePlane(display,3.65,.42,sign,0,2.85,.045,0,true);
    planter(world,k.left+.8,back+2.95,1.15);
  }
  for(const [i,entry] of entries.slice(page*12,page*12+12).entries()){
    const row=Math.floor(i/6),x=(i%6-2.5)*.79,holder=group(display,x,1.12+row*.86,.23,-.04+(i%4)*.025);
    albumJacket(holder,entry,.65);
    register(entry,holder,[0,.18,.04],{movable:true,label:i===0||i===7});
  }
  const turnX=wallX<0?2.43:-2.55,z=seed===2?-2.01:-1.13;
  const counter=table(world,k,turnX,.96,z,1.72,.92,-.10);
  soft(counter,1.25,.13,.67,trim,0,1.08,0);
  cyl(counter,.33,.03,brass,-.14,1.169,0);
  const record=group(counter,-.14,1.195,0);
  cyl(record,.325,.024,material('#202129',{roughness:.48}),0,0,0);
  for(let i=0;i<9;i++){
    const ring=place(record,new T.TorusGeometry(.16+i*.017,.0018,4,72),material('#343039'),[1,1,1],0,.014,0);
    ring.rotation.x=Math.PI/2;
  }
  cyl(record,.10,.016,lightMat('#bb583f',.17),0,.017,0);
  box(record,.086,.008,.023,cream,.038,.028,0);
  beam(counter,[.47,1.23,-.25],[.35,1.27,.16],.016,brass);
  beam(counter,[.35,1.27,.16],[.18,1.22,.22],.016,brass);
  speakers(world,k,turnX-.64,0,z-.56,1.00);
  speakers(world,k,turnX+.64,0,z-.56,1.00);
  register(turntableEntry(),counter,[0,1.35,0],{label:true});
  const side=turnX>0?-1:1;
  for(let n=0;n<2;n++){
    const bin=table(world,k,side*(1.08+n*1.78),.82,seed===4?.79:1.34-n*.41,1.44,.81,(n-.5)*.11);
    for(const x of [-.68,.68])box(bin,.06,.32,.82,wood,x,1.01,0);
    for(const zz of [-.38,.38])box(bin,1.44,.31,.06,wood,0,1.01,zz);
    const binEntry=entries[(page*12+Math.min(n,entries.length-1))%entries.length];
    if(binEntry){
      const sleeve=group(bin,0,1.16,.32,.08);albumJacket(sleeve,binEntry,.55);sleeve.rotation.x=-.13;
      sleeve.userData.entry=binEntry.id;
    }
    for(let i=0;i<12;i++)box(bin,1.25,.32,.027,material(paperColors[(i+n)%paperColors.length]),0,.97,-.34+i*.050);
  }
  furnish(world,'boombox',.56,k.right-1.15,1.1,back+.89,-.32);
  lamp(world,k,turnX+(turnX>0?1.11:-1.11),z+.22,1.68,P.accent,true);
  const wallSide=-Math.sign(views[seed][0]);
  const displayRail=group(world,wallSide*(k.right-.13),0,back+1.86,-wallSide*Math.PI/2);
  box(displayRail,2.46,.065,.27,wood,0,1.93,.025);
  for(let i=0;i<3;i++){
    const item=entries[(page*12+i+4)%entries.length];
    const sleeve=group(displayRail,(i-1)*.80,2.26,.12,(i-1)*.06);
    albumJacket(sleeve,item,.60);
    if(i+4<entries.length-page*12)sleeve.userData.entry=item.id;
  }
  return {record};
}

function prototype(g,id,k){
  const blue=material('#4a7199',{metalness:.23,roughness:.33}),gold=material('#d5a84e',{metalness:.53,roughness:.4});
  const black=k.trim,white=k.cream,orange=material('#d77d43'),signal=lightMat('#58aee9',.85);
  if(id==='nova-pod'){
    ball(g,.67,.67,.67,black,0,.36,0);
    const bezel=cyl(g,.247,.075,k.brass,0,.37,.269);bezel.rotation.x=Math.PI/2;
    const face=cyl(g,.211,.014,signal,0,.37,.315);face.rotation.x=Math.PI/2;
    for(let i=0;i<3;i++)box(g,.11-i*.013,.009,.005,white,.02,.32+i*.049,.325);
  }else if(id==='robot-arm'){
    cyl(g,.26,.13,blue,0,.10,0);
    const a=[0,.16,0],b=[-.18,.51,0],c=[.10,.78,0],d=[.34,.73,0];
    for(const [j,[p,q]] of [[a,b],[b,c],[c,d]].entries()){
      beam(g,p,q,.060,blue);ball(g,.152,.152,.118,j===1?gold:black,...p);
    }
    for(const y of [.68,.77])beam(g,d,[.44,y,.06],.019,gold);
  }else if(id==='drone-gimbal'){
    box(g,.51,.08,.32,black,0,.54,0);
    for(const x of [-.28,.28])beam(g,[x,.51,0],[x,.31,0],.041,black);
    beam(g,[-.28,.31,0],[.23,.31,0],.045,gold);
    soft(g,.30,.23,.25,black,0,.22,.022);
    const lens=cyl(g,.083,.058,blue,0,.22,.17);lens.rotation.x=Math.PI/2;
    for(const x of [-.16,.16])beam(g,[x,.04,-.18],[x,.04,.18],.018,black);
  }else if(id==='head-exoskeleton'){
    cyl(g,.22,.06,black,0,.04,0);cyl(g,.055,.30,gold,0,.20,0);
    ball(g,.39,.56,.42,white,0,.53,0);ball(g,.11,.15,.13,white,0,.46,.205);
    for(const x of [-.22,.22]){
      beam(g,[x,.25,-.18],[x,.73,-.04],.022,blue);beam(g,[x,.73,-.04],[x,.68,.14],.022,blue);
    }
  }else if(id==='monster-mash'){
    cyl(g,.095,.79,black,0,.49,0);
    const tip=place(g,new T.ConeGeometry(.094,.27,32),white,[1,1,1],0,1.02,0);
    tip.castShadow=true;
    for(let i=0;i<3;i++){const tail=group(g,0,0,0,i*Math.PI*2/3);box(tail,.018,.29,.18,orange,0,.23,.12);}
    cyl(g,.15,.043,black,0,.05,0);
  }else{
    for(const x of [-.20,.20]){
      const tube=new T.Mesh(new T.CylinderGeometry(.15,.15,.26,28,1,true),orange);
      tube.material.side=T.DoubleSide;tube.position.set(x,.18,0);g.add(tube);
      cyl(g,.142,.05,orange,x,.07,0);ball(g,.15,.19,.15,white,x,.20,0);
    }
  }
}
const workshopStations=[
  {label:'Drone gimbal',name:'01 / FLIGHT SYSTEMS',finish:'rubber',size:.92},
  {label:'Nova Pod',name:'02 / PRODUCT DEVELOPMENT',finish:'maple',size:1.02},
  {label:'Robot arm',name:'03 / MECHATRONICS',finish:'steel',size:1.04},
  {label:'Head exoskeleton',name:'04 / HUMAN FACTORS',finish:'maple',size:.93},
  {label:'Monster Mash',name:'05 / FLIGHT TEST',finish:'steel',size:.94},
  {label:'Payload housing',name:'06 / MATERIALS & PACKAGING',finish:'rubber',size:1.07},
];

function addWorkshopEquipment(desk,k,stationIndex,benchHeight,finishes){
  const {P,trim,cream,brass}=k;
  const {steel,rubber,blue,green,red,maple}=finishes;
  const y=benchHeight+.053;
  const mat=soft(desk,1.15,.012,.60,stationIndex===3?rubber:blue,-.12,y,.02);
  mat.castShadow=false;
  for(let i=0;i<7;i++){
    const line=box(desk,.004,.002,.045,steel,-.55+i*.14,y+.008,.285);
    line.castShadow=false;
  }

  if(stationIndex===0){
    box(desk,.46,.018,.24,green,.62,y+.02,.05,.12);
    for(let n=0;n<5;n++)box(desk,.042,.024,.066,steel,.46+n*.075,y+.038,.06,.12);
    for(const x of [.47,.76])cyl(desk,.04,.025,brass,x,y+.05,-.15);
  }else if(stationIndex===1){
    soft(desk,.38,.10,.23,rubber,.61,y+.075,.06,-.16);
    soft(desk,.30,.018,.17,blue,.61,y+.13,.06,-.16);
    cyl(desk,.092,.033,steel,.51,y+.027,-.25);
    cyl(desk,.051,.05,trim,.73,y+.034,-.22);
  }else if(stationIndex===2){
    soft(desk,.45,.071,.28,trim,.62,y+.048,.09,.10);
    for(const x of [.47,.61,.75]){
      beam(desk,[x,y+.06,.07],[x+.045,y+.19,.034],.013,steel);
      ball(desk,.043,.043,.043,red,x+.045,y+.19,.034);
    }
    for(let n=0;n<3;n++)box(desk,.077,.052,.11,n%2===0?maple:steel,.48+n*.10,y+.027,-.18);
  }else if(stationIndex===3){
    soft(desk,.42,.10,.22,rubber,.59,y+.055,.05,.12);
    for(const x of [.49,.67])soft(desk,.09,.048,.17,cream,x,y+.127,.058,.12);
    box(desk,.14,.022,.31,steel,.60,y+.019,-.17,-.28);
  }else if(stationIndex===4){
    const gauge=box(desk,.46,.019,.052,brass,.59,y+.025,.02,.25);
    gauge.castShadow=false;
    for(const x of [.41,.74])box(desk,.08,.05,.105,steel,x,y+.041,.05,.25);
    for(let n=0;n<3;n++)box(desk,.37,.053,.017,red,.57,y+.036,-.15-n*.058,.16);
  }else{
    const sample=soft(desk,.48,.072,.31,trim,.60,y+.040,.03,.08);
    sample.castShadow=false;
    for(let n=0;n<3;n++)soft(desk,.105,.041,.16,[cream,rubber,maple][n],.46+n*.14,y+.09,.03,.08);
  }

  const sheet=artTexture(160,95,(ctx,w,h)=>{
    ctx.fillStyle='#dee6db';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#507369';ctx.lineWidth=2;ctx.strokeRect(9,9,w-18,h-18);
    ctx.lineWidth=1;
    for(let n=0;n<5;n++){ctx.beginPath();ctx.moveTo(17,46+n*6);ctx.lineTo(99-n*9,46+n*6);ctx.stroke();}
    lettering(ctx,workshopStations[stationIndex].name,16,29,w-31,12,'#2f4844');
    ctx.beginPath();ctx.arc(121,56,16,0,Math.PI*2);ctx.stroke();
  });
  const page=imagePlane(desk,.36,.22,sheet,.53,y+.010,.26);
  page.rotation.set(-Math.PI/2,0,-.12);

  if([0,2,4].includes(stationIndex)){
    const glow=stationIndex===2?P.fill:P.light;
    const bulb=lightMat(glow,1.3);
    cyl(desk,.065,.019,trim,-.68,y+.017,-.29);
    const arm=[-.68,y+.34,-.29],joint=[-.62,y+.60,-.28],head=[-.38,y+.68,-.21];
    beam(desk,[-.68,y,-.29],arm,.018,steel);
    beam(desk,arm,joint,.014,steel);
    beam(desk,joint,head,.014,steel);
    soft(desk,.23,.051,.11,trim,...head,.20);
    box(desk,.19,.010,.082,bulb,head[0],head[1]-.025,head[2],.20).castShadow=false;
    const task=new T.SpotLight(glow,4.3,2.1,.55,.75,1.6);
    task.position.set(head[0],head[1]-.036,head[2]);
    task.target.position.set(-.18,y,.025);
    desk.add(task,task.target);
  }
}

function workshop(world,k,entries,register,seed,edition=0){
  const {P,back,wood,trim,brass,cream}=k;
  const width=[2.12,2.25,1.93,2.2,2.33,2.45,1.91,2.21,2.05,2.36][seed];
  const spread=[2.70,2.85,2.53,2.97,2.81,3.03,2.54,2.84,2.62,2.91][seed];
  const furnished=edition>=2;
  const finishes=furnished?{
    steel:material('#59676d',{metalness:.43,roughness:.53}),rubber:material('#354147',{roughness:.94}),
    maple:material('#9b7a58',{map:scan('wood_floor_deck_diff',[1.3,1],true),roughness:.68}),
    blue:material('#315868',{roughness:.94}),green:material('#39655d'),red:material('#a46143'),
  }:null;
  for(const [i,entry] of entries.entries()){
    const station=workshopStations[i];
    const col=i%3-1,row=Math.floor(i/3);
    let x=col*spread+(row&&[3,4,9].includes(seed)?.52:0);
    let z=row?.78:back+1.46+(seed===6?Math.abs(col)*.44:0);
    let yaw=seed===2||seed===8?col*-.12:seed===4?.13:0;
    if(furnished&&i===4){x-=.19;z+=.31;yaw-=.19;}
    const height=furnished?[.96,.90,.98,.90,.97,.90][i]:.94;
    const depth=furnished?[.86,.91,.88,.94,.94,1.02][i]:.87;
    const frame=furnished?{...k,wood:finishes[station.finish]}:k;
    const desk=table(world,frame,x,height,z,width*(furnished?station.size:1),depth,yaw);
    const y=height+.055,base=group(desk,-.08,y,.03);
    prototype(base,entry.id,k);
    const plaque=artTexture(256,64,(g,w,h)=>{
      g.fillStyle='#272e39';g.fillRect(0,0,w,h);lettering(g,furnished?station.name:entry.short,13,40,w-26,19);
    });
    imagePlane(desk,.69,.16,plaque,-.52,height-.03,depth/2+.015,0,true);
    if(furnished){
      addWorkshopEquipment(desk,k,i,height,finishes);
      if(i===2||i===5){
        const drawer=soft(desk,.43,.44,.62,finishes.steel,.65,height-.285,.03);
        drawer.castShadow=false;
        for(let n=0;n<3;n++)box(desk,.29,.021,.035,finishes.rubber,.65,height-.42+n*.125,.35);
      }
    }else{
      for(let n=0;n<3;n++)box(desk,.32+n*.045,.018,.22,k.cream,.65,y+.017*n,.04,.15*n);
      for(let n=0;n<4;n++)cyl(desk,.018,.030,brass,.47+n*.08,y+.025,-.24);
    }
    if(furnished?i===0||i===2:(i+seed)%2===0){
      box(desk,.50,.33,.026,trim,.59,1.29,-.32);
      const osc=artTexture(128,76,(g,w,h)=>{g.fillStyle='#23334a';g.fillRect(0,0,w,h);g.strokeStyle='#a4cdad';g.beginPath();for(let j=0;j<=w;j++){const y=h*.5+Math.sin(j*.16)*h*.24;if(j)g.lineTo(j,y);else g.moveTo(j,y);}g.stroke();});
      imagePlane(desk,.45,.265,osc,.59,1.29,-.301,0,true);
    }
    const flags={label:true};
    if(edition>=1){
      desk.userData.entry=entry.id;
      flags.labelText=station.label;
      flags.labelAnchor=new T.Vector3(0,[.68,.57,.87,.63,1.65,.50][i],.08);
    }
    register(entry,base,[0,entry.id==='monster-mash'?1.10:.57,.08],flags);
  }
  furnish(world,'metal_tool_chest',.93,k.right-.88,0,back+1.55,-.3);
  furnish(world,'steel_frame_shelves_03',1.42,k.left+1.0,0,back+.60,0);
  const wallSide=-Math.sign(views[seed][0]);
  const pegboard=group(world,wallSide*(k.right-.14),0,back+2.32,-wallSide*Math.PI/2);
  const pegTexture=artTexture(420,240,(ctx,w,h)=>{
    ctx.fillStyle='#726d62';ctx.fillRect(0,0,w,h);ctx.fillStyle='#363631';
    for(let x=9;x<w;x+=13)for(let y=9;y<h;y+=13){ctx.beginPath();ctx.arc(x,y,1.9,0,Math.PI*2);ctx.fill();}
  });
  box(pegboard,2.88,1.66,.055,trim,0,1.95,0);
  imagePlane(pegboard,2.78,1.56,pegTexture,0,1.95,.03);
  for(let i=0;i<6;i++){
    const x=-.98+i*.37,y=1.94+(i%2)*.22;
    const shaft=beam(pegboard,[x,y-.32,.085],[x,y+.16,.085],.028,i%2?brass:trim);
    if(i%3===0){const handle=cyl(pegboard,.048,.20,wood,x,y-.22,.085);handle.quaternion.copy(shaft.quaternion);}
    else box(pegboard,.10,.084,.045,brass,x,y+.15,.084,.32);
  }
  for(const x of [-2.9,0,2.9]){
    const task=lightMat(P.light,.78);box(world,1.82,.043,.072,task,x,P.height-.47,-.54);
    const lamp=new T.PointLight(P.light,4.2,4.9,1.66);lamp.position.set(x,P.height-.52,-.54);world.add(lamp);
  }
}

export function buildRoom(kind,preset,{screen,musicPage=0,edition=0}={}){
  const world=new T.Group();
  const profile=preset===0?{...ARCHITECTURE[0],...defaultFinishes[kind]}:ARCHITECTURE[preset];
  const k=roomKit(world,profile,preset,kind),targets=new Map();
  const entries=entriesFor(kind);
  function register(entry,object,anchor,flags={}){
    object.userData.entry=entry.id;
    targets.set(entry.id,{entry,object,anchor:new T.Vector3(...anchor),rest:object.position.clone(),...flags});
  }
  let record;
  if(kind==='about')apartment(world,k,entries,screen,register,preset);
  if(kind==='library')library(world,k,entries,register,preset,edition);
  if(kind==='music')({record}=recordShop(world,k,entries,register,preset,musicPage,edition));
  if(kind==='maker')workshop(world,k,entries,register,preset,edition);
  world.updateMatrixWorld(true);
  return {world,targets,record,profile,camera:views[preset]};
}

export function disposeRoom(room,screen){
  const materials=new Set(),geometries=new Set(),textures=new Set();
  room.world.traverse(mesh=>{
    mesh.userData.disposed=true;
    if(mesh===screen||mesh.userData.shared)return;
    if(mesh.geometry&&!shared.has(mesh.geometry))geometries.add(mesh.geometry);
    if(mesh.isInstancedMesh)mesh.dispose();
    for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])if(m){
      materials.add(m);if(m.map&&!m.map.userData.shared)textures.add(m.map);
    }
    if(mesh.shadow)mesh.shadow.dispose();
  });
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}

export function createTVScreen(){
  const image=artTexture(640,360,(ctx,w,h)=>{
    const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#192235');g.addColorStop(1,'#586791');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#c8bcf370';ctx.lineWidth=1;ctx.strokeRect(28,28,w-56,h-56);
    lettering(ctx,'PHINEAS AND FERB',66,h*.53,w-132,40);
    lettering(ctx,'THE APARTMENT TV',67,h*.65,w-132,15,'#bfc9e0');
  });
  return new T.Mesh(new T.PlaneGeometry(2.70,1.51875),new T.MeshBasicMaterial({map:image}));
}
