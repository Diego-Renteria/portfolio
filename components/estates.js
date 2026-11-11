import {estateSites,terrainHeight} from './geography.js?v=b477ce33502c';

/** Large private hillside compounds, built on the geography's terraced lots. */
export function buildEstates(ctx){
  const {THREE:T,world,glowMaterials=[]}=ctx;
  const group=new T.Group();group.name='Hillside estates and private gardens';world.add(group);
  const palette={stone:'#aaa391',limestone:'#d5c9b2',stucco:'#eee1c7',wood:'#946a47',cedar:'#b5804e',dark:'#343d3d',roof:'#4c5356',tile:'#956348',glass:'#416e78',window:'#9fbdc0',metal:'#73807c',lawn:'#788d58',lawnLight:'#869b64',hedge:'#4c6743',trunk:'#6c4c35',gold:'#c99233',rust:'#a85830',paving:'#c8bca6',water:'#56b6ba',poolDeep:'#267e91',white:'#efebdc',court:'#587b73',courtClay:'#a76b48',line:'#e5d9bd',road:'#626360',carBlue:'#3b6279',carRed:'#9b5340',carCream:'#e7ddc6',tire:'#252d2f',solar:'#264049',flower:'#b96244'};
  const mats={};for(const [k,c]of Object.entries(palette))mats[k]=new T.MeshStandardMaterial({color:c,roughness:k==='water'?.18:k==='glass'?.22:.83,metalness:k==='glass'?.35:k==='metal'?.55:0});
  mats.water.envMapIntensity=1.1;mats.glass.envMapIntensity=.9;
  mats.light=new T.MeshStandardMaterial({color:'#ffe2a4',emissive:'#ffcd7d',emissiveIntensity:.16,roughness:.6});glowMaterials.push(mats.light);
  const batches=new Map();
  let site;
  function part(kind,key,w,h,d,x,y,z,rx=0,ry=0,rz=0){
    const a=site.yaw||0,c=Math.cos(a),s=Math.sin(a),name=kind+':'+key;
    if(!batches.has(name))batches.set(name,[]);
    batches.get(name).push({w,h,d,x:site.x+x*c+z*s,y:site.y+y,z:site.z+z*c-x*s,rx,ry:ry+a,rz});
  }
  const b=(key,w,h,d,x,y,z,rx=0,ry=0,rz=0)=>part('box',key,w,h,d,x,y,z,rx,ry,rz);
  const c=(key,r,h,x,y,z)=>part('cylinder',key,r,h,r,x,y,z);
  const sphere=(key,w,h,d,x,y,z)=>part('sphere',key,w,h,d,x,y,z);
  const rail=(x,z,w,d,y=4.2)=>{
    b('metal',w,.07,.07,x,y,z+d/2);b('metal',.07,.07,d,x+w/2,y,z);
    for(let u=-w/2;u<=w/2;u+=.9)b('metal',.045,.95,.045,x+u,y-.46,z+d/2);
    for(let v=-d/2;v<=d/2;v+=.9)b('metal',.045,.95,.045,x+w/2,y-.46,z+v);
  };
  function glazing(x,z,w,y,h){
    b('glass',w,h,.12,x,y,z);
    b('dark',w+.14,.12,.2,x,y+h/2,z+.02);b('dark',w+.14,.12,.2,x,y-h/2,z+.02);
    for(let q=-w/2;q<=w/2+.01;q+=1.3)b('dark',.065,h,.19,x+q,y,z+.04);
  }
  function gardenTree(x,z,size=1){
    c('trunk',.18*size,2.7*size,x,1.5+1.35*size,z);
    for(let k=0;k<5;k++)sphere(k%2?'gold':'rust',1.15*size,1.25*size,1.05*size,x+Math.cos(k*2.4)*.65*size,3.4*size+1.2+(k%2)*.4,z+Math.sin(k*2.4)*.65*size);
  }
  function chair(x,z,angle=0){
    b('wood',.55,.1,1.6,x,1.46,z,0,angle);b('white',.5,.16,1.05,x,1.58,z+.18,0,angle);
    b('white',.5,.55,.12,x,1.85,z-.53,-.35,angle);
    for(const dx of [-.2,.2])for(const dz of [-.55,.55])b('metal',.06,.35,.06,x+dx,1.28,z+dz);
  }
  function pool(x,z,w=4,d=8){
    b('limestone',w+1.2,.22,d+1.2,x,1.2,z);b('poolDeep',w,.13,d,x,1.32,z);b('water',w-.25,.045,d-.25,x,1.41,z);
    for(let q=-d/2+.4;q<d/2;q+=.6){b('white',.1,.035,.14,x-w/2+.2,1.45,z+q);b('white',.1,.035,.14,x+w/2-.2,1.45,z+q);}
    b('white',w*.5,.09,.45,x,1.46,z-d/2+.22);b('white',w*.5,.07,.4,x,1.42,z-d/2+.55);
    for(const xx of [x-.4,x+.4]){c('metal',.045,1.05,xx,1.58,z+d/2-.45);b('metal',.08,.08,.6,xx,2.08,z+d/2-.2);}
    chair(x-1,z+d/2+1.15);chair(x+.1,z+d/2+1.15);
    c('metal',.045,2.5,x+1.45,2.5,z+d/2+.95);part('cone','white',1.3,.5,1.3,x+1.45,3.8,z+d/2+.95);
  }
  function basketball(x,z,w=9,d=6){
    b('stone',w+.6,.13,d+.6,x,1.23,z);b('court',w,.05,d,x,1.33,z);
    // Inlaid painted boundary, centre stripe, free throw rectangle and arc.
    for(const dx of [-w/2+.15,w/2-.15])b('line',.055,.025,d-.3,x+dx,1.375,z);
    for(const dz of [-d/2+.15,d/2-.15])b('line',w-.3,.025,.055,x,1.375,z+dz);
    b('line',.055,.025,d-.3,x,1.375,z);
    for(const side of [-1,1]){
      const xx=x+side*(w/2-.9);b('line',1.65,.025,.055,xx-side*.75,1.375,z-1);b('line',1.65,.025,.055,xx-side*.75,1.375,z+1);b('line',.055,.025,2,xx-side*1.55,1.375,z);
      c('dark',.065,2.5,xx,2.6,z);b('dark',.6,.08,.08,xx-side*.25,3.84,z);
      b('white',.07,.75,1.2,xx-side*.5,3.7,z);b('courtClay',.32,.04,.45,xx-side*.71,3.47,z);
      for(let k=0;k<17;k++){const a=-Math.PI/2+k*Math.PI/16;const a2=a+Math.PI/16;const ax=xx-side*.12-side*Math.cos(a)*2.4,az=z+Math.sin(a)*2.4;const bx=xx-side*.12-side*Math.cos(a2)*2.4,bz=z+Math.sin(a2)*2.4;b('line',Math.hypot(bx-ax,bz-az),.025,.045,(ax+bx)/2,1.375,(az+bz)/2,0,-Math.atan2(bz-az,bx-ax));}
    }
  }
  function tennis(x,z,w=9.5,d=6){
    b('courtClay',w+.6,.1,d+.6,x,1.3,z);b('court',w,.025,d,x,1.37,z);
    for(const dx of [-w/2+.3,w/2-.3])b('line',.05,.025,d-.6,x+dx,1.4,z);
    for(const dz of [-d/2+.3,d/2-.3,-d/2+1.15,d/2-1.15])b('line',w-.6,.025,.05,x,1.4,z+dz);
    for(const dx of [-w/2+2,w/2-2])b('line',.05,.025,d-.6,x+dx,1.4,z);
    b('metal',.05,.85,d+.5,x,1.8,z);
    for(let yy=1.45;yy<2.2;yy+=.12)b('white',.06,.02,d+.5,x,yy,z);
    for(let zz=-d/2;zz<d/2;zz+=.2)b('white',.06,.8,.02,x,1.8,z+zz);
    for(const zz of [-d/2-.25,d/2+.25])c('white',.06,.95,x,1.83,z+zz);
  }
  for(const [index,a]of estateSites.entries()){
    site={...a,y:Number.isFinite(a.y)?a.y:terrainHeight(a.x,a.z)};
    // A continuous stone plinth cuts into the slope instead of floating above it.
    b('stone',23.6,1.2,20.6,0,.53,0);b('paving',23.3,.16,20.3,0,1.15,0);
    b('lawn',22.5,.08,19.5,0,1.27,0);
    for(let q=-10.6;q<11;q+=1.8)b('lawnLight',.9,.018,19.2,q,1.32,0);
    for(const x of [-11.5,11.5]){b('limestone',.35,1.6,20,x,1.8,0);b('hedge',.7,.7,19.6,x,2.45,0);}
    b('limestone',23.3,1.5,.35,0,1.8,-10.1);b('hedge',22.8,.7,.75,0,2.4,-10.1);
    // Street-facing wall is open at a gated drive; path connects to hillside road.
    b('limestone',16,.8,.35,-3.5,1.55,10);b('metal',3,.9,.14,7.4,1.73,10);
    for(const x of [5.8,9]){b('stone',.6,1.5,.6,x,2,10);b('light',.32,.25,.32,x,2.9,10);}
    b('paving',3.1,.06,10.3,7.4,1.34,6.2);b('paving',1.2,.07,5,-2,1.35,6.7);
    // Entry ramp reaches the road without bridging empty air on a grade.
    const roadY=terrainHeight(site.x+7.4,site.z+13.6),rise=site.y+1.28-roadY;
    b('road',3.1,.16,4.2,7.4,1.28-rise/2,12,Math.atan2(rise,4.2));
    const style=index%4;
    if(style===0){
      // Cantilevered contemporary villa with timber soffits and a roof terrace.
      b('limestone',11.7,3.25,8.2,-3.5,2.94,-3.7);b('wood',5,3.3,8.2,-6.85,6.2,-3.7);
      b('stucco',9.2,3.2,6.6,-2.2,6.2,-4.4);b('dark',12.8,.23,9,-3.5,4.68,-3.7);
      b('white',10.1,.25,7.3,-2.2,7.94,-4.4);b('wood',12.3,.13,8.7,-3.5,1.42,-3.7);
      glazing(-3.2,.47,10.3,3,2.55);glazing(-1.55,-1.04,7.5,6.2,2.5);
      b('glass',.12,2.6,6,-8.93,3,-3.5);for(let z=-6;z<0;z+=1.1)b('dark',.18,2.7,.07,-8.99,3,z);
      b('paving',5,.22,2.4,-5.5,4.85,1.2);rail(-5.5,1.2,5,2.4,5.87);
      for(let x=-7.5;x<-3;x+=.4)b('wood',.12,2.9,.16,x,6.15,-7.8);
      b('dark',3.5,.3,2,-2,8.15,-4.5);for(let q=0;q<5;q++)b('solar',.57,.09,1.65,-3.35+q*.68,8.35,-4.5,.12);
    }else if(style===1){
      // A substantial Northwest timber-and-stone manor with intersecting roofs.
      b('stone',12.5,1.25,8.5,-3.4,1.9,-3.5);b('cedar',12.5,4.7,8.5,-3.4,4.65,-3.5);
      part('gable','roof',13.6,3.3,9.4,-3.4,7,-3.5);b('stucco',5.4,5.5,5,-6.5,4.8,-1.6);part('gable','roof',6,2.4,5.8,-6.5,7.55,-1.6,0,Math.PI/2);
      b('wood',11.7,.24,2.1,-3.4,1.6,1.5);b('roof',12.2,.2,2.5,-3.4,4.4,1.5,.12);
      for(const xx of [-8.6,-4.8,-.8,2]){b('stone',.65,.9,.65,xx,2.1,2.2);b('wood',.24,1.9,.24,xx,3.4,2.2);}
      for(let yy=2.7;yy<6.9;yy+=.28)b('wood',12.55,.035,.035,-3.4,yy,.78);
      for(const xx of [-7.5,-3.5,.5]){glazing(xx,.82,1.75,3.35,1.9);glazing(xx,.82,1.65,5.75,1.6);}
      b('stone',1.15,4.8,1.1,-7.7,7.4,-5.5);b('dark',1.45,.16,1.4,-7.7,9.9,-5.5);
      for(let q=0;q<4;q++)b('paving',3,.18,.45,-2,1.3-q*.14,2.6+q*.4);
    }else if(style===2){
      // Pale courtyard estate: two wings frame a planted outdoor room.
      b('stucco',17.4,4,5,-.8,3.3,-6);b('stucco',3.8,4,7,-7.6,3.3,-1);b('stucco',3.8,4,7,6,3.3,-1);
      for(const xx of [-7.6,6]){part('gable','tile',4.5,1.5,7.8,xx,5.3,-1);for(const zz of [-2.5,.4]){b('glass',.08,2.2,1.5,xx+(xx<0?2:-2),3,zz);}}
      part('gable','tile',18,1.7,5.6,-.8,5.3,-6);glazing(-.5,-3.43,9.6,3.3,2.5);
      b('paving',9,.12,5.7,-.8,1.4,-.3);b('poolDeep',3.2,.15,4.5,-.8,1.48,-.3);b('water',3,.04,4.3,-.8,1.58,-.3);
      for(const xx of [-4.8,3.2])for(let zz=-2.4;zz<3;zz+=1.6){b('limestone',.26,2.9,.26,xx,2.9,zz);}
      b('wood',8.6,.2,5.9,-.8,4.4,-.1);for(let xx=-5;xx<4;xx+=.55)b('cedar',.15,.12,5.9,xx,4.57,-.1);
      for(const xx of [-5.5,4]){c('stone',.45,.7,xx,1.7,3.3);sphere('hedge',.7,.8,.7,xx,2.4,3.3);}
    }else{
      // Layered hillside house: a stone lower floor and long glass upper pavilion.
      b('stone',13.4,3.1,8.7,-3.1,2.9,-3.4);b('wood',5,3.2,7,-7,6.05,-4.2);b('glass',8.8,2.9,6.7,-.8,6.2,-4.2);
      b('white',14.4,.25,9.5,-3.1,4.6,-3.4);b('roof',14.6,.2,7.7,-3.1,7.8,-4.2);
      glazing(-3.3,1.02,11.6,2.95,2.35);for(let xx=-4.9;xx<3.6;xx+=1.5)b('dark',.07,3,.09,xx,6.2,-.8);
      b('paving',12,.2,2.2,-2.6,4.7,1.4);rail(-2.6,1.4,12,2.2,5.75);
      for(let n=0;n<5;n++)b('paving',3.5,.18,.7,-6.5,1.25+n*.18,3.1-n*.6);
      for(let xx=-8;xx<-4.6;xx+=.28)b('cedar',.09,2.9,.12,xx,6.15,-.65);
    }
    // The yards are deliberately varied rather than repeating one amenity tile.
    if(style===0||style===3)pool(8,-4.3,3.6,7.8);
    if(index%3===0)basketball(-3.4,6.1,9.2,5.8);
    else if(index%3===1)tennis(-3.4,6.1,9.2,5.8);
    else{
      b('paving',8.8,.07,4.8,-3.4,1.4,6.1);
      for(let xx=-7.2;xx<1;xx+=1.2)for(let zz=4.2;zz<8.3;zz+=1.2)b('limestone',1.08,.025,1.08,xx,1.46,zz);
      b('wood',2.9,.18,1.5,-3.8,2,6);for(const xx of [-5.1,-2.5])for(const zz of [5.45,6.55])b('wood',.12,.7,.12,xx,1.6,zz);
      for(const xx of [-5.7,-2.1])for(const zz of [5.35,6.65]){b('white',.65,.15,.65,xx,1.9,zz);b('wood',.65,.8,.09,xx,2.3,zz+.32);}
      c('metal',.05,2.6,-3.8,2.7,6);part('cone','white',2.3,.6,2.3,-3.8,4.1,6);
    }
    b('stone',3.5,2.7,4.7,7.4,2.65,5.2);b('roof',3.8,.18,5,7.4,4.1,5.2);b('dark',2.8,2,.1,7.4,2.55,7.61);
    for(let yy=1.7;yy<3.5;yy+=.25)b('metal',2.65,.035,.11,7.4,yy,7.68);
    // Mature autumn trees, planted borders, clipped hedges and small entry lamps.
    gardenTree(-10.3,-8.5,.85);gardenTree(10.15,8.6,.65);if(style===1||style===2)gardenTree(9,-7.7,.8);
    for(let q=0;q<7;q++){
      b('stone',.7,.45,.75,-10.4,1.55,-5.9+q*2.1);sphere(q%3===0?'flower':'hedge',.65,.5,.7,-10.4,1.94,-5.9+q*2.1);
    }
    for(const zz of [-1,3,7]){b('dark',.09,.85,.09,10.25,1.7,zz);b('light',.22,.18,.22,10.25,2.19,zz);}
  }
  const shape=new T.Shape();shape.moveTo(-.5,0);shape.lineTo(0,1);shape.lineTo(.5,0);shape.closePath();
  const gable=new T.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});gable.translate(0,0,-.5);
  const geos={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(1,1,1,10),sphere:new T.SphereGeometry(1,8,6),cone:new T.ConeGeometry(1,1,12),gable};
  const dummy=new T.Object3D();
  for(const[key,items]of batches){
    const[kind,mat]=key.split(':'),mesh=new T.InstancedMesh(geos[kind],mats[mat],items.length);mesh.name='estates '+key;
    items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
  return{group,estateCount:estateSites.length};
}
