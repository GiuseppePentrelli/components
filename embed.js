// Incluso da ogni componente. Dentro un iframe, comunica alla pagina che lo carica l'altezza che gli serve
// e non scorre mai: quello che sporge (un hover che ingrandisce, un'ombra) viene tagliato dal contenitore.
(() => {
  if (window.self === window.top) return;

  const root = document.documentElement;
  root.classList.add('is-embed');
  root.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.minHeight = '0';

  const report = () => {
    const height = Math.ceil(root.getBoundingClientRect().height);
    window.parent.postMessage({ type: 'component:height', height }, '*');
  };

  if ('ResizeObserver' in window) new ResizeObserver(report).observe(document.body);
  window.addEventListener('load', report);
})();
