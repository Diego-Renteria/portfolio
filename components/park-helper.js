/** Instancing and handmade botanical geometry for two unlike gardens. */
export function createGardenKit(ctx,group){
 const {THREE:T}=ctx,batches=new Map(),materials=new Map(),dummy=new T.Object3D();let seed=78431;
 const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const leaf=new T.Shape();leaf.moveTo(0,-.5);leaf.bezierCurveTo(.42,-.13,.4,.2,0,.55);leaf.bezierCurveTo(-.4,.2,-.42,-.13,0,-.5);
 const geos={box:new T.BoxGeometry(1,1,1),cyl:new T.CylinderGeometry(1,1,1,16),leaf:new T.ShapeGeometry(leaf,5),disc:new T.CylinderGeometry(1,1,1,36)};
 // Continuous deformation makes weathered faces and fractures, rather than
 // identical round stones. Each shared shape has a flattened, buried base.
 for(let variant=0;variant<5;variant++){
  const g=new T.SphereGeometry(1,20,14),p=g.attributes.position,colors=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),phase=variant*1.73;
   const n=1+.16*Math.sin(x*3.8+z*2.6+phase)*Math.cos(y*3.2-phase)+.07*Math.sin(z*8.1+x*5.2+y*4.3+phase);
   p.setXYZ(i,Math.max(-.88,Math.min(.82,x*n))*(1+variant*.035)+y*.12,Math.max(-.62,Math.min(.67-x*.18+z*.12,y*n))*.73,Math.max(-.86,Math.min(.91,z*n))*(.88+variant*.04));
   const shade=.81+.12*Math.sin(x*7+y*3+phase)*Math.cos(z*6-phase);colors.push(shade,shade,shade*.98);
  }
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();g.userData.parkBoulderVariant=variant;geos['rock'+variant]=g;
 }
 function mat(color,kind='plain'){if(color?.isMaterial)return color;const key=color+kind;if(!materials.has(key)){const m=ctx.material(color,kind==='boulder'?'stone':kind).clone();if(kind==='boulder'){m.vertexColors=true;m.roughness=.96;m.bumpScale=.025;}if(kind==='leaf'){m.side=T.DoubleSide;m.roughness=1;}materials.set(key,m);}return materials.get(key);}
 function part(geo,color,x,y,z,w,h,d,rx=0,ry=0,rz=0,kind='plain'){
  const material=mat(color,kind),key=geo+material.uuid;if(!batches.has(key))batches.set(key,{geo:geos[geo],material,parts:[]});batches.get(key).parts.push({x,y,z,w,h,d,rx,ry,rz});
 }
 const b=(color,w,h,d,x,y,z,ry=0,kind='stone')=>part('box',color,x,y,z,w,h,d,0,ry,0,kind);
 const rock=(x,y,z,s=1)=>part('rock'+Math.floor(random()*5),['#85877d','#9a9687','#737d77'][Math.floor(random()*3)],x,y,z,s,s*(.52+random()*.4),s*(.65+random()*.5),random()*.22,random()*6.28,random()*.18,'boulder');
 function branch(a,b,r){const v=new T.Vector3().subVectors(b,a),p=a.clone().add(b).multiplyScalar(.5),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()),e=new T.Euler().setFromQuaternion(q);part('cyl','#655444',p.x,p.y,p.z,r,v.length(),r,e.x,e.y,e.z,'bark');}
 function shrub(x,z,s=.7,y=.16){for(let i=0;i<24;i++){const a=random()*6.28,r=Math.sqrt(random())*s;part('leaf',i%3?'#52784a':'#77935c',x+Math.cos(a)*r,y+.13+random()*s*.7,z+Math.sin(a)*r,.17+s*.16,.22+s*.2,1,random()*2,random()*6.28,random()*6.28,'leaf');}}
 function fern(x,z,s=.7,y=.17){for(let arm=0;arm<7;arm++){const a=arm/7*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a);for(let i=1;i<7;i++)for(const side of[-1,1]){const r=i/7*s,spread=(1-i/8)*s*.18,yy=y+Math.sin(i/7*Math.PI*.8)*s*.45;part('leaf',arm%2?'#668950':'#416e47',x+dx*r-dz*spread*side,yy,z+dz*r+dx*spread*side,.07+s*.09,.14+s*.12,1,-Math.PI/2+.2,a+side*.65,0,'leaf');}}}
 function tree(x,z,s=1){const h=4.5*s,base=new T.Vector3(x,.15,z),fork=new T.Vector3(x+.12*s,h*.55,z);branch(base,fork,.11*s);for(let k=0;k<7;k++){const a=k/7*Math.PI*2,end=new T.Vector3(x+Math.cos(a)*s*1.6,h*(.75+random()*.22),z+Math.sin(a)*s*1.4);branch(fork,end,.035*s);for(let j=0;j<46;j++){const az=random()*Math.PI*2,rr=Math.sqrt(random())*s*.85;part('leaf',['#b84b27','#dc9832','#e3b84f','#a33f29'][k%4],end.x+Math.cos(az)*rr,end.y+(random()-.5)*s*1.2,end.z+Math.sin(az)*rr,.22*s,.27*s,1,random()*Math.PI,random()*6.28,random()*6.28,'leaf');}}}
 function ribbon(points,width,color,y=.17,kind='stone'){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],y,p[1]))),p=[],uv=[],idx=[],n=64;
  for(let i=0;i<=n;i++){const t=i/n,c=curve.getPoint(t),v=curve.getTangent(t),side=new T.Vector3(-v.z,0,v.x);for(const sign of[-1,1]){p.push(c.x+side.x*width*.5*sign,y,c.z+side.z*width*.5*sign);uv.push(i/n*8,sign===-1?0:1);}if(i<n){const q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,mat(color,kind));m.receiveShadow=true;group.add(m);return curve;
 }
 function curvedBench(cx,cz,r,a0,a1){const n=18;for(let i=0;i<n;i++){const a=a0+(a1-a0)*(i+.5)/n,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;for(const rr of[-.14,0,.14])b('#99754c',r*(a1-a0)/n*.94,.09,.12,x+Math.cos(a)*rr,.54,z+Math.sin(a)*rr,-a+Math.PI/2,'wood');if(i%4===0)b('#3f5147',.1,.39,.42,x,.31,z,-a+Math.PI/2,'plain');}}
 function flush(){for(const v of batches.values()){const m=new T.InstancedMesh(v.geo,v.material,v.parts.length);v.parts.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.castShadow=v.geo!==geos.leaf;m.receiveShadow=true;group.add(m);}}
 return{T,random,part,b,rock,branch,shrub,fern,tree,ribbon,curvedBench,flush,mat};
}
