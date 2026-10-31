const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const { DI, MONO, src, logo } = LOGOS;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function yearMonth(date) {
  return `${MONTHS[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`;
}
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GH = document.querySelector('.icon-link[aria-label="GitHub"] svg').outerHTML;
document.querySelectorAll('.contact [data-icon]').forEach(a => a.insertAdjacentHTML('afterbegin', document.querySelector(`.icon-link[aria-label="${a.dataset.icon}"] svg`).outerHTML));
const LINKEDIN = document.querySelector('.icon-link[aria-label="LinkedIn"] svg').outerHTML;
const doneMark = '<svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="currentColor"/><path d="M5 9.2l2.6 2.6L13 6.4" fill="none" style="stroke:var(--card)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// "Julia, Mailmail and Autoscrape" → ['Julia', 'Mailmail', 'Autoscrape'], each with its mark from its own site
const productsOf = x => x.product.split(/, | and /);
const prodMark = (p, cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="images/products/${p.toLowerCase()}-circle.svg" width="26" height="26" alt="">`;
document.querySelectorAll('.prod').forEach(el => el.insertAdjacentHTML('afterbegin', prodMark(el.textContent.trim())));

// ---------- covers: a drawing of what the story is about, in its product's colours ----------
const look = {
  stripe: 'live', abuse: 'fourth', deploy: 'pipeline', data: 'json', formulas: 'formula', signup: 'background', access: 'authenticator',
  llm: 'fallback', mentor: 'team', echelon: 'booth',
  peerprep: 'gateway', sqlancer: 'chart', orbital: 'focus', bizbook: 'table',
};
// every drawing keeps to one 224 × 150 frame (x 210–434, y 36–186) and fills it, so it's as big as the space allows
const ART_STROKE = 'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"';
function person(x, y, r, w, opacity = 1) {
  return `<circle cx="${x}" cy="${y}" r="${r}" ${ART_STROKE} opacity="${opacity}"/><path d="M${x - w} ${y + r + w + 4}a${w} ${w} 0 0 1 ${w * 2} 0" ${ART_STROKE} opacity="${opacity}"/>`;
}
const DRAWINGS = {
  // Stripe billing: a payment card, filling the frame
  live: `<rect x="234" y="46" width="180" height="114" rx="14" ${ART_STROKE}/><rect x="256" y="72" width="32" height="26" rx="5" ${ART_STROKE}/><path d="M256 124h30M298 124h30M340 124h30" ${ART_STROKE}/><path d="M256 140h56" ${ART_STROKE} opacity=".55"/>`,
  // the sign-up guard: three sign-ups go through, the fourth is stopped
  fourth: `${person(236, 82, 11, 18)}${person(288, 82, 11, 18)}${person(340, 82, 11, 18)}${person(400, 82, 11, 18, .55)}<circle cx="400" cy="100" r="32" ${ART_STROKE}/><path d="M377 123l46-46" ${ART_STROKE}/>`,
  // a push builds a container and ships it to the cloud, with an arc over it all: nobody in the loop
  pipeline: `<circle cx="234" cy="114" r="13" ${ART_STROKE}/><path d="M212 114h9M247 114h9M262 114h22M278 108l6 6-6 6" ${ART_STROKE}/><rect x="292" y="92" width="48" height="44" rx="6" ${ART_STROKE}/><path d="M292 106h48" ${ART_STROKE}/><path d="M348 114h16M358 108l6 6-6 6" ${ART_STROKE}/><path d="M416.8 112h-3.28A20.8 20.8 0 1 0 393.4 138h23.4a13 13 0 0 0 0-26z" ${ART_STROKE}/><path d="M234 92C236 52 398 52 400 84M394 78l6 6 6-6" ${ART_STROKE} opacity=".55"/>`,
  // JSON blobs become tables
  json: `<path d="M244 58c-10 0-12 6-12 14v18c0 6-4 10-10 10 6 0 10 4 10 10v18c0 8 2 14 12 14M262 58c10 0 12 6 12 14v18c0 6 4 10 10 10-6 0-10 4-10 10v18c0 8-2 14-12 14" ${ART_STROKE}/><path d="M296 100h26M316 94l6 6-6 6" ${ART_STROKE}/><rect x="336" y="52" width="96" height="96" rx="8" ${ART_STROKE}/><path d="M336 76h96M336 100h96M336 124h96M368 52v96M400 52v96" ${ART_STROKE} opacity=".55"/>`,
  // a formula, with the attributes it reads from linked to it, and the check that keeps those links valid
  formula: `<rect x="222" y="54" width="112" height="60" rx="10" ${ART_STROKE}/><path d="M236 86h6l6 12 10-28h24M294 79h16M294 91h16" ${ART_STROKE}/><path d="M334 76c10 0 10-14 22-14M334 92c10 0 10 20 22 20" ${ART_STROKE} opacity=".55"/><rect x="356" y="50" width="76" height="26" rx="8" ${ART_STROKE}/><rect x="356" y="99" width="76" height="26" rx="8" ${ART_STROKE}/><rect x="356" y="148" width="76" height="26" rx="8" ${ART_STROKE} opacity=".55"/><circle cx="252" cy="152" r="18" ${ART_STROKE}/><path d="M243 152l6 6 12-13" ${ART_STROKE}/>`,
  // the verification email goes straight through, and the demo catalogue loads in a queue behind it
  background: `<rect x="222" y="58" width="94" height="64" rx="8" ${ART_STROKE}/><path d="M222 64l47 33 47-33" ${ART_STROKE}/><path d="M324 90h22M340 84l6 6-6 6" ${ART_STROKE}/><circle cx="380" cy="90" r="24" ${ART_STROKE}/><path d="M369 90l8 8 15-16" ${ART_STROKE}/><path d="M269 128c0 20 26 26 61 26" ${ART_STROKE} opacity=".55"/><rect x="338" y="142" width="24" height="24" rx="5" ${ART_STROKE} opacity=".55"/><rect x="371" y="142" width="24" height="24" rx="5" ${ART_STROKE} opacity=".55"/><rect x="404" y="142" width="24" height="24" rx="5" ${ART_STROKE} opacity=".55"/>`,
  // a shield for the sign-up domain rules, and an authenticator code counting down for the admin sign-in
  authenticator: `<path d="M262 50l40 14v34c0 28-18 46-40 56-22-10-40-28-40-56V64z" ${ART_STROKE}/><path d="M246 100l11 11 22-24" ${ART_STROKE}/><path d="M310 102h36" ${ART_STROKE} opacity=".55"/><rect x="356" y="44" width="66" height="118" rx="12" ${ART_STROKE}/><path d="M381 56h16" ${ART_STROKE} opacity=".55"/><path d="M368 88h10M384 88h10M400 88h10" ${ART_STROKE}/><path d="M368 104h10M384 104h10M400 104h10" ${ART_STROKE} opacity=".55"/><circle cx="389" cy="134" r="11" ${ART_STROKE} opacity=".3"/><path d="M389 123a11 11 0 1 1-11 11" ${ART_STROKE}/>`,
  // a request goes to the chosen model, and falls back to the second when the first fails
  fallback: `<circle cx="230" cy="110" r="10" ${ART_STROKE}/><path d="M240 110h30" ${ART_STROKE}/><path d="M288 92l18 18-18 18-18-18z" ${ART_STROKE}/><path d="M306 110c22 0 20-36 44-36M306 110c22 0 20 36 44 36" ${ART_STROKE}/><rect x="352" y="56" width="80" height="36" rx="8" ${ART_STROKE}/><rect x="352" y="128" width="80" height="36" rx="8" ${ART_STROKE} opacity=".55"/><path d="M392 98v22M386 114l6 6 6-6" ${ART_STROKE} opacity=".55"/>`,
  // one person showing three new ones the ropes
  team: `${person(242, 78, 16, 24)}${person(312, 96, 11, 17, .7)}${person(356, 96, 11, 17, .7)}${person(400, 96, 11, 17, .7)}`,
  // a day at a booth: a pitch, and the demo on a screen beside it
  booth: `<path d="M222 58h52a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10h-30l-16 14v-14h-6a10 10 0 0 1-10-10V68a10 10 0 0 1 10-10z" ${ART_STROKE}/><rect x="300" y="50" width="122" height="78" rx="8" ${ART_STROKE}/><path d="M318 74h50M318 90h72M318 106h36" ${ART_STROKE} opacity=".55"/><path d="M361 128v26M336 154h50" ${ART_STROKE}/>`,
  gateway: `<path d="M300 40v140M300 110h-70M300 70h-70M300 150h-70" ${ART_STROKE} opacity=".55"/><rect x="290" y="40" width="20" height="140" rx="10" ${ART_STROKE}/><path d="M310 110h110" ${ART_STROKE}/><path d="M410 102l10 8-10 8" ${ART_STROKE}/>`,
  chart: `<path d="M220 180h210M220 180V40" ${ART_STROKE} opacity=".55"/><path d="M230 160l40-30 40 18 40-62 40 22 30-40" ${ART_STROKE}/>`,
  focus: `<circle cx="330" cy="110" r="70" ${ART_STROKE} opacity=".3"/><circle cx="330" cy="110" r="45" ${ART_STROKE} opacity=".6"/><circle cx="330" cy="110" r="18" ${ART_STROKE}/>`,
};
function art(kind) {
  return `<svg class="art" viewBox="210 36 224 150" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">${DRAWINGS[kind]}</svg>`;
}
// one product: the cover is filled with it; several: a plain cover with a ribbon of each; a project: its own colour
// (cover, deep title, and a little deeper cover for dark mode)
// Every project colour is one used nowhere else on the site: the pale tints all sit close to a story cover or a widget
// colour, so these are stronger, each at least 16 ΔE from every other colour in the site and 21 from each other.
// FlowFox keeps the orange of its own app and Virtual Vault the green of its wordmark, both made richer; BizBook's
// indigo is the one mid-tone, since the paler blues and violets all belong to Work, Education or the Nested story.
const PROJECT = {
  peerprep: ['#ffc98a', '#5a3500', '#ecb677'], sqlancer: ['#f0b6e0', '#6b1f5c', '#dca3cd'],
  bizbook: ['#7f86d9', '#10144f', '#7378c8'], orbital: ['#9fdfb8', '#0d4a2c', '#8fcfa8'],
  flowfox: ['#ffb39c', '#7a2a0c', '#eda18a'], vault: ['#d6e895', '#3b4a0a', '#c3d684'],
};
// a project whose repo has a mark of its own wears it in place of a drawing; the one-colour marks (FlowFox's fox,
// Virtual Vault's cart, cut from the left of its wordmark) are stencils in the cover's ink. PeerPrep's only mark is its
// name set in IBM Plex Serif, which the cover's title already says, so it keeps its drawing.
const REPO_MARK = { sqlancer: 'sqlancer.webp', bizbook: 'bizbook.webp', orbital: 'distraction-dismantlers.webp', flowfox: 'flowfox.webp', vault: 'virtual-vault.webp' };
const STENCIL = ['flowfox', 'vault'];
const repoMark = id => STENCIL.includes(id)
  ? `<span class="rmark stencil" style="--m:url(../images/projects/${REPO_MARK[id]})" aria-hidden="true"></span>`
  : `<img class="rmark" src="images/projects/${REPO_MARK[id]}" alt="">`;
