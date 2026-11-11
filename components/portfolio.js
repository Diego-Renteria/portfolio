import {buildApartmentInteriors} from './apartment-interiors.js?v=b477ce33502c';
import {buildLibraryInteriors} from './library-interiors.js?v=b477ce33502c';
import {buildRecordInteriors} from './record-interiors.js?v=b477ce33502c';
import {buildMakerInterior} from './maker-interior.js?v=b477ce33502c';
import {buildInteriorDetails} from './interior-detail.js?v=b477ce33502c';
import {detailKit} from './detail-kit.js?v=b477ce33502c';
import {createApartmentLighting} from './apartment-lighting.js?v=b477ce33502c';
import {createOpenNeon} from './open-neon.js?v=b477ce33502c';
export function buildPortfolio(ctx){
  const {THREE:T,world,material,random=Math.random,label,glowMaterials=[]}=ctx;
  const group=new T.Group();group.name='Diego’s portfolio block';world.add(group);
  // Building transforms preserve the street-facing edge while creating deeper
  // rooms behind it. Every facade, sign, pick volume and animated interior uses
  // the same parent so interaction and moving equipment stay aligned.
  const buildingSpecs={projects:{oldX:-12,x:-17.1,sx:7.5/4.9,sy:1.08},about:{oldX:-5.8,x:-8.3,sx:7.5/4.9,sy:1.08},lately:{oldX:5.8,x:8.3,sx:7.5/4.9,sy:1.08},music:{oldX:12,x:17.1,sx:7.5/4.9,sy:1.08}};
  const buildings={};
  for(const [id,s]of Object.entries(buildingSpecs)){
    const g=new T.Group();g.name=id+' destination architecture';g.scale.set(s.sx,s.sy,12.5/6);g.position.set(s.x-s.oldX*s.sx,0,17-12.5*12.5/6);group.add(g);buildings[id]=g;
  }
  let currentBuilding=null,openNeon;const storefrontSigns=[];
  const geo=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,14),batches=new Map(),clickables=[],anchors={};
  const M={brick:material('#92563f','brick'),home:material('#926b52','brick'),stone:material('#c9c4b2','stone'),concrete:material('#a3a899','stone'),trim:material('#d6cbb5','stone'),metal:material('#354744','metal'),roof:material('#52625d','concrete'),wood:material('#a67649','wood'),darkwood:material('#6c4d36','wood'),soil:material('#594938'),green:material('#657d52'),leaf:material('#9b9d5b'),glass:material('#73918f','glass'),desk:material('#c4ac82'),black:material('#283839'),paper:material('#e6dcc6'),warm:material('#efd1a0')};
  M.glass=M.glass.clone();M.glass.transparent=true;M.glass.opacity=.17;M.glass.depthWrite=false;
  M.warm=M.warm.clone();M.warm.emissive=new T.Color('#dba35a');M.warm.emissiveIntensity=.12;glowMaterials.push(M.warm);
  const monitor=material('#9bb8aa').clone();monitor.emissive=new T.Color('#88b5a6');monitor.emissiveIntensity=.25;glowMaterials.push(monitor);
  const sideGlass=material('#41625f','glass').clone();sideGlass.roughness=.25;sideGlass.metalness=.35;
  const fabrication=material('#b5ddc7').clone();fabrication.emissive=new T.Color('#83c8ad');fabrication.emissiveIntensity=.4;glowMaterials.push(fabrication);
  const books=['#a25037','#b9954d','#667c6c','#e2d5b6','#677f8a','#765d60'].map(c=>material(c));
  function add(w,h,d,mat,x,y,z,rot=[0,0,0],geometry=geo){
    const key=(currentBuilding||'ground')+':'+mat.uuid;
    let b=batches.get(key);if(!b){b={parts:[],material:mat,parent:currentBuilding?buildings[currentBuilding]:group};batches.set(key,b)}b.parts.push({w,h,d,x,y,z,rot,geometry});
  }
  const box=(w,h,d,m,x,y,z,r)=>add(w,h,d,m,x,y,z,r);
  const pole=(r,h,m,x,y,z)=>add(r,h,r,m,x,y,z,[0,0,0],cyl);
  function floor(x,y,w=4.9,depth=6){box(w,.18,depth,M.concrete,x,y,9.5)}
  function shell(x,height,w=4.9){
    box(w,height,.22,M.brick,x,height/2,6.5);
    box(.22,height,6,M.brick,x-w/2,height/2,9.5);box(.22,height,6,M.brick,x+w/2,height/2,9.5);
    floor(x,.13,w);floor(x,height,w);
  }
  function warmRoom(x,y,w=4.4,d=5.5){box(w,2.3,.045,M.warm,x,y+1.15,7.15);box(w,.06,d,M.wood,x,y+.15,9.5)}
  function framedWindow(x,y,w,h,z=12.55,frame=M.trim){
    box(w,h,.035,M.glass,x,y,z);for(const xx of [-w/2,w/2])box(.065,h+.1,.12,frame,x+xx,y,z+.035);
    for(const yy of [-h/2,h/2])box(w+.12,.065,.14,frame,x,y+yy,z+.035);

  }
  function planter(x,y,z,w=.6){box(w,.3,.42,M.darkwood,x,y+.15,z);box(w-.09,.03,.33,M.soil,x,y+.31,z);for(let i=0;i<5;i++)pole(.10+random()*.04,.35+random()*.25,i%2?M.green:M.leaf,x+(random()-.5)*(w-.12),y+.46,z+(random()-.5)*.23)}
  function chair(x,y,z){box(.45,.08,.45,M.metal,x,y+.48,z);box(.45,.5,.07,M.metal,x,y+.77,z-.21);for(const xx of [-.16,.16])for(const zz of [-.16,.16])pole(.025,.45,M.metal,x+xx,y+.25,z+zz)}
  function desk(x,y,z,width=1.35){box(width,.09,.64,M.desk,x,y+.9,z);for(const xx of [-width*.42,width*.42])box(.055,.84,.45,M.metal,x+xx,y+.45,z);box(.62,.43,.055,M.black,x,y+1.2,z-.06);box(.54,.35,.012,monitor,x,y+1.2,z-.025);box(.035,.18,.035,M.metal,x,y+.98,z-.06);box(.45,.025,.18,M.black,x,y+.96,z+.17);chair(x,y,z+.68)}
  function hvac(x,y,z,w=1.1){box(w,.62,.9,M.concrete,x,y+.31,z);box(w+.05,.05,.94,M.metal,x,y+.66,z);for(let i=0;i<6;i++)box(w*.8,.025,.025,M.metal,x,y+.12+i*.075,z+.46);pole(.28,.055,M.metal,x,y+.7,z)}
  function sign(text,x,y,w=3.8,bg='#29483f'){
    const face=currentBuilding==='lately'?13.12:12.835;
    box(w+.14,.73,.16,M.metal,x,y,face-.095);
    const signFace=label(text,w,.58,x,y,face,bg,'#f1e2bf',buildings[currentBuilding]||group);
    // A backlit face keeps its actual lettering readable after dark. The mapped
    // emission preserves dark sign backgrounds instead of glowing as a white box.
    signFace.material.emissiveMap=signFace.material.map;signFace.material.emissive.set('#fff0d5');signFace.material.emissiveIntensity=0;signFace.material.needsUpdate=true;storefrontSigns.push(signFace);
    for(const xx of[-w/2,w/2])pole(.025,.07,M.trim,x+xx,y,face+.015);
  }
  function pick(id,x,height,width=5){const mesh=new T.Mesh(new T.BoxGeometry(width,height,6.4),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));mesh.position.set(x,height/2,9.5);mesh.userData.place=id;buildings[id].add(mesh);clickables.push(mesh);anchors[id]=new T.Vector3(x,height+.2,9.5)}
  // Downtown destinations have paved forecourts rather than suburban lawns.
  for(const [x,width] of [[-17.1,8],[-8.3,8],[8.3,8],[17.1,8]]){
    box(width,.06,14.2,M.concrete,x,.16,11.5);
    box(width,.025,1.1,M.stone,x,.203,18.1);
    for(let xx=-width/2+.75;xx<width/2;xx+=.75)box(.012,.008,14.1,M.trim,x+xx,.195,11.5);
    for(let z=4.8;z<18.65;z+=.8)box(width,.008,.012,M.trim,x,.195,z);
    box(2.35,.08,.62,M.stone,x,.23,18.3);
  }
  // Engineering maker space: cantilevered metal volumes, tall workshop glazing.
  {
    currentBuilding='projects';
    const x=-12;box(4.9,7.25,.25,M.concrete,x,3.6,6.5);for(const xx of [-2.35,2.35])box(.2,7.25,6,M.concrete,x+xx,3.6,9.5);floor(x,3.55);floor(x,7.25);
    for(const xx of [-2.35,0,2.35])box(.14,7.2,.26,M.metal,x+xx,3.6,12.5);
    for(const yy of [.3,3.5,6.7])box(4.9,.14,.35,M.metal,x,yy,12.52);
    for(const xx of [-1.2,1.2]){framedWindow(x+xx,1.9,2.03,2.8,12.57,M.metal);framedWindow(x+xx,5.18,2.03,2.55,12.57,M.metal)}

    sign('MAKER SPACE',x,7.04,4.4,'#343f38');
    box(5.2,.12,1.1,M.metal,x,3.25,12.91);for(const xx of [-2.2,2.2])box(.055,.8,.055,M.metal,x+xx,3.6,13.3,[0,0,xx>0?.45:-.45]);
    box(5.2,.28,6.5,M.metal,x,7.52,9.5);box(3.8,.75,4.6,M.glass,x+.3,7.95,9.1);box(4.15,.13,4.95,M.trim,x+.3,8.36,9.1);
    for(const xx of [-1.55,-.35,.85,2.05])box(.05,.75,4.65,M.metal,x+xx,7.95,9.1);
    // Diagonal structural braces and ribs give the laboratory its own silhouette.
    // Side braces keep the main equipment windows unobstructed.
    box(.12,3.1,.12,M.trim,x-2.3,5,12.65,[0,0,-.12]);box(.12,3.1,.12,M.trim,x+2.3,5,12.65,[0,0,.12]);
    for(let z=7;z<12;z+=.42)box(.12,7.15,.075,M.trim,x-2.51,3.57,z);
    box(.12,6.6,.12,M.metal,x-2.59,3.3,6.7);hvac(x+1.1,7.95,8.3,.8);planter(x-1.6,.1,13.25,.9);pick('projects',x,8.65);anchors.projects.set(x,7.5,13);
  }
  // Modern apartment tower: a tall glass silhouette, planted balconies and lobby.
  {
    currentBuilding='about';
    const x=-5.8,h=17,w=4.9;box(w,h,.28,M.stone,x,h/2,6.5);floor(x,.12);floor(x,h);
    for(const xx of [-2.4,2.4])box(.3,h,6,M.stone,x+xx,h/2,9.5);
    // Wrap the curtain wall around both sides; no blank slab faces the arrival camera.
    for(const side of [-1,1]){
      const sx=x+side*2.57;
      for(let y=1.6;y<h-.4;y+=2.2){
        for(let i=0;i<4;i++){
          const z=7.3+i*1.45,glass=(i+Math.round(y))%5===0?M.warm:sideGlass;
          box(.035,1.87,1.22,glass,sx,y,z);
          for(const dz of [-.65,.65])box(.095,1.99,.045,M.metal,sx,y,z+dz);
          for(const dy of [-.98,.98])box(.1,.045,1.34,M.metal,sx,y+dy,z);
          box(.09,.04,1.24,M.metal,sx,y+.25,z);
        }
        box(.12,.13,6.1,M.trim,sx,y-1.02,9.5);
      }
      for(const z of [6.55,12.45])box(.14,h,.13,M.metal,sx,h/2,z);
    }
    let apartmentIndex=0;
    for(let y=3.2;y<16;y+=2.2){
      floor(x,y);
      // Alternate recessed and projecting balconies; the tea room uses an open
      // timber rail and the conservatory's terrace extends across its garden.
      const bx=x+[-.95,.88,0,.95,0,-.92][apartmentIndex],bw=[2.05,1.8,2.85,1.75,3.55,2.0][apartmentIndex];
      const balconyMat=apartmentIndex===2?M.darkwood:M.metal;
      box(bw,.12,.83,balconyMat,bx,y+.12,13);
      if(apartmentIndex!==2)box(bw,.68,.035,M.glass,bx,y+.53,13.4);
      else for(let v=-bw/2+.12;v<bw/2;v+=.22)box(.035,.64,.045,M.darkwood,bx+v,y+.5,13.4);
      box(bw+.05,.045,.06,M.trim,bx,y+.88,13.4);
      for(const xx of [-bw/2+.04,bw/2-.04])pole(.025,.75,M.metal,bx+xx,y+.51,13.4);
      if(apartmentIndex!==3)planter(bx-bw*.28,y+.2,13.13,apartmentIndex===4?1.25:.65);
      framedWindow(x,y+1.12,4.4,1.94,12.55,M.metal);
      const mullion=[.7,-.85,1.15,-1.1,0,.95][apartmentIndex];
      box(.045,1.94,.09,M.metal,x+mullion,y+1.12,12.61);
      box(4.65,.18,.32,M.stone,x,y+.05,12.6);
      apartmentIndex++;
    }
    // Drawn-back linen at two different homes leaves the rooms visible.
    for(const [y,side]of[[5.4,-1],[12,1]]){
      box(4.2,.025,.025,M.metal,x,y+2.01,12.35);
      for(let j=0;j<9;j++)pole(.042,1.84,M.paper,x+side*(1.5+j*.065),y+1.13,12.33+(j%2)*.035);
    }
    framedWindow(x,1.55,4.4,2.65,12.55,M.metal);
    for(const xx of[-.5,.5])box(.045,2.2,.12,M.metal,x+xx,1.35,12.66);
    for(const xx of[-.38,.38])box(.035,.35,.045,M.trim,x+xx,1.25,12.75);
    for(const xx of [-2.3,2.3])box(.18,h,.32,M.stone,x+xx,h/2,12.6);
    box(5.2,.22,6.3,M.trim,x,h+.05,9.5);box(4.7,.35,5.7,M.metal,x,h+.32,9.5);
    box(4.85,.12,1.45,M.metal,x,2.78,12.95);box(4.65,.045,1.35,M.glass,x,2.87,12.95);
    for(const xx of [-1.85,1.85])pole(.045,2.8,M.metal,x+xx,1.4,13.55);
    sign('DIEGO / HOME',x,3.15,3.7);hvac(x-1.15,h+.5,8.2);hvac(x+.6,h+.5,8.2,.9);box(.1,.08,2.4,M.metal,x-1.15,h+.7,10);planter(x+1.35,h+.5,11.4,1.2);pick('about',x,17.7);anchors.about.set(x,14,13);
  }
  // Neighborhood library: a small civic building with columns and shelves that really contain books.
  {
    currentBuilding='lately';
    const x=5.8,h=8;box(4.9,h,.3,M.stone,x,h/2,6.5);for(const xx of [-2.35,2.35])box(.3,h,6,M.stone,x+xx,h/2,9.5);floor(x,.22);floor(x,h);
    // Open reading hall with a rear-only mezzanine, furnished by its component.
    framedWindow(x,3.85,4.15,6.9,12.54,M.metal);
    for(const xx of[-.72,.72])box(.045,6.6,.1,M.metal,x+xx,3.8,12.62);
    box(4.15,.065,.12,M.metal,x,2.7,12.63);
    framedWindow(x,1.45,1.3,2.25,12.65,M.darkwood);
    box(.045,.3,.04,M.trim,x+.4,1.25,12.76);
    for(const xx of [-2.25,2.25]){
      pole(.16,7.1,M.trim,x+xx,3.8,12.82);box(.48,.18,.46,M.trim,x+xx,.3,12.82);box(.46,.18,.46,M.trim,x+xx,7.4,12.82);
    }
    box(5.25,.32,.7,M.trim,x,7.6,12.72);sign('LIBRARY',x,7.65,4.3,'#4d5b4a');
    box(5.3,.23,6.35,M.trim,x,8.12,9.5);box(4.9,.28,5.9,M.roof,x,8.36,9.5);
    box(4.8,.12,.3,M.trim,x,8.6,12.5);for(let xx=-2;xx<=2;xx+=.4)box(.16,.46,.2,M.trim,x+xx,8.85,12.5);box(4.8,.12,.32,M.trim,x,9.1,12.5);
    for(let step=0;step<3;step++)box(3.7-step*.2,.12,1.35-step*.34,M.stone,x,.06+step*.12,13.08-step*.17);
    for(const side of [-1,1]){
      box(.045,.045,1.3,M.metal,x+side*1.7,.85,13.2);for(const z of [12.65,13.7])pole(.025,.72,M.metal,x+side*1.7,.44,z);
    }
    planter(x-2,.12,13.45,.7);planter(x+2,.12,13.45,.7);hvac(x+1,8.52,8,.8);pick('lately',x,9.25);anchors.lately.set(x,8.6,13);
  }
  // The record shop is low, warm and tactile: a rounded vinyl sign, bins and turntables.
  {
    currentBuilding='music';
    const x=12,h=4.8;box(4.9,h,.25,M.home,x,h/2,6.5);for(const xx of [-2.4,2.4])box(.22,h,6,M.home,x+xx,h/2,9.5);floor(x,.13);floor(x,h);
    box(4.9,.5,.3,M.home,x,3.9,12.52);box(4.9,.3,.3,M.home,x,.15,12.52);
    for(const xx of [-1.5,1.5])framedWindow(x+xx,1.9,1.75,3.1,12.57,M.metal);
    framedWindow(x,1.75,.85,2.9,12.59,M.wood);box(.045,.26,.05,M.trim,x+.23,1.3,12.7);
    sign('RECORD STORE',x,4.15,4.45,'#96573f');
    openNeon=createOpenNeon(T,buildings.music,[x-1.55,2.52,12.65],random);
    box(1.13,.54,.045,M.metal,x-1.55,2.52,12.61);
    box(5.1,.12,1.05,M.green,x,3.52,12.92);box(5.1,.27,.06,M.green,x,3.35,13.43);
    for(let xx=-2.4;xx<2.5;xx+=.48)box(.18,.13,1.05,M.trim,x+xx,3.53,12.92);
    box(5.2,.15,6.2,M.metal,x,4.96,9.5);box(1.65,.6,1.4,M.wood,x-1.4,5.4,8);
    const discMat=material('#202927');
    // Projecting record emblem identifies the shop from the overview.
    box(.045,.045,.8,M.metal,x+2.2,4.5,13);add(.48,.07,.48,discMat,x+2.2,4.02,13.3,[Math.PI/2,0,0],cyl);add(.14,.08,.14,books[1],x+2.2,4.02,13.34,[Math.PI/2,0,0],cyl);
    planter(x-2,.1,13.25,.65);hvac(x+.8,5.05,8.2,.8);pick('music',x,5.8);anchors.music.set(x,5.55,13);
  }
  const dummy=new T.Object3D();
  // One draw call per material and geometry across all four buildings.
  for(const b of batches.values())for(const geometry of [geo,cyl]){
    const parts=b.parts.filter(p=>p.geometry===geometry);if(!parts.length)continue;
    const mesh=new T.InstancedMesh(geometry,b.material,parts.length);mesh.castShadow=!b.material.transparent;mesh.receiveShadow=true;
    parts.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.rotation.set(...p.rot);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});mesh.computeBoundingSphere();b.parent.add(mesh);
  }
  const interiors=[buildApartmentInteriors(ctx,group),buildLibraryInteriors(ctx,group),buildRecordInteriors(ctx,group),buildMakerInterior(ctx,group)];
  // Built joinery, reveals and roof hardware give the cutaway shells real thickness.
  for(const [id,spec]of Object.entries(buildingSpecs)){
    const k=detailKit(ctx,buildings[id],id+' crafted envelope'),x=spec.oldX,metal=k.mat('#3e504e','metal'),stone=k.mat('#c7c1ad','stone'),rubber=k.mat('#263b3b','rubber'),bronze=k.mat('#a58a5d','metal');
    const levels=id==='about'?[.25,3.2,6.2,9.2,12.2,15.2,18.2]:id==='projects'?[.25,3.7,7.35]:id==='lately'?[.25,3.4,8.5]:[.25,3.5,4.95];
    for(const y of levels){
      k.box(4.68,.045,.065,rubber,x,y+.12,12.64);k.box(4.73,.055,.16,id==='music'?bronze:metal,x,y+.17,12.68);
      for(const xx of[-2.3,2.3]){k.box(.075,.15,.2,stone,x+xx,y+.08,12.63);k.cyl(.018,.035,bronze,x+xx,y+.15,12.78,[Math.PI/2,0,0]);}
    }
    const roof=levels.at(-1);for(const xx of[-2.28,2.28]){k.box(.12,.085,5.8,metal,x+xx,roof+.19,9.5);k.box(.025,roof-.2,.035,bronze,x+xx,.5*roof,12.69);}
    k.box(4.65,.085,.18,metal,x,roof+.2,6.6);
    // A visible low intake grille, service hatch, real door pulls and recessed entry mat.
    for(let n=0;n<12;n++)k.box(.62,.017,.055,metal,x-1.6,.35+n*.045,12.71);
    k.soft(.72,1.05,.035,metal,x+1.67,.8,6.66);k.box(.09,.07,.045,bronze,x+1.9,.8,6.7);
    for(const yy of[1.2,1.52])k.rod([x+.25,yy,12.72],[x+.25,yy,12.8],.017,bronze);
    k.rod([x+.25,1.2,12.8],[x+.25,1.52,12.8],.021,bronze);
    k.box(.82,.018,.42,k.mat('#56655f','fabric'),x,.235,12.74);
    for(let n=0;n<15;n++)k.box(.02,.008,.38,rubber,x-.37+n*.053,.249,12.74);
    k.group.userData.envelope={reveals:true,flashings:true,weatherSeals:true,entryHardware:true};k.finish();
  }
  const detailLayers=Object.keys(buildingSpecs).map(id=>buildInteriorDetails(ctx,group,id));interiors.push(...detailLayers);
  const viewTargets={};
  for(const [id,s]of Object.entries(buildingSpecs)){
    const a=anchors[id];a.set(s.x,a.y*s.sy,17+(a.z-12.5)*12.5/6);
    const height={projects:9.35,about:19.12,lately:10,music:6.26}[id];
    viewTargets[id]={center:new T.Vector3(s.x,height*.49,13.7),width:7.5,height,frontBounds:{minX:s.x-3.75,maxX:s.x+3.75,back:4.5,front:17}};
  }
  // Roof anchors share a screen-space label gap, regardless of building height.
  for(const [id,spec] of Object.entries(buildingSpecs))anchors[id].set(spec.x,viewTargets[id].height,17);
  const highlights={};
  const interiorById={about:interiors[0].group,lately:interiors[1].group,music:interiors[2].group,projects:interiors[3].group};
  for(const [id,spec] of Object.entries(buildingSpecs)){
    const uniform={value:0},copies=new Map();
    function highlightMaterial(source){
      if(copies.has(source))return copies.get(source);
      const material=source.clone(),originalCompile=source.onBeforeCompile,cacheKey=source.customProgramCacheKey();
      material.onBeforeCompile=shader=>{
        originalCompile.call(source,shader);
        shader.uniforms.destinationHover=uniform;
        shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float destinationHover;').replace('#include <tonemapping_fragment>','gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.45), destinationHover * 0.045);\n#include <tonemapping_fragment>');
      };
      material.customProgramCacheKey=()=>cacheKey+'-whole-destination-hover-v1';
      material.userData.destinationHover=uniform;material.userData.destination=id;
      material.userData.dayEmission=material.emissiveIntensity??0;copies.set(source,material);return material;
    }
    for(const root of[buildings[id],interiorById[id],detailLayers.find(layer=>layer.group.userData.destination===id)?.group])root?.traverse(mesh=>{
      if(!mesh.isMesh||mesh.userData.place)return;
      mesh.material=Array.isArray(mesh.material)?mesh.material.map(highlightMaterial):highlightMaterial(mesh.material);
    });
    highlights[id]={uniform,materials:[...copies.values()],prepare(root){root.traverse(mesh=>{if(!mesh.isMesh)return;mesh.material=Array.isArray(mesh.material)?mesh.material.map(highlightMaterial):highlightMaterial(mesh.material);});this.materials=[...copies.values()];}};
  }
  function setHighlight(id,value=true){for(const[key,h]of Object.entries(highlights))h.uniform.value=Boolean(value)&&(id==='block'||key===id)?1:0;}
  const roomLights=[],wallWashes=[];group.traverse(o=>{if((o.isPointLight||o.isSpotLight)&&!o.userData.neonControlled)roomLights.push({light:o,intensity:o.intensity,distance:o.distance});if(o.userData.nightWash)wallWashes.push(o);});
  const apartmentLighting=createApartmentLighting(group);
  function setNight(night){for(const wash of wallWashes)wash.visible=night;for(const h of Object.values(highlights))for(const m of h.materials)if(m.emissive)m.emissiveIntensity=m.userData.dayEmission*(night?1.8:.65);for(const sign of storefrontSigns)sign.material.emissiveIntensity=night?.48:0;for(const {light,intensity,distance}of roomLights){light.intensity=intensity*(night?1:.22);light.distance=distance;}apartmentLighting.setNight(night);openNeon.setNight(night);}
  return {group,clickables,anchors,viewTargets,interiors,detailLayers,highlights,registerImported(id,root){highlights[id]?.prepare(root);},setHighlight,setNight,apartmentLighting,update(dt,time){for(const interior of interiors)interior.update?.(dt,time);openNeon.update(dt)}};
}

