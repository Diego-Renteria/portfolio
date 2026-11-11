// Brake application follows actual motion, including a safety clamp. Hold the
// pedal in a stopped queue, then release it gradually as the driver pulls away.
export function updateBrakeLight(car,previousSpeed,dt){
  if(!(dt>0))return car.brakeLight??0;
  const acceleration=(car.speed-previousSpeed)/dt;
  car.brakePedal??=(car.brakeLight??0)>.5;
  // Latch the pedal through small controller corrections and near-zero coast
  // frames. Release only after sustained acceleration or settled cruising.
  if(acceleration<-.12||(car.acceleration??0)<-.18){car.brakePedal=true;car.brakeReleaseTime=0;}
  else if(car.brakePedal){
    if(car.speed<.08)car.brakeReleaseTime=0;
    else{
      const accelerating=acceleration>.08&&(car.acceleration??0)>=-.03;
      const settled=acceleration>=-.035&&(car.acceleration??0)>=-.08;
      car.brakeReleaseTime=settled?(car.brakeReleaseTime??0)+dt:0;
      if(car.brakeReleaseTime>=(accelerating?.28:.9))car.brakePedal=false;
    }
  }
  // Applied brakes stay at a solid intensity, rather than pulsing every frame.
  car.brakeLight=car.brakePedal?1:(car.brakeLight??0)*Math.exp(-dt*12);
  if(car.brakeLight<.001)car.brakeLight=0;
  return car.brakeLight;
}
export function brakeLensColor(color,car){
  const b=car.brakeLight??0;
  return color.setRGB(.16+b*.84,.007+b*.045,.004+b*.018);
}