// which colours a cover wears: a story about the company rather than one of its products wears the work blue with
// Nested's mark, one product wears that product's, several share a plain cover, and a project its own
function coverKind(item) {
  if (item.product === 'Nested') return 'company';
  if (item.group !== 'work') return 'proj';
  const products = productsOf(item);
  return products.length > 1 ? 'multi' : products[0].toLowerCase();
}
function cover(x, kicker) {
  const cls = coverKind(x);
  let ribbon = '', marks = '', style = '';
  if (cls === 'company') marks = '<img class="pm" src="images/orgs/nested.svg" width="26" height="26" alt="">';
  else if (cls === 'proj') { const [pc, pi, pd] = PROJECT[x.id]; style = ` style="--pc:${pc};--pi:${pi};--pd:${pd}"`; }
  else {
    const ps = productsOf(x);
    marks = ps.map(p => prodMark(p, 'pm')).join('');
    if (cls === 'multi') ribbon = `<span class="ribbon" aria-hidden="true">${ps.map(p => `<i style="--b:var(--${p.toLowerCase()})"></i>`).join('')}</span>`;
  }
  return `<div class="cover ${cls}"${style}>${ribbon}${REPO_MARK[x.id] ? repoMark(x.id) : art(look[x.id])}${marks || kicker ? `<p class="kicker">${marks}${esc(kicker)}</p>` : ''}<h3>${esc(x.title)}</h3></div>`;
}

