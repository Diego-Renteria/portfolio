import {detailKit} from './detail-kit.js?v=b477ce33502c';

export const roomCatalog=Object.freeze([
 ['Warm loft living','residential'],['Nordic apartment','residential'],['Residential kitchen','residential'],['Apartment dining room','residential'],['Quiet bedroom','residential'],['Home study','residential'],
 ['Product engineering office','office'],['Conference suite','office'],['Architecture studio','office'],['Electronics lab','office'],['Recording studio','studio'],['Artist atelier','studio'],
 ['Boutique hotel room','hotel'],['Hotel lounge','hotel'],['Neighborhood café','retail'],['Artisan bakery','retail'],['Independent bookstore','retail'],['Flower shop','retail'],['Bicycle workshop','retail'],['Corner grocery','retail'],['Design showroom','retail'],['Evening restaurant','retail'],['Community reading room','civic'],['Small art gallery','civic']
].map(([name,use],id)=>Object.freeze({id,name,use})));

export function cityProgram(building){
 const f=building.family||'',central=Math.hypot(building.x,building.z+24)<78;
 if(/flagship|glass|chamfer|cantilever|twin|harbor-sail|bronze-exchange|porcelain-fold|fluted-terracotta/.test(f))return {code:1,use:'office',district:central?'business core':'mixed-use edge'};
 if(/hotel|carved-masonry-crown/.test(f))return {code:3,use:'hotel',district:'visitor quarter'};
 if(/market/.test(f))return {code:4,use:'market',district:'market streets'};
 if(/arcade|courtyard|mews/.test(f))return {code:2,use:'studio',district:'creative streets'};
 if(/terminal/.test(f))return {code:5,use:'civic',district:'north civic frontage'};
 return {code:0,use:'residential',district:'residential loft streets'};
}

