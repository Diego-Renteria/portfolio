import {RGBELoader} from '../vendor/loaders/RGBELoader.js?v=b477ce33502c';
/** Bounded physical lights near the portfolio, with instanced distant light spill. */
export function buildCityLighting({THREE:T,world,groundElevation=.055},streetSites){
  const group=new T.Group();group.name='Photometric street lighting';world.add(group);
  const sites=streetSites.map(p=>({x:p.x+Math.sin(p.ry)*.7,y:3.66,z:p.z-Math.cos(p.ry)*.7,ry:p.ry}));
  const uniforms={strength:{value:0},stadium:{value:0}};
  const spill=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms,vertexShader:`varying vec2 p;varying vec2 site;void main(){p=uv*2.-1.;vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);site=w.xz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`varying vec2 p;varying vec2 site;uniform float strength;uniform float stadium;void main(){if(stadium>.5&&site.x>55.&&site.x<127.&&site.y>30.&&site.y<82.)discard;float r=dot(p,p);float falloff=pow(1.+r*4.,-1.1)*(1.-smoothstep(.35,1.,r));gl_FragColor=vec4(vec3(1.,.79,.56),falloff*strength);}`});
  const pools=new T.InstancedMesh(new T.PlaneGeometry(1,1),spill,sites.length),dummy=new T.Object3D();pools.name='Soft distant luminaire pavement spill';pools.frustumCulled=false;
  sites.forEach((p,i)=>{dummy.position.set(p.x,groundElevation,p.z);dummy.rotation.set(-Math.PI/2,0,p.ry);dummy.scale.set(12.8,15,1);dummy.updateMatrix();pools.setMatrixAt(i,dummy.matrix);});group.add(pools);
  // Only nearby street fixtures need forward-rendered lights. Their light reaches
  // cars, trees and facade materials, rather than merely drawing colored pavement.
  const near=sites.filter(p=>Math.abs(p.x)<25&&p.z>1&&p.z<40).sort((a,b)=>Math.hypot(a.x,a.z-22)-Math.hypot(b.x,b.z-22)).slice(0,6),lights=[];
  for(const [i,p]of near.entries()){
    const light=new T.SpotLight(i%3===0?'#ffe1bb':'#ffe8ca',0,16,1.15,.9,2);light.name='Shielded 3000K street luminaire';light.position.set(p.x,p.y,p.z);light.target.position.set(p.x+Math.sin(p.ry)*.5,.06,p.z-Math.cos(p.ry)*.5);group.add(light,light.target);
    // One local shadow map anchors the most visible road furniture without
    // rendering the whole city into dozens of additional shadow maps.
    light.castShadow=i===0;light.shadow.mapSize.set(512,512);light.shadow.camera.near=.15;light.shadow.camera.far=16;light.shadow.bias=-.0002;light.shadow.normalBias=.035;
    lights.push(light);
  }
  // Distant bulbs retain a restrained, depth-tested atmospheric halo. This is
  // separate from actual illumination; it never creates a visible solid cone.
  const haloMat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms,vertexShader:`varying vec2 p;varying vec2 site;void main(){p=uv*2.-1.;vec4 w=modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.);site=w.xz;vec4 v=viewMatrix*w;v.xy+=position.xy*.6;gl_Position=projectionMatrix*v;}`,fragmentShader:`varying vec2 p;varying vec2 site;uniform float strength;uniform float stadium;void main(){if(stadium>.5&&site.x>55.&&site.x<127.&&site.y>30.&&site.y<82.)discard;float a=exp(-dot(p,p)*7.)*(1.-smoothstep(.5,1.,dot(p,p)));gl_FragColor=vec4(vec3(1.,.78,.53),a*strength*.5);}`});
  const halos=new T.InstancedMesh(new T.PlaneGeometry(1,1),haloMat,sites.length);halos.name='Restrained streetlamp optical halos';halos.frustumCulled=false;
  sites.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(1);dummy.updateMatrix();halos.setMatrixAt(i,dummy.matrix);});group.add(halos);
  let mode='sky',view='overview',quality='high';
  function apply(){const night=mode!=='sky';uniforms.strength.value=night?(mode==='rain'?.72:.66):0;lights.forEach((l,i)=>{l.intensity=night?(mode==='rain'?88:80):0;l.castShadow=i===0&&quality!=='low';});}
  return{group,lights,sites,uniforms,setAtmosphere(value){mode=value;apply();},setQuality(value,currentView){quality=value;view=currentView;apply();},setStadium(value){uniforms.stadium.value=value?1:0;}};
}

/** Each atmosphere has its own sky/ground reflection field, prefiltered for PBR. */
export function createLightingEnvironment(T,renderer,scene){
  const maps=new Map(),schemes={sky:['#91b6d2','#e3e3d5','#647666'],night:['#132c4e','#3c4659','#191e25'],rain:['#0c1b30','#26313b','#111c25']};
  let selected='night',nightScan=false;const select=mode=>{selected=mode;
    if(!maps.has(mode)){
      const colors=schemes[mode]||schemes.sky,faces=[];
      for(let f=0;f<6;f++){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),v=g.createLinearGradient(0,0,0,128);v.addColorStop(0,f===3?colors[2]:colors[0]);v.addColorStop(.52,colors[1]);v.addColorStop(1,f===2?colors[0]:colors[2]);g.fillStyle=v;g.fillRect(0,0,128,128);faces.push(c);}
      const cube=new T.CubeTexture(faces);cube.colorSpace=T.SRGBColorSpace;cube.needsUpdate=true;const pmrem=new T.PMREMGenerator(renderer),rt=pmrem.fromCubemap(cube);maps.set(mode,rt);cube.dispose();pmrem.dispose();
    }
    scene.environment=maps.get(mode).texture;
  };
  select.loadNightScan=async()=>{
    const texture=await new RGBELoader().loadAsync(new URL('../assets/curated/shanghai_bund_1k.hdr',import.meta.url).href),pmrem=new T.PMREMGenerator(renderer);
    const result=pmrem.fromEquirectangular(texture);texture.dispose();pmrem.dispose();maps.get('night')?.dispose();maps.set('night',result);nightScan=true;if(selected==='night'){scene.environment=result.texture;scene.environmentIntensity=.055;}return result;
  };
  select.intensity=mode=>mode==='night'&&nightScan?.055:mode==='rain'?.60:mode==='night'?.68:.65;
  return select;
}
