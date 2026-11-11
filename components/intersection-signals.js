import {createActuatedController} from './traffic-controller.js?v=b477ce33502c';
// The fixed plan is retained as a simulation comparison, not the live controller.
export const MAIN_INTERSECTION={x:0,z:22};
const GREEN=16,YELLOW=3,CLEAR=3,HALF=GREEN+YELLOW+CLEAR;
export function intersectionPhase(time,axis){
  const t=((time+(axis==='x'?HALF:0))%(2*HALF)+2*HALF)%(2*HALF);
  return t<GREEN?{color:'green',remaining:GREEN-t}:t<GREEN+YELLOW?{color:'yellow',remaining:GREEN+YELLOW-t}:{color:'red',remaining:2*HALF-t};
}
export function buildIntersectionSignals({THREE:T,world},controller=createActuatedController()){
  const group=new T.Group();group.name='Portfolio intersection mast-arm signals';world.add(group);
  const steel=new T.MeshStandardMaterial({color:'#465754',metalness:.72,roughness:.4}),housing=new T.MeshStandardMaterial({color:'#dfa337',metalness:.2,roughness:.52}),black=new T.MeshStandardMaterial({color:'#20282a',roughness:.68}),reflective=new T.MeshStandardMaterial({color:'#c6a440',roughness:.65});
  const casing=new T.MeshStandardMaterial({color:'#303b3a',roughness:.64,metalness:.16}),door=new T.MeshStandardMaterial({color:'#46514e',roughness:.7,metalness:.12}),gasket=new T.MeshStandardMaterial({color:'#151d1e',roughness:.9}),fastener=new T.MeshStandardMaterial({color:'#727c78',roughness:.44,metalness:.78});
  casing.name='Graphite cast signal housing';door.name='Rear maintenance covers';gasket.name='Weather seals and cable';fastener.name='Signal fixings';reflective.name='Driver-facing amber retroreflective edge';
  const hardware=new Map(),unitBox=new T.BoxGeometry(1,1,1),boltGeometry=new T.CylinderGeometry(.012,.012,.013,6);
  function rounded(w,h,d,r,bevel=.009){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new T.ExtrudeGeometry(s,{depth:d-2*bevel,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:4,steps:1});g.translate(0,0,-d/2+bevel);return g;}
  const backplate=rounded(.68,1.78,.065,.055),shell=rounded(.48,1.52,.29,.045,.015),cover=rounded(.39,.414,.035,.045,.006);
  const cable=new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(.02,.81,-.27),new T.Vector3(.16,.65,-.29),new T.Vector3(.17,.18,-.30),new T.Vector3(.09,.04,-.30)]),20,.014,7,false);
  function part(parent,geometry,mat,scale,x,y,z,rotation=[0,0,0]){const key=geometry.uuid+':'+mat.uuid;if(!hardware.has(key))hardware.set(key,{geometry,mat,parts:[]});hardware.get(key).parts.push({parent,scale,position:[x,y,z],rotation});}
  const detailBox=(parent,mat,w,h,d,x,y,z)=>part(parent,unitBox,mat,[w,h,d],x,y,z);
  const lenses=[],heads=[];let night=false;
  const box=(parent,mat,w,h,d,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  function cylinder(parent,r,height,x,y,z){const m=new T.Mesh(new T.CylinderGeometry(r,r,height,16),steel);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  // Local -Z is the approaching lane. The pole sits on the far-side sidewalk;
  // the mast reaches over the receiving lane and faces back toward its drivers.
  for(const [axis,angle]of [['z',0],['z',Math.PI],['x',Math.PI/2],['x',-Math.PI/2]]){
    const arm=new T.Group();arm.rotation.y=angle;arm.position.set(0,0,22);group.add(arm);
    const poleX=-3.92,poleZ=5.25;
    cylinder(arm,.19,.22,poleX,.22,poleZ);cylinder(arm,.085,6.25,poleX,3.28,poleZ);
    cylinder(arm,.115,.16,poleX,6.42,poleZ);
    const mast=cylinder(arm,.075,3.65,poleX+1.78,6.22,poleZ);mast.rotation.z=Math.PI/2;
    box(arm,steel,.055,.6,.055,poleX+.25,5.94,poleZ);
    for(const x of[-1.05,-2.55]){
      const head=new T.Group();head.position.set(x,5.38,poleZ);head.rotation.y=Math.PI;arm.add(head);heads.push({axis,head});
      part(head,backplate,black,[1,1,1],0,0,-.19);
      part(head,shell,casing,[1,1,1],0,0,0);
      // Amber face and narrow reflective edging face drivers; the rear stays dark.
      detailBox(head,housing,.46,1.48,.023,0,0,.127);
      for(const sx of[-.321,.321])detailBox(head,reflective,.022,1.66,.006,sx,0,-.151);
      for(const sy of[-.851,.851])detailBox(head,reflective,.598,.022,.006,0,sy,-.151);
      for(const y of[.49,0,-.49]){
        detailBox(head,gasket,.416,.445,.017,0,y,-.229);
        part(head,cover,door,[1,1,1],0,y,-.248);
        // Shallow molded ribs, side hinges, and stainless closure screws.
        for(const sy of[-.105,.105])detailBox(head,casing,.29,.014,.014,0,y+sy,-.272);
        for(const sy of[-.11,.11]){
          detailBox(head,steel,.035,.06,.034,-.213,y+sy,-.247);
          part(head,boltGeometry,fastener,[1,1,1],.174,y+sy,-.274,[Math.PI/2,0,0]);
        }
      }
      // A rear spine/yoke and conduit give the head a physical attachment.
      detailBox(head,steel,.062,1.62,.052,0,0,-.307);
      for(const y of[-.58,.59]){
        detailBox(head,steel,.34,.045,.055,0,y,-.306);
        for(const sx of[-.14,.14])part(head,boltGeometry,fastener,[1,1,1],sx,y,-.341,[Math.PI/2,0,0]);
      }
      detailBox(head,steel,.08,.075,.24,0,.83,-.13);
      part(head,cable,gasket,[1,1,1],0,0,0);
      detailBox(head,gasket,.11,.11,.048,.09,.035,-.3);
      detailBox(head,fastener,.15,.062,.007,0,-.692,-.273);
      for(const y of[-.687,-.703])detailBox(head,casing,.11,.004,.004,0,y,-.279);
      head.userData.rearDetail={segmentedCovers:3,hinges:6,closureScrews:6,mountingBolts:4,cable:true,reflectiveRear:false};
      for(const [i,name,color]of [[0,'red','#f51c09'],[1,'yellow','#ffad05'],[2,'green','#03ce70']]){
        const y=.49-i*.49,mat=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0,roughness:.23,metalness:.1,toneMapped:false});
        const lens=new T.Mesh(new T.CircleGeometry(.177,24),mat);lens.position.set(0,y,.153);head.add(lens);
        const rim=new T.Mesh(new T.TorusGeometry(.185,.024,6,24),black);rim.position.set(0,y,.16);head.add(rim);
        // Open-front visors shield the lenses without hiding their active color.
        const visor=new T.Mesh(new T.CylinderGeometry(.207,.207,.22,20,1,true,Math.PI/2,Math.PI),black);visor.rotation.x=Math.PI/2;visor.position.set(0,y+.015,.24);head.add(visor);
        lenses.push({axis,name,mat,lens});
      }
      box(arm,steel,.04,.18,.04,x,6.12,poleZ);
    }
  }
  // Static rear details share draw calls across all eight heads.
  group.updateWorldMatrix(true,true);const inverse=group.matrixWorld.clone().invert(),dummy=new T.Object3D();
  for(const {geometry,mat,parts}of hardware.values()){
    const mesh=new T.InstancedMesh(geometry,mat,parts.length);mesh.name='Detailed traffic signal — '+(mat.name||'mounting hardware');mesh.castShadow=true;mesh.receiveShadow=true;
    parts.forEach((p,i)=>{dummy.position.set(...p.position);dummy.rotation.set(...p.rotation);dummy.scale.set(...p.scale);dummy.updateMatrix();mesh.setMatrixAt(i,inverse.clone().multiply(p.parent.matrixWorld).multiply(dummy.matrix));});mesh.computeBoundingSphere();group.add(mesh);
  }
  // Curbside control cabinet, outside the crosswalk and clear of street furniture.
  box(group,steel,.48,1.05,.36,-3.95,.68,28.25);box(group,black,.015,.02,.025,-3.7,.82,28.44);
  function update(){
    for(const l of lenses){const active=controller.phase(l.axis).color===l.name;l.mat.color.set(active?l.mat.emissive: new T.Color(l.mat.emissive).multiplyScalar(.12));l.mat.emissiveIntensity=active?(night?4:2):0;}
    group.userData.phase={x:controller.phase('x').color,z:controller.phase('z').color};
  }
  update(0);
  return{group,heads,lenses,controller,update,setNight(value){night=!!value;update();}};
}
