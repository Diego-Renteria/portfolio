// Shared by the city and the local-only lighting studio. No editing UI is shipped here.
export const APARTMENT_LIGHT_SCENES=[
  {name:'Amber evening',key:'#ffac50',accent:'#ff6625',strip:'#d87825',power:5.4},
  {name:'Violet sunset',key:'#c052ff',accent:'#ff791b',strip:'#db4aaf',power:6.3},
  {name:'Warm reading',key:'#ffc878',accent:'#ff9240',strip:'#e7a34b',power:5.8},
  {name:'Blue hour',key:'#397dff',accent:'#24becd',strip:'#456fe3',power:6.7},
  {name:'Forest retreat',key:'#9cbf76',accent:'#e2a153',strip:'#769b68',power:5.2},
  {name:'Midnight plum',key:'#8854ed',accent:'#e4498e',strip:'#7841b9',power:5.6}
];
export const LIGHT_ROLES=['key','accent','strip'];
export const LIGHTING_STORAGE_KEY='diego-apartment-lighting-v1';
export function defaultApartmentLighting(){return{version:1,floors:APARTMENT_LIGHT_SCENES.map(s=>Object.fromEntries(LIGHT_ROLES.map(role=>[role,{color:s[role],brightness:1}])))};}
export function validateApartmentLighting(value){
  if(value?.version!==1||!Array.isArray(value.floors)||value.floors.length!==6)throw new Error('A lighting preset must contain all six floors.');
  return{version:1,floors:value.floors.map((floor,i)=>Object.fromEntries(LIGHT_ROLES.map(role=>{
    const source=floor?.[role];if(!/^#[0-9a-f]{6}$/i.test(source?.color??'')||typeof source.brightness!=='number'||!Number.isFinite(source.brightness)||source.brightness<0||source.brightness>2)throw new Error(`Invalid ${role} light on floor ${i+1}.`);
    return[role,{color:source.color.toLowerCase(),brightness:source.brightness}];
  })))};
}
export function sameApartmentLighting(a,b){return JSON.stringify(validateApartmentLighting(a))===JSON.stringify(validateApartmentLighting(b));}
