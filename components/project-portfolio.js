import {PROJECTS, ORGANIZATIONS, PORTFOLIO_PDF, PROJECT_PHOTOS} from '../data/engineering-work.js?v=b477ce33502c';

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
const asset = id => 'assets/projects/' + encodeURIComponent(id) + '.webp';
const caseHref = id => 'projects.html?project=' + encodeURIComponent(id) + '&amp;atmosphere=night';
const allHref = 'projects.html?atmosphere=night#selected-work';
const arrow = '<span aria-hidden="true">↗</span>';
const pdfLink = (label = 'Portfolio PDF') =>
  `<a href="${PORTFOLIO_PDF}" target="_blank" rel="noopener">${label} ${arrow}</a>`;
const filters = [
  ['all', 'All projects'],
  ['robotics', 'Robotics & controls'],
  ['flight', 'Flight hardware'],
  ['product', 'Product design'],
];

function projectCard(project) {
  return `
    <li data-category="${project.category.join(' ')}">
      <a class="ep-project" href="${caseHref(project.id)}" data-project="${project.id}">
        <div class="ep-project-image">
          <img src="${asset(project.image)}" alt="" width="420" height="280" loading="lazy" decoding="async">
        </div>
        <div class="ep-project-copy">
          <p class="ep-meta">${escapeHtml(project.context)}</p>
          <h3>${escapeHtml(project.short)}</h3>
          <p class="ep-project-summary">${escapeHtml(project.summary)}</p>
          <div class="ep-project-outcome">
            <div><span class="ep-meta">Result</span><strong>${escapeHtml(project.result)}</strong></div>
            <span class="ep-arrow" aria-hidden="true">↗</span>
          </div>
        </div>
      </a>
    </li>`;
}

function renderIndex() {
  const featured = PROJECTS.find(project => project.id === 'nova-pod');
  return `
    <div class="ep-shell">
      <div class="ep-utility"><a href="index.html?atmosphere=night">← Back to the city</a>${pdfLink()}</div>
      <section class="ep-index-hero" aria-labelledby="work-heading">
        <div class="ep-intro">
          <p class="ep-meta">Diego Renteria <span aria-hidden="true">/</span> Mechanical engineering</p>
          <h1 id="work-heading">Projects <em>&amp;</em><br>Experiences</h1>
          <p class="ep-lead">I design, build, and test hardware, from flight systems and robotics to personal projects.</p>
          <a class="ep-button" href="#selected-work">Browse projects <span aria-hidden="true">↓</span></a>
        </div>
        <a class="ep-feature" href="${caseHref(featured.id)}">
          <img src="${asset(featured.image)}" alt="${escapeHtml(featured.imageAlt)}" width="738" height="979" fetchpriority="high">
          <div class="ep-feature-caption">
            <div><p class="ep-meta">Featured project</p><strong>${escapeHtml(featured.short)}</strong></div>
            <span class="ep-feature-link">View case study ${arrow}</span>
          </div>
        </a>
      </section>
      <section class="ep-experience" id="experience" aria-labelledby="experience-heading">
        <h2 id="experience-heading">Work &amp; research</h2>
        <ul>${ORGANIZATIONS.map(org => `<li><img src="assets/organizations/${org.image}" alt="${escapeHtml(org.name)}" width="140" height="42"></li>`).join('')}</ul>
      </section>
    </div>
    <section class="ep-paper ep-work" id="selected-work" aria-labelledby="selected-heading">
      <div class="ep-shell">
        <div class="ep-work-top">
          <h2 id="selected-heading">Selected projects</h2>
          <p class="ep-count" role="status">${PROJECTS.length} projects</p>
        </div>
        <div class="ep-filters" role="group" aria-label="Filter projects">
          ${filters.map(([id, label]) => `<button type="button" data-project-filter="${id}" aria-pressed="${id === 'all'}">${escapeHtml(label)}</button>`).join('')}
        </div>
        <ul class="ep-project-grid">${PROJECTS.map(projectCard).join('')}</ul>
      </div>
    </section>
    <section class="ep-shell ep-contact" aria-labelledby="contact-heading">
      <h2 id="contact-heading">Get in touch</h2>
      <div>
        <a href="mailto:diegorent324@gmail.com">Email ${arrow}</a>
        <a href="https://www.linkedin.com/in/diego-renteria" target="_blank" rel="noopener">LinkedIn ${arrow}</a>
        ${pdfLink()}
      </div>
    </section>`;
}

