const loopDistance=(from,to,length)=>((to-from)%length+length)%length;
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export const policeModel=model=>model==='police'||model.startsWith('patrol-');
export const sportModel=model=>model.includes('sports')||['street-coupe','open-roadster','classic-muscle'].includes(model);
export const heavyModel=model=>['truck','delivery','van','work-pickup','parcel-van','service-truck','city-ambulance','city-firetruck'].includes(model);
export function patrolFlash(elapsed,red){
  const phase=(elapsed+(red?0:.56))%1.12;
  return phase<.12||phase>=.22&&phase<.34;
}

export function personalityFor(model,variation){
  if(policeModel(model))return {name:'patrol',pace:1,reaction:.84,turn:1};
  if(heavyModel(model))return {name:'service',pace:.96,reaction:1.13,turn:.98};
  if(sportModel(model)&&variation>.70)return {name:'reckless',pace:1.12,reaction:.75,turn:1.07};
  if(variation<.22)return {name:'cautious',pace:.88,reaction:1.20,turn:.98};
  if(variation>.72)return {name:'impatient',pace:1.05,reaction:.88,turn:1.03};
  return {name:'steady',pace:1,reaction:1,turn:1};
}

export function samplePassingPose(pose,distance,pass,routeLength){
  if(!pass)return pose;
  const d=loopDistance(pass.start,distance,routeLength);
  if(d>=pass.span)return pose;
  const ramp=pass.ramp;
  const t=clamp(Math.min(d,pass.span-d)/ramp,0,1);
  const lane=pass.lane*t*t*(3-2*t);
  const slope=pass.lane*6*t*(1-t)/ramp*(d<pass.span/2?1:-1);
  const norm=Math.hypot(1,slope);
  return {...pose,x:pose.x+pose.dz*lane,z:pose.z-pose.dx*lane,
    dx:(pose.dx+pose.dz*slope)/norm,dz:(pose.dz-pose.dx*slope)/norm};
}

