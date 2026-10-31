const REPO_TREE = 'https://github.com/GiuseppePentrelli/components/tree/main/';
const ALL = 'Tutti';

// Il tratto sotto il titolo del dettaglio: una riga dritta o uno scarabocchio a penna.
const MARKS = {
  line: 'M2 7H238',
  scribble: 'M3 9C30 3 52 12 80 7S130 3 160 8 210 11 237 5',
};

// I colori della vetrina, per i componenti che non dichiarano un tema proprio.
const DEFAULT_THEME = {
  background: 'var(--space-blue)',
  title: 'var(--space-white)',
  text: 'var(--space-white)',
  muted: 'var(--muted)',
  accent: 'var(--space-yellow)',
  titleFont: '"Anta", sans-serif',
  bodyFont: 'inherit',
  mark: 'line',
};

const components = window.COMPONENTS ?? [];
const grid = document.getElementById('grid');
const filters = document.getElementById('filters');
const template = document.getElementById('tile-template');
const detail = document.getElementById('detail');
const detailStage = detail.querySelector('.detail__stage');
const loadedFonts = new Set();
let detailSnippet = '';
let openedFromGrid = false;

function absoluteUrl(path) {
  return new URL(path, location.href).href;
}

function componentId(component) {
  return component.path.split('/').filter(Boolean).pop();
}

function iframeSnippet(component) {
  return `<iframe src="${absoluteUrl(component.path)}"\n        title="${component.name}" loading="lazy" style="border:0; width:100%; height:${component.height}px"></iframe>`;
}

// Il componente si disegna alla sua altezza piena; l'anteprima la riduce in scala con il CSS.
function setFrameHeight(frame, height) {
  frame.parentElement.style.setProperty('--frame-height', `${height}px`);
}

async function copySnippet(button, snippet, onFail) {
  button.dataset.label ??= button.textContent;
  try {
    await navigator.clipboard.writeText(snippet);
    button.textContent = 'Copiato';
  } catch {
    onFail?.();
    button.textContent = onFail ? 'Copialo qui sotto' : 'Copia non riuscita';
  }
  setTimeout(() => { button.textContent = button.dataset.label; }, 2000);
}

function renderTile(component) {
  const tile = template.content.firstElementChild.cloneNode(true);
  tile.dataset.category = component.category;

  const frame = tile.querySelector('iframe');
  frame.src = component.path;
  frame.title = component.name;
  setFrameHeight(frame, component.height);

  tile.querySelector('.name').textContent = component.name;
  tile.querySelector('.category').textContent = component.category;
  tile.querySelector('.description').textContent = component.description;
  tile.querySelector('.code').href = REPO_TREE + component.path;

  const open = tile.querySelector('.open');
  open.href = `#${componentId(component)}`;
  open.addEventListener('click', () => { openedFromGrid = true; });

  const snippet = iframeSnippet(component);
  tile.querySelector('.snippet code').textContent = snippet;
  tile.querySelector('.copy').addEventListener('click', (event) => {
    copySnippet(event.currentTarget, snippet, () => { tile.querySelector('.snippet').open = true; });
  });

  return tile;
}

function renderFilters() {
  const categories = [...new Set(components.map((c) => c.category))];
  if (categories.length < 2) return;

  filters.hidden = false;
  for (const category of [ALL, ...categories]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter';
    button.textContent = category;
    button.setAttribute('aria-pressed', String(category === ALL));
    button.addEventListener('click', () => {
      for (const other of filters.children) other.setAttribute('aria-pressed', String(other === button));
      for (const tile of grid.children) tile.hidden = category !== ALL && tile.dataset.category !== category;
    });
    filters.append(button);
  }
}

// Carica una volta sola i font del tema: un foglio di stile (Google Fonts) o file locali.
function loadThemeFonts(theme) {
  if (theme.stylesheet && !loadedFonts.has(theme.stylesheet)) {
    loadedFonts.add(theme.stylesheet);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = theme.stylesheet;
    document.head.append(link);
  }
  for (const font of theme.fonts ?? []) {
    if (loadedFonts.has(font.src)) continue;
    loadedFonts.add(font.src);
    const face = new FontFace(font.family, `url("${font.src}")`, { weight: font.weight ?? 'normal', display: 'swap' });
    document.fonts.add(face);
    face.load().catch(() => {});
  }
}