function photoButton(id, title, alt, hero = false) {
  return `
    <button type="button" class="ep-photo-button${hero ? ' ep-photo-hero' : ''}" data-project-photo="${escapeHtml(id)}" aria-label="Enlarge image of ${escapeHtml(title)}">
      <img src="${asset(id)}" alt="${escapeHtml(alt)}" width="640" height="480" ${hero ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>
      <span class="ep-expand" aria-hidden="true">⤢</span>
    </button>`;
}

function photoFigure([id, title, caption]) {
  return `<figure class="ep-evidence">
    ${photoButton(id, title, caption)}
    <figcaption><strong>${escapeHtml(title)}</strong><span>${escapeHtml(caption)}</span></figcaption>
  </figure>`;
}

function photoSlot(slot) {
  if (slot.image) return photoFigure([slot.image, slot.title, slot.caption]);
  return `<figure class="ep-evidence ep-placeholder">
    <div class="ep-photo-slot">
      <svg width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden="true"><rect x="3" y="5" width="24" height="20" rx="2"/><path d="m4 21 7-7 5 5 3-3 7 6"/><circle cx="19" cy="11" r="2"/></svg>
      <span class="ep-meta">Photo placeholder</span>
    </div>
    <figcaption><strong>${escapeHtml(slot.title)}</strong><span>${escapeHtml(slot.caption)}</span></figcaption>
  </figure>`;
}

function renderCase(project) {
  const slots = PROJECT_PHOTOS[project.id];
  const next = PROJECTS[(PROJECTS.indexOf(project) + 1) % PROJECTS.length];
  const gallery = project.gallery.filter(([id]) => id !== project.image);
  const metrics = [[project.metric, project.unit], ...(project.extraMetrics || [])];
  return `
    <article class="ep-case" aria-labelledby="case-heading">
      <div class="ep-shell">
        <div class="ep-utility"><a href="${allHref}">← All projects</a>${pdfLink()}</div>
        <div class="ep-case-intro" data-project="${project.id}">
          <div class="ep-case-lead">
            <p class="ep-meta">${escapeHtml(project.type)} <span aria-hidden="true">/</span> ${escapeHtml(project.context)}</p>
            <h1 id="case-heading">${escapeHtml(project.short)}</h1>
            <p class="ep-lead">${escapeHtml(project.summary)}</p>
            <dl class="ep-case-outcome"><dt class="ep-meta">Result</dt><dd>${escapeHtml(project.result)}</dd></dl>
          </div>
          <figure class="ep-case-photo">
            ${photoButton(project.image, project.short, project.imageAlt, true)}
            <figcaption>${escapeHtml(project.imageAlt)}</figcaption>
          </figure>
        </div>
      </div>
      <div class="ep-paper">
        <div class="ep-shell ep-case-layout">
          <nav class="ep-case-nav" aria-label="Case study sections">
            <p class="ep-meta">In this case study</p>
            <a href="#what" data-section-link>What</a>
            <a href="#how" data-section-link>How</a>
            <a href="#results" data-section-link>Results</a>
          </nav>
          <div class="ep-case-chapters">
            <section id="what" class="ep-chapter" aria-labelledby="what-heading">
              <p class="ep-meta">What</p>
              <h2 id="what-heading">The problem</h2>
              <p class="ep-chapter-lead">${escapeHtml(project.challenge)}</p>
              <dl class="ep-facts">
                <div><dt>My contribution</dt><dd>${escapeHtml(project.role)}</dd></div>
                <div><dt>Tools &amp; methods</dt><dd>${project.skills.map(escapeHtml).join(' · ')}</dd></div>
              </dl>
            </section>
            <section id="how" class="ep-chapter" aria-labelledby="how-heading">
              <p class="ep-meta">How</p>
              <h2 id="how-heading">The approach</h2>
              <ol class="ep-process">
                ${project.approach.map(([title, body]) => `<li><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></div></li>`).join('')}
              </ol>
              <h3 class="ep-gallery-heading">Build documentation</h3>
              <div class="ep-gallery">${gallery.map(photoFigure).join('')}${photoSlot(slots.build)}</div>
            </section>
            <section id="results" class="ep-chapter" aria-labelledby="results-heading">
              <p class="ep-meta">Results</p>
              <h2 id="results-heading">The outcome</h2>
              <dl class="ep-metrics">${metrics.map(([value, label]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
              <div class="ep-result-detail">
                <p class="ep-chapter-lead">${escapeHtml(project.outcome)}</p>
                ${photoSlot(slots.result)}
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
    <nav class="ep-shell ep-next" aria-label="More projects">
      <a href="${allHref}">← All projects</a>
      <a href="${caseHref(next.id)}"><span class="ep-meta">Next project</span><strong>${escapeHtml(next.short)} ${arrow}</strong></a>
    </nav>`;
}

