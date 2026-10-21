/* Partículas de fondo — mismo lenguaje visual y misma velocidad de referencia
   que la nube de partículas del carrusel 3D (orbit-gallery.js: rotación de
   ~0.0006 rad/frame, un giro completo cada ~3 minutos). Va en todas las
   secciones de la página. Usa Canvas 2D (no WebGL) para no competir por
   contexto WebGL con el robot de Spline ni con el carrusel 3D. */

/* Velocidad de referencia: ~2% del ancho del contenedor por minuto — el mismo
   ritmo pausado que el giro del carrusel 3D. */
var DRIFT_SPEED = 0.000004; // unidades normalizadas (0–1) por milisegundo

function initParticleField(mountId, dotCount, color) {
  var mount = document.getElementById(mountId);
  if (!mount) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.createElement('canvas');
  mount.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var DOT_COUNT = dotCount || 90;
  var dots = [];

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = mount.clientWidth || 1;
    var h = mount.clientHeight || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  for (var i = 0; i < DOT_COUNT; i++) {
    var angle = Math.random() * Math.PI * 2;
    dots.push({
      x: Math.random(),
      y: Math.random(),
      vx: Math.cos(angle) * DRIFT_SPEED,
      vy: Math.sin(angle) * DRIFT_SPEED,
      r: Math.random() * 1.1 + 0.4,
      base: Math.random() * 0.35 + 0.15,
      speed: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
    });
  }

  var lastTs = 0;
  function draw(twinkle, dt) {
    var w = mount.clientWidth || 1;
    var h = mount.clientHeight || 1;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color || '#f2f2f0';
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      if (dt) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x < -0.05) d.x = 1.05;
        if (d.x > 1.05) d.x = -0.05;
        if (d.y < -0.05) d.y = 1.05;
        if (d.y > 1.05) d.y = -0.05;
      }
      var alpha = twinkle
        ? d.base + Math.sin(twinkle * d.speed + d.phase) * 0.12
        : d.base;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (reducedMotion) {
    draw(0);
  } else {
    (function animate(ts) {
      var t = (ts || 0) / 1000;
      var dt = lastTs ? Math.min(50, ts - lastTs) : 16;
      lastTs = ts;
      draw(t, dt);
      requestAnimationFrame(animate);
    })();
  }

  window.addEventListener('resize', function () {
    resize();
    draw(0);
  });
}

/* Fondo claro en todo el sitio -> partículas oscuras en todas las secciones. */
initParticleField('about-particles', 70, '#0a0a0a');
initParticleField('proyectos-particles', 50, '#0a0a0a');
initParticleField('contacto-particles', 50, '#0a0a0a');
initParticleField('footer-particles', 40, '#0a0a0a');
