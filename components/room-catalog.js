import {PROJECTS} from '../data/engineering-work.js?v=b477ce33502c';
import {ALBUM_INVENTORY} from './album-inventory.js?v=b477ce33502c';

export const TRACK_ID='45cmyRv6pWUkHK0DUKU5kC';
export const ROOMS={
  about:{
    name:'About me', heading:'A little more me.',
    intro:'Mechanical engineering, city walks, music, and a few things I keep around the apartment.',
    hint:'Choose the TV, a frame, or something on the shelf.',
    presets:['Rainy loft','Oak & linen','Listening lounge','Corner apartment','Sunken den','Gallery flat','Book-lined snug','Pacific cabin','Blue-hour studio','Sunday living room'],
  },
  library:{
    name:'Library', heading:'Ideas worth keeping.',
    intro:'A reading shelf for the books I’m working through, the ones I return to, and the notes they leave behind.',
    hint:'Pull a book from the shelf to see its reading card.',
    presets:['Walnut reading room','Glass reading hall','Archive stacks','Window study','Sunken reading pit','Open book gallery','Book-lined snug','Forest reading lodge','Night study','Oak community library'],
  },
  music:{
    name:'Record Store', heading:'On repeat.',
    intro:'A place to dig through the records I keep coming back to.',
    hint:'Pull a sleeve or visit the turntable.',
    presets:['After-hours record shop','Light oak shop','Listening bar','Corner record shop','Basement bins','Sleeve gallery','Back-room collection','Timber listening room','Blue-hour hi-fi','Sunday record fair'],
  },
  maker:{
    name:'Maker Space', heading:'From the workbench.',
    intro:'Six builds from my engineering portfolio. Each bench opens the story behind the prototype.',
    hint:'Choose a bench to see what I built, how I approached it, and the result.',
    presets:['Prototyping loft','Light fabrication lab','Electronics studio','Corner machine shop','Test bay','Engineering gallery','Instrument room','Timber workshop','Night shift','Teaching lab'],
  },
};

export const UI_STYLES=[
  ['pearl','Silver Pearl','Bright frosted glass with a silver edge.'],
  ['smoke','Smoked Glass','Dark glass with warm type and a stronger outline.'],
  ['amber','Amber Lens','Warm translucent glass with a brass-toned rim.'],
  ['ice','Ice Glass','Cool blue glass, square corners, and crisp dividers.'],
  ['stack','Layered Cards','Offset glass sheets with a layered edge.'],
  ['rail','Side Rail','A tall panel with the room label on a separate rail.'],
  ['wide','Cinema Strip','A wide, low card with the image and text side by side.'],
  ['folio','Glass Folio','Warm paper typography under a translucent cover.'],
  ['halo','Soft Halo','A rounded pane with a soft wash around the edge.'],
  ['split','Split Window','An image pane and a separate glass reading pane.'],
];

// Book metadata, covers, and personal notes can be filled here independently.
const BOOKS=[
  ['reading','Currently reading','#5b766c','Reading list'],
  ['recent','Recently finished','#8e604f','Reading list'],
  ['recommend','A recommendation','#816b4a','Recommendations'],
  ['revisit','Worth revisiting','#465d79','Recommendations'],
  ['idea','An idea to keep','#815e73','Notes'],
  ['quote','A passage to remember','#767b56','Notes'],
  ['queue','Next on the shelf','#a07045','Reading list'],
  ['favorite','A favorite','#574a67','Recommendations'],
  ['borrow','Something borrowed','#497472','Reading list'],
  ['essay','An essay or short read','#a27a73','Notes'],
  ['rating','A rated read','#71614e','Recommendations'],
  ['field','Notes in the margins','#4c606a','Notes'],
].map(([id,title,color,category],i)=>({
  id,title,color,category,number:i+1,kind:'book',author:'',cover:'',rating:null,thoughts:'',recommendedFor:'',
}));

