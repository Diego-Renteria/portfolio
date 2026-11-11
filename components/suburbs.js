import { terrainHeight, insideLand } from './geography.js?v=b477ce33502c';
/** Small PNW craftsman homes surround the denser civic center. */
export function buildSuburbs(ctx){
  const {THREE:T,world,glowMaterials=[]}=ctx;
  const group=new T.Group();group.name='craftsman-neighborhood';world.add(group);
  const colors={sage:'#809181',blue:'#718e9c',cream:'#d5c7ad',brick:'#9e6655',wood:'#a57f59',trim:'#ece2cb',roof:'#4b565b',roofWarm:'#6b625b',glass:'#36565d',metal:'#788482',fence:'#c4b99c',lawn:'#859977',soil:'#756a55',paving:'#b4b0a0',black:'#3e4947'};
  const mats={};for(const [k,c]of Object.entries(colors))mats[k]=new T.MeshStandardMaterial({color:c,roughness:k==='glass'?.28:.9,metalness:k==='metal'?.5:k==='glass'?.25:0});
  mats.light=new T.MeshStandardMaterial({color:'#f3d6a0',emissive:'#ffd592',emissiveIntensity:.15,roughness:.6});glowMaterials.push(mats.light);
  const batches={};
  function part(kind,key,w,h,d,x,y,z,rx=0,ry=0,rz=0){const bk=kind+':'+key;(batches[bk]??=[]).push({w,h,d,x,y,z,rx,ry,rz});}
  const b=(key,w,h,d,x,y,z,rx=0,ry=0,rz=0)=>part('box',key,w,h,d,x,y,z,rx,ry,rz);
  const roof=(key,w,h,d,x,y,z)=>part('gable',key,w,h,d,x,y,z);
  // All dimensions are small relative to the towers. Front homes stay below 3.6.
  const homes=[];
  const flat=(x,z,w,d)=>insideLand(x,z,7)&&[[x,z],[x-w/2,z-d/2],[x+w/2,z-d/2],[x-w/2,z+d/2],[x+w/2,z+d/2]].every(([xx,zz])=>terrainHeight(xx,zz)<=.3);
  let parcelIndex=0;
  for(let cx=-150;cx<=150;cx+=20)for(let cz=-117;cz<=117;cz+=18){
    const outer=Math.abs(cx)>=110||Math.abs(cz)>=99;
    const eastTower=cx===110&&cz>=-63&&cz<=-9;
    const park=cx>=-100&&cx<=-40&&cz>=36&&cz<=90;
    if(!outer||eastTower||park)continue;
    for(const[dx,dz]of[[-3.9,2.6],[3.9,2.6],[0,-3.1]]){
      const index=parcelIndex++,x=cx+dx+(index%3-1)*.11,z=cz+dz+(dz>0?-(index%3)*.14:(index%3)*.12),w=3.5+(index%5)*.18,d=3.55+(index%3)*.16;
      if(!flat(x,z,w+1.1,d+2.2))continue;
      homes.push({x,z,w,d,h:2.4+(index%4)*.19,r:1.0+(index%3)*.13,color:['sage','blue','cream','brick'][index%4],yaw:dz<0?Math.PI:0});
    }
  }
  homes.forEach((a,index)=>{
    const{x,z,w,d,h,r,color}=a,front=z+d/2;
    const starts=Object.fromEntries(Object.entries(batches).map(([key,list])=>[key,list.length]));
    b('lawn',w+1.0,.055,d+1.65,x,.035,z+.25);
    b('soil',w+.18,.12,d+.15,x,.08,z);
    b('brick',w,.25,d,x,.19,z);
    b(color,w,h-.2,d,x,h/2+.13,z);
    // Closely spaced clapboard courses catch the light without an image texture.
    for(let yy=.48;yy<h-.08;yy+=.22){
      b(color,w+.018,.027,.035,x,yy,front+.024);
      b(color,.035,.027,d,x+w/2+.024,yy,z);
      b(color,.035,.027,d,x-w/2-.024,yy,z);
    }
    for(const q of [-1,1]){
      b('trim',.1,h,.09,x+q*(w/2-.04),h/2+.13,front+.055);
      b('trim',.09,h,.1,x+q*(w/2+.015),h/2+.13,z-d/2+.04);
    }
    roof(index%3===0?'roofWarm':'roof',w+.44,r,d+.48,x,h+.08,z);
    roof(color,w+.26,.91*r,.04,x,h+.08,front+.255);
    roof(color,w+.26,.91*r,.04,x,h+.08,z-d/2-.255);
    // Front and rear fascia follow the roof slopes; ridge cap is a narrow metal seam.
    const angle=Math.atan2(r,(w+.44)/2),length=Math.hypot((w+.44)/2,r);
    for(const side of [-1,1])for(const zz of [z-d/2-.25,front+.25])b('trim',length,.09,.09,x+side*(w+.44)/4,h+.08+r/2,zz,0,0,-side*angle);
    b('metal',.09,.07,d+.55,x,h+r+.11,z);
    for(const side of [-1,1])b('metal',.07,.09,d+.5,x+side*(w/2+.2),h+.1,z);
    // A small attic vent makes the gable read as architecture rather than a triangle.
    b('trim',.42,.38,.07,x,h+r*.37,front+.295);
    for(let k=0;k<4;k++)b('roof',.32,.035,.03,x,h+r*.37-.11+k*.075,front+.34);
    if(index%3===1){
      const dx=x+w*.21,dy=h+r*.51,dz=z-.45;
      b(color,.76,.53,.78,dx,dy+.18,dz);
      roof('roof',.94,.32,.96,dx,dy+.45,dz);
      b('trim',.06,.39,.5,dx+.405,dy+.22,dz);
      b('glass',.065,.3,.38,dx+.44,dy+.22,dz);
      b('trim',.07,.32,.035,dx+.48,dy+.22,dz);
    }
    const doorX=x+w*.17;
    b('wood',.68,1.45,.085,doorX,.99,front+.07);
    b('trim',.075,1.5,.1,doorX-.38,1,front+.095);b('trim',.075,1.5,.1,doorX+.38,1,front+.095);
    b('trim',.84,.09,.1,doorX,1.76,front+.095);
    b('glass',.42,.4,.025,doorX,1.37,front+.12);
    b('metal',.055,.055,.06,doorX+.22,.91,front+.14);
    const win=(xx,yy,zz,side=false)=>{
      if(side){
        b('trim',.075,.95,.85,xx,yy,zz);b('glass',.085,.77,.67,xx+.013,yy,zz);
        b('trim',.1,.045,.7,xx+.045,yy+.04,zz);b('trim',.1,.79,.045,xx+.045,yy,zz);
        b('trim',.16,.09,.97,xx+.04,yy-.5,zz);
      }else{
        b('trim',.95,.95,.075,xx,yy,zz);b('glass',.77,.77,.085,xx,yy,zz+.013);
        b('trim',.79,.045,.1,xx,yy+.04,zz+.045);b('trim',.045,.79,.1,xx,yy,zz+.045);
        b('trim',1.08,.09,.16,xx,yy-.5,zz+.04);
        if(index%3===0)b('light',.32,.62,.02,xx-.18,yy-.04,zz+.063);
      }
    };
    win(x-w*.27,1.26,front+.075);
    win(x+w/2+.07,1.25,z-.58,true);
    win(x+w/2+.07,1.25,z+.68,true);
    win(x-w/2-.07,1.25,z-.25,true);
    // Deep porch, railings, timber supports and small entry lantern.
    b('wood',w*.84,.13,.72,x,.32,front+.36);
    b('paving',1.0,.13,.35,doorX,.2,front+.85);
    b('paving',1.15,.09,.4,doorX,.1,front+1.07);
    b('roof',w*.91,.12,.99,x,1.96,front+.39,.12);
    b('trim',w*.93,.1,.075,x,1.91,front+.87);
    for(const sign of [-1,1]){
      const px=x+sign*w*.36;
      b('brick',.26,.42,.26,px,.57,front+.66);
      b('trim',.13,1.15,.13,px,1.35,front+.66);
      b('trim',.27,.09,.24,px,1.87,front+.66);
      b('trim',.7,.07,.07,px-sign*.25,.95,front+.68);
      for(let n=0;n<4;n++)b('trim',.045,.5,.045,px-sign*(.06+n*.15),.68,front+.68);
    }
    b('black',.14,.27,.15,doorX+.59,1.45,front+.15);
    b('light',.09,.17,.16,doorX+.59,1.45,front+.17);
    // Brick chimney with masonry joints and cap. No chimney exceeds front height.
    const cx=x-w*.28,cz=z-d*.2,cy=h+r*.61;
    b('brick',.38,.75,.42,cx,cy,cz);
    for(let n=0;n<4;n++)b('cream',.39,.022,.43,cx,cy-.3+n*.17,cz);
    b('metal',.51,.08,.54,cx,cy+.42,cz);
    b('black',.31,.04,.34,cx,cy+.47,cz);
    // Rear and side cedar fences, leaving the small front yards open and inviting.
    const fenceZ=z-d/2-.38;
    for(let xx=x-w/2-.3;xx<x+w/2+.4;xx+=.22)b('fence',.11,.68,.07,xx,.36,fenceZ);
    for(const sign of [-1,1]){
      const xx=x+sign*(w/2+.35);
      for(let zz=z-d/2-.3;zz<front-.2;zz+=.23)b('fence',.07,.68,.11,xx,.36,zz);
      b('wood',.09,.055,d-.1,xx,.56,z-.2);
    }
    b('wood',w+.7,.055,.09,x,.56,fenceZ);
    b('paving',.66,.035,1.02,doorX,.06,front+1.05);
    // Porch planters and utility details imply occupancy without introducing people.
    b('brick',.42,.3,.4,x-w*.32,.53,front+.42);
    b('lawn',.34,.09,.32,x-w*.32,.73,front+.42);
    b('metal',.22,.4,.12,x+w/2+.08,.71,z-.8);
    b('metal',.035,.75,.035,x+w/2+.08,.95,z-.8);
    b('black',.3,.4,.24,x-w/2-.18,.24,z-.9);
    b('metal',.34,.06,.27,x-w/2-.18,.47,z-.9);
    if(a.yaw){
      for(const[key,parts]of Object.entries(batches))for(let i=starts[key]||0;i<parts.length;i++){
        const p=parts[i];p.x=2*x-p.x;p.z=2*z-p.z;p.ry+=a.yaw;
      }
    }
  });
  const shape=new T.Shape();shape.moveTo(-.5,0);shape.lineTo(0,1);shape.lineTo(.5,0);shape.closePath();
  const gable=new T.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});gable.translate(0,0,-.5);
  const geoms={box:new T.BoxGeometry(1,1,1),gable};const dummy=new T.Object3D();
  for(const[key,items]of Object.entries(batches)){
    const[kind,material]=key.split(':');const mesh=new T.InstancedMesh(geoms[kind],mats[material],items.length);mesh.name='homes-'+key;
    items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
  group.userData.buildingCount=homes.length;return{group,buildingCount:homes.length};
}
