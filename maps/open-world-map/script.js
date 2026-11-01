// La mappa è disegnata in un riquadro di 160 × 160. Gli incroci sono i nodi della rete stradale;
// le strade collegano gli incroci vicini, tranne quelle in MISSING. I luoghi stanno su un incrocio.
const NODES = {
  a1: [12, 18], a2: [44, 14], a3: [80, 16], a4: [114, 12], a5: [148, 20],
  b1: [14, 48], b2: [46, 46], b3: [78, 48], b4: [112, 44], b5: [146, 50],
  c1: [12, 80], c2: [42, 78], c3: [80, 80], c4: [116, 78], c5: [148, 82],
  d1: [16, 112], d2: [48, 110], d3: [82, 114], d4: [114, 110], d5: [146, 114],
  e1: [14, 146], e2: [46, 144], e3: [78, 148], e4: [112, 146], e5: [148, 144],
};
const ROWS = ['a', 'b', 'c', 'd', 'e'];
const MISSING = new Set(['c2-d2', 'b4-c4', 'd3-d4']);

// Gli isolati prendono il nome dal loro incrocio in alto a sinistra: alcuni sono parchi o acqua.
const CELL_KINDS = { a4: 'park', c1: 'park', d4: 'water' };

const HOME = 'c3';
const PLACES = [
  { id: 'salone', name: 'Il salone', node: 'b1', icon: 'scissors' },
  { id: 'scuola', name: 'La scuola', node: 'a4', icon: 'school' },
  { id: 'ufficio', name: "L'ufficio", node: 'd5', icon: 'laptop' },
  { id: 'bar', name: 'Il bar', node: 'e2', icon: 'coffee' },
];

// Le icone dei luoghi, in un riquadro di 14 × 14 centrato sullo zero: tratti (g) e pieni (f).
const ICONS = {
  scissors: '<path class="g" d="M-3.5 -1 3 3.5M-3.5 1 3 -3.5"/><circle class="g" cx="-3.6" cy="-2.6" r="1.5"/><circle class="g" cx="-3.6" cy="2.6" r="1.5"/>',
  school: '<path class="f" d="M-4.5 -0.5 0 -3 4.5 -0.5 0 2Z"/><path class="g" d="M-2.5 0.6V2.8C-1 4 1 4 2.5 2.8V0.6M4 -0.2V3"/>',
  laptop: '<path class="f" d="M-3.5 -3H3.5V1.5H-3.5Z"/><path class="g" d="M-4.8 3H4.8"/>',
  coffee: '<path class="f" d="M-3.5 -1.5H2.5V1.2A3 3 0 0 1 -0.5 4.2 3 3 0 0 1 -3.5 1.2Z"/><path class="g" d="M2.5 -0.6H3.6A1.4 1.4 0 0 1 3.6 2.2H2.4M-2 -3.2C-2.6 -4 -1.4 -4.6 -2 -5.4M0.6 -3.2C0 -4 1.2 -4.6 0.6 -5.4"/>',
};

// Un'unità della mappa vale sei metri: la distanza che mostra il navigatore.
const METERS_PER_UNIT = 6;
const MIN_SCALE = 1;
const MAX_SCALE = 3;

const SVG_NS = 'http://www.w3.org/2000/svg';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const viewport = document.querySelector('.map__viewport');
const world = document.querySelector('.map__world');
const ground = document.querySelector('.map__ground');
const placesLayer = document.querySelector('.map__places');
const status = document.querySelector('.map__status');

// La rete: ogni strada collega due incroci della stessa riga o della stessa colonna.
const edges = [];
for (let r = 0; r < ROWS.length; r++) {
  for (let c = 1; c <= 5; c++) {
    const here = `${ROWS[r]}${c}`;
    const right = `${ROWS[r]}${c + 1}`;
    const below = `${ROWS[r + 1]}${c}`;
    if (NODES[right] && !MISSING.has(`${here}-${right}`)) edges.push([here, right]);
    if (NODES[below] && !MISSING.has(`${here}-${below}`)) edges.push([here, below]);
  }
}

const distance = (a, b) => Math.hypot(NODES[a][0] - NODES[b][0], NODES[a][1] - NODES[b][1]);

