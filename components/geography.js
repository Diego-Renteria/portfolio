// Unequal outer blocks meet a stable downtown grid; short edge streets end at planted curbs.
export const LAND={cx:0,cz:11,rx:158,rz:116};
export const ROAD={half:3.3,sidewalk:1.1,stop:5.4,crosswalk:4.2,bike:2.65};
export function insideLand(x,z,margin=0){return Math.pow(Math.abs(x-LAND.cx)/(LAND.rx-margin),7)+Math.pow(Math.abs(z-LAND.cz)/(LAND.rz-margin),7)<.94;}
export const terrainHeight=()=>0;
export const estateSites=[];
export const hillRoadCenterlines=[[{x:-136,z:91},{x:-140,z:96},{x:-133,z:104},{x:-121,z:109},{x:-110,z:113}]];
export const curvedRoadBounds=hillRoadCenterlines.map(points=>({minX:Math.min(...points.map(p=>p.x))-3,maxX:Math.max(...points.map(p=>p.x))+3,minZ:Math.min(...points.map(p=>p.z))-3,maxZ:Math.max(...points.map(p=>p.z))+3}));
export const curvedRoadSegments=hillRoadCenterlines.flatMap(points=>points.slice(0,-1).map((a,i)=>({a,b:points[i+1],halfWidth:2.3})));
export const flatRoadXs=[-136,-110,-80,-52,-26,0,26,58,83,108,136];
export const flatRoadZs=[-92,-68,-43,-22,0,22,44,69,91,113];
export const STADIUM_RESERVE={minX:55,maxX:127,minZ:30,maxZ:82};
export function inStadiumReserve(x,z,margin=0){const s=STADIUM_RESERVE;return x>s.minX-margin&&x<s.maxX+margin&&z>s.minZ-margin&&z<s.maxZ+margin;}
// Road slabs terminate beyond the last viable junction rather than running off the island.
export function roadExtent(axis,coordinate){
  const cross=axis==='x'?flatRoadXs:flatRoadZs;
  const valid=cross.filter(p=>axis==='x'?insideLand(p,coordinate,9):insideLand(coordinate,p,9));
  if(!valid.length)return null;
  let lo=valid[0]-5.3,hi=valid.at(-1)+5.3;
  if(axis==='z'&&Math.abs(coordinate)<27)lo=Math.max(lo,-96.3);
  return[lo,hi];
}
export function onFlatRoad(x,z,padding=4.4){
  if(!insideLand(x,z,6))return false;
  return flatRoadXs.some(v=>{const r=roadExtent('z',v);return r&&Math.abs(v-x)<padding&&z>=r[0]-.2&&z<=r[1]+.2;})||flatRoadZs.some(v=>{const r=roadExtent('x',v);return r&&Math.abs(v-z)<padding&&x>=r[0]-.2&&x<=r[1]+.2;});
}
