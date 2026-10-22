/* ============================================================
   STACK (CONOCIMIENTOS Y HABILIDADES) — mismo formato que Quién soy:
   video central y columnas con tarjetas negras. En desktop la sección
   queda fija y al bajar se recorren las 5 categorías: a la izquierda
   cambia el resumen y a la derecha van saliendo, una por una, las
   notificaciones de cada herramienta. En pantallas chicas se cambia
   de categoría con las pestañas de abajo.
   ============================================================ */
(function () {
  var ICON_BASE = 'img/icons/'; /* logos self-hosted (simple-icons 13.21) */
  var FORCE_WHITE = { nextdotjs: 1, express: 1, vercel: 1, github: 1, ollama: 1, railway: 1 };

  var CATS = [
    {
      num: '01', video: '01_ia', smallTitle: 'Inteligencia artificial', tab: 'IA', largeTitle: 'Inteligencia<br>artificial',
      summary: 'Agentes y asistentes que razonan, recuerdan y responden con datos propios.',
      list: [
        { text: 'Agentes y multi-agente', tag: 'AGENTS' },
        { text: 'RAG avanzado con evaluación', tag: 'RAG' },
        { text: 'Servidores MCP y tools', tag: 'MCP' },
        { text: 'Voz e IA local y privada', tag: 'VOICE' }
      ],
      logos: [
        { slug: 'python', name: 'Python', color: '#3776AB', desc: 'Lenguaje base de la IA' },
        { slug: 'langchain', name: 'LangChain', color: '#1C3C3C', desc: 'Orquestación de LLMs' },
        { slug: 'openai', name: 'OpenAI', color: '#412991', desc: 'Modelos GPT y embeddings' },
        { slug: 'meta', name: 'LLaMA 3', color: '#0866FF', desc: 'Modelos open source' },
        { slug: 'ollama', name: 'Ollama', color: '#fff', desc: 'IA local y privada' },
        { slug: 'pydantic', name: 'Pydantic', color: '#E92063', desc: 'Salidas validadas' }
      ]
    },
    {
      num: '02', video: '02_backend', smallTitle: 'Backend', tab: 'Backend', largeTitle: 'Backend',
      summary: 'APIs REST, validación, testing, auth e integraciones.',
      list: [
        { text: 'APIs REST en Node y Python', tag: 'REST' },
        { text: 'Validación y manejo de errores', tag: 'ZOD' },
        { text: 'Testing unitario', tag: 'TEST' },
        { text: 'Auth, roles e integraciones', tag: 'AUTH' }
      ],
      logos: [
        { slug: 'nodedotjs', name: 'Node.js', color: '#339933', desc: 'Servidores y APIs' },
        { slug: 'express', name: 'Express', color: '#fff', desc: 'APIs REST' },
        { slug: 'fastapi', name: 'FastAPI', color: '#009688', desc: 'APIs en Python' },
        { slug: 'typescript', name: 'TypeScript', color: '#3178C6', desc: 'Código tipado' },
        { slug: 'zod', name: 'Zod', color: '#3E67B1', desc: 'Validación de datos' },
        { slug: 'openapiinitiative', name: 'OpenAPI', color: '#6BA539', desc: 'Documentación de APIs' }
      ]
    },
    {
      num: '03', video: '03_frontend', smallTitle: 'Frontend', tab: 'Frontend', largeTitle: 'Frontend',
      summary: 'React + TypeScript, e-commerce, 3D y realidad aumentada.',
      list: [
        { text: 'Apps en React + TypeScript', tag: 'REACT' },
        { text: 'E-commerce con panel admin', tag: 'SHOP' },
        { text: 'Interfaces conectadas a IA', tag: 'AI UI' },
        { text: '3D y realidad aumentada', tag: '3D · AR' }
      ],
      logos: [
        { slug: 'react', name: 'React', color: '#61DAFB', desc: 'Interfaces con componentes' },
        { slug: 'nextdotjs', name: 'Next.js', color: '#fff', desc: 'Apps React full stack' },
        { slug: 'vite', name: 'Vite', color: '#646CFF', desc: 'Build rápido' },
        { slug: 'tailwindcss', name: 'TailwindCSS', color: '#06B6D4', desc: 'Estilos utilitarios' },
        { name: 'Spline', text: true, short: '3D', desc: 'Experiencias 3D' },
        { name: '8th Wall', text: true, short: 'AR', desc: 'Realidad aumentada' }
      ]
    },
    {
      num: '04', video: '04_datos', smallTitle: 'Datos', tab: 'Datos', largeTitle: 'Datos',
      summary: 'SQL, NoSQL y bases vectoriales para IA.',
      list: [
        { text: 'Diseño de esquemas y SQL', tag: 'SQL' },
        { text: 'Bases no relacionales', tag: 'NOSQL' },
        { text: 'Bases vectoriales para IA', tag: 'VECTOR' },
        { text: 'Análisis de datos y reportes', tag: 'BI' }
      ],
      logos: [
        { slug: 'postgresql', name: 'PostgreSQL', color: '#4169E1', desc: 'Relacional · SQL' },
        { slug: 'mysql', name: 'MySQL', color: '#4479A1', desc: 'Relacional · SQL' },
        { slug: 'mongodb', name: 'MongoDB', color: '#47A248', desc: 'NoSQL · documentos' },
        { slug: 'firebase', name: 'Firebase', color: '#FFCA28', desc: 'Firestore en tiempo real' },
        { slug: 'meta', name: 'FAISS', color: '#0866FF', desc: 'Búsqueda vectorial' },
        { name: 'Qdrant', text: true, short: 'Qd', desc: 'Base vectorial para IA' }
      ]
    },
    {
      num: '05', video: '05_deploy', smallTitle: 'Deploy', tab: 'Deploy', largeTitle: 'Deploy y<br>herramientas',
      summary: 'Git, cloud, serverless y desarrollo asistido por IA.',
      list: [
        { text: 'Git y GitHub', tag: 'GIT' },
        { text: 'Nube y serverless', tag: 'CLOUD' },
        { text: 'Desarrollo asistido por IA', tag: 'AI DEV' },
        { text: 'Observabilidad de IA', tag: 'OBS' }
      ],
      logos: [
        { slug: 'git', name: 'Git', color: '#F05032', desc: 'Control de versiones' },
        { slug: 'github', name: 'GitHub', color: '#fff', desc: 'Repos y colaboración' },
        { slug: 'vercel', name: 'Vercel', color: '#fff', desc: 'Deploy y serverless' },
        { slug: 'railway', name: 'Railway', color: '#fff', desc: 'Deploy de backends' },
        { slug: 'awsamplify', name: 'AWS Amplify', color: '#FF9900', desc: 'Cloud de AWS' },
        { slug: 'netlify', name: 'Netlify', color: '#00C7B7', desc: 'Deploy de sitios' }
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
    var layout = document.getElementById('stack-layout');
    if (!section || !layout) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pinned = !!(window.gsap && window.ScrollTrigger) && window.innerWidth >= 1200 && !reduced;
    var n = CATS.length;
    var activeIndex = -1;
    var notifEls = [];
    var scrollTrig = null;

    /* ---------------- columnas ---------------- */
    var colLeft = document.createElement('div');
    colLeft.className = 'quien-soy__col stack-col stack-col--left';
    var colRight = document.createElement('div');
    colRight.className = 'quien-soy__col stack-col stack-col--right';
    layout.appendChild(colLeft);
    layout.appendChild(colRight);

    /* ---------------- progreso: 5 tramos con nombre (clic = ir a la categoría) ---------------- */
    var progress = document.createElement('div');
    progress.className = 'stack-progress';
    var segs = CATS.map(function (cat, i) {
      var seg = document.createElement('button');
      seg.type = 'button';
      seg.className = 'stack-progress__seg';
      seg.innerHTML = '<span class="stack-progress__bar"><i></i></span><span class="stack-progress__label">' + cat.num + ' ' + cat.tab + '</span>';
      seg.addEventListener('click', function () { goTo(i); });
      progress.appendChild(seg);
      return seg;
    });
    layout.appendChild(progress);

    /* el bloque saliente se va y el nuevo entra en cascada */
    function swap(col, buildFn, fromX) {
      col.querySelectorAll('.stack-swap').forEach(function (old) {
        old.classList.add('is-out');
        setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 400);
      });
      var box = document.createElement('div');
      box.className = 'stack-swap';
      buildFn(box);
      box.querySelectorAll('[data-step]').forEach(function (el, i) {
        el.style.setProperty('--from-x', fromX + 'px');
        el.style.transitionDelay = (reduced ? 0 : i * 60) + 'ms';
      });
      box.classList.add('is-pre');
      col.appendChild(box);
      requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.remove('is-pre'); }); });
      return box;
    }

    function buildLeft(box, cat) {
      box.innerHTML =
        '<div class="quien-soy__head" data-step><span class="quien-soy__num">' + cat.num + '</span><h3>' + cat.smallTitle + '</h3></div>' +
        '<div class="quien-soy__bio-card" data-step><p>' + cat.summary + '</p></div>' +
        cat.list.map(function (item) {
          return '<div class="quien-soy__data-card" data-step><span class="quien-soy__data-label">' + item.tag + '</span><span class="quien-soy__data-value">' + item.text + '</span></div>';
        }).join('');
    }

    /* cada herramienta es una notificación: logo, nombre, para qué la usa */
    function buildRight(box, cat) {
      box.innerHTML = '<div class="quien-soy__head" data-step><span class="quien-soy__num">' + cat.num + '</span><h3>Herramientas</h3></div>';
      var list = document.createElement('div');
      list.className = 'quien-soy__rows';
      notifEls = cat.logos.map(function (logo) {
        var row = document.createElement('div');
        row.className = 'quien-soy__row stack-notif';
        var icon = document.createElement('span');
        icon.className = 'quien-soy__row-logo stack-notif__logo';
        if (logo.text) {
          icon.textContent = logo.short;
        } else {
          icon.appendChild(makeIcon(logo, 22));
        }
        row.appendChild(icon);
        var body = document.createElement('span');
        body.className = 'quien-soy__row-body';
        body.innerHTML = '<span class="quien-soy__row-title">' + logo.name + '</span><span class="quien-soy__row-place">' + logo.desc + '</span>';
        row.appendChild(body);
        var when = document.createElement('span');
        when.className = 'quien-soy__row-date';
        when.textContent = 'AHORA';
        row.appendChild(when);
        list.appendChild(row);
        return row;
      });
      box.appendChild(list);
    }

    function setActive(idx) {
      if (idx === activeIndex) return;
      var forward = idx > activeIndex;
      activeIndex = idx;
      var cat = CATS[idx];
      swap(colLeft, function (box) { buildLeft(box, cat); }, forward ? -60 : 60);
      swap(colRight, function (box) { buildRight(box, cat); }, forward ? 60 : -60);
      segs.forEach(function (seg, i) { seg.classList.toggle('is-active', i === idx); });
    }

    /* notificación k de la categoría: sale cuando el tramo avanza (0..1) */
    function showNotifs(local) {
      notifEls.forEach(function (el, k) {
        var r = pinned ? clamp((local - (0.04 + k * 0.12)) / 0.1, 0, 1) : 1;
        var e = 1 - Math.pow(1 - r, 3);
        el.style.opacity = e;
        el.style.transform = 'translateX(' + ((1 - e) * 70) + 'px) scale(' + (0.92 + 0.08 * e) + ')';
      });
    }

    function apply(pos) {
      var idx = Math.min(n - 1, Math.floor(pos));
      setActive(idx);
      showNotifs(pos - idx);
      segs.forEach(function (seg, i) {
        seg.querySelector('i').style.transform = 'scaleX(' + (pinned ? clamp(pos - i, 0, 1) : (i === idx ? 1 : 0)) + ')';
      });
    }

    function goTo(idx) {
      if (scrollTrig) {
        var y = scrollTrig.start + (scrollTrig.end - scrollTrig.start) * ((idx + 0.85) / n);
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        apply(idx + 0.99);
      }
    }

    /* ---------------- desktop: sección fija + scroll recorre las categorías ---------------- */
    if (pinned) {
      gsap.registerPlugin(ScrollTrigger);
      layout.classList.add('js-pinned');
      scrollTrig = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + Math.round(window.innerHeight * n * 0.9); },
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: function (self) { apply(Math.min(self.progress * n, n - 0.001)); }
      });
      apply(Math.min(scrollTrig.progress * n, n - 0.001));
      var video = document.getElementById('stack-video');
      if (video) video.addEventListener('loadedmetadata', function () { ScrollTrigger.refresh(); });
    } else {
      apply(0.99);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