function applyTheme(theme) {
  const vars = {
    '--d-bg': theme.background,
    '--d-title': theme.title,
    '--d-text': theme.text,
    '--d-muted': theme.muted,
    '--d-accent': theme.accent,
    '--d-title-font': theme.titleFont,
    '--d-title-style': theme.titleStyle ?? 'normal',
    '--d-body-font': theme.bodyFont,
  };
  for (const [name, value] of Object.entries(vars)) detail.style.setProperty(name, value);
  detail.dataset.mark = theme.mark;
  detail.querySelector('.detail__mark path').setAttribute('d', MARKS[theme.mark] ?? MARKS.line);
}

// Ogni pezzo di testo entra dopo il precedente: --i è il suo posto nella sequenza.
function revealed(element, index) {
  element.classList.add('reveal');
  element.style.setProperty('--i', index);
  return element;
}

function fillDetail(component) {
  const theme = { ...DEFAULT_THEME, ...component.theme };
  loadThemeFonts(theme);
  applyTheme(theme);

  detail.querySelector('.detail__kicker').textContent = component.category;
  detail.querySelector('.detail__title').textContent = component.name;

  const paragraphs = component.details ?? [component.description];
  let index = 3;
  detail.querySelector('.detail__body').replaceChildren(
    ...paragraphs.map((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return revealed(paragraph, index++);
    }),
  );
  detail.querySelector('.detail__features').replaceChildren(
    ...(component.features ?? []).map((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      return revealed(item, index++);
    }),
  );
  revealed(detail.querySelector('.detail__actions'), index);

  detail.querySelector('.detail__page').href = component.path;
  detail.querySelector('.detail__code').href = REPO_TREE + component.path;
  detailSnippet = iframeSnippet(component);

  // Un iframe nuovo a ogni apertura: cambiare il src di uno esistente aggiungerebbe una voce alla
  // cronologia, e il tasto indietro tornerebbe indietro dentro l'iframe invece di chiudere il dettaglio.
  const frame = document.createElement('iframe');
  frame.className = 'detail__frame';
  frame.title = component.name;
  frame.src = `${component.path}?trasparente`;
  detailStage.replaceChildren(frame);
  setFrameHeight(frame, component.height);
}

function showDetail(id) {
  const component = components.find((c) => componentId(c) === id);
  if (!component) {
    hideDetail();
    return;
  }
  detail.classList.remove('is-in');
  fillDetail(component);
  if (!detail.open) detail.showModal();
  detail.scrollTop = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => detail.classList.add('is-in')));
}

function hideDetail() {
  openedFromGrid = false;
  if (!detail.open) return;
  detail.classList.remove('is-in');
  detail.close();
  detailStage.replaceChildren();
}

function route() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) showDetail(id);
  else hideDetail();
}

// Chiudere il dettaglio è come tornare indietro, se ci si è arrivati dalla griglia.
function leaveDetail() {
  if (openedFromGrid) {
    history.back();
    return;
  }
  history.replaceState(null, '', location.pathname + location.search);
  hideDetail();
}

detail.querySelector('.detail__close').addEventListener('click', leaveDetail);
detail.querySelector('.detail__copy').addEventListener('click', (event) => copySnippet(event.currentTarget, detailSnippet));
detail.addEventListener('cancel', (event) => {
  event.preventDefault();
  leaveDetail();
});

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'component:height') return;
  for (const frame of document.querySelectorAll('iframe')) {
    if (frame.contentWindow === event.source) setFrameHeight(frame, event.data.height);
  }
});

window.addEventListener('hashchange', route);

document.getElementById('count').textContent =
  components.length === 1 ? '1 componente' : `${components.length} componenti`;
renderFilters();
grid.append(...components.map(renderTile));
route();
