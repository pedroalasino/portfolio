/* ============================================================
   STACK (CONOCIMIENTOS Y HABILIDADES) — bento grid con FLIP
   (GSAP Flip) y visualización de órbita 3D por categoría.
   ============================================================ */
(function () {
  var ICON_BASE = 'img/icons/'; /* logos self-hosted (simple-icons 13.21) */
  var FORCE_WHITE = { nextdotjs: 1, express: 1, vercel: 1, github: 1, ollama: 1, railway: 1 };

  var CATS = [
    {
      num: '01', smallTitle: 'Inteligencia artificial', largeTitle: 'Inteligencia<br>artificial',
      orbitLabel: 'Agentes',
      summary: 'Agentes y asistentes que razonan, recuerdan y responden con datos propios.',
      list: [
        { text: 'Agentes autónomos y multi-agente', tag: 'AGENTS' },
        { text: 'RAG avanzado con evaluación', tag: 'RAG' },
        { text: 'Servidores MCP y tool calling', tag: 'MCP' },
        { text: 'Voz e IA local y privada', tag: 'VOICE' }
      ],
      logos: [
        { slug: 'python', name: 'Python', color: '#3776AB' },
        { slug: 'langchain', name: 'LangChain', color: '#1C3C3C' },
        { slug: 'openai', name: 'OpenAI', color: '#412991' },
        { slug: 'meta', name: 'LLaMA 3', color: '#0866FF' },
        { slug: 'ollama', name: 'Ollama', color: '#fff' },
        { slug: 'pydantic', name: 'Pydantic', color: '#E92063' }
      ]
    },
    {
      num: '02', smallTitle: 'Backend', largeTitle: 'Backend',
      orbitLabel: 'API',
      summary: 'APIs REST, validación, testing, auth e integraciones.',
      list: [
        { text: 'APIs REST con Node.js, Express y FastAPI', tag: 'REST' },
        { text: 'Validación y manejo de errores', tag: 'ZOD' },
        { text: 'Testing unitario', tag: 'TEST' },
        { text: 'Autenticación, roles e integraciones', tag: 'AUTH' }
      ],
      logos: [
        { slug: 'nodedotjs', name: 'Node.js', color: '#339933' },
        { slug: 'express', name: 'Express', color: '#fff' },
        { slug: 'fastapi', name: 'FastAPI', color: '#009688' },
        { slug: 'typescript', name: 'TypeScript', color: '#3178C6' },
        { slug: 'zod', name: 'Zod', color: '#3E67B1' },
        { slug: 'openapiinitiative', name: 'OpenAPI', color: '#6BA539' }
      ]
    },
    {
      num: '03', smallTitle: 'Frontend', largeTitle: 'Frontend',
      orbitLabel: 'UI',
      summary: 'React + TypeScript, e-commerce, 3D y realidad aumentada.',
      list: [
        { text: 'Aplicaciones en React con TypeScript', tag: 'REACT' },
        { text: 'E-commerce con panel de administración', tag: 'SHOP' },
        { text: 'Interfaces conectadas a IA', tag: 'AI UI' },
        { text: 'Experiencias 3D y realidad aumentada', tag: '3D · AR' }
      ],
      logos: [
        { slug: 'react', name: 'React', color: '#61DAFB' },
        { slug: 'nextdotjs', name: 'Next.js', color: '#fff' },
        { slug: 'vite', name: 'Vite', color: '#646CFF' },
        { slug: 'tailwindcss', name: 'TailwindCSS', color: '#06B6D4' },
        { slug: 'typescript', name: 'TypeScript', color: '#3178C6' },
        { name: 'Spline', text: true },
        { name: '8th Wall', text: true }
      ]
    },
    {
      num: '04', smallTitle: 'Datos', largeTitle: 'Datos',
      orbitLabel: 'Data',
      summary: 'SQL, NoSQL y bases vectoriales para IA.',
      list: [
        { text: 'Bases relacionales: diseño, SQL y CRUD', tag: 'SQL' },
        { text: 'Bases no relacionales', tag: 'NOSQL' },
        { text: 'Bases vectoriales para IA', tag: 'VECTOR' },
        { text: 'Análisis de datos y reportes', tag: 'BI' }
      ],
      logos: [
        { slug: 'postgresql', name: 'PostgreSQL', color: '#4169E1' },
        { slug: 'mysql', name: 'MySQL', color: '#4479A1' },
        { slug: 'mongodb', name: 'MongoDB', color: '#47A248' },
        { slug: 'firebase', name: 'Firebase', color: '#FFCA28' },
        { slug: 'meta', name: 'FAISS', color: '#0866FF' },
        { name: 'Qdrant', text: true }
      ]
    },
    {
      num: '05', smallTitle: 'Deploy', largeTitle: 'Deploy y<br>herramientas',
      orbitLabel: 'Ship',
      summary: 'Git, cloud, serverless y desarrollo asistido por IA.',
      list: [
        { text: 'Git y GitHub', tag: 'GIT' },
        { text: 'Deploy en la nube y serverless', tag: 'CLOUD' },
        { text: 'Desarrollo asistido por IA', tag: 'AI DEV' },
        { text: 'Observabilidad de sistemas de IA', tag: 'OBS' }
      ],
      logos: [
        { slug: 'git', name: 'Git', color: '#F05032' },
        { slug: 'github', name: 'GitHub', color: '#fff' },
        { slug: 'vercel', name: 'Vercel', color: '#fff' },
        { slug: 'railway', name: 'Railway', color: '#fff' },
        { slug: 'awsamplify', name: 'AWS Amplify', color: '#FF9900' },
        { slug: 'netlify', name: 'Netlify', color: '#00C7B7' }
      ]
    }
  ];

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function makeIcon(logo, size) {
    if (logo.text) {
      var chip = document.createElement('span');
      chip.className = 'stack-chip';
      chip.textContent = logo.name;
      return chip;
    }
    var span = document.createElement('span');
    span.className = 'stack-icon';
    span.style.width = size + 'px';
    span.style.height = size + 'px';
    var url = ICON_BASE + logo.slug + '.svg';
    span.style.webkitMaskImage = 'url(' + url + ')';
    span.style.maskImage = 'url(' + url + ')';
    var color = FORCE_WHITE[logo.slug] ? '#fff' : (logo.color || '#fff');
    span.style.setProperty('--icon-color', color);
    span.title = logo.name;
    return span;
  }

  function init() {
    var section = document.getElementById('habilidades');
    var grid = document.getElementById('stack-grid');
    var titleEl = document.getElementById('stack-title');
    if (!section || !grid || !titleEl) return;

    var hasGsap = !!(window.gsap && window.Flip);
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var activeIndex = 0;
    var cardEls = [];
    var orbitState = null; /* { cat, nodeEls, lineEls, angles, raf-managed via global ticker } */

    /* ---------------- título: entrada palabra por palabra ---------------- */
    (function setupTitle() {
      var words = titleEl.textContent.trim().split(/\s+/);
      titleEl.innerHTML = '';
      words.forEach(function (w, i) {
        var wrap = document.createElement('span');
        wrap.className = 'fx-word-wrap';
        var word = document.createElement('span');
        word.className = 'fx-word';
        word.textContent = w + (i < words.length - 1 ? ' ' : '');
        word.style.transform = reduced ? 'none' : 'translateY(105%) rotateX(-70deg)';
        word.style.transition = 'transform .9s cubic-bezier(.2,.8,.2,1)';
        word.style.transitionDelay = (i * 70) + 'ms';
        wrap.appendChild(word);
        titleEl.appendChild(wrap);
      });
    })();

    var titleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          titleEl.querySelectorAll('.fx-word').forEach(function (w) { w.style.transform = 'translateY(0) rotateX(0deg)'; });
          titleObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    titleObserver.observe(titleEl);

    /* ---------------- construcción de tarjetas ---------------- */
    function buildSmallContent(card, cat) {
      card.innerHTML = '';
      var plus = document.createElement('span');
      plus.className = 'stack-card__plus';
      plus.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
      card.appendChild(plus);

      var small = document.createElement('div');
      small.className = 'stack-card__small';
      small.innerHTML =
        '<span class="stack-card__num">' + cat.num + '</span>' +
        '<h3 class="stack-card__small-title">' + cat.smallTitle + '</h3>' +
        '<p class="stack-card__small-summary">' + cat.summary + '</p>';
      card.appendChild(small);

      var iconRow = document.createElement('div');
      iconRow.className = 'stack-card__icon-row';
      cat.logos.forEach(function (logo) {
        if (logo.text) {
          iconRow.appendChild(makeIcon(logo, 19));
        } else {
          var sq = document.createElement('span');
          sq.className = 'stack-icon-sq';
          sq.appendChild(makeIcon(logo, 19));
          iconRow.appendChild(sq);
        }
      });
      card.appendChild(iconRow);
    }

    function buildLargeContent(card, cat) {
      card.innerHTML = '';
      var large = document.createElement('div');
      large.className = 'stack-card__large';

      var left = document.createElement('div');
      left.className = 'stack-card__large-left';
      left.innerHTML =
        '<span class="stack-card__num">' + cat.num + '</span>' +
        '<h3 class="stack-card__large-title">' + cat.largeTitle + '</h3>' +
        '<p class="stack-card__large-summary">' + cat.summary + '</p>';

      var rowList = document.createElement('ul');
      rowList.className = 'stack-row-list';
      cat.list.forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'stack-row';
        li.innerHTML = '<span class="stack-row__text">' + item.text + '</span><span class="stack-row__tag">' + item.tag + '</span>';
        rowList.appendChild(li);
      });
      left.appendChild(rowList);

      var orbitWrap = document.createElement('div');
      orbitWrap.className = 'stack-orbit';
      orbitWrap.innerHTML =
        '<div class="stack-orbit__ring"></div>' +
        '<div class="stack-orbit__core">' + cat.orbitLabel + '</div>';

      large.appendChild(left);
      large.appendChild(orbitWrap);
      card.appendChild(large);

      /* líneas + nodos */
      var nodeEls = [];
      var lineEls = [];
      cat.logos.filter(function (l) { return !l.text; }).forEach(function (logo) {
        var line = document.createElement('div');
        line.className = 'stack-orbit__line';
        orbitWrap.appendChild(line);
        lineEls.push(line);

        var node = document.createElement('div');
        node.className = 'stack-orbit__node';
        node.appendChild(makeIcon(logo, 24));
        var tip = document.createElement('span');
        tip.className = 'stack-orbit__tooltip';
        tip.textContent = logo.name;
        node.appendChild(tip);
        orbitWrap.appendChild(node);
        nodeEls.push(node);
      });

      /* entrada escalonada de filas */
      var rows = rowList.querySelectorAll('.stack-row');
      rows.forEach(function (row, i) {
        setTimeout(function () { row.classList.add('is-in'); }, reduced ? 0 : i * 80);
      });

      orbitState = {
        cat: cat, wrap: orbitWrap, nodeEls: nodeEls, lineEls: lineEls,
        tilt: 0.42, tiltTarget: 0.42, spin: 1, spinTarget: 1,
        angle: 0, openStart: performance.now(), openDur: reduced ? 0 : 900,
        hoverTilt: null, hoverSpin: null,
        mouseX: null, mouseY: null
      };
      requestAnimationFrame(function () { orbitWrap.classList.add('is-in'); });
      attachOrbitInteraction(orbitWrap);
    }

    function computeOrderedSmallSlots(activeIdx) {
      var slots = [
        { col: '3 / 4', row: '1 / 2' },
        { col: '4 / 5', row: '1 / 2' },
        { col: '3 / 4', row: '2 / 3' },
        { col: '4 / 5', row: '2 / 3' }
      ];
      var others = [];
      for (var i = 0; i < CATS.length; i++) { if (i !== activeIdx) others.push(i); }
      var map = {};
      others.forEach(function (catIdx, slotIdx) { map[catIdx] = slots[slotIdx]; });
      return map;
    }

    function layoutCards(activeIdx, animate) {
      var isDesktop = window.innerWidth >= 1200;
      var slotMap = computeOrderedSmallSlots(activeIdx);

      var state = (hasGsap && animate && !reduced) ? window.Flip.getState(cardEls) : null;

      cardEls.forEach(function (card, i) {
        var isActive = i === activeIdx;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        card.style.order = isActive ? -1 : i;

        if (isDesktop) {
          if (isActive) {
            card.style.gridColumn = '1 / 3';
            card.style.gridRow = '1 / 3';
          } else {
            card.style.gridColumn = slotMap[i].col;
            card.style.gridRow = slotMap[i].row;
          }
        } else {
          card.style.gridColumn = '';
          card.style.gridRow = '';
        }

        if (isActive) {
          buildLargeContent(card, CATS[i]);
        } else {
          buildSmallContent(card, CATS[i]);
        }
      });

      if (state) {
        window.Flip.from(state, {
          duration: 0.75,
          ease: 'power2.inOut',
          absolute: true,
          onEnter: function (els) { return gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.25, delay: 0.5 }); },
          onLeave: function (els) { return gsap.to(els, { opacity: 0, duration: 0.15 }); }
        });
      }
    }

    function openCategory(idx) {
      if (idx === activeIndex) return;
      activeIndex = idx;
      layoutCards(activeIndex, true);
    }

    /* ---------------- construir tarjetas (DOM inicial) ---------------- */
    CATS.forEach(function (cat, i) {
      var card = document.createElement('div');
      card.className = 'stack-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      card.dataset.index = i;

      card.addEventListener('click', function () { openCategory(i); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCategory(i); }
      });

      if (!reduced) attachCardTilt(card, i === 0);

      grid.appendChild(card);
      cardEls.push(card);
    });

    layoutCards(0, false);

    /* entrada en cascada de tarjetas */
    var cascadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var ordered = [cardEls[0]].concat(cardEls.slice(1));
        ordered.forEach(function (card, i) {
          setTimeout(function () { card.classList.add('is-in'); }, reduced ? 0 : i * 110);
        });
        cascadeObserver.disconnect();
      });
    }, { threshold: 0.15 });
    cascadeObserver.observe(grid);

    /* ---------------- spotlight (cursor sobre el borde/fondo) ---------------- */
    grid.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.stack-card') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });

    /* ---------------- tilt 3D en tarjetas ---------------- */
    function attachCardTilt(card, isActiveCard) {
      card.addEventListener('pointermove', function (e) {
        var max = card.classList.contains('is-active') ? 6 : 10;
        var dur = card.classList.contains('is-active') ? '120ms' : '100ms';
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = 'transform ' + dur;
        card.style.transform = 'translateY(' + (card.classList.contains('is-active') ? 0 : -4) + 'px) rotateX(' + (-py * max) + 'deg) rotateY(' + (px * max) + 'deg)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transition = 'transform .5s cubic-bezier(.2,.75,.2,1)';
        card.style.transform = '';
      });
    }

    /* ---------------- botón "+" magnético ---------------- */
    grid.addEventListener('pointermove', function (e) {
      var plus = e.target.closest ? e.target.closest('.stack-card__plus') : null;
      grid.querySelectorAll('.stack-card__plus').forEach(function (btn) {
        if (btn === plus) return;
        btn.style.transform = '';
      });
      if (!plus) return;
      var r = plus.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        plus.style.transition = 'transform 150ms ease';
        plus.style.transform = 'translate(' + (dx * 0.35) + 'px,' + (dy * 0.35) + 'px)';
      }
    });
    grid.addEventListener('pointerleave', function () {
      grid.querySelectorAll('.stack-card__plus').forEach(function (btn) { btn.style.transform = ''; });
    }, true);

    /* ---------------- órbita: interacción + loop ---------------- */
    function attachOrbitInteraction(orbitWrap) {
      if (reduced) return;
      orbitWrap.addEventListener('pointermove', function (e) {
        if (!orbitState) return;
        var r = orbitWrap.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var px = clamp((e.clientX - cx) / (r.width / 2), -1, 1);
        var py = clamp((e.clientY - cy) / (r.height / 2), -1, 1);
        orbitState.tiltTarget = 0.42 + py * -0.6;
        orbitState.spinTarget = px * 4.5 || 0.01;
        orbitState.mouseX = e.clientX;
        orbitState.mouseY = e.clientY;
      });
      orbitWrap.addEventListener('pointerleave', function () {
        if (!orbitState) return;
        orbitState.tiltTarget = 0.42;
        orbitState.spinTarget = 1;
        orbitState.mouseX = null;
        orbitState.mouseY = null;
      });
    }

    var R = 175;
    function tickOrbit(dt) {
      if (!orbitState) return;
      var st = orbitState;
      st.tilt = lerp(st.tilt, st.tiltTarget, 0.18);
      st.spin = lerp(st.spin, st.spinTarget, 0.15);
      st.angle += 0.0012 * st.spin * dt;

      var elapsed = performance.now() - st.openStart;
      var openT = st.openDur ? clamp(elapsed / st.openDur, 0, 1) : 1;
      var openEase = 1 - Math.pow(1 - openT, 3);
      var radius = R * openEase;
      var squash = Math.sin(st.tilt);

      var r = st.wrap.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;

      var n = st.nodeEls.length;
      for (var i = 0; i < n; i++) {
        var ang = st.angle + (i * (Math.PI * 2 / n));
        var bx = Math.cos(ang) * radius;
        var by = Math.sin(ang) * radius * squash;
        var depth = Math.sin(ang);
        var depthT = (depth + 1) / 2;
        var scale = lerp(0.55, lerp(0.8, 1.2, depthT), openEase);
        var opacity = lerp(0.55, 1, depthT);
        var zIndex = Math.round(depthT * 50) + 10;

        var fx = bx, fy = by, fScale = scale, fOpacity = opacity, fZ = zIndex, border = '';
        if (st.mouseX != null) {
          var nodeX = cx + bx, nodeY = cy + by;
          var dx = st.mouseX - nodeX, dy = st.mouseY - nodeY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            var closeness = 1 - dist / 110;
            fx = bx + dx * 0.35 * closeness;
            fy = by + dy * 0.35 * closeness;
            fScale = lerp(scale, 1.45, closeness);
            fOpacity = 1;
            fZ = 999;
            border = '#666';
          }
        }

        var node = st.nodeEls[i];
        node.style.transform = 'translate3d(' + fx + 'px,' + fy + 'px,0) scale(' + fScale + ')';
        node.style.opacity = fOpacity;
        node.style.zIndex = fZ;
        node.style.borderColor = border || '#2a2a2a';

        var line = st.lineEls[i];
        var length = Math.sqrt(bx * bx + by * by);
        var lineAngle = Math.atan2(by, bx);
        line.style.width = length + 'px';
        line.style.transform = 'rotate(' + lineAngle + 'rad)';
        line.style.opacity = lerp(0.06, 0.16, depthT);
      }
    }

    /* ---------------- loop único + pausa fuera de pantalla ---------------- */
    var rafId = null;
    var lastTs = 0;
    function loop(ts) {
      var dt = lastTs ? Math.min(50, ts - lastTs) : 16;
      lastTs = ts;
      if (!reduced) tickOrbit(dt);
      rafId = requestAnimationFrame(loop);
    }
    var visObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!rafId) { lastTs = 0; rafId = requestAnimationFrame(loop); }
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0.05 });
    visObserver.observe(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