const stories = ME.experience.case_studies.map(x => ({ ...x, kicker: x.product, group: 'work' }));
const projects = ME.projects.map(x => ({ ...x, kicker: x.product, group: 'proj' }));
const all = [...stories, ...projects];

// the Stripe story always leads; it takes the big widget, with the guard beside it so
// there's something to try straight away. The rest open with "Show all stories".
const ORDER = ['stripe', 'abuse', 'deploy', 'data', 'formulas', 'signup', 'access', 'llm', 'mentor', 'echelon'];
const pick = stories.find(x => x.id === 'stripe');
// Most stories are Julia's, so in plain order its cream covers would sit side by side. On a wide screen the rest lay out
// as two wide stories under the big story and the guard, then small ones four to a row, two under each wide one.
// Every arrangement of cover colours is tried and the one with the fewest matching covers wins: one side by side counts
// ten, one under another counts one. Swapping two covers of the same colour changes nothing, so stories of one colour
// keep their order and only the first of each colour is tried at each place (nine stories in four colours, so a few
// hundred arrangements rather than 9!). Ties keep the order of how much they show.
function stagger(xs) {
  let best = xs, bestScore = Infinity;
  function above(placed, index) {
    if (index === 0) return coverKind(pick);
    if (index === 1) return 'mailmail';
    if (index < 4) return coverKind(placed[0]);
    if (index < 6) return coverKind(placed[1]);
    return coverKind(placed[index - 4]);
  }
  const beside = i => i === 1 || (i > 2 && (i - 2) % 4) ? i - 1 : -1;
  (function place(o, left, score) {
    if (score >= bestScore) return;
    if (!left.length) { best = o; bestScore = score; return; }
    left.forEach((x, j) => {
      const i = o.length, k = coverKind(x), b = beside(i);
      if (left.findIndex(y => coverKind(y) === k) < j) return;
      const cost = (b >= 0 && coverKind(o[b]) === k ? 10 : 0) + (above(o, i) === k ? 1 : 0);
      place([...o, x], left.filter((_, n) => n !== j), score + cost);
    });
  })([], xs, 0);
  return best;
}
const rest = stagger(stories.filter(x => x !== pick).sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)));
const card = (x, cls) => `<button class="story press${cls}" type="button" data-id="${x.id}" aria-label="Read story: ${esc(x.title)}">
    ${cover(x, cls.includes('feat') ? 'Featured story' : '')}
    <span class="foot">${cls.includes('feat') ? `<span class="sum">${esc(x.summary)}</span>` : ''}<span class="outcome">${doneMark}${esc(x.outcome)}</span></span></button>`;