export function createTrafficActivity({cars,routes,random,sampleBase,hasRoom,isVisible=()=>true,quickStart=false}){
  let chase=null,nextChase=quickStart?1.5:8+random()*8,nextDecision=.55,nextPass=5,localRequested=false;
  const stats={chases:0,finished:0,passes:0,wrongWayRuns:0,reroutes:0};
  let cursor=0;
  const nextStop=(car,s=car.s,route=car.route)=>
    Math.min(...route.events.map(event=>loopDistance(s,event.stop-car.length/2,route.length)));

  function turnAside(car,partner,elapsed){
    if(car.lock||car.pass||car.p.curvature||nextStop(car)<7||partner&&(partner.lock||partner.pass||partner.p.curvature))return;
    const old=sampleBase(car,car.s+33);
    const options=routes.flatMap(route=>{
      if(route===car.route||car.requireStadiumClear&&!route.stadiumClear)return [];
      const s=route.locate(car.p);
      const partnerS=partner?route.locate(partner.p):null;
      if(s===null||nextStop(car,s,route)<7||partner&&(partnerS===null||nextStop(partner,partnerS,route)<7))return [];
      const ahead=route.sample(s+33);
      if(Math.hypot(ahead.x-old.x,ahead.z-old.z)<=5)return [];
      const density=cars.filter(other=>other.active&&Math.hypot(other.p.x-ahead.x,other.p.z-ahead.z)<11).length;
      return [{route,s,partnerS,score:random()*(partner?4:2)-density}];
    });
    if(!options.length)return;
    const choice=options.sort((a,b)=>b.score-a.score)[0];
    Object.assign(car,{route:choice.route,s:choice.s,turnRoute:null,nextRouteChoice:elapsed+23});
    if(partner)Object.assign(partner,{route:choice.route,s:choice.partnerS,turnRoute:null});
    stats.reroutes++;
  }

  function startChase(elapsed){
    let selected=null,best=-Infinity;
    if(localRequested){
      const suspect=cars.find(car=>car.active&&sportModel(car.model)&&!car.lock&&!car.pass);
      const officer=cars.find(car=>car.active&&policeModel(car.model)&&!car.lock&&!car.pass);
      if(!suspect||!officer)return;
      const clear=pose=>cars.every(car=>!car.active||car===suspect||car===officer||Math.hypot(car.p.x-pose.x,car.p.z-pose.z)>4.5);
      for(const route of routes){
        if((officer.requireStadiumClear||suspect.requireStadiumClear)&&!route.stadiumClear)continue;
        for(let s=0;s<route.length;s+=1.5){
          const pose=route.sample(s),officerS=loopDistance(10,s,route.length),tail=route.sample(officerS);
          if(Math.abs(pose.z-22)>3.8||Math.abs(tail.z-22)>3.8||Math.abs(pose.x)>19||Math.abs(tail.x)>21||
            pose.curvature||tail.curvature||Math.abs(pose.dx)<.85||Math.abs(tail.dx)<.85||!clear(pose)||!clear(tail))continue;
          const score=16-Math.abs(pose.x)*.23-Math.abs(tail.x)*.18+random()*.6;
          if(score>best){best=score;selected={suspect,officer,officerS,s,route};}
        }
      }
      if(!selected)return;
      Object.assign(suspect,{route:selected.route,s:selected.s,turnRoute:null,speed:2.8,p:sampleBase({...suspect,route:selected.route,turnRoute:null},selected.s)});
      Object.assign(officer,{route:selected.route,s:selected.officerS,turnRoute:null,speed:2.9,p:sampleBase({...officer,route:selected.route,turnRoute:null},selected.officerS)});
      localRequested=false;
    }
    if(!selected)
    for(const suspect of cars){
      if(!suspect.active||!sportModel(suspect.model)||suspect.pass)continue;
      for(const officer of cars){
        if(!officer.active||!policeModel(officer.model)||officer.pass||officer.requireStadiumClear&&!suspect.route.stadiumClear)continue;
        const sameRoute=officer.route===suspect.route;
        const officerS=sameRoute?officer.s:suspect.route.locate(officer.p);
        if(officerS===null||!sameRoute&&(officer.lock||officer.p.curvature||nextStop(officer,officerS,suspect.route)<7))continue;
        const gap=loopDistance(officerS,suspect.s,suspect.route.length);
        if(gap<7||gap>35)continue;
        const score=(isVisible(suspect)?12:0)+(isVisible(officer)?6:0)-Math.abs(gap-13)*.65-
          Math.hypot(suspect.p.x,suspect.p.z-22)*.044+(suspect.speed+officer.speed)*.65+random()*3;
        if(score>best){best=score;selected={suspect,officer,officerS};}
      }
    }
    if(!selected)return;
    const {suspect,officer,officerS}=selected;
    if(officer.route!==suspect.route)Object.assign(officer,{route:suspect.route,s:officerS,turnRoute:null});
    chase={suspect,officer,started:elapsed,expires:elapsed+31+random()*11,seen:false,startDistance:suspect.distanceTravelled};
    suspect.pursuitRole='suspect';
    suspect.nextRouteChoice=elapsed+3;
    officer.pursuitRole='police';
    stats.chases++;
  }

  function finishChase(elapsed){
    chase.suspect.pursuitRole=null;
    chase.officer.pursuitRole=null;
    chase=null;
    nextChase=elapsed+45+random()*44;
    stats.finished++;
  }

  function tryPass(car,swerve=false){
    if(car.pass||car.lock||car.p.curvature||car.speed<(swerve?2.05:1.1))return false;
    const leader=swerve?null:car.leader;
    const {dx,dz,x,z}=car.p;
    const span=Math.min(swerve?14:19,nextStop(car)-2.3),plannedSpeed=Math.max(3.1,car.speed+1.4);
    if(span<(swerve?9:9.6))return false;
    if(!swerve){
      if(!leader?.active||leader.pass||leader.p.curvature||leader.speed>2.7)return false;
      const xGap=leader.p.x-x,zGap=leader.p.z-z;
      const gap=xGap*dx+zGap*dz;
      if(gap<3.15||gap>8||Math.abs(xGap*dz-zGap*dx)>.3||leader.p.dx*dx+leader.p.dz*dz<.99)return false;
      if(span*(1-leader.speed/plannedSpeed)<gap+(car.length+leader.length)/2+.55)return false;
    }
    const end=sampleBase(car,car.s+span);
    if(end.curvature||end.dx*dx+end.dz*dz<.999)return false;
    const pass={start:car.s,span,ramp:Math.min(3.3,span*.28),lane:2,leader};
    for(const other of cars){
      if(!other.active||other===car)continue;
      const ox=other.p.x-x,oz=other.p.z-z;
      const ahead=ox*dx+oz*dz,lateral=ox*dz-oz*dx;
      if(ahead<-5||ahead>span+16||Math.abs(lateral)>3.7)continue;
      // Look for the nearest oncoming car, then preview the full maneuver and its return gap.
      if(lateral>.9&&ahead>0&&ahead<span+other.speed*2.1+3&&other.p.dx*dx+other.p.dz*dz<-.55)return false;
      for(let d=1;d<=span;d+=.75){
        const t=d/plannedSpeed,distance=car.s+d;
        const pose=samplePassingPose(sampleBase(car,distance),distance,pass,car.route.length);
        const forecast=sampleBase(other,other.s+other.speed*t);
        if(!hasRoom(car,pose,{length:other.length+.35,width:other.width+.12,p:forecast}))return false;
      }
    }
    car.pass=pass;
    stats[swerve?'wrongWayRuns':'passes']++;
    return true;
  }

  function update(elapsed){
    for(const car of cars){
      if(car.pass&&(!car.active||loopDistance(car.pass.start,car.s,car.route.length)>=car.pass.span))car.pass=null;
    }
    if(chase){
      const {suspect,officer,started,startDistance,expires}=chase;
      const visible=isVisible(suspect)||isVisible(officer);
      chase.seen||=visible;
      const departed=chase.seen&&!visible&&suspect.distanceTravelled-startDistance>36;
      if(!suspect.active||!officer.active||elapsed>=expires||elapsed-started>12&&departed)finishChase(elapsed);
    }
    if(elapsed<nextDecision)return;
    nextDecision=elapsed+.4;
    if(!chase&&elapsed>=nextChase)startChase(elapsed);
    if(chase&&elapsed-chase.started>3&&elapsed-chase.started<16&&chase.suspect.nextRouteChoice<elapsed){
      turnAside(chase.suspect,chase.officer,elapsed);
    }
    for(let i=0;i<6;i++){
      const driver=cars[cursor++%cars.length];
      const changesRoute=driver?.personality==='impatient'||driver?.personality==='reckless';
      if(changesRoute&&driver.active&&!driver.pursuitRole&&driver.nextRouteChoice<elapsed&&driver.speed>.9){
        driver.nextRouteChoice=elapsed+16+random()*12;
        turnAside(driver,null,elapsed);
      }
    }
    if(elapsed<nextPass)return;
    const reckless=cars.filter(car=>car.active&&(car.personality==='reckless'||car.pursuitRole==='suspect'));
    if(!reckless.length)return;
    const start=Math.floor(random()*reckless.length);
    const candidates=[...reckless.slice(start),...reckless.slice(0,start)];
    const visible=[],offscreen=[];
    for(const car of candidates)(isVisible(car)?visible:offscreen).push(car);
    const suspect=chase?.suspect;
    if(suspect&&(tryPass(suspect)||tryPass(suspect,true))){
      nextPass=elapsed+6+random()*6;
      return;
    }
    for(const car of [...visible,...offscreen]){
      if(tryPass(car)||tryPass(car,true)){
        nextPass=elapsed+7+random()*9;
        break;
      }
    }
  }

  function pace(car){
    if(car.pursuitRole==='suspect')return car.pass?.leader?1.67:1.48;
    if(car.pursuitRole==='police'){
      const gap=loopDistance(car.s,chase.suspect.s,car.route.length);
      return clamp(1.03+(gap-5)*.040,1.03,1.57);
    }
    return car.pass?.leader?1.44:car.pass?1.12:1;
  }

  return {update,pace,stats,requestPursuit(){if(chase)finishChase(nextDecision);localRequested=true;nextChase=0;},get chase(){return chase;}};
}
