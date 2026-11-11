import {CITY_EDITIONS,makeCityLayout} from './city-layouts.js?v=b477ce33502c';
import {buildDistrictRealm} from './district-realm.js?v=b477ce33502c';
import {buildHarborArchitecture} from './district-harbor.js?v=b477ce33502c';
import {buildFoundryArchitecture} from './district-foundry.js?v=b477ce33502c';
import {buildGardenArchitecture} from './district-garden.js?v=b477ce33502c';
import {buildTraffic} from './traffic.js?v=b477ce33502c';
import {buildHarborWheel} from './harbor-wheel.js?v=b477ce33502c';
import {buildBoulevardTraffic} from './district-boulevard-traffic.js?v=b477ce33502c';

/** Lazy alternatives reuse the portfolio, floating geology and captured room atlas. */
export function createCityEditions(ctx,{originalGroups,originalSystems,furnishedCity}){
 const cache=new Map();let activeId='original',mood='sky',quality='high',view='overview';
 function select(id){
  if(!CITY_EDITIONS[id])id='original';
  if(id!=='original'&&!cache.has(id)){
   const group=new ctx.THREE.Group();group.name=CITY_EDITIONS[id].name+' / entire district';ctx.world.add(group);const local={...ctx,world:group},layout=makeCityLayout(id);
   if(id==='garden')layout.parcels=layout.parcels.filter(p=>Math.abs(p.x-65)>p.w/2+8||Math.abs(p.z+66)>p.d/2+8);
   if(id==='foundry'){const p=layout.parcels.find(p=>p.z<-30&&p.x>27&&p.x<60);if(p){p.kind='landmark';p.h=81;}}
   const architecture=({harbor:buildHarborArchitecture,foundry:buildFoundryArchitecture,garden:buildGardenArchitecture})[id](local,layout.parcels),realm=buildDistrictRealm(local,layout),traffic=buildTraffic(local,layout);
   const boulevardTraffic=buildBoulevardTraffic(local,layout);
   const entry={group,layout,architecture,realm,traffic,boulevardTraffic,systems:[architecture,realm,traffic,boulevardTraffic]};if(id==='harbor')entry.systems.push(buildHarborWheel(local));cache.set(id,entry);furnishedCity.registerArchitecture(architecture);
  }
  activeId=id;for(const g of originalGroups)g.visible=id==='original';for(const[key,c]of cache)c.group.visible=key===id;
  const c=cache.get(id);if(c)for(const s of c.systems){s.setNight?.(mood!=='sky');s.setAtmosphere?.(mood);s.setQuality?.(quality,view);}
  return c||null;
 }
 return{get id(){return activeId;},get active(){return cache.get(activeId);},get editions(){return CITY_EDITIONS;},get cache(){return cache;},select,isOriginalSystem:s=>originalSystems.includes(s),setNight(value){for(const c of cache.values())for(const s of c.systems)s.setNight?.(value);},setAtmosphere(value){mood=value;for(const c of cache.values())c.realm.setAtmosphere(value);},setQuality(mode,currentView){quality=mode;view=currentView;for(const s of cache.get(activeId)?.systems||[])s.setQuality?.(mode,currentView);},update(dt,time){for(const s of cache.get(activeId)?.systems||[])s.update?.(dt,time);}};
}