// open: the big story and the guard side by side, both two rows tall;
// behind the button: two wide stories, then the rest as small ones, four to a row
const storyGrid = document.getElementById('storyList');
storyGrid.innerHTML = card(pick, ' feat') + '<section class="toy s2" data-toy="guard" data-lines="3" aria-labelledby="guard-h"></section>'
  + rest.slice(0, 2).map(x => card(x, ' s2 more')).join('') + rest.slice(2).map(x => card(x, ' more')).join('');
const moreBtn = document.getElementById('moreStories');
moreBtn.querySelector('span').textContent = `Show all ${stories.length} stories`;
moreBtn.addEventListener('click', () => {
  const open = !storyGrid.classList.contains('open');
  storyGrid.classList.toggle('open', open);
  moreBtn.setAttribute('aria-expanded', open);
  moreBtn.querySelector('span').textContent = open ? 'Show fewer stories' : `Show all ${stories.length} stories`;
  levelCovers();
  // the newly shown covers draw themselves in as they arrive
  if (open) storyGrid.querySelector('.more')?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'nearest' });
});
// the toy draws its meter, state, log and buttons; here the meter moves onto a Mailmail cover with the title,
// and the rest goes in the widget's foot
// a cover is as tall as its title needs, so a three-line title would make one cover in a row taller than the rest;
// every cover in a row takes the tallest one's height, so the line between cover and text stays level
function levelCovers() {
  const covers = [...storyGrid.querySelectorAll('.story:not(.feat) .cover')];
  covers.forEach(c => { c.style.minHeight = ''; });
  const rows = new Map();
  covers.filter(c => c.offsetParent).forEach(c => {
    const top = c.closest('.story').offsetTop;
    if (!rows.has(top)) rows.set(top, []);
    rows.get(top).push(c);
  });
  // Measure every row before writing heights to avoid repeated layout recalculation.
  const heights = [...rows.values()].map(covers => ({
    covers,
    height: Math.max(...covers.map(cover => cover.offsetHeight)),
  }));
  heights.forEach(({ covers, height }) => {
    covers.forEach(cover => { cover.style.minHeight = `${height}px`; });
  });
}
addEventListener('resize', levelCovers);
document.fonts.ready.then(levelCovers);
levelCovers();
const guardRun = document.querySelector('[data-toy="guard"]');
TOYS.guard(guardRun);
const [guardMeter, ...guardRest] = guardRun.children;
guardRun.insertAdjacentHTML('afterbegin', `<div class="cover mailmail"><p class="kicker">${prodMark('Mailmail', 'pm')}</p>
  <h3 id="guard-h">The sign-up guard</h3>
  <p class="lede">The Redis rule that stopped phishing sign-ups on Mailmail, copied to run on this page only. Press Sign up more than three times.</p></div><div class="foot"></div>`);
