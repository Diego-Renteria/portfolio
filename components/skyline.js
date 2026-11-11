import {facadeMaterial} from './facade-material.js?v=b477ce33502c';
import {cityProgram} from './city-room-catalog.js?v=b477ce33502c';
import {filteredArchitectureMaterial,architectureFineWidth} from './architecture-filter.js?v=b477ce33502c';
import {insideLand,flatRoadXs,flatRoadZs,inStadiumReserve} from './geography.js?v=b477ce33502c';
import {createSignatureArchitecture,isSignatureParcel} from './signature-architecture.js?v=b477ce33502c';

/** Individually configured NYC architecture surrounding two downtown pocket parks. */
export function buildSkyline(ctx){
  const {THREE:T,world,glowMaterials=[],surfaceMaps={}}=ctx;
  const group=new T.Group(),back=new T.Group(),front=new T.Group(),stadiumBuildings=new T.Group();group.name='nyc-architecture';back.name='permanent-city';front.name='foreground-city';stadiumBuildings.name='stadium-reserve-buildings';group.add(back,front,stadiumBuildings);world.add(group);let stadiumEnabled=false;
  const mats={},colors={limestone:'#c9c4b2',ivory:'#d7d1bd',sandstone:'#afa58b',terracotta:'#b3876b',iron:'#405655',black:'#273a3d',metal:'#7a8b8a',roof:'#586261',copper:'#a29370',wood:'#8d7156',green:'#819172',paving:'#b8b5a4',solar:'#304955'};
  for(const[k,color]of Object.entries(colors))mats[k]=new T.MeshStandardMaterial({color,roughness:['metal','iron','copper','solar'].includes(k)?.48:.88,metalness:['metal','iron','copper'].includes(k)?.5:0});
  const configs={loft:{kind:'brick',stone:true,frame:'#986447',glass:'#3f5559',pitchX:1.6,pitchY:2.15},redLoft:{kind:'brick',stone:true,frame:'#753f35',glass:'#425d64',pitchX:1.36,pitchY:1.9},creamIron:{kind:'iron',stone:true,frame:'#b7b9a5',glass:'#465f64',arch:true,pitchX:1.8,pitchY:2.35},greenIron:{kind:'iron',stone:true,frame:'#45645b',glass:'#344f55',arch:true,pitchX:1.5,pitchY:2.1},deco:{stone:true,frame:'#c2bba6',glass:'#52676a',pitchX:1.3,pitchY:2.1},paleDeco:{stone:true,frame:'#d0cbbb',glass:'#596f75',pitchX:1.7,pitchY:2.4},glass:{frame:'#5b7378',glass:'#557f8a',pitchX:1.45,pitchY:2.2},silverGlass:{frame:'#81959b',glass:'#648a99',pitchX:1.65,pitchY:2.3},darkGlass:{frame:'#36474d',glass:'#304c57',pitchX:1.55,pitchY:2.15},hotel:{stone:true,frame:'#938b78',glass:'#45636d',pitchX:1.5,pitchY:1.9}};
  Object.assign(colors,{porcelain:'#e4e4df',graphite:'#4c5157',clay:'#a16752',buff:'#b59d75',bronze:'#665244'});
  for(const key of ['porcelain','graphite','clay','buff','bronze'])mats[key]=new T.MeshStandardMaterial({color:colors[key],roughness:key==='bronze'?.4:.86,metalness:key==='bronze'?.65:0});
  Object.assign(configs,{
    charcoalBrick:{kind:'brick',stone:true,frame:'#484046',glass:'#303b49',pitchX:1.36,pitchY:1.9},
    ochreBrick:{kind:'brick',stone:true,frame:'#ab784b',glass:'#3b464e',pitchX:1.6,pitchY:2.15},
    porcelainTerra:{kind:'iron',stone:true,frame:'#e1ded5',glass:'#4a5964',arch:true,pitchX:1.8,pitchY:2.35},
    slateStone:{stone:true,frame:'#737a83',glass:'#35404d',pitchX:1.3,pitchY:2.1},
    bronzeGlass:{frame:'#635044',glass:'#534b46',pitchX:1.55,pitchY:2.15},
    blueGlass:{frame:'#72858d',glass:'#3d667e',pitchX:1.65,pitchY:2.3}
  });
  let materialSeed=0;
  for(const[k,c]of Object.entries(configs)){mats[k]=facadeMaterial(T,{...c,surfaceMaps,seed:1841+materialSeed++*317});glowMaterials.push(mats[k]);}
  mats.lamp=new T.MeshStandardMaterial({color:'#dcc699',emissive:'#ffcc85',emissiveIntensity:.4,roughness:.6});glowMaterials.push(mats.lamp);
  // A shallow reflective outer glazing layer leaves furnished room windows
  // visible behind it instead of replacing the shopfront with an opaque slab.
  mats.shopglass=new T.MeshPhysicalMaterial({color:'#75949b',transparent:true,opacity:.20,depthWrite:false,roughness:.18,metalness:.08,clearcoat:1,clearcoatRoughness:.15,envMapIntensity:1.2});
  const batches={back:{},front:{},stadium:{}},facadeBodies=[],streetFrontages=[];let zone='back',activeAddress=null;
  const variants={loft:['loft','ochreBrick','charcoalBrick'],redLoft:['redLoft','charcoalBrick','loft'],creamIron:['creamIron','porcelainTerra'],greenIron:['greenIron','porcelainTerra'],deco:['deco','slateStone','paleDeco'],paleDeco:['paleDeco','porcelainTerra','slateStone'],glass:['glass','blueGlass','bronzeGlass'],silverGlass:['silverGlass','blueGlass'],darkGlass:['darkGlass','bronzeGlass'],hotel:['hotel','slateStone','porcelainTerra']};
  const trimSets=[{limestone:'limestone',ivory:'ivory',sandstone:'sandstone',copper:'copper'},{limestone:'porcelain',ivory:'porcelain',sandstone:'graphite',copper:'metal'},{limestone:'clay',ivory:'buff',sandstone:'bronze',copper:'bronze'},{limestone:'graphite',ivory:'metal',sandstone:'graphite',copper:'bronze'}];
  function part(kind,key,w,h,d,x,y,z,ry=0,rx=0,rz=0){
    y+=activeAddress?.baseY??0;
    if(activeAddress){if(variants[key])key=variants[key][activeAddress.variant%variants[key].length];else key=trimSets[activeAddress.trim][key]||key;}
    (batches[zone][kind+':'+key]??=[]).push({w,h,d,x,y,z,ry,rx,rz,tone:activeAddress?.tone??1,program:activeAddress?.program??(kind==='sculpture'?1:5),address:activeAddress?.id??317});
    // Record the actual articulated bodies, not the bounding box of an address:
    // jambs on setbacks and courtyard wings must stay on their own wall plane.
    if(kind==='box'&&configs[key]&&w>1.5&&d>1.5&&h>3.2&&ry===0&&rx===0&&rz===0)
      facadeBodies.push({key,w,h,d,x,y,z,zone,address:activeAddress?.id??317});
  }
  const b=(key,w,h,d,x,y,z,ry=0,rx=0,rz=0)=>part('box',key,w,h,d,x,y,z,ry,rx,rz);
  const cyl=(key,r,h,x,y,z)=>part('cylinder',key,r,h,r,x,y,z);
  function rail(x,z,w,d,y,key='metal'){
    for(const s of[-1,1]){b(key,w,.12,.12,x,y+.9,z+s*d/2);b(key,.12,.12,d,x+s*w/2,y+.9,z);for(let q=-w/2;q<=w/2;q+=1.5)b(key,.075,.84,.075,x+q,y+.45,z+s*d/2);for(let q=-d/2;q<=d/2;q+=1.5)b(key,.075,.84,.075,x+s*w/2,y+.45,z+q);}
  }
  function cornice(x,z,w,d,y,p=.32){b('limestone',w+p,.22,d+p,x,y,z);b('sandstone',w+p*1.4,.12,d+p*1.4,x,y+.17,z);b('ivory',w+p*1.8,.1,d+p*1.8,x,y+.29,z);}
  function rooftop(a,y,w=a.w,d=a.d){
    const{x,z,roofSeed:s}=a;b('roof',w-.08,.16,d-.08,x,y+.1,z);
    for(const k of[-1,1]){b('limestone',w,.45,.15,x,y+.28,z+k*(d/2-.075));b('limestone',.15,.45,d,x+k*(w/2-.075),y+.28,z);}
    for(let k=0;k<1+s%3;k++){
      const xx=x-w*.25+k*w*.24,zz=z-d*.22;
      b('metal',Math.min(1.65,w*.23),.88,1.75,xx,y+.58,zz);b('black',1.15,.06,1.2,xx,y+1.05,zz);cyl('metal',.4,.1,xx,y+1.12,zz);
      for(let p=0;p<4;p++)b('black',1.2,.09,.07,xx,y+.35+p*.16,zz+.89);
    }
    b('metal',.45,.45,d*.33,x+w*.27,y+.4,z+d*.1);b('ivory',1.6,1.65,1.65,x-w*.26,y+.9,z+d*.22);b('roof',1.8,.13,1.85,x-w*.26,y+1.78,z+d*.22);
    if(s%3===0&&w>6){
      const tx=x+w*.22,tz=z+d*.22;for(const sx of[-.7,.7])for(const sz of[-.7,.7])b('iron',.11,1.65,.11,tx+sx,y+1.05,tz+sz);
      cyl('wood',1,1.7,tx,y+2.48,tz);part('cone','roof',1.15,.62,1.15,tx,y+3.62,tz);for(const yy of[y+1.9,y+2.6,y+3.2])part('ring','metal',1.025,1,1.025,tx,yy,tz);
    }else if(s%3===1){for(let k=0;k<3;k++)b('solar',Math.min(w*.21,1.6),.08,2,x-w*.28+k*w*.25,y+.65,z+d*.25,0,.18);}
    else{for(let k=0;k<2;k++){b('wood',w*.25,.45,1.4,x+(k-.5)*w*.43,y+.4,z+d*.25);b('green',w*.23,.13,1.28,x+(k-.5)*w*.43,y+.72,z+d*.25);}rail(x,z,w-.5,d-.5,y+.15);}
  }
  function entry(a){
    if(Number.isFinite(a.id)&&Math.abs(a.x)<56&&a.z>-49&&a.z<47){streetEntry(a);return;}
    const{x,z,w,d,entrySeed:s}=a,xx=x+(s%3-1)*w*.18;
    b('black',w-.25,2.4,.13,x,1.45,z+d/2+.08);b('silverGlass',w-.65,1.9,.15,x,1.4,z+d/2+.16);
    for(let q=-w/2+.45;q<w/2;q+=1.3)b('copper',.12,2.4,.18,x+q,1.44,z+d/2+.21);
    b('iron',1.15,2.4,.18,xx,1.4,z+d/2+.25);b('glass',.87,1.95,.2,xx,1.4,z+d/2+.29);b('metal',.08,.62,.22,xx+.28,1.28,z+d/2+.4);
    b(s%2?'iron':'copper',Math.min(4,w*.72),.22,1.25,xx,2.86,z+d/2+.6);b('lamp',Math.min(3.4,w*.66),.055,.72,xx,2.72,z+d/2+.55);
    for(const k of[-1,1]){b('iron',.19,.6,.24,xx+k*1.35,2.1,z+d/2+.28);b('lamp',.11,.44,.26,xx+k*1.35,2.1,z+d/2+.32);}b('paving',w+.3,.12,.6,x,.1,z+d/2+.2);
  }
  function streetEntry(a){
    // An entrance belongs to an actual ground-level wing, including L-shaped
    // and courtyard buildings; it must not span the open part of their lot.
    const wing=facadeBodies.filter(p=>p.address===a.id&&p.y-p.h*.5<.3&&p.w>=3.4).sort((p,q)=>(q.z+q.d*.5)-(p.z+p.d*.5))[0]||a;
    const{x,z,w,d}=wing,s=a.entrySeed,program=cityProgram({family:names[a.family],x:a.x,z:a.z}),frontZ=z+d*.5;
    const style=program.code===1?'glazed-office':program.code===2?'workshop-shopfront':program.code===3?'hotel-vestibule':program.code===4?'market-shopfront':s%3===0?'neighborhood-retail':'residential-portal';
    const retail=/shopfront|retail/.test(style),trim=style==='hotel-vestibule'?'copper':s%3===1?'iron':'metal',doorW=style==='glazed-office'?1.55:style==='hotel-vestibule'?1.65:1.05,doorX=x+(s%3-1)*Math.max(0,Math.min(w*.18,1.25,(w-3.35)*.5-.10));
    const soffitY=2.75+(s%3)*.15;
    b('paving',w-.08,.08,.38,x,.09,frontZ+.10);
    // Raised surrounds and the shadowed inner frame make the recess legible
    // without a per-door light or a coplanar decorative texture.
    for(const side of[-1,1]){
      b(retail?'iron':'limestone',.20,soffitY-.25,.24,doorX+side*(doorW*.5+.13),(soffitY+.25)*.5,frontZ+.10);
      b(trim,.055,2.25,.105,doorX+side*doorW*.5,1.37,frontZ+.17);
    }
    b('sandstone',doorW+.65,.18,.30,doorX,soffitY,frontZ+.10);
    b(trim,doorW+.12,.055,.115,doorX,2.52,frontZ+.17);
    b(style==='residential-portal'?'wood':'black',doorW-.12,2.16,.05,doorX,1.36,frontZ+.07);
    b('metal',.035,.54,.055,doorX+doorW*.27,1.40,frontZ+.12);
    if(style==='residential-portal'){
      for(const yy of[.78,1.72]){
        b('sandstone',doorW*.65,.65,.022,doorX,yy,frontZ+.101);
        b('wood',doorW*.56,.55,.025,doorX,yy,frontZ+.118);
      }
      // Some historic lobbies retain a fanlight and narrow sidelights; others
      // use a stone portal with quiet mail/intercom fittings at one side.
      b('shopglass',doorW-.08,.30,.025,doorX,2.73,frontZ+.13);
      if(s%2)for(const side of[-1,1]){b('shopglass',.30,1.78,.025,doorX+side*(doorW*.5+.32),1.42,frontZ+.10);b('iron',.035,1.88,.06,doorX+side*(doorW*.5+.49),1.42,frontZ+.13);}
      const plaqueX=doorX+(s%2?-1:1)*(doorW*.5+.43);b('metal',.17,.28,.035,plaqueX,1.47,frontZ+.15);for(let button=0;button<3;button++)b('black',.07,.025,.045,plaqueX,1.40+button*.06,frontZ+.174);
    }else{
      b('shopglass',doorW-.19,1.86,.025,doorX,1.48,frontZ+.11);
      b(trim,.045,2.15,.07,doorX,1.40,frontZ+.15);
      const bays=retail?2+s%2:2,bayW=(w-.6)/bays;
      for(let bay=0;bay<bays;bay++){
        const bx=x-w*.5+.3+(bay+.5)*bayW;
        if(Math.abs(bx-doorX)<doorW*.5+bayW*.35)continue;
        b('shopglass',bayW-.15,1.86,.025,bx,1.49,frontZ+.07);
        b(trim,bayW-.10,.075,.13,bx,.51,frontZ+.11);
        for(const side of[-1,1])b(trim,.075,2.25,.13,bx+side*(bayW-.10)*.5,1.59,frontZ+.11);
        b(trim,bayW-.10,.055,.13,bx,2.29,frontZ+.11);
        b('shopglass',bayW-.15,.34,.025,bx,2.50,frontZ+.07);
        if(retail&&s%2===0)b('wood',bayW-.16,.34,.14,bx,.32,frontZ+.09);
      }
      if(retail&&s%3!==1){
        // A few modest fabric awnings, never a repeated canopy on every lot.
        const awningW=Math.min(w-.35,3.0+s%3*.7),awningX=x+(s%2?1:-1)*Math.min(.3,w*.05),awningColor=s%2?'green':'terracotta';
        b(awningColor,awningW,.13,.65,awningX,2.87,frontZ+.23,0,-.10);
        b(awningColor,awningW,.18,.08,awningX,2.74,frontZ+.50);
        for(const side of[-1,1])b(trim,.055,.30,.055,awningX+side*(awningW*.5-.13),2.71,frontZ+.34);
      }else if(style==='glazed-office'||style==='hotel-vestibule'){
        const canopyW=Math.min(w-.40,doorW+1.05);b(trim,canopyW,.10,.65,doorX,2.94,frontZ+.21);
        b('lamp',canopyW-.24,.035,.30,doorX,2.87,frontZ+.19);
      }
    }
    // Coarser rusticated bases, slim transoms, and offset doorways make the
    // ground floor feel occupied while leaving the original masses untouched.
    for(const side of[-1,1]){
      const xx=x+side*(w*.5-.16);b(retail?'iron':'limestone',.22,2.75,.19,xx,1.45,frontZ+.08);
      if(!retail&&s%2===0)for(let course=0;course<5;course++)b('sandstone',.26,.055,.22,xx,.55+course*.43,frontZ+.10);
    }
    streetFrontages.push({address:a.id,style,x,z:frontZ,width:w,landUse:program.use});
  }
  function escape(a){
    const{x,z,w,d,h}=a,xx=x-w*.23;
    for(let y=4.3;y<h-1.5;y+=3.1){
      b('iron',2.1,.12,.85,xx,y,z+d/2+.56);b('iron',2.1,.08,.08,xx,y+.8,z+d/2+.94);
      for(const k of[-1,1])b('iron',.08,.84,.08,xx+k,y+.4,z+d/2+.93);
      b('iron',.07,3.3,.07,xx+.82,y-1.45,z+d/2+.77,0,0,.15);b('iron',.07,3.3,.07,xx+.28,y-1.45,z+d/2+.77,0,0,.15);
      for(let k=0;k<8;k++)b('iron',.6,.06,.07,xx+.34+k*.062,y-2.8+k*.39,z+d/2+.77);
    }
  }
  const names=['articulated-brick-loft','cast-iron-arcade','art-deco-setbacks','asymmetric-glass-slab','diagonal-crown','chamfered-tower','balcony-hotel','garden-terraces','loft-penthouse','sawtooth-market-hall','L-shaped-courtyard','U-shaped-mews','linked-twin-wings','offset-cantilevers'],designs=[];
  const signatureArchitecture=createSignatureArchitecture(ctx,group);
  let seed=7133;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  function build(a){
    if(!a.skipEntry&&isSignatureParcel(a.x,a.z,a.id)){designs.push(signatureArchitecture.build(a));return;}
    activeAddress={variant:Math.floor(a.id/3)+a.roofSeed,trim:(a.id+a.roofSeed)%trimSets.length,tone:.9+(a.id*7%13)*.012,id:a.id,baseY:a.baseY??0,program:cityProgram({family:names[a.family],x:a.x,z:a.z}).code};
    const{x,z,w,d,h,family:f,id}=a;const s=zone=(x+w/2>55&&x-w/2<127&&z+d/2>30&&z-d/2<82)?'stadium':Math.abs(x)<60&&z>=27?'front':'back';b('paving',w+.45,.1,d+.4,x,.06,z);
    if(f===0){
      const material=id%2?'redLoft':'loft';
      if(id%3===0){
        b(material,w*.56,h,d,x-w*.22,h/2,z);b(material,w*.44,h*.62,d*.43,x+w*.28,h*.31,z-d*.285);
        cornice(x-w*.22,z,w*.56,d,h+.15,.36);cornice(x+w*.28,z-d*.285,w*.44,d*.43,h*.62+.15,.28);
        rooftop({...a,x:x-w*.22},h+.4,w*.56,d);rooftop({...a,x:x+w*.28,z:z-d*.285},h*.62+.4,w*.44,d*.43);
      }else if(id%3===1){
        b(material,w,h*.56,d,x,h*.28,z);b('creamIron',w*.72,h*.44,d*.72,x+w*.12,h*.78,z-d*.1);cornice(x,z,w,d,h*.56,.4);
        rooftop({...a,x:x+w*.12,z:z-d*.1},h+.2,w*.72,d*.72);rail(x-w*.25,z+d*.2,w*.4,d*.45,h*.56+.2);
      }else{b(material,w,h,d,x,h/2,z);cornice(x,z,w,d,h,.5);for(let y=3.7;y<h;y+=4.1)b('sandstone',w+.1,.2,d+.1,x,y,z);rooftop(a,h+.4);escape(a);}
    }else if(f===8){
      b(id%2?'redLoft':'loft',w,h,d,x,h/2+.1,z);cornice(x,z,w,d,h+.12,.35+id%3*.1);
      for(let y=3.2;y<h;y+=id%2?4.2:3.4)b('sandstone',w+.08,.12,d+.08,x,y,z);
      if(id%3!==1)escape(a);
      if(f===8){const sw=w*(.48+(id%4)*.06),sh=2.4+(id%3)*.6,xx=x+(id%2?1:-1)*w*.12,zz=z-d*.12;b('loft',sw,sh,d*.62,xx,h+sh/2+.1,zz);cornice(xx,zz,sw,d*.62,h+sh+.1,.22);rooftop({...a,x:xx,z:zz},h+sh+.3,sw,d*.62);}else rooftop(a,h+.45);
    }else if(f===1){
      b(id%2?'greenIron':'creamIron',w,h,d,x,h/2+.1,z);cornice(x,z,w,d,h+.12,.48);const bays=3+id%3;
      for(let q=0;q<=bays;q++)b('iron',.17,h-2.7,.26,x-w/2+q*w/bays,(h+2.7)/2,z+d/2+.14);
      for(let y=3;y<h;y+=2.6)b('ivory',w+.12,.2,.3,x,y,z+d/2+.1);rooftop(a,h+.5);
    }else if(f===2){
      const steps=3+id%2;let yy=.1;
      for(let i=0;i<steps;i++){const ratio=1-i*(.12+(id%3)*.015),hh=h*(i===0?.52:.48/(steps-1));b(id%2?'paleDeco':'deco',w*ratio,hh,d*ratio,x,yy+hh/2,z-i*.17);cornice(x,z-i*.17,w*ratio,d*ratio,yy+hh,.18);if(i)rail(x,z-(i-1)*.17,w*(ratio+.07),d*(ratio+.07),yy-.15,'copper');yy+=hh;}
      for(const k of[-1,1])b('limestone',.32,h*.52,.38,x+k*w*.36,h*.26,z+d/2+.16);
      const crown=2.2+id%4*.55;b('copper',w*.3,crown,d*.3,x,yy+crown/2,z-.4);cyl('metal',.12,3.4+id%3,x,yy+crown+1.7,z-.4);rooftop({...a,z:z-.4},yy,w*.55,d*.55);
    }else if(f===3){
      const base=3.4+id%3*.5;b('limestone',w,base,d,x,base/2,z);b(id%2?'silverGlass':'glass',w*.8,h-base,d*.85,x-w*.08,(h+base)/2,z-d*.04);
      for(const k of[-1,1])b('metal',.18,h-base,.26,x-w*.08+k*w*.4,(h+base)/2,z+d*.39);
      b('glass',w*.28,h*.57,d*.55,x+w*.3,base+h*.285,z+d*.1);rooftop({...a,x:x-w*.08,z:z-d*.04},h,w*.8,d*.85);rail(x,z,w-.35,d-.35,base+.08);
    }else if(f===4){
      b('darkGlass',w,h,d,x,h/2,z);const rise=2.3+id%4*.7;part('wedge','darkGlass',w,rise,d,x,h,z,id%2?Math.PI:0);
      b('copper',Math.hypot(w,rise),.2,.18,x,h+rise*.5,z+d/2+.09,0,0,(id%2?-1:1)*Math.atan2(rise,w));
      const ribs=3+id%3;for(let q=0;q<=ribs;q++)b('iron',.18,h,.22,x-w/2+q*w/ribs,h/2,z+d/2+.12);rooftop({...a,x:x-w*.25},h+rise*.15,w*.35,d*.7);
    }else if(f===5){
      part('chamfer',id%2?'glass':'silverGlass',w,h,d,x,h/2,z,Math.PI/8);part('chamfer','metal',w+.1,.27,d+.1,x,h+.14,z,Math.PI/8);
      for(let y=4;y<h;y+=4.1)part('chamfer','metal',w+.08,.12,d+.08,x,y,z,Math.PI/8);rooftop(a,h+.3,w*.7,d*.7);
    }else if(f===6){
      b('hotel',w,h,d,x,h/2+.1,z);cornice(x,z,w,d,h+.15,.26);
      for(let y=4.3;y<h-1;y+=2.8)for(const k of[-1,1]){b('ivory',w*.66,.14,.8,x+k*w*.08,y,z+k*(d/2+.3));b('iron',w*.66,.07,.07,x+k*w*.08,y+.73,z+k*(d/2+.67));for(const dx of[-.27,0,.27])b('iron',.065,.68,.065,x+dx*w+k*w*.08,y+.4,z+k*(d/2+.67));}rooftop(a,h+.42);
    }else if(f===7){
      const levels=3+id%2;let yy=.1;for(let i=0;i<levels;i++){const ww=w*(1-i*.13),dd=d*(1-i*.11),hh=h/levels;b(i%2?'paleDeco':'hotel',ww,hh,dd,x+i*(id%2?.18:-.18),yy+hh/2,z-i*.21);if(i)rail(x,z-i*.21,ww+.5,dd+.5,yy);b('wood',ww*.3,.4,1,x-ww*.25,yy+hh+.25,z+dd*.24);b('green',ww*.28,.13,.85,x-ww*.25,yy+hh+.52,z+dd*.24);yy+=hh;}rooftop({...a,z:z-(levels-1)*.21},h+.2,w*.6,d*.63);
    }else if(f===9){
      const hh=Math.min(h,11.5);b(id%2?'loft':'creamIron',w,hh,d,x,hh/2,z);cornice(x,z,w,d,hh,.2);
      const teeth=Math.max(3,Math.round(w/3));for(let k=0;k<teeth;k++){
        const ww=w/teeth;part('wedge','roof',ww,1.8,d,x-w/2+(k+.5)*ww,hh,z);b('silverGlass',.1,1.6,d*.88,x-w/2+(k+1)*ww-.08,hh+.8,z);
      }
      b('iron',w*.8,.28,1.5,x,2.8,z+d/2+.65);for(let k=-1;k<=1;k++)b('copper',.14,2.6,.14,x+k*w*.3,1.4,z+d/2+1.1);
    }else if(f===10||f===11){
      const side=w*.29,bar=d*.31,material=id%2?'loft':'paleDeco';
      b(material,side,h,d,x-w/2+side/2,h/2,z);b(material,w-side,h*.72,bar,x+side/2,h*.36,z-d/2+bar/2);
      rooftop({...a,x:x-w/2+side/2},h+.15,side,d);rooftop({...a,x:x+side/2,z:z-d/2+bar/2},h*.72+.15,w-side,bar);
      if(f===11){b('greenIron',side,h*.83,d-bar,x+w/2-side/2,h*.415,z+bar/2);rooftop({...a,x:x+w/2-side/2,z:z+bar/2},h*.83+.15,side,d-bar);}
      b('green',w*.35,.15,d*.3,x+w*.05,.16,z+d*.16);b('wood',w*.24,.45,.5,x,.4,z+d*.15);
    }else if(f===12){
      const wing=w*.36,hh=h*.8;b('deco',wing,h,d,x-w*.32,h/2,z);b('hotel',wing,hh,d*.85,x+w*.32,hh/2,z+d*.06);
      b('silverGlass',w*.31,2.5,d*.38,x,h*.56,z);b('metal',w*.33,.25,d*.42,x,h*.56-1.4,z);
      rooftop({...a,x:x-w*.32},h+.1,wing,d);rooftop({...a,x:x+w*.32,z:z+d*.06},hh+.1,wing,d*.85);
    }else{
      const levels=4+id%2;for(let k=0;k<levels;k++){
        const hh=h/levels,ww=w*(.78+(k%2)*.13),dd=d*(.78+((k+1)%2)*.13),xx=x+(k%2?1:-1)*w*.065,zz=z+(k%2?1:-1)*d*.05;
        b(k%2?'darkGlass':'silverGlass',ww,hh,dd,xx,(k+.5)*hh,zz);b('copper',ww+.18,.18,dd+.18,xx,(k+1)*hh,zz);
      }rooftop(a,h+.1,w*.8,d*.8);
    }
    if(!a.skipEntry)entry(a);
    const signature=[f,w.toFixed(3),d.toFixed(3),h.toFixed(3),a.roofSeed,a.entrySeed,id%4].join('/');designs.push({id:`nyc-${String(id).padStart(3,'0')}`,family:names[f],x,z,width:w,depth:d,height:h+activeAddress.baseY,baseY:activeAddress.baseY,roofSeed:a.roofSeed,signature,materialVariant:activeAddress.variant,trimPalette:activeAddress.trim,stadiumReserve:s==='stadium',foregroundOccluder:false});
  }
  const lots=[],xBounds=[-153,...flatRoadXs,153],zBounds=[-104,...flatRoadZs,126];
  for(let iz=0;iz<zBounds.length-1;iz++)for(let ix=0;ix<xBounds.length-1;ix++){
    const x=(xBounds[ix]+xBounds[ix+1])/2,z=(zBounds[iz]+zBounds[iz+1])/2,uw=xBounds[ix+1]-xBounds[ix]-9.4,ud=zBounds[iz+1]-zBounds[iz]-8.6;
    if(uw<7||ud<7||!insideLand(x,z,12))continue;if(Math.abs(x)<22&&(z===11||z===33))continue;
    if(x<-110&&z>91)continue; // curved perimeter street and planted verge
    if(Math.abs(x-13)<5&&Math.abs(z+55.5)<5)continue; // sculptural flagship parcel
    lots.push({x,z,ix,iz,uw,ud});
  }
  lots.sort((a,b)=>Math.hypot(a.x/1.2,a.z+30)-Math.hypot(b.x/1.2,b.z+30));let id=0;
  for(const lot of lots){if(id>=210)break;const mode=(lot.ix*3+lot.iz*5)%7,count=Math.abs(lot.x)<57&&lot.z>=-44&&lot.z<22?1:mode<3?1:mode===6&&lot.uw>19?3:2;
    for(let side=0;side<count&&id<210;side++){
      const slot=lot.uw/count,x=lot.x+(side-(count-1)/2)*slot,z=lot.z+(rand()-.5)*.8,centrality=Math.max(0,1-Math.hypot(x/160,(z+18)/133)),family=count===1?(9+(id+lot.ix)%5):(id*7+lot.iz*3+lot.ix)%9,foreground=lot.z>=55;
      let h=(foreground?10:14)+centrality*(foreground?18:37)+rand()*9;if([0,1,8].includes(family))h=Math.min(h,13+rand()*16);if(family===2&&centrality>.45)h+=10;if(Math.abs(lot.x)<45&&lot.z<=-33&&family===4)h+=15;
      if(Math.abs(x)<52&&foreground)h=Math.min(h,8+rand()*8);if(family>=9)h=Math.min(h,10+rand()*17);
      // The red-brick penthouse loft in front of Diego's block: halve its full
      // roofline height by removing floors, preserving the entry and roof fittings.
      if(id===59){const penthouseHeight=2.4+(id%3)*.6,roofFittingsHeight=2.145;h=(h-penthouseHeight-roofFittingsHeight)*.5;}
      build({x,z,w:Math.max(3.8,slot-(count===1?.5:1.05)-rand()*.5),d:lot.ud-1.2-rand()*1.0,h,family,id,roofSeed:(id*17+lot.ix*3)%37,entrySeed:(id*13+lot.iz)%29});id++;
    }
  }
  // Original flagship: a slender, expanding faceted volume with a visible diagonal
  // exoskeleton. Inspired by program-shaped glass forms, not a copied landmark.
  zone='back';activeAddress=null;
  const heroX=13,heroZ=-55.5,profile=[{y:0,w:8,d:10,x:-1.4,z:0,a:-.04},{y:8,w:9,d:10.5,x:-1,z:0,a:-.02},{y:28,w:11.4,d:12,x:-.2,z:-.2,a:.02},{y:52,w:13.2,d:12.7,x:.6,z:-.4,a:.08},{y:72,w:11.6,d:11.2,x:.4,z:-.7,a:.12},{y:80,w:10.2,d:10,x:.1,z:-.8,a:.15}];
  const ring=[[-.35,-.5],[.35,-.5],[.5,-.35],[.5,.35],[.35,.5],[-.35,.5],[-.5,.35],[-.5,-.35]],heroVertices=[],heroIndices=[];
  function ringPoint(p,k){const[u,v]=ring[k%8],xx=u*p.w,zz=v*p.d;return new T.Vector3(heroX+p.x+xx*Math.cos(p.a)-zz*Math.sin(p.a),p.y+(p.y===80?(v+.5)*2.4+(u+.5)*1.2:0),heroZ+p.z+xx*Math.sin(p.a)+zz*Math.cos(p.a));}
  profile.forEach(p=>ring.forEach((_,k)=>heroVertices.push(...ringPoint(p,k).toArray())));
  for(let j=0;j<profile.length-1;j++)for(let k=0;k<8;k++){const a=j*8+k,bb=j*8+(k+1)%8,c=a+8,dd=bb+8;heroIndices.push(a,c,bb,bb,c,dd);}
  for(let k=1;k<7;k++)heroIndices.push(40,41+k,40+k);
  const sculptural=new T.BufferGeometry();sculptural.setAttribute('position',new T.Float32BufferAttribute(heroVertices,3));sculptural.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(heroVertices.length/3*2),2));sculptural.setIndex(heroIndices);const sculpturalFlat=sculptural.toNonIndexed();sculpturalFlat.computeVertexNormals();
  part('sculpture','silverGlass',1,1,1,0,0,0);
  function interpolated(y){let i=profile.findIndex((p,j)=>j<profile.length-1&&y>=p.y&&y<=profile[j+1].y);if(i<0)i=profile.length-2;const a=profile[i],c=profile[i+1],t=(y-a.y)/(c.y-a.y);return Object.fromEntries(Object.keys(a).map(k=>[k,a[k]+(c[k]-a[k])*t]));}
  function beam(a,c,width=.19){const delta=c.clone().sub(a),mid=a.clone().add(c).multiplyScalar(.5),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.clone().normalize()),e=new T.Euler().setFromQuaternion(q);b('metal',width,delta.length(),width,mid.x,mid.y,mid.z,e.y,e.x,e.z);}
  for(let y=0;y<80;y+=8)for(let k=0;k<8;k++){const a=ringPoint(interpolated(y),k),c=ringPoint(interpolated(Math.min(80,y+8)),(k+1)%8);beam(a,c);if(k%2===0)beam(ringPoint(interpolated(y),(k+1)%8),ringPoint(interpolated(Math.min(80,y+8)),k),.16);}
  for(let k=0;k<8;k++)beam(ringPoint(profile.at(-1),k),ringPoint(profile.at(-1),(k+1)%8),.27);
  b('limestone',9.3,.6,11.1,heroX-1.1,.3,heroZ);entry({x:heroX-1.1,z:heroZ,w:8.8,d:10.4,entrySeed:17});
  designs.push({id:'flagship-aurora-fold',family:'original-faceted-lattice-flagship',x:heroX,z:heroZ,width:16,depth:15.5,height:83.6,signature:'aurora-fold-sculpted-six-profile-exoskeleton',stadiumReserve:false,foregroundOccluder:false});
  // One solid podium closes the alley. Towers begin on its roof, never inside
  // its walls: coincident facade planes here used to fight in the depth buffer.
  const rearPodiumHeight=12;
  b('creamIron',44,rearPodiumHeight,5,0,rearPodiumHeight/2,-99);cornice(0,-99,44,5,rearPodiumHeight,.3);
  const rearTowers=[
    {x:-17.4,w:8.7,h:43,family:2,id:210},
    {x:-8.7,w:8.7,h:55,family:3,id:211},
    {x:0,w:8.7,h:64,family:2,id:212},
    {x:8.7,w:8.7,h:49,family:4,id:213},
    {x:17.4,w:8.7,h:40,family:5,id:214}
  ];
  for(const a of rearTowers)build({...a,h:a.h-rearPodiumHeight,baseY:rearPodiumHeight,skipEntry:true,z:-99,d:5,roofSeed:a.id%37,entrySeed:a.id%29});
  activeAddress=null;
  designs.push({id:'north-terminal-civic-row',family:'continuous-high-rise-terminal-frontage',x:0,z:-99,width:44,depth:5,height:67.6,signature:'north-five-tower-closed-alley-44m',stadiumReserve:false,foregroundOccluder:false,intentionalRoadTerminus:true});
  // The material supplies microstructure; these deep reveals supply real
  // silhouettes and cast shadows at street distance. Four shared materials,
  // instanced into the existing visibility zones, bound the extra draw cost.
  const reliefBuckets={back:{},front:{},stadium:{}},reliefGroups=[],reliefBudget=18000;
  const reliefMaterials={
    masonry:new T.MeshStandardMaterial({color:'#ffffff',roughness:.84,metalness:0}),
    metal:new T.MeshStandardMaterial({color:'#ffffff',roughness:.39,metalness:.58}),
    dark:new T.MeshStandardMaterial({color:'#ffffff',roughness:.48,metalness:.37}),
    stone:new T.MeshStandardMaterial({color:'#ffffff',roughness:.76,metalness:0})
  };
  reliefMaterials.masonry.userData.surface='brick';reliefMaterials.stone.userData.surface='stone';
  reliefMaterials.metal.userData.surface=reliefMaterials.dark.userData.surface='metal';
  let reliefCount=0,reliefBays=0;const detailedAddresses=new Set();
  function reliefPart(body,face,u,yy,ww,hh,depth,key,color,projection=0,arch=false){
    if(reliefCount>=reliefBudget)return;
    const side=face.axis==='x',out=depth*.5+.012+projection;
    const item={x:body.x+(side?face.sign*(body.w*.5+out):u),y:yy,z:body.z+(side?u:face.sign*(body.d*.5+out)),w:arch?ww:side?depth:ww,h:hh,d:arch?depth:side?ww:depth,color,ry:arch&&side?Math.PI*.5:0};
    (reliefBuckets[body.zone][key+(arch?':arch':'')]??=[]).push(item);reliefCount++;
  }
  const nearBodies=facadeBodies.filter(a=>(Math.abs(a.x)<56&&a.z>-49&&a.z<47)||(Math.abs(a.x)<23&&a.z<-95))
    .sort((a,b)=>Math.hypot(a.x,a.z-9)-Math.hypot(b.x,b.z-9));
  for(const body of nearBodies){
    if(reliefCount>reliefBudget-180)break;
    const c=configs[body.key],masonry=Boolean(c.stone||c.kind==='brick'||c.kind==='iron'),px=c.pitchX,py=c.pitchY;
    const inset=masonry?11/64:3/64,bottom=masonry?15/64:5/64,top=58/64;
    const jambWidth=masonry?.10:.045,depth=masonry?.19:.095;
    const tint=new T.Color(c.frame),sillTint=tint.clone().lerp(new T.Color('#d2cab6'),masonry?.34:.08);
    const frameTint=masonry?sillTint:new T.Color(c.frame).multiplyScalar(.58);
    const key=masonry?(c.kind==='brick'?'masonry':'stone'):'metal';
    // The positive-Z frontage and the side that faces the fixed camera receive
    // window-scale relief. Faces behind the building need no invisible meshes.
    const faces=[{axis:'z',sign:1}];
    if(Math.abs(body.x)>9)faces.push({axis:'x',sign:body.x<0?1:-1});
    const minY=Math.max(3.0,body.y-body.h*.5+.15),maxY=body.y+body.h*.5-.16;
    for(const face of faces){
      const width=face.axis==='z'?body.w:body.d;
      const minCol=Math.ceil((-.5*width+.10)/px),maxCol=Math.floor((.5*width-.10)/px)-1;
      const minRow=Math.ceil((minY-bottom*py)/py),maxRow=Math.floor((maxY-top*py)/py);
      if(maxCol<minCol||maxRow<minRow)continue;
      detailedAddresses.add(body.address);
      // World-height indexing keeps floor lines continuous across different
      // podium heights and stacked masses, matching the facade shader exactly.
      for(let row=minRow;row<=maxRow;row++)for(let col=minCol;col<=maxCol;col++){
        if(reliefCount>reliefBudget-12)break;
        const center=(col+.5)*px,left=(col+inset)*px,right=(col+1-inset)*px,low=(row+bottom)*py,high=(row+top)*py;
        const archRise=c.arch?(right-left)*.5:0,jambTop=Math.max(low+.2,high-archRise);
        reliefPart(body,face,left-jambWidth*.5,(low+jambTop)*.5,jambWidth,jambTop-low,depth,key,frameTint);
        reliefPart(body,face,right+jambWidth*.5,(low+jambTop)*.5,jambWidth,jambTop-low,depth,key,frameTint);
        reliefPart(body,face,center,low-.06,right-left+jambWidth*3,.12,masonry?.32:.15,key,sillTint,.015);
        if(c.arch){
          // A shared extruded arch band follows the opening exactly; its
          // smooth outer silhouette never steps across the room's glazing.
          reliefPart(body,face,center,jambTop,right-left,right-left,depth,key,frameTint,0,true);
        }else reliefPart(body,face,center,high+.035,right-left+jambWidth*2,.07,depth,key,frameTint);
        // Thin but genuinely raised aluminum crossbars split the glass; broad
        // stone reveals stay outside the opening and never hide the room atlas.
        reliefPart(body,face,center,(low+high)*.5,.035,high-low,.07,'dark',new T.Color('#3d494b'),.015);
        reliefPart(body,face,center,high-(high-low)*.55,right-left,.038,.07,'dark',new T.Color('#3d494b'),.015);
        reliefBays++;
      }
      if(masonry){
        // Group piers into two-, three-, or four-bay rhythms by address rather
        // than stamping identical pilasters onto every building family.
        const rhythm=2+body.address%3;
        for(let col=minCol;col<=maxCol+1;col++)if((col+body.address)%rhythm===0)
          reliefPart(body,face,col*px,(minY+maxY)*.5,.12,maxY-minY,.14,key,sillTint);
      }
    }
  }
  const archBand=new T.Shape();archBand.moveTo(.56,0);archBand.absarc(0,0,.56,0,Math.PI,false);archBand.lineTo(-.5,0);archBand.absarc(0,0,.5,Math.PI,0,true);archBand.closePath();
  const reliefArchGeometry=new T.ExtrudeGeometry(archBand,{depth:1,curveSegments:12,steps:1,bevelEnabled:false});reliefArchGeometry.translate(0,0,-.5);
  const reliefGeometry=new T.BoxGeometry(1,1,1),reliefDummy=new T.Object3D();
  for(const[zk,bucket]of Object.entries(reliefBuckets)){
    const detail=new T.Group();detail.name=`street-facade-relief-${zk}`;detail.visible=false;reliefGroups.push(detail);
    (zk==='stadium'?stadiumBuildings:zk==='front'?front:back).add(detail);
    for(const[key,items]of Object.entries(bucket)){
      const [material,kind]=key.split(':'),mesh=new T.InstancedMesh(kind==='arch'?reliefArchGeometry:reliefGeometry,reliefMaterials[material],items.length);mesh.name=`recessed-window-${zk}-${key}`;
      items.forEach((a,i)=>{reliefDummy.position.set(a.x,a.y,a.z);reliefDummy.rotation.set(0,a.ry,0);reliefDummy.scale.set(a.w,a.h,a.d);reliefDummy.updateMatrix();mesh.setMatrixAt(i,reliefDummy.matrix);mesh.setColorAt(i,a.color);});
      mesh.castShadow=true;mesh.receiveShadow=true;detail.add(mesh);
    }
  }
  group.userData.facadeRelief={instances:reliefCount,bays:reliefBays,addresses:detailedAddresses.size,batches:reliefGroups.reduce((sum,g)=>sum+g.children.length,0),budget:reliefBudget,worldHeightAligned:true};
  const shape=new T.Shape();shape.moveTo(-.5,0);shape.lineTo(.5,1);shape.lineTo(.5,0);shape.closePath();const wedge=new T.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});wedge.translate(0,0,-.5);
  const geometries={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(1,1,1,14),cone:new T.ConeGeometry(1,1,14),ring:new T.TorusGeometry(1,.045,4,16),chamfer:new T.CylinderGeometry(.5,.5,1,8),wedge,sculpture:sculpturalFlat};geometries.ring.rotateX(Math.PI/2);const dummy=new T.Object3D();
  const viewportHeight={value:720},filteredMats=new Map();
  for(const[zk,bucket]of Object.entries(batches))for(const[key,items]of Object.entries(bucket)){
    const[kind,material]=key.split(':'),geo=geometries[kind].clone();
    if(mats[material].userData.architecture)geo.setAttribute('interiorAddress',new T.InstancedBufferAttribute(new Float32Array(items.flatMap(a=>[a.program,a.address,0])),3));
    geo.setAttribute('architectureFineWidth',new T.InstancedBufferAttribute(new Float32Array(items.map(a=>kind==='box'?architectureFineWidth(a):0)),1));
    if(!filteredMats.has(material))filteredMats.set(material,filteredArchitectureMaterial(mats[material],viewportHeight));
    const mesh=new T.InstancedMesh(geo,filteredMats.get(material),items.length);mesh.name=`architecture-${zk}-${key}`;
    mesh.onBeforeRender=renderer=>{viewportHeight.value=renderer.domElement.height;};
    items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color().setRGB(a.tone,a.tone,a.tone));});mesh.castShadow=material!=='lamp';mesh.receiveShadow=true;(zk==='stadium'?stadiumBuildings:zk==='front'?front:back).add(mesh);
  }
  designs.forEach(d=>{d.interiorProgram=cityProgram(d);});
  signatureArchitecture.finish();
  group.userData.buildingCount=designs.length;group.userData.designMetadata=designs;group.userData.streetFrontages=streetFrontages;
  let nightActive=false,currentView='overview';
  function lighting(){for(const key of Object.keys(configs))mats[key].emissiveIntensity=nightActive?(configs[key].stone?1.8:1.35):currentView==='overview'?.025:.06;mats.lamp.emissiveIntensity=nightActive?2.1:.06;for(const[key,material]of filteredMats)material.emissiveIntensity=mats[key].emissiveIntensity;signatureArchitecture.setNight(nightActive);}
  return{group,buildingCount:designs.length,designMetadata:designs,signatureArchitecture,facadeMaterials:[...Object.keys(configs).map(k=>mats[k]),...signatureArchitecture.facadeMaterials],setStadium(enabled){stadiumEnabled=Boolean(enabled);stadiumBuildings.visible=!stadiumEnabled;},setQuality(mode,view){currentView=view;back.visible=true;front.visible=true;stadiumBuildings.visible=!stadiumEnabled;for(const detail of reliefGroups)detail.visible=mode!=='low'&&view!=='overview';lighting();},setNight(night){nightActive=Boolean(night);lighting();}};
}
