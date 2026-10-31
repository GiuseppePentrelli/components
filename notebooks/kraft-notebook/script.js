(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const notebook = document.querySelector('.notebook');
  const body = notebook.querySelector('.notebook__body');
  const toggle = document.querySelector('.toggle');

  // Velocità con cui ruota la copertina: muove le foto e i foglietti attaccati.
  let leafVelocity = 0;

  // Un pezzo di carta fissato da un solo lato: due molle poco smorzate, una per quanto si solleva
  // (--flap, 0–24) e una per quanto oscilla (--swing, circa ±6). Il CSS decide come mostrarle.
  function paperSpring(element) {
    const STIFFNESS = 125;
    const DAMPING = 8;
    const MAX_FLAP = 24;
    const HOVER_LIFT = 9;
    let flap = 0;
    let flapVelocity = 0;
    let swing = 0;
    let swingVelocity = 0;
    let hoverLift = 0;
    let hoverSwing = 0;
    let lastFrame = 0;
    let frame = null;

    function step(now) {
      const seconds = Math.min(64, now - lastFrame) / 1000 / 4;
      lastFrame = now;
      const flapTarget = Math.min(MAX_FLAP, Math.abs(leafVelocity) * 7.5 + hoverLift);
      const swingTarget = Math.max(-6, Math.min(6, leafVelocity * 3)) + hoverSwing;

      for (let i = 0; i < 4; i += 1) {
        flapVelocity += (STIFFNESS * (flapTarget - flap) - DAMPING * flapVelocity) * seconds;
        flap += flapVelocity * seconds;
        swingVelocity += (STIFFNESS * (swingTarget - swing) - DAMPING * swingVelocity) * seconds;
        swing += swingVelocity * seconds;
        // La carta non attraversa ciò su cui è appoggiata: rimbalza appena.
        if (flap < 0) {
          flap = 0;
          flapVelocity *= -0.3;
        }
      }

      const settled =
        Math.abs(flap - flapTarget) < 0.05 &&
        Math.abs(flapVelocity) < 0.5 &&
        Math.abs(swing - swingTarget) < 0.05 &&
        Math.abs(swingVelocity) < 0.5;
      if (settled) {
        flap = flapTarget;
        swing = swingTarget;
      }

      element.style.setProperty('--flap', flap.toFixed(2));
      element.style.setProperty('--swing', swing.toFixed(2));
      frame = settled ? null : window.requestAnimationFrame(step);
    }

    function wake() {
      if (frame !== null || reducedMotion.matches) return;
      lastFrame = performance.now();
      frame = window.requestAnimationFrame(step);
    }

    function nudge(strength = 200) {
      flapVelocity += strength;
      swingVelocity -= strength * 0.22;
      wake();
    }

    function touch(event) {
      if (event.pointerType === 'touch') return;
      const rect = element.getBoundingClientRect();
      hoverLift = HOVER_LIFT;
      hoverSwing = ((event.clientX - rect.left) / rect.width - 0.5) * -5;
      wake();
    }

    function release() {
      hoverLift = 0;
      hoverSwing = 0;
      wake();
    }

    element.addEventListener('pointerenter', touch);
    element.addEventListener('pointermove', touch);
    element.addEventListener('pointerleave', release);

    return { wake, nudge };
  }

  // L'elastico: si afferra e si tira, resiste sempre di più e torna al suo posto con una molla.
  function elastic(svg, { nudgeDelay }) {
    const WIDTH = 150;
    const REST_X = 132;
    const GRIP_MARGIN = 40;
    const paths = svg.querySelectorAll('path');
    const grip = svg.querySelector('.elastic__grip');
    let height = 520;
    let bend = 0;
    let bendY = 260;
    let pull = 0;
    let dragging = false;
    let spring = null;
    let startX = 0;
    let startBend = 0;
    let scale = 1;
    let samples = [];

    function draw() {
      const d = `M${REST_X} 0 Q ${REST_X + (bend + pull) * 2} ${bendY} ${REST_X} ${height}`;
      for (const path of paths) path.setAttribute('d', d);
    }

    function stopSpring() {
      if (spring) window.cancelAnimationFrame(spring);
      spring = null;
    }

    // Molla smorzata: `response` è il periodo in secondi, `damping` lo smorzamento.
    function springBack({ velocity = 0, response, damping }) {
      stopSpring();
      if (reducedMotion.matches) {
        bend = 0;
        draw();
        return;
      }

      const stiffness = ((2 * Math.PI) / response) ** 2;
      const friction = (4 * Math.PI * damping) / response;
      let position = bend;
      let last = performance.now();

      function step(now) {
        const delta = Math.min(0.032, (now - last) / 1000) / 4;
        last = now;
        for (let i = 0; i < 4; i += 1) {
          velocity += (-stiffness * position - friction * velocity) * delta;
          position += velocity * delta;
        }
        if (Math.abs(velocity) < 4 && Math.abs(position) < 0.4) {
          bend = 0;
          spring = null;
        } else {
          bend = position;
          spring = window.requestAnimationFrame(step);
        }
        draw();
      }

      spring = window.requestAnimationFrame(step);
    }

    function gripY(event) {
      const rect = svg.getBoundingClientRect();
      const y = (event.clientY - rect.top) * (height / rect.height);
      return Math.max(GRIP_MARGIN, Math.min(height - GRIP_MARGIN, y));
    }

    function track(event) {
      const now = performance.now();
      samples.push([event.clientX, now]);
      while (samples.length > 2 && now - samples[0][1] > 100) samples.shift();
    }

    function horizontalVelocity() {
      if (samples.length < 2) return 0;
      const first = samples[0];
      const last = samples[samples.length - 1];
      return (last[0] - first[0]) / Math.max(1, last[1] - first[1]);
    }

    grip.addEventListener('pointerdown', (event) => {
      stopSpring();
      window.clearTimeout(nudgeTimer);
      dragging = true;
      svg.classList.add('is-dragging');
      scale = WIDTH / svg.getBoundingClientRect().width;
      startX = event.clientX;
      startBend = bend;
      samples = [];
      track(event);
      bendY = gripY(event);
      grip.setPointerCapture(event.pointerId);
      draw();
    });

    grip.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      track(event);
      bendY = gripY(event);
      let next = startBend + (event.clientX - startX) * scale;
      if (next < 0) next *= 0.15;
      else if (next > 40) next = 40 + (next - 40) * 0.35;
      bend = next;
      draw();
    });

    function release() {
      if (!dragging) return;
      dragging = false;
      svg.classList.remove('is-dragging');
      const moved = Math.abs(bend - startBend) > 1;
      springBack({
        velocity: moved ? horizontalVelocity() * 1000 * scale : 220,
        response: 0.35,
        damping: 0.45,
      });
    }

    grip.addEventListener('pointerup', release);
    grip.addEventListener('pointercancel', release);

    new ResizeObserver(([entry]) => {
      height = Math.max(1, Math.round(entry.contentRect.height));
      svg.setAttribute('viewBox', `0 0 ${WIDTH} ${height}`);
      if (!dragging) bendY = height / 2;
      draw();
    }).observe(svg);

    const nudgeTimer = reducedMotion.matches
      ? null
      : window.setTimeout(() => {
          if (!dragging) springBack({ velocity: 220, response: 0.45, damping: 0.35 });
        }, nudgeDelay);

    draw();

    return {
      setPull(value) {
        pull = value;
        draw();
      },
    };
  }

  const springs = [...notebook.querySelectorAll('.taped-photo, [data-spring]')].map((element) => {
    const spring = paperSpring(element);
    if (element.dataset.nudge) spring.nudge(Number(element.dataset.nudge));
    return spring;
  });

  const band = elastic(notebook.querySelector('.elastic'), { nudgeDelay: 2300 });

  // Apertura: l'elastico viene tirato e passa dietro, poi la copertina ruota e il quaderno si solleva.
  const BAND_END = 0.25;
  const OPEN = [0.15, 1];
  const DURATION = 1700;
  let progress = 0;
  let target = 0;
  let frame = null;
  let lastFrame = 0;
  let lastOpen = 0;

  function ramp(value, [from, to]) {
    const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
    return t * t * (3 - 2 * t);
  }

  function apply(value) {
    const bandProgress = Math.min(1, value / BAND_END);
    const bandOut = Math.sin(Math.PI * bandProgress);
    const open = ramp(value, OPEN);
    notebook.style.setProperty('--band-out', bandOut.toFixed(4));
    notebook.style.setProperty('--open', open.toFixed(4));
    notebook.style.setProperty('--lift', Math.sin(Math.PI * open).toFixed(4));
    notebook.classList.toggle('is-band-behind', bandProgress >= 0.5);
    band.setPull(bandOut * 16);
    return open;
  }

  function tick(now) {
    const elapsed = Math.min(64, now - lastFrame);
    lastFrame = now;
    const step = elapsed / DURATION;
    progress = target > progress ? Math.min(target, progress + step) : Math.max(target, progress - step);
    const open = apply(progress);
    const arrived = progress === target;
    leafVelocity = arrived || elapsed <= 0 ? 0 : (open - lastOpen) / (elapsed / 1000);
    lastOpen = open;
    for (const spring of springs) spring.wake();
    frame = arrived ? null : window.requestAnimationFrame(tick);
  }

  function setOpen(open) {
    target = open ? 1 : 0;
    toggle.textContent = open ? 'Chiudi il quaderno' : 'Apri il quaderno';
    if (reducedMotion.matches) {
      progress = target;
      lastOpen = apply(progress);
      return;
    }
    if (frame !== null) return;
    lastFrame = performance.now();
    frame = window.requestAnimationFrame(tick);
  }

  // Aperta, la doppia pagina deve stare tutta nello spazio disponibile.
  function measure() {
    const stage = notebook.parentElement;
    const style = window.getComputedStyle(stage);
    const available = stage.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
    const fit = Math.min(1, available / (notebook.offsetWidth * 2));
    notebook.style.setProperty('--fit', fit.toFixed(4));
  }

  new ResizeObserver(measure).observe(notebook.parentElement);

  toggle.addEventListener('click', () => setOpen(target === 0));
  body.addEventListener('click', (event) => {
    if (event.target.closest('.notebook__band')) return;
    setOpen(target === 0);
  });

  apply(0);
})();
