export const WORLDS=[
  ['original','Autumn island'],
  ['planet','Pocket planet'],
  ['basalt','Basalt crater'],
  ['glacier','Glacial fragment'],
  ['station','Orbital habitat'],
];
const designs={
  planet:{rings:[[0,1],[-12,1.015],[-46,.96],[-83,.78],[-112,.48],[-127,.02]],colors:['#59665c','#344c56','#35414a'],rough:.84},
  basalt:{rings:[[0,1],[-8,1.03],[-32,.92],[-42,.88],[-65,.55],[-83,.05]],colors:['#565659','#30333f','#92664b'],rough:1},
  glacier:{rings:[[0,1],[-13,1.025],[-28,.91],[-60,.74],[-72,.53],[-109,.08]],colors:['#607e8e','#406e86','#a1b6bf'],rough:.47},
  station:{rings:[[0,1],[-7,1.018],[-12,1.018],[-19,.81],[-38,.78],[-50,.52],[-55,.03]],colors:['#6e7682','#3b4656','#ceb17e'],rough:.49},
};
export function createMiniWorlds(T,terrain,world){
  const original=terrain.group.children.filter(mesh=>mesh.name!=='Continuous coastal terrain');
  const points=terrain.contour;
  const center=points.reduce((a,p)=>a.add(p),new T.Vector2()).multiplyScalar(1/points.length);
  let current;
  function select(id){
    if(current){current.removeFromParent();current.geometry.dispose();current.material.forEach(m=>m.dispose());current=null;}
    original.forEach(mesh=>{mesh.visible=id==='original';});
    if(!designs[id])return;
    const {rings,colors,rough}=designs[id],positions=[],indices=[],n=points.length;
    for(const [row,[y,scale]] of rings.entries())for(const [i,p] of points.entries()){
      const variation=row===0?0:Math.sin(i*1.91+row*2)*Math.sin(row*.47);
      const jagged=id==='basalt'?4:id==='glacier'?3:id==='planet'?.45:0;
      positions.push(center.x+(p.x-center.x)*(scale+variation*jagged*.003),y+variation*jagged,center.y+(p.y-center.y)*(scale+variation*jagged*.005));
    }
    const geometry=new T.BufferGeometry();
    for(let row=0;row<rings.length-1;row++)for(let i=0;i<n;i++){
      const j=(i+1)%n,a=row*n+i,b=row*n+j,c=a+n,d=b+n;
      geometry.addGroup(indices.length,6,(id==='station'&&row===1)?2:((i*7+row*3)%19===0?2:row%2));
      indices.push(a,b,c,b,d,c);
    }
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();
    const materials=colors.map((color,i)=>new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:rough,metalness:id==='station'?.62:0,emissive:color,emissiveIntensity:id==='station'&&i===2?.47:.12,flatShading:id==='basalt'||id==='glacier'}));
    // Combine each material into one indexed range.
    const byMaterial=materials.map(()=>[]);
    for(const group of geometry.groups)byMaterial[group.materialIndex].push(...indices.slice(group.start,group.start+group.count));
    geometry.clearGroups();let start=0;
    byMaterial.forEach((list,i)=>{geometry.addGroup(start,list.length,i);start+=list.length;});
    geometry.setIndex(byMaterial.flat());
    current=new T.Mesh(geometry,materials);current.name='Alternate terrain · '+id;current.receiveShadow=true;world.add(current);
  }
  return {select};
}
