/* ============================================================
   STACK (CONOCIMIENTOS Y HABILIDADES) — bento grid con FLIP
   (GSAP Flip) y un video por categoría en la tarjeta abierta.
   ============================================================ */
(function () {
  var ICON_BASE = 'img/icons/'; /* logos self-hosted (simple-icons 13.21) */
  var FORCE_WHITE = { nextdotjs: 1, express: 1, vercel: 1, github: 1, ollama: 1, railway: 1 };
  var VIDEO_BASE = 'img/stack/'; /* <video>.webm / .mp4 / .jpg (poster) */

  var CATS = [
    {
      num: '01', video: '01_ia', smallTitle: 'Inteligencia artificial', largeTitle: 'Inteligencia<br>artificial',
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
      num: '02', video: '02_backend', smallTitle: 'Backend', largeTitle: 'Backend',
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
      num: '03', video: '03_frontend', smallTitle: 'Frontend', largeTitle: 'Frontend',
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
      num: '04', video: '04_datos', smallTitle: 'Datos', largeTitle: 'Datos',
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
      num: '05', video: '05_deploy', smallTitle: 'Deploy', largeTitle: 'Deploy y<br>herramientas',
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
    var scrollTrig = null; /* desktop: la sección queda fija y el scroll abre cada tarjeta */
    var afterFlip = null;  /* Flip restaura los estilos inline al terminar: se reaplica el despliegue */

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

      var logoRow = document.createElement('div');
      logoRow.className = 'stack-card__icon-row stack-card__icon-row--inline';
      cat.logos.forEach(function (logo) {
        if (logo.text) {
          logoRow.appendChild(makeIcon(logo, 19));
        } else {
          var sq = document.createElement('span');
          sq.className = 'stack-icon-sq';
          sq.appendChild(makeIcon(logo, 19));
          logoRow.appendChild(sq);
        }
      });
      left.appendChild(logoRow);

      var media = document.createElement('div');
      media.className = 'stack-media';
      media.innerHTML =
        '<video class="stack-media__video" autoplay muted loop playsinline preload="metadata" poster="' + VIDEO_BASE + cat.video + '.jpg">' +
          '<source src="' + VIDEO_BASE + cat.video + '.webm" type="video/webm" />' +
          '<source src="' + VIDEO_BASE + cat.video + '.mp4" type="video/mp4" />' +
        '</video>';

      large.appendChild(left);
      large.appendChild(media);
      card.appendChild(large);

      var video = media.querySelector('video');
      if (reduced) { video.removeAttribute('autoplay'); video.pause(); }

      /* entrada escalonada de filas */
      var rows = rowList.querySelectorAll('.stack-row');
      rows.forEach(function (row, i) {
        setTimeout(function () { row.classList.add('is-in'); }, reduced ? 0 : i * 80);
      });

      requestAnimationFrame(function () { media.classList.add('is-in'); });
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
          onLeave: function (els) { return gsap.to(els, { opacity: 0, duration: 0.15 }); },
          onComplete: function () { if (afterFlip) afterFlip(); }
        });
      }
    }

    function openCategory(idx) {
      if (idx === activeIndex) return;
      activeIndex = idx;
      layoutCards(activeIndex, true);
    }

    /* con la sección fija, el clic baja hasta el tramo de esa tarjeta */
    function goToCategory(idx) {
      if (!scrollTrig) { openCategory(idx); return; }
      var y = scrollTrig.start + (scrollTrig.end - scrollTrig.start) * ((idx + 0.5) / CATS.length);
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    /* ---------------- construir tarjetas (DOM inicial) ---------------- */
    CATS.forEach(function (cat, i) {
      var card = document.createElement('div');
      card.className = 'stack-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      card.dataset.index = i;

      card.addEventListener('click', function () { goToCategory(i); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToCategory(i); }
      });

      if (!reduced) attachCardTilt(card, i === 0);

      grid.appendChild(card);
      cardEls.push(card);
    });

    layoutCards(0, false);

    /* ---------------- scroll: sección fija + una tarjeta por tramo (desktop) ----------------
       Las tarjetas aparecen de a una: cada tramo despliega la siguiente
       (bisagra arriba, sigue al scroll) y la abre en grande. */
    if (hasGsap && window.ScrollTrigger && window.innerWidth >= 1200 && !reduced) {
      gsap.registerPlugin(ScrollTrigger);
      section.classList.add('is-pinned');

      var progress = document.createElement('div');
      progress.className = 'stack-progress';
      var segFills = CATS.map(function () {
        var seg = document.createElement('span');
        seg.className = 'stack-progress__seg';
        var fill = document.createElement('span');
        fill.className = 'stack-progress__fill';
        seg.appendChild(fill);
        progress.appendChild(seg);
        return fill;
      });
      titleEl.parentNode.appendChild(progress);

      /* r: 0 = plegada e invisible, 1 = desplegada */
      function unfold(card, r) {
        var e = 1 - Math.pow(1 - clamp(r, 0, 1), 3);
        card.style.opacity = e;
        card.style.rotate = 'x ' + ((1 - e) * -80) + 'deg';
        card.style.translate = '0 ' + ((1 - e) * 40) + 'px';
        card.style.pointerEvents = e > 0.6 ? '' : 'none';
      }
      cardEls.forEach(function (card) {
        card.classList.add('is-in');
        card.style.transformOrigin = '50% 0';
        unfold(card, 0);
      });

      /* la primera se despliega mientras la sección entra en pantalla */
      var enterTrig = ScrollTrigger.create({
        trigger: section,
        start: 'top 85%',
        end: 'top top',
        onUpdate: function (self) { unfold(cardEls[0], self.progress); }
      });

      var lastStage = 0;
      function unfoldAll() {
        unfold(cardEls[0], enterTrig.progress);
        for (var i = 1; i < CATS.length; i++) unfold(cardEls[i], (lastStage - i) / 0.6);
      }
      afterFlip = unfoldAll;

      function applyProgress(p) {
        var n = CATS.length;
        var stage = lastStage = p * n;
        openCategory(Math.min(n - 1, Math.floor(stage)));
        unfoldAll();
        segFills.forEach(function (fill, i) {
          fill.style.transform = 'scaleX(' + clamp(stage - i, 0, 1) + ')';
        });
      }

      scrollTrig = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * CATS.length * 0.8); },
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: function (self) { applyProgress(self.progress); }
      });
      applyProgress(scrollTrig.progress);
    }

    /* entrada en cascada de tarjetas (sin sección fija) */
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
    if (!scrollTrig) cascadeObserver.observe(grid);

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

    /* ---------------- video: pausa fuera de pantalla ---------------- */
    var visObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = section.querySelector('.stack-media__video');
        if (!video || reduced) return;
        if (entry.isIntersecting) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else video.pause();
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