/** Detailed real 3D rooms, captured into a depth-mapped window atlas. */
export function buildCityRoom(ctx,id){
 const {THREE:T}=ctx,scene=new T.Scene(),k=detailKit(ctx,scene,roomCatalog[id].name),{box,soft,cyl,round,rod,chair,plant,lamp}=k;
 const palettes=[['#e0d6c2','#a77e53','#68816f'],['#e6e3d6','#c2a779','#8398a1'],['#d5c6b7','#78553b','#b57557'],['#bfcac4','#947351','#4d6e73']];
 const [wall,timber,accent]=palettes[id%4],wood=k.mat(timber,'wood'),fabric=k.mat(accent,'fabric'),stone=k.mat('#b8b3a3','stone'),metal=k.mat('#56615d','metal'),paper='#e3ddcd',dark='#293c3d';
 const glow=k.mat('#eed5a7').clone();glow.emissive=new T.Color('#ffdfad');glow.emissiveIntensity=.7;
 let objects=0;const features=[];
 // The cube is normalized by the window shader. Room coordinates are 3.2m wide,
 // 2.5m high and 3.6m deep; fronts and floors retain plausible furniture scale.
 box(3.4,.10,3.8,wood,0,-.06,0);box(3.4,.1,3.8,paper,0,2.55,0);
 box(3.4,2.6,.10,k.mat(wall,'concrete'),0,1.25,-1.85);
 for(const s of[-1,1]){box(.10,2.6,3.8,k.mat(wall,'concrete'),s*1.65,1.25,0);box(.04,.1,3.7,wood,s*1.59,.08,0);}
 for(let row=0;row<14;row++){const z=-1.7+row*.25;box(3.2,.003,.008,k.mat('#6b5947','wood'),0,.001,z);for(let joint=0;joint<3;joint++)box(.008,.003,.24,k.mat('#6b5947','wood'),-1.1+joint*1.1+(row%2)*.25,.002,z+.12);}
 for(const x of[-1.57,1.57]){box(.025,.13,.09,paper,x,.45,.6);for(const y of[.43,.47])box(.028,.018,.012,dark,x,y,.61);}
 // Front wall is behind the sampling origin; narrow curtain wings frame views.
 box(3.4,2.6,.10,k.mat(wall,'concrete'),0,1.25,1.85);
 for(const s of[-1,1])for(let j=0;j<7;j++)soft(.055,2.2,.06,k.mat('#cfc6b4','fabric'),s*(1.36+j*.032),1.3,1.73);
 const hemi=new T.HemisphereLight('#e0edf5','#554331',.75),sun=new T.DirectionalLight('#fff0d9',1.4);sun.position.set(-1,2.6,5);scene.add(hemi,sun);
 const lights=[];
 function fixture(x,y,z,power=5){cyl(.16,.045,metal,x,y+.04,z);cyl(.13,.018,glow,x,y,z);const l=new T.PointLight('#ffe2b9',power,5,2);l.position.set(x,y-.04,z);scene.add(l);lights.push(l);}
 fixture(.1,2.38,-.15,6);
 function book(x,y,z,n=6,standing=true){for(let j=0;j<n;j++){const h=.17+(j*7%5)*.025,c=['#a76b4f','#7b9283','#c5aa67','#8c7c95','#5b7989'][j%5];box(standing?.045:.22,standing?h:.035,.17,c,x+(standing?j*.052:0),y+(standing?h/2:j*.037),z);box(standing?.003:.19,standing?h-.025:.022,.16,paper,x+(standing?j*.052+.024:0),y+(standing?h/2:j*.037+.003),z+.008);}objects+=n;}
 function cup(x,y,z){cyl(.045,.085,paper,x,y+.042,z);cyl(.036,.006,'#664b36',x,y+.088,z);k.put('torus',.027,.027,.027,paper,x+.047,y+.045,z,[0,Math.PI/2,0]);objects++;}
 function art(x,y,z,w=.7,h=.6,style=0){box(w+.06,h+.06,.045,wood,x,y,z);box(w,h,.015,paper,x,y,z+.03);round(w*.32,h*.4,.01,['#be8059','#647e85','#c0aa72','#83936b'][Math.abs(Math.floor(style))%4],x-w*.12,y+h*.1,z+.043);box(w*.6,h*.14,.01,accent,x+w*.06,y-h*.22,z+.046);objects++;}
 function rug(x,z,w=2,d=1.6){soft(w,.018,d,k.mat(id%2?'#a9b2a5':'#c8aa8e','fabric'),x,.015,z);for(const s of[-1,1])box(w-.08,.004,.04,paper,x,.03,z+s*(d/2-.09));}
 function sofa(x,z,w=1.8){soft(w,.19,.73,fabric,x,.36,z);soft(w,.52,.16,fabric,x,.66,z-.30);for(const s of[-1,1]){soft(.15,.4,.76,fabric,x+s*(w/2-.06),.57,z);soft(.35,.3,.15,k.mat(id%2?'#c79f71':'#d1c8ac','fabric'),x+s*w*.27,.65,z-.16,[0,0,s*.14]);for(const dz of[-.25,.25])cyl(.035,.17,wood,x+s*w*.39,.10,z+dz);}features.push('upholstered seating');}
 function table(x,z,w=1,d=.65,y=.48){soft(w,.065,d,wood,x,y,z);for(const sx of[-1,1])for(const sz of[-1,1])cyl(.022,y-.045,metal,x+sx*w*.4,y/2,z+sz*d*.38);}
 function shelving(x,z,w=1.35,height=1.9){for(const dx of[-w/2,w/2])box(.06,height,.3,wood,x+dx,height/2,z);for(let row=0;row<5;row++){const y=.17+row*(height-.22)/4;box(w,.055,.32,wood,x,y,z);book(x-w*.40,y+.03,z+.03,Math.max(4,Math.floor(w/.09)));}features.push('stocked shelving');}
 function desk(x,z,w=1.2,screen=true){table(x,z,w,.6,.76);if(screen){box(.53,.36,.035,dark,x,1.02,z-.09);box(.48,.30,.01,'#6f929a',x,1.02,z-.066);box(.025,.15,.025,metal,x,.83,z-.1);box(.25,.02,.14,metal,x,.79,z-.1);box(.38,.018,.12,dark,x,.805,z+.16);for(let j=0;j<5;j++)box(.30,.003,.006,paper,x,.816,z+.12+j*.014);}book(x-w*.35,.81,z+.13,3,false);cup(x+w*.32,.80,z+.12);chair(x,0,z+.62,accent,Math.PI);objects+=6;}
 function cabinet(x,z,w=1.3){box(w,.82,.52,wood,x,.43,z);box(w+.04,.06,.56,stone,x,.87,z);for(let i=0;i<3;i++){box(w/3-.03,.68,.025,paper,x-w/3+i*w/3,.46,z+.276);box(.14,.018,.026,metal,x-w/3+i*w/3,.66,z+.295);}objects+=5;}
 function bed(){soft(1.45,.23,2.02,wood,-.2,.25,-.3);soft(1.43,.18,1.98,k.mat('#eee8d7','fabric'),-.2,.45,-.3);soft(1.43,.06,1.05,fabric,-.2,.57,.08);soft(1.49,.85,.12,wood,-.2,.55,-1.34);for(const x of[-.57,.17])soft(.56,.12,.35,k.mat(paper,'fabric'),x,.59,-1);for(const x of[-1.18,.79]){table(x,-1,.4,.42,.5);lamp(x,.52,-1,.38,paper);}art(-.2,1.8,-1.78,1,.6,id);features.push('layered bedding');}
 function counter(x,z,w=2.4){cabinet(x,z,w);box(w,.25,.07,wood,x,1.02,z-.2);for(let j=0;j<5;j++){cyl(.06,.13,paper,x-w*.36+j*.18,1.01,z+.08);}features.push('service counter');}
 function retailShelf(x,z,w=1.3,mode='goods'){shelving(x,z,w,1.9);if(mode==='plants')for(let j=0;j<3;j++)plant(x-w*.32+j*w*.32,.58,z+.25,.25);}
 function workbench(x,z){desk(x,z,1.65,false);box(.75,.62,.05,k.mat('#b9ae91','wood'),x,1.3,z-.32);for(let j=0;j<8;j++){cyl(.014,.18,metal,x-.30+j*.08,1.3,z-.27);box(.035,.07,.04,['#c2854f','#527c7d'][j%2],x-.30+j*.08,1.43,z-.27);}features.push('organized workbench');}
 if(id<=1){rug(0,.45);sofa(-.15,-.7,id?1.7:2.1);table(.1,.53,1.1,.65,.43);book(-.15,.47,.55,4,false);cup(.4,.47,.56);shelving(1.12,-1.58,.7);art(-.25,1.72,-1.78,1.1,.65,id);plant(-1.25,0,-1.18,.5);lamp(1.1,0,-.55,1.5);}
 else if(id===2){cabinet(-.3,-1.5,2.55);box(.48,.04,.34,metal,-.4,.92,-1.46);cyl(.02,.24,metal,-.4,1.04,-1.7);for(const x of[.45,.68])for(const z of[-1.6,-1.37])cyl(.07,.01,dark,x,.92,z);box(2.4,.55,.32,paper,-.3,1.9,-1.64);for(let j=0;j<6;j++)box(.36,.45,.025,wood,-1.28+j*.39,1.9,-1.46);table(0,.35,1.65,.65,.85);for(const x of[-.55,.55])chair(x,0,.95,accent);plant(1.15,0,-.4,.4);cup(.3,.89,.3);features.push('kitchen cabinetry and appliances');}
 else if(id===3||id===21){rug(0,0,2.4,2.5);table(0,-.1,1.5,.9,.76);for(const x of[-.55,.55])for(const z of[-.8,.65]){chair(x,0,z,accent,z<0?0:Math.PI);cup(x,.8,z<0?-.35:.2);}cabinet(0,-1.5,2.5);plant(1.25,0,-1.1,.4);art(-.2,1.7,-1.78,1.2,.6,id);features.push('set dining tables');}
 else if(id===4||id===12){bed();rug(-.1,1.1,2.1,.7);cabinet(1.27,.5,.55);plant(-1.25,0,1.1,.4);if(id===12){box(.65,.4,.035,dark,1.58,1.3,.5,[0,-Math.PI/2,0]);table(-1.2,.7,.4,.5,.55);cup(-1.2,.59,.7);}}
 else if(id===5||id===6){desk(-.6,-.55,id===5?1.2:1.35);if(id===6)desk(.85,.5,1.0);else sofa(.55,.85,1.35);shelving(.5,-1.55,1.8);plant(-1.3,0,.85,.4);art(-.65,1.7,-1.78,.65,.5,id);features.push('monitors, keyboards and desk objects');}
 else if(id===7){table(0,0,1.5,1.7,.76);for(const x of[-1,1])for(const z of[-.55,.55])chair(x,0,z,accent,x<0?Math.PI/2:-Math.PI/2);box(1.4,.76,.035,dark,0,1.45,-1.78);box(1.30,.66,.01,'#668b90',0,1.45,-1.75);for(let j=0;j<3;j++)book(-.45+j*.4,.8,.15,1,false);plant(1.25,0,-1.25,.45);features.push('conference display');}
 else if(id===8||id===9){workbench(-.35,-.85);desk(.75,.7,.85,id===9);if(id===8){box(.65,.03,.5,paper,-.4,.82,-.8);for(let j=0;j<8;j++)box(.05+j*.014,.08+j*.035,.08,'#d8caaa',-.65+(j%4)*.16,.89+ j*.012,-1+(j%2)*.24);features.push('architectural scale models');}else{for(const x of[-.9,-.3,.4]){box(.35,.18,.30,metal,x,.94,-.9);box(.22,.10,.015,'#77a1a1',x,.97,-.74);}features.push('electronics equipment');}shelving(1.12,-1.55,.65);plant(-1.3,0,1,.4);}
 else if(id===10){for(let j=0;j<9;j++)box(.14,1.3,.10,k.mat(j%2?'#555b61':'#3e484c','fabric'),-1.3+j*.32,1.45,-1.74);desk(0,-.8,2.2);for(let j=0;j<18;j++){cyl(.013,.018,metal,-.8+j*.09,.83,-.69);box(.024,.025,.10,dark,-.8+j*.09,.83,-.54);}for(const x of[-1.2,1.2]){box(.30,.50,.3,dark,x,1.13,-.9);cyl(.08,.025,metal,x,1.17,-.735,[Math.PI/2,0,0]);}sofa(0,1,1.75);rug(0,.8);features.push('acoustic panels and mixing console');}
 else if(id===11){workbench(.2,-1.05);for(const x of[-.7,.7]){rod([x-.25,0,.3],[x,1.5,.2],.025,wood);rod([x+.25,0,.3],[x,1.5,.2],.025,wood);art(x,1,.28,.65,.85,id+x);}shelving(-1.2,-1.55,.5);plant(1.3,0,1,.4);features.push('easels and art supplies');}
 else if(id===13){sofa(-.1,-1.1,2.15);rug(0,.2);table(0,.2,1.25,.7,.43);book(-.1,.48,.2,5,false);cup(.5,.48,.2);plant(-1.25,0,.7,.6);cabinet(1.25,.5,.45);art(.1,1.75,-1.78,1.2,.6,id);lamp(1.1,0,-.8,1.5);}
 else if(id===14||id===15){counter(0,-1.25);box(.42,.32,.30,metal,.7,1.08,-1.23);cyl(.06,.22,dark,.7,1.28,-1.23);for(const x of[-.9,.8]){table(x,.65,.65,.6,.72);chair(x,0,1.2,accent,Math.PI);cup(x,.76,.6);}if(id===15){for(let row=0;row<3;row++)for(let j=0;j<7;j++)round(.17,.09,.10,'#b88b51',-.9+j*.25,1+row*.14,-1.18);features.push('pastry display');}else features.push('espresso machine');retailShelf(-1.22,-1.5,.5);plant(1.25,0,1.1,.45);}
 else if(id===16||id===22){shelving(-.8,-1.55,1.35);shelving(.75,-1.55,1.25);shelving(-1.35,-.25,.4);table(.25,.4,1.15,.65,.74);chair(.2,0,1,accent,Math.PI);book(.15,.79,.35,5,false);cup(.6,.79,.5);plant(1.25,0,.85,.4);features.push('book displays and reading table');}
 else if(id===17){counter(.4,-1.25,1.8);for(let j=0;j<12;j++)plant(-1.2+(j%4)*.7,0,-.4+Math.floor(j/4)*.7,.25+(j%3)*.1);for(let j=0;j<5;j++)plant(-1+j*.46,.91,-1.3,.24);features.push('plants and cut-flower displays');}
 else if(id===18){workbench(0,-1.15);for(const x of[-.65,.65]){for(const z of[-.3,.65])k.put('torus',.32,.32,.32,dark,x,.4,z,[0,Math.PI/2,0]);rod([x,.4,-.3],[x,.9,.1],.035,accent);rod([x,.9,.1],[x,.4,.65],.035,accent);rod([x,.4,-.3],[x,.4,.65],.03,metal);rod([x,.9,.1],[x,1.1,-.1],.03,metal);box(.16,.05,.25,dark,x,1.1,-.1);}features.push('bicycles and repair tools');}
 else if(id===19){shelving(0,-1.55,2.7);for(let row=0;row<3;row++)for(let j=0;j<8;j++){cyl(.035,.15,['#b38c55','#879b66','#a96e5c'][j%3],-.95+j*.27,.36+row*.4,-1.32);}counter(.8,.6,1.2);for(const x of[-1,-.4]){box(.46,.4,.7,wood,x,.23,.5);for(let j=0;j<10;j++)round(.10,.10,.10,j%2?'#bda45c':'#9b6b4c',x+(j%3-.8)*.12,.48+Math.floor(j/3)*.03,.3+(j%2)*.3);}features.push('produce crates and pantry stock');}
 else if(id===20){sofa(0,-.8,1.9);rug(0,.4);table(.2,.4,.9,.6,.43);lamp(-1.1,0,-.75,1.55);art(-.1,1.75,-1.78,1,.7,id);plant(1.15,0,.9,.5);features.push('furniture and material samples');}
 else{for(const x of[-.95,0,.95]){art(x,1.55,-1.78,.63,.8,id+x);box(.4,.6,.4,stone,x,.3,-.6);round(.28,.45,.25,metal,x,.83,-.6,[0,0,x*.3]);}benchGallery();features.push('framed works and sculptures');}
 function benchGallery(){soft(1.5,.12,.5,wood,0,.47,.9);for(const x of[-.6,.6])box(.06,.42,.38,metal,x,.22,.9);}
 // Small useful details are shared across designs but arranged differently.
 for(let j=0;j<3;j++){box(.14,.006,.20,paper,.75+j*.12,.02,1.4-j*.12,[0,j*.3,0]);objects++;}
 k.finish();let instances=0;scene.traverse(o=>{if(o.isInstancedMesh)instances+=o.count;});
 return {scene,catalog:roomCatalog[id],instances,objects,features,setNight(night){hemi.intensity=night?.28:1.15;sun.intensity=night?.12:1.7;lights.forEach(l=>l.intensity=night?8:6);glow.emissiveIntensity=night?1:.25;},dispose(){scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});glow.dispose();}};
}

