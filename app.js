const REPO_TREE = 'https://github.com/GiuseppePentrelli/components/tree/main/';
const ALL = 'Tutti';

const components = window.COMPONENTS ?? [];
const grid = document.getElementById('grid');
const filters = document.getElementById('filters');
const template = document.getElementById('tile-template');

function absoluteUrl(path) {
  return new URL(path, location.href).href;
}

function iframeSnippet(component) {
  return `<iframe src="${absoluteUrl(component.path)}"\n        title="${component.name}" loading="lazy" style="border:0; width:100%; height:${component.height}px"></iframe>`;
}

function renderTile(component) {
  const tile = template.content.firstElementChild.cloneNode(true);
  tile.dataset.category = component.category;

  const frame = tile.querySelector('iframe');
  frame.src = component.path;
  frame.title = component.name;
  frame.style.height = `${component.height}px`;

  tile.querySelector('.name').textContent = component.name;
  tile.querySelector('.category').textContent = component.category;
  tile.querySelector('.description').textContent = component.description;
  tile.querySelector('.open').href = component.path;
  tile.querySelector('.code').href = REPO_TREE + component.path;

  const snippet = iframeSnippet(component);
  tile.querySelector('.snippet code').textContent = snippet;

  const copy = tile.querySelector('.copy');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      copy.textContent = 'Copiato';
    } catch {
      tile.querySelector('.snippet').open = true;
      copy.textContent = 'Copialo qui sotto';
    }
    setTimeout(() => { copy.textContent = 'Copia iframe'; }, 2000);
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

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'component:height') return;
  for (const frame of grid.querySelectorAll('iframe')) {
    if (frame.contentWindow === event.source) frame.style.height = `${event.data.height}px`;
  }
});

document.getElementById('count').textContent =
  components.length === 1 ? '1 componente' : `${components.length} componenti`;
renderFilters();
grid.append(...components.map(renderTile));
