import {carKit} from '../assets/vehicles/car-kit-data.js?v=b477ce33502c';
import {downtownVehicles} from '../assets/vehicles/downtown-vehicle-data.js?v=city-traffic-1';

function decodePart([count, packed]){
  const values=new Int16Array(Uint8Array.from(atob(packed),character=>character.charCodeAt(0)).buffer);
  const unpack=offset=>Float32Array.from(values.subarray(offset,offset+count),value=>value/10000);
  return{p:unpack(0),n:unpack(count),c:unpack(count*2),i:values.subarray(count*3)};
}

// Keep the authored bodies and lamp locations. Baked batches share geometry across paint colors.
export function createVehicleLibrary(T){
  const box=new T.BoxGeometry(1,1,1),cache=new Map();
  const names=['sedan','hatchback-sports','truck','delivery','sedan-sports','suv-luxury','police','taxi','van'];
  function geometry(key,data){
    if(cache.has(key))return cache.get(key);
    if(Array.isArray(data))data=decodePart(data);
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(data.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(data.n,3));
    g.setAttribute('color',new T.Float32BufferAttribute(data.c,3));g.setIndex(Array.from(data.i));g.computeBoundingSphere();cache.set(key,g);return g;
  }
  function vehicle(type,paint='paint0'){
    const name=typeof type==='string'?type:names[((type%names.length)+names.length)%names.length],source=carKit[name]??downtownVehicles[name];
    if(!source)throw new Error('No authored vehicle asset: '+name);
    const parts=[],indicators=[],{length,width,height}=source;
    for(const[category,data]of Object.entries(source.parts))parts.push({geo:geometry(name+category,data),material:category==='paint'?paint:category==='detail'?'assetDetails':category,position:[0,0,0],scale:[1,1,1],rotation:[0,0,0],sourceAsset:name});
    for(const side of[-1,1])for(const front of[-1,1]){
      const lamp=front>0?'headlight':'taillight';
      const position=source.lamps?.[lamp][side<0?0:1]??[side*.32,.36,front*(length/2+.018)];
      if(!source.lamps)parts.push({geo:box,material:lamp,position,scale:[.19,.055,.025],rotation:[0,0,0]});
      const [x,y,z]=position;
      const p={geo:box,material:'indicator',position:[x+side*.065,y+.018,z+front*.02],scale:[.055,.028,.015],rotation:[0,0,0],indicatorSide:side>0?'left':'right'};
      parts.push(p);indicators.push(p);
    }
    return{parts,length:length+.05,width:width+.08,height,model:name,indicators,lamps:source.lamps};
  }
  return{vehicle,specs:names.map(name=>({name}))};
}
