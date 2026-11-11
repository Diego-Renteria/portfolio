import {layoutKit} from './interior-layout.js?v=b477ce33502c';
import {ALBUM_INVENTORY} from './album-inventory.js?v=b477ce33502c';
import {albumSleeves} from './album-sleeves.js?v=b477ce33502c';

// Diego's complete record collection, rendered from one shared, mipmapped atlas.
export function buildRecordInteriors(ctx,parent){
  const k=layoutKit(ctx,parent,'Record Store — vinyl browsing and listening room','music'),{T,box,soft,cyl,round,rod}=k;
  const x=12,base=.25,wood=k.mat('#966e4d','wood'),darkwood=k.mat('#5d4839','wood'),black='#252e2e',cream='#e7d8ba',brass='#b39b70';
  const colors=['#b96d54','#7b998e','#d0a858','#5f7885','#a58499','#bcb798'];
  const upholstery=k.mat('#7e9787','fabric'),acoustic=k.mat('#ad9a7a','fabric'),rubber=k.mat('#202726').clone(),aluminum=k.mat('#a7afa9','metal');
  rubber.roughness=.86;
  // Authored objects use smooth profiles; repeats share an instanced draw call.
  const crafted=new Map();
  function craft(geometry,mat,scale,cx,y,z,rotation=[0,0,0],name='crafted audio equipment'){
    const key=geometry.uuid+':'+mat.uuid;if(!crafted.has(key))crafted.set(key,{geometry,mat,parts:[],name});
    crafted.get(key).parts.push({position:k.project(cx,y,z),scale,rotation});
  }
  const titles=ALBUM_INVENTORY.map(a=>a.title),sleeveFaces=[],spineLabels=[];
  const glow=k.mat('#edcb8f').clone();glow.emissive=new T.Color('#efc477');glow.emissiveIntensity=.25;ctx.glowMaterials?.push(glow);
  box(4.4,.06,5.58,k.mat('#966e4d','deck'),x,base,9.55);box(4.4,3.65,.06,'#e6cda8',x,base+1.86,6.73);
  for(let z=6.9;z<12.35;z+=.32)box(4.38,.008,.012,'#755139',x,base+.035,z);
  for(const sx of [9.83,14.17]){box(.045,.64,5.5,darkwood,sx,base+.33,9.55);box(.08,.04,5.5,brass,sx,base+.66,9.55)}
  function sleeve(cx,y,z,size,index,tilt=0){
    const saved=k.getZone();if(!saved)k.setZone(cx,y,z);
    const c=colors[index%colors.length],art=[tilt,0,0];
    box(size,size,.035,c,cx,y,z,art);
    const local=(dx,dy,dz)=>[cx+dx,y+dy*Math.cos(tilt)-dz*Math.sin(tilt),z+dy*Math.sin(tilt)+dz*Math.cos(tilt)];
    sleeveFaces.push({position:k.project(...local(0,0,.020)),size:size*.97,tilt,index:index%ALBUM_INVENTORY.length});
    if(!saved)k.clearZone();
  }
  // Wall display has face-out records above deep, correctly divided storage.
  for(let row=0;row<2;row++){
    const sy=base+2.11+row*.79;box(3.78,.055,.25,darkwood,x,sy-.32,7.02);
    for(let n=0;n<5;n++)sleeve(x-1.53+n*.765,sy,7.08,.61,n+row*5);
    box(3.78,.07,.045,brass,x,sy-.27,7.16);
  }
  box(3.85,.88,.59,darkwood,x,base+.47,7.1);
  for(let n=0;n<6;n++)box(.045,.8,.61,wood,x-1.89+n*.756,base+.47,7.1);
  for(let n=0;n<42;n++){
    box(.055,.66,.43,colors[n%6],x-1.83+n*.088,base+.47,7.18);
    spineLabels.push({position:k.project(x-1.83+n*.088,base+.47,7.401),index:71+n});
  }
  // Two browsing islands flank a central aisle to the counter and rear display.
  function bin(cx,z,index){
    k.setZone(cx,base,z);
    for(const dx of [-.51,.51])for(const dz of [-.32,.32])cyl(.035,.73,black,cx+dx,base+.39,z+dz);
    box(1.2,.25,.88,wood,cx,base+.86,z);box(1.2,.055,.88,darkwood,cx,base+.70,z);
    for(const dx of [-.58,0,.58])box(.045,.42,.9,wood,cx+dx,base+.99,z);
    for(const dz of [-.43,.43])box(1.2,.3,.045,wood,cx,base+.92,z+dz);
    for(let n=0;n<14;n++)for(const [column,dx] of [-.29,.29].entries())sleeve(cx+dx,base+1.08,z-.34+n*.05,.49,index+n*2+column,-.16);
    box(1.21,.055,.08,brass,cx,base+.79,z+.46);
    k.label(index===10?'ON REPEAT':'DEEP CUTS',.8,.13,cx,base+.85,z+.465,'#966e4d','#eddfc6');k.clearZone();
  }
  bin(10.57,11.14,10);bin(13.43,11.14,38);
  // Five face-out listening picks occupy a low side shelf, away from the aisle.
  k.setZone(13.98,base,9.67);box(.56,.055,1.65,darkwood,13.98,base+.43,9.67);
  for(let n=0;n<5;n++)sleeve(13.98,base+.71,9.08+n*.28,.42,66+n,-.12);k.clearZone();
  // Shop counter keeps a side entrance clear; the playable turntable sits visibly forward.
  k.setZone(12.95,base,8.81);
  soft(1.56,.87,.7,darkwood,12.95,base+.45,8.81);box(1.69,.07,.8,wood,12.95,base+.94,8.81);
  for(let n=0;n<7;n++)box(.035,.77,.018,wood,12.27+n*.225,base+.46,9.17);
  box(.36,.3,.045,black,13.42,base+1.17,8.72);box(.3,.23,.009,'#9db1a1',13.42,base+1.17,8.747);
  cyl(.024,.15,brass,13.42,base+1,8.72);box(.31,.03,.22,black,13.42,base+.99,8.72);
  box(.44,.085,.22,black,13.4,base+1.01,9.02);for(let a=0;a<4;a++)for(let b=0;b<3;b++)box(.025,.009,.025,cream,13.28+a*.06,base+1.06,8.96+b*.05);
  const deckX=12.54,deckY=base+1.20,deckZ=8.86;
  soft(.74,.10,.56,black,deckX,deckY,deckZ);box(.69,.02,.51,'#b0b2a5',deckX,deckY+.062,deckZ);
  for(const dx of[-.29,.29])for(const dz of[-.20,.20])cyl(.041,.045,rubber,deckX+dx,deckY-.06,deckZ+dz);
  cyl(.23,.035,aluminum,deckX-.055,deckY+.094,deckZ);cyl(.22,.018,'#151e1d',deckX-.055,deckY+.12,deckZ);
  const grooves=[];for(let i=0;i<=112;i++)grooves.push(new T.Vector2(.083+i*.00119,i%2?.0003:-.0003));
  const vinyl=k.mat('#26312d').clone();vinyl.roughness=.34;vinyl.metalness=.08;
  craft(new T.LatheGeometry(grooves,128),vinyl,[1,1,1],deckX-.055,deckY+.130,deckZ,[0,0,0],'Fine-cut concentric vinyl grooves');
  // Edge dots, pitch slider and speed selector read as manufactured components.
  for(let n=0;n<40;n++){const a=n*Math.PI/20;round(.006,.006,.006,'#d0d2bc',deckX-.055+Math.cos(a)*.228,deckY+.099,deckZ+Math.sin(a)*.228);}
  box(.023,.006,.16,rubber,deckX+.305,deckY+.075,deckZ+.045);box(.042,.014,.022,aluminum,deckX+.305,deckY+.087,deckZ+.035);
  for(let n=0;n<5;n++)box(.008,.003,.002,black,deckX+.278,deckY+.08,deckZ-.01+n*.025);
  box(.06,.012,.036,aluminum,deckX-.29,deckY+.08,deckZ+.2);cyl(.009,.01,glow,deckX-.29,deckY+.09,deckZ+.2);
  cyl(.032,.018,brass,deckX-.055,deckY+.14,deckZ);
  // Offset, bent tonearm ends on the record, with a separate cartridge and pivot.
  cyl(.045,.065,black,deckX+.25,deckY+.12,deckZ-.18);
  rod([deckX+.25,deckY+.16,deckZ-.18],[deckX+.18,deckY+.16,deckZ+.15],.011,'#c8ccba');
  rod([deckX+.18,deckY+.16,deckZ+.15],[deckX+.06,deckY+.16,deckZ+.20],.011,'#c8ccba');
  cyl(.032,.08,aluminum,deckX+.25,deckY+.16,deckZ-.22,[Math.PI/2,0,0]);
  rod([deckX+.22,deckY+.11,deckZ-.1],[deckX+.22,deckY+.18,deckZ-.1],.006,aluminum);
  rod([deckX+.055,deckY+.13,deckZ+.2],[deckX+.055,deckY+.124,deckZ+.2],.002,aluminum);
  box(.07,.035,.045,black,deckX+.06,deckY+.14,deckZ+.20,[0,.35,0]);cyl(.026,.028,brass,deckX-.29,deckY+.093,deckZ+.19);
  k.label('33  /  45',.11,.025,deckX-.27,deckY+.078,deckZ+.25,'#b0b2a5','#27352f');
  // The small asymmetric label provides a visible rotational cue.
  const platter=new T.Group();platter.position.set(...k.project(deckX-.055,deckY+.14,deckZ));k.group.add(platter);
  const labelDisc=new T.Mesh(new T.CylinderGeometry(.076,.076,.008,64),k.mat('#c18c4c'));platter.add(labelDisc);
  const mark=new T.Mesh(new T.BoxGeometry(.032,.009,.012),k.mat(cream));mark.position.set(.039,.005,0);platter.add(mark);
  // Listening corner: upholstered seat, headphones, and speakers with actual cones.
  k.setZone(10.62,base,9.05);
  soft(.74,.16,.71,upholstery,10.62,base+.36,9.05);soft(.73,.65,.18,upholstery,10.62,base+.73,8.75);
  for(const dx of [-.34,.34])soft(.14,.33,.7,upholstery,10.62+dx,base+.57,9.05);
  for(const dx of[-.27,.27])rod([10.62+dx,base+.46,8.82],[10.62+dx,base+.46,9.33],.004,k.mat('#a8b5a0','fabric'));
  for(const dx of [-.25,.25])for(const dz of [-.23,.23])cyl(.027,.27,wood,10.62+dx,base+.15,9.05+dz);
  cyl(.24,.055,wood,11.35,base+.57,9.1);cyl(.03,.5,black,11.35,base+.29,9.1);cyl(.18,.04,black,11.35,base+.04,9.1);
  const headphoneX=11.35,hY=base+.78;
  const bandCurve=new T.CatmullRomCurve3(Array.from({length:19},(_,n)=>{const a=Math.PI*n/18;return new T.Vector3(Math.cos(a)*.13,Math.sin(a)*.15,0);}));
  craft(new T.TubeGeometry(bandCurve,56,.012,12,false),rubber,[1,1,1],headphoneX,hY,9.1,[0,0,0],'Curved padded headphone headband');
  const pad=new T.TorusGeometry(.045,.013,16,64),cup=new T.SphereGeometry(.5,40,24);
  for(const side of[-1,1]){
    craft(cup,rubber,[.045,.13,.105],headphoneX+side*.135,hY-.055,9.1,[0,0,0],'Contoured headphone earcups');
    craft(pad,k.mat('#3c4440','fabric'),[1,1.32,1],headphoneX+side*.11,hY-.055,9.1,[0,Math.PI/2,0],'Soft oval headphone cushions');
    rod([headphoneX+side*.12,hY+.018,9.1],[headphoneX+side*.145,hY-.055,9.1],.004,aluminum);
  }
  const cable=new T.CatmullRomCurve3([new T.Vector3(.14,-.105,0),new T.Vector3(.23,-.19,.04),new T.Vector3(.21,-.2,.14),new T.Vector3(.10,-.20,.19)]);
  craft(new T.TubeGeometry(cable,36,.003,8,false),rubber,[1,1,1],headphoneX,hY,9.1,[0,0,0],'Headphone listening cable');
  // Record-cleaning brush, liner notes and a warm drink make the listening station usable.
  box(.17,.025,.055,wood,11.35,base+.61,9.25);box(.15,.015,.04,rubber,11.35,base+.59,9.25);
  box(.16,.007,.12,cream,11.3,base+.61,8.98,[0,.2,0]);cyl(.034,.07,cream,11.44,base+.63,9.01);cyl(.027,.004,'#514235',11.44,base+.668,9.01);
  const coneGeometry=new T.LatheGeometry([new T.Vector2(0,-.026),new T.Vector2(.035,-.026),new T.Vector2(.072,-.012),new T.Vector2(.109,.008),new T.Vector2(.12,.012)],80);
  const surroundGeometry=new T.TorusGeometry(.121,.010,16,80),trimGeometry=new T.TorusGeometry(.139,.004,12,80);
  for(const sx of [10.05,13.95]){
    k.setZone(sx,base,7.15);
    soft(.46,.82,.38,darkwood,sx,base+1.73,7.15);box(.41,.77,.03,rubber,sx,base+1.73,7.36);
    craft(coneGeometry,k.mat('#525c53','paper'),[1,1,1],sx,base+1.61,7.393,[Math.PI/2,0,0],'Recessed paper-fibre speaker cones');
    craft(surroundGeometry,rubber,[1,1,1],sx,base+1.61,7.405,[0,0,0],'Rolled rubber woofer surrounds');
    craft(trimGeometry,aluminum,[1,1,1],sx,base+1.61,7.407,[0,0,0],'Machined woofer mounting rings');
    round(.071,.071,.026,rubber,sx,base+1.61,7.389);
    cyl(.065,.018,aluminum,sx,base+1.97,7.385,[Math.PI/2,0,0]);round(.057,.057,.03,k.mat('#242c28','fabric'),sx,base+1.97,7.402);
    cyl(.035,.021,rubber,sx,base+1.4,7.385,[Math.PI/2,0,0]);cyl(.025,.024,'#111b17',sx,base+1.4,7.386,[Math.PI/2,0,0]);
    for(const dx of[-.17,.17])for(const dy of[-.32,.32])cyl(.006,.007,aluminum,sx+dx,base+1.73+dy,7.382,[Math.PI/2,0,0]);
    k.label('AUTUMN / REFERENCE',.24,.035,sx,base+1.34,7.382,'#252e2e','#c2c8b2');
    box(.36,.045,.43,black,sx,base+1.29,7.16);box(.18,.21,.12,black,sx,base+1.16,7.03);
  }
  // Slim timber-framed acoustic absorption panels soften the side-wall reflections.
  for(const sx of[9.85,14.15])for(const z of[8.45,9.65]){
    k.setZone(sx,base,z);soft(.065,1.42,.67,darkwood,sx,base+2,z);soft(.073,1.34,.59,acoustic,sx+(sx<12?.012:-.012),base+2,z);
    for(const dz of[-.28,.28])rod([sx,base+1.35,z+dz],[sx,base+2.65,z+dz],.008,wood);
  }
  k.setZone(12.95,base,8.81);
  // Separate amplifier visibly supports the deck above the countertop.
  box(.60,.14,.43,aluminum,deckX,base+1.045,deckZ);box(.58,.11,.018,rubber,deckX,base+1.045,deckZ+.223);
  for(let n=0;n<13;n++)box(.015,.008,.15,rubber,deckX-.18+n*.03,base+1.12,deckZ-.03);
  for(const dx of[-.21,.21])cyl(.025,.018,aluminum,deckX+dx,base+1.045,deckZ+.242,[Math.PI/2,0,0]);
  box(.12,.04,.004,glow,deckX,base+1.055,deckZ+.235);
  k.setZone(10.12,base,8.12);k.plant(10.12,base,8.12,.58);
  k.clearZone();
  for(const cx of [10.6,12,13.4]){
    cyl(.012,1.35,black,cx,3.9,10.1);k.put('cone',.23,.23,.23,'#826d50',cx,3.18,10.1);cyl(.185,.018,glow,cx,3.07,10.1);
  }
  for(const z of [7.8,9.5,11.3])box(4.35,.12,.12,darkwood,x,4.55,z);
  k.finish();
  // Merged sleeve faces preserve all 113 identities with one material/draw call.
  k.group.add(albumSleeves(T,sleeveFaces,'71 face-out albums from Diego’s collection'));
  // Rear storage has legible spine typography when viewed close up.
  const spineCanvas=document.createElement('canvas');spineCanvas.width=1024;spineCanvas.height=512;
  const sc=spineCanvas.getContext('2d');sc.fillStyle='#c9bda6';sc.fillRect(0,0,1024,512);
  const sp=[],sn=[],su=[],si=[];
  spineLabels.forEach((entry,n)=>{const a=ALBUM_INVENTORY[entry.index],cx=(n%14)*72,cy=Math.floor(n/14)*168;sc.fillStyle=colors[n%6];sc.fillRect(cx,cy,72,168);sc.save();sc.translate(cx+36,cy+156);sc.rotate(-Math.PI/2);sc.fillStyle='#f3e8d1';sc.font='bold 12px sans-serif';sc.fillText(a.artist,0,-5,145);sc.font='10px sans-serif';sc.fillText(a.title,0,10,145);sc.restore();const o=sp.length/3;for(const[u,v]of[[0,0],[1,0],[1,1],[0,1]]){sp.push(entry.position[0]+(u-.5)*.048,entry.position[1]+(v-.5)*.64,entry.position[2]);sn.push(0,0,1);su.push((cx+2+u*68)/1024,1-(cy+2+(1-v)*164)/512)}si.push(o,o+1,o+2,o,o+2,o+3)});
  function printedMesh(p,n,u,i,material,name){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(i);g.computeBoundingSphere();const m=new T.Mesh(g,material);m.name=name;m.receiveShadow=true;k.group.add(m)}
  const spineTexture=new T.CanvasTexture(spineCanvas);spineTexture.colorSpace=T.SRGBColorSpace;spineTexture.anisotropy=8;
  printedMesh(sp,sn,su,si,new T.MeshStandardMaterial({map:spineTexture,roughness:.85}),'42 labeled record spines from Diego’s collection');
  const dummy=new T.Object3D();for(const {geometry,mat,parts,name}of crafted.values()){
    const mesh=new T.InstancedMesh(geometry,mat,parts.length);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;
    parts.forEach((p,i)=>{dummy.position.set(...p.position);dummy.scale.set(...p.scale);dummy.rotation.set(...p.rotation);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();k.group.add(mesh);
  }
  const realism={sleevePrintDesigns:titles.slice(),albumCount:ALBUM_INVENTORY.length,albumCoverDrawCalls:1,vinylGrooveRings:56,speakerProfileSegments:80,curvedHeadphoneBand:true,upholsteryTexture:'fabric',acousticPanels:4,amplifier:true,authoredEquipment:true};
  k.group.userData.realism=realism;
  let phase=0;return{group:k.group,realism,update(dt){if(dt>0){phase+=Math.min(dt,.08)*Math.PI*33.333/30;platter.rotation.y=phase}}};
}
