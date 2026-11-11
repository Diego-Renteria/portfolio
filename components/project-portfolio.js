import {PROJECTS,ORGANIZATIONS,PORTFOLIO_PDF,PROJECT_PHOTOS} from '../data/engineering-work.js?v=b477ce33502c';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=id=>'assets/projects/'+encodeURIComponent(id)+'.webp';
const caseHref=id=>`projects.html?project=${encodeURIComponent(id)}&atmosphere=night`;
const allHref='projects.html?atmosphere=night#selected-work';
const pdfLink=(label='Portfolio PDF')=>`<a href="${PORTFOLIO_PDF}" target="_blank" rel="noopener">${label} <span aria-hidden="true">↗</span></a>`;
const arrow='<span aria-hidden="true">↗</span>';
const workFilters=[['all','All work'],['robotics','Robotics & controls'],['flight','Flight hardware'],['product','Product design']];

function workRow(p){return `<li data-category="${p.category.join(' ')}"><a class="ep-work-row" href="${caseHref(p.id)}"><span class="ep-work-number" aria-hidden="true">${p.number}</span><span class="ep-work-thumb" data-project="${p.id}"><img src="${asset(p.image)}" alt="" width="132" height="100" loading="lazy" decoding="async"></span><span class="ep-work-copy"><span class="ep-meta">${esc(p.context)}</span><strong>${esc(p.short)}</strong><span class="ep-work-summary">${esc(p.summary)}</span></span><span class="ep-work-result"><span class="ep-meta">Result</span><strong>${esc(p.result)}</strong></span><span class="ep-row-arrow" aria-hidden="true">↗</span></a></li>`;}

function renderIndex(){
 const feature=PROJECTS.find(p=>p.id==='nova-pod');
 return `<div class="ep-utility"><a href="index.html?atmosphere=night"><span aria-hidden="true">←</span> Back to the city</a>${pdfLink()}</div>
 <section class="ep-index-hero" aria-labelledby="work-heading">
  <div class="ep-intro"><p class="ep-eyebrow">Diego Renteria <span></span> Mechanical engineering</p><h1 id="work-heading">Projects <em>&amp;</em><br>Experiences</h1><p class="ep-intro-summary">Mechanical design, prototyping, and testing across robotics, flight hardware, and personal builds.</p><a class="ep-button" href="#selected-work">Browse projects <span aria-hidden="true">↓</span></a></div>
  <a class="ep-feature" href="${caseHref(feature.id)}"><div class="ep-feature-image"><img src="${asset(feature.image)}" alt="${esc(feature.imageAlt)}" width="738" height="979" fetchpriority="high"></div><div class="ep-feature-caption"><div><span class="ep-meta">Featured build</span><strong>${esc(feature.short)}</strong></div><span class="ep-feature-result">${esc(feature.result)}</span><span class="ep-row-arrow" aria-hidden="true">↗</span></div></a>
 </section>
 <section id="experience" class="ep-experience" aria-labelledby="experience-heading"><h2 id="experience-heading">Experience<br><span>&amp; research</span></h2><ul>${ORGANIZATIONS.map(o=>`<li><img src="assets/organizations/${o.image}" alt="${esc(o.name)}" width="144" height="42"></li>`).join('')}</ul></section>
 <section id="selected-work" class="ep-work" aria-labelledby="selected-heading"><div class="ep-section-top"><h2 id="selected-heading">Selected work</h2><p class="ep-count" role="status">${PROJECTS.length} projects</p></div><div class="ep-filters" role="group" aria-label="Filter projects">${workFilters.map(([id,label])=>`<button type="button" data-project-filter="${id}" aria-pressed="${id==='all'}">${esc(label)}</button>`).join('')}</div><ul class="ep-work-list">${PROJECTS.map(workRow).join('')}</ul></section>
 <section class="ep-contact" aria-label="Contact"><div><p class="ep-eyebrow">Diego Renteria</p><h2>Get in touch</h2></div><div class="ep-contact-links"><a href="mailto:diegorent324@gmail.com">Email ${arrow}</a><a href="https://www.linkedin.com/in/diego-renteria" target="_blank" rel="noopener">LinkedIn ${arrow}</a>${pdfLink()}</div></section>`;
}

