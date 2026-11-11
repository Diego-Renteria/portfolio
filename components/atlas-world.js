import * as T from '../three.module.js?v=b477ce33502c';

export const RADIUS=778;
const BUILDING_SCALE=.62;
const WORLD_UP=new T.Vector3(0,1,0);
const WATER=new T.Color('#25465b');
const ROAD_COLOR=new T.Color('#262c31');
const clamp=T.MathUtils.clamp;
const smooth=T.MathUtils.smoothstep;

export function globePoint(x,z,height=0){
  const distance=Math.hypot(x,z),angle=distance/RADIUS;
  const radial=distance>0?Math.sin(angle)/distance:0;
  return new T.Vector3(x*radial,Math.cos(angle),z*radial).multiplyScalar(RADIUS+height);
}

function terrainSampler(data){
  const {steps,extent,terrain}=data;
  return (x,z)=>{
    const gx=clamp((x/extent+1)*steps/2,0,steps-.00001);
    const gz=clamp((z/extent+1)*steps/2,0,steps-.00001);
    const i=Math.floor(gx),j=Math.floor(gz),u=gx-i,v=gz-j;
    const a=(j*(steps+1)+i)*2,b=a+(steps+1)*2;
    const blend=k=>T.MathUtils.lerp(T.MathUtils.lerp(terrain[a+k],terrain[a+k+2],u),
      T.MathUtils.lerp(terrain[b+k],terrain[b+k+2],u),v);
    return {shore:blend(0),height:blend(1)*.5};
  };
}

function citySurface(data,sample){
  const {steps,extent}=data;
  const positions=[],colors=[],indices=[],uvs=[],opacity=[];
  const green=new T.Color('#475449'),urban=new T.Color('#65605a'),shore=new T.Color('#77644d');
  for(let j=0;j<=steps;j++)for(let i=0;i<=steps;i++){
    const x=(i/steps*2-1)*extent,z=(j/steps*2-1)*extent,field=sample(x,z);
    const fade=1-smooth(Math.hypot(x,z),570,722),land=smooth(field.shore,-8,9)*fade;
    const noise=.5+.24*Math.sin(x*.057+z*.071)+.22*Math.sin(x*.18-z*.093);
    const tone=green.clone().lerp(urban,smooth(noise,.12,.83)).lerp(shore,1-smooth(field.shore,0,21));
    positions.push(...globePoint(x,z,Math.max(.45,field.height*.7*fade)+.18));
    colors.push(...tone);uvs.push(x,z);opacity.push(land);
    if(i<steps&&j<steps){
      const a=j*(steps+1)+i,b=a+steps+1;
      indices.push(a,b,a+1,a+1,b,b+1);
    }
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  g.setAttribute('groundOpacity',new T.Float32BufferAttribute(opacity,1));
  g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.77,metalness:.12,transparent:true,depthWrite:false});
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float groundOpacity; varying float vLand; varying vec2 vGround;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvGround=uv;vLand=groundOpacity;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vLand; varying vec2 vGround;')
      .replace('#include <color_fragment>',`#include <color_fragment>
        float grains = sin(vGround.x*1.9+vGround.y*2.4)*sin(vGround.y*1.7-vGround.x*2.1);
        diffuseColor.rgb *= 1.+grains*.067;
        diffuseColor.a*=vLand;
        if(diffuseColor.a<.02)discard;`);
  };
  return new T.Mesh(g,material);
}

function batch(){
  return {p:[],c:[],uv:[],kind:[],i:[],vertex(point,color,u=0,v=0,kind=0){
    this.p.push(...point);this.c.push(...color);this.uv.push(u,v);this.kind.push(kind);
  },mesh(material){
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(this.p,3));
    geometry.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(this.uv,2));
    geometry.setAttribute('surfaceKind',new T.Float32BufferAttribute(this.kind,1));
    geometry.setIndex(this.i);geometry.computeVertexNormals();geometry.computeBoundingSphere();
    return new T.Mesh(geometry,material);
  }};
}

