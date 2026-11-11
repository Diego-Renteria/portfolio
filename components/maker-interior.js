import {layoutKit} from './interior-layout.js?v=b477ce33502c';
import {buildMakerCrafted} from './maker-crafted.js?v=b477ce33502c';

/** Fabrication studio: additive printer motion follows the active layer perimeter. */
export function buildMakerInterior(ctx,parent){
  const {THREE:T,material}=ctx,kit=layoutKit(ctx,parent,'Maker studio furnishings','projects');
  const {group,box:b,cyl:c,rod,round,chair,finish,geos}=kit;
  const ink='#303b3e',steel=material('#96a5a5','metal'),wood=material('#ba9166','wood'),white='#dfdfd5',blue='#4a7983',orange='#d38342',green='#719778';
  const glow=new T.MeshStandardMaterial({color:'#b9ded4',emissive:'#80cfc0',emissiveIntensity:.3,roughness:.5});ctx.glowMaterials.push(glow);
  const glass=new T.MeshStandardMaterial({color:'#a9c9cc',transparent:true,opacity:.12,roughness:.17,metalness:.1,depthWrite:false});
  const mesh=(geo,mat,p,scale,container=group)=>{const m=new T.Mesh(geo,typeof mat==='string'?material(mat):mat);m.position.set(...(container===group?kit.project(...p):p));m.scale.set(...scale);m.castShadow=!m.material.transparent;m.receiveShadow=true;container.add(m);return m;};
  function bench(x,y,z,w,d=.65){b(w,.1,d,wood,x,y,z);for(const dx of[-w/2+.09,w/2-.09])for(const dz of[-d/2+.07,d/2-.07])b(.055,.74,.055,ink,x+dx,y-.42,z+dz);b(w-.16,.05,d-.14,steel,x,y-.6,z);}
  function cabinet(x,y,z,w=.7){b(w,.72,.48,blue,x,y+.36,z);b(w+.04,.055,.52,steel,x,y+.75,z);for(let yy=y+.14;yy<y+.7;yy+=.17){b(w-.045,.025,.025,ink,x,yy,z+.253);b(w*.36,.025,.035,steel,x,yy+.07,z+.272);}}
  function vise(x,y,z){b(.27,.06,.26,steel,x,y,z);b(.13,.14,.2,blue,x-.06,y+.09,z);b(.08,.14,.2,steel,x+.1,y+.09,z);rod([x-.22,y+.07,z],[x+.24,y+.07,z],.018,steel);rod([x+.24,y-.04,z],[x+.24,y+.18,z],.014,ink);}
  function pegboard(x,y,z,w){b(w,1.05,.045,'#a48d68',x,y,z);for(const side of[-1,1])b(.04,1.64,.04,ink,x+side*(w/2-.05),y-.81,z-.04);for(let xx=x-w/2+.08;xx<x+w/2;xx+=.14)for(let yy=y-.45;yy<y+.5;yy+=.14)round(.018,.018,.012,ink,xx,yy,z+.027);for(let q=0;q<5;q++){const xx=x-w*.36+q*w*.18;rod([xx,y-.3,z+.07],[xx,y+.15,z+.07],.018,steel);b(.1,.15,.035,q%2?orange:ink,xx,y-.26,z+.07);round(.11,.12,.025,steel,xx,y+.19,z+.07);round(.055,.065,.03,ink,xx,y+.19,z+.09);}}
  b(4.4,.1,5.6,'#aab3ab',-12,.25,9.5);b(4.4,.06,5.6,'#adb7ad',-12,3.705,9.5);
  // Ground-floor perimeter workstations and storage leave an open central aisle.
  kit.setZone(-12.3,.29,7.22);
  bench(-12.3,1.12,7.22,2.8,.68);pegboard(-12.3,1.96,6.94,2.65);
  cabinet(-13.2,.29,7.25,.65);cabinet(-12.4,.29,7.25,.65);vise(-11.35,1.2,7.3);
  for(let i=0;i<5;i++){b(.26,.13,.23,[blue,orange,green][i%3],-13.2+i*.38,1.23,7.18);b(.2,.035,.025,white,-13.2+i*.38,1.26,7.31);}
  // Drill press has a real column, spindle, motor, chuck and slotted table.
  kit.setZone(-13.76,.29,9.05);
  b(.6,.09,.5,ink,-13.76,.34,9.05);c(.045,1.38,steel,-13.76,1.06,8.91);
  b(.5,.09,.4,blue,-13.76,1.1,9.08);for(let xx=-13.95;xx<-13.5;xx+=.15)b(.045,.014,.24,ink,xx,1.152,9.1);
  b(.34,.2,.53,blue,-13.76,1.77,9.08);c(.11,.28,ink,-13.76,1.9,8.88);c(.028,.25,steel,-13.76,1.55,9.23);c(.04,.1,ink,-13.76,1.4,9.23);c(.013,.2,steel,-13.76,1.25,9.23);
  for(let i=0;i<3;i++){const a=i*2.094;rod([-13.57,1.7,9.07],[-13.57,1.7+Math.sin(a)*.23,9.07+Math.cos(a)*.23],.012,steel);round(.065,.065,.065,orange,-13.57,1.7+Math.sin(a)*.23,9.07+Math.cos(a)*.23);}
  kit.setZone(-13.25,.29,10.4);
  bench(-13.25,1.14,10.4,1.6,.85);b(1.23,.36,.7,blue,-13.25,1.37,10.4);b(1.13,.035,.59,ink,-13.25,1.57,10.4);mesh(geos.box,glass,[-13.25,1.59,10.4],[1.1,.045,.55]);
  for(let xx=-13.73;xx<-12.7;xx+=.12)b(.025,.025,.49,steel,xx,1.59,10.4);b(.16,.07,.18,orange,-13.3,1.66,10.35);b(.18,.04,.12,glow,-12.8,1.58,10.76);
  // Dust collection and electrical conduits hug walls instead of crossing the room.
  kit.clearZone();
  rod([-13.97,2.96,7.1],[-13.97,2.96,11.7],.065,steel);rod([-13.97,2.96,9.05],[-13.97,1.7,9.05],.042,steel);rod([-13.97,2.96,10.4],[-13.8,1.7,10.4],.042,steel);
  b(.26,.48,.1,ink,-13.98,1.6,8.08);rod([-13.98,.4,8.08],[-13.98,3.15,8.08],.015,steel);b(.11,.07,.03,orange,-13.98,1.62,8.15);
  // The enclosed printer sits at the front window where its mechanics are visible.
  const px=-10.85,pz=11.63,bedY=1.43;
  kit.setZone(px,0,pz);const printerProject=kit.zoneProject();
  bench(px,1.08,pz,1.5,1.3);b(1.26,.16,1.16,ink,px,1.23,pz);b(1.27,.13,1.17,white,px,2.92,pz);
  for(const dx of[-.59,.59])for(const dz of[-.53,.53])b(.075,1.61,.075,white,px+dx,2.09,pz+dz);
  b(1.18,.055,1.04,steel,px,bedY-.05,pz);b(.96,.025,.87,ink,px,bedY,pz);
  for(const dx of[-.46,.46])c(.025,1.42,steel,px+dx,2.13,pz-.38);
  for(const side of[-1,1])mesh(geos.box,glass,[px+side*.56,2.12,pz],[.018,1.4,1.02]);
  mesh(geos.box,glass,[px,2.12,pz+.557],[1.06,1.39,.018]);b(.05,.31,.06,ink,px+.44,2.15,pz+.6);
  b(.36,.15,.065,blue,px+.26,1.26,pz+.61);b(.25,.08,.012,ink,px+.26,1.29,pz+.65);
  const progressBar=mesh(geos.box,glow,[px+.15,1.29,pz+.66],[.01,.045,.012]);progressBar.name='Printer progress indicator';
  for(let i=0;i<4;i++)b(.035,.035,.025,i===0?orange:green,px-.36+i*.07,1.26,pz+.613);
  b(.065,.29,.34,ink,px-.665,1.55,pz-.04);b(.012,.2,.23,glow,px-.705,1.56,pz-.04);
  const gantry=new T.Group();gantry.name='Printer rising Z gantry';group.add(gantry);
  mesh(geos.box,steel,[0,0,0],[1.02,.05,.06],gantry);mesh(geos.box,ink,[0,0,-.07],[1.02,.028,.025],gantry);
  const head=new T.Group();head.name='Printer X Y carriage and hot end';group.add(head);
  mesh(geos.box,white,[0,.12,0],[.22,.22,.2],head);mesh(geos.box,ink,[0,.015,0],[.18,.06,.17],head);mesh(geos.cone,orange,[0,-.04,0],[.045,.07,.045],head).rotation.z=Math.PI;
  mesh(geos.box,blue,[.125,.11,0],[.055,.15,.16],head);mesh(geos.cyl,ink,[.16,.11,0],[.05,.025,.05],head).rotation.z=Math.PI/2;
  const spool=new T.Group();spool.name='Printer filament spool';spool.position.set(...printerProject(px+.81,2.65,pz-.35));spool.rotation.z=Math.PI/2;group.add(spool);
  mesh(geos.cyl,orange,[0,0,0],[.22,.15,.22],spool);for(const dy of[-.09,.09])mesh(geos.cyl,ink,[0,dy,0],[.27,.035,.27],spool);mesh(geos.cyl,white,[0,0,0],[.065,.21,.065],spool);
  rod([px+.57,2.65,pz-.35],[px+.85,2.65,pz-.35],.035,ink);
  const tubePoints=new Float32Array(22*3),tubeGeo=new T.BufferGeometry();tubeGeo.setAttribute('position',new T.BufferAttribute(tubePoints,3));const tube=new T.Line(tubeGeo,new T.LineBasicMaterial({color:ink}));tube.name='Flexible filament guide';tube.frustumCulled=false;group.add(tube);
  // A hollow eight-fluted helical vase, deposited as actual thin annular layers.
  const layerCount=56,layerHeight=.0145,segments=64,vertices=[],indices=[];
  for(let ring=0;ring<4;ring++)for(let i=0;i<=segments;i++){
    const angle=i/segments*Math.PI*2,r=(1+.13*Math.cos(angle*8))*(ring<2?1:.89),y=ring%2? .5:-.5;
    vertices.push(Math.cos(angle)*r,y,Math.sin(angle)*r);
  }
  for(let i=0;i<segments;i++)for(const [a,b]of[[0,1],[2,3],[1,3],[2,0]]){
    const j=a*(segments+1)+i,k=b*(segments+1)+i;indices.push(j,j+1,k,j+1,k+1,k);
  }
  const vaseLayer=new T.BufferGeometry();vaseLayer.setAttribute('position',new T.Float32BufferAttribute(vertices,3));vaseLayer.setIndex(indices);vaseLayer.computeVertexNormals();
  const polymer=material('#d68045','ceramic').clone();polymer.roughness=.43;polymer.metalness=0;polymer.side=T.DoubleSide;
  const printed=new T.InstancedMesh(vaseLayer,polymer,layerCount),matrix=new T.Object3D();
  printed.name='Printed helical vase deposited layers';printed.castShadow=true;printed.receiveShadow=true;printed.userData={object:'hollow eight-fluted helical vase',layerCount,flutes:8,hollow:true};
  const profile=t=>.24+.055*Math.sin(t*Math.PI*1.5)-.045*t;
  for(let layer=0;layer<layerCount;layer++){
    const radius=profile(layer/(layerCount-1));matrix.position.set(...printerProject(px,bedY+.025+layer*layerHeight,pz));matrix.scale.set(radius,layerHeight*.95,radius);matrix.rotation.y=layer*.032;matrix.updateMatrix();printed.setMatrixAt(layer,matrix.matrix);
  }
  // Bounds cover the finished vessel even while only its first layer is visible.
  printed.computeBoundingSphere();printed.count=1;group.add(printed);
  // Upstairs: CAD, electronics, parts storage and a real articulated pick/place cell.
  const fy=3.72;kit.setZone(-11.1,fy,7.27);bench(-11.1,fy+.82,7.27,1.8,.75);cabinet(-11.6,fy+.02,7.2,.6);
  b(.73,.46,.06,ink,-11.15,fy+1.2,7.31);b(.65,.38,.015,'#24434c',-11.15,fy+1.2,7.349);b(.08,.24,.08,steel,-11.15,fy+.9,7.31);b(.39,.03,.25,ink,-11.15,fy+.8,7.34);b(.48,.025,.18,white,-11.15,fy+.88,7.57);
  for(let i=0;i<5;i++)b(.57,.007,.005,'#547a7a',-11.15,fy+1.05+i*.07,7.36);for(let i=0;i<6;i++)b(.006,.32,.005,'#547a7a',-11.42+i*.1,fy+1.2,7.36);
  for(let i=0;i<4;i++)rod([-11.3+i*.08,fy+1.1,7.38],[-11.3+i*.08,fy+1.3,7.38],.005,'#acd6c8');chair(-11.1,fy,8.05,blue,Math.PI);
  kit.setZone(-11.48,fy,8.75);bench(-11.48,fy+.8,8.75,1.1,.58);
  b(.055,.48,.67,ink,-11.20,fy+1.1,8.75);b(.015,.4,.57,'#5c8d92',-11.235,fy+1.1,8.75);b(.1,.19,.1,steel,-11.20,fy+.81,8.75);
  b(.2,.025,.43,ink,-11.59,fy+.86,8.75);
  // Suspended linear task lights establish the workshop ceiling without
  // filling the robot's operating envelope with decoration.
  kit.clearZone();
  const taskLight=material('#e8e4cf').clone();taskLight.emissive=new T.Color('#e9ddb5');taskLight.emissiveIntensity=.4;ctx.glowMaterials.push(taskLight);
  for(const z of[8.45,11.05])for(const x of[-13.08,-10.87]){
    for(const dx of[-.48,.48])rod([x+dx,7.12,z],[x+dx,6.69,z],.012,steel);
    b(1.25,.095,.2,ink,x,6.66,z);b(1.13,.035,.16,taskLight,x,6.598,z);
  }
  // A rear engineering board shows a joint schematic and a test matrix.
  // Its graphics are clearly separated from the surface to avoid z fighting.
  kit.setZone(-11.4,fy,6.82);
  b(1.87,1.13,.07,steel,-11.4,5.99,6.82);b(1.76,1.02,.022,'#dae2d7',-11.4,5.99,6.868);
  const diagram=[[-12.03,5.7],[-11.9,5.98],[-11.68,6.18],[-11.44,6.05]];
  for(let i=0;i<diagram.length-1;i++)rod([diagram[i][0],diagram[i][1],6.887],[diagram[i+1][0],diagram[i+1][1],6.887],.014,blue);
  for(const[x,y]of diagram)c(.046,.012,blue,x,y,6.897,[Math.PI/2,0,0]);
  b(.39,.025,.015,ink,-11.98,5.64,6.889);
  for(let row=0;row<4;row++)for(let col=0;col<3;col++){
    b(.16,.1,.012,(row+col)%3===0?'#9aaa80':'#b6c2bb',-11.14+col*.2,5.72+row*.17,6.89);
  }
  // Closed component drawers and labeled prototype bins keep the back edge
  // functional, while the large window-facing floor area remains accessible.
  kit.setZone(-10.26,fy,7.12);cabinet(-10.32,fy+.03,7.2,.6);
  for(let row=0;row<2;row++){
    b(.63,.05,.5,steel,-10.26,5.64+row*.46,7.12);
    for(let col=0;col<2;col++){
      b(.24,.24,.32,[orange,green,blue,white][row*2+col],-10.42+col*.3,5.79+row*.46,7.14);
      b(.14,.06,.015,white,-10.42+col*.3,5.8+row*.46,7.309);
    }
  }
  kit.setZone(-13.67,fy,8.28);bench(-13.65,fy+.85,8.28,.7,1.8);pegboard(-13.76,fy+1.6,7.13,.7);
  for(let shelf=0;shelf<3;shelf++){b(.52,.05,1.3,steel,-13.67,fy+.6+shelf*.4,9);for(let n=0;n<4;n++){b(.35,.23,.24,[blue,orange,green,white][n],-13.67,fy+.76+shelf*.4,8.53+n*.3);b(.02,.065,.12,white,-13.48,fy+.78+shelf*.4,8.53+n*.3);}}
  kit.setZone(-13.2,fy,11.35);const robotProject=kit.zoneProject();
  b(2.04,.1,2.1,steel,-13.2,4.78,11.35);for(const dx of[-.92,.92])for(const dz of[-.93,.93])b(.08,1,.08,ink,-13.2+dx,4.23,11.35+dz);
  for(const dx of[-1.04,1.04])b(.035,.02,2.18,orange,-13.2+dx,4.848,11.35);for(const dz of[-1.08,1.08])b(2.1,.02,.035,orange,-13.2,4.848,11.35+dz);
  // Front-left placement keeps the arm clear of the central facade mullion.
  const baseX=-13.43,baseY=4.84,baseZ=11.5,robotScale=1.1,robotPaint='#e8a029';
  const fixtures=[{r:.72,a:-.42},{r:.83,a:1.04}].map(q=>({x:Math.cos(q.a)*q.r,z:Math.sin(q.a)*q.r}));
  for(const q of fixtures){b(.27,.07,.27,ink,baseX+q.x*robotScale,4.89,baseZ+q.z*robotScale);for(const dx of[-.12,.12])b(.035,.11,.24,steel,baseX+q.x*robotScale+dx,4.95,baseZ+q.z*robotScale);}
  b(.24,.8,.28,white,-11.97,fy+.42,11.2);b(.31,.12,.34,ink,-11.97,fy+.87,11.2);b(.22,.025,.21,blue,-11.97,fy+.94,11.22);c(.04,.04,orange,-11.97,fy+.97,11.12);
  const robot=new T.Group();robot.name='Articulated tabletop robot';robot.position.set(...robotProject(baseX,baseY,baseZ));robot.scale.setScalar(robotScale);group.add(robot);
  mesh(geos.cyl,ink,[0,.045,0],[.24,.09,.24],robot);mesh(geos.cyl,steel,[0,.15,0],[.17,.18,.17],robot);
  const swivel=new T.Group();robot.add(swivel);mesh(geos.cyl,robotPaint,[0,.27,0],[.16,.17,.16],swivel);
  const shoulder=new T.Group();shoulder.position.y=.32;swivel.add(shoulder);
  mesh(geos.cyl,ink,[0,0,0],[.14,.23,.14],shoulder).rotation.x=Math.PI/2;mesh(geos.box,robotPaint,[.34,0,0],[.68,.18,.2],shoulder);mesh(geos.box,white,[.33,.1,0],[.35,.025,.12],shoulder);
  const elbow=new T.Group();elbow.position.x=.68;shoulder.add(elbow);mesh(geos.cyl,ink,[0,0,0],[.135,.23,.135],elbow).rotation.x=Math.PI/2;mesh(geos.box,robotPaint,[.31,0,0],[.62,.16,.18],elbow);
  const wrist=new T.Group();wrist.position.x=.62;elbow.add(wrist);mesh(geos.cyl,ink,[0,-.05,0],[.09,.1,.09],wrist);mesh(geos.box,steel,[0,-.14,0],[.19,.09,.13],wrist);
  const fingers=[mesh(geos.box,ink,[-.08,-.24,0],[.035,.16,.1],wrist),mesh(geos.box,ink,[.08,-.24,0],[.035,.16,.1],wrist)];
  const part=mesh(geos.box,green,[fixtures[0].x,.15,fixtures[0].z],[.12,.14,.14],robot);part.name='Robot handled prototype';
  // Physical cable loom follows each arm segment and avoids a dangling loose line.
  mesh(geos.box,ink,[.34,-.09,-.085],[.55,.025,.025],shoulder);mesh(geos.box,ink,[.31,.08,-.07],[.5,.025,.025],elbow);
  // Safety strips and tidy floor markings make both rooms read as working studios.
  kit.clearZone();
  for(const y of[.29,3.76])for(const x of[-13.92,-10.08])b(.035,.014,4.5,'#c8ad63',x,y,9.5);
  finish();const crafted=buildMakerCrafted(ctx,group);group.userData.craftedDetails=crafted.stats;
  let clock=0;
  const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
  function update(dt){
    if(dt>0)clock+=Math.min(dt,.1);
    const t=clock%50,layer=Math.min(layerCount-1,Math.floor(t/(44/layerCount))),fraction=t>=44?0:(t/(44/layerCount))%1;
    printed.count=layer+1;
    const progressWidth=.22*Math.min(1,(layer+1)/layerCount);progressBar.scale.x=progressWidth;progressBar.position.x=printerProject(px+.15+progressWidth/2,0,pz)[0];
    const theta=fraction*Math.PI*2-layer*.032,printRadius=profile(layer/(layerCount-1))*(1+.13*Math.cos(fraction*Math.PI*16));
    const hx=px+Math.cos(theta)*printRadius,hz=pz+Math.sin(theta)*printRadius,hy=bedY+.107+layer*layerHeight;
    head.position.set(...printerProject(hx,hy,hz));gantry.position.set(...printerProject(px,hy+.19,hz));spool.rotation.y=clock*.12;
    const curve=new T.QuadraticBezierCurve3(new T.Vector3(px+.8,2.8,pz-.35),new T.Vector3(px+.3,3.08,pz-.05),new T.Vector3(hx,hy+.24,hz));
    for(let i=0;i<22;i++){const p=curve.getPoint(i/21),mapped=printerProject(p.x,p.y,p.z);tubePoints[i*3]=mapped[0];tubePoints[i*3+1]=mapped[1];tubePoints[i*3+2]=mapped[2];}tubeGeo.attributes.position.needsUpdate=true;
    // A part shuttles between two nests; every transfer is picked, raised and placed.
    const cycle=Math.floor(clock/8),phase=clock%8,from=fixtures[cycle%2],to=fixtures[(cycle+1)%2];
    let tx=from.x,tz=from.z,wy=.7;
    if(phase<1){tx=from.x;tz=from.z;}
    else if(phase<1.7)wy=T.MathUtils.lerp(.7,.36,smooth((phase-1)/.7));
    else if(phase<2.2)wy=.36;
    else if(phase<3)wy=T.MathUtils.lerp(.36,.7,smooth((phase-2.2)/.8));
    else if(phase<5){const k=smooth((phase-3)/2);tx=T.MathUtils.lerp(from.x,to.x,k);tz=T.MathUtils.lerp(from.z,to.z,k);wy=.7+Math.sin(k*Math.PI)*.09;}
    else{tx=to.x;tz=to.z;if(phase<5.7)wy=T.MathUtils.lerp(.7,.36,smooth((phase-5)/.7));else if(phase<6.4)wy=T.MathUtils.lerp(.36,.7,smooth((phase-5.7)/.7));}
    const radius=Math.hypot(tx,tz),dy=wy-.32,l1=.68,l2=.62;
    const elbowAngle=-Math.acos(T.MathUtils.clamp((radius*radius+dy*dy-l1*l1-l2*l2)/(2*l1*l2),-1,1));
    const shoulderAngle=Math.atan2(dy,radius)-Math.atan2(l2*Math.sin(elbowAngle),l1+l2*Math.cos(elbowAngle));
    swivel.rotation.y=-Math.atan2(tz,tx);shoulder.rotation.z=shoulderAngle;elbow.rotation.z=elbowAngle;wrist.rotation.z=-shoulderAngle-elbowAngle;
    const held=phase>=1.7&&phase<5.7,closed=phase>=1.55&&phase<5.85;
    fingers[0].position.x=closed?-.065:-.105;fingers[1].position.x=closed?.065:.105;
    if(held)part.position.set(tx,wy-.21,tz);else{const nest=phase<1.7?from:to;part.position.set(nest.x,.15,nest.z);}
  }
  update(0);
  return{group,update};
}
