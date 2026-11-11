/** A bounded, occasional shower: four reusable slots and one sky-only draw. */
export function createMeteorShower(T,scene,{random=Math.random}={}){
 const slots=Array.from({length:4},()=>({active:false}));
 const heads=slots.map(()=>new T.Vector4()),shapes=slots.map(()=>new T.Vector4());
 const uniforms={aspect:{value:1},heads:{value:heads},shapes:{value:shapes}};
 const material=new T.ShaderMaterial({uniforms,transparent:true,blending:T.AdditiveBlending,depthWrite:false,depthTest:true,toneMapped:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.999999,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float aspect;uniform vec4 heads[4];uniform vec4 shapes[4];
   void main(){
    vec2 p=vec2(vUv.x*aspect,vUv.y);vec3 light=vec3(0.);float opacity=0.;
    for(int i=0;i<4;i++){
     if(shapes[i].z<=0.)continue;
     vec2 d=p-heads[i].xy,dir=heads[i].zw;
     float along=dot(d,dir),across=abs(d.x*dir.y-d.y*dir.x);
     float tail=shapes[i].x,width=max(shapes[i].y,fwidth(across)*.65);
     float taper=clamp(1.+along/max(.001,tail),0.,1.);
     float core=exp(-pow(across/(width*mix(.16,1.,taper)),2.));
     float halo=exp(-pow(across/(width*5.),2.))*.15;
     float streak=(core+halo)*pow(taper,1.3)*smoothstep(-tail,-tail*.75,along)*(1.-smoothstep(0.,width*2.,along));
     float head=exp(-dot(d,d)/(width*width*7.))*.65;
     float a=(streak+head)*shapes[i].z;
     vec3 tint=mix(vec3(.55,.73,1.),vec3(1.,.92,.81),shapes[i].w);
     light+=tint*a;opacity=max(opacity,a);
    }
    if(opacity<.001)discard;
    // Pure additive radiance preserves the real sky underneath the feathered trail.
    gl_FragColor=vec4(light,1.);
    #include <colorspace_fragment>
   }`});
 const mesh=new T.Mesh(new T.PlaneGeometry(2,2),material);mesh.name='Occasional polished meteor shower behind the city';mesh.frustumCulled=false;mesh.renderOrder=-10000;mesh.visible=false;scene.add(mesh);
 let time=0,nextAt=3,sequence=0,enabled=false;
 function spawn(){
  const slot=slots.find(s=>!s.active);if(!slot)return;
  // Four sky regions rotate so consecutive streaks never reuse the same patch.
  const region=sequence++%4,right=random()>.35;
  Object.assign(slot,{active:true,born:time,duration:1.25+random()*.75,x:.12+region*.19+random()*.11,y:.74+random()*.19,
   dx:right?1:-1,dz:-.30-random()*.42,travel:.25+random()*.20,tail:.10+random()*.09,width:.0006+random()*.0006,brightness:.45+random()*.35,tint:random()*.55});
  const norm=Math.hypot(slot.dx,slot.dz);slot.dx/=norm;slot.dz/=norm;
 }
 function update(dt,aspect=1){
  uniforms.aspect.value=Math.max(.25,aspect);
  if(enabled&&dt>0){
   time+=Math.min(dt,.25);
   for(const slot of slots)if(slot.active&&time-slot.born>=slot.duration)slot.active=false;
   if(time>=nextAt){spawn();nextAt=time+(random()<.28?.65+random()*.65:4.5+random()*6.5);}
  }
  const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  slots.forEach((s,i)=>{
   if(!s.active){shapes[i].set(0,0,0,0);return;}
   const progress=Math.max(0,Math.min(1,(time-s.born)/s.duration));
   const travel=Math.min(s.travel,uniforms.aspect.value*.32);
   heads[i].set(s.x*uniforms.aspect.value+s.dx*travel*progress,s.y+s.dz*travel*progress,s.dx,s.dz);
   const fade=smooth(0,.12,progress)*(1-smooth(.66,1,progress));
   shapes[i].set(Math.max(.001,Math.min(s.tail,travel*progress)),s.width,s.brightness*fade,s.tint);
  });
 }
 update(0);return{mesh,uniforms,slots,update,setEnabled(value){enabled=!!value;mesh.visible=enabled;},get time(){return time;},get emitted(){return sequence;}};
}