function addRoof(target,outer,holes,position,color,style){
  const contour=outer.slice(0,-1).map(p=>new T.Vector2(...p));
  const cavities=holes.map(hole=>hole.slice(0,-1).map(p=>new T.Vector2(...p)));
  const faces=T.ShapeUtils.triangulateShape(contour,cavities),start=target.p.length/3;
  for(const vertex of [...contour,...cavities.flat()])target.vertex(position(vertex.x,vertex.y),color,vertex.x,vertex.y,style);
  for(const f of faces)target.i.push(start+f[0],start+f[2],start+f[1]);
  const face=faces[0],vertices=[...contour,...cavities.flat()];
  return face?.reduce((sum,i)=>sum.add(vertices[i]),new T.Vector2()).multiplyScalar(1/3);
}

function addWall(target,ring,base,height,color,style,phase,roof=ring){
  for(let i=1;i<ring.length;i++){
    const [x0,z0]=ring[i-1],[x1,z1]=ring[i],length=Math.hypot(x1-x0,z1-z0);
    if(length<.11)continue;
    const index=target.p.length/3;
    target.vertex(globePoint(x0,z0,base),color,phase,0,style);
    target.vertex(globePoint(x1,z1,base),color,length+phase,0,style);
    target.vertex(globePoint(...roof[i],base+height),color,length+phase,height,style);
    target.vertex(globePoint(...roof[i-1],base+height),color,phase,height,style);
    target.i.push(index,index+1,index+2,index,index+2,index+3);
  }
}

function cityBuildings(data,ground){
  const target=batch();
  const faceRanges=[];
  const rooftop=[];
  const palettes=[
    ['#9b7964','#7a706b','#9f8c75','#748287','#8a7164'],
    ['#465d68','#516a72','#576f7d','#435365','#64757a'],
    ['#9e8e72','#938b81','#91735d','#8e7967','#a3947d'],
  ].map(p=>p.map(value=>new T.Color(value)));
  for(const [id,[height,style,ring,holes,name]] of data.buildings.entries()){
    if(ring.length<4)continue;
    const center=ring.reduce((acc,p)=>[acc[0]+p[0],acc[1]+p[1]],[0,0]).map(v=>v/ring.length);
    const base=ground(...center)+.8,scaled=height*BUILDING_SCALE;
    const color=palettes[style][id%5],phase=id*19.7;
    const library=name.includes('Seattle Public Library');
    const top=line=>library?line.map(([x,z])=>[center[0]+(x-center[0])*.79+5,center[1]+(z-center[1])*.90-4]):line;
    for(const line of [ring,...holes])addWall(target,line,base,scaled,color,library?4:style+1,phase,top(line));
    const roofPoint=addRoof(target,top(ring),holes.map(top),(x,z)=>globePoint(x,z,base+scaled),color.clone().multiplyScalar(.66),0);
    if(roofPoint&&height>15&&!library&&id%3!==1){
      rooftop.push([roofPoint.x,roofPoint.y,base+scaled+.6,id]);
    }
    faceRanges.push({end:target.i.length/3,id});
  }
  const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.76,side:T.DoubleSide,emissive:'#ffd9a2',emissiveIntensity:.9});
  mat.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float surfaceKind; varying vec3 vBuilding;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvBuilding=vec3(uv,surfaceKind);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 vBuilding;
      float atlasRandom(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }`)
      .replace('#include <color_fragment>',`#include <color_fragment>
        float style=vBuilding.z;
        vec2 dims=vec2(style>2.5?3.6:style>1.5?3.25:3.95,style>1.5&&style<2.5?2.5:2.28);
        vec2 grid=vBuilding.xy/dims,cell=floor(grid),local=fract(grid);
        float glass=max(step(style,2.5)*step(1.5,style),step(3.5,style));
        vec2 rim=mix(vec2(.20,.25),vec2(.085,.145),glass);
        vec2 aa=clamp(fwidth(grid),vec2(.003),vec2(.3));
        vec2 windowShape=smoothstep(rim-aa,rim+aa,local)*(1.-smoothstep(1.-rim-aa,1.-rim+aa,local));
        float footprint=max(aa.x,aa.y);
        float facing=windowShape.x*windowShape.y*step(.5,style)*(1.-smoothstep(.17,.39,footprint));
        float blinds=step(.65,atlasRandom(cell+vec2(4.4,1.2)))*smoothstep(.58,.63,local.y);
        float lit=step(.64,atlasRandom(cell+floor(vBuilding.x/18.)*.31))*(1.-blinds);
        vec3 cool=vec3(.04,.09,.13)*(1.+.64*local.y+glass*.38);
        float grain=(atlasRandom(floor(vBuilding.xy*2.5))-.5)*(1.-smoothstep(.035,.15,footprint));
        diffuseColor.rgb *= .96+.12*grain;
        diffuseColor.rgb=mix(diffuseColor.rgb,cool,facing*.87);
        if(style>3.5){
          vec2 diamonds=abs(fract(vec2(grid.x+grid.y,grid.x-grid.y))-.5);
          float frame=smoothstep(.39,.48,max(diamonds.x,diamonds.y));
          diffuseColor.rgb=mix(vec3(.073,.13,.18),vec3(.38,.44,.48),frame*.68);
        }
      `).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        float band=exp(-pow((local.y-.67)*2.8,2.));
        vec3 lamp=mix(vec3(.57,.72,1.),vec3(1.,.56,.24),smoothstep(.14,.76,atlasRandom(cell+vec2(6.1,3.3))));
        float distant=smoothstep(.13,.40,footprint)*step(.5,style);
        float suite=atlasRandom(vec2(floor(vBuilding.x/24.),floor(vBuilding.y/10.)));
        float strip=mix(.36,.12,smoothstep(.20,.43,footprint));
        totalEmissiveRadiance=lamp*band*lit*facing*.46+vec3(.78,.53,.33)*distant*(.025+suite*.038+strip*band*.045);
      `);
  };
  const mesh=target.mesh(mat);
  mesh.userData.buildingAtFace=face=>faceRanges.find(range=>face<range.end)?.id;
  const equipment=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:'#6e767a',roughness:.81}),rooftop.length);
  const form=new T.Object3D();
  for(const [i,[x,z,h,id]] of rooftop.entries()){
    form.position.copy(globePoint(x,z,h));
    form.quaternion.setFromUnitVectors(WORLD_UP,form.position.clone().normalize());
    form.rotateY(id*.53);form.scale.set(2.6+id%5,1.05,2.3+id%3);form.updateMatrix();
    equipment.setMatrixAt(i,form.matrix);
  }
  return {mesh,equipment};
}

