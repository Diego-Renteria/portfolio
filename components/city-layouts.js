// Metres in the miniature: permanent portfolio addresses, three different urban plans.
export const CITY_EDITIONS={
 original:{name:'Original',subtitle:'Your autumn downtown',description:'The current city, kept for comparison.'},
 harbor:{name:'Harborlight',subtitle:'Waterfront / timber / glass',description:'A working waterfront with converted warehouses, boardwalks, a sheltered harbor and a blue-glass skyline.'},
 foundry:{name:'The Foundry',subtitle:'Brick / rail gardens / Art Deco',description:'A dense neighborhood of cast-iron lofts, courtyards and stepped towers, stitched together by an elevated rail garden.'},
 garden:{name:'Canopy',subtitle:'Sculptural towers / urban gardens',description:'A contemporary garden city with curved boulevards, terraced architecture and a slender observation tower.'}
};
export function makeCityLayout(id){
 if(!CITY_EDITIONS[id]||id==='original')throw new Error('Choose an alternative city edition');
 const xs=id==='harbor'?[-135,-103,-69,-26,0,26,55,90,131]:id==='foundry'?[-135,-101,-66,-26,0,26,60,99,134]:[-128,-87,-48,-26,0,26,49,88,129];
 const zs=id==='harbor'?[-85,-54,-22,0,22,44,65]:id==='foundry'?[-86,-57,-22,0,22,44,78,109]:[-84,-51,-22,0,22,44,78,109];
 const roads=[],parcels=[],greens=[],loops=[];let seed={harbor:19017,foundry:68117,garden:39091}[id],n=0;
 const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const central=(x,z)=>Math.abs(x)<29&&z>-4&&z<47;
 function addParcel(x,z,w,d){
  if(central(x,z))return;
  if(id==='garden'&&((Math.abs(x-65)<w/2+9&&Math.abs(z+66)<d/2+9)||(Math.abs(z-61)<d/2+5&&Math.abs(Math.abs(x)-67)<w/2+12)||(Math.abs(x+109)<w/2+15&&Math.abs(z-95)<d/2+5)))return;
  const dist=Math.hypot(x*.7,z+20),r=random();let h=12+random()*14+Math.max(0,1-dist/145)*(20+random()*27);
  let kind=h>42?'tower':r<.25?'warehouse':r<.55?'residential':r<.82?'office':'market';
  if(id==='harbor'&&z>35){h=7+random()*10;kind='warehouse';}
  if(id==='foundry'&&z>45){h=12+random()*13;kind=r<.5?'warehouse':'residential';}
  if(id==='garden'){h=18+random()*25+Math.max(0,1-dist/135)*(22+random()*24);kind=r<.58?'tower':r<.8?'residential':'civic';}
  if(id==='foundry'&&z-d/2<65&&z+d/2>55){
   parcels.push({id:++n,x,z:50.7,w,d:3.4,h:Math.min(h,16),kind:'market'},{id:++n,x,z:70.1,w,d:6.6,h:Math.min(h,22),kind:'warehouse'});
  }else parcels.push({id:++n,x,z,w,d,h,kind});
 }
 for(let ix=0;ix<xs.length-1;ix++)for(let iz=0;iz<zs.length-1;iz++){
  const x=(xs[ix]+xs[ix+1])/2,z=(zs[iz]+zs[iz+1])/2,w=xs[ix+1]-xs[ix]-10,d=zs[iz+1]-zs[iz]-10;
  if(central(x,z))continue;
  if(id==='garden'&&((ix+iz)%7===0||Math.abs(x)>111&&z>20)){greens.push({x,z,w,d});continue;}
  if(w>22&&d>21&&random()<.67){const gap=1.2,ww=(w-gap)/2;addParcel(x-(ww+gap)/2,z,ww,d);addParcel(x+(ww+gap)/2,z,ww,d);}
  else addParcel(x,z,w,d);
 }
 for(const x of xs)roads.push({points:[[x,zs[0]-4],[x,zs.at(-1)+4]],width:6.6});
 for(const z of zs)roads.push({points:[[xs[0]-4,z],[xs.at(-1)+4,z]],width:6.6});
 // The last row closes the sightline at the end of the central street.
 for(const [i,x]of[-24,-8,8,24].entries())parcels.push({id:++n,x,z:-95,w:16,d:7,h:42+i*8+(id==='garden'?10:0),kind:'tower'});
 const loop=id==='harbor'?[[-141,57],[-125,77],[-65,83],[0,88],[70,87],[131,78],[143,55],[142,-15],[139,-70],[115,-96],[35,-102],[-45,-103],[-120,-97],[-143,-65],[-145,0]]:
 id==='foundry'?[[-144,84],[-124,105],[-57,116],[40,118],[119,115],[145,94],[145,27],[143,-54],[127,-99],[48,-105],[-58,-104],[-133,-98],[-145,-55]]:
 [[-141,78],[-120,112],[-45,117],[45,118],[122,113],[145,83],[145,0],[140,-70],[115,-99],[35,-104],[-50,-102],[-126,-94],[-145,-50]];
 loops.push(loop);roads.push({points:loop,width:6.6,closed:true,curved:true});
 return{id,xs,zs,roads,parcels,greens,loops,central,trafficPlans:[[xs.indexOf(-26),xs.indexOf(26),2,5],[1,xs.length-2,1,4],[2,xs.length-2,0,5],[0,xs.length-1,1,zs.length-1],[0,3,0,zs.length-1],[xs.length-4,xs.length-1,0,zs.length-1]],carCount:115};
}
export function distanceToSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