function evidenceButton(id,alt,hero=false){return `<button type="button" class="ep-photo-button${hero?' ep-photo-hero':''}" data-project-photo="${esc(id)}" aria-label="Enlarge image: ${esc(alt)}"><img src="${asset(id)}" alt="${esc(alt)}" width="640" height="480" ${hero?'fetchpriority="high"':'loading="lazy" decoding="async"'}><span class="ep-expand" aria-hidden="true">⤢</span></button>`;}
function figure([id,title,caption]){return `<figure class="ep-evidence">${evidenceButton(id,caption)}<figcaption><strong>${esc(title)}</strong><span>${esc(caption)}</span></figcaption></figure>`;}
function photoSlot(slot){
 if(slot.image)return figure([slot.image,slot.title,slot.caption]);
 return `<figure class="ep-evidence ep-placeholder"><div class="ep-photo-slot"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true"><rect x="3" y="5" width="24" height="20" rx="2"/><path d="m4 21 7-7 5 5 3-3 7 6"/><circle cx="19" cy="11" r="2"/></svg><span>Photo to add</span></div><figcaption><strong>${esc(slot.title)}</strong><span>${esc(slot.caption)}</span></figcaption></figure>`;
}
function renderCase(p){
 const slots=PROJECT_PHOTOS[p.id],next=PROJECTS[(PROJECTS.indexOf(p)+1)%PROJECTS.length],gallery=p.gallery.filter(([id])=>id!==p.image);
 return `<div class="ep-utility"><a href="${allHref}"><span aria-hidden="true">←</span> All projects</a>${pdfLink()}</div>
 <article class="ep-case" aria-labelledby="case-heading">
  <div class="ep-case-intro" data-project="${p.id}"><div class="ep-case-lead"><p class="ep-eyebrow">Project ${p.number} <span></span> ${esc(p.type)}</p><h1 id="case-heading">${esc(p.short)}</h1><p class="ep-case-summary">${esc(p.summary)}</p><div class="ep-case-result"><span class="ep-meta">Result at a glance</span><strong>${esc(p.result)}</strong></div></div><figure class="ep-case-photo">${evidenceButton(p.image,p.imageAlt,true)}<figcaption>${esc(p.imageAlt)}</figcaption></figure></div>
  <nav class="ep-case-nav" aria-label="Case study sections"><span class="ep-nav-label">In this project</span><a href="#what" data-section-link>01 <strong>What</strong></a><a href="#how" data-section-link>02 <strong>How</strong></a><a href="#results" data-section-link>03 <strong>Results</strong></a></nav>
  <section id="what" class="ep-chapter" aria-labelledby="what-heading"><div class="ep-chapter-title"><p class="ep-eyebrow">01 / What</p><h2 id="what-heading">The problem</h2></div><div class="ep-chapter-body"><p class="ep-chapter-lead">${esc(p.challenge)}</p><dl class="ep-facts"><div><dt>My contribution</dt><dd>${esc(p.role)}</dd></div><div><dt>Project context</dt><dd>${esc(p.context)}</dd></div></dl><ul class="ep-skills" aria-label="Tools and methods">${p.skills.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div></section>
  <section id="how" class="ep-chapter" aria-labelledby="how-heading"><div class="ep-chapter-title"><p class="ep-eyebrow">02 / How</p><h2 id="how-heading">The approach</h2></div><div class="ep-chapter-body"><ol class="ep-process">${p.approach.map(([title,body],i)=>`<li><span class="ep-step-number" aria-hidden="true">0${i+1}</span><div><h3>${esc(title)}</h3><p>${esc(body)}</p></div></li>`).join('')}</ol><div class="ep-gallery-heading"><h3>Build documentation</h3><span>Open a photo for a closer look</span></div><div class="ep-gallery">${gallery.map(figure).join('')}${photoSlot(slots.build)}</div></div></section>
  <section id="results" class="ep-chapter ep-result-chapter" aria-labelledby="results-heading"><div class="ep-chapter-title"><p class="ep-eyebrow">03 / Results</p><h2 id="results-heading">The outcome</h2></div><div class="ep-chapter-body"><div class="ep-metrics">${[[p.metric,p.unit],...(p.extraMetrics||[])].map(([n,label])=>`<div><strong>${esc(n)}</strong><span>${esc(label)}</span></div>`).join('')}</div><div class="ep-results-detail"><p class="ep-chapter-lead">${esc(p.outcome)}</p><div class="ep-result-evidence">${photoSlot(slots.result)}</div></div></div></section>
 </article>
 <nav class="ep-next" aria-label="More projects"><a href="${allHref}">← All projects</a><a href="${caseHref(next.id)}"><span class="ep-meta">Next project</span><strong>${esc(next.short)} ${arrow}</strong></a></nav>`;
}

