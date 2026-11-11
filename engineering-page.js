import {applyPageAtmosphere} from './components/page-atmosphere.js?v=b477ce33502c';
import {mountProjectPortfolio} from './components/project-portfolio.js?v=rooms-1';
applyPageAtmosphere('night');
mountProjectPortfolio(document.querySelector('#engineering-content'));
