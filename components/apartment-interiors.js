import {layoutKit} from './interior-layout.js?v=b477ce33502c';

// Six architectural vignettes use distinct programs and silhouettes. They are
// visual room studies, rather than claims about Diego's possessions or homes.
export function buildApartmentInteriors(ctx,parent){
  const k=layoutKit(ctx,parent,'Six individually furnished apartments and concierge lobby','about');
  const {box,soft,round,cyl,rod,plant}=k;
  const T=ctx.THREE,customBatches=new Map(),detailStats={lathedObjects:0,pleatedCurtains:0,upholsterySeams:0,sculptedPianoParts:0,curvedLamps:0,tableware:0};let cinemaScreen;
  const X=-5.8;
  const C={cream:'#e5dfcf',paper:'#f0ebdd',wood:'#a9855c',walnut:'#6c503c',dark:'#303d3c',sage:'#889179',ochre:'#b99250',rust:'#ad6955',blue:'#647f88',stone:'#b0aea2',pink:'#bb9183',olive:'#727c58'};
  const bookColors=[C.rust,C.blue,C.ochre,C.sage,C.paper,C.walnut];
  const wood=k.mat(C.wood,'wood'),walnut=k.mat(C.walnut,'wood');
  const fabric=c=>k.mat(c,'fabric'),ceramic=c=>k.mat(c,'ceramic'),metal=c=>k.mat(c,'metal');
  function custom(geo,mat,x,y,z,scale=[1,1,1],rotation=[0,0,0]){
    const key=geo.uuid+':'+mat.uuid;
    if(!customBatches.has(key))customBatches.set(key,{geo,mat,parts:[]});
    customBatches.get(key).parts.push({p:k.project(x,y,z),s:scale,r:rotation});
  }
  const lathe=points=>new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),40);
  const vaseGeo=lathe([[0,0],[.54,0],[.72,.06],[.94,.29],[1,.48],[.87,.7],[.5,.86],[.42,1],[.33,1],[.34,.86],[.77,.67],[.83,.47],[.76,.25],[.48,.09],[0,.09]]);
  const cupGeo=lathe([[0,0],[.75,0],[.94,.07],[1,.91],[.96,1],[.78,1],[.76,.16],[0,.16]]);
  const bowlGeo=lathe([[0,0],[.3,0],[.42,.06],[.8,.32],[1,.65],[.96,.71],[.86,.68],[.69,.34],[.34,.13],[0,.13]]);
  const shadeGeo=lathe([[1,0],[1,.04],[.61,1],[.55,1],[.93,.04],[.93,0]]);
  const handleGeo=new T.TorusGeometry(1,.19,10,32);
  function vase(x,y,z,r=.14,h=.29,c=C.cream){custom(vaseGeo,ceramic(c),x,y,z,[r,h,r]);detailStats.lathedObjects++;}
  function cup(x,y,z,c=C.cream,r=.065){custom(cupGeo,ceramic(c),x,y,z,[r,r*1.4,r]);custom(handleGeo,ceramic(c),x+r*.95,y+r*.78,z,[r*.48,r*.56,r*.48]);detailStats.lathedObjects++;detailStats.tableware++;}
  function bowl(x,y,z,r=.18,c=C.cream){custom(bowlGeo,ceramic(c),x,y,z,[r,r,r]);detailStats.lathedObjects++;detailStats.tableware++;}
  function lamp(x,y,z,h=1.5,c=C.paper){
    cyl(.18,.04,metal(C.dark),x,y+.025,z);cyl(.016,h-.19,metal(C.ochre),x,y+(h-.19)/2,z);
    custom(shadeGeo,fabric(c),x,y+h-.22,z,[.25,.3,.25]);round(.13,.14,.13,ceramic(C.paper),x,y+h-.08,z);detailStats.curvedLamps++;
  }
  function seam(x,y,z,w,c=C.cream,yaw=0){
    rod([x-Math.cos(yaw)*w/2,y,z+Math.sin(yaw)*w/2],[x+Math.cos(yaw)*w/2,y,z-Math.sin(yaw)*w/2],.006,fabric(c));detailStats.upholsterySeams++;
  }
  // Soft vertical folds catch light across linen rather than reading as slabs.
  const curtainGeo=new T.PlaneGeometry(1,1,36,12),curtainPosition=curtainGeo.attributes.position;
  for(let i=0;i<curtainPosition.count;i++){
    const x=curtainPosition.getX(i),y=curtainPosition.getY(i);
    curtainPosition.setZ(i,Math.cos((x+.5)*Math.PI*12)*.055+Math.sin(y*4+x*3)*.012);
  }
  curtainGeo.computeVertexNormals();
  const curtainMats=new Map();
  function curtains(y,color=C.paper,width=.44){
    const saved=k.getZone();k.setZone(X,y,12.28);
    let mat=curtainMats.get(color);if(!mat){mat=fabric(color).clone();mat.side=T.DoubleSide;curtainMats.set(color,mat);}
    for(const s of[-1,1]){
      custom(curtainGeo,mat,X+s*2.5,y+1.2,12.28,[width,2.02,1]);
      rod([X+s*(2.5-width*.56),y+2.24,12.26],[X+s*(2.5+width*.56),y+2.24,12.26],.018,metal(C.ochre));
      detailStats.pleatedCurtains++;
    }
    if(saved)k.setZone(...saved);else k.clearZone();
  }
  function feet(x,y,z,w,d,c=C.dark){for(const a of[-1,1])for(const b of[-1,1])cyl(.024,.17,c,x+a*(w/2-.1),y+.085,z+b*(d/2-.09));}
  function sofa(x,y,z,w,c,{legs=C.walnut,pillows=[C.cream,C.ochre],chaise=false}={}){
    feet(x,y,z,w,.78,legs);soft(w,.16,.79,c,x,y+.24,z);
    const n=w>1.8?3:2,cw=(w-.24)/n;
    for(let i=0;i<n;i++){
      const xx=x-w/2+.12+cw*(i+.5);
      soft(cw-.025,.14,.62,c,xx,y+.39,z+.04);
      soft(cw-.015,.48,.16,c,xx,y+.62,z-.28,[.09,0,0]);
    }
    soft(.16,.38,.79,c,x-w/2+.06,y+.48,z);soft(.16,.38,.79,c,x+w/2-.06,y+.48,z);
    for(const [i,s] of [-1,1].entries())soft(.32,.32,.12,pillows[i],x+s*(w/2-.35),y+.62,z-.13,[.12,0,s*.13]);
    if(chaise){soft(.61,.21,1.23,c,x+w/2-.37,y+.3,z+.38);soft(.6,.13,1.18,c,x+w/2-.37,y+.44,z+.4);}
  }
  function lounge(x,y,z,c=C.cream,yaw=0){
    const d=(dx,dy,dz)=>[x+Math.cos(yaw)*dx+Math.sin(yaw)*dz,y+dy,z-Math.sin(yaw)*dx+Math.cos(yaw)*dz];
    soft(.66,.19,.68,fabric(c),...d(0,.38,0),[0,yaw,0]);soft(.7,.56,.17,fabric(c),...d(0,.65,-.27),[.1,yaw,0]);
    for(const s of[-1,1])soft(.12,.26,.64,fabric(c),...d(s*.32,.51,.015),[0,yaw,0]);
    seam(...d(0,.47,.3),.57,C.cream,yaw);seam(...d(0,.87,-.18),.6,C.cream,yaw);
    for(const a of[-1,1])for(const b of[-1,1])cyl(.025,.27,C.walnut,...d(a*.23,.14,b*.23));
  }
  function rug(x,y,z,w,d,c,pattern=0){
    soft(w,.024,d,fabric(c),x,y+.11,z);
    if(pattern===1)for(let i=0;i<7;i++)box(w*.87,.009,.025,C.paper,x,y+.129,z-d*.38+i*d*.125);
    if(pattern===2){box(w-.15,.009,d-.15,C.rust,x,y+.129,z);box(w-.32,.01,d-.32,C.cream,x,y+.136,z);for(let i=0;i<3;i++)box(.19,.013,.19,C.rust,x+(i-1)*.48,y+.145,z,[0,Math.PI/4,0]);}
    if(pattern===3)for(const s of[-1,1])box(w-.1,.008,.045,C.dark,x,y+.13,z+s*(d/2-.12));
  }
  function coffee(x,y,z,c=wood,roundTop=false){
    if(roundTop){cyl(.43,.065,c,x,y+.49,z);cyl(.13,.43,c,x,y+.25,z);}
    else {soft(.95,.07,.51,c,x,y+.46,z);for(const a of[-1,1])for(const b of[-1,1])cyl(.022,.4,C.walnut,x+a*.37,y+.25,z+b*.16);}
    box(.23,.035,.17,C.paper,x-.12,y+.52,z+.01);box(.22,.025,.16,C.blue,x-.1,y+.55,z+.01);cyl(.075,.07,C.cream,x+.17,y+.54,z-.05);
  }
  function art(x,y,z,w=.9,h=.65,style=0){
    const saved=k.getZone();k.setZone(x,y,z);
    box(w+.07,h+.07,.055,walnut,x,y,z);box(w,h,.013,C.paper,x,y,z+.034);
    if(style===0){round(w*.44,h*.74,.008,C.ochre,x-w*.16,y+.02,z+.045);box(w*.31,h*.55,.009,C.sage,x+w*.15,y-h*.1,z+.046);}
    else if(style===1){box(w*.7,h*.13,.01,C.blue,x,y-h*.12,z+.046);box(w*.5,h*.22,.01,C.rust,x-w*.14,y+h*.12,z+.047);round(w*.22,h*.28,.01,C.ochre,x+w*.26,y+h*.2,z+.046);}
    else {box(w*.13,h*.8,.01,C.dark,x-w*.2,y,z+.045,[0,0,-.18]);box(w*.6,h*.15,.01,C.rust,x+w*.08,y-h*.15,z+.046,[0,0,.15]);}
    if(saved)k.setZone(...saved);else k.clearZone();
  }
  function bookshelf(x,y,z,w=1.1,h=1.55){
    box(.065,h,.32,walnut,x-w/2,y+h/2,z);box(.065,h,.32,walnut,x+w/2,y+h/2,z);
    for(let row=0;row<4;row++){
      const yy=y+.12+row*.4;box(w,.045,.34,wood,x,yy,z);
      for(let i=0;i<8;i++){const bh=.19+(i*13%7)*.015;box(.07,bh,.2,bookColors[(i+row)%6],x-w*.4+i*w*.11,yy+bh/2+.026,z+.04,[0,0,i===7?-.14:0]);}
    }
  }
  function kitchen(x,y,z,{color=C.cream,walnutStyle=false,w=2.25}={}){
    const top=walnutStyle?walnut:wood;
    box(w,.72,.57,color,x,y+.44,z);box(w+.05,.065,.62,top,x,y+.83,z);
    for(let i=0;i<4;i++){const xx=x-w*.375+i*w*.25;box(.018,.64,.012,C.stone,xx-w*.125,y+.44,z+.292);box(.14,.018,.022,C.dark,xx,y+.66,z+.31);}
    box(w,.35,.035,C.paper,x,y+1.1,z-.26);
    box(.55,.02,.38,C.dark,x+w*.26,y+.875,z+.025);
    for(const a of[-1,1])for(const b of[-1,1])cyl(.075,.012,C.stone,x+w*.26+a*.14,y+.891,z+.025+b*.095);
    box(.5,.022,.32,C.stone,x-w*.28,y+.874,z);box(.37,.013,.21,C.dark,x-w*.28,y+.89,z);
    rod([x-w*.28,y+.9,z-.13],[x-w*.28,y+1.12,z-.13],.018,C.stone);rod([x-w*.28,y+1.12,z-.13],[x-w*.28,y+1.12,z+.02],.018,C.stone);
    box(w*.68,.055,.26,top,x,y+1.52,z-.13);
    for(let i=0;i<4;i++)cyl(.045,.15,i%2?C.cream:C.rust,x-w*.21+i*.2,y+1.62,z-.12);
    cyl(.075,.17,C.cream,x+w*.4,y+.96,z+.03);
  }
  function dining(x,y,z,material=wood,roundTable=true){
    if(roundTable){cyl(.48,.06,material,x,y+.77,z);cyl(.095,.68,C.dark,x,y+.4,z);cyl(.28,.025,C.dark,x,y+.065,z);}
    else {soft(.83,.065,.7,material,x,y+.77,z);feet(x,y,z,.83,.7);for(const dx of[-.3,.3])cyl(.025,.65,C.walnut,x+dx,y+.4,z);}
    k.chair(x-.59,y+.1,z,C.sage,Math.PI/2);k.chair(x+.59,y+.1,z,C.sage,-Math.PI/2);
    cyl(.055,.16,C.ochre,x,y+.89,z);round(.18,.16,.18,C.sage,x,y+1.01,z);
  }
  function pendant(x,y,z,c=C.cream){rod([x,y+1.97,z],[x,y+1.56,z],.013,C.dark);k.put('cone',.23,.21,.23,c,x,y+1.5,z);cyl(.17,.014,C.paper,x,y+1.392,z);}
  function bed(x,y,z,color=C.sage){
    feet(x,y,z,1.38,1.85);soft(1.42,.18,1.88,walnut,x,y+.2,z);soft(1.33,.2,1.82,C.paper,x,y+.38,z);soft(1.35,.08,1.09,color,x,y+.51,z+.32);
    soft(1.43,.74,.1,walnut,x,y+.57,z-.92);
    for(const s of[-1,1])soft(.53,.1,.35,C.cream,x+s*.32,y+.52,z-.6,[0,.03*s,0]);
  }

  // Each floor has a different architectural program, not a repeated lounge.
  // Human-scale furnishings occupy the enlarged 5.6 × 9-metre usable interior.
  const styles=[
    {name:'Music and art salon',base:3.456},
    {name:'Industrial atelier',base:5.832},
    {name:'Japanese tea room',base:8.208},
    {name:'Cinema den',base:10.584},
    {name:'Conservatory',base:12.96},
    {name:'Scandinavian bedroom and workspace',base:15.336}
  ];
  const glow=k.mat('#efd9ad').clone();glow.emissive=new ctx.THREE.Color('#e9bc75');glow.emissiveIntensity=.25;ctx.glowMaterials?.push(glow);
  const screen=k.mat('#6686a4').clone();screen.emissive=new ctx.THREE.Color('#527e9f');screen.emissiveIntensity=.3;ctx.glowMaterials?.push(screen);
  const pianoShape=new T.Shape();pianoShape.moveTo(-.7,.94);pianoShape.lineTo(.7,.94);pianoShape.lineTo(.7,-.25);pianoShape.bezierCurveTo(.7,-.98,.19,-1.18,-.28,-.95);pianoShape.bezierCurveTo(-.69,-.79,-.7,-.31,-.7,.08);pianoShape.closePath();
  const pianoGeo=new T.ExtrudeGeometry(pianoShape,{depth:.14,bevelEnabled:true,bevelThickness:.018,bevelSize:.02,bevelSegments:4,steps:1,curveSegments:32});pianoGeo.translate(0,0,-.07);pianoGeo.rotateX(Math.PI/2);pianoGeo.computeVertexNormals();
  const pianoFinish=k.mat('#222e2c','lacquer');
  function room(y,floorColor,wallColor,kind='wood'){
    k.clearZone();
    box(5.62,.055,8.93,k.mat(floorColor,kind==='wood'?'deck':kind),X,y+.13,7.8);
    box(5.62,2.13,.06,wallColor,X,y+1.24,3.4);
    box(5.6,.08,.065,C.cream,X,y+.22,3.46);
    box(.86,1.94,.08,wood,X+2.02,y+1.12,3.48);
    box(.04,1.8,.03,C.dark,X+2.35,y+1.12,3.54);
    cyl(.028,.045,C.ochre,X+2.26,y+1.05,3.56,[Math.PI/2,0,0]);
    box(4.9,.03,.04,glow,X-.15,y+2.24,3.5);
    k.setZone(X,y,9.5);
  }
  // Grand piano, open art wall and a curved upholstered conversation seat.
  {
    const y=styles[0].base;room(y,C.walnut,C.pink);
    art(X-.72,y+1.37,3.49,2,1.05);bookshelf(X-2.13,y+.17,5.0,.8,1.8);
    rug(X+.1,y,9.95,4.7,3.55,C.cream);
    const px=X-1.15,pz=10.2;
    custom(pianoGeo,pianoFinish,px,y+.86,pz);custom(pianoGeo,pianoFinish,px+.19,y+1.31,pz,[1,.45,1],[0,0,.32]);detailStats.sculptedPianoParts+=2;
    box(1.38,.11,.25,pianoFinish,px,y+.88,pz+.99);
    for(let i=0;i<52;i++){
      box(.022,.04,.23,ceramic(C.paper),px-.612+i*.024,y+.968,pz+1.02);
      if(i<51&&i%7!==2&&i%7!==6)box(.014,.035,.135,pianoFinish,px-.6+i*.024,y+1.002,pz+.973);
    }
    rod([px+.58,y+.98,pz-.68],[px+.58,y+1.56,pz-.68],.024,metal(C.ochre));
    box(.52,.3,.035,pianoFinish,px,y+1.17,pz+.71,[.2,0,0]);for(const dx of[-.13,.13]){box(.24,.27,.008,C.paper,px+dx,y+1.18,pz+.738,[.2,0,0]);for(let row=0;row<7;row++)box(.18,.003,.004,C.dark,px+dx,y+1.08+row*.028,pz+.766-row*.005);}
    for(const[dx,dz]of[[-.52,.8],[.52,.8],[-.15,-.75]]){cyl(.045,.7,C.dark,px+dx,y+.45,pz+dz);cyl(.075,.07,C.ochre,px+dx,y+.11,pz+dz);}
    soft(.72,.12,.39,walnut,px,y+.55,pz+1.58);feet(px,y+.3,pz+1.58,.72,.4);
    for(let i=0;i<4;i++){
      const a=-.8+i*.5,xx=X+1.23+Math.sin(a)*.85,zz=9.8+Math.cos(a)*.85;
      soft(.62,.25,.73,fabric(C.rust),xx,y+.37,zz,[0,-a,0]);soft(.62,.54,.15,fabric(C.rust),xx+Math.sin(a)*.26,y+.65,zz+Math.cos(a)*.26,[0,-a,0]);
      seam(xx,y+.5,zz-.27,.53,C.pink,-a);
    }
    cyl(.42,.07,walnut,X+1.15,y+.5,9.75);cyl(.11,.43,C.ochre,X+1.15,y+.26,9.75);
    for(const z of[6.8,8.1])plant(X+2.1,y+.2,z,.72);lamp(X+2.2,y+.15,11.65,1.82,C.paper);
    box(2.2,.07,.62,walnut,X+.1,y+.92,5.8);for(const dx of[-.85,.85])cyl(.03,.74,C.dark,X+.1+dx,y+.52,5.8);
  }
  // Steel storage, a sloped drafting island, canvas easel and rolling paint cart.
  {
    const y=styles[1].base;room(y,C.stone,'#9c9b8c','stone');
    for(const xx of[-2.48,2.48])rod([X+xx,y+.18,3.8],[X+xx,y+2.17,11.95],.055,C.dark);
    for(let row=0;row<4;row++)box(2.1,.065,.4,walnut,X-1.15,y+.4+row*.5,4.2);
    for(const dx of[-2.15,-.15])cyl(.035,1.95,C.dark,X+dx,y+1.16,4.2);
    for(let i=0;i<8;i++)box(.17,.24,.25,bookColors[i%6],X-1.9+i*.22,y+1.64,4.22);
    soft(2.35,.09,1.35,wood,X-.45,y+.97,9.1,[-.16,0,0]);
    for(const dx of[-.85,.85]){rod([X-.45+dx,y+.15,8.65],[X-.45+dx,y+.93,9.1],.055,C.dark);rod([X-.45+dx,y+.15,9.7],[X-.45+dx,y+.93,9.1],.055,C.dark);}
    box(1.3,.012,.83,C.paper,X-.45,y+1.04,9.13,[-.16,0,0]);for(let i=0;i<5;i++)box(.018,.013,.65,C.blue,X-.93+i*.24,y+1.065,9.13,[-.16,0,0]);
    cyl(.26,.075,C.rust,X-.35,y+.67,10.3);cyl(.045,.5,C.dark,X-.35,y+.38,10.3);cyl(.35,.04,C.dark,X-.35,y+.15,10.3);
    const ex=X+1.62,ez=10.6;for(const dx of[-.42,.42])rod([ex+dx,y+.18,ez+.2],[ex,y+2.03,ez-.08],.035,wood);rod([ex,y+.2,ez-.6],[ex,y+1.5,ez],.035,wood);
    art(ex,y+1.22,ez+.03,.95,1.2,1);box(1.05,.07,.2,wood,ex,y+.57,ez+.13);
    for(const yy of[.36,.82])box(.73,.055,.55,C.dark,X+1.8,y+yy,7.6);
    for(const dx of[-.3,.3])for(const dz of[-.2,.2]){cyl(.027,.75,C.dark,X+1.8+dx,y+.53,7.6+dz);cyl(.065,.05,C.dark,X+1.8+dx,y+.16,7.6+dz,[Math.PI/2,0,0]);}
    for(let i=0;i<4;i++)cyl(.07,.21,bookColors[i],X+1.56+i*.15,y+.96,7.6);
    pendant(X-.45,y+.13,9.1,C.dark);plant(X-2.25,y+.15,11.7,.85);
  }
  // Raised tatami, floor cushions and a shoji screen enclosing a sleeping alcove.
  {
    const y=styles[2].base;room(y,C.wood,'#d4cfb7');box(5.25,.2,4.1,walnut,X,y+.26,10.1);
    for(let row=0;row<2;row++)for(let col=0;col<3;col++){
      const xx=X-1.68+col*1.68,zz=9.12+row*1.95;box(1.62,.045,1.88,'#b0b58b',xx,y+.39,zz);for(const s of[-1,1])box(.04,.012,1.88,'#64785e',xx+s*.76,y+.42,zz);
    }
    for(const side of[-1,1]){
      const xx=X+side*1.67;box(1.6,1.94,.07,C.paper,xx,y+1.18,7.68);
      for(let i=0;i<6;i++)box(.032,1.96,.09,walnut,xx-.78+i*.312,y+1.18,7.74);
      for(let i=0;i<7;i++)box(1.6,.028,.09,walnut,xx,y+.22+i*.32,7.74);
    }
    box(5.2,.1,.16,walnut,X,y+2.18,7.73);for(const dx of[-.83,.83])box(.07,1.95,.1,walnut,X+dx,y+1.19,7.73);
    soft(1.65,.075,1.05,walnut,X,y+.79,10.05);for(const dx of[-.65,.65])for(const dz of[-.35,.35])cyl(.03,.33,walnut,X+dx,y+.6,10.05+dz);
    for(const[dx,dz]of[[-1.25,0],[1.25,0],[0,1.13]])soft(.63,.11,.63,fabric(C.rust),X+dx,y+.49,10.05+dz);
    vase(X+.15,y+.83,10.05,.13,.2,C.dark);round(.1,.035,.1,ceramic(C.dark),X+.15,y+1.04,10.05);
    const spout=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.1,.03,0),new T.Vector3(.18,.11,0)]);
    custom(new T.TubeGeometry(spout,16,.023,12,false),ceramic(C.dark),X+.24,y+.96,10.05);
    custom(handleGeo,ceramic(C.dark),X+.04,y+.98,10.05,[.08,.09,.08]);
    for(const dx of[-.4,.45])cup(X+dx,y+.83,10.25,C.paper,.045);
    box(.9,.25,.66,walnut,X+2.06,y+.48,11.28);plant(X+2.06,y+.62,11.28,.43);
    soft(1.2,.08,1.9,fabric(C.cream),X-1.3,y+.24,5.2);soft(.8,.08,.35,fabric(C.paper),X-1.3,y+.33,4.5);
    art(X-.8,y+1.36,3.5,.6,1.3,2);pendant(X,y+.13,10.05,C.paper);
    box(.7,.04,.7,'#666e61',X-2.1,y+.19,6.35);round(.35,.2,.3,'#878a7c',X-2.15,y+.3,6.35);
  }
  // Acoustic cinema: large luminous screen, speakers and two tiers of recliners.
  {
    const y=styles[3].base;room(y,'#79513f','#ad8765','wood');
    const masonry=k.mat('#996552','brick'),opal=k.mat('#ffdc9c').clone();
    opal.emissive=new T.Color('#ffb45d');opal.emissiveIntensity=.6;
    box(4.35,2.22,.10,masonry,X,y+1.27,6.71);
    box(2.72,1.62,.1,C.dark,X-.15,y+1.26,6.8);
    cinemaScreen=new T.Mesh(new T.PlaneGeometry(2.52,1.4175),new T.MeshBasicMaterial({color:'#14202b',toneMapped:false}));
    cinemaScreen.name='Apartment cinema live television screen';cinemaScreen.position.set(...k.project(X-.15,y+1.26,6.865));cinemaScreen.userData.mediaSurface=true;k.group.add(cinemaScreen);
    // A ceiling mount, vented projector case, and glass lens face the screen.
    rod([X,y+2.24,10.8],[X,y+2.04,10.8],.028,metal(C.dark));soft(.51,.19,.38,C.paper,X,y+1.95,10.8);
    for(let v=0;v<6;v++)box(.027,.055,.012,C.dark,X-.18+v*.045,y+1.96,10.995);
    cyl(.065,.025,C.dark,X+.12,y+1.95,10.59,[Math.PI/2,0,0]);cyl(.044,.028,screen,X+.12,y+1.95,10.575,[Math.PI/2,0,0]);
    box(4.25,.19,.53,walnut,X-.15,y+.36,6.65);
    for(const side of[-1,1]){box(.36,1.15,.38,C.dark,X+side*2.36,y+.75,6.8);for(const yy of[.45,.8,1.08])cyl(.115,.035,'#68747a',X+side*2.36,y+yy,7.01,[Math.PI/2,0,0]);}
    rug(X,y,10.5,4.65,3.1,'#835441');
    const upholstery=fabric('#a79e8c');
    soft(3.35,.33,.96,upholstery,X,y+.34,11.08);
    for(const dx of [-1.08,0,1.08]){
      soft(1.03,.21,.78,upholstery,X+dx,y+.57,10.99);
      soft(1.02,.59,.20,upholstery,X+dx,y+.89,11.45,[.10,0,0]);
    }
    for(const side of [-1,1]){
      soft(.23,.31,.95,upholstery,X+side*1.57,y+.68,11.08);
      soft(.42,.43,.15,fabric(side<0?'#9d674e':'#565d4c'),X+side*1.01,y+.89,11.23,[.14,0,side*.22]);
      plant(X+side*2.13,y+.22,8.88,.68);
      rod([X+side*1.85,y+2.36,9.05],[X+side*1.85,y+1.88,9.05],.016,metal(C.dark));
      round(.32,.30,.32,opal,X+side*1.85,y+1.79,9.05);
    }
    cyl(.43,.065,walnut,X+.28,y+.53,9.72);
    cyl(.09,.32,metal(C.dark),X+.28,y+.34,9.72);
    soft(.27,.035,.19,C.paper,X+.31,y+.58,9.67,[0,.16,0]);
    for(const[row,z]of[[0,9.2]])for(const dx of[-1.55]){
      const by=y+.14+row*.14;soft(.91,.26,.89,fabric('#496078'),X+dx,by+.36,z);soft(.92,.78,.23,fabric('#496078'),X+dx,by+.74,z+.35,[.13,0,0]);soft(.82,.15,.56,fabric('#496078'),X+dx,by+.25,z-.58,[-.22,0,0]);
      seam(X+dx,by+.53,z-.38,.75,C.blue);seam(X+dx,by+1.08,z+.24,.75,C.blue);
      for(const side of[-1,1]){soft(.18,.4,.9,fabric('#384e63'),X+dx+side*.49,by+.5,z);cyl(.065,.018,metal(C.dark),X+dx+side*.49,by+.71,z-.17);}
    }
    for(const side of[-1,1])box(.025,1.3,.025,glow,X+side*2.65,y+1.0,8.5);
    box(.9,.8,.55,walnut,X+1.85,y+.56,4.7);cyl(.12,.29,C.paper,X+1.85,y+1.12,4.7);
  }
  // Winter garden: arched vine trellis, long planted beds, fountain and cane seats.
  {
    const y=styles[4].base;room(y,'#b9b39e','#c6cdb8','stone');
    for(let i=0;i<9;i++)box(5.5,.025,.04,'#8f9983',X,y+.17,3.9+i*.98);
    const tz=7.2,r=2.35;for(let i=0;i<14;i++){
      const a=i/14*Math.PI,b=(i+1)/14*Math.PI;
      rod([X+Math.cos(a)*r,y+.12+Math.sin(a)*1.94,tz],[X+Math.cos(b)*r,y+.12+Math.sin(b)*1.94,tz],.035,walnut);
    }
    for(const dx of[-2.35,2.35])box(.38,.37,7.5,walnut,X+dx,y+.37,8.1);
    for(const side of[-1,1])for(let i=0;i<6;i++)plant(X+side*2.32,y+.55,4.65+i*1.22,.55+(i%3)*.17);
    for(let i=0;i<9;i++)round(.36,.22,.25,i%2?C.sage:'#617e56',X-1.98+i*.49,y+.9+Math.sin(i/8*Math.PI)*1.15,tz);
    custom(bowlGeo,k.mat('#8f9b8a','stone'),X-.3,y+.24,9.15,[.69,.42,.69]);detailStats.lathedObjects++;
    const water=k.mat('#6e9795','glass').clone();water.transparent=true;water.opacity=.64;water.roughness=.12;water.depthWrite=false;
    cyl(.57,.018,water,X-.3,y+.48,9.15);vase(X-.3,y+.39,9.15,.21,.36,'#9ca791');round(.1,.13,.1,water,X-.3,y+.83,9.15);
    rug(X,y,11.1,3.7,1.9,'#c8b184',1);lounge(X-1.3,y+.15,11.2,'#c5a477',.3);lounge(X+1.3,y+.15,11.2,'#c5a477',-.3);
    cyl(.36,.055,wood,X,y+.65,11.1);cyl(.045,.45,C.ochre,X,y+.4,11.1);cyl(.1,.2,C.rust,X,y+.78,11.1);
    for(const side of[-1,1]){rod([X+side*1.8,y+2.2,5.6],[X+side*1.8,y+1.7,5.6],.017,C.ochre);plant(X+side*1.8,y+1.35,5.6,.38);}
    box(2,.07,.7,wood,X,y+.9,4.8);for(const dx of[-.6,0,.6])cyl(.13,.28,C.cream,X+dx,y+1.08,4.8);
  }
  // Linen-canopied bedroom at the window; workspace and wardrobe occupy the rear.
  {
    const y=styles[5].base;room(y,C.wood,C.paper);const bx=X-.8,bz=10.2;
    soft(1.85,.22,2.35,wood,bx,y+.32,bz);soft(1.74,.24,2.22,fabric(C.paper),bx,y+.53,bz);soft(1.76,.1,1.45,fabric(C.sage),bx,y+.69,bz+.38);
    soft(1.95,1.04,.15,fabric('#c7b99d'),bx,y+.8,bz-1.16);for(const dx of[-.45,.45]){soft(.72,.13,.45,fabric(C.cream),bx+dx,y+.74,bz-.77);seam(bx+dx,y+.8,bz-.55,.63,C.paper);}
    for(let i=0;i<9;i++)seam(bx,y+.747,bz-.18+i*.16,1.67,C.sage);
    for(const dx of[-.98,.98])for(const dz of[-1.23,1.23])cyl(.026,2.11,wood,bx+dx,y+1.18,bz+dz);
    box(2.03,.045,2.56,wood,bx,y+2.24,bz);soft(.28,1.96,.09,fabric(C.paper),bx-.88,y+1.25,bz+1.2,[0,0,.045]);rug(bx,y,10.4,3.0,3.5,C.cream,1);
    for(const side of[-1,1]){soft(.43,.49,.47,wood,bx+side*1.18,y+.4,bz-.72);lamp(bx+side*1.18,y+.65,bz-.72,.55,C.paper);}
    bookshelf(X+1.35,y+.16,7.8,1.85,1.4);
    box(3.25,.07,.74,wood,X-.6,y+.94,5.2);for(const dx of[-1.4,1.4])cyl(.03,.76,C.dark,X-.6+dx,y+.52,5.2);k.chair(X-.25,y+.15,5.96,C.blue);
    box(.95,.58,.04,C.dark,X-.25,y+1.3,5.12);box(.87,.5,.014,screen,X-.25,y+1.3,5.151);rod([X-.25,y+1.05,5.12],[X-.25,y+.92,5.12],.025,C.dark);
    box(.5,.025,.2,C.cream,X-.25,y+.99,5.42);art(X-1.1,y+1.4,3.49,1.4,.9);plant(X+2.05,y+.16,11.65,.9);pendant(X-.6,y+.13,5.2,C.paper);
    box(.8,1.95,1.1,wood,X+2.02,y+1.17,4.92);for(const z of[4.62,5.22])box(.04,1.8,.025,walnut,X+1.61,y+1.17,z);
  }
  // Objects belong to each room's activity, rather than an arbitrary scatter.
  // All custom silhouettes stay at human scale after lot enlargement.
  for(const [i,s]of styles.entries()){
    const y=s.base;k.setZone(X,y,9.5);curtains(y,i===3?'#384e63':i===4?C.cream:C.paper,i===3?.68:.4);
    if(i===0){
      vase(X+1.15,y+.54,9.75,.1,.26,C.cream);cup(X+1.39,y+.54,9.68,C.rust,.055);
      box(.24,.025,.18,k.mat(C.blue,'paper'),X+.95,y+.55,9.83,[0,.14,0]);
      // Polished piano pedals and bench piping finish its visible silhouette.
      for(const dx of[-.13,0,.13]){rod([X-1.15+dx,y+.45,10.82],[X-1.15+dx,y+.21,11.02],.013,metal(C.ochre));soft(.065,.018,.12,metal(C.ochre),X-1.15+dx,y+.2,11.06);}
      seam(X-1.15,y+.62,11.96,.63,C.wood);
    }else if(i===1){
      vase(X+1.8,y+.85,7.6,.09,.18,C.cream);
      for(let b=0;b<6;b++){
        const xx=X+1.8+(b-2.5)*.018;
        rod([xx,y+.95,7.6],[xx+(b-2.5)*.014,y+1.29,7.6],.008,wood);
        cyl(.012,.065,metal(C.stone),xx+(b-2.5)*.014,y+1.3,7.6);round(.025,.055,.021,C.rust,xx+(b-2.5)*.014,y+1.34,7.6);
      }
      bowl(X+.32,y+1.09,8.92,.2,C.paper);
      for(let p=0;p<4;p++)round(.045,.018,.045,bookColors[p],X+.2+p*.065,y+1.18,8.91);
      cup(X-1.2,y+1.13,9.35,C.cream,.06);
    }else if(i===2){
      bowl(X-.22,y+.83,9.87,.13,C.dark);
      for(const dx of[-.04,.04])round(.05,.04,.05,C.cream,X-.22+dx,y+.93,9.87);
      vase(X-2.1,y+.21,6.35,.11,.39,C.rust);
      for(let a=0;a<3;a++){rod([X-2.1,y+.53,6.35],[X-2.14+a*.045,y+.95+a*.05,6.35],.006,C.walnut);round(.06,.075,.035,C.paper,X-2.14+a*.045,y+.99+a*.05,6.35);}
      // Slender textile folds along the futon and bound floor cushions.
      for(const[dx,dz]of[[-1.25,0],[1.25,0],[0,1.13]])seam(X+dx,y+.55,10.35+dz,.52,C.ochre);
    }else if(i===3){
      for(const [row,z]of[[0,9.2],[1,11.2]])for(const dx of[-1.55,1.55])cup(X+dx+.49,y+.865+row*.14,z-.17,C.paper,.045);
      bowl(X+1.85,y+.97,4.7,.2,C.cream);for(let p=0;p<7;p++)round(.065,.06,.055,C.paper,X+1.73+(p%3)*.075,y+1.07+(p%2)*.025,4.65+Math.floor(p/3)*.06);
    }else if(i===4){
      vase(X,y+.68,11.1,.11,.29,C.rust);cup(X+.22,y+.69,11.1,C.cream,.05);
      for(const dx of[-.6,0,.6]){vase(X+dx,y+.95,4.8,.13,.3,dx===0?C.sage:C.cream);rod([X+dx,y+1.2,4.8],[X+dx+.03,y+1.58,4.8],.008,C.sage);round(.15,.12,.11,C.ochre,X+dx+.03,y+1.6,4.8);}
    }else{
      cup(X+.65,y+.99,5.45,C.cream,.06);vase(X-1.65,y+.98,5.2,.11,.21,C.sage);
      for(const dx of[-.2,0,.2])rod([X-1.65,y+1.14,5.2],[X-1.65+dx,y+1.58-Math.abs(dx),5.2],.006,C.walnut);
      box(.37,.035,.25,k.mat(C.paper,'paper'),X-1.95,y+1,5.4,[0,.1,0]);box(.32,.022,.23,k.mat(C.blue,'paper'),X-1.95,y+1.03,5.4,[0,-.08,0]);
      const mattressShade=fabric(C.paper);custom(curtainGeo,mattressShade,X-1.72,y+1.25,11.4,[.43,1.87,1]);detailStats.pleatedCurtains++;
    }
  }
  // Concierge lobby with rear mail bank, reception and an open central aisle.
  const y=.3;room(y,C.stone,C.cream,'stone');
  soft(2.35,.95,.75,walnut,X+.55,y+.6,6.3);soft(2.44,.075,.82,C.cream,X+.55,y+1.12,6.3);
  for(let i=0;i<12;i++)box(.035,.78,.025,wood,X-.5+i*.19,y+.58,6.7);
  box(.48,.32,.04,C.dark,X+.8,y+1.32,6.22);box(.43,.28,.015,screen,X+.8,y+1.32,6.25);
  for(let row=0;row<5;row++)for(let col=0;col<4;col++){box(.36,.23,.22,walnut,X-2.14+col*.39,y+.85+row*.25,3.6);box(.15,.015,.015,C.ochre,X-2.14+col*.39,y+.88+row*.25,3.72);}
  rug(X-.8,y,10.55,2.65,2.4,C.paper,1);lounge(X-1.45,y+.12,10.0,C.sage,.1);lounge(X-.3,y+.12,10.0,C.cream,-.1);
  cyl(.4,.055,wood,X-.85,y+.64,11.15);cyl(.06,.48,C.ochre,X-.85,y+.38,11.15);plant(X+2.1,y+.15,10.8,.88);plant(X-2.15,y+.15,7.8,.82);
  art(X+.55,y+1.6,3.49,1.4,.75);lamp(X+.5,y+.15,11.55,2.0,C.paper);
  vase(X-.85,y+.68,11.15,.12,.23,C.cream);bowl(X-.6,y+.68,11.15,.1,C.ochre);
  k.finish();
  const dummy=new T.Object3D();let sculptedInstances=0;
  for(const {geo,mat,parts}of customBatches.values()){
    const mesh=new T.InstancedMesh(geo,mat,parts.length);mesh.name='Apartment sculpted objects';mesh.castShadow=!mat.transparent;mesh.receiveShadow=true;
    parts.forEach((p,i)=>{dummy.position.set(...p.p);dummy.scale.set(...p.s);dummy.rotation.set(...p.r);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.computeBoundingSphere();k.group.add(mesh);sculptedInstances+=parts.length;
  }
  detailStats.sculptedInstances=sculptedInstances;detailStats.sculptedBatches=customBatches.size;
  k.group.userData.interiorDetail={...detailStats,programs:styles.map(s=>s.name),surfaces:['woven fabric','wood grain','glazed ceramic','brushed metal','lacquer']};
  return{group:k.group,styles,detailStats,cinemaScreen};
}
