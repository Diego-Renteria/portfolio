/** ResizeObserver runs after paint preparation. Queue its changes so clearing
 * the drawing buffer and rendering the new camera always happen in one frame. */
export function createFrameResize({renderer,host,onResize}){
  let pending=true,width=0,height=0;
  return {
    invalidate(){pending=true;},
    flush(){
      if(!pending)return false;pending=false;
      const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
      if(w===width&&h===height)return false;
      width=w;height=h;renderer.setSize(w,h,false);onResize(w,h);return true;
    }
  };
}

/** Fog follows the actual camera distance, never the newly requested view. */
export function cameraRainDensity(distance,atmosphere){
  if(atmosphere!=='rain')return 0;
  const t=Math.max(0,Math.min(1,(180-distance)/110));
  return .0065*t*t*(3-2*t);
}