guardRun.querySelector('.cover').prepend(guardMeter);
guardRun.querySelector('.foot').append(...guardRest);
guardRun.querySelector('.toy-go').classList.add('btn');
guardRun.querySelector('.toy-reset').classList.add('btn', 'soft');
guardRun.querySelector('.toy-actions').insertAdjacentHTML('beforeend', '<button class="link" type="button" data-id="abuse">Read the story</button>');

// ---------- chapter widgets ----------
// the shelf runs oldest to newest along one line, each project with its dates on it; its code is linked from the full story.
// Projects from the same semester share one dot and one date, with a solid bar running across all of them
// ("span" starts or carries the bar on to the next card, "cont" is a card the bar arrived from)
const shelfEl = document.getElementById('shelf'), shelfNav = document.getElementById('shelfNav'), [prevProj, nextProj] = shelfNav.querySelectorAll('button');
const term = x => x.product.split(', ').pop();
shelfEl.innerHTML = [...projects].reverse().map((x, i, xs) => `
  <div class="proj-item"><p class="tick${xs[i - 1] && term(xs[i - 1]) === term(x) ? ' cont' : ''}${xs[i + 1] && term(xs[i + 1]) === term(x) ? ' span' : ''}"><span class="when">${esc(term(x))}</span></p>
  <button class="story press" type="button" data-id="${x.id}" aria-label="Read about ${esc(x.title)}">${cover(x, '')}<span class="foot"><span class="sum">${esc(x.summary)}</span></span></button></div>`).join('');
