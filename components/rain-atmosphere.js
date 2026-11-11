import {Reflector} from './reflector.js?v=b477ce33502c';
import {flatRoadXs,flatRoadZs,roadExtent,insideLand} from './geography.js?v=b477ce33502c';

// Area-weighted triangles keep precipitation and impacts on actual carriageways,
// including curved roads in alternative editions, rather than inside buildings.
export function createRainRoadSampler(geometry,random=Math.random){
 const p=geometry.attributes.position,index=geometry.index,triangles=[];let area=0;
 for(let i=0;i<(index?index.count:p.count);i+=3){const a=index?index.getX(i):i,b=index?index.getX(i+1):i+1,c=index?index.getX(i+2):i+2;
  const ax=p.getX(a),az=-p.getY(a),bx=p.getX(b),bz=-p.getY(b),cx=p.getX(c),cz=-p.getY(c),weight=Math.abs((bx-ax)*(cz-az)-(bz-az)*(cx-ax))*.5;
  if(weight>1e-8){area+=weight;triangles.push({ax,az,bx,bz,cx,cz,end:area});}
 }
 if(!triangles.length)throw new Error('Rain needs a nonempty carriageway surface');
 return{area,triangleCount:triangles.length,sample(){const target=random()*area;let lo=0,hi=triangles.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(triangles[mid].end<target)lo=mid+1;else hi=mid;}const t=triangles[lo],u=Math.sqrt(random()),v=random();return{x:t.ax*(1-u)+t.bx*u*(1-v)+t.cx*u*v,z:t.az*(1-u)+t.bz*u*(1-v)+t.cz*u*v};}};
}
const noiseGLSL=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float puddleMask(vec2 p){return smoothstep(.46,.70,noise(p*.29)*.82+noise(p*1.4)*.18);}`;

/** GPU precipitation, transient impacts and a shared nonmetal wet-road reflection. */
export function buildRainAtmosphere(ctx){
 const {THREE:T,world}=ctx,group=new T.Group(),effects=new T.Group();group.name='Midnight rain / illuminated precipitation and wet streets';effects.name='Rain streaks and surface impacts';world.add(group);group.add(effects);
 let enabled=false,view='overview',clock=0,quality='high',frame=0,firstCapture=true,layoutId='original',seed=731;
 const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
 const pos=[],ind=[];function quad(x0,x1,z0,z1){if(![[x0,z0],[x0,z1],[x1,z0],[x1,z1]].every(([x,z])=>insideLand(x,z,9)))return;const n=pos.length/3;pos.push(x0,-z0,0,x1,-z0,0,x0,-z1,0,x1,-z1,0);ind.push(n,n+2,n+1,n+1,n+2,n+3);}
 for(const z of flatRoadZs){const r=roadExtent('x',z);if(r)for(let x=r[0];x<r[1];x+=2)quad(x,Math.min(x+2,r[1]),z-2.77,z+2.77);}
 for(const x of flatRoadXs){const r=roadExtent('z',x);if(!r)continue;let lo=r[0];for(const z of flatRoadZs){const hi=Math.min(z-2.8,r[1]);for(let q=lo;q<hi;q+=2)quad(x-3.27,x+3.27,q,Math.min(q+2,hi));lo=Math.max(lo,z+2.8);}for(let q=lo;q<r[1];q+=2)quad(x-3.27,x+3.27,q,Math.min(q+2,r[1]));}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(ind);geo.computeVertexNormals();
 const time={value:0},stadium={value:0},texel={value:new T.Vector2(1/768,1/512)};
 const reflection=new Reflector(geo,{textureWidth:768,textureHeight:512,clipBias:.0005,multisample:0});reflection.name='Patchy wet asphalt / shared scene reflection';reflection.rotation.x=-Math.PI/2;reflection.position.y=.039;reflection.renderOrder=1;
 Object.assign(reflection.material,{transparent:true,depthWrite:false});Object.assign(reflection.material.uniforms,{wetTime:time,stadium,texel});
 reflection.material.vertexShader=`uniform mat4 textureMatrix;varying vec4 vUv;varying vec2 roadXZ;varying vec3 waterPosition;varying vec3 waterNormal;
 void main(){roadXZ=vec2(position.x,-position.y);vUv=textureMatrix*vec4(position,1.);vec4 w=modelMatrix*vec4(position,1.);waterPosition=w.xyz;waterNormal=normalize(mat3(modelMatrix)*vec3(0.,0.,1.));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
 reflection.material.fragmentShader=`uniform sampler2D tDiffuse;uniform float wetTime;uniform float stadium;uniform vec2 texel;varying vec4 vUv;varying vec2 roadXZ;varying vec3 waterPosition;varying vec3 waterNormal;${noiseGLSL}
 vec2 rainRipples(vec2 p){vec2 cell=floor(p*1.7),result=vec2(0.);for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 id=cell+vec2(float(x),float(y));float h=hash(id);vec2 center=(id+vec2(h,hash(id+12.7)))/1.7,d=p-center;float r=length(d),age=fract(wetTime*.77+h*7.),front=age*.64;float envelope=exp(-abs(r-front)*35.)*sin(age*3.14159)*(1.-smoothstep(.5,.9,r));result+=d/max(r,.01)*cos((r-front)*52.)*envelope;}return result;}
 void main(){if(stadium>.5&&roadXZ.x>55.&&roadXZ.x<127.&&roadXZ.y>30.&&roadXZ.y<82.)discard;
  float puddle=puddleMask(roadXZ);vec2 uv=vUv.xy/vUv.w;vec2 micro=vec2(noise(roadXZ*17.),noise(roadXZ.yx*19.+7.))-0.5;
  uv+=micro*.00065+rainRipples(roadXZ)*(.0005+puddle*.0013);vec2 blur=texel*mix(2.6,.48,puddle);
  vec3 reflected=texture2D(tDiffuse,uv).rgb*.28;
  reflected+=(texture2D(tDiffuse,uv+vec2(blur.x,blur.y)).rgb+texture2D(tDiffuse,uv-vec2(blur.x,blur.y)).rgb+texture2D(tDiffuse,uv+vec2(-blur.x,blur.y)).rgb+texture2D(tDiffuse,uv+vec2(blur.x,-blur.y)).rgb)*.18;
  float fresnel=.02+.98*pow(1.-clamp(dot(normalize(cameraPosition-waterPosition),waterNormal),0.,1.),5.);
  gl_FragColor=vec4(reflected,mix(.055,.22+fresnel*.58,puddle));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;group.add(reflection);

 const maxDrops=5200,lampLimit=12,lamps=Array.from({length:lampLimit},()=>new T.Vector3(0,-100,0));
 const uniforms={wetTime:time,stadium,lampSites:{value:lamps},viewportHeight:{value:900},overview:{value:1}};
 const plane=new T.PlaneGeometry(1,1);
 function instancedPlane(){const g=new T.InstancedBufferGeometry();g.index=plane.index;g.attributes.position=plane.attributes.position;g.attributes.uv=plane.attributes.uv;return g;}
 const rainGeo=instancedPlane(),origins=new Float32Array(maxDrops*3),parameters=new Float32Array(maxDrops*4);
 rainGeo.setAttribute('rainOrigin',new T.InstancedBufferAttribute(origins,3));rainGeo.setAttribute('rainParameters',new T.InstancedBufferAttribute(parameters,4));
 const rainMat=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,uniforms,
 vertexShader:`attribute vec3 rainOrigin;attribute vec4 rainParameters;uniform float wetTime;uniform float viewportHeight;uniform float overview;uniform vec3 lampSites[12];varying vec2 dropUV;varying vec3 dropColor;varying float dropOpacity;varying vec2 dropXZ;
 void main(){dropUV=uv;float height=rainOrigin.y,phase=fract(rainParameters.x+wetTime*rainParameters.y/height),y=.095+(1.-phase)*height,wind=sin(wetTime*.43+rainParameters.x*6.28)*.085;vec3 p=vec3(rainOrigin.x+wind,y,rainOrigin.z+wind*.22);dropXZ=p.xz;
  vec4 v=viewMatrix*modelMatrix*vec4(p,1.);vec3 velocity=mat3(viewMatrix)*mat3(modelMatrix)*vec3(.95,-rainParameters.y,.22);vec2 along=normalize(velocity.xy),across=vec2(along.y,-along.x);
  float width=max(rainParameters.w,1.05*2.*max(-v.z,1.)/(projectionMatrix[1][1]*viewportHeight));v.xy+=across*position.x*width+along*position.y*rainParameters.z;
  float warm=0.;for(int i=0;i<12;i++){vec3 d=p-lampSites[i];warm+=(1.-smoothstep(.4,2.2,d.y))*1.7/(1.+dot(d,d)*.25);}
  dropColor=mix(vec3(.58,.69,.80),vec3(1.,.82,.59),clamp(warm,0.,1.));dropOpacity=(.18+min(warm,.9)*.50)*exp(-max(-v.z-24.,0.)*.009)*(.6+rainParameters.x*.4)*mix(1.,.55,overview);gl_Position=projectionMatrix*v;
 }`,fragmentShader:`uniform float stadium;varying vec2 dropUV;varying vec3 dropColor;varying float dropOpacity;varying vec2 dropXZ;
 void main(){if(stadium>.5&&dropXZ.x>55.&&dropXZ.x<127.&&dropXZ.y>30.&&dropXZ.y<82.)discard;float a=pow(max(0.,1.-abs(dropUV.x*2.-1.)),1.5)*sin(dropUV.y*3.14159)*(.75+.25*sin(dropUV.y*21.+dropXZ.x))*dropOpacity;if(a<.006)discard;gl_FragColor=vec4(dropColor,a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const rain=new T.Mesh(rainGeo,rainMat);rain.name='GPU rain / light-responsive depth-tested streaks';rain.frustumCulled=false;rain.renderOrder=8;effects.add(rain);

 const impactCount=360,impactGeo=instancedPlane(),impacts=new Float32Array(impactCount*4);impactGeo.setAttribute('impact',new T.InstancedBufferAttribute(impacts,4));
 const impactMat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{wetTime:time,stadium},
 vertexShader:`attribute vec4 impact;uniform float wetTime;varying vec2 impactUV;varying float impactAge;varying vec2 impactXZ;
 void main(){impactUV=uv*2.-1.;impactXZ=impact.xy;impactAge=fract(wetTime*impact.w+impact.z);gl_Position=projectionMatrix*modelViewMatrix*vec4(impact.x+position.x*.82,position.y*.82+impact.y,0.,1.);}`,
 fragmentShader:`uniform float stadium;varying vec2 impactUV;varying float impactAge;varying vec2 impactXZ;${noiseGLSL}
 void main(){vec2 xz=vec2(impactXZ.x,-impactXZ.y);if(stadium>.5&&xz.x>55.&&xz.x<127.&&xz.y>30.&&xz.y<82.)discard;float puddle=puddleMask(xz),r=length(impactUV),age=impactAge,fade=smoothstep(0.,.07,age)*(1.-smoothstep(.15,.86,age)),aa=max(fwidth(r)*1.15,.018);float ring=(1.-smoothstep(aa,aa*2.,abs(r-(.06+age*.79))))*fade*puddle*.40;float splash=exp(-r*r*95.)*(1.-smoothstep(.03,.16,age))*.35;float a=ring+splash;if(a<.006)discard;gl_FragColor=vec4(.65,.74,.79,a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const splashes=new T.Mesh(impactGeo,impactMat);splashes.name='Transient puddle rings and tiny pavement impacts';splashes.frustumCulled=false;splashes.rotation.x=-Math.PI/2;splashes.position.y=.042;splashes.renderOrder=3;effects.add(splashes);

 // Humid air catches actual fixtures, without opaque, unshadowed light cones.
 const mistGeo=instancedPlane(),mistOrigins=new Float32Array(lampLimit*3);mistGeo.setAttribute('mistOrigin',new T.InstancedBufferAttribute(mistOrigins,3));mistGeo.instanceCount=lampLimit;
 const mistMat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{wetTime:time},vertexShader:`attribute vec3 mistOrigin;uniform float wetTime;varying vec2 mistUV;void main(){mistUV=uv;vec3 p=mistOrigin+vec3(sin(wetTime*.25+mistOrigin.x)*.14,-.5,0.);vec4 v=modelViewMatrix*vec4(p,1.);v.xy+=position.xy*vec2(2.6,2.);gl_Position=projectionMatrix*v;}`,fragmentShader:`varying vec2 mistUV;void main(){vec2 p=mistUV*2.-1.;float g=exp(-dot(p,p)*4.)*(1.-smoothstep(.65,1.,length(p)));gl_FragColor=vec4(.78,.62,.43,g*.025);}`});
 const mist=new T.Mesh(mistGeo,mistMat);mist.name='Faint rain haze around street fixtures';mist.frustumCulled=false;effects.add(mist);

 let sampler=createRainRoadSampler(geo,random);
 function sampleLocal(near,foreground=false){let p;for(let j=0;j<100;j++){p=sampler.sample();if(foreground){if(Math.abs(p.x)<33&&p.z>14&&p.z<43)return p;continue;}if(!near||(Math.abs(p.x)<58&&p.z>-30&&p.z<55))return p;}return p;}
 function seedEffects(){seed=731;sampler=createRainRoadSampler(reflection.geometry,random);for(let i=0;i<maxDrops;i++){const p=sampleLocal(i%4!==0,i%3===0);origins.set([p.x,(i%3===0?12:18)+random()*(i%3===0?18:36),p.z],i*3);parameters.set([random(),17+random()*12,.36+random()*.59,.009+random()*.012],i*4);}for(let i=0;i<impactCount;i++){const p=sampleLocal(i%5!==0);impacts.set([p.x,-p.z,random(),.65+random()*.8],i*4);}rainGeo.attributes.rainOrigin.needsUpdate=true;rainGeo.attributes.rainParameters.needsUpdate=true;impactGeo.attributes.impact.needsUpdate=true;}
 seedEffects();
 function setLampSites(sites=[]){const selected=[...sites].sort((a,b)=>Math.hypot(a.x,a.z-20)-Math.hypot(b.x,b.z-20)).slice(0,lampLimit);for(let i=0;i<lampLimit;i++){const p=selected[i];lamps[i].set(p?p.x+Math.sin(p.ry||0)*.7:0,p?3.66:-100,p?p.z-Math.cos(p.ry||0)*.7:0);mistOrigins.set(lamps[i].toArray(),i*3);}mistGeo.attributes.mistOrigin.needsUpdate=true;}
 const capture=reflection.onBeforeRender,lastCamera=new T.Matrix4(),lastWorld=new T.Matrix4();
 reflection.onBeforeRender=function(renderer,scene,camera){const moving=!lastCamera.equals(camera.matrixWorld)||!lastWorld.equals(this.matrixWorld),stride=quality==='low'?3:2;if(!firstCapture&&!moving&&frame++%stride)return;firstCapture=false;lastCamera.copy(camera.matrixWorld);lastWorld.copy(this.matrixWorld);const visible=effects.visible;effects.visible=false;try{capture.call(this,renderer,scene,camera);}finally{effects.visible=visible;}};
 function applyVisibility(){group.visible=enabled;reflection.visible=enabled&&view!=='overview';rain.visible=enabled;splashes.visible=enabled&&view!=='overview';mist.visible=splashes.visible;uniforms.overview.value=view==='overview'?1:0;rainGeo.instanceCount=quality==='low'?(view==='overview'?700:1500):quality==='balanced'?(view==='overview'?1500:3400):(view==='overview'?2300:maxDrops);impactGeo.instanceCount=quality==='low'?110:impactCount;}
 function update(dt){if(enabled&&dt>0)clock+=Math.min(dt,.1);time.value=clock;}
 applyVisibility();
 return{group,reflection,rain,splashes,mist,uniforms,get sampler(){return sampler;},get elapsed(){return clock;},setRoadGeometry(geometry,id='original'){reflection.geometry=geometry;layoutId=id;reflection.position.y=id==='original'?.039:.078;splashes.position.y=id==='original'?.042:.081;firstCapture=true;stadium.value=0;seedEffects();},setLampSites,setViewport(width,height){uniforms.viewportHeight.value=height;},setRain(value){enabled=Boolean(value);firstCapture=true;applyVisibility();},setStadium(value){stadium.value=value&&layoutId==='original'?1:0;},setQuality(mode,currentView){quality=mode;view=currentView;const w=mode==='low'?384:mode==='balanced'?640:768,h=mode==='low'?256:mode==='balanced'?432:512;reflection.getRenderTarget().setSize(w,h);texel.value.set(1/w,1/h);firstCapture=true;applyVisibility();},update,get enabled(){return enabled;}};
}