function segmentStrip(target,a,b,width,offset,elevation,ground,color){
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
  if(length<.15)return;
  const px=-dz/length,pz=dx/length,left=offset-width/2,right=offset+width/2;
  const start=target.p.length/3;
  for(const [point,side] of [[a,left],[a,right],[b,right],[b,left]]){
    const x=point[0]+px*side,z=point[1]+pz*side;
    target.vertex(globePoint(x,z,ground(x,z)+elevation),color);
  }
  target.i.push(start,start+1,start+2,start,start+2,start+3);
}

function cityStreets(data,ground){
  const target=batch();
  const concrete=new T.Color('#918576'),paver=new T.Color('#6e5d54'),paint=new T.Color('#a99d73'),wood=new T.Color('#746253');
  for(const [name,width,traffic,points] of data.roads){
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const divisions=Math.max(1,Math.ceil(length/10));
      const at=t=>[T.MathUtils.lerp(a[0],b[0],t),T.MathUtils.lerp(a[1],b[1],t)];
      for(let j=0;j<divisions;j++){
        const start=at(j/divisions),end=at((j+1)/divisions);
        segmentStrip(target,start,end,width+2.5,0,.62,ground,concrete);
        segmentStrip(target,start,end,width,0,.78,ground,traffic?ROAD_COLOR:paver);
      }
      if(traffic&&name&&width>=7.2&&length>16){
        for(let d=5;d<length-7;d+=9)segmentStrip(target,at(d/length),at((d+2.4)/length),.21,0,.91,ground,paint);
      }
    }
  }
  for(const pier of data.piers)addRoof(target,pier,[],(x,z)=>globePoint(x,z,2.1),wood,0);
  return target.mesh(new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.92}));
}

