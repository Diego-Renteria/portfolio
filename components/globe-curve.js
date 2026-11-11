export const GLOBE_RADIUS=205;
export const GLOBE_ORIGIN_Z=11;
const globeGLSL=`
uniform float globeEnabled;
uniform mat4 globeWorld;
uniform mat4 globeInverse;
vec4 bendGlobeVertex(vec4 positionInWorld){
  if(globeEnabled<0.5)return positionInWorld;
  vec3 p=(globeInverse*positionInWorld).xyz;
  vec2 offset=p.xz-vec2(0.0,11.0);
  float distance=length(offset);
  float amount=smoothstep(27.0,69.0,distance);
  float angle=distance/205.0;
  float radius=205.0+p.y;
  vec3 wrapped=vec3(offset.x*sin(angle)*radius/max(distance,0.001),
    cos(angle)*radius-205.0,11.0+offset.y*sin(angle)*radius/max(distance,0.001));
  return globeWorld*vec4(mix(p,wrapped,amount),1.0);
}
`;
const vertexProjection=`
vec4 globeVertex=vec4(transformed,1.0);
#ifdef USE_BATCHING
  globeVertex=batchingMatrix*globeVertex;
#endif
#ifdef USE_INSTANCING
  globeVertex=instanceMatrix*globeVertex;
#endif
vec4 curvedWorld=bendGlobeVertex(modelMatrix*globeVertex);
vec4 mvPosition=viewMatrix*curvedWorld;
gl_Position=projectionMatrix*mvPosition;
`;
export function wrapGlobePoint(point){
  const x=point.x,z=point.z-GLOBE_ORIGIN_Z,distance=Math.hypot(x,z);
  if(distance<=27)return point;
  const t=Math.min(1,(distance-27)/42),amount=t*t*(3-2*t),angle=distance/GLOBE_RADIUS;
  const radius=GLOBE_RADIUS+point.y,scale=Math.sin(angle)*radius/distance;
  point.x+=(x*scale-x)*amount;
  point.y+=(Math.cos(angle)*radius-GLOBE_RADIUS-point.y)*amount;
  point.z+=(z*scale-z)*amount;
  return point;
}

export function createGlobeCurve(T,world){
  const enabled={value:0},matrix={value:world.matrixWorld},inverse={value:new T.Matrix4()};
  const tracked=new WeakSet();
  function refresh(){
    world.traverseVisible(object=>{
      if(!object.isMesh||object.userData.unwarpedGlobe)return;
      for(const material of [object.material].flat()){
        if(!material||tracked.has(material))continue;
        tracked.add(material);
        if(material.isShaderMaterial){
          // The lamp glow and projected pavement spill use their own vertex shaders.
          if(material.vertexShader.includes('site=w.xz;')){
            Object.assign(material.uniforms,{globeEnabled:enabled,globeWorld:matrix,globeInverse:inverse});
            material.vertexShader=globeGLSL+material.vertexShader.replace('site=w.xz;','site=w.xz;w=bendGlobeVertex(w);');
            material.needsUpdate=true;
          }
          continue;
        }
        const previous=material.onBeforeCompile;
        const cacheKey=material.customProgramCacheKey();
        material.onBeforeCompile=function(shader,renderer){
          previous.call(this,shader,renderer);
          if(!shader.vertexShader.includes('#include <project_vertex>'))return;
          Object.assign(shader.uniforms,{globeEnabled:enabled,globeWorld:matrix,globeInverse:inverse});
          shader.vertexShader=globeGLSL+shader.vertexShader
            .replace('#include <project_vertex>',vertexProjection)
            .replace('#include <worldpos_vertex>',T.ShaderChunk.worldpos_vertex.replace('modelMatrix * worldPosition','curvedWorld'));
        };
        material.customProgramCacheKey=()=>cacheKey+'-curved-world';
        material.needsUpdate=true;
      }
    });
  }
  return {
    select(active){enabled.value=Number(active);if(active)refresh();},
    refresh(){if(enabled.value)refresh();},
    update(){if(enabled.value)inverse.value.copy(world.matrixWorld).invert();},
    point(point){return enabled.value?wrapGlobePoint(point):point;},
  };
}
