// Detector-actuated two-phase control, adapted to this miniature's speeds and
// block lengths. Yellow and all-red clearance are never shortened by demand.
export const SIGNAL_TIMING=Object.freeze({minGreen:7,maxGreen:30,yellow:3,clearance:3,passage:2.6,maxWait:34});
const other=axis=>axis==='x'?'z':'x';
export function createActuatedController(options={}){
 const timing={...SIGNAL_TIMING,...options};
 let axis='z',stage='green',age=0,time=0,gap=timing.passage,budget=timing.minGreen,reason='initial';
 const waits={x:0,z:0},history=[],detectors={x:{},z:{}};
 const count=v=>Number.isFinite(v)?Math.max(0,v):0;
 function transition(next,why){
  history.push({time,axis,from:stage,to:next,duration:age,reason:why});if(history.length>64)history.shift();
  stage=next;age=0;reason=why;
  if(next==='green'){axis=other(axis);waits[axis]=0;gap=timing.passage;budget=Math.min(timing.maxGreen,timing.minGreen+detectors[axis].queued*2.1);}
 }
 function phase(direction){
  const active=axis===direction;
  const color=active&&stage==='green'?'green':active&&stage==='yellow'?'yellow':'red';
  const remaining=color==='yellow'?Math.max(0,timing.yellow-age):color==='green'?Math.max(0,timing.maxGreen-age):stage==='clearance'?Math.max(0,timing.clearance-age):timing.minGreen;
  return{color,remaining};
 }
 function update(dt,demand={}){
  if(!(dt>0))return;
  for(const a of['x','z']){
   const d=demand[a]||{};
   detectors[a]={approaching:count(d.approaching),queued:count(d.queued),present:!!d.present,blocked:!!d.blocked};
   if(stage==='green'&&axis===a||!detectors[a].approaching)waits[a]=0;else waits[a]+=dt;
  }
  time+=dt;age+=dt;
  if(stage==='yellow'){if(age+1e-8>=timing.yellow)transition('clearance','yellow complete');return;}
  if(stage==='clearance'){
   // A slow turning truck may still occupy the box after nominal clearance.
   if(age+1e-8>=timing.clearance&&!demand.occupied)transition('green','intersection clear');return;
  }
  const mine=detectors[axis],cross=detectors[other(axis)];
  const gapLimit=timing.passage-Math.min(.8,waits[other(axis)]*.025);
  gap=mine.present&&!mine.blocked?gapLimit:Math.max(0,gap-dt);
  if(age+1e-8<timing.minGreen||!cross.approaching)return;
  // Rest on the current green if all exits on the crossing approach are blocked.
  // Do not abandon useful flow just to feed a downstream queue.
  if(cross.blocked&&!mine.blocked)return;
  if(waits[other(axis)]>=timing.maxWait){transition('yellow','waiting-road priority');return;}
  if(age>=timing.maxGreen){transition('yellow','maximum green');return;}
  if(mine.blocked&&!cross.blocked){transition('yellow','blocked exit');return;}
  if(gap<=1e-8){transition('yellow','gap out');return;}
  const pressure=d=>d.queued*2+d.approaching*.4;
  if(age>=Math.max(timing.minGreen+3,budget)&&pressure(cross)>pressure(mine)*1.35+2)transition('yellow','queue balance');
 }
 return{update,phase,timing,history,detectors,get state(){return{axis,stage,age,time,gap,budget,reason,waits:{...waits}};}};
}