const neighbours = {};
for (const [a, b] of edges) {
  (neighbours[a] ??= []).push(b);
  (neighbours[b] ??= []).push(a);
}

// Il percorso più breve da un incrocio all'altro (Dijkstra): la rete è piccola, basta cercare ogni
// volta l'incrocio non ancora visitato più vicino.
function shortestPath(from, to) {
  const best = { [from]: 0 };
  const previous = {};
  const open = new Set(Object.keys(NODES));
  while (open.size) {
    let current = null;
    for (const node of open) if (best[node] !== undefined && (current === null || best[node] < best[current])) current = node;
    if (current === null || current === to) break;
    open.delete(current);
    for (const next of neighbours[current] ?? []) {
      const through = best[current] + distance(current, next);
      if (best[next] === undefined || through < best[next]) {
        best[next] = through;
        previous[next] = current;
      }
    }
  }
  const path = [to];
  while (path[0] !== from) path.unshift(previous[path[0]]);
  return { path, length: best[to] };
}

function svg(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}

const points = nodes => nodes.map(node => NODES[node].join(' ')).join(' ');

// Il terreno: la terra, gli isolati rimpiccioliti verso il loro centro, le strade, la statale, il
// percorso, la casa e la freccia di chi gioca.
function drawGround() {
  ground.append(svg('rect', { class: 'land', width: 160, height: 160 }));

  for (let r = 0; r < ROWS.length - 1; r++) {
    for (let c = 1; c < 5; c++) {
      const corners = [`${ROWS[r]}${c}`, `${ROWS[r]}${c + 1}`, `${ROWS[r + 1]}${c + 1}`, `${ROWS[r + 1]}${c}`];
      const cx = corners.reduce((sum, node) => sum + NODES[node][0], 0) / 4;
      const cy = corners.reduce((sum, node) => sum + NODES[node][1], 0) / 4;
      const shrunk = corners.map((node) => {
        const [x, y] = NODES[node];
        return `${(cx + (x - cx) * 0.74).toFixed(1)} ${(cy + (y - cy) * 0.74).toFixed(1)}`;
      });
      const kind = CELL_KINDS[corners[0]] ?? ((r + c) % 2 ? 'block' : 'block-alt');
      ground.append(svg('polygon', { class: kind, points: shrunk.join(' ') }));
    }
  }

  for (const [a, b] of edges) ground.append(svg('polyline', { class: 'road', points: points([a, b]) }));

  ground.append(svg('path', { class: 'highway-casing', d: 'M-8 30C30 36 70 52 96 70S140 104 170 112' }));
  ground.append(svg('path', { class: 'highway', d: 'M-8 30C30 36 70 52 96 70S140 104 170 112' }));

  ground.append(svg('polyline', { class: 'route', points: '', pathLength: 1 }));

  const [hx, hy] = NODES[HOME];
  ground.append(svg('path', { class: 'home', d: `M${hx - 13} ${hy + 9} ${hx - 8} ${hy + 4} ${hx - 3} ${hy + 9}V${hy + 14}H${hx - 13}Z` }));
  const player = svg('g', { transform: `translate(${hx} ${hy})` });
  player.append(svg('path', { class: 'player', d: 'M0 -5 5 5 0 2.5 -5 5Z' }));
  ground.append(player);
}

function drawPlaces() {
  for (const place of PLACES) {
    const [x, y] = NODES[place.node];
    const button = document.createElement('button');
    button.type = 'button';
    // Vicino al bordo in alto il nome va sotto il luogo, o il riquadro lo taglierebbe.
    button.className = y < 32 ? 'place place--label-below' : 'place';
    button.dataset.place = place.id;
    button.setAttribute('aria-pressed', 'false');
    button.style.left = `${(x / 160) * 100}%`;
    button.style.top = `${(y / 160) * 100}%`;
    button.innerHTML = `<svg class="place__icon" viewBox="-7 -7 14 14" aria-hidden="true">${ICONS[place.icon]}</svg><span class="place__label">${place.name}</span>`;
    button.addEventListener('click', () => choose(place));
    placesLayer.append(button);
  }
}

let heading = 0;

