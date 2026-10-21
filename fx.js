/* SoberanoLab — fx.js: cursor custom, botones magnéticos.
   Archivo aditivo: no toca app.js ni style.css, solo engancha clases/ids que
   ya existen en index.html. */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  var hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasFinePointer) return;

  var HOVER_SELECTOR = 'a, button, .btn, .why-item__icon, .catalogo-tile';
  var MAGNETIC_SELECTOR = '.btn';

  /* ------------------------------------------------------------
     1. Cursor custom
     ------------------------------------------------------------ */
  function initCursor() {
    var dot = document.createElement('div');
    dot.className = 'fx-cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'fx-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('fx-cursor-active');

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;
    var RING_LERP = 0.18;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    (function animateRing() {
      ringX += (mouseX - ringX) * RING_LERP;
      ringY += (mouseY - ringY) * RING_LERP;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();

    var hoverTargets = document.querySelectorAll(HOVER_SELECTOR);
    hoverTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-hovering'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-hovering'); });
    });
  }

  /* ------------------------------------------------------------
     2. Botones magnéticos
     ------------------------------------------------------------ */
  function initMagnetic() {
    var els = document.querySelectorAll(MAGNETIC_SELECTOR);
    els.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = 'translate(' + (relX * 0.25).toFixed(1) + 'px, ' + (relY * 0.35).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  function init() {
    initCursor();
    initMagnetic();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
