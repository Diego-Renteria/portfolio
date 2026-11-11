// Shared, instanced furnishings. Coordinates use real architectural proportions.
export function detailKit(ctx,parent,name='Interior details'){
  const {THREE:T,material}=ctx,group=new T.Group();group.name=name;parent.add(group);
  const edge=new T.Shape(),e=.025;edge.moveTo(-.5+e,-.5);edge.lineTo(.5-e,-.5);edge.quadraticCurveTo(.5,-.5,.5,-.5+e);edge.lineTo(.5,.5-e);edge.quadraticCurveTo(.5,.5,.5-e,.5);edge.lineTo(-.5+e,.5);edge.quadraticCurveTo(-.5,.5,-.5,.5-e);edge.lineTo(-.5,-.5+e);edge.quadraticCurveTo(-.5,-.5,-.5+e,-.5);
  const bevelBox=new T.ExtrudeGeometry(edge,{depth:.96,bevelEnabled:true,bevelThickness:.02,bevelSize:.012,bevelSegments:2,steps:1,curveSegments:3});bevelBox.translate(0,0,-.48);
  const geos={box:bevelBox,round:new T.SphereGeometry(.5,28,18),cyl:new T.CylinderGeometry(1,1,1,32),cone:new T.ConeGeometry(1,1,32),torus:new T.TorusGeometry(1,.08,12,48)};
  const shape=new T.Shape(),r=.12;
  shape.moveTo(-.5+r,-.5);shape.lineTo(.5-r,-.5);shape.quadraticCurveTo(.5,-.5,.5,-.5+r);shape.lineTo(.5,.5-r);shape.quadraticCurveTo(.5,.5,.5-r,.5);shape.lineTo(-.5+r,.5);shape.quadraticCurveTo(-.5,.5,-.5,.5-r);shape.lineTo(-.5,-.5+r);shape.quadraticCurveTo(-.5,-.5,-.5+r,-.5);
  geos.soft=new T.ExtrudeGeometry(shape,{depth:.84,bevelEnabled:true,bevelThickness:.08,bevelSize:.025,bevelSegments:4,steps:1,curveSegments:8});geos.soft.translate(0,0,-.42);geos.soft.computeVertexNormals();
  const batches=new Map(),mats=new Map();
  function mat(color,kind='plain'){const key=color+':'+kind;if(!mats.has(key))mats.set(key,material(color,kind));return mats.get(key)}
  function put(kind,w,h,d,color,x,y,z,rot=[0,0,0]){const m=typeof color==='string'?mat(color):color,g=geos[kind],key=g.uuid+':'+m.uuid;if(!batches.has(key))batches.set(key,{g,m,parts:[]});batches.get(key).parts.push({w,h,d,x,y,z,rot});}
  const box=(w,h,d,c,x,y,z,r)=>put('box',w,h,d,c,x,y,z,r),soft=(w,h,d,c,x,y,z,r)=>put('soft',w,h,d,c,x,y,z,r),round=(w,h,d,c,x,y,z,r)=>put('round',w,h,d,c,x,y,z,r),cyl=(r,h,c,x,y,z,rot)=>put('cyl',r,h,r,c,x,y,z,rot);
  function rod(a,b,r,c){const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p),e=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()));cyl(r,v.length(),c,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,[e.x,e.y,e.z]);}
  function chair(x,y,z,c='#b88e61',yaw=0){soft(.48,.09,.48,c,x,y+.46,z,[0,yaw,0]);soft(.48,.43,.085,c,x-Math.sin(yaw)*.2,y+.72,z-Math.cos(yaw)*.2,[0,yaw,0]);for(const dx of[-.17,.17])for(const dz of[-.17,.17])cyl(.023,.43,'#494b45',x+dx*Math.cos(yaw)+dz*Math.sin(yaw),y+.22,z+dz*Math.cos(yaw)-dx*Math.sin(yaw))}
  function plant(x,y,z,s=.5){cyl(s*.28,s*.55,'#a9896e',x,y+s*.28,z);cyl(s*.26,.025,'#4b3d30',x,y+s*.56,z);for(let i=0;i<6;i++){const a=i*2.4;rod([x,y+s*.55,z],[x+Math.sin(a)*s*.3,y+s*(1.05+i*.06),z+Math.cos(a)*s*.3],.012,'#697d45');round(s*.25,s*.55,s*.16,i%2?'#718455':'#879765',x+Math.sin(a)*s*.28,y+s*(1.05+i*.06),z+Math.cos(a)*s*.28,[.25,a,.4])}}
  function lamp(x,y,z,h=1.5,c='#d6c19d'){cyl(.18,.045,'#414b47',x,y+.03,z);cyl(.018,h,'#6f6a5b',x,y+h/2,z);put('cone',.26,.3,.26,c,x,y+h,z);}
  function finish(){const o=new T.Object3D();for(const {g,m,parts}of batches.values()){const mesh=new T.InstancedMesh(g,m,parts.length);mesh.castShadow=!m.transparent;mesh.receiveShadow=true;for(const[p,i]of parts.map((p,i)=>[p,i])){o.position.set(p.x,p.y,p.z);o.scale.set(p.w,p.h,p.d);o.rotation.set(...p.rot);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)}mesh.computeBoundingSphere();group.add(mesh)}return group}
  return{T,group,mat,put,box,soft,round,cyl,rod,chair,plant,lamp,finish,geos};
}
