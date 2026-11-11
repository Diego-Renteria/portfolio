import {facadeMaterial} from './facade-material.js?v=b477ce33502c';
import {filteredArchitectureMaterial,architectureFineWidth} from './architecture-filter.js?v=b477ce33502c';

// A curated layer of original architecture, rather than repeated roof variations.
// All dimensions are metres. Distinct silhouettes, floor heights, structural
// rhythms and materials share a small number of instanced draw calls.
export const SIGNATURE_FAMILIES=['fluted-terracotta','harbor-sail','planted-sky-terraces','carved-masonry-crown','bronze-exchange','porcelain-fold'];
export function isSignatureParcel(x,z,id=0){return (Math.abs(x)<57&&z>=-44&&z<22)||(z<27&&Math.abs(x)<128&&id%5===1);}
export function createSignatureArchitecture(ctx,parent){
 const {THREE:T,surfaceMaps={},glowMaterials=[]}=ctx,group=new T.Group();group.name='Individually designed metropolitan towers';parent.add(group);
 const buckets=new Map(),geometries={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(1,1,1,24),shrub:new T.IcosahedronGeometry(1,1)},designs=[],facadeMaterials=[],materials={};
 const palettes=[
  {frame:'#745246',glass:'#425e68',pitchX:1.65,pitchY:3.25,stone:true,kind:'brick'},
  {frame:'#577c88',glass:'#3c6b85',pitchX:2.05,pitchY:3.4},
  {frame:'#54695f',glass:'#476166',pitchX:2.15,pitchY:3.05},
  {frame:'#b9aa8c',glass:'#384e58',pitchX:1.8,pitchY:3.15,stone:true},
  {frame:'#5c4840',glass:'#3b4852',pitchX:2.25,pitchY:3.55},
  {frame:'#9aafb4',glass:'#53768d',pitchX:2.15,pitchY:3.3}
 ];
 palettes.forEach((p,i)=>{const m=facadeMaterial(T,{...p,surfaceMaps,seed:7419+i*571,occupancy:i===4?.37:.31});m.name=SIGNATURE_FAMILIES[i]+' glazed rooms';materials['facade'+i]=m;facadeMaterials.push(m);glowMaterials.push(m);});
 const colors={ivory:'#ded8c5',limestone:'#b6aa92',terracotta:'#a65e47',bronze:'#846449',dark:'#293337',copper:'#9a7557',porcelain:'#dce0db',roof:'#3e4b4f',wood:'#866b4c',leaf:'#48664d',sage:'#697c54',soil:'#4c4536',paving:'#aca897'};
 for(const[k,color]of Object.entries(colors))materials[k]=ctx.material(color,['bronze','copper','dark'].includes(k)?'metal':k==='terracotta'?'brick':k==='wood'?'wood':k==='leaf'||k==='sage'?'plain':'stone');
 materials.glow=new T.MeshStandardMaterial({color:'#f0d3a0',emissive:'#ffcc8a',emissiveIntensity:1.2,roughness:.6});glowMaterials.push(materials.glow);
 let address=0,program=1;
 function add(geo,mat,w,h,d,x,y,z,rotation=[0,0,0]){const key=geo+'|'+mat;if(!buckets.has(key))buckets.set(key,{geo,mat,parts:[]});buckets.get(key).parts.push({w,h,d,x,y,z,rotation,address,program});}
 const b=(mat,w,h,d,x,y,z,ry=0)=>add('box',mat,w,h,d,x,y,z,[0,ry,0]);
 function beam(a,c,width=.12,mat='bronze'){const av=new T.Vector3(...a),cv=new T.Vector3(...c),v=cv.sub(av),mid=av.clone().addScaledVector(v,.5),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()),e=new T.Euler().setFromQuaternion(q);add('box',mat,width,v.length(),width,...mid.toArray(),[e.x,e.y,e.z]);}
 function planters(x,y,z,w,d){b('wood',w,.46,d,x,y+.23,z);b('soil',w-.14,.06,d-.14,x,y+.48,z);for(let i=0;i<Math.max(2,Math.floor(w/.65));i++)add('shrub',i%3?'leaf':'sage',.32,.24,.27,x-w*.42+i*w*.84/Math.max(1,Math.floor(w/.65)-1),y+.65,z);}
 function roof(x,z,w,d,y){b('roof',w-.2,.14,d-.2,x,y+.07,z);for(const side of[-1,1]){b('dark',w,.36,.16,x,y+.25,z+side*d*.5);b('dark',.16,.36,d,x+side*w*.5,y+.25,z);}b('dark',w*.34,.9,d*.23,x-w*.17,y+.6,z-d*.2);for(let i=0;i<3;i++)b('bronze',w*.31,.045,.12,x-w*.17,y+.31+i*.2,z-d*.08);}
 function lobby(a,kind){const{x,z,w,d}=a;b('paving',w+.32,.11,d+.32,x,.07,z);b(kind===0?'terracotta':'ivory',w+.12,.34,d+.12,x,.3,z);const f=z+d*.5;
  b('dark',w*.57,3.05,.12,x,1.9,f+.10);for(let i=-1;i<=1;i++)b('bronze',.11,3.15,.22,x+i*w*.19,1.95,f+.18);
  b(kind===4?'bronze':'dark',w*.64,.18,1.28,x,3.56,f+.42);b('glow',w*.55,.055,.42,x,3.42,f+.63);
  for(const side of[-1,1]){b('ivory',.28,3.5,.4,x+side*w*.43,2.05,f+.13);b('glow',.07,1.2,.12,x+side*w*.40,2.0,f+.37);}
 }
 function build(a){
  address=a.id;const seed=a.id*17+a.roofSeed,near=Math.abs(a.x)<57&&a.z>=-44;
  // Parcel location chooses the four immediate neighbours deliberately, with
  // different families on either side of the central street.
  const column=a.x< -26?0:a.x<0?1:a.x<26?2:3;
  const kind=near?(a.z>0?[1,0,2,4]:a.z>-22?[3,0,2,5]:[4,5,3,1])[column]:Math.abs(seed+Math.round(a.z))%6;
  const h=near?42+Math.abs(seed)%18:Math.min(70,Math.max(a.h,35+seed%26)),{x,z,w,d}=a;
  program=kind===2?0:kind===3?3:1;b('facade'+kind,w*.92,3.78,d*.90,x,1.89,z);b(kind===0?'terracotta':'limestone',w*.97,.17,d*.95,x,3.80,z);lobby(a,kind);const floor=palettes[kind].pitchY;
  if(kind===0){
   // Slender terracotta piers continue through a deeply stepped crown.
   let y=3.8;for(let tier=0;tier<4;tier++){const hh=tier===0?(h-3.8)*.70:(h-3.8)*.10,ww=w*(1-tier*.11),dd=d*(1-tier*.105),zz=z-tier*.22;
    b('facade0',ww,hh,dd,x,y+hh*.5,zz);
    for(let xx=-ww*.46;xx<=ww*.46;xx+=1.65)for(const side of[-1,1])b('terracotta',.19,hh+.24,.48,x+xx,y+hh*.5,zz+side*(dd*.5+.18));
    for(const side of[-1,1])b('bronze',.17,hh+.2,dd+.3,x+side*ww*.5,y+hh*.5,zz);
    b('limestone',ww+.28,.28,dd+.3,x,y+hh,zz);roof(x,zz,ww,dd,y+hh+.18);y+=hh;}
   for(let i=0;i<5;i++)b('bronze',.13,2.6+i*.3,.16,x+(i-2)*w*.09,h+1.3,z-.6);
  }else if(kind===1){
   // An oval-ended glass volume with a sloping, rising roofline.
   const points=[],n=24;for(let i=0;i<n;i++){const t=i/n*Math.PI*2;points.push([Math.cos(t)*w*.49,Math.sin(t)*d*.48]);}
   const positions=[],indices=[];for(const y of[3.8,h])for(const[xx,zz]of points)positions.push(xx,y===h?y+(xx/w)*4.5:y,zz);
   for(let i=0;i<n;i++){const j=(i+1)%n;indices.push(i,j,n+i,j,n+j,n+i);}for(let i=1;i<n-1;i++)indices.push(n,n+i,n+i+1);
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));for(let k=0;k<indices.length;k+=3){const t=indices[k+1];indices[k+1]=indices[k+2];indices[k+2]=t;}geo.setIndex(indices);const flat=geo.toNonIndexed();flat.computeVertexNormals();const key='sail-'+a.id;geometries[key]=flat;add(key,'facade1',1,1,1,x,0,z);
   for(let i=0;i<n;i++){const[xx,zz]=points[i],yy=h+xx/w*4.5;beam([x+xx,3.8,z+zz],[x+xx,yy,z+zz],.12,'dark');if(i%4===0)beam([x+xx,3.8,z+zz],[x+points[(i+4)%n][0],h-3,z+points[(i+4)%n][1]],.16,'copper');}
   for(let y=7;y<h-1;y+=floor)for(let i=0;i<n;i++)beam([x+points[i][0]*1.012,y,z+points[i][1]*1.012],[x+points[(i+1)%n][0]*1.012,y,z+points[(i+1)%n][1]*1.012],.075,'dark');
   b('roof',w*.55,.25,d*.45,x,h-1.3,z);b('copper',w*.5,.4,d*.4,x,h-.95,z);
  }else if(kind===2){
   let y=3.8;const tiers=5,hh=(h-y)/tiers;for(let tier=0;tier<tiers;tier++){
    const ww=w*(1-tier*.065),dd=d*(1-tier*.055),xx=x+(tier%2?-.055:.035)*w,zz=z-tier*.27;
    b('facade2',ww,hh-.15,dd,xx,y+hh*.5,zz);b('ivory',ww+.45,.28,dd+.5,xx,y+hh,zz);b('wood',ww+.35,.08,dd+.38,xx,y+hh-.20,zz);
    for(let f=1;f<3;f++){const fy=y+f*hh/3;b('ivory',ww+.42,.17,dd+.44,xx,fy,zz);for(const side of[-1,1])b('bronze',ww+.34,.05,.05,xx,fy+.85,zz+side*(dd*.5+.18));}
    planters(xx+ww*.10,y+hh+.15,zz+dd*.45,ww*.68,.42);if(tier%2===0)planters(xx-ww*.44,y+hh+.15,zz-dd*.18,.45,Math.min(2.5,dd*.38));y+=hh;
   }roof(x,z-1.08,w*.72,d*.7,h+.35);
  }else if(kind===3){
   let y=3.8;for(let t=0;t<4;t++){const hh=(h-3.8)*[.48,.26,.17,.09][t],ww=w*(1-t*.14),dd=d*(1-t*.13);
    b('facade3',ww,hh,dd,x,y+hh*.5,z);for(let xx=-ww*.44;xx<=ww*.44;xx+=1.8){b('ivory',.16,hh+.3,.4,x+xx,y+hh*.5,z+d*(1-t*.13)*.5+.12);b('limestone',.22,.24,.55,x+xx,y+hh,z+dd*.5+.18);}
    b('ivory',ww+.5,.24,dd+.5,x,y+hh,z);b('bronze',ww+.22,.085,dd+.24,x,y+hh+.2,z);y+=hh;
   }for(let i=0;i<5;i++)b('limestone',w*.07,1.8+Math.cos((i-2)*.6)*2,d*.2,x+(i-2)*w*.13,h+.7,z);b('glow',w*.45,.08,.15,x,h+.4,z+d*.20);roof(x,z,w*.53,d*.5,h+.5);
  }else if(kind===4){
   b('facade4',w*.94,h-4,d*.9,x,(h+4)*.5,z);for(const side of[-1,1]){
    for(let xx=-w*.45;xx<=w*.46;xx+=w/5)b('bronze',.18,h-3,.35,x+xx,(h+3)*.5,z+side*d*.46);
    for(let y=7.1;y<h-.5;y+=floor)b('bronze',w*.96,.12,.24,x,y,z+side*d*.46);
   }
   for(let y=4;y<h-9;y+=10)for(const s of[-1,1]){const xx=x+s*w*.33;beam([xx-s*w*.15,y,z+d*.47],[xx+s*w*.15,y+10,z+d*.47],.16,'copper');}
   roof(x,z,w*.94,d*.9,h);b('facade4',w*.45,3.2,d*.6,x+w*.18,h+1.75,z-d*.09);b('bronze',w*.53,.22,d*.65,x+w*.18,h+3.5,z-d*.09);
  }else{
   // A chamfered hexagonal plan has a true oblique edge, not a rectangular
   // facade with a triangular ornament pasted on its roof.
   const path=[[-.5,-.5],[.25,-.5],[.5,-.20],[.5,.3],[.24,.5],[-.5,.5]],positions=[],indices=[];
   for(const y of[3.8,h])for(const[xx,zz]of path)positions.push(xx*w,y===h?y+xx*4:y,zz*d);
   for(let i=0;i<6;i++){const j=(i+1)%6;indices.push(i,j,i+6,j,j+6,i+6);}for(let i=1;i<5;i++)indices.push(6,6+i,7+i);
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));for(let k=0;k<indices.length;k+=3){const t=indices[k+1];indices[k+1]=indices[k+2];indices[k+2]=t;}geo.setIndex(indices);const flat=geo.toNonIndexed();flat.computeVertexNormals();const key='fold-'+a.id;geometries[key]=flat;add(key,'facade5',1,1,1,x,0,z);
   for(let i=0;i<6;i++){const a=path[i],c=path[(i+1)%6],span=Math.hypot((c[0]-a[0])*w,(c[1]-a[1])*d),n=Math.max(1,Math.floor(span/1.6));for(let j=0;j<=n;j++){const t=j/n,xx=(a[0]+(c[0]-a[0])*t)*w,zz=(a[1]+(c[1]-a[1])*t)*d,high=h+xx/w*4;beam([x+xx,3.8,z+zz],[x+xx,high,z+zz],.22,'porcelain');}beam([x+a[0]*w,h+a[0]*4,z+a[1]*d],[x+c[0]*w,h+c[0]*4,z+c[1]*d],.32,'porcelain');}
   roof(x-w*.1,z,w*.6,d*.64,h-2.2);
  }
  const design={id:`nyc-${String(a.id).padStart(3,'0')}`,family:SIGNATURE_FAMILIES[kind],x,z,width:w,depth:d,height:h+5,baseY:0,signature:`crafted-${kind}-${a.id}-${w.toFixed(2)}-${h.toFixed(2)}`,materialVariant:kind,trimPalette:kind,stadiumReserve:false,foregroundOccluder:false,customArchitecture:true,floorHeight:floor};designs.push(design);return design;
 }
 const viewportHeight={value:720};let night=false;
 function finish(){const dummy=new T.Object3D();for(const{geo,mat,parts}of buckets.values()){
   const g=geometries[geo].clone(),m=filteredArchitectureMaterial(materials[mat],viewportHeight);g.setAttribute('architectureFineWidth',new T.InstancedBufferAttribute(new Float32Array(parts.map(p=>geo==='box'?architectureFineWidth(p):0)),1));
   if(materials[mat].userData.architecture)g.setAttribute('interiorAddress',new T.InstancedBufferAttribute(new Float32Array(parts.flatMap(p=>[p.program,p.address,0])),3));
   const mesh=new T.InstancedMesh(g,m,parts.length);mesh.name='Signature architecture / '+mat+' / '+geo;mesh.castShadow=mat!=='glow';mesh.receiveShadow=true;mesh.onBeforeRender=r=>{viewportHeight.value=r.domElement.height;};mesh.userData.addresses=new Uint16Array(parts.map(p=>p.address));
   parts.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.rotation.set(...p.rotation);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();group.add(mesh);
  }group.userData.signatureArchitecture={buildings:designs.length,families:[...new Set(designs.map(d=>d.family))],batches:group.children.length,physicalFloorHeights:true};}
 function replaceAddress(design,model){
  // Retire the original mass, crown and detailing together only after its
  // replacement is fully loaded and its scale/footprint has been validated.
  const index=Number(design.id.slice(4)),zero=new T.Matrix4().makeScale(0,0,0);
  for(const mesh of group.children){const addresses=mesh.userData.addresses;if(!addresses)continue;let touched=false;for(let i=0;i<addresses.length;i++)if(addresses[i]===index){mesh.setMatrixAt(i,zero);touched=true;}if(touched){mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}}
  group.add(model);
 }
 return{group,build,finish,designs,facadeMaterials,replaceAddress,setNight(value){night=!!value;for(const m of facadeMaterials)m.emissiveIntensity=night?.8:.05;group.traverse(o=>{if(o.isMesh&&o.material.userData.architecture)o.material.emissiveIntensity=night?.8:.05;});}};
}