function mountGallery(host, project) {
  const items = [
    [project.image, project.short, project.imageAlt],
    ...project.gallery.filter(([id]) => id !== project.image),
    ...Object.values(PROJECT_PHOTOS[project.id]).filter(slot => slot.image).map(slot => [slot.image, slot.title, slot.caption]),
  ];
  const dialog = document.createElement('dialog');
  dialog.className = 'ep-gallery-dialog';
  dialog.setAttribute('aria-labelledby', 'ep-dialog-title');
  dialog.innerHTML = `
    <div class="ep-dialog-top">
      <div><span class="ep-meta" data-photo-count aria-live="polite"></span><h2 id="ep-dialog-title"></h2></div>
      <button class="ep-dialog-close" type="button" aria-label="Close image">×</button>
    </div>
    <figure><img alt=""><figcaption></figcaption></figure>
    <div class="ep-dialog-nav">
      <button type="button" data-photo-step="-1">← Previous</button>
      <button type="button" data-photo-step="1">Next →</button>
    </div>`;
  document.body.append(dialog);
  const close = dialog.querySelector('.ep-dialog-close');
  const img = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  const title = dialog.querySelector('h2');
  const count = dialog.querySelector('[data-photo-count]');
  let index = 0;
  let opener;

  function show(i) {
    index = (i + items.length) % items.length;
    const [id, heading, description] = items[index];
    img.src = asset(id);
    img.alt = description;
    title.textContent = heading;
    caption.textContent = description;
    count.textContent = `Image ${index + 1} of ${items.length}`;
  }

  host.addEventListener('click', event => {
    const button = event.target.closest('[data-project-photo]');
    if (!button) return;
    opener = button;
    show(items.findIndex(([id]) => id === button.dataset.projectPhoto));
    dialog.showModal();
    close.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus({preventScroll: true}));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const {left, right, top, bottom} = dialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
  });
  for (const button of dialog.querySelectorAll('[data-photo-step]')) {
    button.addEventListener('click', () => show(index + Number(button.dataset.photoStep)));
  }
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    show(index + (event.key === 'ArrowRight' ? 1 : -1));
  });
}

function mountSectionNavigation(host) {
  const links = [...host.querySelectorAll('[data-section-link]')];
  const sections = links.map(link => host.querySelector(link.hash));
  let frame = 0;

  function markCurrentSection() {
    frame = 0;
    const active = sections.findLast(section => section.getBoundingClientRect().top <= 118) || sections[0];
    for (const link of links) {
      if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  markCurrentSection();
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(markCurrentSection);
  }, {passive: true});
}

function mountFilters(host) {
  const buttons = [...host.querySelectorAll('[data-project-filter]')];
  const cards = [...host.querySelectorAll('[data-category]')];
  const count = host.querySelector('.ep-count');

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const filter = button.dataset.projectFilter;
      for (const control of buttons) control.setAttribute('aria-pressed', String(control === button));
      let visible = 0;
      for (const card of cards) {
        card.hidden = filter !== 'all' && !card.dataset.category.split(' ').includes(filter);
        if (!card.hidden) visible++;
      }
      count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
    });
  }
}

export function mountProjectPortfolio(host) {
  const project = PROJECTS.find(item => item.id === new URLSearchParams(location.search).get('project'));
  document.title = `${project?.short || 'Projects & Experiences'} — Diego Renteria`;
  host.innerHTML = project ? renderCase(project) : renderIndex();
  if (project) {
    mountGallery(host, project);
    mountSectionNavigation(host);
  } else {
    mountFilters(host);
  }

  // Older case study links still land on the corresponding section.
  const id = location.hash.slice(1);
  const legacy = {challenge: 'what', approach: 'how', outcome: 'results'};
  const target = document.getElementById(legacy[id] || id);
  if (target) requestAnimationFrame(() => target.scrollIntoView());
}
