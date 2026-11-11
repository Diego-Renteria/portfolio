import {createVehicleLibrary} from './vehicle-models.js?v=b477ce33502c';
import {estateSites,hillRoadCenterlines,terrainHeight} from './geography.js?v=b477ce33502c';
// Upscale vehicles are concentrated at the estates and on their scenic access roads.
export function buildLuxuryTraffic(ctx){
  const {THREE:T,world}=ctx,group=new T.Group();group.name='Hillside luxury vehicles';world.add(group);
  const palette=['#202e32','#dcd8cd','#517d72','#b6a27c','#6b7483','#8c392c','#50738a'];
  const mats={};palette.forEach((color,i)=>mats['paint'+i]=new T.MeshPhysicalMaterial({color,metalness:.62,roughness:.25,clearcoat:.7,clearcoatRoughness:.2}));
  for(const[key,color,metalness,roughness]of[['glass','#263c44',.45,.16],['tire','#202326',0,.95],['rim','#a8b1b6',.9,.22],['chrome','#bdc6c4',.9,.19],['bed','#303739',.15,.8],['cargo','#dedbd0',.1,.6],['headlight','#fff1cd',0,.25],['taillight','#e75439',0,.3]])mats[key]=new T.MeshStandardMaterial({color,metalness,roughness});
  mats.headlight.emissive.set('#ffdf9f');mats.headlight.emissiveIntensity=.4;mats.taillight.emissive.set('#e53722');mats.taillight.emissiveIntensity=.5;
  const {vehicle}=createVehicleLibrary(T),cars=[],batches=new Map(),o=new T.Object3D(),local=new T.Object3D(),matrix=new T.Matrix4();
  for(const[s,i]of estateSites.map((s,i)=>[s,i])){
    cars.push({...vehicle(i%3===0?5:4,'paint'+i%7),parked:true,x:s.x+7.4,y:s.y+1.28,z:s.z+8.7,yaw:0,size:1.45});
    if(i%3===1)cars.push({...vehicle(5,'paint0'),parked:true,x:s.x+9.6,y:s.y+1.28,z:s.z+7.6,yaw:0,size:1.35});
  }
  // Out-and-back routes use separate lanes, with wide turnaround space at each end.
  const routes=hillRoadCenterlines.slice(0,3).map(points=>{
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p.x,0,p.z))),length=curve.getLength(),radius=.64,turn=Math.PI*radius,total=2*length+2*turn;
    function sample(distance){
      const d=((distance%total)+total)%total;let u,sign,angle=null;
      if(d<length){u=d/length;sign=1}
      else if(d<length+turn){u=1;sign=1;angle=(d-length)/radius}
      else if(d<2*length+turn){u=1-(d-length-turn)/length;sign=-1}
      else{u=0;sign=-1;angle=(d-2*length-turn)/radius}
      const p=curve.getPointAt(Math.max(0,Math.min(1,u))),v=curve.getTangentAt(Math.max(0,Math.min(1,u))),nx=-v.z,nz=v.x;
      const lateral=angle===null?radius*sign:radius*Math.cos(angle)*sign,along=angle===null?0:radius*Math.sin(angle)*sign;
      const x=p.x+nx*lateral+v.x*along,z=p.z+nz*lateral+v.z*along;
      const dx=angle===null?v.x*sign:(v.x*Math.cos(angle)-nx*Math.sin(angle))*sign,dz=angle===null?v.z*sign:(v.z*Math.cos(angle)-nz*Math.sin(angle))*sign;
      return{x,z,y:terrainHeight(x,z)+.065,dx,dz};
    }
    return{sample,length,total};
  });
  routes.forEach((route,i)=>{for(let k=0;k<3;k++)cars.push({...vehicle(k===1?5:4,'paint'+(i*2+k)%7),route,s:route.total*(k+.2)/3,cruise:1.45,size:1,parked:false})});
  for(const car of cars)for(const p of car.parts){const key=p.geo.uuid+':'+p.material;let b=batches.get(key);if(!b){b={g:p.geo,m:mats[p.material],parts:[]};batches.set(key,b)}p.b=b;p.index=b.parts.length;b.parts.push(p)}
  for(const b of batches.values()){b.mesh=new T.InstancedMesh(b.g,b.m,b.parts.length);b.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);b.mesh.castShadow=true;b.mesh.receiveShadow=true;b.mesh.frustumCulled=false;group.add(b.mesh)}
  let clock=0;
  function update(dt){clock+=dt;for(const car of cars){let p;if(car.parked)p=car;else{car.s=(car.s+dt*car.cruise)%car.route.total;p=car.route.sample(car.s);car.x=p.x;car.y=p.y;car.z=p.z;car.yaw=Math.atan2(p.dx,p.dz);}
    let pitch=0;if(!car.parked){const next=car.route.sample((car.s+.2)%car.route.total);pitch=-Math.atan2(next.y-p.y,.2)}
    o.position.set(car.x,car.y,car.z);o.rotation.set(0,car.yaw,0);o.rotateX(pitch);o.scale.setScalar(car.size);o.updateMatrix();
    for(const part of car.parts){local.position.fromArray(part.position);local.scale.fromArray(part.scale);local.rotation.set(...part.rotation);local.updateMatrix();matrix.multiplyMatrices(o.matrix,local.matrix);part.b.mesh.setMatrixAt(part.index,matrix)}}for(const b of batches.values())b.mesh.instanceMatrix.needsUpdate=true;}
  function setNight(n){mats.headlight.emissiveIntensity=n?2.5:.4;mats.taillight.emissiveIntensity=n?1.5:.5}
  update(0);return{group,cars,routes,update,setNight};
}
