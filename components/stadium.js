import {createVehicleLibrary} from './vehicle-models.js?v=b477ce33502c';

export const STADIUM_BOUNDS=Object.freeze({minX:55,maxX:127,minZ:30,maxZ:82});
export const STADIUM_PITCH=Object.freeze({length:105*.38,width:68*.38,scale:.38,metres:{length:105,width:68}});
// An original football ground. FIFA pitch proportions and bowl/run-off principles;
// an open field and independently arched stand roofs acknowledge Seattle's venues.
export function buildStadium(ctx){
  const {THREE:T,world}=ctx,group=new T.Group();group.name='Cedar Field optional football stadium';group.position.set(91,0,55);group.visible=false;world.add(group);
  group.userData={variant:'stadium',pitch:STADIUM_PITCH,sourceLinks:[
    'https://quality.fifa.com/innovation/stadium-guidelines/technical-guidelines/stadiums-guidelines/pitch-dimensions-and-surrounding-areas',
    'https://publications.fifa.com/de/football-stadiums-guidelines/general-process-guidelines/design/stadium-bowl/',
    'https://www.lumenfield.com/venue-info/stadium-history-facts']};
  const colors={concrete:'#babcae',lightConcrete:'#d8d6c7',darkConcrete:'#7d8d86',steel:'#e0e3d9',darkSteel:'#4c615f',glass:'#456969',roof:'#e9e8df',roofGrey:'#cad3ca',green:'#37695b',seatGreen:'#2f7660',seatLight:'#9fb6a6',seatDark:'#31544e',seatWhite:'#dfdfca',turf:'#668957',turfLight:'#71965d',line:'#f4efdd',asphalt:'#535e5c',sand:'#b8ae92',dark:'#293d3b',gold:'#c59653',bark:'#6b5441',leafGold:'#d2a43c',leafRust:'#ad5d32',leafRed:'#9a4931',soil:'#645745'};
  const mats={};for(const[k,c]of Object.entries(colors))mats[k]=ctx.material(c,['steel','darkSteel'].includes(k)?'metal':k==='roof'?'metal':k==='turf'?'grass':k.toLowerCase().includes('concrete')?'concrete':'plain');
  mats.glass=new T.MeshStandardMaterial({color:colors.glass,roughness:.22,metalness:.3});
  mats.floodlight=new T.MeshStandardMaterial({color:'#fff9dd',emissive:'#fff1c3',emissiveIntensity:.12,roughness:.35});
  mats.ribbon=new T.MeshStandardMaterial({color:'#c9dfc5',emissive:'#8ab7a4',emissiveIntensity:.12,roughness:.5});
  ctx.glowMaterials.push(mats.floodlight,mats.ribbon);
  const ribbonMaterials=[mats.ribbon];
  // One shadowless source represents the many visible roof-mounted floodlights.
  const pitchLight=new T.SpotLight('#fff1d8',0,95,1.12,.62,1.25);
  pitchLight.name='Stadium night pitch illumination';pitchLight.position.set(0,34,0);pitchLight.castShadow=false;
  pitchLight.target.position.set(0,.3,0);group.add(pitchLight,pitchLight.target);
  const geometries={box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(1,1,1,10)},batches=new Map(),surfaceBatches=new Map(),o=new T.Object3D();
  function add(kind,mat,w,h,d,x,y,z,rotation=[0,0,0]){const key=kind+':'+mat;if(!batches.has(key))batches.set(key,{geo:geometries[kind],mat:mats[mat],parts:[]});batches.get(key).parts.push({w,h,d,x,y,z,rotation});}
  const box=(mat,w,h,d,x,y,z,rotation)=>add('box',mat,w,h,d,x,y,z,rotation);
  const cyl=(mat,r,h,x,y,z,rotation)=>add('cyl',mat,r,h,r,x,y,z,rotation);
  function rod(mat,a,b,r=.055){const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p),e=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()));cyl(mat,r,v.length(),(p.x+q.x)/2,(p.y+q.y)/2,(p.z+q.z)/2,[e.x,e.y,e.z]);}
  function quad(mat,a,b,c,d){if(!surfaceBatches.has(mat))surfaceBatches.set(mat,[]);surfaceBatches.get(mat).push(...a,...b,...c,...a,...c,...d);}
  const pow=(v,p)=>Math.sign(v)*Math.pow(Math.abs(v),p);
  function perimeter(a,hx,hz){return{x:hx*pow(Math.cos(a),.4),z:hz*pow(Math.sin(a),.4)};}
  function normal(p,hx,hz){const nx=pow(p.x/hx,4)/hx,nz=pow(p.z/hz,4)/hz,l=Math.hypot(nx,nz);return{x:nx/l,z:nz/l};}
  function ring(mat,innerX,innerZ,outerX,outerZ,innerY,outerY,segments=160){for(let i=0;i<segments;i++){const a=i*Math.PI*2/segments,b=(i+1)*Math.PI*2/segments,p=perimeter(a,innerX,innerZ),q=perimeter(b,innerX,innerZ),r=perimeter(b,outerX,outerZ),s=perimeter(a,outerX,outerZ);quad(mat,[p.x,innerY,p.z],[q.x,innerY,q.z],[r.x,outerY,r.z],[s.x,outerY,s.z]);}}
  function wall(mat,hx,hz,y0,y1,segments=160){for(let i=0;i<segments;i++){const p=perimeter(i*Math.PI*2/segments,hx,hz),q=perimeter((i+1)*Math.PI*2/segments,hx,hz);quad(mat,[p.x,y0,p.z],[q.x,y0,q.z],[q.x,y1,q.z],[p.x,y1,p.z]);}}
  function line(a,b,width=.048,y=.325){const dx=b[0]-a[0],dz=b[1]-a[1];box('line',Math.hypot(dx,dz),.018,width,(a[0]+b[0])/2,y,(a[1]+b[1])/2,[0,-Math.atan2(dz,dx),0]);}
  function arc(cx,cz,r,a0,a1,segments=48){for(let i=0;i<segments;i++){const a=a0+(a1-a0)*i/segments,b=a0+(a1-a0)*(i+1)/segments;line([cx+Math.cos(a)*r,cz+Math.sin(a)*r],[cx+Math.cos(b)*r,cz+Math.sin(b)*r]);}}
  // Three distinct rings of raked stands enclose generous grass run-off.
  ring('lightConcrete',21.2,13.8,31.1,20.9,.16,.16);wall('concrete',30.9,20.6,.16,3.4);wall('glass',30.95,20.65,3.45,4.8);wall('darkConcrete',30.9,20.6,4.85,6.6);
  for(const y of[.4,3.4,4.85,6.6])ring('steel',30.65,20.4,31.15,20.9,y,y+.05);
  box('turf',STADIUM_PITCH.length+3.1,.11,STADIUM_PITCH.width+3.1,0,.23,0);
  const L=STADIUM_PITCH.length,W=STADIUM_PITCH.width,S=STADIUM_PITCH.scale;
  for(let i=0;i<14;i++)box(i%2?'turfLight':'turf',L/14,.02,W,-L/2+L/28+i*L/14,.295,0);
  for(const z of[-W/2,W/2])line([-L/2,z],[L/2,z]);for(const x of[-L/2,L/2,0])line([x,-W/2],[x,W/2]);arc(0,0,9.15*S,0,Math.PI*2,72);cyl('line',.065,.019,0,.33,0);
  for(const side of[-1,1]){
    const goalX=side*L/2,penaltyX=side*(L/2-11*S),boxX=side*(L/2-16.5*S);
    for(const[w,depth]of[[40.32*S,16.5*S],[18.32*S,5.5*S]]){const x=goalX-side*depth;line([x,-w/2],[x,w/2]);for(const z of[-w/2,w/2])line([goalX,z],[x,z]);}
    cyl('line',.06,.019,penaltyX,.33,0);const half=Math.acos((16.5-11)/9.15);for(let i=0;i<28;i++){const a=-half+i*2*half/28,b=-half+(i+1)*2*half/28;line([penaltyX-side*Math.cos(a)*9.15*S,Math.sin(a)*9.15*S],[penaltyX-side*Math.cos(b)*9.15*S,Math.sin(b)*9.15*S]);}
    // Goal frame and taut, individual square net strands; no solid white boxes.
    const gw=7.32*S,gh=2.44*S,depth=.75,y=.32,rear=goalX+side*depth;
    for(const z of[-gw/2,gw/2]){rod('line',[goalX,y,z],[goalX,y+gh,z],.025);rod('line',[goalX,y+gh,z],[rear,y+gh*.76,z],.018);rod('line',[rear,y,z],[rear,y+gh*.76,z],.018);rod('line',[goalX,y,z],[rear,y,z],.018);}
    rod('line',[goalX,y+gh,-gw/2],[goalX,y+gh,gw/2],.025);rod('line',[rear,y+gh*.76,-gw/2],[rear,y+gh*.76,gw/2],.018);
    for(let z=-gw/2;z<=gw/2;z+=.12){rod('line',[rear,y,z],[rear,y+gh*.76,z],.0045);rod('line',[goalX,y+gh,z],[rear,y+gh*.76,z],.0045);}
    for(let yy=0;yy<=gh*.76;yy+=.12){rod('line',[rear,y+yy,-gw/2],[rear,y+yy,gw/2],.0045);for(const z of[-gw/2,gw/2])rod('line',[goalX,y+yy,z],[rear,y+yy,z],.0045);}
    for(const zs of[-1,1]){const cx=goalX,cz=zs*W/2;for(let j=0;j<12;j++){const a=j*Math.PI/24,b=(j+1)*Math.PI/24;line([cx-side*Math.cos(a)*S,cz-zs*Math.sin(a)*S],[cx-side*Math.cos(b)*S,cz-zs*Math.sin(b)*S]);}cyl('line',.012,.65,cx,.65,cz);box('gold',.15,.1,.012,cx+side*.06,.94,cz);}
  }
  // Team shelters, separate seats and a central access tunnel at the halfway line.
  for(const x of[-5.7,5.7]){box('darkSteel',3.9,.08,.7,x,.55,-14.25);for(let j=0;j<10;j++){box('seatLight',.25,.12,.32,x-1.62+j*.36,.73,-14.25);box('seatGreen',.25,.38,.05,x-1.62+j*.36,.95,-14.5);}for(const dx of[-2,2])rod('steel',[x+dx,.4,-14.68],[x+dx,1.55,-14.68],.025);box('glass',4.15,.035,.82,x,1.58,-14.25,[.1,0,0]);}
  box('dark',1.6,1.2,1.25,0,.85,-15.1);box('darkConcrete',2,.18,1.4,0,1.55,-15.2);
  let seatCount=0;
  const tierData=[];
  // Equal-distance sampling gives consistent seat spacing on flat sides and corners.
  function sampleLoop(hx,hz){const pts=[],lengths=[0];let total=0;for(let k=0;k<=2048;k++){const p=perimeter(k*Math.PI*2/2048,hx,hz);pts.push(p);if(k){total+=Math.hypot(p.x-pts[k-1].x,p.z-pts[k-1].z);lengths.push(total);}}return{pts,lengths,total};}
  for(let tier=0;tier<3;tier++){
    const start=tier*2.32,baseY=1.05+tier*2.17; tierData.push({tier,rows:10,baseY});
    for(let row=0;row<10;row++){
      const r=start+row*.2,hx=23.5+r,hz=15.5+r*.72,y=baseY+row*.145;
      ring('lightConcrete',hx,hz,hx+.23,hz+.166,y,y);wall('concrete',hx,hz,y-.15,y);
      const loop=sampleLoop(hx+.11,hz+.079),count=Math.floor(loop.total/.218),sectionSize=count/24;
      let cursor=0;
      for(let j=0;j<count;j++){
        if(j%sectionSize<3.2)continue;const distance=loop.total*j/count;while(loop.lengths[cursor+1]<distance)cursor++;
        const f=(distance-loop.lengths[cursor])/(loop.lengths[cursor+1]-loop.lengths[cursor]),p={x:T.MathUtils.lerp(loop.pts[cursor].x,loop.pts[cursor+1].x,f),z:T.MathUtils.lerp(loop.pts[cursor].z,loop.pts[cursor+1].z,f)},n=normal(p,hx+.11,hz+.079),yaw=Math.atan2(n.x,n.z);
        const sector=Math.floor(j/sectionSize),mat=(sector+Math.floor(row/3)+tier)%11===0?'seatWhite':tier===1?'seatDark':sector%4===0?'seatLight':'seatGreen';
        box(mat,.175,.055,.16,p.x,y+.055,p.z,[0,yaw,0]);box(mat,.175,.23,.035,p.x+n.x*.078,y+.17,p.z+n.z*.078,[-.12,yaw,0]);seatCount++;
      }
    }
    // Continuous cross aisle, front barrier, openings and paired stair rails.
    const outer=start+1.99,iy=baseY+1.5;ring('darkConcrete',23.5+outer,15.5+outer*.72,24+outer,15.86+outer*.72,iy,iy);
    for(let sector=0;sector<24;sector++){
      const a=(sector+.03)*Math.PI*2/24,p=perimeter(a,23.5+start,15.5+start*.72),q=perimeter(a,25.5+start,16.94+start*.72),n=normal(q,25.5+start,16.94+start*.72),yaw=Math.atan2(n.x,n.z);
      if(tier<2){box('dark',.64,.73,.5,q.x,iy+.29,q.z,[0,yaw,0]);box('lightConcrete',.8,.12,.62,q.x,iy+.69,q.z,[0,yaw,0]);}
      rod('steel',[p.x,baseY+.55,p.z],[q.x,iy+.55,q.z],.014);
      for(let row=0;row<10;row++){const k=row/9,x=T.MathUtils.lerp(p.x,q.x,k),z=T.MathUtils.lerp(p.z,q.z,k);rod('steel',[x,baseY+row*.145,z],[x,baseY+row*.145+.55,z],.012);}
    }
  }
  group.userData.seatCount=seatCount;group.userData.tiers=tierData;
  // A ribbon board surrounds the bowl below the upper tier, avoiding pitch views.
  wall('ribbon',27.7,18.45,5.02,5.2);wall('darkSteel',27.7,18.45,4.91,5.02);
  // Open tension canopy: panel bays, radial trusses, inner/outer compression rings.
  const roofSegments=128,innerX=25.8,innerZ=17.2,outerX=32,outerZ=21.4;
  for(let i=0;i<roofSegments;i++){
    const a=i*Math.PI*2/roofSegments,b=(i+1)*Math.PI*2/roofSegments,pi=perimeter(a,innerX,innerZ),qi=perimeter(b,innerX,innerZ),po=perimeter(a,outerX,outerZ),qo=perimeter(b,outerX,outerZ),yi=9.38+.3*Math.abs(Math.cos(a)),yj=9.38+.3*Math.abs(Math.cos(b)),yo=10.38+.28*Math.abs(Math.cos(a)),yp=10.38+.28*Math.abs(Math.cos(b));
    quad(i%5===0?'roofGrey':'roof',[pi.x,yi,pi.z],[qi.x,yj,qi.z],[qo.x,yp,qo.z],[po.x,yo,po.z]);
    if(i%2===0){rod('steel',[pi.x,yi-.08,pi.z],[po.x,yo-.08,po.z],.047);rod('darkSteel',[pi.x,yi-.55,pi.z],[po.x,yo-.22,po.z],.027);const mx=(pi.x+po.x)/2,mz=(pi.z+po.z)/2;rod('steel',[pi.x,yi-.5,pi.z],[mx,(yi+yo)/2-.08,mz],.025);rod('steel',[mx,(yi+yo)/2-.08,mz],[po.x,yo-.25,po.z],.025);}
    rod('steel',[pi.x,yi,pi.z],[qi.x,yj,qi.z],.09);rod('steel',[po.x,yo,po.z],[qo.x,yp,qo.z],.095);
    if(i%4===0){const n=normal(po,outerX,outerZ),foot={x:po.x+n.x*.2,z:po.z+n.z*.2};rod('darkSteel',[foot.x,.2,foot.z],[po.x,yo,po.z],.13);rod('steel',[foot.x,.3,foot.z],[po.x-n.x*.7,6.8,po.z-n.z*.7],.07);box('concrete',.65,.25,.65,foot.x,.24,foot.z);}
    if(i%4===0){const n=normal(pi,innerX,innerZ),yaw=Math.atan2(n.x,n.z);for(let lamp=0;lamp<4;lamp++)box('floodlight',.18,.12,.13,pi.x+(lamp-1.5)*.22*n.z,yi-.29,pi.z-(lamp-1.5)*.22*n.x,[.35,yaw,0]);}
  }
  // Two legible long-span arches stand above the side roofs; tied rods reach inward.
  for(const side of[-1,1]){
    const arch=[];for(let k=0;k<=48;k++){const u=k/48,x=-29.8+59.6*u,y=10.6+4.1*Math.sin(Math.PI*u);arch.push([x,y,side*20.2]);if(k)rod('steel',arch[k-1],arch[k],.13);}
    for(let k=4;k<45;k+=4){const p=arch[k];rod('darkSteel',p,[p[0]*.92,9.5,side*17.5],.029);rod('steel',p,[p[0],10.4,side*21.05],.035);}
    for(const end of[-1,1]){
      const head=[end*29.8,10.6,side*20.2];
      rod('steel',[end*31.8,.35,side*20.2],head,.2);rod('darkSteel',[end*27.8,.35,side*20.2],head,.16);
      for(const x of[27.8,31.8])box('concrete',1.25,.4,1.25,end*x,.34,side*20.2);
    }
  }
  // Repeating facade portals reveal dark concourses between concrete piers.
  for(let i=0;i<48;i++){
    const p=perimeter((i+.5)*Math.PI*2/48,31,20.7),n=normal(p,31,20.7),yaw=Math.atan2(n.x,n.z);
    box('darkSteel',.16,6.65,.2,p.x,3.55,p.z,[0,yaw,0]);box('dark',1.15,1.9,.07,p.x+n.x*.06,1.28,p.z+n.z*.06,[0,yaw,0]);box('gold',.7,.16,.08,p.x+n.x*.12,2.36,p.z+n.z*.12,[0,yaw,0]);
    for(const h of[3.75,4.25])box('steel',1.55,.035,.09,p.x+n.x*.11,h,p.z+n.z*.11,[0,yaw,0]);
  }
  box('darkSteel',9.2,3.1,.5,0,12.1,-21.1);box('dark',8.6,2.6,.05,0,12.1,-20.82);
  const score=ctx.label('HOME   0 : 0   AWAY',7.9,1.3,0,12.12,-20.77,'#243d36','#f0e7cf',group);score.name='Cedar Field scoreboard';
  ctx.label('CEDAR FIELD',5.3,.55,0,13.24,-20.75,'#243d36','#e5c58d',group);
  // Main ticket plaza: generous forecourt, covered turnstiles and side pavilions.
  box('sand',64,.12,5.1,0,.15,24.35);for(let x=-31;x<32;x+=2.1)box('lightConcrete',.025,.01,5,x,.219,24.35);
  box('darkSteel',19.5,.22,3.2,0,3.15,22.8);for(const x of[-9,-5,5,9])cyl('steel',.09,3,x,1.65,23.8);
  for(let x=-8.4;x<8.6;x+=1.4){box('darkSteel',.28,.8,.48,x,.7,23.1);rod('steel',[x,.92,22.9],[x+.32,.92,22.9],.018);rod('steel',[x,.92,22.9],[x-.17,1.12,22.9],.018);}
  ctx.label('CEDAR FIELD  /  NORTHWEST FC',15.6,.85,0,2.79,24.43,'#31564a','#eee7d0',group);
  for(const side of[-1,1]){box('concrete',5.5,1.8,2.1,side*15.8,1.1,24);box('glass',4.8,.8,.04,side*15.8,1.25,25.07);box('darkSteel',5.8,.16,2.4,side*15.8,2.1,24);for(const x of[-1.65,0,1.65])box('steel',.06,1.2,.1,side*15.8+x,1.15,25.1);ctx.label(side<0?'TICKETS':'CLUB ENTRY',4.3,.45,side*15.8,1.92,25.18,'#31564a','#eee7d0',group);}
  // Autumn plaza trees use hundreds of separate folded leaf silhouettes.
  const leafShape=new T.Shape();leafShape.moveTo(0,-.45);leafShape.lineTo(-.32,-.2);leafShape.lineTo(-.2,.02);leafShape.lineTo(-.42,.19);leafShape.lineTo(-.12,.25);leafShape.lineTo(0,.5);leafShape.lineTo(.13,.24);leafShape.lineTo(.4,.16);leafShape.lineTo(.2,0);leafShape.lineTo(.3,-.2);leafShape.closePath();
  geometries.leaf=new T.ShapeGeometry(leafShape);for(const key of['leafGold','leafRust','leafRed'])mats[key]=mats[key].clone(),mats[key].side=T.DoubleSide;
  let seed=2456;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  for(const x of[-28,-23,23,28]){
    const z=24.6;box('darkConcrete',1.8,.45,1.5,x,.42,z);box('soil',1.65,.035,1.35,x,.66,z);cyl('bark',.085,2.6,x,1.95,z);
    for(let j=0;j<7;j++){const a=j*Math.PI*2/7;rod('bark',[x,2,z],[x+Math.cos(a)*.9,3.2+rand()*.6,z+Math.sin(a)*.8],.031);}
    for(let j=0;j<480;j++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*1.22,yy=3.3+(rand()-.5)*1.5;add('leaf',['leafGold','leafRust','leafRed'][Math.floor(rand()*3)],.16+rand()*.07,.19+rand()*.08,1,x+Math.cos(a)*r,yy,z+Math.sin(a)*r,[rand()*Math.PI,rand()*Math.PI,rand()*Math.PI]);}
    box('darkSteel',1.6,.1,.45,x,.85,z-1.2);for(const dx of[-.6,.6])box('darkSteel',.06,.55,.3,x+dx,.58,z-1.2);
  }
  // A small surface lot, using authored Kenney geometry for every body/cabin/wheel.
  box('asphalt',57,.08,3.3,0,.13,-23.25);box('concrete',57,.12,.18,0,.19,-21.55);
  const vehicleLibrary=createVehicleLibrary(T),parkedCars=[],carBatches=new Map(),carMats={};
  ['#b8c7c3','#334d57','#ad6e4b','#d3d1bf','#355e52'].forEach((color,i)=>carMats['paint'+i]=new T.MeshPhysicalMaterial({color,roughness:.26,metalness:.5,clearcoat:.6}));
  carMats.glass=new T.MeshStandardMaterial({color:'#2c454b',roughness:.18,metalness:.45});carMats.assetDetails=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.5,metalness:.25});
  for(const [key,color]of[['headlight','#fff3cf'],['taillight','#bc4637'],['indicator','#e2a757']])carMats[key]=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.08});
  const vehicleMatrix=new T.Object3D(),partMatrix=new T.Object3D(),composed=new T.Matrix4();
  for(let j=0;j<16;j++){
    const x=-26+j*3.45,z=-22.95;box('line',.035,.012,1.65,x+1.4,.185,z);
    if(j===3||j===11)continue;const car={...vehicleLibrary.vehicle(['sedan','hatchback-sports','suv-luxury','truck'][j%4],'paint'+j%5),x,z,y:.18,yaw:Math.PI/2,scale:.88};parkedCars.push(car);
    vehicleMatrix.position.set(x,car.y,z);vehicleMatrix.rotation.set(0,car.yaw,0);vehicleMatrix.scale.setScalar(car.scale);vehicleMatrix.updateMatrix();
    for(const p of car.parts){if(p.material==='indicator')continue;const key=p.geo.uuid+':'+p.material;if(!carBatches.has(key))carBatches.set(key,{geo:p.geo,material:carMats[p.material],matrices:[]});partMatrix.position.fromArray(p.position);partMatrix.rotation.set(...p.rotation);partMatrix.scale.fromArray(p.scale);partMatrix.updateMatrix();composed.multiplyMatrices(vehicleMatrix.matrix,partMatrix.matrix);carBatches.get(key).matrices.push(composed.clone());}
  }
  group.userData.parkedVehicleAssets=parkedCars.map(c=>c.model);
  for(const x of[-22,0,22]){cyl('darkSteel',.04,3,x,1.7,-24.5);box('floodlight',.5,.08,.27,x,3.22,-24.5);}
  // Consolidate fixed detail: the entire venue has a small number of material batches.
  for(const [name,b]of batches){const mesh=new T.InstancedMesh(b.geo,b.mat,b.parts.length);mesh.name='Stadium '+name;b.parts.forEach((p,i)=>{o.position.set(p.x,p.y,p.z);o.scale.set(p.w,p.h,p.d);o.rotation.set(...p.rotation);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.castShadow=!['leafGold','leafRust','leafRed','line'].some(k=>name.endsWith(':'+k));mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);}
  for(const [mat,positions]of surfaceBatches){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.computeVertexNormals();const material=mats[mat].clone();material.side=T.DoubleSide;if(mat==='ribbon'){ribbonMaterials.push(material);ctx.glowMaterials.push(material);}const mesh=new T.Mesh(geo,material);mesh.name='Stadium continuous '+mat;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
  for(const b of carBatches.values()){const mesh=new T.InstancedMesh(b.geo,b.material,b.matrices.length);mesh.name='Stadium authored Kenney parked vehicles';b.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);}
  let enabled=false,night=false;
  function setEnabled(value){enabled=Boolean(value);group.visible=enabled;}
  function setNight(value){night=Boolean(value);pitchLight.intensity=night?310:0;mats.floodlight.emissiveIntensity=night?3:.12;ribbonMaterials.forEach(m=>m.emissiveIntensity=night?1.3:.12);carMats.headlight.emissiveIntensity=night?1.4:.08;carMats.taillight.emissiveIntensity=night?.5:.08;}
  function update(){/* The unoccupied stadium has no ambient motion to distract from traffic. */}
  return{group,setEnabled,setNight,update,bounds:STADIUM_BOUNDS,pitch:STADIUM_PITCH,parkedCars,get enabled(){return enabled;},get night(){return night;}};
}
