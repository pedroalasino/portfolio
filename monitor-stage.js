/* ============================================================
   MONITOR (desktop) — cierre de la sección fija Quién soy + Stack.
   1) Transición: un video lleva la cámara del escritorio a una toma
      sobre el hombro; el scroll lo avanza cuadro por cuadro.
   2) Pantalla: en el monitor encendido se va armando Proyectos
      (versión oscura, dibujada en código con la perspectiva real).
   3) Zoom: la cámara entra a la pantalla, la pone de frente y todo
      se funde con el gris del sitio; ahí sube la sección Proyectos.
   quien-soy.js lo monta (MonitorStage.mount) y le pasa el avance.
   ============================================================ */
(function () {
  var SRC = 'img/monitor-xfer';
  /* esquinas de la pantalla en el último cuadro del video (1920×1080) */
  var QUAD = [[792, 175], [1567, 199], [1552, 724], [794, 638]];
  var FW = 1920, FH = 1080;
  /* la pantalla mide lo mismo que la vista: al final del zoom coincide 1:1 con la sección real */
  var SW = 1600, SH = 900;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* matrix3d que lleva el rectángulo (0,0)-(SW,SH) al cuadrilátero q */
  function homography(q) {
    var x0 = q[0][0], y0 = q[0][1], x1 = q[1][0], y1 = q[1][1];
    var x2 = q[2][0], y2 = q[2][1], x3 = q[3][0], y3 = q[3][1];
    var dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
    var sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
    var den = dx1 * dy2 - dx2 * dy1;
    var g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den;
    var a = x1 - x0 + g * x1, b = x3 - x0 + h * x3;
    var d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
    return [a / SW, d / SW, 0, g / SW, b / SH, e / SH, 0, h / SH, 0, 0, 1, 0, x0, y0, 0, 1];
  }

  /* la pantalla muestra la sección Proyectos real (copiada) en versión oscura */
  function buildScreen(screen) {
    var src = document.querySelector('#proyectos .container');
    if (!src) return [];
    var copy = src.cloneNode(true);
    [copy].concat([].slice.call(copy.querySelectorAll('[id]'))).forEach(function (el) { el.removeAttribute('id'); });
    copy.querySelectorAll('.reveal').forEach(function (el) { el.classList.remove('reveal'); });
    copy.querySelectorAll('[style]').forEach(function (el) { el.removeAttribute('style'); });
    copy.querySelectorAll('.proyectos__preview-logo, .proyectos__preview-info h3, .proyectos__preview-info p, .proyectos__preview-ctas')
      .forEach(function (el) { el.classList.add('is-visible'); });
    copy.querySelectorAll('a, button').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
    screen.appendChild(copy);
    var glow = document.createElement('span');
    glow.className = 'mon-screen__glow';
    screen.appendChild(glow);
    /* piezas que se van armando, en orden de lectura */
    return [].concat(
      [copy.querySelector('.proyectos__tag'), copy.querySelector('.proyectos__title'), copy.querySelector('.proyectos__tabs')],
      [].slice.call(copy.querySelectorAll('.proyectos__list > *')),
      [copy.querySelector('.proyectos__cat-desc'), copy.querySelector('.proyectos__stack'), copy.querySelector('.proyectos__preview')]
    ).filter(Boolean);
  }

  function mount(layout, videoWrap) {
    var xfer = document.createElement('video');
    xfer.className = 'quien-soy__video mon-xfer';
    xfer.muted = true;
    xfer.playsInline = true;
    xfer.preload = 'auto';
    xfer.setAttribute('muted', '');
    xfer.setAttribute('playsinline', '');
    xfer.innerHTML = '<source src="' + SRC + '.mp4" type="video/mp4" /><source src="' + SRC + '.webm" type="video/webm" />';
    /* caja 16:9 centrada: el video y la pantalla comparten coordenadas */
    var box = document.createElement('div');
    box.className = 'mon-box';
    box.appendChild(xfer);
    videoWrap.appendChild(box);

    var screen = document.createElement('div');
    screen.className = 'mon-screen';
    box.appendChild(screen);
    var pieces = buildScreen(screen);
    pieces.forEach(function (el) { el.style.opacity = 0; });
    var cardVideo = screen.querySelector('video.proyectos__preview-video');
    if (cardVideo) {
      cardVideo.muted = true;
      cardVideo.loop = true;
      cardVideo.removeAttribute('autoplay');
    }
    var projSection = document.getElementById('proyectos');

    var lastSeek = -1;
    var active = false;
    /* xf: 0..1 viaje de cámara. ps: 0..1 la pantalla se arma. pz: 0..1 zoom final. */
    function apply(xf, ps, pz) {
      var on = xf > 0;
      if (on !== active) {
        active = on;
        box.style.opacity = on ? 1 : 0;
        if (!on) {
          videoWrap.style.transform = '';
          screen.style.opacity = 0;
          box.style.backgroundColor = '';
          if (projSection) projSection.classList.remove('is-shown');
        }
      }
      if (!on) return;

      /* 1) el scroll avanza el video */
      var duration = xfer.duration || 0;
      if (duration) {
        var t = Math.min(duration - 0.05, xf * duration);
        if (Math.abs(t - lastSeek) > 0.02) { xfer.currentTime = t; lastSeek = t; }
      }

      /* 2) contenido de la pantalla con la perspectiva del monitor */
      var w = videoWrap.offsetWidth;
      var bw = box.offsetWidth, bh = box.offsetHeight, bx = (w - bw) / 2;
      var kx = bw / FW, ky = bh / FH;
      var vw = window.innerWidth;
      if (SW !== vw) { SW = vw; SH = vw * 9 / 16; screen.style.width = SW + 'px'; screen.style.height = SH + 'px'; }
      var z = ease(pz);
      var S = 1 + z * 1.9; /* el monitor ya ocupa ~40% del cuadro */
      var cx = (QUAD[0][0] + QUAD[2][0]) / 2 * kx, cy = (QUAD[0][1] + QUAD[2][1]) / 2 * ky; /* en la caja */

      /* zoom: la cámara se acerca a la pantalla (posición del cuadro sin transformar) */
      var lr = layout.getBoundingClientRect();
      var baseLeft = lr.left + videoWrap.offsetLeft - w / 2, baseTop = lr.top + videoWrap.offsetTop;
      var ox = bx + cx, oy = cy; /* origen del zoom, en coordenadas del cuadro */
      var dx = (vw / 2 - (baseLeft + ox)) * z;
      var dy = (window.innerHeight / 2 - (baseTop + oy)) * z;
      /* destino de la pantalla: arriba de todo, a lo ancho de la vista (donde está la sección real) */
      function toBox(X, Y) {
        return [ox + (X - baseLeft - ox - dx) / S - bx, oy + (Y - baseTop - oy - dy) / S];
      }
      var flat = [toBox(0, 0), toBox(vw, 0), toBox(vw, SH), toBox(0, SH)];
      var straighten = clamp((z - 0.15) / 0.85, 0, 1);
      var q = QUAD.map(function (p, i) {
        return [lerp(p[0] * kx, flat[i][0], straighten), lerp(p[1] * ky, flat[i][1], straighten)];
      });
      screen.style.transform = 'matrix3d(' + homography(q).join(',') + ')';
      screen.style.opacity = xf >= 0.999 ? clamp(ps * 4, 0, 1) : 0;
      pieces.forEach(function (el, i) {
        var r = ease(clamp((ps - 0.1 - i * 0.07) / 0.15, 0, 1));
        el.style.opacity = r;
        el.style.transform = 'translateY(' + (1 - r) * 40 + 'px)';
      });
      if (cardVideo) {
        var showCard = ps > 0.5 && pz < 0.95;
        if (showCard && cardVideo.paused && cardVideo.getAttribute('src')) { var pr = cardVideo.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else if (!showCard && !cardVideo.paused) cardVideo.pause();
      }

      /* 3) aplicar el zoom */
      if (z > 0) {
        videoWrap.style.transformOrigin = ox + 'px ' + oy + 'px';
        videoWrap.style.transform = 'translateX(-50%) translate(' + dx + 'px,' + dy + 'px) scale(' + S + ')';
      } else {
        videoWrap.style.transform = '';
      }
      /* alrededor de la pantalla todo se vuelve del mismo negro */
      var dark = clamp((z - 0.55) / 0.35, 0, 1);
      xfer.style.opacity = 1 - dark;
      box.style.backgroundColor = 'rgba(13, 15, 18, ' + dark + ')';
      /* al terminar el zoom la pantalla coincide con la sección real, que toma su lugar */
      if (projSection) projSection.classList.toggle('is-shown', pz > 0.985);
    }

    return { apply: apply, video: xfer };
  }

  window.MonitorStage = { mount: mount };
})();
