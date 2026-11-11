import {layoutKit} from './interior-layout.js?v=b477ce33502c';

/** Precision objects for the electronics and prototype-making stations. */
export function buildMakerCrafted(ctx,parent){
  const T=ctx.THREE,k=layoutKit(ctx,parent,'Crafted maker electronics and machined prototypes','projects');
  const {box,soft,cyl,rod,round}=k,customBatches=new Map();
  const stats={populatedCircuitBoards:0,boardComponents:0,instruments:0,coiledCables:0,machinedGears:0,calipers:0,safetyGoggles:0,finishedPrintSamples:0,engineeringPosters:0};
  const mat={steel:k.mat('#a4b0ad','metal'),dark:k.mat('#283e3d','metal'),rubber:k.mat('#283632','rubber'),wood:k.mat('#a9845d','wood'),cream:k.mat('#e2e0d1','ceramic'),blue:k.mat('#477b87','lacquer'),copper:k.mat('#bb9253','metal'),orange:k.mat('#c78344','rubber'),paper:k.mat('#e5e3d7','paper')};
  function custom(geo,m,x,y,z,s=[1,1,1],r=[0,0,0]){
    const key=geo.uuid+':'+m.uuid;if(!customBatches.has(key))customBatches.set(key,{geo,m,parts:[]});
    customBatches.get(key).parts.push({p:k.project(x,y,z),s,r});
  }
  const torus=new T.TorusGeometry(1,.12,12,40),unitCyl=new T.CylinderGeometry(1,1,1,32),boltGeo=new T.CylinderGeometry(1,1,1,6);
  function ring(x,y,z,r,m=mat.steel,rotation=[Math.PI/2,0,0],tubeScale=1){custom(torus,m,x,y,z,[r,r,r*tubeScale],rotation);}
  function bolt(x,y,z,r=.024){custom(boltGeo,mat.steel,x,y,z,[r,.018,r]);box(r*.95,.004,.003,mat.dark,x,y+.011,z);}
  function tube(points,r,m,x,y,z,segments=40){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));custom(new T.TubeGeometry(curve,segments,r,10,false),m,x,y,z);}
  const pcbPixels=new Uint8Array(128*128*4);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){const p=(y*128+x)*4,n=(x*13+y*7)%9;pcbPixels.set([26+n,76+n,55+n,255],p);}
  function pixel(x,y,color){if(x>=0&&x<128&&y>=0&&y<128)pcbPixels.set([...color,255],(Math.floor(y)*128+Math.floor(x))*4);}
  function trace(x1,y1,x2,y2){for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let d=-1;d<=1;d++)pixel(x,y1+d,[168,160,88]);for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let d=-1;d<=1;d++)pixel(x2+d,y,[168,160,88]);for(let a=0;a<18;a++)pixel(x2+Math.cos(a/18*Math.PI*2)*3,y2+Math.sin(a/18*Math.PI*2)*3,[215,203,129]);}
  for(let i=0;i<13;i++)trace(8+i*8,12+(i%4)*24,18+i*7,110-(i%3)*21);
  const pcbTexture=new T.DataTexture(pcbPixels,128,128,T.RGBAFormat);pcbTexture.colorSpace=T.SRGBColorSpace;pcbTexture.needsUpdate=true;
  const boardMat=k.mat('#ffffff','circuit').clone();boardMat.map=pcbTexture;boardMat.roughness=.62;boardMat.metalness=.05;
  const screen=k.mat('#163b40').clone();screen.emissive=new T.Color('#2b7775');screen.emissiveIntensity=.32;ctx.glowMaterials?.push(screen);
  const waveform=k.mat('#b0d993').clone();waveform.emissive=new T.Color('#82c967');waveform.emissiveIntensity=.45;ctx.glowMaterials?.push(waveform);
  const glass=k.mat('#9abbbb','glass').clone();glass.transparent=true;glass.opacity=.25;glass.roughness=.14;glass.depthWrite=false;

  // A dedicated front-facing station leaves the robot's safety cell untouched.
  const x=-10.72,y=3.72,z=11.2;k.setZone(x,y,z);
  soft(1.5,.09,.88,mat.wood,x,y+.91,z);
  for(const dx of[-.64,.64])for(const dz of[-.34,.34]){cyl(.026,.77,mat.dark,x+dx,y+.48,z+dz);bolt(x+dx,y+.965,z+dz,.017);}
  box(1.28,.045,.67,mat.steel,x,y+.37,z);box(1.42,.028,.8,k.mat('#54756b','rubber'),x,y+.969,z);
  const sx=x-.36,sy=y+1.19,sz=z-.21;
  soft(.55,.38,.33,mat.cream,sx,sy,sz);soft(.49,.32,.022,mat.dark,sx,sy,sz+.176);
  box(.33,.24,.013,screen,sx-.055,sy+.006,sz+.193);
  for(let i=0;i<7;i++)box(.0015,.221,.005,k.mat('#376b65'),sx-.205+i*.05,sy+.006,sz+.203);
  for(let i=0;i<5;i++)box(.31,.0015,.005,k.mat('#376b65'),sx-.055,sy-.09+i*.048,sz+.203);
  const wave=[];for(let i=0;i<=48;i++){const xx=i/48*.31-.21;wave.push([xx,Math.sin(i/48*Math.PI*5)*.065+.006,.212]);}
  tube(wave,.0045,waveform,sx,sy,sz,64);
  for(const yy of[-.092,.015,.1]){custom(unitCyl,mat.steel,sx+.18,sy+yy,sz+.199,[.026,.025,.026],[Math.PI/2,0,0]);box(.01,.003,.004,mat.dark,sx+.18,sy+yy+.014,sz+.216);}
  for(let i=0;i<3;i++)custom(unitCyl,i===0?mat.orange:mat.steel,sx-.15+i*.095,sy-.13,sz+.208,[.015,.025,.015],[Math.PI/2,0,0]);
  for(const dx of[-.2,.2])cyl(.025,.045,mat.rubber,sx+dx,y+.994,sz+.05);
  k.label?.('OSCILLOSCOPE',.35,.045,sx-.03,sy+.153,sz+.207,'#e2e0d1','#304c46');stats.instruments++;

  // Copper traces are a real texture; raised chips, solder pins and passive
  // components give the populated board a convincing physical silhouette.
  const bx=x-.31,bz=z+.23,by=y+1.005;
  box(.55,.025,.31,boardMat,bx,by,bz);
  for(const dx of[-.245,.245])for(const dz of[-.13,.13]){cyl(.012,.018,mat.copper,bx+dx,by+.017,bz+dz);cyl(.006,.021,mat.dark,bx+dx,by+.019,bz+dz);}
  soft(.15,.035,.15,mat.dark,bx-.025,by+.03,bz);stats.boardComponents++;
  for(let i=0;i<8;i++)for(const s of[-1,1])box(.013,.008,.025,mat.steel,bx-.092+i*.019,by+.02,bz+s*.092);
  for(const dx of[-.17,.17]){cyl(.025,.075,mat.blue,bx+dx,by+.05,bz-.07);cyl(.024,.008,mat.steel,bx+dx,by+.092,bz-.07);stats.boardComponents++;}
  for(let i=0;i<5;i++){const xx=bx-.19+i*.08;custom(unitCyl,mat.cream,xx,by+.028,bz+.11,[.016,.056,.016],[0,0,Math.PI/2]);for(const dx of[-.022,.022])box(.004,.025,.031,i%2?mat.orange:mat.blue,xx+dx,by+.026,bz+.11);stats.boardComponents++;}
  for(let i=0;i<6;i++){box(.018,.06,.018,mat.copper,bx-.2+i*.045,by+.045,bz-.13);stats.boardComponents++;}
  stats.populatedCircuitBoards++;

  // The soldering iron rests in a helical metal cradle, with its silicone
  // lead coiled on the mat and a separate brass cleaning cup beside it.
  const ix=x+.35,iz=z+.02;
  soft(.35,.045,.32,mat.dark,ix,y+1.015,iz);
  const spring=[];for(let i=0;i<=120;i++){const a=i/120*Math.PI*14;spring.push([Math.cos(a)*.055,.08+i/120*.21,Math.sin(a)*.055]);}
  tube(spring,.008,mat.steel,ix-.04,y+1.03,iz,120);stats.coiledCables++;
  custom(unitCyl,mat.blue,ix-.04,y+1.3,iz,[.039,.18,.039]);cyl(.016,.1,mat.steel,ix-.04,y+1.17,iz);custom(new T.ConeGeometry(.016,.065,24),mat.copper,ix-.04,y+1.095,iz,[1,1,1],[Math.PI,0,0]);
  cyl(.072,.055,mat.copper,ix+.09,y+1.065,iz+.07);round(.115,.04,.115,mat.copper,ix+.09,y+1.095,iz+.07);
  const lead=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*6,r=.045+.035*i/96;lead.push([Math.cos(a)*r,.003,Math.sin(a)*r]);}
  tube(lead,.009,mat.rubber,x+.05,y+1.004,z-.21,96);stats.coiledCables++;
  tube([[0,0,0],[.05,-.13,.01],[.17,-.27,.07],[.23,-.23,.13],[.16,-.06,.18]],.009,mat.rubber,ix-.04,y+1.38,iz,36);
  const spoolX=x+.47,spoolZ=z-.27;
  cyl(.078,.09,mat.copper,spoolX,y+1.05,spoolZ);for(const yy of[1,1.1])cyl(.095,.016,mat.cream,spoolX,y+yy,spoolZ);cyl(.025,.13,mat.dark,spoolX,y+1.05,spoolZ);
  tube([[0,0,0],[-.12,0,.02],[-.21,.005,.06]],.004,mat.steel,spoolX,y+1.11,spoolZ,16);

  // Transparent curved goggles have distinct lenses, a bridge and soft arms.
  const gx=x+.44,gz=z+.31,gy=y+1.005;
  for(const s of[-1,1]){
    const lens=new T.SphereGeometry(1,24,16,0,Math.PI*2,Math.PI*.34,Math.PI*.32);
    custom(lens,glass,gx+s*.067,gy+.036,gz,[.065,.04,.045],[Math.PI/2,0,0]);
    custom(torus,mat.rubber,gx+s*.067,gy+.037,gz,[.068,.043,.045],[Math.PI/2,0,0]);
    tube([[s*.13,0,0],[s*.16,0,-.045],[s*.15,0,-.11]],.009,mat.rubber,gx,gy+.034,gz,16);
  }
  rod([gx-.025,gy+.035,gz],[gx+.025,gy+.035,gz],.01,mat.rubber);stats.safetyGoggles++;

  // Precision inspection uses the existing left bench, away from robot travel.
  k.setZone(-13.65,y,8.15);
  const gearShape=new T.Shape();for(let i=0;i<96;i++){const a=i/96*Math.PI*2,r=i%8<4?1:.83,xx=Math.cos(a)*r,yy=Math.sin(a)*r;if(i===0)gearShape.moveTo(xx,yy);else gearShape.lineTo(xx,yy);}gearShape.closePath();
  const hole=new T.Path();hole.absarc(0,0,.31,0,Math.PI*2,true);gearShape.holes.push(hole);
  const gearGeo=new T.ExtrudeGeometry(gearShape,{depth:1,bevelEnabled:true,bevelSize:.03,bevelThickness:.06,bevelSegments:2,curveSegments:24,steps:1});gearGeo.translate(0,0,-.5);gearGeo.rotateX(Math.PI/2);
  for(const [dx,dz,r]of[[-.13,-.19,.12],[.12,-.1,.085]]){custom(gearGeo,mat.steel,-13.65+dx,y+.925,8.15+dz,[r,.045,r]);stats.machinedGears++;}
  const cx=-13.65,cz=8.47,cy=y+.91;
  box(.45,.014,.052,mat.steel,cx,cy,cz);box(.05,.035,.09,mat.dark,cx-.02,cy+.02,cz);box(.034,.018,.13,mat.steel,cx-.2,cy,cz+.045);box(.034,.025,.15,mat.steel,cx-.025,cy+.013,cz+.055);
  for(let i=0;i<16;i++)box(.002,.003,i%5===0?.025:.012,mat.dark,cx-.2+i*.027,cy+.009,cz-.012);
  box(.045,.025,.07,mat.steel,cx-.2,cy,cz-.05);box(.045,.025,.08,mat.steel,cx-.025,cy+.013,cz-.055);stats.calipers++;
  for(let i=0;i<3;i++){cyl(.015,.055,mat.steel,-13.65+(i-1)*.07,y+.925,8.1);bolt(-13.65+(i-1)*.07,y+.958,8.1,.027);}

  // Finished print beside the CAD screen: a smooth hollow twelve-rib sample.
  const profile=[[0,0],[.61,0],[.71,.04],[.86,.18],[1,.43],[.83,.69],[.54,.94],[.55,1],[.45,1],[.44,.94],[.72,.69],[.89,.43],[.74,.18],[.6,.1],[0,.1]].map(p=>new T.Vector2(...p));
  const vase=new T.LatheGeometry(profile,64),pos=vase.attributes.position;
  for(let i=0;i<pos.count;i++){const a=Math.atan2(pos.getZ(i),pos.getX(i)),h=pos.getY(i),factor=1+.055*Math.cos(a*12+h*4);pos.setX(i,pos.getX(i)*factor);pos.setZ(i,pos.getZ(i)*factor);}vase.computeVertexNormals();
  k.setZone(-11.1,y,7.27);custom(vase,k.mat('#d6b68d','ceramic'),-11.78,y+.89,7.3,[.13,.34,.13]);stats.finishedPrintSamples++;

  // Engineering artwork sits above the rear pegboard rather than floating
  // over tools or occupying the fabrication machines' working envelopes.
  k.setZone(-12,0,6.82);
  box(1.72,.68,.025,mat.steel,-12,2.97,6.82);box(1.65,.61,.012,mat.paper,-12,2.97,6.84);
  k.label?.('DESIGN · BUILD · TEST',1.32,.1,-12,3.17,6.855,'#e5e3d7','#31534b');
  for(let i=0;i<3;i++){const xx=-12.54+i*.52;ring(xx,2.93,6.86,.11,mat.blue,[0,0,0]);cyl(.022,.012,mat.dark,xx,2.93,6.87,[Math.PI/2,0,0]);if(i<2)rod([xx+.15,2.93,6.87],[xx+.36,2.93,6.87],.008,mat.copper);}
  k.label?.('Prototype / measure / refine',1.3,.075,-12,2.76,6.855,'#e5e3d7','#31534b');stats.engineeringPosters++;
  k.setZone(-10.64,0,6.82);box(.58,.55,.035,mat.paper,-10.64,2.96,6.83);k.label?.('EYE PROTECTION',.5,.08,-10.64,3.13,6.86,'#e5e3d7','#304c46');
  for(const s of[-1,1])ring(-10.64+s*.11,2.95,6.865,.078,mat.blue,[0,0,0]);rod([-10.68,2.95,6.87],[-10.6,2.95,6.87],.009,mat.blue);stats.engineeringPosters++;

  k.finish();const dummy=new T.Object3D();let customInstances=0;
  for(const {geo,m,parts}of customBatches.values()){
    const mesh=new T.InstancedMesh(geo,m,parts.length);mesh.name='Precision maker objects';mesh.castShadow=!m.transparent;mesh.receiveShadow=true;
    parts.forEach((p,i)=>{dummy.position.set(...p.p);dummy.scale.set(...p.s);dummy.rotation.set(...p.r);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();k.group.add(mesh);customInstances+=parts.length;
  }
  stats.customInstances=customInstances;stats.customBatches=customBatches.size;stats.drawBatches=k.group.children.filter(o=>o.isMesh).length;k.group.userData.craftedDetails={...stats};
  return{group:k.group,stats};
}
