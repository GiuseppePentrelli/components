// Per aggiungere un componente: crea la sua cartella <categoria>/<nome>/ e aggiungi qui un oggetto.
// `details` e `features` riempiono la pagina di dettaglio; `theme` le dà i colori e i font del componente.
const DARK_BACKGROUND = 'radial-gradient(circle at center, #1a1a1a 0%, #050505 100%) #0f0f0f';

window.COMPONENTS = [
  {
    name: 'Cars Card',
    category: 'Card',
    description: "Card di un'auto in stile luxury: al passaggio del mouse l'auto esce dalla card in 3D, con riflesso, bagliore e dashboard in vetro.",
    details: [
      "Una card pensata per lo showroom di un'auto di lusso. Al passaggio del mouse la card si inclina in 3D e l'auto esce dai suoi bordi, verso chi guarda, portandosi dietro il riflesso specchiato e un'ombra di contatto dorata.",
      "Sotto l'auto le specifiche stanno in una dashboard di vetro sfocato; prezzo e pulsante chiudono la card. Tutto è fatto con HTML e CSS, senza una riga di JavaScript.",
    ],
    features: [
      'Effetto pop-out 3D con perspective e translateZ',
      'Bagliore che attraversa la card e sfondo che ruota in hover',
      "Riflesso specchiato e ombra dorata sotto l'auto",
      'Dashboard delle specifiche in stile glassmorphism',
      'Playfair Display per i titoli, Inter per i dati',
      'Si adatta ai telefoni restando in proporzione',
    ],
    path: 'cards/cars-card/',
    height: 740,
    theme: {
      background: DARK_BACKGROUND,
      title: '#c5a059',
      text: '#ffffff',
      muted: '#a3a3a3',
      accent: '#c5a059',
      titleFont: "'Playfair Display', serif",
      titleStyle: 'italic',
      bodyFont: "'Inter', sans-serif",
      mark: 'line',
      stylesheet: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Inter:wght@400;600;700&display=swap',
    },
  },
  {
    name: 'Kraft Notebook',
    category: 'Notebook',
    description: "Quaderno con copertina in cartoncino: etichetta scritta a penna, foto fissate con lo scotch che si sollevano al passaggio del mouse, adesivi e un elastico da tirare. Con un clic la copertina si apre sulla prima pagina di appunti.",
    details: [
      "Un quaderno con la copertina in cartoncino kraft, l'etichetta scritta a penna e ripassata con l'evidenziatore, due foto fissate con lo scotch e qualche adesivo fustellato. Testi e immagini sono segnaposto, pronti da sostituire.",
      "Ogni pezzo si muove come carta vera: le foto si sollevano e oscillano sotto il mouse, l'elastico si afferra e torna al suo posto, e con un clic la copertina si apre in 3D sulla prima pagina di appunti.",
    ],
    features: [
      "Etichetta scritta a penna con il passaggio dell'evidenziatore",
      'Foto e foglietti con una fisica a molla: reagiscono al mouse e alla copertina che ruota',
      'Elastico da tirare, che resiste sempre di più e rimbalza',
      'Copertina che si apre in 3D sulla tavola delle scorciatoie e la tasca dei post-it',
      'Misure in unità container: a ogni larghezza è lo stesso disegno in scala',
      'HTML, CSS e JavaScript senza librerie, con prefers-reduced-motion rispettato',
    ],
    path: 'notebooks/kraft-notebook/',
    height: 613,
    theme: {
      background: DARK_BACKGROUND,
      title: '#fffdf4',
      text: '#e4dac5',
      muted: '#c9b48f',
      accent: '#ffd500',
      titleFont: "'Excalifont', cursive",
      bodyFont: "'Nunito', sans-serif",
      mark: 'scribble',
      fonts: [
        { family: 'Excalifont', src: 'notebooks/kraft-notebook/fonts/excalifont-latin.woff2' },
        { family: 'Nunito', src: 'notebooks/kraft-notebook/fonts/nunito-variable.woff2', weight: '200 1000' },
      ],
    },
  },
  {
    name: 'Open World Map',
    category: 'Mappa',
    description: "La mappa interattiva di una città da videogioco: scegli un luogo e la freccia ci va seguendo le strade del percorso più breve. Si trascina e si ingrandisce.",
    details: [
      "La mappa di una città da videogioco open world, disegnata da zero in SVG: isolati, parchi, un lago, la statale e quattro luoghi. Le strade sono una rete vera: scegliendo un luogo, il navigatore calcola il percorso più breve da dove si trova la freccia (l'algoritmo di Dijkstra) e la freccia lo percorre, girando agli incroci, mentre la linea viola si accorcia davanti a lei. Si ferma davanti al luogo, e il viaggio dopo riparte da lì.",
      "La mappa si ingrandisce con i bottoni, con Ctrl e la rotella o con il pizzico del trackpad, e si trascina quando è ingrandita. Si usa tutta anche da tastiera: i luoghi sono bottoni veri, e sulla mappa le frecce la spostano, più e meno la ingrandiscono, zero la rimettono a posto.",
    ],
    features: [
      'Percorso più breve calcolato con Dijkstra sulla rete stradale',
      'La freccia viaggia lungo le strade e riparte da dove è arrivata',
      'Zoom e trascinamento, con i luoghi sempre della stessa misura',
      'La rotella zooma solo con Ctrl: la pagina continua a scorrere',
      'Tutto usabile da tastiera, con i nomi letti dai lettori di schermo',
      'Mappa generata da pochi dati: incroci, strade e luoghi',
    ],
    path: 'maps/open-world-map/',
    height: 720,
    theme: {
      background: 'radial-gradient(circle at center, #1d2630 0%, #0b0f13 100%) #11161b',
      title: '#f4f1ea',
      text: '#f4f1ea',
      muted: '#8d99a3',
      accent: '#d64cd8',
      titleFont: '"Segoe UI", system-ui, sans-serif',
      bodyFont: '"Segoe UI", system-ui, sans-serif',
      mark: 'line',
    },
  },
];
