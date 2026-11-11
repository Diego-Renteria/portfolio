// The official player stays in its iframe, behind a depth-tested screen opening.
export const APARTMENT_STREAM='_HviSyC7zSU';
const PLAYER_WIDTH=640,PLAYER_HEIGHT=360;
export function screenCssMatrix(T,screen,camera,width,height){
  const {width:w,height:h}=screen.geometry.parameters;
  const clip=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse)
    .multiply(screen.matrixWorld).multiply(new T.Matrix4().makeTranslation(-w/2,h/2,0))
    .multiply(new T.Matrix4().makeScale(w/PLAYER_WIDTH,-h/PLAYER_HEIGHT,1));
  const e=clip.elements,n=e[15];if(n<=0)return null;
  return[(e[0]+e[3])*width/2/n,(-e[1]+e[3])*height/2/n,0,e[3]/n,
    (e[4]+e[7])*width/2/n,(-e[5]+e[7])*height/2/n,0,e[7]/n,
    0,0,1,0,(e[12]+e[15])*width/2/n,(-e[13]+e[15])*height/2/n,0,1];
}
let youtubeReady;
function loadYouTube(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  return youtubeReady??=new Promise((resolve,reject)=>{
    const prior=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{prior?.();resolve(window.YT);};
    const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';
    script.onerror=()=>reject(new Error('YouTube is unavailable'));document.head.appendChild(script);
  });
}
export function mountApartmentTV({THREE:T,host,renderer,screen,reduced=false,highlight}){
  const layer=document.createElement('div');layer.className='apartment-tv-layer';layer.hidden=true;layer.setAttribute('aria-hidden','true');
  const playerBox=document.createElement('div');playerBox.className='apartment-tv-player';playerBox.dataset.state='idle';
  const slot=document.createElement('div');playerBox.appendChild(slot);layer.appendChild(playerBox);host.insertBefore(layer,renderer.domElement);
  const resting=screen.material,portal=new T.ShaderMaterial({
    vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'void main(){gl_FragColor=vec4(0.0);}',
    blending:T.NoBlending,depthWrite:true,depthTest:true,toneMapped:false
  });
  let player,loading=false,ready=false,playing=false,visible=false,requested=false,hoverValue=-1;
  const play=()=>{if(ready&&visible&&!document.hidden){player.mute();player.playVideo();}};
  function load(){
    loading=true;playerBox.dataset.state='loading';
    loadYouTube().then(YT=>{
      player=new YT.Player(slot,{
        host:'https://www.youtube-nocookie.com',width:PLAYER_WIDTH,height:PLAYER_HEIGHT,videoId:APARTMENT_STREAM,
        playerVars:{autoplay:reduced?0:1,mute:1,controls:0,playsinline:1,fs:0,disablekb:1,rel:0,origin:location.origin},
        events:{
          onReady(){ready=true;player.mute();const frame=player.getIframe();frame.title='Phineas and Ferb — apartment cinema';frame.tabIndex=-1;if(visible&&!reduced)play();},
          onStateChange(event){playing=event.data===YT.PlayerState.PLAYING;playerBox.dataset.state=playing?'playing':'paused';},
          onAutoplayBlocked(){playerBox.dataset.state='waiting-for-gesture';requested=true;},
          onError(){playing=false;ready=false;playerBox.dataset.state='unavailable';}
        }
      });
    }).catch(()=>{playerBox.dataset.state='unavailable';});
  }
  // A scene click can release a browser's muted-autoplay restriction.
  const gesture=()=>{if(!reduced)play();};host.addEventListener('pointerdown',gesture);
  function update(camera,view,place){
    // The iframe cannot use the scene shader; its screen-sized wash follows the same uniform.
    const nextHover=highlight?.value??0;
    if(nextHover!==hoverValue){hoverValue=nextHover;playerBox.style.setProperty('--apartment-tv-hover',String(hoverValue));}
    const nextVisible=(view==='block'||view==='place'&&['about','experience'].includes(place))&&!document.hidden;
    if(nextVisible&&!loading)load();
    if(nextVisible!==visible){visible=nextVisible;requested=false;if(!visible&&ready)player.pauseVideo();}
    if(visible&&ready&&!requested&&!reduced){requested=true;play();}
    const matrix=visible?screenCssMatrix(T,screen,camera,host.clientWidth,host.clientHeight):null;
    const show=visible&&playing&&matrix;layer.hidden=!show;screen.material=show?portal:resting;
    if(show)playerBox.style.transform='matrix3d('+matrix.join(',')+')';
  }
  return{update,play,dispose(){host.removeEventListener('pointerdown',gesture);player?.destroy();layer.remove();screen.material=resting;portal.dispose();}};
}
