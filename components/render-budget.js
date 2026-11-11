// Original browser rendering policy. No game engine code or assets are used.
export const renderProfiles=Object.freeze({
  high:Object.freeze({pixelRatioCap:1.75,shadowSize:2048}),
  balanced:Object.freeze({pixelRatioCap:1.35,shadowSize:1024}),
  low:Object.freeze({pixelRatioCap:1,shadowSize:1024})
});
const tiers=Object.keys(renderProfiles);

/** Wait for sustained evidence before changing quality; ignore hidden tabs and camera moves. */
export function createRenderBudget({onChange=()=>{},fixed=null}={}){
  const locked=Object.hasOwn(renderProfiles,fixed);
  let index=locked?tiers.indexOf(fixed):0,windowMs=0,frames=0,slow=0,fast=0,eligibleAt=6000,averageMs=0;
  const clear=()=>{windowMs=0;frames=0;slow=0;fast=0;};
  function sample(frameMs,now,active=true){
    if(locked)return;
    if(!active||!Number.isFinite(frameMs)||frameMs<=0||frameMs>250){clear();eligibleAt=Math.max(eligibleAt,now+2000);return;}
    if(now<eligibleAt)return;
    windowMs+=frameMs;frames++;
    if(windowMs<3000)return;
    averageMs=windowMs/frames;windowMs=0;frames=0;
    slow=averageMs>36?slow+1:0;
    fast=averageMs<20?fast+1:0;
    const next=slow>=2?Math.min(index+1,tiers.length-1):fast>=5?Math.max(index-1,0):index;
    if(next!==index){index=next;clear();eligibleAt=now+10000;onChange(tiers[index],renderProfiles[tiers[index]]);}
  }
  return{sample,get mode(){return tiers[index];},get averageMs(){return averageMs;},get profile(){return renderProfiles[tiers[index]];}};
}
