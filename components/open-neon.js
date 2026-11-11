// Separate glass tubes and optical bloom keep the lettering sharp while the
// surrounding light stays soft. A rare ballast stumble interrupts steady light.
export function createOpenNeon(T,parent,position,random=Math.random){
  const group=new T.Group();group.name='Record store neon OPEN';group.position.set(...position);parent.add(group);
  function canvas(){const c=document.createElement('canvas');c.width=1024;c.height=448;return c;}
  function tubes(g,width,color,blur=0){
    g.strokeStyle=color;g.lineWidth=width;g.lineJoin='round';g.shadowColor='#ff694c';g.shadowBlur=blur;
    g.font='500 218px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.strokeText('OPEN',512,234);
    g.strokeRect(36,46,952,356);
  }
  const face=canvas(),g=face.getContext('2d');
  tubes(g,17,'#842e28',17);tubes(g,9,'#ff7358',8);tubes(g,3,'#ffe4cc');
  const map=new T.CanvasTexture(face);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  const tubeMaterial=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false});
  const tube=new T.Mesh(new T.PlaneGeometry(1.05,.47),tubeMaterial);tube.name='Neon glass tubes with warm white cores';tube.renderOrder=3;group.add(tube);
  const bloom=canvas(),b=bloom.getContext('2d');
  const gradient=b.createRadialGradient(512,224,30,512,224,510);
  gradient.addColorStop(0,'rgba(255,99,63,.30)');gradient.addColorStop(.35,'rgba(255,82,49,.18)');gradient.addColorStop(.7,'rgba(240,64,38,.055)');gradient.addColorStop(1,'rgba(230,50,25,0)');
  b.fillStyle=gradient;b.fillRect(0,0,1024,448);
  const glowMap=new T.CanvasTexture(bloom);glowMap.colorSpace=T.SRGBColorSpace;
  const glow=new T.Mesh(new T.PlaneGeometry(1.85,.98),new T.MeshBasicMaterial({map:glowMap,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));
  glow.name='Soft coral neon bloom';glow.position.z=.012;glow.renderOrder=2;group.add(glow);
  const light=new T.PointLight('#ff7855',0,2.4,2);light.name='OPEN sign local neon spill';light.position.set(0,-.04,.2);light.userData.neonControlled=true;group.add(light);
  let night=false,time=0,next=9+random()*9,event=null,brightness=1;
  function apply(){
    tube.material.color.setScalar(.09+.91*brightness);
    glow.material.opacity=(night?.82:.30)*brightness;
    light.intensity=1.8*(night?1:.22)*brightness;
  }
  function setNight(value){night=!!value;apply();}
  function update(dt){
    if(!(dt>0))return;
    time+=Math.min(dt,.1);
    if(!event&&time>=next){event={start:time,duration:.48+random()*.28,depth:.12+random()*.16};}
    brightness=1;
    if(event){
      const age=time-event.start,knots=[[0,1],[.025,event.depth],[.085,event.depth],[.11,.92],[.17,1],[.195,.30],[.245,.30],[.28,.94],[.335,.54],[.38,.54],[event.duration,1]];
      if(age>=event.duration){event=null;next=time+18+random()*27;}
      else for(let i=1;i<knots.length;i++)if(age<=knots[i][0]){
        const a=knots[i-1],z=knots[i],t=(age-a[0])/(z[0]-a[0]),ease=t*t*(3-2*t);brightness=a[1]+(z[1]-a[1])*ease;break;
      }
    }
    apply();
  }
  apply();return{group,tube,glow,light,update,setNight};
}
