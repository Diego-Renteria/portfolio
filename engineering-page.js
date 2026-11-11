import {applyPageAtmosphere} from './components/page-atmosphere.js?v=b477ce33502c';
import {mountProjectPortfolio} from './components/project-portfolio.js?v=b477ce33502c';
applyPageAtmosphere('night');
mountProjectPortfolio(document.querySelector('#engineering-content'));
