import {detailKit} from './detail-kit.js?v=b477ce33502c';

// Architecture stretches to its new lot; furniture is grouped around functional
// anchors and translated into that plan without stretching its dimensions.
export const DESTINATIONS={
  projects:{oldX:-12,x:-17.1,sx:7.5/4.9,sy:1.08,sz:12.5/6},
  about:{oldX:-5.8,x:-8.3,sx:7.5/6.3,sy:1,sz:12.5/9.5},
  lately:{oldX:5.8,x:8.3,sx:7.5/4.9,sy:1.08,sz:12.5/6},
  music:{oldX:12,x:17.1,sx:7.5/4.9,sy:1.08,sz:12.5/6}
};
export function projectInterior(id,x,y,z){const s=DESTINATIONS[id],front=id==='about'?12.5:12.5;return[s.x+(x-s.oldX)*s.sx,y*s.sy,17+(z-front)*s.sz];}
export function layoutKit(ctx,parent,name,id){
  const raw=detailKit(ctx,parent,name),s=DESTINATIONS[id];let anchor=null;
  const project=(x,y,z)=>{
    if(!anchor)return projectInterior(id,x,y,z);
    const a=projectInterior(id,...anchor);return[a[0]+x-anchor[0],a[1]+y-anchor[1],a[2]+z-anchor[2]];
  };
  const api={...raw,project,getZone(){return anchor?.slice();},setZone(x,y,z){anchor=[x,y,z];},clearZone(){anchor=null;},zoneProject(){const saved=anchor?.slice();return(a,b,c)=>{if(!saved)return projectInterior(id,a,b,c);const q=projectInterior(id,...saved);return[q[0]+a-saved[0],q[1]+b-saved[1],q[2]+c-saved[2]];}}};
  for(const name of['box','soft','round'])api[name]=(w,h,d,c,x,y,z,r)=>raw[name](w*(anchor?1:s.sx),h*(anchor?1:s.sy),d*(anchor?1:s.sz),c,...project(x,y,z),r);
  api.cyl=(r,h,c,x,y,z,rot)=>raw.cyl(r,h,c,...project(x,y,z),rot);
  api.put=(kind,w,h,d,c,x,y,z,r)=>raw.put(kind,w,h,d,c,...project(x,y,z),r);
  api.rod=(a,b,r,c)=>raw.rod(project(...a),project(...b),r,c);
  api.chair=(x,y,z,c,yaw)=>raw.chair(...project(x,y,z),c,yaw);
  api.plant=(x,y,z,scale)=>raw.plant(...project(x,y,z),scale);
  api.lamp=(x,y,z,h,c)=>raw.lamp(...project(x,y,z),h,c);
  api.label=(text,w,h,x,y,z,bg,fg)=>ctx.label?.(text,w,h,...project(x,y,z),bg,fg,raw.group);
  return api;
}
