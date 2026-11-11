import {defaultApartmentLighting,validateApartmentLighting,LIGHTING_STORAGE_KEY} from './apartment-lighting-settings.js?v=b477ce33502c';

export function createApartmentLighting(group){
  const lights=[],materials=[],seen=new Set();let preset=defaultApartmentLighting(),night=false;
  group.traverse(o=>{
    if(o.isPointLight&&o.userData.apartmentLight){lights.push({light:o,base:o.intensity,...o.userData.apartmentLight});}
    if(o.isMesh)for(const material of Array.isArray(o.material)?o.material:[o.material]){
      const source=material.userData.apartmentLight;if(!source||seen.has(material))continue;seen.add(material);
      materials.push({material,base:material.emissiveIntensity??1,wash:!!material.uniforms?.tint,...source});
    }
  });
  function apply(){
    for(const {light,base,floor,role}of lights){const s=preset.floors[floor][role];light.color.set(s.color);light.intensity=base*s.brightness*(night?1:.22);}
    for(const {material,base,wash,floor,role}of materials){
      const s=preset.floors[floor][role];
      if(wash){material.uniforms.tint.value.set(s.color);material.uniforms.strength.value=.24*s.brightness;}
      else{material.color.set(s.color);material.emissive?.set(s.color);material.emissiveIntensity=base*s.brightness*(night?1.8:.65);}
    }
  }
  apply();return{lights,materials,get preset(){return structuredClone(preset);},setPreset(value){preset=validateApartmentLighting(value);apply();},setNight(value){night=!!value;apply();}};
}

// A local studio can preview changes without publishing its controls. Messages
// are accepted only from this exact loopback tool, never from arbitrary websites.
export async function mountApartmentLighting(controller,{window:win=window,fetch:fetcher=fetch,onPreview=()=>{}}={}){
  let saved=null;try{saved=validateApartmentLighting(JSON.parse(win.localStorage.getItem(LIGHTING_STORAGE_KEY)));}catch{}
  try{const response=await fetcher('./apartment-lighting.json',{cache:'no-store'});if(response.ok)controller.setPreset(await response.json());}catch{}
  if(saved)controller.setPreset(saved);
  // An explicit local-studio preview link also works when the host isolates
  // windows and removes window.opener. Fragments never reach the web server.
  try{
    const encoded=new URLSearchParams(win.location?.hash?.slice(1)||'').get('apartment-lighting');
    if(encoded){const preset=validateApartmentLighting(JSON.parse(encoded));controller.setPreset(preset);try{win.localStorage.setItem(LIGHTING_STORAGE_KEY,JSON.stringify(preset));}catch{}
      const requested=new URLSearchParams(win.location.search).get('atmosphere');onPreview({atmosphere:['sky','night','rain'].includes(requested)?requested:'night'});
      win.history?.replaceState(null,'',win.location.pathname+win.location.search);
    }
  }catch{}
  const allowed=new Set(['http://127.0.0.1:5177','http://localhost:5177']);
  function receive(event){
    if(!allowed.has(event.origin)||event.source!==win.parent&&event.source!==win.opener||event.source===win)return;
    const data=event.data;if(data?.type!=='diego:apartment-lighting')return;
    try{const preset=validateApartmentLighting(data.preset);controller.setPreset(preset);
      if(data.preview&&['sky','night','rain'].includes(data.preview.atmosphere))onPreview(data.preview);
      if(data.save){try{win.localStorage.setItem(LIGHTING_STORAGE_KEY,JSON.stringify(preset));}catch{}}
      event.source.postMessage({type:'diego:apartment-lighting:applied',saved:!!data.save},event.origin);
    }catch{}
  }
  win.addEventListener('message',receive);
  // Readiness carries no preset or personal data; the recipient validates its
  // sender before the studio transmits any settings with a specific target origin.
  const ready=()=>{for(const target of new Set([win.parent,win.opener]))if(target&&target!==win)target.postMessage({type:'diego:apartment-lighting:ready'},'*');};
  ready();return()=>win.removeEventListener('message',receive);
}
