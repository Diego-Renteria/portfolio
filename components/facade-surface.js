/** Physical-scale scans and restrained wear, masked to the actual facade fabric. */
export function attachFacadeSurface(T,material,surfaceMaps={}){
 const a=material.userData.architecture,brick=a.kind==='brick',scan=a.masonry?surfaceMaps[brick?'brick':'concrete']:null;
 const hasScan=Boolean(scan?.map&&scan?.normalMap&&scan?.roughnessMap),tile=brick?1:3.2,inset=a.masonry?11/64:3/64,bottom=a.masonry?15/64:5/64,top=58/64;
 const base=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
 material.onBeforeCompile=shader=>{base(shader);
  if(hasScan)Object.assign(shader.uniforms,{facadeScanColor:{value:scan.map},facadeScanNormal:{value:scan.normalMap},facadeScanRough:{value:scan.roughnessMap}});
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   varying vec2 vFacadeMeters;varying float vFacadeWall;
   ${hasScan?'uniform sampler2D facadeScanColor;uniform sampler2D facadeScanNormal;uniform sampler2D facadeScanRough;':''}
   float facadeHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float facadeNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(facadeHash(i),facadeHash(i+vec2(1.,0.)),f.x),mix(facadeHash(i+vec2(0.,1.)),facadeHash(i+1.),f.x),f.y);}
   float facadePane(vec2 c,vec2 derivatives){vec2 aa=max(derivatives,vec2(.001));float p=smoothstep(${inset.toFixed(6)}-aa.x,${inset.toFixed(6)}+aa.x,c.x)*(1.-smoothstep(${(1-inset).toFixed(6)}-aa.x,${(1-inset).toFixed(6)}+aa.x,c.x))*smoothstep(${bottom.toFixed(6)}-aa.y,${bottom.toFixed(6)}+aa.y,c.y)*(1.-smoothstep(${top.toFixed(6)}-aa.y,${top.toFixed(6)}+aa.y,c.y));
    ${a.arch?`if(c.y>${(top-(1-2*inset)*.5).toFixed(6)})p*=1.-smoothstep(${((1-2*inset)*.5-.01).toFixed(6)},${((1-2*inset)*.5+.01).toFixed(6)},length(c-vec2(.5,${(top-(1-2*inset)*.5).toFixed(6)})));`:''}
    p*=smoothstep(.019-aa.x,.019+aa.x,abs(c.x-.5))*smoothstep(.018-aa.y,.018+aa.y,abs(c.y-${(top-(top-bottom)*.55).toFixed(6)}));return p;}
   vec3 facadeTangentNormal(vec3 n,vec3 p,vec2 uv,vec3 detail){vec3 q0=dFdx(p),q1=dFdy(p),q1p=cross(q1,n),q0p=cross(n,q0);vec2 s0=dFdx(uv),s1=dFdy(uv);vec3 t=q1p*s0.x+q0p*s1.x,b=q1p*s0.y+q0p*s1.y;float scale=inversesqrt(max(max(dot(t,t),dot(b,b)),.00000001));return normalize(mat3(t*scale,b*scale,n)*detail);}
  `).replace('#include <map_fragment>',`#include <map_fragment>
   vec2 facadeCell=fract(vMapUv*vec2(8.,16.));float facadeGlass=facadePane(facadeCell,fwidth(vMapUv*vec2(8.,16.)))*vFacadeWall,facadeFabric=(1.-facadeGlass)*vFacadeWall;
   // Resolve detail by its projected size, so camera travel never switches an LOD abruptly.
   float facadePixelMetres=max(length(dFdx(vFacadeMeters)),length(dFdy(vFacadeMeters)));
   float facadeDetail=1.-smoothstep(.10,.75,facadePixelMetres);
   vec2 facadeScanUv=vFacadeMeters/${tile.toFixed(1)};
   float facadeMacro=facadeNoise(vFacadeMeters*.19)*.66+facadeNoise(vFacadeMeters*.71)*.34;
   float facadeDrip=(1.-smoothstep(.02,.24,facadeCell.y))*(.5+.5*facadeNoise(vec2(vFacadeMeters.x*7.,floor(vFacadeMeters.y/${a.pitchY.toFixed(4)}))));
   ${hasScan?`float facadeLuma=dot(texture2D(facadeScanColor,facadeScanUv).rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb*=mix(1.,clamp(facadeLuma*2.8,.48,1.35),facadeFabric*.65);`:''}
   diffuseColor.rgb*=mix(1.,(.88+facadeMacro*.18)*(1.-facadeDrip*.09*facadeDetail),facadeFabric);
  `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
   float facadeSolidRough=${a.masonry?(a.kind==='iron'?'.48':'.84'):'.38'};
   ${hasScan?'facadeSolidRough=mix(facadeSolidRough,clamp(texture2D(facadeScanRough,facadeScanUv).g,.38,.97),.65);':''}
   roughnessFactor=mix(roughnessFactor,mix(facadeSolidRough,.10+facadeNoise(floor(vFacadeMeters))* .10,facadeGlass),vFacadeWall);
   // Unresolved glass facets become a broad reflection rather than sparkling pixels.
   roughnessFactor=mix(max(roughnessFactor,.48),roughnessFactor,facadeDetail);
  `).replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
   metalnessFactor=mix(metalnessFactor,mix(${a.masonry?(a.kind==='iron'?'.35':'.0'):'.65'},.0,facadeGlass),vFacadeWall);
  `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   ${hasScan?`vec3 facadeN=texture2D(facadeScanNormal,facadeScanUv).xyz*2.-1.;facadeN.xy*=${brick?'.55':a.kind==='iron'?'.10':'.24'};normal=normalize(mix(normal,facadeTangentNormal(normal,-vViewPosition,facadeScanUv,normalize(facadeN)),facadeFabric));`:''}
   normal=normalize(mix(nonPerturbedNormal,normal,facadeDetail));
  `);
  const distantBias='.65*smoothstep(.10,.75,max(length(dFdx(vFacadeMeters)),length(dFdy(vFacadeMeters))))';
  shader.fragmentShader=shader.fragmentShader
    .replace('#include <map_fragment>',T.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )',`texture2D( map, vMapUv, ${distantBias} )`))
    .replace('#include <emissivemap_fragment>',T.ShaderChunk.emissivemap_fragment.replace('texture2D( emissiveMap, vEmissiveMapUv )',`texture2D( emissiveMap, vEmissiveMapUv, ${distantBias} )`));
 };
 material.customProgramCacheKey=()=>key()+'-physical-facade-v2-'+hasScan;
 Object.assign(a,{scannedFabric:hasScan,physicalTileMetres:hasScan?tile:null,macroWeathering:true,glazingIsDielectric:true,pixelFilteredDetail:true});
}
