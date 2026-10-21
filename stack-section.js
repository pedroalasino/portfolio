/* ============================================================
   STACK (CONOCIMIENTOS Y HABILIDADES) — una sola tarjeta.
   En desktop la sección queda fija y el scroll recorre las 5
   categorías: cambia el contenido y los videos se funden entre sí.
   En pantallas chicas se cambia con las pestañas.
   ============================================================ */
(function () {
  var ICON_BASE = 'img/icons/'; /* logos self-hosted (simple-icons 13.21) */
  var FORCE_WHITE = { nextdotjs: 1, express: 1, vercel: 1, github: 1, ollama: 1, railway: 1 };
  var VIDEO_BASE = 'img/stack/'; /* <video>.webm / .mp4 / .jpg (poster) */
  var FADE = 0.15; /* mitad del tramo (en categorías) en que se funden dos videos */

  var CATS = [
    {
      num: '01', video: '01_ia', smallTitle: 'Inteligencia artificial', tab: 'IA', largeTitle: 'Inteligencia<br>artificial',
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
      num: '02', video: '02_backend', smallTitle: 'Backend', tab: 'Backend', largeTitle: 'Backend',
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
      num: '03', video: '03_frontend', smallTitle: 'Frontend', tab: 'Frontend', largeTitle: 'Frontend',
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
      num: '04', video: '04_datos', smallTitle: 'Datos', tab: 'Datos', largeTitle: 'Datos',
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
      num: '05', video: '05_deploy', smallTitle: 'Deploy', tab: 'Deploy', largeTitle: 'Deploy y<br>herramientas',
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
    var stage = document.getElementById('stack-stage');
    var titleEl = document.getElementById('stack-title');
    if (!section || !stage || !titleEl) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pinned = !!(window.gsap && window.ScrollTrigger) && window.innerWidth >= 1200 && !reduced;
    var n = CATS.length;
    var activeIndex = -1;
    var inView = false;
    var scrollTrig = null;

    /* ---------------- título: entrada palabra por palabra ---------------- */
    (function setupTitle() {
      var words = titleEl.textContent.trim().split(/\s+/);
      titleEl.innerHTML = '';
      words.forEach(function (w, i) {
        var wrap = document.createElement('span');
        wrap.className = 'fx-word-wrap';
        var word = document.createElement('span');
        word.className = 'fx-word';
        word.textContent = w + (i < words.length - 1 ? ' ' : '');
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

    /* ---------------- pestañas (también marcan el avance) ---------------- */
    var tabs = document.createElement('div');
    tabs.className = 'stack-tabs';
    tabs.setAttribute('role', 'tablist');
    var tabEls = [];
    var fillEls = [];
    CATS.forEach(function (cat, i) {
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'stack-tab';
      tab.setAttribute('role', 'tab');
      tab.innerHTML =
        '<span class="stack-tab__num">' + cat.num + '</span>' +
        '<span class="stack-tab__label">' + cat.tab + '</span>' +
        '<span class="stack-tab__bar"><span class="stack-tab__fill"></span></span>';
      tab.addEventListener('click', function () { goTo(i); });
      tabs.appendChild(tab);
      tabEls.push(tab);
      fillEls.push(tab.querySelector('.stack-tab__fill'));
    });

    /* ---------------- tarjeta: contenido + videos apilados ---------------- */
    var panel = document.createElement('div');
    panel.className = 'stack-panel';
    var content = document.createElement('div');
    content.className = 'stack-panel__content';
    content.setAttribute('aria-live', 'polite');
    var media = document.createElement('div');
    media.className = 'stack-panel__media';
    var videos = CATS.map(function (cat, i) {
      var v = document.createElement('video');
      v.className = 'stack-panel__video';
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.preload = i === 0 ? 'auto' : 'metadata';
      v.poster = VIDEO_BASE + cat.video + '.jpg';
      v.innerHTML =
        '<source src="' + VIDEO_BASE + cat.video + '.webm" type="video/webm" />' +
        '<source src="' + VIDEO_BASE + cat.video + '.mp4" type="video/mp4" />';
      v.style.opacity = i === 0 ? 1 : 0;
      media.appendChild(v);
      return v;
    });
    panel.appendChild(content);
    panel.appendChild(media);
    stage.appendChild(tabs);
    stage.appendChild(panel);

    function iconRow(cat) {
      var row = document.createElement('div');
      row.className = 'stack-panel__logos';
      cat.logos.forEach(function (logo) {
        if (logo.text) {
          row.appendChild(makeIcon(logo, 19));
        } else {
          var sq = document.createElement('span');
          sq.className = 'stack-icon-sq';
          sq.appendChild(makeIcon(logo, 19));
          row.appendChild(sq);
        }
      });
      return row;
    }

    /* el contenido sale hacia arriba y el nuevo entra desde abajo, en cascada */
    function renderContent(idx, dir) {
      var cat = CATS[idx];
      var old = content.querySelectorAll('.stack-panel__inner');
      old.forEach(function (el) {
        el.classList.add(dir < 0 ? 'is-out-down' : 'is-out');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
      });

      var inner = document.createElement('div');
      inner.className = 'stack-panel__inner ' + (dir < 0 ? 'is-pre-up' : 'is-pre');
      inner.innerHTML =
        '<span class="stack-panel__num" data-step>' + cat.num + ' / 0' + n + '</span>' +
        '<h3 class="stack-panel__title" data-step>' + cat.largeTitle + '</h3>' +
        '<p class="stack-panel__summary" data-step>' + cat.summary + '</p>';
      var list = document.createElement('ul');
      list.className = 'stack-row-list';
      cat.list.forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'stack-row';
        li.setAttribute('data-step', '');
        li.innerHTML = '<span class="stack-row__text">' + item.text + '</span><span class="stack-row__tag">' + item.tag + '</span>';
        list.appendChild(li);
      });
      inner.appendChild(list);
      var logos = iconRow(cat);
      logos.setAttribute('data-step', '');
      inner.appendChild(logos);
      inner.querySelectorAll('[data-step]').forEach(function (el, i) {
        el.style.transitionDelay = (reduced ? 0 : 60 + i * 45) + 'ms';
      });
      content.appendChild(inner);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { inner.classList.remove('is-pre', 'is-pre-up'); });
      });
    }

    function setActive(idx) {
      if (idx === activeIndex) return;
      var dir = activeIndex < 0 ? 1 : (idx > activeIndex ? 1 : -1);
      activeIndex = idx;
      renderContent(idx, dir);
      tabEls.forEach(function (tab, i) {
        tab.classList.toggle('is-active', i === idx);
        tab.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
    }

    /* opacidad de cada video según la posición (en categorías: 0..n) */
    function setVideos(pos) {
      videos.forEach(function (v, i) {
        var a = i === 0 ? 1 : clamp((pos - i + FADE) / (2 * FADE), 0, 1);
        var b = i === n - 1 ? 1 : clamp((i + 1 - pos + FADE) / (2 * FADE), 0, 1);
        var o = a * b;
        v.style.opacity = o;
        v.style.transform = 'scale(' + (1 + (1 - o) * 0.04) + ')';
        if (o > 0 && inView && !reduced) {
          if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        } else if (!v.paused) {
          v.pause();
        }
      });
    }

    var lastPos = 0;
    function apply(pos) {
      lastPos = pos;
      setActive(Math.min(n - 1, Math.floor(pos)));
      setVideos(pos);
      fillEls.forEach(function (fill, i) {
        fill.style.transform = 'scaleX(' + (pinned ? clamp(pos - i, 0, 1) : (i === activeIndex ? 1 : 0)) + ')';
      });
    }

    function goTo(idx) {
      if (scrollTrig) {
        var y = scrollTrig.start + (scrollTrig.end - scrollTrig.start) * ((idx + 0.5) / n);
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        apply(idx + 0.5);
      }
    }

    /* ---------------- videos solo con la sección en pantalla ---------------- */
    var visObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting;
        setVideos(lastPos);
      });
    }, { threshold: 0.05 });
    visObserver.observe(section);

    /* ---------------- desktop: sección fija + scroll recorre las categorías ---------------- */
    if (pinned) {
      gsap.registerPlugin(ScrollTrigger);
      section.classList.add('is-pinned');

      /* la tarjeta se despliega (bisagra arriba) mientras la sección entra */
      gsap.fromTo(panel,
        { opacity: 0, rotateX: -70, y: 40, transformOrigin: '50% 0' },
        { opacity: 1, rotateX: 0, y: 0, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 85%', end: 'top top', scrub: true } });

      scrollTrig = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * n * 0.8); },
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: function (self) { apply(Math.min(self.progress * n, n - 0.001)); }
      });
      apply(Math.min(scrollTrig.progress * n, n - 0.001));
    } else {
      apply(0.5);
      var enterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          panel.classList.add('is-in');
          enterObserver.disconnect();
        });
      }, { threshold: 0.15 });
      enterObserver.observe(panel);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
