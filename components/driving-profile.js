import {heavyModel,sportModel} from './traffic-activity.js?v=city-traffic-1';

// Road-dependent preferred speed, not an animation speed or per-frame noise.
// The following/stop controller still has final authority over this free-road cap.
export function driverProfile(model,variation){
 const heavy=heavyModel(model),sport=sportModel(model);
 const pace=heavy?.87:sport?1.08:model==='suv-luxury'?.96:1;
 return{cruise:(3.5+variation*.65)*pace,throttle:heavy?.82:sport?1.06:1};
}
export function freeRoadSpeed(car,sample,{lateralAcceleration=2.15,bendThreshold=.045,speedMultiplier=1}={}){
 const horizon=32,brake=car.comfortBrake*.65;
 const cruise=car.cruise*speedMultiplier;
 let runway=horizon,cornerCap=cruise;
 for(let ahead=0;ahead<=horizon;ahead+=2){
  const bend=Math.abs(sample(car.s+ahead).curvature);
  if(bend>bendThreshold)runway=Math.min(runway,ahead);
  if(bend>.001){
   const corner=Math.sqrt(lateralAcceleration/bend)*(car.turnPace??1);
   // Anticipate bends with gradual braking and room for changing pedal pressure.
   cornerCap=Math.min(cornerCap,Math.sqrt(corner*corner+2*brake*Math.max(0,ahead-3.5)));
  }
 }
 const t=Math.max(0,Math.min(1,(runway-4)/24)),openRoad=t*t*(3-2*t);
 return Math.min(cruise*(.70+.30*openRoad),cornerCap);
}