// Scelto un luogo, il navigatore disegna il percorso da casa e la freccia si gira verso la prima
// strada da prendere. La rotazione fa sempre il giro più corto.
function choose(place) {
  const { path, length } = shortestPath(HOME, place.node);
  const route = ground.querySelector('.route');
  route.setAttribute('points', points(path));
  if (!reduceMotion.matches) {
    route.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  }

  const [x0, y0] = NODES[path[0]];
  const [x1, y1] = NODES[path[1]];
  const target = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI + 90;
  heading += ((target - heading + 540) % 360) - 180;
  ground.querySelector('.player').style.rotate = `${heading}deg`;

  for (const button of placesLayer.children) button.setAttribute('aria-pressed', String(button.dataset.place === place.id));
  const meters = Math.round((length * METERS_PER_UNIT) / 10) * 10;
  status.textContent = `Destinazione: ${place.name} · ${meters} m`;
}

// Lo spostamento e lo zoom. Il mondo si sposta e si ingrandisce con una trasformazione; i luoghi
// restano della stessa misura, perché la scala è compensata da --inverse.
let scale = 1;
let tx = 0;
let ty = 0;

function apply(animated) {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  tx = Math.min(0, Math.max(width - width * scale, tx));
  ty = Math.min(0, Math.max(height - height * scale, ty));
  world.classList.toggle('is-animating', Boolean(animated) && !reduceMotion.matches);
  world.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  world.style.setProperty('--inverse', String(1 / scale));
  viewport.classList.toggle('is-zoomed', scale > 1.001);
}

function zoomAt(x, y, next, animated) {
  const target = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
  tx = x - (x - tx) * (target / scale);
  ty = y - (y - ty) * (target / scale);
  scale = target;
  apply(animated);
}

const center = () => [viewport.clientWidth / 2, viewport.clientHeight / 2];

for (const button of document.querySelectorAll('[data-zoom]')) {
  button.addEventListener('click', () => {
    if (button.dataset.zoom === 'reset') {
      scale = 1;
      tx = 0;
      ty = 0;
      apply(true);
    } else {
      zoomAt(...center(), scale * (button.dataset.zoom === 'in' ? 1.5 : 1 / 1.5), true);
    }
  });
}

// La rotella zooma solo con Ctrl (o con il pizzico del trackpad, che il browser manda così):
// altrimenti la pagina deve poter scorrere anche quando il puntatore è sopra la mappa.
let hintTimer;
viewport.addEventListener('wheel', (event) => {
  if (!event.ctrlKey) {
    viewport.classList.add('show-hint');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => viewport.classList.remove('show-hint'), 1400);
    return;
  }
  event.preventDefault();
  const box = viewport.getBoundingClientRect();
  zoomAt(event.clientX - box.left, event.clientY - box.top, scale * Math.exp(-event.deltaY * 0.01));
}, { passive: false });

// Il trascinamento, quando la mappa è ingrandita. Un clic su un luogo non diventa un trascinamento.
let drag = null;
viewport.addEventListener('pointerdown', (event) => {
  if (scale <= 1.001 || event.target.closest('.place')) return;
  drag = { x: event.clientX - tx, y: event.clientY - ty };
  viewport.setPointerCapture(event.pointerId);
  viewport.classList.add('is-dragging');
});
viewport.addEventListener('pointermove', (event) => {
  if (!drag) return;
  tx = event.clientX - drag.x;
  ty = event.clientY - drag.y;
  apply();
});
const endDrag = () => {
  drag = null;
  viewport.classList.remove('is-dragging');
};
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);

// Da tastiera, con la mappa selezionata: frecce per spostarla, + e − per lo zoom, 0 per rimetterla.
viewport.addEventListener('keydown', (event) => {
  const step = 40;
  const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
  if (moves[event.key] && scale > 1.001) {
    tx += moves[event.key][0];
    ty += moves[event.key][1];
    apply(true);
  } else if (event.key === '+' || event.key === '=') {
    zoomAt(...center(), scale * 1.5, true);
  } else if (event.key === '-') {
    zoomAt(...center(), scale / 1.5, true);
  } else if (event.key === '0') {
    scale = 1;
    tx = 0;
    ty = 0;
    apply(true);
  } else {
    return;
  }
  event.preventDefault();
});

new ResizeObserver(() => apply()).observe(viewport);

drawGround();
drawPlaces();
apply();