function shelfEdges() {
  const max = shelfEl.scrollWidth - shelfEl.clientWidth;
  shelfNav.hidden = max <= 4;
  prevProj.disabled = shelfEl.scrollLeft <= 4;
  nextProj.disabled = shelfEl.scrollLeft >= max - 4;
}
shelfNav.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  // move by all the cards in view but one, so the last one seen stays on screen
  const card = shelfEl.querySelector('.proj-item').offsetWidth + 14, step = card * Math.max(1, Math.floor(shelfEl.clientWidth / card) - 1);
  shelfEl.scrollBy({ left: b.dataset.dir * step, behavior: still ? 'auto' : 'smooth' });
});
shelfEl.addEventListener('scroll', shelfEdges, { passive: true });
// a mouse can drag the shelf sideways, the way a finger swipes it; letting go after a drag doesn't open the card underneath
let drag = null, dragged = false;
shelfEl.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button === 0) drag = { x: e.clientX, left: shelfEl.scrollLeft, moved: false };
});
addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) < 6) return;
  drag.moved = true;
  shelfEl.classList.add('dragging');
  shelfEl.scrollLeft = drag.left - dx;
});
addEventListener('pointerup', () => {
  if (!drag) return;
  if (drag.moved) { dragged = true; setTimeout(() => { dragged = false; }); shelfEl.classList.remove('dragging'); }
  drag = null;
});
shelfEl.addEventListener('click', e => { if (dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
shelfEl.addEventListener('dragstart', e => e.preventDefault());
addEventListener('resize', shelfEdges);
// the line runs oldest to newest, so it opens at the newest end
shelfEl.scrollLeft = shelfEl.scrollWidth;
shelfEdges();
document.getElementById('edu').innerHTML = ME.education.map(e => `
  <li><img class="crest" src="${esc(e.logo)}" data-dark="${esc(e.logo.replace(/(\.[^.]+)$/, '-dark$1'))}" alt="">
  <span class="when"><time datetime="${e.from}">${yearMonth(e.from)}</time> – <time datetime="${e.to}">${yearMonth(e.to)}</time></span>
  <b>${esc(e.school)}${e.programme ? `, ${esc(e.programme)}` : ''}</b><span class="what">${esc(e.award)}</span>
  ${e.merit ? `<span class="merit">Focus areas with Merit: ${e.merit.map(esc).join(' and ')}</span>` : ''}</li>`).join('');

// ---------- skills: app icons in folders by platform or kind; anything not listed lands in "More" ----------
const GROUPS = {
  'Languages': [['', '', ['Python', 'SQL', 'TypeScript', 'JavaScript', 'Java', 'R']]],
  'Backend & Data': [['Frameworks & Services', '', ['Django', 'FastAPI', 'Celery', 'Stripe', 'ASP.NET Core']], ['Databases', '', ['PostgreSQL', 'Redis', 'SQL Server', 'Firebase']]],
  'DevOps': [['AWS', 'images/aws/aws-cloud.svg', ['AWS ECS', 'EC2', 'S3', 'CloudFront', 'Route 53', 'Parameter Store']], ['Google Cloud', `${DI}googlecloud-original.svg`, ['Cloud Run', 'Pub/Sub']], ['Containers & CI', '', ['Docker', 'GitHub Actions']]],
  'Frontend & Apps': [['Frameworks', '', ['React', 'React Native', 'Material UI']], ['Testing & Design', '', ['Vitest', 'JUnit', 'Figma']]],
  'Data Science & Automation': [['Machine Learning', '', ['PyTorch', 'TensorFlow']], ['Analytics & Automation', '', ['Tableau', 'UiPath']]],
};
function groupsOf(section, items) {
  const gs = (GROUPS[section] || []).map(([l, m, ns]) => [l, m, ns.filter(s => items.includes(s))]).filter(g => g[2].length);
  const left = items.filter(s => !gs.some(g => g[2].includes(s)));
  return left.length ? [...gs, ['More', '', left]] : gs;
}
// AWS services, Stripe and React Native already come as app squares, so they fill the icon
function appIcon(skill) {
  const image = src(skill);
  if (image) {
    let className = '';
    if (/^images\/aws\/|stripe\.svg$|react-native\.(?:png|webp)$/.test(image)) className = 'fill';
    else if (skill === 'Django') className = 'ink';
    return `<img${className ? ` class="${className}"` : ''} src="${image}" alt="" loading="lazy">`;
  }
  const [text, background, foreground] = MONO[skill] || [skill.slice(0, 2), '#101418', '#fff'];
  return `<span class="mono" style="--b:${background};--f:${foreground}">${esc(text)}</span>`;
}
// Index each story once per skill, preserving the story/project order.
const skillUsage = new Map();
all.forEach(item => {
  const skills = new Set(item.stack.map(skill => LOGOS.SAME[skill] || skill));
  skills.forEach(skill => {
    if (!skillUsage.has(skill)) skillUsage.set(skill, []);
    skillUsage.get(skill).push(item);
  });
});
function usedAt(skill) {
  return skillUsage.get(skill) || [];
}
const appTile = s => {
  const n = usedAt(s).length, inner = `<span class="icon" aria-hidden="true">${appIcon(s)}</span><span class="name">${esc(s)}</span>`;
  return n ? `<li><button class="app" type="button" data-skill="${esc(s)}" aria-pressed="false" aria-controls="used">${inner}<b class="n" aria-hidden="true">${n}</b><span class="sr">, used in ${n === 1 ? 'one place' : `${n} places`}</span></button></li>`
    : `<li class="app">${inner}</li>`;
};
const skEl = document.getElementById('sk');
skEl.innerHTML = Object.entries(ME.skills).map(([g, v]) =>
  `<div class="sk-group"><h3>${esc(g)}</h3><div class="folders">${groupsOf(g, v.items).map(([label, mark, names]) =>
  `<div class="folder">${label ? `<p class="folder-h">${mark ? `<img src="${mark}" alt="">` : ''}${esc(label)}</p>` : ''}<ul class="apps">${names.map(appTile).join('')}</ul></div>`).join('')}</div></div>`).join('');
// the places that used it open straight under the pressed skill's folder, stories first, each opening its story.
// Folders wrap, so the panel goes after the last folder on that folder's row and never splits a row.
// Pressing the skill again closes them.
const usedBox = document.createElement('div');
usedBox.className = 'used'; usedBox.id = 'used'; usedBox.hidden = true;
usedBox.innerHTML = '<p class="used-line" aria-live="polite"></p><ul class="used-list"></ul>';
let usedFolder = null;
function placeUsed() {
  usedBox.remove();
  const row = [...usedFolder.parentElement.children].filter(f => f.offsetTop === usedFolder.offsetTop);
  row[row.length - 1].after(usedBox);
}
addEventListener('resize', () => { if (!usedBox.hidden) placeUsed(); });
skEl.addEventListener('click', e => {
  const b = e.target.closest('[data-skill]'); if (!b) return;
  const on = b.getAttribute('aria-pressed') !== 'true';
  skEl.querySelectorAll('[data-skill]').forEach(x => x.setAttribute('aria-pressed', String(on && x === b)));
  usedBox.hidden = !on;
  if (!on) return;
  const s = b.dataset.skill, at = usedAt(s);
  usedBox.querySelector('.used-line').textContent = `Used in ${at.length === 1 ? '1 place' : `${at.length} places`}`;
  usedBox.querySelector('.used-list').innerHTML = at.map(x => `<li><button class="press" type="button" data-id="${x.id}">${esc(x.title)}
    <small>${x.group === 'work' ? `Story from Nested${x.product === 'Nested' ? '' : `, ${esc(x.product)}`}` : esc(x.product)}</small></button></li>`).join('');
  usedFolder = b.closest('.folder');
  placeUsed();
});

// ---------- covers draw themselves in the first time a widget comes into view ----------
function prep(svg) {
  if (still) return;
  [...svg.children].forEach((el, i) => el.style.setProperty('--i', i));
  svg.classList.add('pre');
}
const seen = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('draw'); seen.unobserve(e.target); }
}), { threshold: .35 });
document.querySelectorAll('.story svg.art').forEach(svg => { prep(svg); if (!still) seen.observe(svg); });

