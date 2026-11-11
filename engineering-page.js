import {applyPageAtmosphere} from './components/page-atmosphere.js?v=b477ce33502c';
import {mountProjectPortfolio} from './components/project-portfolio.js?v=case-studies-2';
applyPageAtmosphere('night');
mountProjectPortfolio(document.querySelector('#engineering-content'));
