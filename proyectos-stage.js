/* ============================================================
   PROYECTOS (desktop) — continúa la sección fija de Quién soy + Stack.
   Al terminar el Stack la cámara entra al monitor del escritorio: el
   proyecto nace en la pantalla y crece al centro. Después cada tramo
   de scroll muestra un proyecto con el mismo formato (tarjetas negras
   a los costados y barra de tramos abajo, agrupada AI Engineer /
   Full Stack). quien-soy.js lo monta con ProyectosStage.mountMerged;
   en pantallas chicas queda la sección de proyectos de siempre.
   ============================================================ */
(function () {
  var IMG = 'img/proyectos/';

  /* "rows": datos clave (izquierda). "items": qué incluye (derecha). */
  var PROJECTS = [
    {
      group: 0, name: 'Luigi Bosca', year: '2025', video: IMG + 'luigi-bosca', /* cliente estrella: reel vertical con sonido */
      title: 'Capacitación de IA aplicada',
      desc: 'Plataforma sobre su motor de IA propio, con seis agentes configurables en tiempo real para los equipos de la bodega.',
      rows: [['CLIENTE', 'Luigi Bosca · Miraiico'], ['FORMATO', '3 días · BA y Mendoza'], ['AGENTES', '6 configurables']],
      items: [['01', 'Fundamentos', 'Adopción de IA por sector'], ['02', 'Demos en vivo', 'Cómo razonan los agentes'], ['03', 'Plataforma propia', 'Cada equipo creó su asistente'], ['WEB', 'Embebible', 'Integración en la web']],
      ctas: [{ label: 'Consultar', href: '#contacto' }]
    },
    {
      group: 0, name: 'SoberanoLab', year: '2025', media: IMG + 'soberanolab.jpg',
      title: 'Motor de IA soberano',
      desc: 'SOBERAI corre en el equipo del cliente, sin nube: agentes, RAG, memoria vectorial y voz.',
      rows: [['TIPO', 'IA local y privada'], ['BACKEND', 'Python · FastAPI'], ['MODO', '100% offline']],
      items: [['AG', 'Agentes', 'Orquestación de agentes'], ['RAG', 'RAG', 'Memoria vectorial (Chroma, Qdrant)'], ['LLM', 'LLaMA 3', 'Ejecutado con Ollama'], ['VOZ', 'Voz', 'Whisper.cpp · Piper · Coqui']],
      ctas: [{ label: 'Consultar', href: '#contacto' }]
    },
    {
      group: 0, name: 'Expolajas', year: '2026', media: IMG + 'expolajas.jpg',
      title: 'Sistema laboral con IA',
      desc: 'Para una exportadora de piedra laja con más de 35 años en el rubro.',
      rows: [['CLIENTE', 'Exportadora de piedra laja'], ['ÁREA', 'Gestión de personal'], ['RESULTADO', '−80% carga administrativa']],
      items: [['01', 'Asistencia', 'Registro del personal'], ['02', 'Turnos', 'Organización diaria'], ['03', 'Liquidaciones', 'Sueldos automatizados'], ['04', 'Reportes', 'Información del personal']],
      ctas: [{ label: 'Consultar', href: '#contacto' }]
    },
    {
      group: 0, name: 'Salvatierra', year: '2025', media: IMG + 'salvatierra.jpg',
      title: 'Asistente comercial con IA',
      desc: 'Para una startup de adaptógenos: acompaña a cada cliente de la duda a la compra.',
      rows: [['CLIENTE', 'Startup de adaptógenos'], ['TIPO', 'Asistente de ventas'], ['CANAL', 'Web']],
      items: [['01', 'Elección', 'Guía según cada cliente'], ['02', 'Dudas', 'Responde al instante'], ['03', 'Compra', 'Acompaña hasta el final']],
      ctas: [{ label: 'Consultar', href: '#contacto' }]
    },
    {
      group: 1, name: 'LMASM Deco', year: '2026', media: IMG + 'lmasm.jpg',
      title: 'E-commerce + asesor con RA',
      desc: 'Cortinas a medida para una fábrica de Villa Carlos Paz, con un asesor que mide la ventana con el celular.',
      rows: [['RESPUESTA', '−60% tiempo'], ['VENTAS', '+40% conversiones'], ['SITIO', 'lmasm.com']],
      items: [['$', 'Cotizador', 'Precio automático + PDF'], ['MP', 'Mercado Pago', 'Pago online'], ['WA', 'WhatsApp', 'Pedidos directos'], ['AR', 'Asesor con RA', 'Mide la ventana y recomienda']],
      ctas: [{ label: 'Ver e-commerce', href: 'https://lmasm.com' }, { label: 'Ver asesor RA', href: 'https://lmasmpegau.netlify.app/', secondary: true }]
    },
    {
      group: 1, name: 'HouseGur', year: '2025', logo: IMG + 'logos/housegur.png',
      title: 'Inversión inmobiliaria tokenizada',
      desc: 'Invertí desde €50 en propiedades de Madrid, Valencia y Alicante.',
      rows: [['MERCADO', 'España'], ['DESDE', '€50'], ['EXTRA', 'Asistente IA']],
      items: [['€', 'Inversión', 'Desde €50'], ['01', 'Seguimiento', 'En tiempo real'], ['IA', 'Asistente', 'Acompaña al inversor']],
      ctas: [{ label: 'Consultar', href: '#contacto' }]
    },
    {
      group: 1, name: 'INTBIZ', year: '2024', media: IMG + 'intbiz.jpg',
      title: 'Sitio corporativo bilingüe',
      desc: 'Para una consultora de negocios e IA con clientes como Coca-Cola, TN y Luigi Bosca.',
      rows: [['CLIENTE', 'INTBIZ'], ['IDIOMAS', 'Español · Inglés'], ['AÑO', '2024']],
      items: [['ES', 'Bilingüe', 'Español e inglés'], ['API', 'Integraciones', 'Procesos automatizados'], ['01', 'Responsive', 'Para todas las pantallas']],
      ctas: [{ label: 'Consultar', href: '#contacto' }]
    }
  ];
  var GROUPS = ['AI Engineer', 'Full Stack'];

  /* pantalla del monitor dentro del video del escritorio (fracciones del cuadro) */
  var MONITOR = { x: 0.4906, y: 0.114, w: 0.117, h: 0.205 };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function mountMerged(qsLayout, qsVideoWrap) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var n = PROJECTS.length;
    var activeIndex = -1;
    var stage = { count: n, goTo: null };

    var layer = document.createElement('div');
    layer.className = 'stack-layer proj-layer stack-layout js-pinned';
    var title = document.createElement('h2');
    title.className = 'quien-soy__title';
    title.textContent = 'Proyectos';
    layer.appendChild(title);

    /* marco central: una imagen por proyecto, apiladas */
    var frame = document.createElement('div');
    frame.className = 'proj-frame';
    var mediaEls = PROJECTS.map(function (p) {
      var el;
      if (p.video) {
        el = document.createElement('div');
        el.className = 'proj-frame__media proj-frame__video';
        el.innerHTML =
          '<img class="proj-frame__blur" src="' + p.video + '.jpg" alt="" />' +
          '<video muted loop playsinline preload="metadata" poster="' + p.video + '.jpg">' +
            '<source src="' + p.video + '.webm" type="video/webm" /><source src="' + p.video + '.mp4" type="video/mp4" />' +
          '</video>' +
          '<button type="button" class="proj-sound" aria-pressed="false">Activar sonido</button>';
        var v = el.querySelector('video');
        var btn = el.querySelector('.proj-sound');
        btn.addEventListener('click', function () {
          v.muted = !v.muted;
          btn.setAttribute('aria-pressed', v.muted ? 'false' : 'true');
          btn.textContent = v.muted ? 'Activar sonido' : 'Silenciar';
          if (!v.muted) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        });
        el._video = v;
      } else if (p.media) {
        el = document.createElement('img');
        el.src = p.media;
        el.alt = p.name;
        el.loading = 'lazy';
        el.className = 'proj-frame__media';
      } else {
        el = document.createElement('div');
        el.className = 'proj-frame__media proj-frame__logo';
        el.innerHTML = '<img src="' + p.logo + '" alt="' + p.name + '" />';
      }
      frame.appendChild(el);
      return el;
    });
    layer.appendChild(frame);

    var colLeft = document.createElement('div');
    colLeft.className = 'quien-soy__col stack-col';
    var colRight = document.createElement('div');
    colRight.className = 'quien-soy__col stack-col';
    layer.appendChild(colLeft);
    layer.appendChild(colRight);

    /* barra de tramos agrupada */
    var progress = document.createElement('div');
    progress.className = 'stack-progress proj-progress';
    var segs = [];
    GROUPS.forEach(function (label, g) {
      var grp = document.createElement('div');
      grp.className = 'proj-progress__group';
      grp.style.flex = PROJECTS.filter(function (p) { return p.group === g; }).length;
      grp.innerHTML = '<span class="proj-progress__label">' + label + '</span><div class="proj-progress__segs"></div>';
      PROJECTS.forEach(function (p, i) {
        if (p.group !== g) return;
        var seg = document.createElement('button');
        seg.type = 'button';
        seg.className = 'stack-progress__seg';
        seg.innerHTML = '<span class="stack-progress__bar"><i></i></span><span class="stack-progress__label">' + p.name + '</span>';
        seg.addEventListener('click', function () { if (stage.goTo) stage.goTo(i); });
        grp.lastChild.appendChild(seg);
        segs[i] = seg;
      });
      progress.appendChild(grp);
    });
    layer.appendChild(progress);
    qsLayout.appendChild(layer);

    function swap(col, html, fromX) {
      col.querySelectorAll('.stack-swap').forEach(function (old) {
        old.classList.add('is-out');
        setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 400);
      });
      var box = document.createElement('div');
      box.className = 'stack-swap is-pre';
      box.innerHTML = html;
      box.querySelectorAll('[data-step]').forEach(function (el, i) {
        el.style.setProperty('--from-x', fromX + 'px');
        el.style.transitionDelay = (reduced ? 0 : i * 60) + 'ms';
      });
      col.appendChild(box);
      requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.remove('is-pre'); }); });
    }

    function setActive(idx) {
      if (idx === activeIndex) return;
      var forward = idx > activeIndex;
      activeIndex = idx;
      var p = PROJECTS[idx];
      var num = (idx < 9 ? '0' : '') + (idx + 1);
      swap(colLeft,
        '<div class="quien-soy__head" data-step><span class="quien-soy__num">' + num + '</span><h3>' + p.name + '</h3></div>' +
        '<div class="quien-soy__bio-card" data-step><p><strong class="proj-bio-title">' + p.title + '</strong>' + p.desc + '</p></div>' +
        p.rows.map(function (r) {
          return '<div class="quien-soy__data-card" data-step><span class="quien-soy__data-label">' + r[0] + '</span><span class="quien-soy__data-value">' + r[1] + '</span></div>';
        }).join(''),
        forward ? -60 : 60);
      swap(colRight,
        '<div class="quien-soy__head" data-step><span class="quien-soy__num">' + num + '</span><h3>Qué incluye</h3></div>' +
        p.items.map(function (it) {
          return '<div class="quien-soy__row" data-step><span class="quien-soy__row-logo stack-notif__logo">' + it[0] + '</span>' +
            '<span class="quien-soy__row-body"><span class="quien-soy__row-title">' + it[1] + '</span><span class="quien-soy__row-place">' + it[2] + '</span></span>' +
            '<span class="quien-soy__row-date">' + p.year + '</span></div>';
        }).join('') +
        '<div class="proj-ctas" data-step>' + p.ctas.map(function (c) {
          var ext = /^https?:\/\//.test(c.href);
          return '<a class="proj-cta' + (c.secondary ? ' proj-cta--ghost' : '') + '" href="' + c.href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + c.label + ' ↗</a>';
        }).join('') + '</div>',
        forward ? 60 : -60);
      mediaEls.forEach(function (el, i) { el.classList.toggle('is-on', i === idx); });
      playActive();
      segs.forEach(function (seg, i) { seg.classList.toggle('is-active', i === idx); });
    }

    /* el video suena/corre solo si es el proyecto visible */
    var visible = false;
    function playActive() {
      mediaEls.forEach(function (el, i) {
        if (!el._video) return;
        var v = el._video;
        if (i === activeIndex && visible) {
          var pr = v.play();
          if (pr && pr.catch) pr.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }

    /* z: 0..1 zoom al monitor. pos: 0..n proyectos. */
    function apply(z, pos) {
      var e = z < 0.5 ? 4 * z * z * z : 1 - Math.pow(-2 * z + 2, 3) / 2;
      var lr = qsLayout.getBoundingClientRect();
      var vr = qsVideoWrap.getBoundingClientRect();
      /* la pantalla del monitor crece con el zoom del video (1 + 6e) desde su centro */
      var grow = 1 + e * 6;
      var mw = vr.width * MONITOR.w * grow, mh = vr.height * MONITOR.h * grow;
      var mcx = vr.left - lr.left + vr.width * (MONITOR.x + MONITOR.w / 2);
      var mcy = vr.top - lr.top + vr.height * (MONITOR.y + MONITOR.h / 2);
      var mon = { x: mcx - mw / 2, y: mcy - mh / 2, w: mw, h: mh };
      var fw = Math.min(lr.width - 2 * 520, 900);
      var fh = fw * 9 / 16;
      var fin = { x: (lr.width - fw) / 2, y: 150 + (lr.height - 250 - fh) / 2, w: fw, h: fh };
      frame.style.left = lerp(mon.x, fin.x, e) + 'px';
      frame.style.top = lerp(mon.y, fin.y, e) + 'px';
      frame.style.width = lerp(mon.w, fin.w, e) + 'px';
      frame.style.height = lerp(mon.h, fin.h, e) + 'px';
      frame.style.borderRadius = lerp(4, 22, e) + 'px';
      frame.style.opacity = clamp((e - 0.1) / 0.3, 0, 1);

      var show = clamp((e - 0.5) * 2, 0, 1); /* columnas, título y barra entran al final del zoom */
      layer.style.setProperty('--pfade', show);
      layer.style.pointerEvents = show > 0.6 ? 'auto' : 'none';
      title.style.transform = 'translateY(' + ((1 - show) * 30) + 'px)';

      var nowVisible = z > 0.35 && pos < n;
      pos = clamp(pos, 0, n - 0.001);
      if (z > 0.35) setActive(Math.floor(pos));
      if (nowVisible !== visible) { visible = nowVisible; playActive(); }
      segs.forEach(function (seg, i) {
        seg.querySelector('i').style.transform = 'scaleX(' + clamp(pos - i, 0, 1) + ')';
      });
      return e;
    }

    stage.apply = apply;
    stage.hide = function () { if (visible) { visible = false; playActive(); } };
    stage.layer = layer;
    stage.indexOf = function (name) {
      for (var i = 0; i < n; i++) if (PROJECTS[i].name === name) return i;
      return 0;
    };
    apply(0, 0);
    return stage;
  }

  window.ProyectosStage = { mountMerged: mountMerged };
})();
