import {patrolFlash} from './traffic-activity.js?v=city-traffic-1';

// Two softly overlapping low-beam footprints in one instanced draw, rather than
// hundreds of forward-rendered lights. Depth testing keeps them behind street furniture.
export function createVehicleLightSpill(T,parent,cars,{roadY=.057,patrolGlow=false}={}){
  const group=new T.Group();group.name='Vehicle low-beam pavement illumination';parent.add(group);
  const uniforms={strength:{value:0}};
  const material=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,
    vertexShader:`varying vec2 p;void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 p;uniform float strength;void main(){
      float forward=1.-p.y;
      float spread=mix(.15,.30,forward);
      float left=exp(-pow((p.x-.36)/spread,2.)*1.6);
      float right=exp(-pow((p.x-.64)/spread,2.)*1.6);
      float edge=smoothstep(0.,.20,forward)*exp(-forward*2.5)*(1.-smoothstep(.70,1.,forward));
      float side=smoothstep(0.,.22,p.x)*(1.-smoothstep(.78,1.,p.x));
      gl_FragColor=vec4(vec3(.91,.94,1.),(left+right)*.5*edge*side*strength);
    }`});
  const mesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),material,cars.length);
  mesh.name='Soft paired low-beam road footprints';mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;group.add(mesh);
  const brakeStrength=new T.InstancedBufferAttribute(new Float32Array(cars.length),1);
  const brakeGeo=new T.PlaneGeometry(1,1);brakeGeo.setAttribute('brakeStrength',brakeStrength);
  const brakeMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,
    vertexShader:`attribute float brakeStrength;varying float b;varying vec2 p;void main(){p=uv;b=brakeStrength;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
    fragmentShader:`varying float b;varying vec2 p;void main(){float glow=exp(-dot((p-.5)*vec2(2.3,2.),(p-.5)*vec2(2.3,2.))*1.6);float edge=smoothstep(0.,.23,p.x)*(1.-smoothstep(.77,1.,p.x))*smoothstep(0.,.23,p.y)*(1.-smoothstep(.77,1.,p.y));gl_FragColor=vec4(1.,.025,.008,(.13+b*.87)*glow*edge*.20);}`});
  const brakeMesh=new T.InstancedMesh(brakeGeo,brakeMaterial,cars.length);brakeMesh.name='Soft brake-light reflections behind vehicles';brakeMesh.frustumCulled=false;brakeMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(brakeMesh);
  // Camera-facing optical glow keeps subpixel lenses readable from the island
  // camera. Depth testing still hides lamps behind buildings; no per-car lights.
  const lensGlow=new T.InstancedBufferAttribute(new Float32Array(cars.length*4),1),lensRear=new T.InstancedBufferAttribute(new Float32Array(cars.length*4),1);
  const haloGeo=new T.PlaneGeometry(1,1);haloGeo.setAttribute('lensGlow',lensGlow);haloGeo.setAttribute('lensRear',lensRear);
  const haloMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,
    vertexShader:`attribute float lensGlow;attribute float lensRear;varying vec2 p;varying float glow;varying float rear;void main(){p=uv*2.-1.;glow=lensGlow;rear=lensRear;vec4 v=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);v.xy+=position.xy*length(instanceMatrix[0].xyz);gl_Position=projectionMatrix*v;}`,
    fragmentShader:`varying vec2 p;varying float glow;varying float rear;void main(){float r=dot(p,p);float a=(exp(-r*3.6)*.65+exp(-r*13.)*.35)*(1.-smoothstep(.72,1.,r));gl_FragColor=vec4(mix(vec3(.91,.95,1.),vec3(1.,.035,.012),rear),a*glow);}`});
  const halos=new T.InstancedMesh(haloGeo,haloMaterial,cars.length*4);halos.name='Distance-aware headlamp and brake-lamp optical glow';halos.instanceMatrix.setUsage(T.DynamicDrawUsage);halos.frustumCulled=false;group.add(halos);
  const patrolHalos=[];
  if(patrolGlow){
    const pixels=new Uint8Array(32*32*4);
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){
      const r=Math.hypot(x-15.5,y-15.5)/15.5,i=(y*32+x)*4;
      pixels[i]=pixels[i+1]=pixels[i+2]=255;
      pixels[i+3]=Math.round(255*Math.max(0,Math.exp(-r*r*5.5)-.006));
    }
    const texture=new T.DataTexture(pixels,32,32);texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
    for(const tint of ['#ff263c','#477bff']){
      const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,color:tint,opacity:.78,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));
      sprite.visible=false;patrolHalos.push(sprite);group.add(sprite);
    }
  }
  const dummy=new T.Object3D();let night=false,view='overview';
  function apply(){uniforms.strength.value=night?(view==='overview'?.26:.18):0;group.visible=night;}
  let time=0,patrol;
  function update(elapsed=time,officer=patrol){time=elapsed;patrol=officer;for(const [i,car]of cars.entries()){
    const p=car.p,reach=3.3+Math.min(.6,car.length*.16),ahead=car.length*.5+reach*.5-.25;
    dummy.position.set(p.x+p.dx*ahead,roadY,p.z+p.dz*ahead);
    dummy.rotation.set(-Math.PI/2,0,Math.atan2(p.dx,p.dz));
    dummy.scale.set(car.active===false?0:2.8,car.active===false?0:reach,1);
    dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    const behind=car.length*.5+.33;dummy.position.set(p.x-p.dx*behind,roadY+.001,p.z-p.dz*behind);dummy.scale.set(car.active===false?0:1.9,car.active===false?0:1.35,1);dummy.updateMatrix();brakeMesh.setMatrixAt(i,dummy.matrix);brakeStrength.setX(i,car.active===false?0:car.brakeLight??0);
    let lens=0;for(const end of[1,-1])for(const side of[-1,1]){
      const index=i*4+lens++;
      const [offset,y,front]=car.lamps?.[end>0?'headlight':'taillight'][side<0?0:1]??[side*.32,.36,end*(car.length*.5+.025)];
      dummy.position.set(p.x+p.dx*front+p.dz*offset,roadY+y,p.z+p.dz*front-p.dx*offset);dummy.rotation.set(0,0,0);
      dummy.scale.setScalar(car.active===false?0:view==='overview'?1.0:.54);dummy.updateMatrix();halos.setMatrixAt(index,dummy.matrix);
      lensRear.setX(index,end<0?1:0);lensGlow.setX(index,car.active===false?0:end>0?.50:.12+(car.brakeLight??0)*.55);
    }
  }
  for(const [index,halo]of patrolHalos.entries()){
    halo.visible=!!officer?.active&&patrolFlash(elapsed,index===0);
    if(!halo.visible)continue;
    const side=index===0?-.23:.23;
    halo.position.set(officer.p.x+officer.p.dz*side,roadY+officer.height,officer.p.z-officer.p.dx*side);
    halo.scale.setScalar(view==='overview'?2.2:1.35);
  }
  mesh.instanceMatrix.needsUpdate=true;brakeMesh.instanceMatrix.needsUpdate=true;brakeStrength.needsUpdate=true;halos.instanceMatrix.needsUpdate=true;lensGlow.needsUpdate=true;lensRear.needsUpdate=true;}
  update();apply();return{group,mesh,brakeMesh,halos,uniforms,update,setNight(value){night=!!value;apply();},setQuality(_quality,currentView){view=currentView;apply();update();}};
}
