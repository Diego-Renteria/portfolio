import {carKit} from '../assets/vehicles/car-kit-data.js?v=b477ce33502c';
// Every body, cabin and wheel is authored CC0 Kenney Car Kit geometry.
// Small additive lamp lenses support nighttime lights and working turn indicators.
export function createVehicleLibrary(T){
  const box=new T.BoxGeometry(1,1,1),cache=new Map();
  const names=['sedan','hatchback-sports','truck','delivery','sedan-sports','suv-luxury','police','taxi','van'];
  function geometry(key,data){
    if(cache.has(key))return cache.get(key);
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(data.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(data.n,3));
    g.setAttribute('color',new T.Float32BufferAttribute(data.c,3));g.setIndex(data.i);g.computeBoundingSphere();cache.set(key,g);return g;
  }
  function vehicle(type,paint='paint0'){
    const name=typeof type==='string'?type:names[((type%names.length)+names.length)%names.length],source=carKit[name];
    if(!source)throw new Error('No authored vehicle asset: '+name);
    const parts=[],indicators=[],{length,width,height}=source;
    for(const[category,data]of Object.entries(source.parts))parts.push({geo:geometry(name+category,data),material:category==='paint'?paint:category==='glass'?'glass':'assetDetails',position:[0,0,0],scale:[1,1,1],rotation:[0,0,0],sourceAsset:name});
    for(const side of[-1,1])for(const front of[-1,1]){
      parts.push({geo:box,material:front>0?'headlight':'taillight',position:[side*.32,.36,front*(length/2+.018)],scale:[.19,.055,.025],rotation:[0,0,0]});
      const p={geo:box,material:'indicator',position:[side*width*.38,.38,front*(length/2+.026)],scale:[.055,.032,.014],rotation:[0,0,0],indicatorSide:side>0?'left':'right'};
      parts.push(p);indicators.push(p);
    }
    return{parts,length:length+.05,width:width+.08,height,model:name,indicators};
  }
  return{vehicle,specs:names.map(name=>({name}))};
}
