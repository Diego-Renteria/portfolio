/** GPU room-box intersections preserve perspective without city-wide mesh duplication. */
export function attachCityWindowShader(T,material){
 const uniforms={enabled:{value:0},atlas:{value:null},night:{value:0},rows:{value:48}};
 material.userData.cityInteriors=uniforms;
 const base=material.onBeforeCompile;
 material.onBeforeCompile=shader=>{
  base(shader);
  Object.assign(shader.uniforms,{cityRoomsEnabled:uniforms.enabled,cityRoomsAtlas:uniforms.atlas,cityRoomsNight:uniforms.night,cityRoomsRows:uniforms.rows});
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
   attribute vec3 interiorAddress;
   varying vec3 vCityRoomAddress;
   varying vec3 vCityRoomRay;
   varying float vCityRoomHeight;
   varying float vCityRoomWall;
  `).replace('#include <begin_vertex>',`#include <begin_vertex>
   mat4 cityTransform = modelMatrix;
   vec3 cityScale = vec3(1.0);
   float cityY = position.y;
   #ifdef USE_INSTANCING
    cityTransform = modelMatrix * instanceMatrix;
    cityScale = vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
    cityY = position.y*cityScale.y + instanceMatrix[3].y;
   #endif
   vec3 cityWorld = (cityTransform*vec4(position,1.0)).xyz;
   vec3 cityN = normalize(mat3(cityTransform)*normal);
   vec3 cityRight = normalize(mat3(cityTransform)*(abs(normal.z)>.5 ? vec3(1.,0.,0.) : vec3(0.,0.,1.)));
   vec3 cityUp = normalize(mat3(modelMatrix)*vec3(0.,1.,0.));
   vec3 cityView = cityWorld-cameraPosition;
   vCityRoomRay = vec3(dot(cityView,cityRight),dot(cityView,cityUp),-abs(dot(cityView,cityN)));
   vCityRoomAddress = interiorAddress;
   vCityRoomHeight = cityY;
   vCityRoomWall = 1.0-step(.45,abs(normal.y));
  `);
  const architecture=material.userData.architecture,masonry=architecture.masonry,inset=masonry?11/64:3/64,bottom=masonry?15/64:5/64,top=58/64;
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   uniform float cityRoomsEnabled;
   uniform sampler2D cityRoomsAtlas;
   uniform float cityRoomsNight;
   uniform float cityRoomsRows;
   varying vec3 vCityRoomAddress;
   varying vec3 vCityRoomRay;
   varying float vCityRoomHeight;
   varying float vCityRoomWall;
   float cityHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   vec2 cityCubeUv(vec3 p,out float face){
    vec3 a=abs(p);vec2 uv;
    if(a.x>=a.y&&a.x>=a.z){face=p.x>0.?0.:1.;uv=vec2(p.x>0.?p.z:-p.z,p.y)/a.x;}
    else if(a.y>=a.z){face=p.y>0.?2.:3.;uv=vec2(p.x,p.y>0.?p.z:-p.z)/a.y;}
    else{face=p.z>0.?4.:5.;uv=vec2(p.z>0.?-p.x:p.x,p.y)/a.z;}
    return clamp(uv*.5+.5,vec2(.007),vec2(.993));
   }
  `).replace('#include <opaque_fragment>',`
   if(cityRoomsEnabled>.5 && vCityRoomWall>.5){
    vec2 cell=fract(vMapUv*vec2(8.,16.));
    float pane=facadePane(cell,fwidth(vMapUv*vec2(8.,16.)));
    float bayPixels=1./max(max(fwidth(vMapUv*vec2(8.,16.)).x,fwidth(vMapUv*vec2(8.,16.)).y),.0001);
    float roomCoverage=pane*smoothstep(1.5,5.,bayPixels);
    if(roomCoverage>.001){
     vec2 bay=floor(vMapUv*vec2(8.,16.));
     // Quantize discrete instance data before hashing. Interpolation roundoff
     // otherwise selects different rooms between neighboring fragments.
     float seed=floor(vCityRoomAddress.y+.5),program=floor(vCityRoomAddress.x+.5);
     float h=cityHash(bay+vec2(seed,seed*.37));
     float room=floor(h*6.);
     if(program>.5&&program<1.5)room=6.+floor(cityHash(bay+vec2(seed*1.71,seed*.93))*4.);
     if(program>1.5&&program<2.5)room=10.+floor(h*2.);
     if(program>2.5&&program<3.5)room=12.+floor(h*2.);
     if(program>3.5&&program<4.5)room=14.+floor(h*8.);
     if(program>4.5)room=22.+floor(h*2.);
     if(vCityRoomHeight<2.9)room=program>2.5&&program<3.5?13.:14.+floor(cityHash(vec2(floor(bay.x/2.),seed))*8.);
     vec3 origin=vec3((cell.x-.5)/${((1-2*inset)*.5).toFixed(6)},(cell.y-${((top+bottom)/2).toFixed(6)})/${((top-bottom)/2).toFixed(6)},.999);
     // Depth, furniture orientation, shades and exposure vary independently.
     float mirror=cityHash(bay+seed*2.17)>.5?-1.:1.;origin.x*=mirror;
     vec3 direction=normalize(vCityRoomRay*vec3(mirror*(.72+h*.30),.92+h*.18,.90+h*.65));
     direction=mix(vec3(.00001),direction,step(vec3(.00001),abs(direction)));
     vec3 exits=(sign(direction)-origin)/direction;
     float distance=min(exits.x,min(exits.y,exits.z));
     vec3 hit=origin+max(.001,distance)*direction;
     float face;vec2 roomUv=cityCubeUv(hit,face);
     float row=room+cityRoomsNight*24.;
     vec3 radiance=texture2D(cityRoomsAtlas,(vec2(face,row)+roomUv)/vec2(6.,cityRoomsRows)).rgb;
     // Suites correlate in pairs, but rooms and their furnishings remain distinct.
     float suite=cityHash(vec2(floor(bay.x/2.)+seed,bay.y+seed*.71));
     float occupied=program>.5&&program<1.5?step(.58,suite):step(.60,cityHash(bay+seed));
     if(vCityRoomHeight<2.9)occupied=step(.18,suite);
     float brightness=mix(.25+.15*h,mix(.008,.36+h*.32,occupied),cityRoomsNight);
     vec3 roomTint=mix(vec3(.93,.96,1.),vec3(1.,.89,.77),cityHash(bay+seed*.63));
     radiance*=roomTint;
     float shade=cityHash(bay+seed*3.19),blindBottom=mix(.55,.95,cityHash(bay+seed*1.38));
     float blind=shade<.29?smoothstep(blindBottom-.018,blindBottom+.018,cell.y):0.;
     float curtains=shade>.76?1.-smoothstep(.10,.18,min(cell.x,1.-cell.x)):0.;
     radiance*=1.-max(blind*.88,curtains*.83);
     // Daylit glass carries the sky at grazing angles. At night the room can
     // dominate, while unoccupied rooms remain dark rather than turning yellow.
     float fresnel=pow(1.-abs(normalize(vCityRoomRay).z),3.);
     vec3 glassReflection=reflectedLight.directSpecular+reflectedLight.indirectSpecular;
     vec3 roomLight=glassReflection+radiance*brightness*(1.-.8*fresnel);
     outgoingLight=mix(outgoingLight,roomLight,roomCoverage);
    }
   }
   #include <opaque_fragment>`);
 };
 const key=material.customProgramCacheKey.bind(material);material.customProgramCacheKey=()=>key()+'-furnished-city-v2';
 return uniforms;
}
