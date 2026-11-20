// app.js — one job: wire the guide together (load data, render the checklist,
// filters, spoiler setting, search, progress). State lives in tracker.js,
// the roadmap in roadmap.js; this file only connects them to the page.
import { loadEarned, saveEarned, exportEarned, importEarned } from './tracker.js';
import { renderRoadmap } from './roadmap.js';

const KIND_FILTERS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectible', 'Collectibles'],
  ['activity', 'Activities'],
  ['robbery', 'Robberies'],
  ['exploration', 'Exploration'],
  ['money', 'Money'],
  ['side', 'Side & misc'],
  ['online', 'Online'],
];

const params = new URLSearchParams(location.search);
const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilersEl = document.getElementById('spoilers');
const earnedOnlyEl = document.getElementById('earnedOnly');
const countLine = document.getElementById('countLine');
const emptyNote = document.getElementById('emptyNote');

let earned = loadEarned();
let trophies = [];
let kind = params.get('filter') || 'all';
let openId = params.get('open') ? Number(params.get('open')) : null;

if (params.get('spoilers') === 'off') spoilersEl.checked = false;
if (params.get('spoilers') === 'on') spoilersEl.checked = true;

function isStorySpoiler(t) {
  return t.kind === 'story' && t.hidden;
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind === 'online') return false; // No online trophies exist: all 55 are single-player.
    if (kind === 'missable' && !t.missable) return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (earnedOnlyEl.checked && !earned.has(t.name)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  document.getElementById('progressText').textContent = `${earned.size} / ${trophies.length} earned`;
  document.getElementById('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned.has(t.name)) byGrade[t.grade][0] += 1;
  }
  document.getElementById('gradeCounts').textContent =
    ['platinum', 'gold', 'silver', 'bronze']
      .map((g) => `${byGrade[g][0]}/${byGrade[g][1]} ${g}`)
      .join(' · ');
}

function renderCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.name) ? ' earned' : '');
  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveEarned(earned);
    renderAll();
  });
  const titleBox = document.createElement('div');
  const name = document.createElement('p');
  name.className = 'tname';
  const desc = document.createElement('p');
  desc.className = 'tdesc';
  const masked = spoilersEl.checked && isStorySpoiler(t) && !earned.has(t.name);
  if (masked) {
    name.textContent = '🔒 Hidden story trophy — earn it to reveal';
    desc.textContent = 'Spoiler hidden by your setting. Tick the box when you earn it in-game.';
    desc.classList.add('spoiler-mask');
  } else {
    name.textContent = t.name;
    desc.textContent = t.description;
  }
  titleBox.append(name, desc);
  head.append(box, titleBox);
  card.append(head);

  const tags = document.createElement('div');
  tags.className = 'tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag ${t.grade}`;
  gradeTag.textContent = t.grade;
  tags.append(gradeTag);
  const kindTag = document.createElement('span');
  kindTag.className = `tag kind-${t.kind}`;
  kindTag.textContent = t.kind;
  tags.append(kindTag);
  if (t.target) {
    const targetTag = document.createElement('span');
    targetTag.className = 'tag';
    targetTag.textContent = t.target;
    tags.append(targetTag);
  }
  if (t.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-tag';
    hiddenTag.textContent = 'hidden on PSN';
    tags.append(hiddenTag);
  }
  if (t.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'missable';
    missTag.textContent = 'MISSABLE';
    tags.append(missTag);
  }
  card.append(tags);

  const details = document.createElement('details');
  if (openId === t.id) details.open = true;
  const summary = document.createElement('summary');
  summary.className = 'guide-toggle';
  summary.textContent = masked ? 'Guide hidden — spoiler setting is on' : 'Guide + sources';
  details.append(summary);
  if (!masked) {
    const guide = document.createElement('div');
    guide.className = 'guide';
    const p = document.createElement('p');
    p.textContent = t.guide;
    guide.append(p);
    const srcTitle = document.createElement('p');
    const srcStrong = document.createElement('strong');
    srcStrong.textContent = 'Sources:';
    srcTitle.append(srcStrong);
    guide.append(srcTitle);
    const ul = document.createElement('ul');
    ul.className = 'sources';
    for (const s of t.sources || []) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = `${s.name} — ${s.url}`;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
      ul.append(li);
    }
    guide.append(ul);
    details.append(guide);
  }
  card.append(details);
  return card;
}

function renderAll() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(renderCard));
  countLine.textContent =
    kind === 'online'
      ? 'Online: 0 trophies — every one of the 55 is single-player (PowerPyx, GameMapa).'
      : `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned`;
  emptyNote.hidden = shown.length > 0;
  if (kind === 'online') emptyNote.hidden = false;
  renderProgress();
  renderRoadmap(document.getElementById('roadmapStages'), trophies, earned);
}

function buildKindFilters() {
  const host = document.getElementById('kindFilters');
  for (const [value, label] of KIND_FILTERS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = label;
    b.setAttribute('aria-pressed', String(kind === value));
    b.addEventListener('click', () => {
      kind = value;
      for (const c of host.children) c.setAttribute('aria-pressed', String(c === b));
      renderAll();
    });
    host.append(b);
  }
}

document.getElementById('export').addEventListener('click', () => exportEarned(earned));
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const result = await importEarned(file, trophies.map((t) => t.name));
    earned = result.earned;
    saveEarned(earned);
    document.getElementById('savedNote').textContent =
      `Imported ${result.accepted} trophies${result.rejected ? ` (${result.rejected} names not in the list were skipped)` : ''}.`;
    renderAll();
  } catch {
    document.getElementById('savedNote').textContent = 'That file is not a progress export — nothing was changed.';
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks? You can export first as a backup.')) return;
  earned = new Set();
  saveEarned(earned);
  renderAll();
});
searchEl.addEventListener('input', renderAll);
gradeEl.addEventListener('change', renderAll);
spoilersEl.addEventListener('change', renderAll);
earnedOnlyEl.addEventListener('change', renderAll);

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
if (params.get('earned')) {
  for (const id of params.get('earned').split(',')) {
    const t = trophies.find((x) => x.id === Number(id));
    if (t) earned.add(t.name);
  }
  saveEarned(earned);
}
buildKindFilters();
renderAll();