// ---------- story view: the widget's cover grows into the page ----------
const reader = document.getElementById('reader');
// an event in GoatCounter; it isn't there while its script loads or when a blocker stops it, and then nothing is counted
const track = (path, title) => window.goatcounter?.count?.({ path, title, event: true });
const chip = s =>`<li>${logo(s)}${esc(s)}</li>`;
let fromEl = null;
// previous and next follow the page: stories as today's stack lays them out, projects along the shelf, oldest first;
// the first has no previous and the last no next, so neither loops
const order = { work: [pick, ...rest], proj: [...projects].reverse() };
const chev = d => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
function fill(x) {
  const list = order[x.group], i = list.indexOf(x), prev = list[i - 1], next = list[i + 1];
  const noun = x.group === 'work' ? 'story' : 'project';
  track(`${noun}/${x.id}`, x.title);
  reader.innerHTML = `
    <button class="close" type="button" aria-label="Close story"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
    ${cover(x, x.kicker).replace('<h3>', '<h3 id="r-title">')}
    <div class="body">
      ${x.module ? `<p class="r-mod">${esc(x.module)}</p>` : ''}<p class="lead">${esc(x.summary)}</p>
      <h4>The problem</h4><p>${esc(x.problem)}</p>
      <h4>What I did</h4><ul>${x.did.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
      <h4>Result</h4><p class="result">${esc(x.result)}</p>
      ${x.link || x.group === 'proj' ? `<div class="actions">
        ${x.link ? `<a class="btn soft" href="${esc(x.link.url)}" target="_blank" rel="noopener">${LINKEDIN}${esc(x.link.label)}</a>` : ''}
        ${x.group === 'proj' ? `<a class="btn soft" href="${esc(x.repo || '#')}" ${x.repo ? 'target="_blank" rel="noopener"' : 'data-cv'}>${GH}View the code on GitHub</a>` : ''}</div>` : ''}
      <h4>Tools and skills</h4><ul class="chips">${x.stack.map(chip).join('')}</ul>
      <nav class="pn" aria-label="Other ${noun === 'story' ? 'stories' : 'projects'}">
        ${prev ? `<button class="prev" type="button" data-go="${prev.id}"><span>${chev('M10 3 5 8l5 5')}Previous ${noun}</span><b>${esc(prev.title)}</b></button>` : ''}
        ${next ? `<button class="next" type="button" data-go="${next.id}"><span>Next ${noun}${chev('M6 3l5 5-5 5')}</span><b>${esc(next.title)}</b></button>` : ''}
      </nav>
    </div>`;
  const ra = reader.querySelector('svg.art'); if (ra) { prep(ra); if (!still) ra.classList.add('draw'); }
  reader.querySelector('.close').addEventListener('click', closeStory);
  reader.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
    const y = list.find(z => z.id === b.dataset.go);
    fill(y); reader.scrollTop = 0; reader.querySelector('.close').focus();
    fromEl = document.querySelector(`.story[data-id="${y.id}"]`) || document.querySelector(`[data-id="${y.id}"]`);
  }));
}
function transition(update) {
  if (!document.startViewTransition || still) { update(); return Promise.resolve(); }
  return document.startViewTransition(update).finished;
}
// a widget with a cover morphs into the story; a text link just opens it
function openStory(el) {
  const x = all.find(y => y.id === el.dataset.id); if (!x) return;
  if (el.closest('.n-grid:not(.open) .more')) return;
  fromEl = el;
  const c = el.querySelector('.cover');
  if (c) c.style.viewTransitionName = 'story-cover';
  transition(() => {
    if (c) c.style.viewTransitionName = '';
    fill(x); reader.showModal(); reader.scrollTop = 0;
    if (c) reader.querySelector('.cover').style.viewTransitionName = 'story-cover';
  }).finally(() => { const rc = reader.querySelector('.cover'); if (rc) rc.style.viewTransitionName = ''; reader.querySelector('.close').focus(); });
}
function closeStory() {
  const rc = reader.querySelector('.cover'), c = fromEl && fromEl.querySelector('.cover');
  const morph = c && reader.scrollTop < 200;
  if (morph) rc.style.viewTransitionName = 'story-cover';
  transition(() => {
    if (rc) rc.style.viewTransitionName = '';
    reader.close();
    if (morph) c.style.viewTransitionName = 'story-cover';
  }).finally(() => { if (c) c.style.viewTransitionName = ''; fromEl?.focus(); });
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-id]'); if (el && !reader.contains(el)) openStory(el);
  const a = e.target.closest('[data-cv]'); if (a && a.getAttribute('href') === '#') e.preventDefault();
  // the CV, which opens in a new tab, and links that leave the site
  const out = e.target.closest('a[href]');
  if (out && out.host === location.host && out.pathname.endsWith('.pdf')) track(`view${out.pathname}`, out.textContent.trim());
  else if (out && out.host !== location.host) track(`link/${out.href}`, out.textContent.trim());
});
reader.addEventListener('cancel', e => { e.preventDefault(); closeStory(); });
reader.addEventListener('click', e => { if (e.target === reader) closeStory(); });

