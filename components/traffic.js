import {createVehicleLibrary} from './vehicle-models.js?v=city-traffic-1';
import {createVehicleLightSpill} from './vehicle-light-spill.js?v=city-traffic-1';
import {updateBrakeLight,brakeLensColor} from './vehicle-braking.js?v=b477ce33502c';
import {insideLand,flatRoadXs,flatRoadZs,inStadiumReserve} from './geography.js?v=b477ce33502c';
import {buildIntersectionSignals,MAIN_INTERSECTION} from './intersection-signals.js?v=b477ce33502c';
import {createActuatedController} from './traffic-controller.js?v=b477ce33502c';
import {driverProfile,freeRoadSpeed} from './driving-profile.js?v=city-traffic-1';
import {createTrafficActivity,heavyModel,patrolFlash,personalityFor,samplePassingPose} from './traffic-activity.js?v=city-traffic-1';
const mod=(v,n)=>((v%n)+n)%n;
// Shared compatible movements form platoons; crossing paths yield before the stop bar.
export function buildTraffic({THREE:T,world,random=Math.random},network=null){
  const roadXs=network?.xs||flatRoadXs,roadZs=network?.zs||flatRoadZs;
  const controller=createActuatedController(),signals=buildIntersectionSignals({THREE:T,world},controller);
  const group=new T.Group();group.name='Downtown flowing pack-car traffic';world.add(group);
  const materials={},palette=['#b73d2c','#dedcd2','#356574','#333d43','#c9982e','#174f42','#6c7179','#df6429','#314993'];
  function mat(key,color,metalness=0,roughness=.6,emissive=0){return materials[key]??=new T.MeshStandardMaterial({color,metalness,roughness,emissive:emissive?color:0,emissiveIntensity:emissive})}
  materials.fleetPaint=new T.MeshPhysicalMaterial({color:'#ffffff',metalness:.5,roughness:.23,clearcoat:.8,clearcoatRoughness:.17,emissive:'#ffffff',emissiveIntensity:0});
  mat('tire','#1e2327',0,.95);mat('rim','#bec2c2',.8,.24);mat('glass','#263f4b',.6,.16);mat('chrome','#aeb7b6',.8,.24);mat('bed','#242c30',.15,.7);mat('cargo','#e3ded1',.1,.6);
  mat('headlight','#fff1c9',0,.25,.7);mat('taillight','#ffffff',0,.28,.5);
  mat('beaconRed','#ffffff',0,.28,.85);mat('beaconBlue','#ffffff',0,.28,.85);
  materials.assetDetails=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.5,metalness:.25});
  materials.indicator=new T.MeshStandardMaterial({color:'#ffffff',emissive:'#ffffff',emissiveIntensity:1.7,roughness:.3});
  const coloredEmission=m=>{m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance *= vColor.rgb;\n#endif');};m.customProgramCacheKey=()=>"traffic-instance-emission-v1";};coloredEmission(materials.indicator);
  coloredEmission(materials.taillight);
  coloredEmission(materials.fleetPaint);coloredEmission(materials.beaconRed);coloredEmission(materials.beaconBlue);
  const batches=new Map();
  const dummy=new T.Object3D(),baseMatrix=new T.Matrix4(),localMatrix=new T.Matrix4(),color=new T.Color();
  const junctions=[];
  for(const x of roadXs)for(const z of roadZs)if(insideLand(x,z,7))junctions.push({x,z,owners:new Set()});
  function routeRect(x0,x1,z0,z1,reverse=false,radiusOffset=0){
    const inset=reverse?-1:1;x0+=inset;x1-=inset;z0+=inset;z1-=inset;
    const pts=reverse?[[x0,z0],[x0,z1],[x1,z1],[x1,z0]]:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],r=(reverse?2.7:1.4)+radiusOffset,segments=[],corners=[];let total=0;
    function add(s){s.start=total;total+=s.length;segments.push(s)}
    for(let i=0;i<4;i++){
      const a=pts[i],p=pts[(i+3)%4],b=pts[(i+1)%4],incoming=new T.Vector2(a[0]-p[0],a[1]-p[1]).normalize(),outgoing=new T.Vector2(b[0]-a[0],b[1]-a[1]).normalize();
      const from=new T.Vector2(...a).sub(incoming.clone().multiplyScalar(r)),to=new T.Vector2(...a).add(outgoing.clone().multiplyScalar(r)),center=from.clone().add(outgoing.clone().multiplyScalar(r));
      corners.push({index:i,x:a[0],z:a[1],incoming,outgoing,anchor:total-(4-r),length:8+(Math.PI/2-2)*r});
      add({kind:'arc',center,angle:Math.atan2(from.y-center.y,from.x-center.x),sign:Math.sign(incoming.x*outgoing.y-incoming.y*outgoing.x),length:Math.PI*r/2,r});
      const end=new T.Vector2(...b).sub(outgoing.clone().multiplyScalar(r));add({kind:'line',from:to,to:end,length:to.distanceTo(end),dir:outgoing});
    }
    function sample(distance,radii){
      // Each private arc meets the same straight-lane anchors. Smooth arc-length
      // remapping preserves position and tangent at both ends; choosing a new
      // radius upstream never shifts a car already approaching the junction.
      if(radii)for(const c of corners){
        const local=mod(distance-c.anchor,total),radius=radii[c.index]??r;
        if(local>=c.length)continue;
        const t=local/c.length,span=8+(Math.PI/2-2)*radius,s=local+(span-c.length)*t*t*(3-2*t),straight=4-radius,arc=Math.PI*radius/2;
        if(s<straight)return{x:c.x-c.incoming.x*(4-s),z:c.z-c.incoming.y*(4-s),dx:c.incoming.x,dz:c.incoming.y,curvature:0};
        if(s>straight+arc){const d=radius+s-straight-arc;return{x:c.x+c.outgoing.x*d,z:c.z+c.outgoing.y*d,dx:c.outgoing.x,dz:c.outgoing.y,curvature:0};}
        const sign=Math.sign(c.incoming.x*c.outgoing.y-c.incoming.y*c.outgoing.x),angle=Math.atan2(-c.outgoing.y,-c.outgoing.x)+sign*(s-straight)/radius;
        return{x:c.x-c.incoming.x*radius+c.outgoing.x*radius+Math.cos(angle)*radius,z:c.z-c.incoming.y*radius+c.outgoing.y*radius+Math.sin(angle)*radius,dx:-Math.sin(angle)*sign,dz:Math.cos(angle)*sign,curvature:sign/radius};
      }
      let s=mod(distance,total),seg=segments.find(p=>s<p.start+p.length)||segments.at(-1);s-=seg.start;
      if(seg.kind==='line')return{x:seg.from.x+seg.dir.x*s,z:seg.from.y+seg.dir.y*s,dx:seg.dir.x,dz:seg.dir.y,curvature:0};
      const a=seg.angle+seg.sign*s/seg.r;return{x:seg.center.x+Math.cos(a)*seg.r,z:seg.center.y+Math.sin(a)*seg.r,dx:-Math.sin(a)*seg.sign,dz:Math.cos(a)*seg.sign,curvature:seg.sign/seg.r};
    }
    const events=[];
    for(const j of junctions){
      let best=Infinity,at=0;
      for(let s=0;s<total;s+=.12){const p=sample(s),d=Math.hypot(p.x-j.x,p.z-j.z);if(d<best){best=d;at=s}}
      if(best>3)continue;
      const incoming=sample(at-8),outgoing=sample(at+8),cross=incoming.dx*outgoing.dz-incoming.dz*outgoing.dx,turn=Math.abs(cross)<.2?null:cross>0?'right':'left';
      // Find the exact upstream stop line and downstream rear-clearance point on the path.
      let stop=at-5.4,release=at+7.0,stopError=Infinity,releaseError=Infinity;
      for(let ds=-11;ds<=11;ds+=.025){const p=sample(at+ds),along=(p.x-j.x)*incoming.dx+(p.z-j.z)*incoming.dz,out=(p.x-j.x)*outgoing.dx+(p.z-j.z)*outgoing.dz;
        if(ds<0&&Math.abs(along+5.4)<stopError){stopError=Math.abs(along+5.4);stop=at+ds}
        if(ds>0&&Math.abs(out-7.0)<releaseError){releaseError=Math.abs(out-7.0);release=at+ds}
      }
      const path=[];for(let ds=stop;ds<=release;ds+=.55)path.push(sample(ds));
      const cornerIndex=turn?corners.find(c=>Math.hypot(c.x-j.x,c.z-j.z)<2)?.index:undefined;
      events.push({j,s:mod(at,total),stop:mod(stop,total),release:mod(release,total),turn,cornerIndex,incoming,outgoing,path,radius:r,movement:[incoming.dx,incoming.dz,outgoing.dx,outgoing.dz].map(v=>Math.round(v)).join(',')});
    }
    let stadiumClear=true;for(let d=0;d<total;d+=.5){const p=sample(d);if(inStadiumReserve(p.x,p.z,1.6)){stadiumClear=false;break;}}
    function locate({x,z,dx,dz}){
      for(const segment of segments){
        if(segment.kind!=='line'||dx*segment.dir.x+dz*segment.dir.y<.9999)continue;
        const rx=x-segment.from.x,rz=z-segment.from.y,along=rx*dx+rz*dz;
        if(along>3&&along<segment.length-3&&Math.abs(rx*dz-rz*dx)<.02)return segment.start+along;
      }
      return null;
    }
    return{sample,locate,length:total,events,corners,radius:r,stadiumClear};
  }
  const routes=[];
  function addRoute(x0,x1,z0,z1,reverse=false){const r=routeRect(x0,x1,z0,z1,reverse,((routes.length%5)-2)*.035);for(let s=0;s<r.length;s+=1){const p=r.sample(s);if(!insideLand(p.x,p.z,7))return}routes.push(r)}
  const plans=network?.trafficPlans||[[4,6,3,5],[3,7,2,6],[2,8,1,7],[1,9,1,8],[0,10,2,7],[2,6,3,7],[5,9,1,5],[1,4,1,5],[6,9,5,8],[3,7,5,8],[2,8,0,9]];
  for(const reverse of[false,true])for(const[a,b,c,d]of plans){
    if(roadXs[b]!==undefined&&roadZs[d]!==undefined)addRoute(roadXs[a],roadXs[b],roadZs[c],roadZs[d],reverse);
  }
  if(!routes.length)throw new Error('No valid downtown road routes');
  const coreRoutes=routes.slice(),perimeterRoutes=[];
  if(network?.perimeterCars)for(const reverse of[false,true])for(const[a,b,c,d]of[[0,2,2,7],[8,10,2,7],[2,8,7,9],[2,8,0,2]]){
    const before=routes.length;addRoute(roadXs[a],roadXs[b],roadZs[c],roadZs[d],reverse);
    if(routes.length>before){routes.at(-1).perimeter=true;perimeterRoutes.push(routes.at(-1));}
  }
  const {vehicle}=createVehicleLibrary(T),cars=[];
  const baseFleet=['sedan-sports','sedan','hatchback-sports','suv-luxury','sedan','taxi','sedan-sports','truck','sedan','van','hatchback-sports','police','sedan','delivery'];
  const fleet=network?.activity?[
    'street-coupe','sedan','patrol-sedan','street-hatch','classic-muscle','city-suv',
    'work-pickup','executive-sedan','patrol-interceptor','open-roadster','parcel-van',
    'sedan','service-truck','suv-luxury','city-ambulance','hatchback-sports','delivery',
    'patrol-suv','executive-sedan','city-firetruck','street-hatch','sedan-sports','van',
    'open-roadster','sedan','classic-muscle','street-coupe','truck','city-suv','work-pickup',
  ]:baseFleet;
  for(let i=0;i<(network?.carCount||160);i++){
    const choices=perimeterRoutes.length&&i>=(network.carCount-network.perimeterCars)?perimeterRoutes:coreRoutes;
    let route=choices[i%choices.length];const model=vehicle(fleet[i%fleet.length],'fleetPaint');let s=0,p,found=false;
    for(let trial=0;trial<5000;trial++){route=choices[(i+Math.floor(trial/500))%choices.length];s=random()*route.length;p=route.sample(s);if(cars.every(c=>Math.hypot(c.p.x-p.x,c.p.z-p.z)>5)&&junctions.every(j=>Math.hypot(j.x-p.x,j.z-p.z)>7.2)){found=true;break}}
    if(found){
      const seed=random(),profile=driverProfile(model.model,seed);
      const personality=network?.activity?personalityFor(model.model,(seed*2.63)%1):{name:'steady',pace:1,reaction:1,turn:1};
      cars.push({...model,route,s,p,paint:palette[i%palette.length],speed:0,cruise:profile.cruise*personality.pace,
        personality:personality.name,nextRouteChoice:7+(i%23),lock:null,committed:false,indicator:null,
        distanceTravelled:0,active:true,acceleration:0,maxAcceleration:(.95+random()*.45)*profile.throttle,
        comfortBrake:2.2+random()*.5,jerk:1.9+random()*.55,reactionTime:(.38+random()*.65)*personality.reaction,
        readyAt:null,stoppedFor:1,departureAt:null,turnPace:(.83+random()*.12)*personality.turn});
    }
  }
  function allocate(parts,dynamic=false){for(const p of parts){const key=p.geo.uuid+':'+p.material+(dynamic?'d':'s');let batch=batches.get(key);if(!batch){batch={geo:p.geo,material:p.material,parts:[],dynamic};batches.set(key,batch)}p.batch=batch;p.index=batch.parts.length;batch.parts.push(p)}}
  for(const car of cars)allocate(car.parts,true);
  const headlightSpill=createVehicleLightSpill(T,group,cars,{roadY:network?.id?.095:.057,patrolGlow:!!network?.activity});
  for(const batch of batches.values()){
    batch.mesh=new T.InstancedMesh(batch.geo,materials[batch.material],batch.parts.length);batch.mesh.castShadow=true;batch.mesh.receiveShadow=true;batch.mesh.frustumCulled=false;
    if(batch.dynamic)batch.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(batch.mesh);
  }
  for(const car of cars)for(const part of car.parts){
    if(part.material==='fleetPaint')part.batch.mesh.setColorAt(part.index,color.set(car.paint));
  }
  function put(p,parent){dummy.position.fromArray(p.position);dummy.scale.fromArray(p.scale);dummy.rotation.set(...p.rotation);dummy.updateMatrix();localMatrix.copy(dummy.matrix);if(parent)localMatrix.premultiply(parent);p.batch.mesh.setMatrixAt(p.index,localMatrix)}
  let elapsed=0,stadiumEnabled=false,nextRestoreCheck=0;
  function prepareTurn(car){
    if(car.turnRoute!==car.route){car.turnRoute=car.route;car.turnRadii=car.route.corners.map(()=>car.route.radius);car.turnEvents=car.route.events.map(e=>e.turn?{...e}:e);car.plannedCorner=-1;car.turnPlans=car.turnPlans??0;}
    let corner=null,distance=Infinity;
    for(const c of car.route.corners){const d=mod(c.anchor-car.s,car.route.length);if(d<distance){distance=d;corner=c;}}
    if(distance>=36||corner.index===car.plannedCorner)return;
    // Quantized, bounded radii keep reservation caching finite. A fresh draw is
    // made for this visit, excluding both the previous visit and previous turn.
    const minimum=heavyModel(car.model)?1.5:1.0;
    const options=Array.from({length:Math.round((3.8-minimum)*10)+1},(_,i)=>Math.round((minimum+i*.1)*10)/10).filter(r=>Math.abs(r-car.turnRadii[corner.index])>=.399&&Math.abs(r-(car.lastTurnRadius??0))>=.399);
    const radius=options[Math.min(options.length-1,Math.floor(random()*options.length))];
    car.turnRadii[corner.index]=radius;car.plannedCorner=corner.index;car.lastTurnRadius=radius;car.turnPlans++;
    for(const e of car.turnEvents)if(e.cornerIndex===corner.index){e.radius=radius;e.path=[];const span=mod(e.release-e.stop,car.route.length);for(let d=0;d<=span;d+=.55)e.path.push(car.route.sample(e.stop+d,car.turnRadii));}
  }
  const sampleBase=(car,distance)=>car.route.sample(distance,car.turnRoute===car.route?car.turnRadii:undefined);
  const sampleCar=(car,distance)=>samplePassingPose(sampleBase(car,distance),distance,car.pass,car.route.length);
  const signed=(v,n)=>mod(v+n/2,n)-n/2,conflictCache=new Map();
  // Leave room for the controller and the gradual build-up of braking force.
  // The linear final approach releases the brake gently at walking speed.
  function stoppingSpeed(car,distance){
    const d=Math.max(0,distance),b=car.comfortBrake*.65,t=.85+b/(2*car.jerk);
    return Math.min(Math.sqrt((b*t)**2+2*b*d)-b*t,d*.4);
  }
  function followingSpeed(car,other,gap,aligned){
    const b=car.comfortBrake*.65,buffer=b*(.85+b/(2*car.jerk));
    // A speed-dependent following space covers the leader braking as well as
    // our own response; using only relative speed left bumper clamps to do the stop.
    const forwardSpeed=other.speed*Math.max(0,aligned);
    return Math.min(forwardSpeed+stoppingSpeed(car,gap),Math.max(0,Math.sqrt(buffer*buffer+forwardSpeed*forwardSpeed+2*b*Math.max(0,gap))-buffer));
  }
  function movementsConflict(a,b,car,other){
    if(a.movement===b.movement)return false;
    const key=a.movement+'@'+a.radius+'@'+car.length+'@'+car.width+'|'+b.movement+'@'+b.radius+'@'+other.length+'@'+other.width;
    if(conflictCache.has(key))return conflictCache.get(key);
    // Reserve the swept body, including a small sampling margin, rather than
    // just the centerline. Long cars otherwise clip a different-radius turn.
    const body={length:car.length+.35,width:car.width+.2};
    const conflict=a.path.some(p=>b.path.some(q=>!clearPose(body,p,{p:q,length:other.length+.35,width:other.width+.2})));
    if(conflictCache.size>=4096)conflictCache.delete(conflictCache.keys().next().value);
    conflictCache.set(key,conflict);return conflict;
  }
  function exitClear(car,e){
    const p=sampleCar(car,e.release+1.5);
    return cars.every(other=>{if(other===car||!other.active)return true;const dx=other.p.x-p.x,dz=other.p.z-p.z,aligned=other.p.dx*e.outgoing.dx+other.p.dz*e.outgoing.dz;
      // A moving platoon leader is not a stopped obstruction at the downstream curb.
      return Math.hypot(dx,dz)>3.1||aligned<.4||other.speed>.75;
    });
  }
  function oncoming(car,e){
    if(e.turn!=='left')return false;
    return cars.some(other=>{if(other===car||!other.active)return false;const dx=other.p.x-e.j.x,dz=other.p.z-e.j.z,along=dx*e.incoming.dx+dz*e.incoming.dz,lat=Math.abs(dx*e.incoming.dz-dz*e.incoming.dx);
      return along>4.5&&along<13&&lat<1.5&&other.p.dx*e.incoming.dx+other.p.dz*e.incoming.dz<-.8&&other.speed>.2;
    });
  }
  function approachClear(car,e){
    return cars.every(other=>{
      if(other===car||!other.active)return true;
      const dx=other.p.x-car.p.x,dz=other.p.z-car.p.z,ahead=dx*car.p.dx+dz*car.p.dz,lateral=Math.abs(dx*car.p.dz-dz*car.p.dx),aligned=other.p.dx*car.p.dx+other.p.dz*car.p.dz;
      // A queued leader chooses its movement first. Followers cannot reserve a
      // conflicting turn behind it and thereby prevent the leader from entering.
      return !(ahead>0&&ahead<12&&lateral<1.05&&aligned>.75)||other.lock?.j===e.j;
    });
  }
  function canReserve(car,e){return approachClear(car,e)&&exitClear(car,e)&&!oncoming(car,e)&&[...e.j.owners].every(other=>other===car||!movementsConflict(e,other.lock,car,other));}
  function signalAllows(car,e){
    if(e.j.x!==MAIN_INTERSECTION.x||e.j.z!==MAIN_INTERSECTION.z)return true;
    const phase=controller.phase(Math.abs(e.incoming.dx)>.5?'x':'z');
    if(phase.color==='green')return true;
    if(phase.color==='red')return false;
    // On amber, stop if comfortable braking can reach the stop bar. A vehicle
    // too close to stop safely may clear, provided it can enter before red.
    const distance=Math.max(0,signed(e.stop-car.length/2-car.s,car.route.length));
    const comfortableStop=car.speed*.75+car.speed*car.comfortBrake/(2*car.jerk)+car.speed*car.speed/(2*car.comfortBrake);
    return car.speed>.25&&distance<comfortableStop&&distance/car.speed<phase.remaining;
  }
  function release(car){if(car.lock)car.lock.j.owners.delete(car);car.lock=null;car.committed=false;}
  function clearPose(car,p,other){
    const dx=other.p.x-p.x,dz=other.p.z-p.z;
    if(Math.hypot(dx,dz)>(Math.hypot(car.length,car.width)+Math.hypot(other.length,other.width))/2+.12)return true;
    const axes=[p.dx,p.dz,-p.dz,p.dx,other.p.dx,other.p.dz,-other.p.dz,other.p.dx];
    for(let i=0;i<8;i+=2){
      const x=axes[i],z=axes[i+1],extent=Math.abs(x*p.dx+z*p.dz)*car.length/2+Math.abs(x*p.dz-z*p.dx)*car.width/2+Math.abs(x*other.p.dx+z*other.p.dz)*other.length/2+Math.abs(x*other.p.dz-z*other.p.dx)*other.width/2;
      if(Math.abs(dx*x+dz*z)>=extent+.08)return true;
    }
    return false;
  }
  const activity=network?.activity?createTrafficActivity({cars,routes,random,sampleBase,hasRoom:clearPose,...network.activity}):null;
  function update(dt){
    dt=Math.min(Math.max(dt,0),.05);elapsed+=dt;
    if(dt>0){
      const demand={x:{approaching:0,queued:0,present:false,blocked:false,ready:0},z:{approaching:0,queued:0,present:false,blocked:false,ready:0},occupied:false};
      for(const car of cars){
        if(!car.active)continue;
        if(car.lock?.j.x===MAIN_INTERSECTION.x&&car.lock?.j.z===MAIN_INTERSECTION.z&&car.committed)demand.occupied=true;
        const events=car.turnRoute===car.route?car.turnEvents:car.route.events;
        for(const e of events){
          if(e.j.x!==MAIN_INTERSECTION.x||e.j.z!==MAIN_INTERSECTION.z)continue;
          const d=signed(e.stop-car.length/2-car.s,car.route.length);
          // Stop-bar and advance presence detection only see the actual incoming
          // lane, not cars on a different street around the same route rectangle.
          if(d<-.2||d>36||car.p.dx*e.incoming.dx+car.p.dz*e.incoming.dz<.7)continue;
          const a=demand[Math.abs(e.incoming.dx)>.5?'x':'z'];a.approaching++;
          if(car.speed<.65)a.queued++;
          if(d<8||car.speed>.3&&d/car.speed<3.2)a.present=true;
          if(exitClear(car,e))a.ready++;
        }
      }
      for(const a of['x','z'])demand[a].blocked=demand[a].approaching>0&&demand[a].ready===0;
      controller.update(dt,demand);
    }
    signals.update();
    if(dt>0&&!stadiumEnabled&&elapsed>nextRestoreCheck){nextRestoreCheck=elapsed+.5;for(const car of cars)if(!car.active)tryRestore(car);}
    if(dt>0)activity?.update(elapsed);
    if(dt>0)for(const car of cars){
      if(!car.active)continue;
      prepareTurn(car);
      if(car.lock){
        const remaining=signed(car.lock.stop-car.length/2-car.s,car.route.length);
        if(remaining<0)car.committed=true;
        const passed=signed(car.s-car.lock.release,car.route.length);
        if(passed>0||!car.committed&&(!approachClear(car,car.lock)||!signalAllows(car,car.lock)))release(car);
      }
      let desired=freeRoadSpeed(car,distance=>sampleBase(car,distance),{speedMultiplier:activity?.pace(car)??1}),maxDistance=Infinity;
      car.freeRoadTarget=desired;
      const brake=car.comfortBrake*.65;
      const reservationDistance=Math.max(4.8,car.speed*(.85+brake/(2*car.jerk))+car.speed*car.speed/(2*brake)+2.5);
      const anticipation=Math.max(14,car.speed*3+4,activity?reservationDistance+4:0);
      let leader=null,leaderDistance=Infinity;
      const next=car.turnEvents.map(e=>({e,d:mod(e.stop-car.length/2-car.s,car.route.length)})).sort((a,b)=>a.d-b.d)[0];
      if(next&&activity&&desired>car.cruise){
        // Fast drivers can stretch their legs between blocks. Ease off before
        // reaching the box so a late cross-traffic decision can still be smooth.
        desired=Math.min(desired,Math.sqrt(car.cruise**2+2*brake*Math.max(0,next.d-14)));
      }
      car.indicator=car.lock?.turn||((next&&next.d<12)?next.e.turn:null);
      if(next&&next.d<anticipation&&next.e!==car.lock){
        const{e,d}=next,signalOpen=signalAllows(car,e),permitted=signalOpen&&canReserve(car,e);
        // A short block may expose the next stop bar before our rear clears the
        // previous junction. Anticipate it now; acquire only one junction at a time.
        // A faster approaching car must secure its crossing before it reaches
        // comfortable braking distance. Waiting for the old fixed 4.8-unit
        // threshold let a conflicting movement claim the box too late to stop.
        if(permitted&&d<reservationDistance&&!car.lock){e.j.owners.add(car);car.lock=e;car.committed=false;}
        if(!permitted){const clearance=Math.max(0,d-.12);desired=Math.min(desired,stoppingSpeed(car,clearance));maxDistance=clearance;if(clearance<.03)desired=0;}
      }
      // Compatible leaders form continuous platoons; intersecting paths yield.
      for(const other of cars){
        if(other===car||!other.active||other===car.pass?.leader)continue;const dx=other.p.x-car.p.x,dz=other.p.z-car.p.z,ahead=dx*car.p.dx+dz*car.p.dz,lateral=Math.abs(dx*car.p.dz-dz*car.p.dx),aligned=other.p.dx*car.p.dx+other.p.dz*car.p.dz;
        const bending=!!(car.p.curvature||other.p.curvature);
        // A leader leaving a bend enters the straight following cone gradually.
        // Use chord separation there, rather than a shortened tangent projection,
        // so changing headings cannot suddenly clamp an otherwise safe gap to zero.
        if(ahead>0&&ahead<anticipation&&lateral<(bending?1.6:1.0)&&aligned>.35){const gap=(bending?Math.hypot(dx,dz):ahead)-(car.length+other.length)/2-.72;if(ahead<leaderDistance){leaderDistance=ahead;leader=other;}desired=Math.min(desired,followingSpeed(car,other,gap,aligned));if(gap<.08)desired=0;maxDistance=Math.min(maxDistance,Math.max(0,gap+.2));}
        // Different turn radii briefly take leaders outside the straight-lane
        // cone. Preview both swept paths before a bumper corner reaches ours.
        if(car.speed>.15&&ahead>0&&ahead<9&&lateral<3&&(car.p.curvature||other.p.curvature)){
          for(let time=.5;time<=3.5;time+=.5){
            const future=sampleCar(car,car.s+car.speed*time),otherFuture=sampleCar(other,other.s+other.speed*time);
            if(!clearPose(car,future,{p:otherFuture,length:other.length,width:other.width})){
              desired=Math.min(desired,stoppingSpeed(car,car.speed*time));break;
            }
          }
        }
      }
      // A human restart wave travels back through a stopped queue. Each driver
      // notices the leader moving, waits their own interval, then eases onto the throttle.
      if(car.speed<.06)car.stoppedFor+=dt;else car.stoppedFor=0;
      car.leader=leader;
      if(car.speed<.06&&car.stoppedFor>.2){
        if(desired<.22){car.readyAt=null;car.acceleration=0;desired=0;}
        else{
          if(car.readyAt===null){car.readyAt=elapsed+car.reactionTime;car.reactedToLeaderAt=leader?.departureAt??null;}
          if(elapsed<car.readyAt)desired=0;
          else if(car.departureAt===null||car.departureAt<elapsed-car.reactionTime-.2)car.departureAt=elapsed;
        }
      }
      if(car.speed>.08)car.readyAt=null;
      const target=Math.max(-car.comfortBrake,Math.min(car.maxAcceleration,(desired-car.speed)*1.7));
      car.acceleration+=Math.max(-car.jerk*dt,Math.min(car.jerk*dt,target-car.acceleration));
      const priorSpeed=car.speed;car.speed=Math.max(0,car.speed+car.acceleration*dt);
      if((desired-priorSpeed)*(desired-car.speed)<0){car.speed=desired;car.acceleration=0;}
      let distance=Math.min(car.speed*dt,maxDistance);if(distance<car.speed*dt){car.speed=distance/dt;car.acceleration=Math.min(0,car.acceleration);}
      const pose=sampleCar(car,car.s+distance);
      // Swept small-step bumper clearance also covers curved merging approaches,
      // where a leader can briefly lie outside the straight-lane following cone.
      if(distance>0&&!cars.every(other=>other===car||!other.active||clearPose(car,pose,other))){distance=0;car.speed=0;car.acceleration=0;car.readyAt=null;}
      car.s=mod(car.s+distance,car.route.length);car.distanceTravelled+=distance;car.p=sampleCar(car,car.s);
      updateBrakeLight(car,priorSpeed,dt);
    }
    for(const car of cars){
      car.p=sampleCar(car,car.s);dummy.position.set(car.p.x,.045,car.p.z);dummy.rotation.set(0,Math.atan2(car.p.dx,car.p.dz),0);dummy.scale.setScalar(car.active?1:0);dummy.updateMatrix();baseMatrix.copy(dummy.matrix);
      for(const p of car.parts){
        put(p,baseMatrix);
        if(p.indicatorSide){
          const turn=car.pass?(mod(car.s-car.pass.start,car.route.length)<car.pass.span/2?'left':'right'):car.indicator;
          const on=turn===p.indicatorSide&&elapsed%.9<.45;p.batch.mesh.setColorAt(p.index,color.set(on?'#ff9e13':'#21160a'));
        }else if(p.material==='taillight')p.batch.mesh.setColorAt(p.index,brakeLensColor(color,car));
        else if(p.material==='beaconRed'||p.material==='beaconBlue'){
          const red=p.material==='beaconRed',on=car.pursuitRole==='police'&&patrolFlash(elapsed,red);
          p.batch.mesh.setColorAt(p.index,color.set(on?(red?'#ff3438':'#437dff'):(red?'#540b16':'#1a2860')));
        }
      }
    }
    for(const batch of batches.values())if(batch.dynamic){batch.mesh.instanceMatrix.needsUpdate=true;if(batch.mesh.instanceColor)batch.mesh.instanceColor.needsUpdate=true}
    headlightSpill.update(elapsed,activity?.chase?.officer??null);
  }
  function tryRestore(car){
    for(let k=0;k<1600;k++){
      const s=mod(car.s+k*.73,car.route.length),p=sampleCar(car,s);
      if(junctions.some(j=>Math.hypot(p.x-j.x,p.z-j.z)<7.2)||cars.some(other=>other!==car&&other.active&&Math.hypot(other.p.x-p.x,other.p.z-p.z)<5))continue;
      car.s=s;car.p=p;car.active=true;car.speed=0;car.acceleration=0;car.readyAt=null;car.stoppedFor=1;car.departureAt=null;return true;
    }
    return false;
  }
  function setStadium(value){
    stadiumEnabled=!!value;
    for(const car of cars){
      car.requireStadiumClear=stadiumEnabled;
      if(stadiumEnabled&&!car.route.stadiumClear){release(car);car.pass=null;car.active=false;car.speed=0;car.acceleration=0;car.readyAt=null;car.indicator=null;}
      else if(!stadiumEnabled&&!car.active)tryRestore(car);
    }
    update(0);
  }
  function setNight(value){materials.headlight.emissiveIntensity=value?3:.7;materials.taillight.emissiveIntensity=value?2:.5;materials.fleetPaint.emissiveIntensity=value?.075:0;signals.setNight(value);signals.update(elapsed);headlightSpill.setNight(value);}
  update(0);
  return{update,setNight,setStadium,setQuality:headlightSpill.setQuality,headlightSpill,group,signals,controller,cars,junctions,routes,sampleCar,activity,get elapsed(){return elapsed}};
}
