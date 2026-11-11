import { terrainHeight, insideLand } from './geography.js?v=b477ce33502c';
/** Instanced surrounding districts for the full floating city. */
export function buildDistricts(ctx){
  const {THREE:T,world,glowMaterials=[]}=ctx;
  const group=new T.Group();group.name='surrounding-city-districts';world.add(group);
  const palette={stone:'#b9b9ad',cream:'#c6bda6',brick:'#997663',clay:'#ac836c',sage:'#829186',blue:'#738a90',slate:'#687b82',glass:'#4b6d76',darkGlass:'#314d56',metal:'#718683',frame:'#7c918b',roof:'#525e60',asphalt:'#77817c',wood:'#957454',lawn:'#8e9d78',soil:'#6f6c58',paving:'#b3b4a5',black:'#364a49',copper:'#a98f66'};
  const mats={};for(const[k,color]of Object.entries(palette))mats[k]=new T.MeshStandardMaterial({color,roughness:k.includes('Glass')||k==='glass'?.3:.86,metalness:k==='metal'?.5:k==='glass'?.3:0});
  mats.warm=new T.MeshStandardMaterial({color:'#87938a',emissive:'#ffd992',emissiveIntensity:.08,roughness:.55});
  mats.cool=new T.MeshStandardMaterial({color:'#718e92',emissive:'#b7dbdf',emissiveIntensity:.05,roughness:.5});glowMaterials.push(mats.warm,mats.cool);
  let seed=39491;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const buckets={};const part=(kind,key,w,h,d,x,y,z,ry=0,rx=0,rz=0)=>{(buckets[kind+':'+key]??=[]).push({w,h,d,x,y,z,ry,rx,rz});};
  const b=(key,w,h,d,x,y,z,ry=0,rx=0,rz=0)=>part('box',key,w,h,d,x,y,z,ry,rx,rz);
  const xs=[[-70,-63],[-57,-43],[-37,-23],[-17,-3],[3,17],[23,37],[43,57],[63,70]];
  const zs=[[-32,-22],[-14,-4],[4,14],[22,32],[40,50]];
  const allowed=[[1,2,5,6,7],[1,6,7],[1,6,7],[1,2,5,6,7],[1,2,3,4,5,6]];
  let buildingCount=0;
  function windowFace(x,z,w,d,y,h,lit=true){
    const cols=Math.max(2,Math.floor(w/.8)),rows=Math.max(2,Math.floor(d/.9));
    for(const sign of[-1,1]){
      for(let c=0;c<cols;c++){
        const color=lit&&random()<.09?'warm':lit&&random()<.035?'cool':'glass';
        b('frame',w/cols-.15,h+.12,.052,x-w/2+(c+.5)*w/cols,y,z+sign*(d/2+.025));
        b(color,w/cols-.25,h,.06,x-w/2+(c+.5)*w/cols,y,z+sign*(d/2+.058));
      }
      for(let c=0;c<rows;c++){
        const color=lit&&random()<.09?'warm':'glass';
        b('frame',.052,h+.12,d/rows-.18,x+sign*(w/2+.025),y,z-d/2+(c+.5)*d/rows);
        b(color,.06,h,d/rows-.28,x+sign*(w/2+.058),y,z-d/2+(c+.5)*d/rows);
      }
    }
  }
  function mechanicals(x,z,w,d,h){
    b('roof',w-.12,.08,d-.12,x,h+.07,z);
    for(const sign of[-1,1]){
      b('stone',w,.2,.09,x,h+.15,z+sign*(d/2-.045));
      b('stone',.09,.2,d,x+sign*(w/2-.045),h+.15,z);
    }
    b('metal',.75,.43,.76,x-.28,h+.3,z-.1);
    for(let v=0;v<4;v++)b('black',.6,.026,.045,x-.28,h+.53,z-.35+v*.16);
    b('metal',.19,.5,.19,x+w*.3,h+.3,z-d*.28);
    b('stone',.65,.6,.65,x+w*.22,h+.34,z+d*.22);
    b('roof',.75,.07,.75,x+w*.22,h+.67,z+d*.22);
  }
  function garden(x,z,w,d,y){
    b('wood',w,.16,d,x,y+.1,z);
    for(let i=0;i<3;i++){
      b('stone',w*.24,.22,d*.5,x-w*.32+i*w*.32,y+.28,z);
      b('lawn',w*.21,.06,d*.43,x-w*.32+i*w*.32,y+.42,z);
    }
    for(const s of[-1,1]){
      b('metal',w,.04,.04,x,y+.72,z+s*d*.5);
      for(let q=-w/2;q<=w/2;q+=.6)b('metal',.025,.6,.025,x+q,y+.42,z+s*d*.5);
    }
  }
  function building(x,z,w,d,h,type,style){
    buildingCount++;
    const color=['stone','brick','cream','sage','blue','clay','slate'][((style%7)+7)%7];
    b('paving',w+.38,.08,d+.35,x,.06,z);
    b(type===2?'glass':color,w,h,d,x,h/2+.1,z);
    b('stone',w+.12,.2,d+.12,x,.22,z);
    if(type===1){
      // Low commercial building, sawtooth-ish roof lights and a loading dock.
      b('roof',w+.18,.15,d+.18,x,h+.13,z);
      for(let k=-1;k<=1;k++){
        b('metal',w*.2,.3,d*.67,x+k*w*.28,h+.33,z);
        b('glass',w*.16,.045,d*.6,x+k*w*.28,h+.5,z);
      }
      b('metal',w*.55,1.1,.06,x,.75,z+d/2+.04);
      for(let q=0;q<5;q++)b('frame',w*.55,.025,.07,x,.3+q*.19,z+d/2+.075);
      b('asphalt',w*.64,.2,.56,x,.15,z+d/2+.32);
      windowFace(x,z,w,d,h-.5,.48,false);
      b('metal',.45,.55,.45,x-w*.3,h+.4,z-d*.24);
    }else{
      const stories=Math.max(1,Math.floor((h-.8)/1.04));
      for(let f=0;f<stories;f++){
        const yy=.85+f*(h-.9)/stories;
        windowFace(x,z,w,d,yy,.59);
        if(type===2||style%3===0)b(type===2?'metal':'stone',w+.04,.065,d+.04,x,yy+.43,z);
      }
      if(type===0){
        const rise=Math.min(1.05,w*.35);
        part('gable','roof',w+.3,rise,d+.35,x,h+.1,z);
        b('metal',.065,.06,d+.43,x,h+rise+.13,z);
        b('brick',.27,.6,.3,x-w*.27,h+rise*.6+.15,z-d*.2);
        b('stone',.38,.06,.39,x-w*.27,h+rise*.6+.48,z-d*.2);
      }else mechanicals(x,z,w,d,h+.1);
      if(type===2){
        for(const s of[-1,1])b('frame',.06,h+.3,.08,x+s*w*.5,h/2+.22,z+d/2+.06);
        if(h>7){
          const topH=1.7; b('glass',w*.7,topH,d*.7,x-.13,h+topH/2+.1,z-.1);
          mechanicals(x-.13,z-.1,w*.7,d*.7,h+topH+.1);
        }
      }
      // Recessed entry, wood door, retail glazing and canopy distinguish ground floors.
      b('darkGlass',w*.7,.98,.08,x,.7,z+d/2+.05);
      b('wood',.43,1.12,.09,x+w*.18,.7,z+d/2+.1);
      b('frame',.045,1.18,.1,x+w*.18-.25,.7,z+d/2+.14);
      b('frame',.045,1.18,.1,x+w*.18+.25,.7,z+d/2+.14);
      b('copper',w*.8,.13,.08,x,1.34,z+d/2+.1);
      b(style%2?'sage':'slate',w*.85,.1,.46,x,1.38,z+d/2+.3);
      if(type===0){
        b('wood',w*.84,.12,.5,x,.21,z+d/2+.25);
        for(const sign of[-1,1])b('cream',.08,1.14,.08,x+sign*w*.34,.82,z+d/2+.43);
      }
      if(type===3&&style%2===0)garden(x,z,w*.67,d*.6,h+.21);
    }
    // A drain pipe, meter and rear refuse bin add useful close-up detail.
    b('metal',.045,h-.2,.045,x+w/2+.05,h/2,z-d*.3);
    b('metal',.18,.25,.12,x+w/2+.08,.65,z-d*.26);
    b('black',.28,.35,.27,x-w/2-.18,.22,z-d*.35);
  }
  const flat=(x,z,w,d)=>insideLand(x,z,6)&&[[x,z],[x-w/2,z-d/2],[x+w/2,z-d/2],[x-w/2,z+d/2],[x+w/2,z+d/2]].every(([xx,zz])=>terrainHeight(xx,zz)<=.3);
  for(let cx=-90;cx<=90;cx+=20)for(let cz=-81;cz<=81;cz+=18){
    const core=cx>=-30&&cx<=50&&cz>=-63&&cz<=-9;
    const east=cx>=70&&cx<=110&&cz>=-63&&cz<=-9;
    const focus=Math.abs(cx)===10&&cz===9;
    const park=cx>=-90&&cx<=-50&&cz>=45&&cz<=81;
    const overlook=Math.abs(cx)<=10&&cz===27;
    if(core||east||focus||park||overlook)continue;
    const lowView=Math.abs(cx)<=10&&cz===45;
    const warehouse=cz>=63&&Math.abs(cx)<80;
    const slots=warehouse?[[-3.3,0],[3.3,0]]:[[-4.4,-2.9],[0,-2.9],[4.4,-2.9],[-4.4,2.9],[4.4,2.9]];
    for(let n=0;n<slots.length;n++){
      const [dx,dz]=slots[n],x=cx+dx,z=cz+dz;
      const w=warehouse?5.65:3.15+random()*.35,d=warehouse?8.9:4.2+random()*.3;
      if(!flat(x,z,w+1,d+1))continue;
      const central=Math.abs(cx)<70&&cz<45;
      const type=warehouse?1:lowView?0:n%3===0?2:3;
      const h=warehouse?3.6+random()*3.2:lowView?2.9+random()*.6:central?8+random()*10:6+random()*8;
      building(x,z,w,d,h,type,n+Math.round(cx+cz));
      if(warehouse){
        // Large creative-industrial roofs, clerestories and loading aprons.
        for(let i=0;i<4;i++){
          b('glass',w*.72,.045,.7,x,h+.55,z-2.7+i*1.8);
          b('metal',w*.76,.08,.76,x,h+.48,z-2.7+i*1.8);
        }
        b('asphalt',w+.2,.06,2.05,x,.08,z+d/2+1.2);
        for(const q of[-1,0,1]){
          b('cream',.08,.015,1.75,x+q*1.5,.12,z+d/2+1.2);
          b('black',.11,.52,.11,x+q*1.5,.3,z+d/2+.48);
        }
        b('clay',1.55,.95,.9,x-w*.24,.53,z-d/2-.6);
        for(let slat=0;slat<6;slat++)b('metal',.045,.9,.94,x-w*.24-.65+slat*.26,.53,z-d/2-.6);
      }else if(type===3&&n%2===1){
        // Stacked apartment balconies make residential blocks recognizably different.
        for(let y=2.6;y<h-.6;y+=2.2){
          b('stone',w*.7,.1,.65,x,y,z+d/2+.3);
          b('metal',w*.7,.045,.04,x,y+.62,z+d/2+.62);
          for(let xx=-w*.33;xx<=w*.33;xx+=.35)b('metal',.025,.57,.025,x+xx,y+.33,z+d/2+.62);
        }
      }
    }
    if(!warehouse&&flat(cx,cz+2.9,3.5,4.5)){
      const pz=cz+2.9;
      b('paving',3.35,.075,4.4,cx,.07,pz);
      b('soil',.9,.16,2.8,cx+1.12,.16,pz);
      b('lawn',.82,.08,2.7,cx+1.12,.27,pz);
      for(const s of[-1,1]){
        b('wood',1.6,.1,.48,cx-.25,.5,pz+s*.9);
        b('wood',1.6,.43,.06,cx-.25,.73,pz+s*1.12);
        for(const xx of[-.7,.2])b('metal',.065,.45,.4,cx+xx,.28,pz+s*.9);
      }
      b('black',.35,.62,.35,cx+.7,.34,pz-1.3);
    }
  }
  const shape=new T.Shape();shape.moveTo(-.5,0);shape.lineTo(0,1);shape.lineTo(.5,0);shape.closePath();
  const gable=new T.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});gable.translate(0,0,-.5);
  const geoms={box:new T.BoxGeometry(1,1,1),gable},dummy=new T.Object3D();
  for(const[key,items]of Object.entries(buckets)){
    const[kind,material]=key.split(':');const mesh=new T.InstancedMesh(geoms[kind],mats[material],items.length);mesh.name='districts-'+key;
    items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
  group.userData.buildingCount=buildingCount;
  return{group,buildingCount};
}
