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
    name: 'Open World Minimap',
    category: 'Mappa',
    description: "La minimappa nell'angolo dello schermo, come nei giochi open world: strade, luoghi, la freccia di chi gioca e la linea del navigatore fino alla destinazione.",
    details: [
      "Una minimappa da videogioco open world, disegnata da zero in SVG: una città stilizzata, con la statale, le strade, i parchi e gli isolati, tre luoghi segnati da un'icona e la freccia di chi gioca, davanti a casa.",
      "La linea viola del navigatore porta dalla casa alla destinazione, cerchiata dello stesso colore; sotto, cinque stelle dicono il livello di ricerca. Nata come omaggio nel laboratorio del portfolio.",
    ],
    features: [
      'Disegnata a mano in SVG, senza immagini',
      'Angoli arrotondati con clipPath e cornice chiara',
      'Linea del navigatore con il bagliore',
      'Livello di ricerca a stelle con clip-path',
      'Misure in em: si ridimensiona tutta insieme',
      'Un solo HTML e un CSS, senza JavaScript',
    ],
    path: 'maps/open-world-minimap/',
    height: 520,
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
