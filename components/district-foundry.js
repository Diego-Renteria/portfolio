import {facadeMaterial} from './facade-material.js?v=b477ce33502c';
import {detailKit} from './detail-kit.js?v=b477ce33502c';

/** A working brick-and-iron neighborhood: the buildings follow their programs. */
export function buildFoundryArchitecture(ctx,parcels){
  const {THREE:T,world,glowMaterials=[]}=ctx,group=new T.Group();
  group.name='Foundry / individual brick, iron and copper architecture';world.add(group);
  const palettes=[
    {kind:'brick',stone:true,frame:'#70413d',glass:'#445561',pitchX:1.55,pitchY:2.5},
    {kind:'brick',stone:true,frame:'#a36e47',glass:'#354b53',pitchX:1.8,pitchY:2.65},
    {kind:'brick',stone:true,frame:'#433d43',glass:'#566873',pitchX:1.45,pitchY:2.4},
    {kind:'iron',stone:true,arch:true,frame:'#b7bbb0',glass:'#496674',pitchX:2.05,pitchY:3},
    {kind:'iron',stone:true,arch:true,frame:'#467366',glass:'#34525b',pitchX:1.85,pitchY:2.7},
    {stone:true,frame:'#c4af85',glass:'#435661',pitchX:1.4,pitchY:2.8},
    {kind:'glass',frame:'#655141',glass:'#47575a',pitchX:1.75,pitchY:2.9},
    {kind:'brick',stone:true,frame:'#986359',glass:'#536974',pitchX:1.55,pitchY:2.45}
  ];
  const facadeMaterials=palettes.map((config,i)=>facadeMaterial(T,{...config,seed:42017+i*907,surfaceMaps:ctx.surfaceMaps}));
  glowMaterials.push(...facadeMaterials);
  const materials={};
  const tones={stone:'#d0bfa2',darkStone:'#a08c70',iron:'#283e3d',copper:'#7a927d',wood:'#946b48',roof:'#43494a',metal:'#6b777b',black:'#263035',paving:'#b7aca0',brick:'#835546',fern:'#567254',cream:'#ddd1b6'};
  for(const [key,color]of Object.entries(tones))materials[key]=ctx.material(color,['wood','brick','metal','stone'].includes(key)?key:key==='roof'?'asphalt':'plain');
  materials.glass=new T.MeshPhysicalMaterial({color:'#c0d0cf',roughness:.09,metalness:.08,transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide});
  materials.light=new T.MeshStandardMaterial({color:'#fff1dc',emissive:'#f4d5a9',emissiveIntensity:.18,roughness:.6});
  glowMaterials.push(materials.light);
  const unit=new T.BoxGeometry(1,1,1),arch=new T.TorusGeometry(1,.075,6,18,Math.PI),ring=new T.TorusGeometry(1,.035,5,20);ring.rotateX(Math.PI/2);
  const saw=new T.Shape();saw.moveTo(-.5,-.5);saw.lineTo(.5,.5);saw.lineTo(.5,-.5);saw.closePath();
  const sawGeo=new T.ExtrudeGeometry(saw,{depth:1,bevelEnabled:false});sawGeo.translate(0,0,-.5);sawGeo.computeVertexNormals();
  const geometry={box:unit,cyl:new T.CylinderGeometry(1,1,1,20),cone:new T.ConeGeometry(1,1,20),arch,ring,saw:sawGeo};
  const batches=new Map(),designMetadata=[];let active={id:0,program:0,tone:1};
  const add=(kind,material,w,h,d,x,y,z,rotation=[0,0,0])=>{
    const m=typeof material==='number'?facadeMaterials[material]:materials[material];
    const key=kind+':'+m.uuid;if(!batches.has(key))batches.set(key,{kind,m,items:[]});
    batches.get(key).items.push({w,h,d,x,y,z,rotation,address:active.id,program:active.program,tone:active.tone});
  };
  const box=(m,w,h,d,x,y,z,r)=>add('box',m,w,h,d,x,y,z,r);
  const cylinder=(m,r,h,x,y,z)=>add('cyl',m,r,h,r,x,y,z);
  function beam(a,b,width=.07,mat='iron'){
    const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p),e=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()));
    add('box',mat,width,v.length(),width,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,[e.x,e.y,e.z]);
  }
  function cornice(x,z,w,d,y,mat='stone',bold=false){
    box(mat,w+.22,.2,d+.22,x,y,z);box(mat,w+.42,.14,d+.42,x,y+.17,z);
    if(bold){box('darkStone',w+.48,.1,d+.48,x,y+.3,z);for(let dx=-w/2+.4;dx<w/2;dx+=.9)box(mat,.18,.23,.27,x+dx,y-.17,z+d/2+.04);}
  }
  function parapet(x,z,w,d,y,mat='stone'){
    box('roof',w-.08,.14,d-.08,x,y+.05,z);
    for(const s of[-1,1]){box(mat,w,.46,.16,x,y+.28,z+s*(d/2-.08));box(mat,.16,.46,d,x+s*(w/2-.08),y+.28,z);}
  }
  function rooftop(p,y,w=p.w,d=p.d,offsetX=0,offsetZ=0){
    const x=p.x+offsetX,z=p.z+offsetZ;
    parapet(x,z,w,d,y,p.palette===2?'iron':'darkStone');
    const count=1+p.seed%2;
    for(let j=0;j<count;j++){
      const xx=x-w*.23+j*w*.35,zz=z-d*.2;
      box('metal',1.6,.78,1.65,xx,y+.5,zz);box('black',1.24,.06,1.25,xx,y+.94,zz);
      cylinder('metal',.42,.1,xx,y+1.01,zz);cylinder('black',.3,.025,xx,y+1.07,zz);
      for(let k=0;k<4;k++)box('black',1.24,.055,.045,xx,y+.27+k*.14,zz+.84);
      box('metal',.4,.42,Math.max(1,d*.22),xx+.7,y+.36,zz+d*.16);
    }
    box('brick',1.4,1.6,1.8,x+w*.25,y+.86,z-d*.25);box('copper',1.55,.12,1.96,x+w*.25,y+1.72,z-d*.25);
    if(p.seed%4===0&&Math.min(w,d)>7){
      const tx=x+w*.24,tz=z+d*.2;
      for(const dx of[-.64,.64])for(const dz of[-.64,.64]){box('iron',.085,1.45,.085,tx+dx,y+.8,tz+dz);beam([tx+dx,y+.14,tz-.64],[tx-dx,y+1.48,tz+.64],.045);}
      cylinder('wood',.9,1.5,tx,y+2.22,tz);add('cone','copper',1,.42,1,tx,y+3.16,tz);
      for(const yy of[y+1.6,y+2.2,y+2.85])add('ring','metal',.92,1,.92,tx,yy,tz);
    }else if(p.seed%4===1&&w>8){
      for(let k=0;k<4;k++){const xx=x-w*.26+k*w*.17;box('wood',.08,1.5,.08,xx,y+.78,z+d*.22);box('wood',.12,.1,d*.32,xx,y+1.55,z+d*.16);}
      for(let k=0;k<5;k++)box('wood',w*.6,.08,.075,x,y+1.64,z+d*.02+k*.075*d);
      box('fern',w*.55,.28,.62,x,y+.3,z+d*.31);
    }else{
      cylinder('metal',.16,1.5,x-w*.3,y+.85,z+d*.25);add('cone','metal',.25,.16,.25,x-w*.3,y+1.63,z+d*.25);
      cylinder('metal',.1,.95,x-w*.12,y+.57,z+d*.28);
    }
  }
  function fireEscape(p,yMax){
    const x=p.x+p.w*.23,z=p.z+p.d/2+.18;
    for(let y=5.6;y<Math.min(yMax-1,29);y+=3.1){
      box('iron',1.65,.1,.75,x,y,z);box('iron',1.65,.065,.065,x,y+.77,z+.33);
      for(const dx of[-.77,-.25,.25,.77])box('iron',.045,.74,.045,x+dx,y+.39,z+.33);
      beam([x-.62,y-3.03,z-.2],[x+.62,y,z+.15],.055);beam([x-.28,y-3.03,z-.2],[x+.96,y,z+.15],.055);
      for(let k=0;k<9;k++)box('iron',.36,.055,.075,x-.45+k*.14,y-2.82+k*.32,z+.08);
    }
  }
  const furnishings=detailKit(ctx,group,'Foundry / furnished shopfronts and workshop objects');
  // Small shop plants are smooth at street-view distance without spending the
  // main portfolio rooms' geometry budget on distant leaves.
  furnishings.geos.round.dispose();furnishings.geos.round=new T.SphereGeometry(.5,20,12);
  const interiorStone=furnishings.mat('#d5c4a4','stone'),timber=furnishings.mat('#805d40','wood'),fabric=furnishings.mat('#807663','fabric'),steel=furnishings.mat('#4b5d5c','metal');
  function groundFloor(p,roomType,realRoom){
    const {x,z,w,d}=p,y=3.1,front=z+d/2;
    box('iron',w,.28,d,x,y,z);box('darkStone',w,.18,d,x,.16,z);
    if(realRoom){
      // The front is physically open; furniture is visible behind low-reflection glass.
      box('brick',w,y,.18,x,y/2,z-d/2+.09);box('brick',.18,y,d,x-w/2+.09,y/2,z);box('brick',.18,y,d,x+w/2-.09,y/2,z);
      box('wood',w-.2,.06,d-.2,x,.3,z);box('cream',w-.2,.08,d-.2,x,y-.2,z);
      box('glass',w-.5,y-.45,.045,x,y/2,front-.16);
      const depth=Math.min(d-1,4.9),back=front-depth;
      furnishings.box(w-.7,2.7,.09,interiorStone,x,1.6,back);
      if(roomType===0){
        // Café: service bar, shelving, espresso machine, cups and separated tables.
        furnishings.box(w*.52,.96,.68,timber,x-w*.12,.79,back+.52);furnishings.box(w*.54,.08,.74,'#ddd5c6',x-w*.12,1.31,back+.52);
        furnishings.box(.8,.45,.45,steel,x-w*.24,1.57,back+.52);furnishings.cyl(.12,.18,'#d9d1b8',x-w*.24,1.88,back+.52);
        for(let j=0;j<7;j++)furnishings.cyl(.05,.09,'#f0e7d6',x-w*.12+j*.13,1.4,back+.6);
        for(let j=0;j<3;j++)furnishings.box(w*.48,.07,.32,timber,x-w*.12,1.8+j*.36,back+.12);
        for(let j=0;j<Math.min(3,Math.floor(w/3));j++){
          const xx=x-w*.29+j*w*.28,zz=front-1.6;
          furnishings.cyl(.44,.07,timber,xx,1.08,zz);furnishings.cyl(.045,.72,steel,xx,.69,zz);furnishings.chair(xx-.6,.32,zz,fabric,Math.PI/2);furnishings.chair(xx+.6,.32,zz,fabric,-Math.PI/2);
          furnishings.cyl(.045,.08,'#ede5d5',xx,1.17,zz);furnishings.lamp(xx,.3,zz,2.2,'#f4e2bf');
        }
      }else if(roomType===1){
        // Furniture / design showroom: soft seating, rug, sample wall, gallery pieces.
        furnishings.box(w*.55,.022,depth*.52,'#baa789',x,.34,front-depth*.45);
        furnishings.soft(2.3,.38,.92,fabric,x-w*.19,.68,front-2);furnishings.soft(2.3,.62,.2,fabric,x-w*.19,1.02,front-2.43);
        furnishings.soft(.2,.49,.9,timber,x-w*.19-1.17,.87,front-2);furnishings.soft(.2,.49,.9,timber,x-w*.19+1.17,.87,front-2);
        furnishings.soft(1.4,.1,.66,timber,x-w*.1,.75,front-1.05);for(const dx of[-.53,.53])furnishings.cyl(.035,.35,steel,x-w*.1+dx,.51,front-1.05);
        furnishings.lamp(x+w*.28,.3,front-2.2,1.9);furnishings.plant(x+w*.32,.3,front-.75,.7);
        for(let j=0;j<3;j++)furnishings.box(.9,.9,.055,['#9e654d','#5b7778','#c1a579'][j],x-w*.27+j*w*.24,1.95,back+.12);
      }else{
        // Visible small fabrication studio: benches, vise, drill and material rack.
        furnishings.box(w*.62,.14,.82,timber,x,1.1,back+.65);
        for(const dx of[-w*.25,w*.25])furnishings.box(.1,.8,.64,steel,x+dx,.65,back+.65);
        furnishings.box(.43,.22,.25,steel,x-w*.2,1.28,back+.65);furnishings.cyl(.035,.7,steel,x+w*.17,1.5,back+.65);
        furnishings.box(.32,.2,.32,'#aa7638',x+w*.17,1.8,back+.65);furnishings.box(.7,.06,.65,steel,x+w*.17,1.34,back+.65);
        for(let j=0;j<5;j++)furnishings.box(.13,1.65,.13,timber,x+w*.36+j*.12,1.2,back+.4);
        furnishings.box(1.45,.12,.85,timber,x-w*.16,1.02,front-1.4);for(const dx of[-.6,.6])furnishings.box(.08,.67,.7,steel,x-w*.16+dx,.62,front-1.4);
        for(let j=0;j<4;j++)furnishings.cyl(.09,.08,'#be9d74',x-w*.28+j*.17,1.13,front-1.4);
        furnishings.chair(x-w*.16,.3,front-.65,'#a17a50',Math.PI);
      }
      furnishings.plant(x-w*.37,.3,front-.7,.65);
      for(let j=0;j<2;j++)box('light',w*.25,.045,.45,x+(j-.5)*w*.42,y-.31,front-depth*.45);
    }else{
      box(6,w-.3,y-.45,d-.3,x,y/2+.1,z);
    }
    const columns=Math.max(3,Math.floor(w/2.5));
    for(let j=0;j<=columns;j++){
      const xx=x-w/2+.18+j*(w-.36)/columns;
      cylinder('iron',.105,2.75,xx,1.7,front-.05);box('darkStone',.34,.19,.34,xx,.37,front-.05);box('iron',.35,.16,.35,xx,2.99,front-.05);
      if(p.palette===3||p.palette===4){const bay=(w-.36)/columns;if(j<columns)add('arch','iron',bay*.46,bay*.46,1,xx+bay/2,2.25,front-.05);}
    }
    box(p.seed%2?'copper':'iron',w-.3,.38,.14,x,2.89,front+.11);
    const signWidth=Math.min(w*.53,5);
    if(realRoom&&ctx.label){
      const names=[['COPPER KETTLE','BRICK & BEAN','TURNTABLE CAFÉ'],['FORM & TIMBER','STILL LIFE','COMMON OBJECTS'],['FIELDWORK STUDIO','NORTHLIGHT LAB','RAIL YARD WORKS']];
      const sign=ctx.label(names[roomType][Math.floor(p.seed/13)%3],signWidth,.26,x,2.89,front+.205,p.seed%2?'#607a69':'#243c39','#ede0c5',group);
      sign.name='Foundry / crisp physical shop sign';
    }else box('cream',signWidth,.035,.08,x,2.91,front+.21);
    box('iron',w*.68,.12,.7,x,3.05,front+.12);
  }
  const families=['cast-iron-arcade','burgundy-loft','sawtooth-workshop','courtyard-foundry','stepped-art-deco','corner-warehouse','copper-penthouse','atelier-row'];
  const realRooms=new Set(parcels.map((p,index)=>({index,score:Math.hypot(p.x*.7,p.z-35)})).sort((a,b)=>a.score-b.score).slice(0,12).map(p=>p.index));
  parcels.forEach((source,index)=>{
    const id=Number.isFinite(Number(source.id))?Number(source.id):index;
    let seed=Math.imul((id+1)^0x51f13,index+619);seed=Math.imul(seed^(seed>>>16),0x45d9f3b);seed=(seed^(seed>>>16))>>>0;
    const p={...source,seed,w:Math.max(3,source.w-.6),d:Math.max(3,source.d-.6),h:Math.max(8,source.h),palette:seed%8};
    const family=source.kind==='landmark'?4:seed%8,program=family===2||family===7?2:family===4?1:family===0?4:0;
    if(family===0)p.palette=seed%2?3:4;
    if(family===4)p.palette=5;
    active={id:31000+index,program,tone:.91+(seed%19)*.009};
    const {x,z,w,d}=p;
    let top=p.h;
    if(family===2)top=Math.min(top,16);
    if(family===3)top=Math.min(top,29);
    const detailedRoom=realRooms.has(index);
    groundFloor(p,seed%3,detailedRoom);
    if(family===3&&w>11&&d>11){
      // A planted U courtyard is open toward the street instead of a solid box.
      const wing=Math.max(3,w*.25),backDepth=d*.32;
      box(p.palette,w,top-3.2,backDepth,x,(top+3.2)/2,z-d/2+backDepth/2);
      for(const s of[-1,1]){box(p.palette,wing,top-3.2,d-backDepth,x+s*(w-wing)/2,(top+3.2)/2,z+backDepth/2);rooftop(p,top,wing,d-backDepth,s*(w-wing)/2,backDepth/2);}
      parapet(x,z-d/2+backDepth/2,w,backDepth,top,'darkStone');
      box('paving',w-wing*2,.05,d-backDepth,x,3.3,z+backDepth/2);
      for(const s of[-1,1]){box('wood',1.5,.4,1.3,x+s*w*.15,3.55,z+d*.17);box('fern',1.38,.25,1.17,x+s*w*.15,3.87,z+d*.17);}
      box('iron',w-wing*2,.08,.08,x,4.12,z+d/2-.12);
    }else if(family===5&&w>11&&d>10){
      const wing=w*.38,rear=d*.43;
      box(p.palette,w,top-3.2,rear,x,(top+3.2)/2,z-(d-rear)/2);
      box(p.palette,wing,top-3.2,d-rear,x-(w-wing)/2,(top+3.2)/2,z+rear/2);
      rooftop(p,top,w,rear,0,-(d-rear)/2);rooftop(p,top,wing,d-rear,-(w-wing)/2,rear/2);
      box('copper',w-wing-.2,.22,d-rear-.2,x+wing/2,3.45,z+rear/2);
      for(let k=0;k<4;k++)box('iron',.08,.8,d-rear-.4,x+wing/2-(w-wing)*.35+k*(w-wing)*.23,3.95,z+rear/2);
    }else if(family===4||top>46){
      const baseHeight=Math.min(17,top*.32),middle=top*.44,crown=top-baseHeight-middle;
      box(5,w,baseHeight-3.2,d,x,(baseHeight+3.2)/2,z);cornice(x,z,w,d,baseHeight,'darkStone',true);
      box(5,w*.8,middle,d*.78,x,baseHeight+middle/2,z-d*.02);cornice(x,z-d*.02,w*.8,d*.78,baseHeight+middle,'stone');
      box(5,w*.55,crown,d*.56,x,baseHeight+middle+crown/2,z-d*.04);
      // Pilasters follow each setback face; full-depth slabs would blank the
      // side windows and extend outside the narrower crown.
      for(const [ww,dd,hh,yy,zz]of[[w*.8,d*.78,middle,baseHeight,z-d*.02],[w*.55,d*.56,crown,baseHeight+middle,z-d*.04]]){
        for(const s of[-1,1])for(let j=-2;j<=2;j++){
          box('stone',.18,hh,.16,x+j*ww*.17,yy+hh/2,zz+s*(dd/2+.055));
          box('stone',.16,hh,.18,x+s*(ww/2+.055),yy+hh/2,zz+j*dd*.17);
        }
      }
      rooftop(p,top,w*.55,d*.56,0,-d*.04);
      box('copper',w*.35,1.2,d*.36,x,top+.9,z-d*.04);box('copper',w*.2,1.1,d*.22,x,top+2,z-d*.04);cylinder('metal',.065,3,x,top+3.6,z-d*.04);top+=5.1;
    }else{
      box(p.palette,w,top-3.2,d,x,(top+3.2)/2,z);
      for(let y=6.1;y<top-.6;y+=3.1)box('darkStone',w+.08,.12,d+.08,x,y,z);
      cornice(x,z,w,d,top,p.palette===2?'iron':'stone',family===0||family===1);
      if(family===2){
        // Northlight sawtooth glazing, individually flashed ridges and gutters.
        const toothCount=Math.max(2,Math.floor(w/3.2)),pitch=w/toothCount;
        for(let j=0;j<toothCount;j++){
          const xx=x-w/2+pitch*(j+.5);add('saw','copper',pitch-.04,1.45,d-.2,xx,top+.76,z);
          box('glass',.045,1.38,d-.24,xx+pitch/2-.06,top+.78,z);
          box('iron',.08,.08,d+.02,xx+pitch/2-.04,top+1.49,z);box('iron',.1,.08,d+.04,xx-pitch/2+.03,top+.08,z);
        }
        top+=1.5;
      }else if(family===6){
        const pentW=w*.62,pentD=d*.65;
        box(6,pentW,2.7,pentD,x-w*.06,top+1.7,z-d*.04);box('copper',pentW+.18,.18,pentD+.18,x-w*.06,top+3.14,z-d*.04);
        parapet(x,z,w,d,top,'darkStone');for(let k=0;k<4;k++)box('wood',w*.15,.45,.8,x-w*.28+k*w*.19,top+.38,z+d*.35);
        top+=3.3;
      }else rooftop(p,top);
      if(family===1||family===7)fireEscape(p,Math.min(top,p.h));
      if(family===0){
        for(let y=3.3;y<top-.5;y+=3.1){box('iron',w+.25,.17,.24,x,y,z+d/2+.03);for(let j=0;j<Math.max(3,Math.floor(w/2));j++)cylinder('iron',.07,2.8,x-w/2+.5+j*(w-1)/(Math.max(3,Math.floor(w/2))-1),y+1.45,z+d/2+.04);}
      }
    }
    designMetadata.push({id:`foundry-${id}`,family:families[family],x,z,width:w,depth:d,height:top,interiorProgram:{code:program,use:['residential','office','studio','hotel','retail','civic'][program],district:'Foundry / creative and mixed-use streets'},signature:`foundry-${family}-${p.palette}-${seed}`,realGroundFloorInterior:detailedRoom,roofProgram:family===2?'northlight-workshop':seed%4===0?'water-tower':seed%4===1?'roof-garden':'plant-and-stairs'});
  });
  const dummy=new T.Object3D();let instanceCount=0,triangles=0;
  for(const {kind,m,items}of batches.values()){
    const geo=m.userData.architecture?geometry[kind].clone():geometry[kind];
    if(m.userData.architecture)geo.setAttribute('interiorAddress',new T.InstancedBufferAttribute(new Float32Array(items.flatMap(p=>[p.program,p.address,0])),3));
    const mesh=new T.InstancedMesh(geo,m,items.length);mesh.name=`Foundry / ${kind} / ${m.userData.architecture?.frame||m.color.getHexString()}`;
    items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.rotation.set(...p.rotation);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color().setScalar(p.tone));});
    mesh.castShadow=!m.transparent&&m!==materials.light;mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);
    instanceCount+=items.length;triangles+=(geo.index?geo.index.count:geo.attributes.position.count)/3*items.length;
  }
  furnishings.finish();
  group.userData={buildingCount:designMetadata.length,designMetadata,instanceCount,architecturalTriangles:triangles,identity:'NYC foundry, northlight studios, cast iron, copper and burgundy brick'};
  let night=false;
  function setNight(value){night=Boolean(value);facadeMaterials.forEach(m=>m.emissiveIntensity=night?.82:.045);materials.light.emissiveIntensity=night?2:.18;}
  setNight(false);
  return{group,facadeMaterials,designMetadata,buildingCount:designMetadata.length,setNight,update(){},setQuality(){}};
}
