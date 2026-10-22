// Incluso da ogni componente. Dentro un iframe, comunica alla pagina che lo carica l'altezza che gli serve.
(() => {
  if (window.self === window.top) return;

  const root = document.documentElement;
  root.classList.add('is-embed');
  document.body.style.minHeight = '0';

  const report = () => {
    const height = Math.ceil(root.getBoundingClientRect().height);
    window.parent.postMessage({ type: 'component:height', height }, '*');
  };

  if ('ResizeObserver' in window) new ResizeObserver(report).observe(document.body);
  window.addEventListener('load', report);
})();
