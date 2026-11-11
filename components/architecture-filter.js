// Thin rooftop rails and grilles should disappear below pixel resolution rather
// than turn into alternating bright/dark pixels. Silhouettes and walls stay intact.
export function filteredArchitectureMaterial(material,viewportHeight){
  const filtered=material.clone(),base=material.onBeforeCompile.bind(material),key=material.customProgramCacheKey.bind(material);
  filtered.onBeforeCompile=shader=>{
    base(shader);shader.uniforms.architectureViewportHeight=viewportHeight;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float architectureFineWidth;uniform float architectureViewportHeight;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      if(architectureFineWidth>0.){
        vec4 detailView=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);
        float detailPixels=architectureFineWidth*projectionMatrix[1][1]*architectureViewportHeight/(2.*max(.1,-detailView.z));
        transformed*=smoothstep(.45,1.15,detailPixels);
      }`);
  };
  filtered.customProgramCacheKey=()=>key()+'-pixel-filtered-architecture-v1';return filtered;
}
export function architectureFineWidth(a){
  const dimensions=[Math.abs(a.w),Math.abs(a.h),Math.abs(a.d)].sort((x,y)=>x-y);
  return dimensions[1]<.15?dimensions[1]:0;
}
