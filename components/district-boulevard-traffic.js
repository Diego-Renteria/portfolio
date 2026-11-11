import {createVehicleLibrary} from './vehicle-models.js?v=b477ce33502c';
import {createVehicleLightSpill} from './vehicle-light-spill.js?v=b477ce33502c';
import {updateBrakeLight,brakeLensColor} from './vehicle-braking.js?v=b477ce33502c';
import {driverProfile,freeRoadSpeed} from './driving-profile.js?v=b477ce33502c';

/** Right-hand traffic on the exact arc-length-parameterized perimeter boulevard.
 * Cars retain their lane and queue order; curvature, following distance and jerk
 * limits determine motion rather than a synchronized animation clock. */
export function buildBoulevardTraffic(ctx,layout){
  const {THREE:T,world,glowMaterials=[]}=ctx,group=new T.Group();group.name=layout.id+' / flowing perimeter boulevard traffic';world.add(group);
  const points=layout.loops?.[0]||[];
  if(points.length<4)throw new Error('Boulevard traffic needs a closed city perimeter');
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],0,p[1])),true,'centripetal');
  curve.arcLengthDivisions=2000;curve.updateArcLengths();
  const length=curve.getLength(),mod=(v,n)=>((v%n)+n)%n;
  const hash=n=>{const v=Math.sin(n*72.739+317.17)*91637.137;return v-Math.floor(v);};
  const materials={
    paint:new T.MeshPhysicalMaterial({color:'#ffffff',metalness:.43,roughness:.27,clearcoat:.68,clearcoatRoughness:.19}),
    glass:new T.MeshPhysicalMaterial({color:'#304a57',metalness:.28,roughness:.14,clearcoat:.35}),
    assetDetails:new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,metalness:.23,roughness:.56}),
    headlight:new T.MeshStandardMaterial({color:'#f0ead8',emissive:'#fff0cf',emissiveIntensity:.22,roughness:.3}),
    taillight:new T.MeshStandardMaterial({color:'#ffffff',emissive:'#ffffff',emissiveIntensity:.45,roughness:.33})
  };
  materials.taillight.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance *= vColor.rgb;\n#endif');};
  materials.taillight.customProgramCacheKey=()=> 'boulevard-brake-emission-v1';
  glowMaterials.push(materials.headlight,materials.taillight);
  const palette=['#9a4638','#d2d3c8','#366574','#3a4147','#b28c52','#37594b','#828a92','#c77242','#e3dfd2','#454f64'];
  const fleet=['sedan','suv-luxury','hatchback-sports','van','sedan-sports','sedan','truck','police','sedan-sports','delivery','taxi','hatchback-sports'];
  const {vehicle}=createVehicleLibrary(T),cars=[],batches=new Map();
  function sample(distance,direction){
    const u=mod(direction*distance,length)/length,p=curve.getPointAt(u),t=curve.getTangentAt(u).multiplyScalar(direction).normalize();
    // Looking along the travel direction, right is (-dz,+dx) on the XZ ground.
    const offset=1.05,x=p.x-t.z*offset,z=p.z+t.x*offset;
    const ahead=curve.getTangentAt(mod(direction*(distance+3.0),length)/length).multiplyScalar(direction).normalize();
    const cross=t.x*ahead.z-t.z*ahead.x,dot=Math.max(-1,Math.min(1,t.dot(ahead))),curvature=Math.atan2(cross,dot)/3;
    return{x,z,dx:t.x,dz:t.z,curvature,centerX:p.x,centerZ:p.z,laneOffset:offset};
  }
  for(const direction of[1,-1])for(let i=0;i<18;i++){
    const seed=i+(direction===1?1:61),model=vehicle(fleet[(i+(direction===1?0:3))%fleet.length],'paint');
    // Six small groups spread activity around the whole island perimeter.
    const cluster=Math.floor(i/3),within=i%3,s=mod(cluster*length/6+within*6.2+(direction===1?0:length/12),length);
    const profile=driverProfile(model.model,hash(seed+20));
    const car={...model,parts:model.parts.filter(p=>!p.indicatorSide),id:cars.length,direction,s,p:sample(s,direction),speed:2.0+hash(seed)*.50,acceleration:0,cruise:profile.cruise,maxAcceleration:(.72+hash(seed+40)*.32)*profile.throttle,comfortBrake:1.65+hash(seed+70)*.35,jerk:1.5+hash(seed+100)*.6,headway:.90+hash(seed+120)*.40,distanceTravelled:0,paint:palette[(i+(direction===1?0:4))%palette.length],active:true};
    cars.push(car);
    for(const part of car.parts){const key=part.geo.uuid+':'+part.material;if(!batches.has(key))batches.set(key,{geo:part.geo,material:materials[part.material],parts:[]});part.batch=batches.get(key);part.index=part.batch.parts.length;part.batch.parts.push({part,car});}
  }
  for(const batch of batches.values()){
    batch.mesh=new T.InstancedMesh(batch.geo,batch.material,batch.parts.length);batch.mesh.name='Authored pack vehicles on '+layout.id+' boulevard';batch.mesh.castShadow=true;batch.mesh.receiveShadow=true;batch.mesh.frustumCulled=false;batch.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(batch.mesh);
  }
  const dummy=new T.Object3D(),local=new T.Object3D(),baseMatrix=new T.Matrix4(),partMatrix=new T.Matrix4(),color=new T.Color();
  const headlightSpill=createVehicleLightSpill(T,group,cars,{roadY:.095});
  let elapsed=0;
  function leaderFor(car){let leader=null,distance=Infinity;for(const other of cars)if(other!==car&&other.direction===car.direction){const d=mod(other.s-car.s,length);if(d<distance){leader=other;distance=d;}}return{leader,distance};}
  function simulate(dt){
    const next=[];
    for(const car of cars){
      const {leader,distance}=leaderFor(car),gap=Math.max(.08,distance-(car.length+leader.length)*.5),closing=car.speed-leader.speed;
      const desiredSpeed=freeRoadSpeed(car,distance=>sample(distance,car.direction),{lateralAcceleration:.72,bendThreshold:.035});
      car.freeRoadTarget=desiredSpeed;
      const desiredGap=.85+Math.max(0,car.speed*car.headway+car.speed*closing/(2*Math.sqrt(car.maxAcceleration*car.comfortBrake)));
      const freeFlow=1-Math.pow(car.speed/Math.max(.7,desiredSpeed),4),follow=Math.pow(desiredGap/gap,2);
      const target=Math.max(-car.comfortBrake,Math.min(car.maxAcceleration,car.maxAcceleration*(freeFlow-follow)));
      const acceleration=car.acceleration+Math.max(-car.jerk*dt,Math.min(car.jerk*dt,target-car.acceleration));
      let speed=Math.max(0,car.speed+acceleration*dt),travel=(car.speed+speed)*.5*dt;
      // A final bumper constraint protects long trucks during unusual frame
      // delays; ordinary motion is governed by the smooth following controller.
      const safeTravel=Math.max(0,gap-.52)+leader.speed*dt;
      if(travel>safeTravel){travel=safeTravel;speed=Math.min(speed,travel/dt);}
      next.push({car,speed,acceleration,travel});
    }
    for(const {car,speed,acceleration,travel}of next){const previousSpeed=car.speed;car.speed=speed;car.acceleration=acceleration;updateBrakeLight(car,previousSpeed,dt);car.s=mod(car.s+travel,length);car.distanceTravelled+=travel;car.p=sample(car.s,car.direction);}
  }
  function render(){
    for(const car of cars){
      dummy.position.set(car.p.x,.084,car.p.z);dummy.rotation.set(0,Math.atan2(car.p.dx,car.p.dz),0);dummy.scale.set(1,1,1);dummy.updateMatrix();baseMatrix.copy(dummy.matrix);
      for(const part of car.parts){local.position.fromArray(part.position);local.rotation.set(...part.rotation);local.scale.fromArray(part.scale);local.updateMatrix();partMatrix.copy(baseMatrix).multiply(local.matrix);part.batch.mesh.setMatrixAt(part.index,partMatrix);
        if(part.material==='taillight')brakeLensColor(color,car);else color.set(part.material==='paint'?car.paint:'#ffffff');part.batch.mesh.setColorAt(part.index,color);
      }
    }
    for(const batch of batches.values()){batch.mesh.instanceMatrix.needsUpdate=true;if(batch.mesh.instanceColor)batch.mesh.instanceColor.needsUpdate=true;}
    headlightSpill.update();
  }
  render();group.userData.drawCalls=batches.size;group.userData.carCount=cars.length;group.userData.authoredVehicleAssets=true;
  return{group,cars,curve,length,sample,headlightSpill,setQuality:headlightSpill.setQuality,get elapsed(){return elapsed;},setNight(value){materials.headlight.emissiveIntensity=value?5:.22;materials.taillight.emissiveIntensity=value?3.2:.45;headlightSpill.setNight(value);},update(dt){if(!(dt>0))return;const duration=Math.min(dt,.15),steps=Math.max(1,Math.ceil(duration/.025)),step=duration/steps;for(let i=0;i<steps;i++)simulate(step);elapsed+=duration;render();}};
}
