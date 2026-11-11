import {layoutKit} from './interior-layout.js?v=b477ce33502c';

// A compact civic reading room: collection, help desk and quiet reading have
// separate zones. The rear gallery leaves the whole window-facing room open.
export function buildLibraryInteriors(ctx,parent){
  const k=layoutKit(ctx,parent,'Library — open reading hall and rear book gallery','lately');
  const {T,box,soft,cyl,rod,round}=k;
  const x=5.8,base=.35,wood=k.mat('#866142','wood'),oak=k.mat('#bc976a','wood'),dark='#34433b',brass='#ac9160',cream='#e9dfc8';
  const bookColors=['#83503f','#536b66','#a98b48','#687681','#755f6c','#c8b697','#414e5b','#9a6b45'];
  const brassMetal=k.mat('#a98e55','metal'),linen=k.mat('#748569','fabric'),leather=k.mat('#a98560','fabric');
  const upgrades={curvedOakChairs:0,clothBoundSpines:0,curvedPrintedBooks:0,lathedObjects:0,readingSupplies:0,nativeFurniture:true};
  const titleCanvas=document.createElement('canvas');titleCanvas.width=2048;titleCanvas.height=1024;const titleDraw=titleCanvas.getContext('2d');
  const titles=['CITY ATLAS','PACIFIC NORTHWEST','DESIGN NOTES','BOTANICAL STUDIES','ESSAYS','ARCHITECTURE','FIELD GUIDE','COLLECTED STORIES'];
  for(let i=0;i<8;i++){
    const bx=i*256;titleDraw.fillStyle=bookColors[i];titleDraw.fillRect(bx,0,256,1024);titleDraw.strokeStyle='#d8c89e';titleDraw.lineWidth=6;
    titleDraw.strokeRect(bx+21,38,214,948);for(const y of[118,152,860,895]){titleDraw.beginPath();titleDraw.moveTo(bx+30,y);titleDraw.lineTo(bx+226,y);titleDraw.stroke();}
    titleDraw.save();titleDraw.translate(bx+132,516);titleDraw.rotate(-Math.PI/2);titleDraw.font='600 53px Georgia';titleDraw.textAlign='center';titleDraw.fillStyle='#ecdfbb';titleDraw.fillText(titles[i],0,0,650);titleDraw.font='400 27px Arial';titleDraw.fillText('REFERENCE COLLECTION',0,55,650);titleDraw.restore();
  }
  const titleMap=new T.CanvasTexture(titleCanvas);titleMap.colorSpace=T.SRGBColorSpace;titleMap.anisotropy=8;
  const titleMaterial=new T.MeshStandardMaterial({map:titleMap,roughness:.76}),spineBatches=Array.from({length:8},()=>[]);
  function titleSpine(index,cx,cy,z,w,h){spineBatches[index].push({position:k.project(cx,cy,z),w,h});upgrades.clothBoundSpines++;}
  const pageCanvas=document.createElement('canvas');pageCanvas.width=512;pageCanvas.height=768;const pd=pageCanvas.getContext('2d');pd.fillStyle='#ece3ce';pd.fillRect(0,0,512,768);pd.fillStyle='#7e7764';pd.font='600 34px Georgia';pd.fillText('FIELD NOTES',55,100);pd.font='22px Georgia';
  for(let row=0;row<17;row++)pd.fillText(row%3===0?'Places, ideas and the everyday.':row%3===1?'A study in light, form and texture.':'Observe carefully. Return often.',55,157+row*30,410);
  const pageMap=new T.CanvasTexture(pageCanvas);pageMap.colorSpace=T.SRGBColorSpace;pageMap.anisotropy=8;
  const pageMaterial=new T.MeshStandardMaterial({map:pageMap,roughness:.95,side:T.DoubleSide}),pageEdge=k.mat('#d3c8ae');
  const curvedPages={};
  for(const side of[-1,1]){const g=new T.PlaneGeometry(.23,.31,12,12),a=g.attributes.position;for(let i=0;i<a.count;i++){const u=(a.getX(i)+.115)/.23,v=a.getY(i);a.setXYZ(i,side*u*.23,.009+Math.sin(u*Math.PI)*.023+u*.011,v);if(side<0)g.attributes.uv.setX(i,1-g.attributes.uv.getX(i));}g.computeVertexNormals();curvedPages[side]=g;}
  function nativeMesh(geometry,material,x,y,z,name,rotation=0){const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.position.set(...k.project(x,y,z));mesh.rotation.y=rotation;mesh.castShadow=true;mesh.receiveShadow=true;k.group.add(mesh);return mesh;}
  function lathe(points,material,cx,cy,z,name){upgrades.lathedObjects++;return nativeMesh(new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),40),material,cx,cy,z,name);}
  const chairRail=new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-.24,.77,.16),new T.Vector3(-.22,.88,.21),new T.Vector3(0,.92,.245),new T.Vector3(.22,.88,.21),new T.Vector3(.24,.77,.16)]),32,.032,10,false);
  const glow=k.mat('#ffe0af').clone();glow.emissive=new T.Color('#ffbe76');glow.emissiveIntensity=.32;ctx.glowMaterials?.push(glow);
  box(4.38,.07,5.57,k.mat('#bc976a','deck'),x,base,9.55);
  // Fine parquet borders, wall dado and cornice make the room a continuous space.
  for(let z=6.85;z<12.35;z+=.34)box(4.2,.008,.012,'#98734e',x,base+.04,z);
  box(4.4,7.05,.07,cream,x,3.94,6.72);
  for(const sx of [3.63,7.97]){
    box(.06,.92,5.5,wood,sx,base+.49,9.55);
    box(.09,.055,5.5,brass,sx,base+.97,9.55);
    for(let z=6.9;z<12.3;z+=.66)box(.055,.81,.035,oak,sx,base+.5,z);
    box(.15,.15,5.5,cream,sx,7.45,9.55);
  }
  box(4.35,.16,.17,cream,x,7.45,6.8);
  // A gallery only at the rear, with an unobstructed staircase beside it.
  box(3.48,.18,1.82,wood,6.24,3.41,7.68);
  box(.86,.18,1.07,wood,4.06,3.41,7.68);
  box(3.48,.045,1.82,oak,6.24,3.52,7.68);
  box(.86,.045,1.07,oak,4.06,3.52,7.68);
  // Eighteen walkable treads, rising from the main room to the rear gallery.
  const stairX=4.06,stairFront=11.95,rise=3.15/18,run=.23;
  for(let i=0;i<18;i++){
    const z=stairFront-i*run,y=base+(i+1)*rise;
    box(.84,.085,run+.025,oak,stairX,y-.045,z);
    box(.82,rise,.035,wood,stairX,y-rise/2-.05,z+run*.48);
    if(i%3===0)for(const dx of [-.39,.39])cyl(.016,.85,brass,stairX+dx,y+.42,z);
  }
  for(const dx of [-.39,.39]){
    rod([stairX+dx,base+rise+.86,stairFront],[stairX+dx,base+3.15+.86,stairFront-17*run],.025,wood);
    rod([stairX+dx,base+.03,stairFront+.1],[stairX+dx,3.41,stairFront-17*run-.12],.045,dark);
  }
  for(let xx=4.55;xx<=7.96;xx+=.26)cyl(.018,.88,brass,xx,3.99,8.62);
  box(3.48,.06,.075,wood,6.24,4.47,8.62);
  box(3.48,.035,.055,brass,6.24,3.65,8.62);
  // Rear shelving is organized into bays and continuous shelf levels.
  function bookcase(cx,y,w=1.02){
    k.setZone(cx,y,7.05);
    box(w,2.52,.075,wood,cx,y+1.26,6.87);
    for(const dx of [-w/2,w/2]){soft(.065,2.6,.4,oak,cx+dx,y+1.3,7.05);box(.025,2.45,.025,wood,cx+dx,y+1.3,7.267);}
    soft(w+.12,.11,.46,oak,cx,y+2.62,7.06);soft(w+.17,.045,.49,wood,cx,y+2.69,7.06);
    soft(w+.08,.09,.45,wood,cx,y+.04,7.06);
    for(let row=0;row<5;row++){
      const shelfY=y+.12+row*.49;soft(w,.055,.42,oak,cx,shelfY,7.06);soft(w+.015,.045,.035,wood,cx,shelfY-.006,7.28);
      let bx=cx-w/2+.08;
      for(let b=0;b<10;b++){
        const bw=.065+((b+row)%3)*.012,bh=.29+((b*7+row*3)%6)*.021;
        const index=(b*3+row+Math.round(cx*2))%bookColors.length,c=bookColors[index];
        soft(bw,bh,.25,k.mat(c,'fabric'),bx,shelfY+.035+bh/2,7.14);
        box(bw-.012,bh-.024,.228,'#d2c4a6',bx,shelfY+.035+bh/2,7.126);
        box(bw,.012,.25,c,bx,shelfY+.043+bh,7.14);box(bw,.012,.25,c,bx,shelfY+.028,7.14);
        titleSpine(index,bx,shelfY+.035+bh/2,7.279,bw*.92,bh*.92);
        bx+=bw+.015;
      }
    }
    k.clearZone();
  }
  for(const cx of [4.95,6.1,7.25]){bookcase(cx,base+.04);bookcase(cx,3.56)}
  // The upper perimeter gains a quiet display ledge rather than another slab.
  for(const [artIndex,cx] of [5.05,6.2,7.35].entries()){
    box(.72,.83,.045,wood,cx,6.75,6.81);box(.61,.72,.035,'#c1b89a',cx,6.75,6.84);
    box(.39,.035,.015,brass,cx,6.54,6.87);
    // Original botanical, street-map and mountain studies finish the gallery.
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=640;const c=canvas.getContext('2d');
    c.fillStyle='#eee3c9';c.fillRect(0,0,768,640);c.lineCap='round';
    if(artIndex===0){
      c.strokeStyle='#65765b';c.lineWidth=9;c.beginPath();c.moveTo(385,565);c.bezierCurveTo(325,390,470,250,373,80);c.stroke();
      for(let n=0;n<8;n++){
        const y=135+n*49,side=n%2?-1:1,x=387+Math.sin(n*.85)*18;
        c.fillStyle=n%3===0?'#bc9256':n%3===1?'#81906b':'#566f59';c.beginPath();c.moveTo(x,y+28);c.bezierCurveTo(x+side*110,y+18,x+side*165,y-45,x+side*114,y-62);c.bezierCurveTo(x+side*63,y-68,x+side*25,y-7,x,y+28);c.fill();
      }
    }else if(artIndex===1){
      c.strokeStyle='#bdad8c';c.lineWidth=15;
      for(let n=0;n<6;n++){c.beginPath();c.moveTo(90+n*111,70);c.lineTo(80+n*103,560);c.stroke();}
      for(let n=0;n<6;n++){c.beginPath();c.moveTo(75,95+n*86);c.lineTo(695,72+n*88);c.stroke();}
      c.fillStyle='#8e9b77';c.fillRect(219,269,91,144);c.fillRect(440,110,177,53);
      c.strokeStyle='#7d9a99';c.lineWidth=27;c.beginPath();c.moveTo(85,495);c.bezierCurveTo(310,440,400,620,685,462);c.stroke();
      c.strokeStyle='#6e7c69';c.lineWidth=4;c.strokeRect(216,266,97,150);
    }else{
      c.fillStyle='#d4b778';c.beginPath();c.arc(548,160,55,0,Math.PI*2);c.fill();
      for(let n=0;n<4;n++){
        c.strokeStyle=['#a8ab91','#879782','#657e70','#3e6259'][n];c.lineWidth=7;c.beginPath();c.moveTo(65,330+n*62);c.lineTo(223,170+n*51);c.lineTo(354,300+n*44);c.lineTo(494,220+n*54);c.lineTo(700,360+n*48);c.stroke();
      }
    }
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
    const a=k.project(cx-.28,6.415,6.878),b=k.project(cx+.28,7.085,6.878);
    const art=new T.Mesh(new T.PlaneGeometry(b[0]-a[0],b[1]-a[1]),new T.MeshStandardMaterial({map,roughness:.9}));art.name=['Botanical gallery study','Original downtown map study','Pacific Northwest mountain study'][artIndex];art.position.set(...k.project(cx,6.75,6.878));k.group.add(art);
  }
  function readingChair(cx,y,z,front=true){
    const side=front?1:-1;soft(.5,.10,.48,wood,cx,y+.45,z);soft(.46,.09,.43,linen,cx,y+.51,z-.012*side);
    soft(.46,.32,.075,linen,cx,y+.73,z+side*.2,[side*.11,0,0]);
    nativeMesh(chairRail,oak,cx,y,z,'Bent oak reading-chair crest',front?0:Math.PI);
    for(const dx of[-.17,.17])for(const dz of[-.17,.17])rod([cx+dx*1.12,y+.035,z+dz*1.12],[cx+dx,y+.47,z+dz],.023,wood);
    for(const dx of[-.19,.19])rod([cx+dx,y+.43,z+side*.18],[cx+dx,y+.83,z+side*.22],.018,oak);
    rod([cx-.18,y+.21,z-.16],[cx+.18,y+.21,z-.16],.014,wood);upgrades.curvedOakChairs++;
  }
  function openBook(cx,y,z){
    soft(.48,.014,.33,k.mat('#9b7051','fabric'),cx,y+.005,z);box(.018,.018,.32,wood,cx,y+.014,z);
    for(const side of[-1,1])for(let page=0;page<3;page++)nativeMesh(curvedPages[side],page===2?pageMaterial:pageEdge,cx,y+.013+page*.004,z,'Curved printed reading-book leaf');
    box(.014,.004,.23,'#b57952',cx+.052,y+.026,z+.08,[0,.12,0]);upgrades.curvedPrintedBooks++;
  }
  // Reading tables face the tall front windows; the center-right entrance stays clear.
  for(const tz of [9.65,11.25]){
    k.setZone(5.24,base,tz);
    soft(1.17,.09,.72,oak,5.24,base+.79,tz);soft(1.08,.045,.64,wood,5.24,base+.73,tz);
    for(const dx of [-.46,.46])for(const dz of [-.25,.25])cyl(.026,.74,wood,5.24+dx,base+.39,tz+dz);
    readingChair(5.22,base,tz+.58,true);readingChair(5.22,base,tz-.58,false);
    openBook(5.31,base+.845,tz+.08);
    lathe([[0,0],[.095,0],[.109,.012],[.102,.027],[.065,.044],[.027,.06],[.02,.08]],brassMetal,4.85,base+.838,tz-.12,'Turned brass reading-lamp base');
    cyl(.014,.245,brassMetal,4.85,base+1.04,tz-.12);rod([4.85,base+1.15,tz-.12],[4.85,base+1.19,tz-.06],.013,brassMetal);
    soft(.34,.12,.17,k.mat('#265e4c','glass'),4.85,base+1.2,tz-.08);box(.27,.018,.10,glow,4.85,base+1.137,tz-.08);
    rod([4.99,base+1.19,tz-.08],[4.99,base+1.02,tz-.08],.0035,brassMetal);round(.014,.02,.014,brassMetal,4.99,base+1.01,tz-.08);
    // A leather desk blotter, ruled notebook and pen complement the open book.
    soft(.3,.007,.22,leather,5.48,base+.845,tz-.16);box(.18,.018,.13,'#e5dcc4',5.48,base+.86,tz-.16);
    for(let line=0;line<5;line++)box(.14,.003,.003,'#aba693',5.48,base+.871,tz-.2+line*.018);
    rod([5.61,base+.85,tz-.24],[5.61,base+.85,tz-.03],.007,dark);cyl(.009,.035,brassMetal,5.61,base+.851,tz-.22,[Math.PI/2,0,0]);upgrades.readingSupplies+=3;
    if(tz===11.25){
      box(.51,.025,.34,dark,5.14,base+.858,tz-.08);box(.51,.34,.025,dark,5.14,base+1.03,tz-.23,[-.16,0,0]);box(.46,.29,.012,'#8da8a0',5.14,base+1.03,tz-.207,[-.16,0,0]);
      for(let row=0;row<4;row++)for(let col=0;col<9;col++)soft(.034,.005,.025,'#75847b',4.96+col*.041,base+.874,tz-.15+row*.037);
      soft(.15,.004,.075,'#83908a',5.14,base+.875,tz+.045);box(.37,.013,.008,dark,5.14,base+.891,tz-.22);
      lathe([[0,0],[.05,0],[.055,.014],[.061,.108],[.064,.13],[.057,.136],[.054,.122]],new T.MeshPhysicalMaterial({color:cream,roughness:.22,clearcoat:.45}),5.58,base+.855,tz+.08,'Glazed ceramic reading mug');
      cyl(.053,.005,'#6d4a31',5.58,base+.978,tz+.08);k.put('torus',.043,.043,.043,cream,5.65,base+.93,tz+.08,[0,Math.PI/2,0]);
    }
    k.clearZone();
  }
  // Help / checkout is at one side of the entrance, away from the browsing route.
  k.setZone(7.31,base,11.82);
  soft(.98,.83,.55,wood,7.31,base+.44,11.82);box(1.08,.065,.64,oak,7.31,base+.89,11.82);
  box(.24,.26,.035,dark,7.55,base+1.08,11.72);box(.20,.20,.009,'#91ada1',7.55,base+1.08,11.743);
  cyl(.023,.15,brass,7.55,base+.94,11.72);box(.21,.025,.14,dark,7.55,base+.925,11.72);
  for(let i=0;i<3;i++)box(.26,.055,.31,bookColors[i],7.12,base+.955+i*.055,11.83);
  soft(.19,.025,.21,wood,7.37,base+.94,11.99);for(let sheet=0;sheet<3;sheet++)box(.16,.004,.17,'#ded6c0',7.37,base+.957+sheet*.006,11.99);
  for(let line=0;line<4;line++)box(.11,.003,.003,'#a9a28d',7.37,base+.974,11.94+line*.025);upgrades.readingSupplies+=4;
  lathe([[0,0],[.05,0],[.062,.04],[.056,.18],[.034,.23],[.031,.29],[.039,.3]],new T.MeshPhysicalMaterial({color:'#9aaca5',roughness:.17,metalness:0,clearcoat:.6}),7.7,base+.932,11.93,'Small glazed counter carafe');
  k.label('ASK / BORROW',.72,.18,7.31,base+.66,12.11,'#866142','#efe1c5');
  // A soft reading corner, with a clear passage on its left.
  k.setZone(7.32,base,9.75);
  const nookCloth=k.mat('#b38a64','fabric');soft(.67,.18,.64,nookCloth,7.32,base+.38,9.75);soft(.67,.6,.15,nookCloth,7.32,base+.72,9.47);
  for(const dx of [-.32,.32])soft(.13,.28,.63,nookCloth,7.32+dx,base+.57,9.75);
  for(const dx of[-.21,0,.21])round(.022,.022,.012,k.mat('#946f4e'),7.32+dx,base+.77,9.553);
  soft(.3,.27,.095,k.mat('#7a8f76','fabric'),7.31,base+.72,9.6,[.13,0,.12]);
  cyl(.25,.055,oak,6.68,base+.51,9.87);lathe([[0,0],[.18,0],[.19,.016],[.16,.035],[.055,.07],[.035,.2],[.05,.41],[.1,.46]],brassMetal,6.68,base+.015,9.87,'Turned reading-nook pedestal');
  box(.26,.035,.21,bookColors[2],6.68,base+.56,9.87);k.lamp(7.68,base,9.1,1.7,cream);
  lathe([[0,0],[.045,0],[.055,.085],[.059,.11],[.052,.115]],new T.MeshPhysicalMaterial({color:'#82988b',roughness:.24,clearcoat:.5}),6.86,base+.55,9.9,'Small reading-nook tea cup');
  k.put('torus',.035,.035,.035,'#82988b',6.923,base+.607,9.9,[0,Math.PI/2,0]);
  k.plant(6.92,base,8.97,.48);
  // A pair of display plinths occupy shelf gaps, away from the staircase aisle.
  for(const y of[base+.04,3.56]){
    k.setZone(5.525,y,7.05);soft(.39,.59,.36,wood,5.525,y+.3,7.05);soft(.43,.045,.4,oak,5.525,y+.615,7.05);
    lathe([[0,0],[.1,0],[.12,.07],[.14,.2],[.1,.3],[.055,.36],[.052,.44],[.061,.45]],new T.MeshPhysicalMaterial({color:'#bda87c',roughness:.27,clearcoat:.45}),5.525,y+.64,7.05,'Thrown ceramic shelf-gap vessel');
  }
  // Suspended warm globes and ceiling coffers add detail above the open hall.
  k.clearZone();
  for(const cx of [4.9,6.65])for(const z of [9.1,11.35]){
    cyl(.015,1.02,brass,cx,6.88,z);round(.31,.31,.31,glow,cx,6.22,z);cyl(.09,.055,brass,cx,6.4,z);
  }
  for(let z=7.2;z<12.2;z+=.85)box(4.25,.11,.095,wood,x,7.75,z);
  const shelfLight=k.mat('#fbd2a1').clone();
  shelfLight.emissive=new T.Color('#ffd09c');shelfLight.emissiveIntensity=.75;
  for(const sx of [4.95,6.1,7.25])for(const y of [1.02,1.52,2.01,2.50]){
    box(.92,.017,.025,shelfLight,sx,y,7.247);
  }
  for(const [sx,sz] of [[5.24,9.52],[6.65,10.32]]){
    const light=new T.PointLight('#ffc888',6,4,2);
    light.position.set(...k.project(sx,3.12,sz));k.group.add(light);
    cyl(.011,2.9,brass,sx,4.93,sz);round(.51,.44,.51,shelfLight,sx,3.33,sz);
  }
  k.finish();
  // Atlas-backed title spines share one material and eight instanced geometries.
  const dummy=new T.Object3D();
  for(let index=0;index<8;index++){
    const parts=spineBatches[index];if(!parts.length)continue;const geometry=new T.PlaneGeometry(1,1),uv=geometry.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setX(i,(uv.getX(i)+index)/8);
    const mesh=new T.InstancedMesh(geometry,titleMaterial,parts.length);mesh.name='Cloth-bound lettered book spines';mesh.receiveShadow=true;
    parts.forEach((p,i)=>{dummy.position.set(...p.position);dummy.scale.set(p.w,p.h,1);dummy.rotation.set(0,0,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();k.group.add(mesh);
  }
  k.group.userData.libraryCraft=upgrades;
  return{group:k.group,upgrades};
}