function mountGallery(host,p){
 const items=[[p.image,p.short,p.imageAlt],...p.gallery.filter(([id])=>id!==p.image),...Object.values(PROJECT_PHOTOS[p.id]).filter(s=>s.image).map(s=>[s.image,s.title,s.caption])];
 const dialog=document.createElement('dialog');dialog.className='ep-gallery-dialog';dialog.setAttribute('aria-labelledby','ep-dialog-title');
 dialog.innerHTML=`<div class="ep-dialog-top"><div><span class="ep-meta" data-photo-count></span><h2 id="ep-dialog-title"></h2></div><button class="ep-dialog-close" type="button" aria-label="Close image">×</button></div><figure><img alt=""><figcaption></figcaption></figure><div class="ep-dialog-nav"><button type="button" data-photo-step="-1" aria-label="Previous image">← Previous</button><button type="button" data-photo-step="1" aria-label="Next image">Next →</button></div>`;
 document.body.append(dialog);const close=dialog.querySelector('.ep-dialog-close'),img=dialog.querySelector('img');let index=0,opener;
 function show(i){index=(i+items.length)%items.length;const [id,title,caption]=items[index];img.src=asset(id);img.alt=caption;dialog.querySelector('h2').textContent=title;dialog.querySelector('figcaption').textContent=caption;dialog.querySelector('[data-photo-count]').textContent=`${index+1} / ${items.length}`;}
 for(const btn of host.querySelectorAll('[data-project-photo]'))btn.addEventListener('click',()=>{opener=btn;show(Math.max(0,items.findIndex(([id])=>id===btn.dataset.projectPhoto)));dialog.showModal();close.focus();});
 close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 for(const button of dialog.querySelectorAll('[data-photo-step]'))button.addEventListener('click',()=>show(index+Number(button.dataset.photoStep)));
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1));}});
}

export function mountProjectPortfolio(host){
 const project=PROJECTS.find(p=>p.id===new URLSearchParams(location.search).get('project'));
 document.title=`${project?.short||'Projects & Experiences'} — Diego Renteria`;
 host.innerHTML=project?renderCase(project):renderIndex();
 if(project){
  mountGallery(host,project);
  const links=[...host.querySelectorAll('[data-section-link]')],chapters=links.map(a=>host.querySelector(a.hash));
  function mark(){const active=chapters.findLast(section=>section.getBoundingClientRect().top<=116)||chapters[0];for(const a of links){if(a.hash==='#'+active.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}}
  let scheduled=false;window.addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{mark();scheduled=false;});},{passive:true});mark();
 }else{
  const buttons=[...host.querySelectorAll('[data-project-filter]')],rows=[...host.querySelectorAll('[data-category]')];
  for(const btn of buttons)btn.addEventListener('click',()=>{for(const b of buttons)b.setAttribute('aria-pressed',String(b===btn));const filter=btn.dataset.projectFilter;let count=0;for(const row of rows){row.hidden=filter!=='all'&&!row.dataset.category.split(' ').includes(filter);if(!row.hidden)count++;}host.querySelector('.ep-count').textContent=`${count} ${count===1?'project':'projects'}`;});
 }
 // Restore direct entry to a case-study section or the Experience link after the
 // sections are mounted, including back/forward links from a project.
 if(location.hash){const id=location.hash.slice(1),legacy={challenge:'what',approach:'how',outcome:'results'};const target=document.getElementById(legacy[id]||id);requestAnimationFrame(()=>target?.scrollIntoView());}
}