const ABOUT=[
  {id:'portrait',title:'Hey, I’m Diego.',kind:'photo',slot:'Portrait photo',category:'About me',
    text:'I’m interested in the whole path from an idea to something you can hold. My projects move between mechanical design, electronics, controls, fabrication, and testing.',link:['See my engineering work','projects.html']},
  {id:'cities',title:'Cities on foot',kind:'photo',slot:'Downtown or skyline photo',category:'Cities',
    text:'I like dense downtowns, especially the part where the skyline gives way to the small details at street level. A good block makes me want to see what’s around the corner.',link:['Explore the city atlas','city-atlas.html']},
  {id:'outdoors',title:'Outside',kind:'photo',slot:'Hike or soccer photo',category:'Outdoors',
    text:'I like playing soccer, hiking, and getting outside. Autumn around Seattle is one of the things that gave this city its color.'},
  {id:'shelf',title:'Things on the shelf',kind:'photo',slot:'Personal collection photo',category:'Interests',
    text:'A spot for books, records, and the small things I want to keep in the room. My music ranges from Mazzy Star to Playboi Carti.',link:['Visit the record store','music.html']},
  {id:'tv',title:'Phineas and Ferb',kind:'tv',category:'Television',
    text:'A seat on the couch and the show on the TV.',link:['Open the stream on YouTube','https://www.youtube.com/live/_HviSyC7zSU']},
];
const MUSIC=ALBUM_INVENTORY.map((album,index)=>({...album,index,kind:'record',category:'Record collection'}));
const MAKER=PROJECTS.map(p=>({...p,title:p.short,kind:'project',category:p.context}));
const DECK={id:'deck',kind:'deck',title:'Fade Into You',artist:'Mazzy Star',category:'Now spinning'};

export function entriesFor(room){
  return {about:ABOUT,library:BOOKS,maker:MAKER,music:MUSIC}[room]??ABOUT;
}
export function turntableEntry(){return DECK;}

// Window arrangement, casework plan, and independent fill/key/accent colors.
export const ARCHITECTURE=[
  {plan:'loft',width:9.9,depth:7.8,height:3.9,wall:'#78665b',wood:'#79523d',floor:'#b59174',fabric:'#b19b87',rug:'#8b6f63',accent:'#ff8c69',fill:'#86a5d1',light:'#ffd9ad'},
  {plan:'minimal',width:9.7,depth:7.2,height:3.3,wall:'#b7a897',wood:'#ac835d',floor:'#a4988b',fabric:'#dfcdb8',rug:'#ada88f',accent:'#d5c9a6',fill:'#d1def1',light:'#fff0cf'},
  {plan:'listening',width:8.9,depth:8.1,height:3.55,wall:'#484244',wood:'#65483f',floor:'#745746',fabric:'#855b56',rug:'#8b625e',accent:'#e481d8',fill:'#7f8ed7',light:'#ffcd9f'},
  {plan:'corner',width:10.8,depth:7.8,height:3.65,wall:'#8b8e85',wood:'#59685c',floor:'#9e8671',fabric:'#aaa98d',rug:'#7f9391',accent:'#8bbfd2',fill:'#abd0e9',light:'#ffdfb7'},
  {plan:'den',width:10.1,depth:8.4,height:3.7,wall:'#66484a',wood:'#6e4535',floor:'#805c54',fabric:'#b56d62',rug:'#ad8075',accent:'#f28b70',fill:'#9b80a6',light:'#ffc88d'},
  {plan:'gallery',width:11.2,depth:7.3,height:4.25,wall:'#a09c93',wood:'#574b45',floor:'#b3a28d',fabric:'#a7a8ae',rug:'#a49fa2',accent:'#ffa987',fill:'#a7c2e5',light:'#fff1dc'},
  {plan:'archive',width:8.9,depth:7.4,height:3.65,wall:'#53635b',wood:'#664b3d',floor:'#86735e',fabric:'#858b72',rug:'#938167',accent:'#f1c183',fill:'#89a698',light:'#ffd7a6'},
  {plan:'timber',width:10.6,depth:7.7,height:4.1,wall:'#81684c',wood:'#846244',floor:'#967856',fabric:'#8d806c',rug:'#757f61',accent:'#e9a36a',fill:'#95aeaf',light:'#ffd1a2'},
  {plan:'blue',width:9.3,depth:7.8,height:3.5,wall:'#3f4b63',wood:'#555364',floor:'#756b71',fabric:'#818bb6',rug:'#687794',accent:'#8a92f2',fill:'#82a8ff',light:'#f3c6ac'},
  {plan:'sunlit',width:10.5,depth:8.0,height:3.85,wall:'#b7a18a',wood:'#987d55',floor:'#b4a178',fabric:'#b69f73',rug:'#b0936e',accent:'#f5b76b',fill:'#a5b2c6',light:'#fff0c0'},
];
