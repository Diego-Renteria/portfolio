import {facadeMaterial} from './facade-material.js?v=b477ce33502c';
import {detailKit} from './detail-kit.js?v=b477ce33502c';

/** Maritime warehouses, timber homes and a silver waterfront business district.
 * All coordinates are clipped by design to a parcel; roads and seawalls belong
 * to the district planner. Every upper facade also accepts the inhabited-room
 * atlas, while the most visible shopfronts contain actual furnished geometry.
 */
export function buildHarborArchitecture(ctx,parcels=[]){
  const {THREE:T,world,glowMaterials=[]}=ctx,group=new T.Group();
  group.name='harborlight-architecture';world.add(group);
  const mats={},facadeMaterials=[],batches=new Map(),designMetadata=[];
  const palette={
    chalk:['#d6d9cf','concrete'],pearl:['#edf0e8','concrete'],charcoal:['#303d43','metal'],
    zinc:['#88979a','metal'],copper:['#798f86','metal'],steel:['#536b70','metal'],
    brick:['#8e5142','brick'],ochre:['#ac7950','brick'],darkBrick:['#5b4540','brick'],
    timber:['#aa7951','wood'],cedar:['#b99267','wood'],darkWood:['#654d3f','wood'],
    roof:['#45555a','concrete'],gravel:['#9fa69a','gravel'],soil:['#51483c','soil'],
    leaves:['#617c58','grass'],sage:['#91a384','grass'],water:['#7ba3a5','glass'],
    solar:['#2c485a','metal'],interior:['#e3dbca','concrete'],paper:['#ebe4d8','plain']
  };
  for(const[key,[color,kind]]of Object.entries(palette))mats[key]=ctx.material(color,kind);
  mats.glazing=new T.MeshPhysicalMaterial({color:'#a2c3c6',roughness:.13,metalness:.08,transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide});
  mats.warm=new T.MeshStandardMaterial({color:'#eadbc3',emissive:'#ffe4bd',emissiveIntensity:.06,roughness:.5});glowMaterials.push(mats.warm);
  mats.cool=new T.MeshStandardMaterial({color:'#d9e6eb',emissive:'#d8e8ff',emissiveIntensity:.04,roughness:.4});glowMaterials.push(mats.cool);
  const facadeConfigs={
    red:{kind:'brick',stone:true,frame:'#8b4d3b',glass:'#47626b',pitchX:1.55,pitchY:2.45},
    cocoa:{kind:'brick',stone:true,frame:'#63534c',glass:'#3e5965',pitchX:1.75,pitchY:2.6},
    buff:{kind:'brick',stone:true,frame:'#c0a87b',glass:'#486878',pitchX:1.9,pitchY:2.8},
    white:{kind:'iron',stone:true,frame:'#d8d9d0',glass:'#63828d',pitchX:1.8,pitchY:2.65},
    smoke:{kind:'brick',stone:true,frame:'#435354',glass:'#4d6f7e',pitchX:1.5,pitchY:2.35},
    cedar:{kind:'iron',stone:true,frame:'#aa805b',glass:'#536e71',pitchX:1.7,pitchY:2.65},
    silver:{frame:'#a6b5b8',glass:'#789ba9',pitchX:1.85,pitchY:2.9},
    marine:{frame:'#456c7b',glass:'#3e758b',pitchX:1.45,pitchY:2.6},
    slate:{frame:'#3d535e',glass:'#456a7c',pitchX:1.6,pitchY:2.7},
    blue:{frame:'#7b999e',glass:'#719eaa',pitchX:1.9,pitchY:2.9},
    pearl:{stone:true,frame:'#d6d8cd',glass:'#6b838a',pitchX:1.6,pitchY:2.5},
    mint:{frame:'#829c94',glass:'#6a9992',pitchX:1.7,pitchY:2.7}
  };
  Object.entries(facadeConfigs).forEach(([key,config],i)=>{mats[key+'Facade']=facadeMaterial(T,{...config,seed:5719+i*1297,surfaceMaps:ctx.surfaceMaps});facadeMaterials.push(mats[key+'Facade']);glowMaterials.push(mats[key+'Facade']);});
  const shape=new T.Shape();shape.moveTo(-.5,0);shape.lineTo(0,1);shape.lineTo(.5,0);shape.closePath();
  const ridge=new T.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});ridge.translate(0,0,-.5);ridge.computeVertexNormals();
  const saw=new T.Shape();saw.moveTo(-.5,0);saw.lineTo(.5,1);saw.lineTo(.5,0);saw.closePath();
  const wedge=new T.ExtrudeGeometry(saw,{depth:1,bevelEnabled:false});wedge.translate(0,0,-.5);wedge.computeVertexNormals();
  const geos={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(1,1,1,32),cone:new T.ConeGeometry(1,1,32),ridge,wedge};
  const kit=detailKit(ctx,group,'Harborlight furnished storefronts and roof gardens');
  let address={id:1,program:0,tone:1};
  const hash=n=>{const v=Math.sin(n*127.13+59.37)*43758.5453;return v-Math.floor(v);};
  function part(kind,key,w,h,d,x,y,z,ry=0,rx=0,rz=0){
    if(!(w>0&&h>0&&d>0))return;
    const material=mats[key],batchKey=kind+':'+key;
    if(!material)throw new Error('Unknown harbor material '+key);
    if(!batches.has(batchKey))batches.set(batchKey,{kind,material,items:[]});
    batches.get(batchKey).items.push({w,h,d,x,y,z,ry,rx,rz,...address});
  }
  const box=(key,w,h,d,x,y,z,ry=0,rx=0,rz=0)=>part('box',key,w,h,d,x,y,z,ry,rx,rz);
  const cylinder=(key,r,h,x,y,z,rx=0,rz=0)=>part('cylinder',key,r,h,r,x,y,z,0,rx,rz);
  function beam(a,b,width,key='steel'){
    const p=new T.Vector3(...a),q=new T.Vector3(...b),direction=q.clone().sub(p),e=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),direction.clone().normalize()));
    part('box',key,width,direction.length(),width,(p.x+q.x)/2,(p.y+q.y)/2,(p.z+q.z)/2,e.y,e.x,e.z);
  }
  function railing(x,y,z,w,d,key='steel'){
    box(key,w,.055,.055,x,y+.91,z+d/2);box(key,w,.055,.055,x,y+.48,z+d/2);
    for(const sign of[-1,1]){box(key,.055,.055,d,x+sign*w/2,y+.91,z);box(key,.055,.055,d,x+sign*w/2,y+.48,z);}
    for(let j=0;j<=Math.ceil(w/1.65);j++)box(key,.045,.95,.045,x-w/2+j*w/Math.ceil(w/1.65),y+.46,z+d/2);
  }
  function roof(x,z,w,d,y,seed,{garden=false,solar=false}={}){
    box('roof',w,.22,d,x,y+.11,z);
    box('gravel',Math.max(.4,w-.4),.06,Math.max(.4,d-.4),x,y+.25,z);
    for(const side of[-1,1]){box('zinc',w,.32,.12,x,y+.39,z+side*(d/2-.06));box('zinc',.12,.32,d,x+side*(w/2-.06),y+.39,z);}
    const fanCount=Math.max(1,Math.min(4,Math.floor(w/5)));
    for(let j=0;j<fanCount;j++){
      const xx=x-w*.30+j*w*.6/Math.max(1,fanCount-1),zz=z-d*.24;
      box('zinc',1.1,.68,.86,xx,y+.59,zz);cylinder('charcoal',.29,.06,xx,y+.97,zz);cylinder('steel',.17,.075,xx,y+1.0,zz);
      for(let k=0;k<5;k++)box('charcoal',.87,.025,.035,xx,y+.38+k*.1,zz+.44);
      cylinder('steel',.12,1.0,xx+.8,y+.75,zz);cylinder('zinc',.23,.12,xx+.8,y+1.29,zz);
      box('steel',.15,.1,Math.min(2.5,d*.27),xx,y+.31,zz+Math.min(1.2,d*.12));
    }
    if(solar&&w>6&&d>6)for(let j=0;j<3;j++)box('solar',Math.min(1.8,w*.18),.07,1.5,x+(j-1)*Math.min(2.05,w*.22),y+.54,z+d*.20,0,-.22);
    if(garden&&w>6&&d>5){
      box('timber',w*.63,.10,d*.38,x,y+.32,z+d*.18);
      for(const sign of[-1,1]){const xx=x+sign*w*.32;box('darkWood',.70,.50,d*.40,xx,y+.57,z+d*.15);box('soil',.60,.035,d*.37,xx,y+.84,z+d*.15);for(let j=0;j<4;j++)kit.round(.58,.57,.70,j%2?'#81976d':'#586e54',xx,y+1.07,z+d*.15+(j-1.5)*d*.085);}
      kit.soft(1.6,.15,.62,kit.mat('#b7bd9b','fabric'),x-w*.13,y+.58,z+d*.25);kit.box(.055,.48,.55,kit.mat('#738183','metal'),x-w*.13-.65,y+.38,z+d*.25);kit.box(.055,.48,.55,kit.mat('#738183','metal'),x-w*.13+.65,y+.38,z+d*.25);
      if(seed%3===0){for(const sx of[-1,1])for(const sz of[-1,1])box('darkWood',.10,2.15,.10,x+sx*w*.25,y+1.4,z+d*.17+sz*d*.12);for(let j=0;j<6;j++)box('cedar',w*.55,.10,.13,x,y+2.52,z+d*.17+(j-2.5)*d*.048);}
    }
  }
  function groundFloor(p,frontMaterial,program,seed){
    const {x,z,w,d}=p,hh=3.3,front=z+d/2,roomD=Math.min(5,d*.46),roomW=Math.min(w-1,12),back=front-roomD;
    box('interior',w,.18,d,x,.16,z);box('chalk',w,.18,d,x,hh,z);
    box(frontMaterial,w,hh,.30,x,hh/2,z-d/2+.15);
    for(const sign of[-1,1])box(frontMaterial,.28,hh,d,x+sign*(w/2-.14),hh/2,z);
    box('interior',roomW,2.95,.12,x,1.65,back);
    const bays=Math.max(2,Math.ceil(w/3.2)),bay=w/bays;
    for(let j=0;j<=bays;j++)box('steel',.12,3.08,.16,x-w/2+j*bay,1.70,front-.06);
    box('steel',w,.13,.18,x,3.12,front-.05);box('steel',w,.12,.18,x,.31,front-.05);
    for(let j=0;j<bays;j++){const xx=x-w/2+(j+.5)*bay;box('glazing',bay-.20,2.72,.025,xx,1.73,front-.095);}
    box('charcoal',Math.min(1.2,w*.12),.08,.07,x+w*.26,1.38,front+.055);
    box('cedar',w*.83,.15,1.0,x,3.29,front-.23);
    box('warm',w*.75,.035,.07,x,3.20,front+.15);
    // Actual interior furnishings are deliberately concentrated where a camera
    // can read them. Their sizes match the room and leave a clear entrance aisle.
    if(p.z>45||p.z < -30)return;
    const timber=kit.mat('#9d7654','wood'),dark=kit.mat('#435252','metal'),fabric=kit.mat(seed%2?'#638283':'#a89472','fabric');
    const span=Math.min(roomW*.33,3.3),zz=front-roomD*.53;
    if(program===1||program===2){
      for(const sx of[-1,1]){
        const xx=x+sx*span;kit.box(1.6,.10,.72,timber,xx,.83,zz);for(const dx of[-.64,.64])kit.box(.05,.78,.50,dark,xx+dx,.43,zz);
        kit.box(.65,.43,.045,'#2f424a',xx,1.12,zz-.13);kit.box(.56,.34,.012,'#7fa4ad',xx,1.13,zz-.102);kit.box(.34,.025,.13,'#586969',xx,.90,zz+.16);kit.chair(xx,0,zz+.85,seed%2?'#8c9d91':'#637f87',Math.PI);
      }
      kit.box(roomW*.65,.05,.28,timber,x,1.85,back+.18);
      for(let j=0;j<9;j++)kit.box(.12,.24+(j%3)*.07,.17,['#846c54','#738575','#aa8b61'][j%3],x-roomW*.25+j*roomW*.06,2.02,back+.18);
    }else if(seed%4===0){
      kit.box(roomW*.60,.92,.72,timber,x,.63,back+.7);kit.box(.46,.38,.35,'#8e9994',x+1,1.25,back+.65);kit.cyl(.10,.14,'#3c4b48',x+1,1.51,back+.65);
      for(const sx of[-1,1]){const xx=x+sx*span;kit.cyl(.57,.07,timber,xx,.82,zz+.35);kit.cyl(.045,.78,dark,xx,.40,zz+.35);kit.chair(xx-.75,0,zz+.35,'#8a9c88',-Math.PI/2);kit.cyl(.045,.085,'#e9ddc4',xx,.90,zz+.35);}
    }else if(seed%4===1){
      for(const sx of[-1,1]){const xx=x+sx*span;kit.box(1.9,.10,.48,timber,xx,.40,back+.28);kit.box(1.9,.10,.48,timber,xx,1.05,back+.28);kit.box(1.9,.10,.48,timber,xx,1.7,back+.28);for(let j=0;j<10;j++)kit.box(.10,.32+(j%4)*.055,.22,['#59746f','#a67455','#b4a17d','#647d91'][j%4],xx-.77+j*.17,1.25,back+.29);}
      kit.box(1.8,.12,.85,timber,x,.82,zz);kit.box(.10,.74,.65,dark,x-.73,.42,zz);kit.box(.10,.74,.65,dark,x+.73,.42,zz);
      for(let j=0;j<6;j++)kit.box(.23,.045,.32,'#d2c2a0',x-.55+(j%3)*.5,.92+Math.floor(j/3)*.04,zz+(j%2)*.18);
    }else if(seed%4===2){
      for(let j=0;j<5;j++)kit.plant(x-span+j*span*.5,.10,back+.72,.58+(j%3)*.16);
      kit.box(roomW*.58,.12,.72,timber,x,.65,zz);for(const sx of[-1,1])kit.box(.08,.57,.53,dark,x+sx*roomW*.24,.36,zz);
      for(let j=0;j<4;j++)kit.plant(x+(j-1.5)*.63,.72,zz,.3);
    }else{
      kit.soft(roomW*.40,.22,.85,fabric,x-span*.5,.58,back+.8);kit.soft(roomW*.40,.67,.16,fabric,x-span*.5,.94,back+.41);
      kit.box(1.3,.11,.72,timber,x+span*.6,.48,zz+.1);for(const sx of[-1,1])kit.box(.045,.39,.5,dark,x+span*.6+sx*.5,.25,zz+.1);
      kit.box(1.1,.85,.05,'#7f9b9f',x+span*.5,1.72,back+.09);kit.box(.95,.70,.015,'#c8c6a9',x+span*.5,1.72,back+.124);
    }
    kit.plant(x-roomW*.43,.25,front-.8,.62);
    for(const sx of[-1,1]){kit.cyl(.016,.45,'#465454',x+sx*span,2.86,zz);kit.put('cone',.25,.16,.25,kit.mat('#e7d4b3'),x+sx*span,2.62,zz);box('warm',.25,.025,.25,x+sx*span,2.53,zz);}
  }
  function warehouse(p,seed){
    const {x,z,w,d,h}=p,upper=Math.max(3.8,h-3.3),key=['redFacade','cocoaFacade','buffFacade','smokeFacade'][seed%4];
    groundFloor(p,seed%2?'brick':'darkBrick',2,seed);box(key,w,upper,d,x,3.3+upper/2,z);
    for(const side of[-1,1]){
      for(let j=0;j<=Math.ceil(w/3.8);j++){const xx=x-w/2+j*w/Math.ceil(w/3.8);box(seed%2?'brick':'ochre',.28,h,.33,xx,h/2,z+side*(d/2-.12));}
      for(let y=6;y<h;y+=3.0)box('chalk',w,.13,.14,x,y,z+side*d/2);
    }
    box('chalk',w+.16,.40,d+.16,x,h+.20,z);
    const teeth=seed%2?3:4,unit=w/teeth;
    for(let j=0;j<teeth;j++){
      const xx=x-w/2+(j+.5)*unit;
      part('wedge','zinc',unit-.13,1.65,d-.55,xx,h+.42,z);
      box('marineFacade',.07,1.27,d-.65,xx+unit/2-.12,h+1.18,z);
      box('steel',.10,.10,d-.62,xx+unit/2-.09,h+1.94,z);
    }
    // Exposed black iron fire escape and realistic downspout on one street face.
    const sx=x-w*.30,front=z+d/2+.17;
    for(let y=5.8;y<h-.5;y+=3.05){box('steel',1.35,.09,.62,sx,y,front);railing(sx,y,front,1.3,.57);beam([sx-.57,y,front+.2],[sx+.57,y+2.9,front+.2],.055);for(let k=0;k<8;k++)box('steel',.35,.045,.12,sx-.55+k*.15,y+.18+k*.34,front+.22);}
    cylinder('zinc',.055,h,x+w*.43,h/2,z+d/2+.13);
    return {family:'harbor-sawtooth-creative-warehouse',height:h+2.15};
  }
  function timberHomes(p,seed){
    const {x,z,w,d,h}=p;groundFloor(p,'chalk',0,seed);
    const floors=Math.max(2,Math.round((h-3.3)/3.0)),floorH=(h-3.3)/floors;
    for(let floor=0;floor<floors;floor++){
      const y=3.3+floor*floorH,step=Math.floor(floor/3),ww=w*(1-step*.075),dd=d*(1-step*.075),xx=x+(seed%2?-1:1)*Math.min(step*.38,w*.05),zz=z-step*.22;
      box(seed%3===0?'whiteFacade':'cedarFacade',ww,floorH-.19,dd,xx,y+(floorH-.19)/2,zz);
      box('chalk',ww+.18,.19,dd+.18,xx,y+floorH-.08,zz);
      const bays=Math.max(2,Math.min(5,Math.floor(ww/2.9))),bayW=ww/bays;
      for(let j=0;j<bays;j++)if((j+floor+seed)%3!==0){const bx=xx-ww/2+(j+.5)*bayW,bz=zz+dd/2-.24;
        box('timber',bayW*.79,.14,.83,bx,y+.15,bz);box('glazing',bayW*.76,.87,.06,bx,y+.69,bz+.40);box('steel',bayW*.79,.04,.05,bx,y+1.15,bz+.41);
        box('darkWood',.42,.45,.47,bx+bayW*.23,y+.44,bz+.12);kit.round(.52,.55,.52,'#6c865e',bx+bayW*.23,y+.89,bz+.12);
        if(floor<4){kit.cyl(.23,.04,kit.mat('#c0a57f','wood'),bx-bayW*.18,y+.71,bz+.06);kit.cyl(.023,.55,'#4e5c58',bx-bayW*.18,y+.43,bz+.06);}
      }
      for(const side of[-1,1])box('timber',.21,floorH,.25,xx+side*(ww/2-.09),y+floorH/2,zz+dd/2-.07);
    }
    const steps=Math.floor((floors-1)/3),ww=w*(1-steps*.075),dd=d*(1-steps*.075);
    roof(x+(seed%2?-1:1)*Math.min(steps*.38,w*.05),z-steps*.22,ww,dd,h,seed,{garden:true,solar:seed%2===0});
    return{family:'harbor-stepped-cedar-residential',height:h+2.6};
  }
  function office(p,seed){
    const {x,z,w,d,h}=p;groundFloor(p,'pearl',1,seed);
    const podium=Math.max(3.5,Math.min(9,h*.24)),baseMat=['silverFacade','marineFacade','blueFacade','slateFacade'][seed%4];
    box('whiteFacade',w,podium-3.3,d,x,3.3+(podium-3.3)/2,z);roof(x,z,w,d,podium,seed,{garden:true});
    const levels=seed%3===0?3:2;let top=h;
    for(let j=0;j<levels;j++){
      const y=podium+j*(h-podium)/levels,hh=(h-podium)/levels,ww=w*(.79-j*.11),dd=d*(.83-j*.09),xx=x+(seed%2?1:-1)*w*.045*j,zz=z-d*.04*j;
      box(baseMat,ww,hh-.20,dd,xx,y+hh/2,z-d*.04*j);
      box('zinc',ww+.12,.19,dd+.12,xx,y+hh-.10,zz);
      const finCount=Math.max(3,Math.floor(ww/1.8));for(let k=0;k<=finCount;k++){const fx=xx-ww/2+k*ww/finCount;box('zinc',.10,hh,.20,fx,y+hh/2,zz+dd/2+.02);}
      for(let yy=y+3;yy<y+hh-.4;yy+=3.1)box('steel',ww,.06,.08,xx,yy,zz+dd/2+.08);
      if(seed%6===0&&hh>10){
        const front=zz+dd/2+.16;
        for(let band=0;band<2;band++){const low=y+band*hh/2,high=y+(band+1)*hh/2;
          beam([xx-ww/2,low,front],[xx+ww/2,high,front],.13,'zinc');
          beam([xx+ww/2,low,front],[xx-ww/2,high,front],.10,'zinc');
        }
      }
      if(j===levels-1){roof(xx,zz,ww,dd,h,seed,{solar:true});top=h+1.5;}
    }
    if(seed%5===0){const crownW=w*.40,crownD=d*.40;box('silverFacade',crownW,4.6,crownD,x, h+2.3,z-.3);roof(x,z-.3,crownW,crownD,h+4.6,seed);cylinder('steel',.10,5,x,h+7.1,z-.3);top=h+9.6;}
    return{family:'harbor-silver-glass-office',height:top};
  }
  function civic(p,seed){
    const {x,z,w,d,h}=p,wallH=Math.max(5,Math.min(h*.72,h-2));
    groundFloor(p,'chalk',5,seed);box(seed%2?'buffFacade':'whiteFacade',w,wallH-3.3,d,x,3.3+(wallH-3.3)/2,z);
    part('ridge','copper',w,Math.min(4,h-wallH),d,x,wallH,z);
    const ribs=Math.max(3,Math.round(d/3));
    for(let j=0;j<=ribs;j++){const zz=z-d/2+j*d/ribs;beam([x-w/2,wallH,zz],[x,wallH+Math.min(4,h-wallH),zz],.13,'steel');beam([x,wallH+Math.min(4,h-wallH),zz],[x+w/2,wallH,zz],.13,'steel');}
    box('marineFacade',w*.42,wallH*.56,.07,x,wallH*.56,z+d/2+.04);
    for(const side of[-1,1])box('chalk',.40,wallH,d*.10,x+side*w*.36,wallH/2,z+d*.43);
    const upper=wallH+Math.min(4,h-wallH);cylinder('zinc',.12,1.5,x,upper+.75,z);part('cone','zinc',.28,.65,.28,x,upper+1.8,z);
    return{family:'harbor-market-civic-hall',height:upper+2.12};
  }
  function courtyard(p,seed){
    const {x,z,w,d,h}=p,wide=w*.63,wing=w*.28,xx=x-w*.17;
    groundFloor(p,'brick',0,seed);box(seed%3===0?'smokeFacade':'redFacade',wide,h-3.3,d,xx,3.3+(h-3.3)/2,z);
    const wingH=h*.68;box('buffFacade',wing,wingH-3.3,d*.64,x+w*.34,3.3+(wingH-3.3)/2,z-d*.18);
    roof(xx,z,wide,d,h,seed,{garden:true});roof(x+w*.34,z-d*.18,wing,d*.64,wingH,seed,{solar:true});
    box('timber',w*.28,.10,d*.32,x+w*.34,3.4,z+d*.29);
    railing(x+w*.34,3.47,z+d*.29,w*.27,d*.31);
    for(let j=0;j<4;j++)kit.plant(x+w*.34+(j%2-.5)*w*.13,3.48,z+d*.29+(Math.floor(j/2)-.5)*d*.14,.6);
    for(let y=6;y<h;y+=3.1)box('chalk',wide,.13,.15,xx,y,z+d/2+.03);
    box('brick',wide+.14,.55,d+.14,xx,h+.28,z);box('zinc',wide+.23,.10,d+.23,xx,h+.60,z);
    return{family:'harbor-brick-courtyard-lofts',height:h+2.6};
  }
  function market(p,seed){
    const {x,z,w,d,h}=p,hh=Math.min(h,12+seed%6),front=z+d/2;
    groundFloor(p,'darkBrick',4,seed);box('smokeFacade',w,hh-3.3,d,x,3.3+(hh-3.3)/2,z);
    // A long raised roof monitor brings daylight into the deep market hall;
    // standing-seam roof strips drain to a continuous concealed gutter.
    box('zinc',w,.25,d,x,hh+.12,z);
    const monitorW=w*.48,monitorD=d*.78;
    box('marineFacade',monitorW,2.0,monitorD,x,hh+1.17,z-d*.02);
    part('ridge','zinc',monitorW+.2,1.3,monitorD+.18,x,hh+2.17,z-d*.02);
    for(let j=0;j<9;j++)box('steel',.045,.06,d-.28,x+(j-4)*(w-.4)/8,hh+.28,z);
    const bays=Math.max(2,Math.floor(w/4));
    for(let j=0;j<bays;j++){
      const xx=x-w/2+(j+.5)*w/bays;
      box('steel',w/bays*.80,.12,.86,xx,3.37,front-.18);
      box(seed%2?'cedar':'copper',w/bays*.80,.45,.10,xx,3.62,front+.18);
      for(const side of[-1,1])beam([xx+side*w/bays*.32,3.34,front+.23],[xx+side*w/bays*.32,2.80,front-.08],.055);
      box('warm',w/bays*.64,.04,.07,xx,3.30,front+.18);
    }
    for(const side of[-1,1]){box('zinc',.16,.28,d,x+side*(w/2-.08),hh+.29,z);cylinder('steel',.055,hh,x+side*w*.46,hh/2,front+.12);}
    return{family:'harbor-clerestory-market-hall',height:hh+3.5};
  }
  for(let i=0;i<parcels.length;i++){
    const raw=parcels[i],seed=Math.floor(hash(i+31)*10000),p={...raw,w:Math.max(3.2,raw.w-.55),d:Math.max(3.2,raw.d-.55),h:Math.max(7,raw.h||17)};
    // The footprint remains the input footprint; the inset leaves an intentional
    // margin for flashings, balcony rails and drainage at building boundaries.
    let family=(raw.kind==='tower'||raw.kind==='office')?2:raw.kind==='warehouse'?0:raw.kind==='civic'?3:raw.kind==='market'?5:raw.kind==='courtyard'?4:raw.kind==='residential'?(seed%3===0?4:1):seed%6;
    if(p.h>36)family=2;if(p.w<6||p.d<6)family=2;
    const program=[2,0,1,5,0,4][family];address={id:8000+i*17,program,tone:.94+hash(seed)*.10};
    const built=[warehouse,timberHomes,office,civic,courtyard,market][family](p,seed);
    designMetadata.push({id:raw.id??'harbor-'+i,x:p.x,z:p.z,width:raw.w,depth:raw.d,height:built.height,family:built.family,signature:built.family+'-'+seed,interiorProgram:{code:program,use:['residential','office','studio','hotel','retail','civic'][program],district:'Harborlight'},parcelId:raw.id,hasRealGroundFloor:p.z>=-30&&p.z<=45});
  }
  kit.finish();
  const dummy=new T.Object3D();let instanceCount=0;
  for(const[key,{kind,material,items}]of batches){
    const geo=material.userData.architecture?geos[kind].clone():geos[kind];
    if(material.userData.architecture)geo.setAttribute('interiorAddress',new T.InstancedBufferAttribute(new Float32Array(items.flatMap(a=>[a.program,a.id,0])),3));
    const mesh=new T.InstancedMesh(geo,material,items.length);mesh.name='harbor-'+key;mesh.castShadow=!material.transparent;mesh.receiveShadow=true;
    for(let i=0;i<items.length;i++){const a=items[i];dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(!material.transparent)mesh.setColorAt(i,new T.Color().setRGB(a.tone,a.tone,a.tone));}
    mesh.computeBoundingSphere();group.add(mesh);instanceCount+=items.length;
  }
  group.userData.designMetadata=designMetadata;group.userData.buildingCount=designMetadata.length;group.userData.architectureInstances=instanceCount;
  return {group,facadeMaterials,designMetadata,buildingCount:designMetadata.length,update(){},setNight(value){for(const mat of facadeMaterials)mat.emissiveIntensity=value?1.35:.045;mats.warm.emissiveIntensity=value?1.8:.06;mats.cool.emissiveIntensity=value?1.1:.04;}};
}
