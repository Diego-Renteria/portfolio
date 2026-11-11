/** A slow waterfront observation wheel. Cabins hang upright independently of the
 * rotating rim, and all repeated fittings are instanced in a small draw budget. */
export function buildHarborWheel(ctx){
  const {THREE:T,world,glowMaterials=[]}=ctx,group=new T.Group();group.name='Harborlight waterfront observation wheel';world.add(group);
  const root=new T.Group();root.position.set(-83,0,78);root.rotation.y=.15;group.add(root);
  const deck=new T.Group();deck.position.set(-83,0,78);group.add(deck);
  const centerY=15,radius=10.5,cabinCount=16;
  const rotor=new T.Group();rotor.position.y=centerY;root.add(rotor);
  const metal=ctx.material('#687c80','metal'),pale=ctx.material('#c7cfca','metal'),dark=ctx.material('#34494f','metal'),wood=ctx.material('#a3825e','wood'),stone=ctx.material('#a9b2a7','concrete');
  const glass=new T.MeshPhysicalMaterial({color:'#9dc1c8',roughness:.15,metalness:.06,transparent:true,opacity:.23,depthWrite:false,side:T.DoubleSide});
  const warm=new T.MeshStandardMaterial({color:'#eadbc0',emissive:'#ffe1b1',emissiveIntensity:.035,roughness:.45});glowMaterials.push(warm);
  const boxGeo=new T.BoxGeometry(1,1,1),tubeGeo=new T.CylinderGeometry(1,1,1,12),ringGeo=new T.TorusGeometry(radius,.085,8,128);
  const staticParts=new Map(),movingParts=new Map(),cabinParts=new Map();
  const identity=new T.Object3D(),axis=new T.Vector3(0,1,0);
  function add(map,parent,geo,mat,position,scale,rotation=[0,0,0]){
    const key=parent.uuid+':'+geo.uuid+':'+mat.uuid;
    if(!map.has(key))map.set(key,{parent,geo,mat,parts:[]});
    map.get(key).parts.push({position,scale,rotation});
  }
  const box=(map,parent,mat,w,h,d,x,y,z,rotation)=>add(map,parent,boxGeo,mat,[x,y,z],[w,h,d],rotation);
  function rod(map,parent,mat,a,b,r){
    const p=new T.Vector3(...a),q=new T.Vector3(...b),delta=q.clone().sub(p),e=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(axis,delta.clone().normalize()));
    add(map,parent,tubeGeo,mat,p.add(q).multiplyScalar(.5).toArray(),[r,delta.length(),r],[e.x,e.y,e.z]);
  }
  // The deck is laid board by board rather than a plain rectangle. The support
  // feet sit on separate concrete plinths with base plates and four anchor bolts.
  box(staticParts,deck,stone,27,.25,8,0,.04,0);
  for(let i=0;i<39;i++)box(staticParts,deck,wood,.64,.09,7.7,-12.9+i*.68,.21,0);
  for(const depth of[-2.65,2.65])for(const side of[-1,1]){
    const foot=[side*5.3,.57,depth];box(staticParts,root,stone,1.18,.65,1.28,foot[0],.41,foot[2]);box(staticParts,root,dark,.86,.10,.91,foot[0],.79,foot[2]);
    for(const dx of[-.30,.30])for(const dz of[-.31,.31])add(staticParts,root,tubeGeo,metal,[foot[0]+dx,.88,foot[2]+dz],[.045,.12,.045]);
    rod(staticParts,root,pale,[foot[0],.86,foot[2]],[0,centerY,depth*.23],.19);
    rod(staticParts,root,dark,[foot[0],.86,foot[2]],[side*2.6,7.4,depth*.57],.07);
  }
  for(const depth of[-2.25,2.25])rod(staticParts,root,metal,[-3.3,5.7,depth],[3.3,5.7,depth],.09);
  rod(staticParts,root,dark,[0,centerY,-1.25],[0,centerY,1.25],.39);
  add(staticParts,root,tubeGeo,pale,[0,centerY,-1.30],[.65,.22,.65],[Math.PI/2,0,0]);
  add(staticParts,root,tubeGeo,pale,[0,centerY,1.30],[.65,.22,.65],[Math.PI/2,0,0]);
  // Queue rails and a modest ticket pavilion occupy opposite sides of the deck.
  // This intentionally avoids a symmetric fairground arrangement.
  for(let j=0;j<3;j++){const x=-8.7+j*1.1;rod(staticParts,root,metal,[x,.27,1.6],[x,1.25,1.6],.035);rod(staticParts,root,metal,[x,.27,3.1],[x,1.25,3.1],.035);rod(staticParts,root,metal,[x,1.18,1.6],[x,1.18,3.1],.035);}
  box(staticParts,root,wood,2.3,2.25,2.1,10.1,1.39,-1.7);box(staticParts,root,dark,2.7,.18,2.4,10.1,2.60,-1.7);
  box(staticParts,root,glass,1.6,.85,.025,10.1,1.79,-.635);box(staticParts,root,pale,1.75,.09,.38,10.1,1.31,-.49);box(staticParts,root,warm,1.4,.06,.06,10.1,2.35,-.61);
  for(const z of[-.43,.43]){
    add(movingParts,rotor,ringGeo,pale,[0,0,z],[1,1,1]);
    for(let i=0;i<cabinCount;i++){
      const a=i*Math.PI*2/cabinCount,s=Math.sin(a),c=Math.cos(a);
      rod(movingParts,rotor,metal,[s*.62,c*.62,z],[s*radius,c*radius,z],.035);
      const next=a+Math.PI*2/cabinCount;rod(movingParts,rotor,metal,[s*radius,c*radius,z],[Math.sin(next)*radius,Math.cos(next)*radius,-z],.040);
    }
  }
  // A second thin tension ring and distributed warm bulbs add fine structure
  // without turning the wheel into a neon sign.
  const innerGeo=new T.TorusGeometry(radius-1.0,.035,6,128);
  add(movingParts,rotor,innerGeo,metal,[0,0,0],[1,1,1]);
  for(let i=0;i<64;i++){const a=i*Math.PI*2/64;box(movingParts,rotor,warm,.075,.075,.07,Math.sin(a)*radius,Math.cos(a)*radius,.49);}
  for(let i=0;i<cabinCount;i++){const a=i*Math.PI*2/cabinCount;rod(movingParts,rotor,dark,[Math.sin(a)*radius,Math.cos(a)*radius,-.68],[Math.sin(a)*radius,Math.cos(a)*radius,.68],.075);}
  // Local cabin geometry, later replicated around the circle. The door mullion,
  // bumper, side rails, window reveals and interior benches have distinct depth.
  box(cabinParts,root,dark,1.25,.13,1.25,0,-1.35,0);
  box(cabinParts,root,pale,1.22,.40,1.20,0,-1.09,0);
  box(cabinParts,root,dark,1.27,.12,1.27,0,-.86,0);
  box(cabinParts,root,pale,1.33,.14,1.31,0,-.04,0);
  for(const x of[-.55,.55])for(const z of[-.54,.54])box(cabinParts,root,pale,.055,.85,.055,x,-.46,z);
  for(const z of[-.55,.55]){box(cabinParts,root,glass,1.04,.75,.018,0,-.45,z);box(cabinParts,root,dark,.035,.77,.028,0,-.45,z);box(cabinParts,root,pale,.15,.025,.035,.11,-.64,z+.025);}
  for(const x of[-.56,.56])box(cabinParts,root,glass,.018,.75,1.02,x,-.45,0);
  for(const x of[-.37,.37])box(cabinParts,root,wood,.23,.11,.90,x,-.91,0);
  rod(cabinParts,root,metal,[0,-.02,-.52],[0,.35,-.52],.045);rod(cabinParts,root,metal,[0,-.02,.52],[0,.35,.52],.045);
  rod(cabinParts,root,metal,[0,.35,-.52],[0,.35,.52],.045);
  box(cabinParts,root,warm,.76,.025,.20,0,-.14,0);
  const cabinMeshes=[];let drawCalls=0;
  function bake(map,cabins=false){for(const {parent,geo,mat,parts}of map.values()){
    const count=parts.length*(cabins?cabinCount:1),mesh=new T.InstancedMesh(geo,mat,count);mesh.castShadow=!mat.transparent;mesh.receiveShadow=true;mesh.name=cabins?'Upright glazed observation cabins':'Wheel structural fittings';
    if(cabins)cabinMeshes.push({mesh,parts});else for(let i=0;i<parts.length;i++){const p=parts[i];identity.position.set(...p.position);identity.scale.set(...p.scale);identity.rotation.set(...p.rotation);identity.updateMatrix();mesh.setMatrixAt(i,identity.matrix);}
    mesh.instanceMatrix.setUsage(cabins?T.DynamicDrawUsage:T.StaticDrawUsage);parent.add(mesh);if(!cabins)mesh.computeBoundingSphere();drawCalls++;
  }}
  bake(staticParts);bake(movingParts);bake(cabinParts,true);
  let angle=0;
  function updateCabins(){for(const {mesh,parts}of cabinMeshes){let index=0;for(let i=0;i<cabinCount;i++){
    const a=i*Math.PI*2/cabinCount-angle,cx=Math.sin(a)*radius,cy=centerY+Math.cos(a)*radius;
    for(const p of parts){identity.position.set(cx+p.position[0],cy+p.position[1],p.position[2]);identity.scale.set(...p.scale);identity.rotation.set(...p.rotation);identity.updateMatrix();mesh.setMatrixAt(index++,identity.matrix);}
  }mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}}
  updateCabins();group.userData.drawCalls=drawCalls;group.userData.cabinCount=cabinCount;group.userData.rotationPeriod=2*Math.PI/.014;
  return{group,setNight(value){warm.emissiveIntensity=value?1.4:.035;},update(dt){if(!(dt>0))return;angle=(angle+Math.min(dt,.10)*.014)%(Math.PI*2);rotor.rotation.z=angle;updateCabins();}};
}
