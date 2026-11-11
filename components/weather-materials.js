// Material-dependent surface wetting. Only registered exterior groups are affected;
// the portfolio's indoor furniture and protected walls retain their dry materials.
export function createWeatherMaterials(){
 const wet={value:0},cache=new Map();
 const response={asphalt:[.66,.25],concrete:[.81,.45],stone:[.84,.40],wood:[.76,.34],deck:[.76,.34],gravel:[.76,.62],soil:[.69,.78],grass:[.85,.72],brick:[.83,.50]};
 function register(group){group?.traverse(o=>{if(!o.isMesh||!o.material)return;const patch=m=>{
  const kind=m.userData.surface,r=response[kind];if(!r||m.userData.weatherExterior||!m.isMeshStandardMaterial||m.emissive?.getHex()>0||m.transparent)return m;
  if(cache.has(m))return cache.get(m);const clone=m.clone(),before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);clone.userData={...m.userData,weatherExterior:true};
  clone.onBeforeCompile=shader=>{before.call(m,shader);shader.uniforms.rainWetness=wet;
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWeatherPosition; varying float vWeatherUp;');
   shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
    vec4 weatherWorld=vec4(transformed,1.);
    #ifdef USE_INSTANCING
     weatherWorld=instanceMatrix*weatherWorld;
    #endif
    vWeatherPosition=(modelMatrix*weatherWorld).xyz;
    vWeatherUp=max(0.,inverseTransformDirection(transformedNormal,viewMatrix).y);`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float rainWetness;varying vec3 vWeatherPosition;varying float vWeatherUp;');
   // Low frequency absorption and preserved high-frequency aggregate keep wet
   // pavement textured; a water film does not make asphalt metallic.
   shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    float weatherPatch=.82+.18*sin(vWeatherPosition.x*.73+sin(vWeatherPosition.z*.49));
    float surfaceWet=rainWetness*weatherPatch*mix(.28,1.,smoothstep(.1,.8,vWeatherUp));
    roughnessFactor=mix(roughnessFactor,max(${r[1]},roughnessFactor*.54),surfaceWet);
    diffuseColor.rgb*=mix(1.,${r[0]},surfaceWet);`);
  };clone.customProgramCacheKey=()=>key()+'-exterior-water-film-v1';cache.set(m,clone);return clone;
 };o.material=Array.isArray(o.material)?o.material.map(patch):patch(o.material);});}
 return{register,setRain(value){wet.value=value?1:0;},get count(){return cache.size;},wet};
}