function cityTrees(data,ground){
  const group=new T.Group(),form=new T.Object3D();
  const leafColors=['#a75430','#c97b32','#bc9747','#58694a','#98452d','#757347'].map(c=>new T.Color(c));
  const leaf=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),new T.MeshStandardMaterial({roughness:.95}),data.trees.length*2);
  const trunk=new T.InstancedMesh(new T.CylinderGeometry(.22,.34,1,5),new T.MeshStandardMaterial({color:'#665345',roughness:1}),data.trees.length);
  for(const [i,[x,z,height,species]] of data.trees.entries()){
    const base=ground(x,z),dir=globePoint(x,z).normalize(),h=height*.86;
    form.quaternion.setFromUnitVectors(WORLD_UP,dir);
    form.position.copy(globePoint(x,z,base+h*.27));
    form.scale.set(h*.16,h*.54,h*.16);form.updateMatrix();trunk.setMatrixAt(i,form.matrix);
    const crown=species===3?.20:.32,color=leafColors[species===3?3:species===2?2:(i+species)%leafColors.length];
    for(let j=0;j<2;j++){
      form.position.copy(globePoint(x+(j?-.13:.08)*h,z,base+h*(.62+j*.22)));
      form.scale.set(h*crown*(1-j*.27),h*(species===3?.36:.30),h*crown*.86);
      form.rotateY(i*1.63);form.updateMatrix();
      leaf.setMatrixAt(i*2+j,form.matrix);
      leaf.setColorAt(i*2+j,color.clone().multiplyScalar(j?.98:.78));
    }
  }
  group.add(trunk,leaf);
  return group;
}

function atmosphere(){
  const glow=new T.Mesh(new T.SphereGeometry(RADIUS*1.026,96,64),new T.ShaderMaterial({
    side:T.BackSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`varying vec3 vDir; varying vec3 vNormal;
      void main(){vec4 p=modelViewMatrix*vec4(position,1.);vDir=-p.xyz;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*p;}`,
    fragmentShader:`varying vec3 vDir;varying vec3 vNormal;
      void main(){float rim=pow(1.-abs(dot(normalize(vDir),normalize(vNormal))),3.6);
        gl_FragColor=vec4(vec3(.15,.37,.68),rim*.49);}`,
  }));
  glow.renderOrder=2;
  return glow;
}

function deepOcean(){
  const material=new T.MeshStandardMaterial({color:WATER,roughness:.77,metalness:.12});
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vOcean;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvOcean=normalize(position);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 vOcean;
      float oceanHash(vec3 p){return fract(sin(dot(p,vec3(17.17,57.31,91.19)))*43758.54);}
      float oceanNoise(vec3 p){
        vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        float a=mix(oceanHash(i),oceanHash(i+vec3(1,0,0)),f.x);
        float b=mix(oceanHash(i+vec3(0,1,0)),oceanHash(i+vec3(1,1,0)),f.x);
        float c=mix(oceanHash(i+vec3(0,0,1)),oceanHash(i+vec3(1,0,1)),f.x);
        float d=mix(oceanHash(i+vec3(0,1,1)),oceanHash(i+vec3(1,1,1)),f.x);
        return mix(mix(a,b,f.y),mix(c,d,f.y),f.z);
      }`).replace('#include <color_fragment>',`#include <color_fragment>
        vec3 pos=normalize(vOcean);
        float outside=1.-smoothstep(.29,.62,pos.y);
        float broad=oceanNoise(pos*5.7)*.68+oceanNoise(pos*17.1+2.)*.32;
        float shallow=smoothstep(.42,.74,broad)*outside;
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.037,.137,.155),shallow*.63);
        float clouds=oceanNoise(pos*vec3(10.,23.,11.)+vec3(broad*1.8))* .67+oceanNoise(pos*44.)*.33;
        float cloud=smoothstep(.57,.80,clouds)*outside*(.43+shallow*.30);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.26,.29),cloud);
      `);
  };
  return material;
}

export function buildAtlasCity(data){
  const group=new T.Group(),sample=terrainSampler(data),ground=(x,z)=>Math.max(.45,sample(x,z).height*.7);
  const sphere=new T.SphereGeometry(RADIUS,128,88),ocean=deepOcean();
  const {mesh:buildings,equipment}=cityBuildings(data,ground);
  group.add(new T.Mesh(sphere,ocean),citySurface(data,sample),cityStreets(data,ground),buildings,equipment,cityTrees(data,ground),atmosphere());
  return {group,buildings,ground,point(x,z,h=0){return globePoint(x,z,ground(x,z)+h);}};
}

export function disposeAtlasCity(city){
  city.group.traverse(object=>{
    object.geometry?.dispose();
    object.material?.map?.dispose();
    object.material?.dispose();
    if(object.isInstancedMesh)object.dispose();
  });
}