// ---------- top bar: the selected section follows the one in view ----------
const tabs = [...document.querySelectorAll('.tabs a')];
const marks = ['stories', 'projects', 'education', 'skills'].map(id => document.getElementById(id));
const bar = document.querySelector('.topbar');
// a tab the visitor picks stays selected until they scroll the page themselves
let chosen = null;
function current() {
  let id = chosen;
  if (!id) {
    // a section is in view once its top passes a line just under the top bar; the line is fixed, not a share of the
    // window, so a tall screen doesn't reach ahead to the next section.
    // Projects and Education sit side by side; when two sections start level, the first one is the one in view
    const under = bar.getBoundingClientRect().bottom, line = under + 120;
    let at = -Infinity;
    marks.forEach(m => { const t = m.getBoundingClientRect().top; if (t < line && t > at + 1) { id = m.id; at = t; } });
    // the last section can be too short to reach the line, so at the bottom of the page it takes over, unless the
    // section above it still starts in view (on a very tall screen the bottom comes before the later sections reach the top)
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2 && !(id && at >= under - 1)) id = marks[marks.length - 1].id;
  }
  tabs.forEach(t => t.setAttribute('aria-current', t.dataset.tab === id));
}
tabs.forEach(t => t.addEventListener('click', () => { chosen = t.dataset.tab; current(); }));
['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(type => addEventListener(type, () => { chosen = null; }, { passive: true }));
addEventListener('scroll', current, { passive: true });
current();

// ---------- light and dark: follows the system until the toggle picks one, and remembers the pick ----------
const themeBtn = document.getElementById('theme'), sysDark = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => (document.documentElement.dataset.theme || (sysDark.matches ? 'dark' : 'light')) === 'dark';
function showTheme() {
  const d = isDark();
  // logos with a reverse version swap to it in dark mode
  document.querySelectorAll('img[data-dark]').forEach(i => {
    i.dataset.light ??= i.getAttribute('src');
    i.setAttribute('src', d ? i.dataset.dark : i.dataset.light);
  });
  themeBtn.classList.toggle('is-dark', d);
  themeBtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
}
themeBtn.addEventListener('click', () => {
  const t = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('theme', t); } catch (e) {}
  showTheme();
});
sysDark.addEventListener('change', showTheme);
showTheme();
