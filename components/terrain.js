import {terrainHeight,LAND} from './geography.js?v=b477ce33502c';
/** A suspended slice of earth: restrained strata, fractured basalt and roots. */
export function buildTerrain(ctx) {
  const { THREE: T, world } = ctx;
  const group = new T.Group();
  group.name = 'Floating earth · exposed Pacific Northwest geology';
  world.add(group);
  let seed = 731;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const N = 256;
  const contour = [];
  // A rounded rectangular footprint keeps the entire road grid on solid ground.
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const edge = 1 + Math.sin(a * 3 + .8) * .042 + Math.sin(a * 7 + .3) * .026 + Math.sin(a*17)*.009;
    contour.push(new T.Vector2(LAND.cx+Math.sign(c) * Math.pow(Math.abs(c), .28) * LAND.rx * edge, LAND.cz+Math.sign(s) * Math.pow(Math.abs(s), .28) * LAND.rz * edge));
  }
  const top = new T.Shape();
  contour.forEach((p, i) => i ? top.lineTo(p.x, -p.y) : top.moveTo(p.x, -p.y));
  top.closePath();
  const groundMat = ctx.material('#86a875','grass').clone();groundMat.roughness=1;
  const topPos=[],topColors=[],topIndices=[],topUV=[],radials=170;
  const groundColor=new T.Color();
  for(let r=0;r<=radials;r++)for(let i=0;i<=N;i++){
    const p=contour[i%N],x=LAND.cx+(p.x-LAND.cx)*r/radials,z=LAND.cz+(p.y-LAND.cz)*r/radials,y=terrainHeight(x,z);
    topPos.push(x,y,z);topUV.push(x/10,z/10);groundColor.set('#dce8cd');groundColor.multiplyScalar(.95+.05*Math.sin(x*.19)*Math.cos(z*.17));topColors.push(groundColor.r,groundColor.g,groundColor.b);
    if(r<radials&&i<N){const q=r*(N+1)+i;topIndices.push(q,q+1,q+N+1,q+1,q+N+2,q+N+1);}
  }
  const topGeo=new T.BufferGeometry();topGeo.setAttribute('position',new T.Float32BufferAttribute(topPos,3));topGeo.setAttribute('color',new T.Float32BufferAttribute(topColors,3));topGeo.setAttribute('uv',new T.Float32BufferAttribute(topUV,2));topGeo.setIndex(topIndices);topGeo.computeVertexNormals();
  groundMat.vertexColors=true;groundMat.color.set('#ffffff');
  const ground = new T.Mesh(topGeo, groundMat);
  ground.receiveShadow = true;
  ground.castShadow = true;
  ground.name = 'Continuous coastal terrain';
  group.add(ground);

  const levels = [
    {y:0, scale:1, color:'#66874f'},
    {y:-.65, scale:1.003, color:'#4b3d2d'},
    {y:-1.8, scale:.996, color:'#796046'},
    {y:-3.4, scale:1.001, color:'#5a4c3b'},
    {y:-6.5, scale:1.014, color:'#77766a'},
    {y:-14, scale:1.024, color:'#646d65'},
    {y:-23, scale:1.004, color:'#777a70'},
    {y:-33, scale:.954, color:'#59665f'},
    {y:-43, scale:.835, color:'#6c766c'},
    {y:-51, scale:.655, color:'#4e5e55'},
    {y:-64, scale:.40, color:'#526258'}
  ];
  for(const level of levels)if(level.y<0)level.y*=.78;
  const rings = levels.map((l,k) => contour.map((p,i) => {
    const a=i/N*Math.PI*2;
    const jitter = k < 3 ? .12 : .6 + k * .14;
    const vertical = k === 0 ? 0 : (rand()-.5) * (k<3 ? .22 : 2.5+k*.3)+(k>3?Math.sin(a*7+1.7)*(k-3)*.38:0);
    const twist = k>3 ? Math.sin(i*.19+k)*1.8 : 0;
    // Deep fractures and an off-center lower shelf prevent a symmetrical cone.
    const cut=k>3 ? Math.pow(Math.max(0,Math.sin(a*5+.4)),16)*(k-3)*.010 : 0;
    const asym=k>3 ? 1+Math.sin(a+1.5)*(k-3)*.009 : 1;
    return new T.Vector3(LAND.cx+(p.x-LAND.cx)*(l.scale-cut)*asym+(rand()-.5)*jitter+twist+k*.35, l.y+vertical+(k===0?terrainHeight(p.x,p.y):0), LAND.cz+(p.y-LAND.cz)*(l.scale-cut)+(rand()-.5)*jitter-k*.15);
  }));
  const pos = [], cols = [];
  function tri(a,b,c,col) {
    const shade=.95+rand()*.10;
    const cc=col.clone().multiplyScalar(shade);
    for(const p of [a,b,c]) { pos.push(p.x,p.y,p.z); cols.push(cc.r,cc.g,cc.b); }
  }
  levels.slice(0,-1).forEach((l,k) => {
    const col=new T.Color(l.color);
    for(let i=0;i<N;i++) {
      const j=(i+1)%N;
      // Per-face color and alternating diagonals make a naturally sheared rock face.
      if(i%2) {tri(rings[k][i],rings[k+1][i],rings[k][j],col);tri(rings[k][j],rings[k+1][i],rings[k+1][j],col);}
      else {tri(rings[k][i],rings[k+1][i],rings[k+1][j],col);tri(rings[k][i],rings[k+1][j],rings[k][j],col);}
    }
  });
  // A rough, broad underside closes the slab instead of converging on one spike.
  const bottomCenter=new T.Vector3(LAND.cx+6,-51,LAND.cz-4);
  for(let i=0;i<N;i++) tri(rings[rings.length-1][i],bottomCenter,rings[rings.length-1][(i+1)%N],new T.Color('#4b5951'));
  const stoneGeo = new T.BufferGeometry();
  stoneGeo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
  stoneGeo.setAttribute('color',new T.Float32BufferAttribute(cols,3));
  stoneGeo.computeVertexNormals();
  const rockUV=[];for(let i=0;i<pos.length;i+=3)rockUV.push((pos[i]+pos[i+2]*.43)*.026,pos[i+1]*.04);
  stoneGeo.setAttribute('uv',new T.Float32BufferAttribute(rockUV,2));
  const stoneMat = ctx.material('#b4b6ad','geology').clone();stoneMat.vertexColors=true;stoneMat.roughness=.98;stoneMat.flatShading=true;stoneMat.side=T.DoubleSide;
  const earth=new T.Mesh(stoneGeo,stoneMat);
  earth.castShadow=true; earth.receiveShadow=true; group.add(earth);

  // Low polygon stones are instanced: many geological details, only one draw call.
  const rockGeo=new T.IcosahedronGeometry(1,0);
  const rockMat=ctx.material('#737773','geology').clone();rockMat.flatShading=true;
  const rocks=new T.InstancedMesh(rockGeo,rockMat,240);
  const dummy=new T.Object3D();
  const color=new T.Color();
  for(let i=0;i<240;i++) {
    const a=rand()*Math.PI*2;
    const layer=2+Math.floor(rand()*9), l=levels[layer];
    const idx=Math.floor(a/(Math.PI*2)*N)%N;
    const p=rings[layer][idx];
    const r=.55+rand()*1.55;
    dummy.position.set(p.x,p.y-.3,p.z);
    dummy.rotation.set(rand()*3,rand()*6,rand()*3);
    dummy.scale.set(r*(.7+rand()),r*(1.15+rand()*1.2),r*(.65+rand()));
    dummy.updateMatrix(); rocks.setMatrixAt(i,dummy.matrix);
    color.set(['#555f58','#747970','#8a8877','#626c64','#697065'][i%5]);
    rocks.setColorAt(i,color);
  }
  rocks.castShadow=true; rocks.receiveShadow=true; group.add(rocks);

  // Sheared hanging plates give the lower silhouette real torn-out depth. The
  // thick upper cliffs stay near the turf edge so they remain visible from above.
  const shardGeo=new T.ConeGeometry(1,1,5,1,false);
  shardGeo.rotateZ(Math.PI);
  const shards=new T.InstancedMesh(shardGeo,rockMat,58);
  for(let i=0;i<58;i++) {
    const idx=Math.floor(rand()*N),layer=8+Math.floor(rand()*3),p=rings[layer][idx];
    const height=7+rand()*12;
    dummy.position.set(p.x,p.y-height*.25,p.z);
    dummy.rotation.set((rand()-.5)*.28,rand()*Math.PI,(rand()-.5)*.25);
    dummy.scale.set(1.8+rand()*3.1,height,1.6+rand()*3.4);
    dummy.updateMatrix();shards.setMatrixAt(i,dummy.matrix);
    color.set(['#536158','#677267','#738074','#48594f'][i%4]);shards.setColorAt(i,color);
  }
  shards.castShadow=true;shards.receiveShadow=true;group.add(shards);

  // Rust brown root bundles emerge from the turf, curve around stone, then break off.
  const rootMat=new T.MeshStandardMaterial({color:'#4b3826',roughness:1});
  const rootEnds=[];
  for(let i=0;i<38;i++) {
    const idx=Math.floor(rand()*N), p=contour[idx];
    const length=2+rand()*5;
    const inward=new T.Vector3(LAND.cx-p.x,0,LAND.cz-p.y).normalize();
    const points=[
      new T.Vector3(p.x*.999,-.2,p.y*.999),
      new T.Vector3(p.x*1.006,-.9,p.y*1.006),
      new T.Vector3(p.x+inward.x*.35+Math.sin(i)*.35,-length*.65,p.y+inward.z*.35),
      new T.Vector3(p.x+inward.x*1.1,-length,p.y+inward.z*1.1)
    ];
    const curve=new T.CatmullRomCurve3(points);
    const tube=new T.Mesh(new T.TubeGeometry(curve,9,.045+rand()*.065,4,false),rootMat);
    tube.castShadow=true; group.add(tube);
    if(i%2===0) {
      const end=points[2].clone(); end.x+=.5;end.y-=.8;end.z+=.2;
      const branch=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([points[1],points[2],end]),5,.024,3,false),rootMat);
      group.add(branch);
    }
    rootEnds.push(points[3]);
  }

  // Fallen sediment, moss patches and edge stones break up the cut turf rim.
  const edgeGeo=new T.IcosahedronGeometry(1,0);
  const edgeMat=new T.MeshStandardMaterial({color:'#666b4c',roughness:1,flatShading:true});
  const edgeBits=new T.InstancedMesh(edgeGeo,edgeMat,320);
  for(let i=0;i<320;i++) {
    const idx=Math.floor(rand()*N),p=contour[idx];
    dummy.position.set(p.x*(.992+rand()*.009),-.07-rand()*.4,p.y*(.992+rand()*.009));
    dummy.rotation.set(rand()*2,rand()*6,rand()*2);
    dummy.scale.set(.13+rand()*.38,.07+rand()*.2,.13+rand()*.4);
    dummy.updateMatrix();edgeBits.setMatrixAt(i,dummy.matrix);
    color.set(['#7a7756','#8a7c54','#686948','#88816a','#9a7951'][i%5]); edgeBits.setColorAt(i,color);
  }
  edgeBits.castShadow=true;group.add(edgeBits);

  // Humid coastal moss hugs the soil cut; tiny gravel grains gather beneath it.
  const mossMat=ctx.material('#6a7950','grass').clone(),moss=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),mossMat,470);
  for(let i=0;i<470;i++){
    const id=Math.floor(rand()*N),p=contour[id],deep=rand()*2.1;
    dummy.position.set(p.x*1.003,-.3-deep,p.y*1.003);dummy.rotation.set(rand(),rand()*6.28,rand());
    dummy.scale.set(.25+rand()*.8,.09+rand()*.3,.22+rand()*.7);dummy.updateMatrix();moss.setMatrixAt(i,dummy.matrix);
  }moss.castShadow=false;moss.receiveShadow=true;group.add(moss);
  const gravelMat=ctx.material('#aba18a','stone'),gravel=new T.InstancedMesh(edgeGeo,gravelMat,720);
  for(let i=0;i<720;i++){
    const id=Math.floor(rand()*N),p=rings[1][id];dummy.position.set(p.x,-.6-rand()*1.1,p.z);
    dummy.rotation.set(rand(),rand()*6.28,rand());const s=.03+rand()*.12;dummy.scale.set(s,s*.7,s*1.1);dummy.updateMatrix();gravel.setMatrixAt(i,dummy.matrix);
  }gravel.receiveShadow=true;group.add(gravel);

  // A very low, cool emission lifts the geology below the moonlit city. Modulate
  // it by the actual rock albedo and view normal, preserving strata and crevices.
  // This shares one uniform across existing materials and adds no scene lights.
  const nightFill={value:0};
  for(const mat of[stoneMat,rockMat,edgeMat]){
    const before=mat.onBeforeCompile,key=mat.customProgramCacheKey();
    mat.onBeforeCompile=shader=>{
      before.call(mat,shader);shader.uniforms.islandNightFill=nightFill;
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float islandNightFill;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        float islandRim=pow(1.-abs(dot(normal,normalize(vViewPosition))),2.);
        totalEmissiveRadiance+=diffuseColor.rgb*vec3(.19,.26,.37)*islandNightFill*(.65+.35*islandRim);`);
    };
    mat.customProgramCacheKey=()=>key+'-moonlit-geology-v1';
  }
  earth.name='Layered floating geology with restrained nocturnal fill';
  return { group, contour, nightFill, hills:[], setNight(value){nightFill.value=value?.72:0;}, update() {} };
}

