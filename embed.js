// Incluso da ogni componente. Dentro un iframe, comunica alla pagina che lo carica l'altezza che gli serve
// e non scorre mai: quello che sporge (un hover che ingrandisce, un'ombra) viene tagliato dal contenitore.
(() => {
  if (window.self === window.top) return;

  const root = document.documentElement;
  root.classList.add('is-embed');
  root.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.minHeight = '0';

  // Con ?trasparente la pagina lascia vedere lo sfondo di chi la carica, come fa il dettaglio della vetrina.
  // Lo schema di colori deve coincidere con quello della vetrina, altrimenti il browser dipinge un fondo opaco.
  if (new URLSearchParams(location.search).has('trasparente')) {
    root.style.colorScheme = 'dark';
    root.style.background = 'transparent';
    document.body.style.background = 'transparent';
  }

  const report = () => {
    const height = Math.ceil(root.getBoundingClientRect().height);
    window.parent.postMessage({ type: 'component:height', height }, '*');
  };

  if ('ResizeObserver' in window) new ResizeObserver(report).observe(document.body);
  window.addEventListener('load', report);
})();
