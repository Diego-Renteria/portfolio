/** Small deterministic leaf simulation, independent of rendering and wall-clock time. */
export function createLeafFall({sources, surfaceHeight, random=Math.random, count=240}){
  if(!sources.length)return{particles:[],update(){},setRain(){},stats:{landings:0,respawns:0}};
  let raining=false;
  const stats={landings:0,respawns:0};
  const particles=Array.from({length:count},()=>({stage:'waiting',timer:random()*18,opacity:0,x:0,y:0,z:0,rx:0,ry:0,rz:0,size:.1}));
  function detach(p){
    const s=sources[Math.floor(random()*sources.length)];
    Object.assign(p,{stage:'attached',timer:0,x:s.x,y:s.y,z:s.z,originY:s.y,
      color:s.color,axis:s.axis||'z',size:.075+random()*.075,phase:random()*Math.PI*2,
      vx:0,vy:0,vz:0,rx:random()*6.28,ry:random()*6.28,rz:random()*6.28,
      yaw:random()*6.28,spin:(random()>.5?1:-1)*(.8+random()*.7),opacity:0,age:0,wet:raining?.55:0});
    stats.respawns++;
  }
  function step(p,dt){
    p.timer+=dt;
    if(p.stage==='waiting'){if(p.timer>18)detach(p);return;}
    if(p.stage==='attached'){
      p.opacity=Math.min(1,p.timer/.65);
      if(p.timer>.8){p.stage='falling';p.timer=0;}
      return;
    }
    if(p.stage==='falling'){
      p.age+=dt;
      // Drag produces a terminal descent; a tumbling leaf never drops like a stone.
      const flutter=Math.sin(p.age*3.7+p.phase)*(raining?.48:1);
      p.vy+=(-(raining?.98:.72)-p.vy*1.7)*dt;
      const along=(.12+Math.sin(p.age*.7+p.phase)*.08)*(raining?.72:1);
      const across=flutter*.10;
      const targetX=p.axis==='x'?along:across,targetZ=p.axis==='z'?along:across;
      p.vx+=(targetX-p.vx)*dt*2.1;p.vz+=(targetZ-p.vz)*dt*2.1;
      p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=(p.vy+flutter*.045)*dt;
      p.rx+=p.spin*dt*(raining?.65:1);p.ry+=.55*dt*(raining?.65:1);p.rz+=Math.cos(p.age*2+p.phase)*dt*(raining?.6:1);
      const contact=surfaceHeight(p.x,p.z)+clearance(p);
      if(p.y<=contact){
        p.y=contact;p.stage='settling';p.timer=0;
        // Choose the nearest equivalent angles so contact is a short settling roll.
        p.startRx=-Math.PI/2+Math.atan2(Math.sin(p.rx+Math.PI/2),Math.cos(p.rx+Math.PI/2));
        p.startRy=Math.atan2(Math.sin(p.ry),Math.cos(p.ry));
        p.startRz=p.yaw+Math.atan2(Math.sin(p.rz-p.yaw),Math.cos(p.rz-p.yaw));
        p.vx*=raining?.035:.2;p.vz*=raining?.035:.2;p.wet=raining?1:0;stats.landings++;
      }
      return;
    }
    if(p.stage==='settling'){
      const a=Math.min(1,p.timer/(raining?.28:.45)),ease=a*a*(3-2*a);
      p.rx=p.startRx+(-Math.PI/2-p.startRx)*ease;
      p.ry=p.startRy*(1-ease);p.rz=p.startRz+(p.yaw-p.startRz)*ease;
      p.x+=p.vx*dt*(1-a);p.z+=p.vz*dt*(1-a);
      p.y=surfaceHeight(p.x,p.z)+clearance(p);
      if(a===1){p.stage='resting';p.timer=0;p.rx=-Math.PI/2;p.ry=0;p.rz=p.yaw;p.restFor=2.5+random()*3.5;}
      return;
    }
    if(p.stage==='resting'){if(p.timer>p.restFor*(raining?2.8:1)){p.stage='fading';p.timer=0;}return;}
    if(p.stage==='fading'){
      p.opacity=Math.max(0,1-p.timer/1.5);
      if(p.timer>=1.5){p.stage='waiting';p.timer=17+random();p.opacity=0;}
    }
  }
  function update(dt){
    if(!(dt>0))return;
    let left=Math.min(dt,.12);
    while(left>0){const d=Math.min(.025,left);for(const p of particles)step(p,d);left-=d;}
  }
  function clearance(p){return p.size*(raining?.06:.075)+(raining?.002:.003);}
  function setRain(enabled){
    raining=!!enabled;
    for(const p of particles){
      const grounded=p.stage==='settling'||p.stage==='resting'||p.stage==='fading';
      p.wet=raining?(grounded?1:.55):0;
      if(grounded){p.y=surfaceHeight(p.x,p.z)+clearance(p);if(raining){p.vx=0;p.vz=0;}}
    }
  }
  // Different initial delays yield a continuous stream instead of a synchronized shower.
  for(let t=0;t<24;t+=.1)update(.1);
  return{particles,update,setRain,stats};
}
