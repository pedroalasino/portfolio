/* ============================================================
   PROYECTOS — pestañas AI Engineer / Full Stack, lista con logo
   por fila, descripción + stack de la categoría, y vista previa
   con uno o dos botones (y crossfade si hay más de una imagen).
   ============================================================ */
(function () {
  var CATEGORIES = {
    ai: {
      label: 'AI Engineer',
      description: 'Agentes, asistentes y sistemas con IA, con backend propio en Python y FastAPI.',
      stack: ['Python', 'FastAPI', 'APIs REST', 'LLaMA 3', 'Ollama', 'RAG', 'Multi-agente', 'Chroma', 'Qdrant', 'Whisper.cpp (STT)', 'Piper / Coqui (TTS)', 'n8n'],
      projects: [
        {
          num: '01', name: 'Luigi Bosca', year: '2025',
          logo: 'img/luigi-white.png',
          title: 'Capacitación de IA aplicada a empresas',
          desc: 'Plataforma con motor de IA propio y seis agentes configurables, implementada en vivo para los equipos de Luigi Bosca en Buenos Aires y Mendoza.',
          images: ['img/proyectos/luigi-bosca.mp4'], /* cliente estrella: va primero */
          ctas: [{ label: 'Ver proyecto', href: '#contacto' }]
        },
        {
          num: '02', name: 'SoberanoLab', year: '2025',
          logo: 'img/proyectos/logos/soberanolab.png',
          title: 'Motor de IA soberano',
          desc: 'SOBERAI: motor de IA que corre en tu propio equipo. Backend en FastAPI con API REST, agentes con RAG, memoria vectorial y voz.',
          images: ['img/proyectos/soberanolab.mp4'],
          ctas: [{ label: 'Ver proyecto', href: '#contacto' }]
        },
        {
          num: '03', name: 'Expolajas', year: '2026',
          logo: 'img/proyectos/logos/expolajas.png',
          title: 'Sistema laboral con IA',
          desc: 'Asistencia, turnos, liquidaciones y reportes de personal gestionados con IA.',
          images: ['img/proyectos/expolajas.mp4'],
          ctas: [{ label: 'Ver proyecto', href: '#contacto' }]
        },
        {
          num: '04', name: 'Salvatierra', year: '2025',
          logo: 'img/proyectos/logos/salvatierra.png',
          title: 'Asistente comercial con IA',
          desc: 'Guía a cada cliente en la elección del producto y lo acompaña en la compra.',
          images: ['img/proyectos/salvatierra.webp'],
          ctas: [{ label: 'Ver proyecto', href: '#contacto' }]
        }
      ]
    },
    fullstack: {
      label: 'Full Stack',
      description: 'Plataformas web completas: frontend, backend, pagos e integraciones.',
      stack: ['JavaScript', 'React', 'Next.js', 'TailwindCSS', 'shadcn/ui', 'HTML / CSS', 'FastAPI', 'APIs REST', 'Webhooks', 'PostgreSQL', 'MySQL', 'MongoDB', 'Mercado Pago', 'WhatsApp API', 'Realidad aumentada (8th Wall)', 'Spline 3D', 'Netlify'],
      projects: [
        {
          num: '01', name: 'LMASM Deco', year: '2026',
          logo: 'img/proyectos/logos/lmasm.png',
          title: 'E-commerce y asesor de cortinas con realidad aumentada',
          desc: 'Tienda online de cortinas a medida con cotizador, pagos y pedidos por WhatsApp, y un asesor que mide la ventana con la cámara del celular y recomienda la cortina con su precio.',
          images: ['img/proyectos/lmasm-preview.webp'],
          ctas: [
            { label: 'Ver e-commerce', href: 'https://lmasm.com' },
            { label: 'Ver asesor RA', href: 'https://lmasmpegau.netlify.app/', secondary: true }
          ]
        },
        {
          num: '02', name: 'HouseGur', year: '2025',
          logo: 'img/proyectos/logos/housegur.png',
          title: 'Inversiones inmobiliarias tokenizadas',
          desc: 'Invertí desde €50 en propiedades de Madrid, Valencia y Alicante, con asistente IA.',
          images: [],
          ctas: [{ label: 'Ver proyecto', href: '#contacto' }]
        },
        {
          num: '03', name: 'INTBIZ', year: '2024',
          logo: 'img/proyectos/logos/intbiz.png',
          title: 'Sitio corporativo internacional',
          desc: 'Sitio bilingüe para una consultora de negocios e IA con clientes como Coca-Cola y TN.',
          images: ['img/proyectos/intbiz.webp'],
          ctas: [{ label: 'Ver proyecto', href: '#contacto' }]
        }
      ]
    }
  };

  function init() {
    var list = document.getElementById('proyectos-list');
    var tabsWrap = document.getElementById('proyectos-tabs');
    var catDesc = document.getElementById('proyectos-cat-desc');
    var stackPills = document.getElementById('proyectos-stack-pills');
    var img1 = document.getElementById('proyectos-preview-img');
    var img2 = document.getElementById('proyectos-preview-img-alt');
    var videoEl = document.getElementById('proyectos-preview-video');
    var placeholder = document.getElementById('proyectos-preview-placeholder');
    var logoWrap = document.getElementById('proyectos-preview-logo');
    var logoImg = document.getElementById('proyectos-preview-logo-img');
    var titleEl = document.getElementById('proyectos-preview-title');
    var descEl = document.getElementById('proyectos-preview-desc');
    var ctasWrap = document.getElementById('proyectos-preview-ctas');
    if (!list || !tabsWrap || !catDesc || !stackPills || !img1 || !img2 || !videoEl || !placeholder || !logoWrap || !logoImg || !titleEl || !descEl || !ctasWrap) return;

    var isTouch = window.matchMedia('(hover: none)').matches;
    var crossfadeTimer = null;
    var activeCategory = 'ai';
    var activeProject = null;
    var sectionRevealed = false;
    var pendingReveal = false;
    var revealToken = 0;

    function revealPreview() {
      revealToken++;
      var token = revealToken;
      var seq = [[logoWrap, 0], [titleEl, 260], [descEl, 460], [ctasWrap, 680]];
      seq.forEach(function (pair) {
        pair[0].classList.remove('is-visible');
      });
      void ctasWrap.offsetWidth;
      seq.forEach(function (pair) {
        setTimeout(function () {
          if (token === revealToken) pair[0].classList.add('is-visible');
        }, pair[1]);
      });
    }

    if ('IntersectionObserver' in window) {
      var previewObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            sectionRevealed = true;
            if (pendingReveal) revealPreview();
            previewObserver.disconnect();
          }
        });
      }, { threshold: 0.2 });
      previewObserver.observe(document.getElementById('proyectos-preview'));
    } else {
      sectionRevealed = true;
    }

    function stopCrossfade() {
      if (crossfadeTimer) { clearInterval(crossfadeTimer); crossfadeTimer = null; }
    }

    function isVideo(src) {
      return /\.(mp4|webm|mov)$/i.test(src || '');
    }

    function showImages(images) {
      stopCrossfade();
      img1.classList.remove('is-visible');
      img2.classList.remove('is-visible');
      videoEl.classList.remove('is-visible');
      videoEl.pause();
      videoEl.removeAttribute('src');
      placeholder.classList.remove('is-visible');

      if (!images || !images.length) {
        placeholder.classList.add('is-visible');
        return;
      }

      if (isVideo(images[0])) {
        var src = images[0];
        /* los videos comprimidos en img/proyectos/ tienen versión webm (Chrome/Firefox) */
        if (/^img\/proyectos\/.*\.mp4$/.test(src) && videoEl.canPlayType('video/webm; codecs="vp9"')) {
          src = src.replace(/\.mp4$/, '.webm');
        }
        videoEl.src = src;
        videoEl.classList.add('is-visible');
        videoEl.play().catch(function () {});
        return;
      }

      img1.src = images[0];
      img1.classList.add('is-visible');

      if (images.length > 1) {
        img2.src = images[1];
        var showingFirst = true;
        crossfadeTimer = setInterval(function () {
          showingFirst = !showingFirst;
          img1.classList.toggle('is-visible', showingFirst);
          img2.classList.toggle('is-visible', !showingFirst);
        }, 4000);
      }
    }

    function renderCtas(ctas) {
      ctasWrap.innerHTML = '';
      (ctas || []).forEach(function (cta) {
        var a = document.createElement('a');
        a.className = 'proyectos__preview-cta' + (cta.secondary ? ' proyectos__preview-cta--secondary' : '');
        a.textContent = cta.label + ' ↗';
        a.href = cta.href;
        if (/^https?:\/\//.test(cta.href)) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        ctasWrap.appendChild(a);
      });
    }

    function activateProject(project, li) {
      if (activeProject === project) return;
      activeProject = project;

      Array.prototype.forEach.call(list.children, function (el) {
        el.classList.toggle('is-active', el === li);
      });

      showImages(project.images);

      if (project.logo) {
        logoImg.src = project.logo;
        logoWrap.classList.remove('is-hidden');
      } else {
        logoWrap.classList.add('is-hidden');
      }

      titleEl.textContent = project.title;
      descEl.textContent = project.desc;
      renderCtas(project.ctas);

      if (sectionRevealed) {
        revealPreview();
      } else {
        pendingReveal = true;
      }
    }

    function renderList(categoryKey, opts) {
      var category = CATEGORIES[categoryKey];
      activeCategory = categoryKey;
      list.innerHTML = '';
      catDesc.textContent = category.description;

      stackPills.innerHTML = '';
      category.stack.forEach(function (tech) {
        var span = document.createElement('span');
        span.textContent = tech;
        stackPills.appendChild(span);
      });

      category.projects.forEach(function (project, idx) {
        var li = document.createElement('li');
        li.className = 'proyectos__item';
        li.tabIndex = 0;

        var logoSpan = document.createElement('span');
        logoSpan.className = 'proyectos__item-logo';
        if (project.logo) {
          var logoImgEl = document.createElement('img');
          logoImgEl.src = project.logo;
          logoImgEl.alt = '';
          logoSpan.appendChild(logoImgEl);
        }

        var textSpan = document.createElement('span');
        textSpan.className = 'proyectos__item-text';
        textSpan.innerHTML =
          '<span class="proyectos__num">' + project.num + '</span>' +
          '<span class="proyectos__name">' + project.name + '</span>' +
          '<span class="proyectos__year">' + project.year + '</span>';

        li.appendChild(logoSpan);
        li.appendChild(textSpan);

        if (!isTouch) {
          li.addEventListener('mouseenter', function () { activateProject(project, li); });
        }
        li.addEventListener('click', function () {
          activateProject(project, li);
          if (isTouch) {
            var preview = document.getElementById('proyectos-preview');
            if (preview) preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
        li.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateProject(project, li);
          }
        });

        list.appendChild(li);

        if (idx === 0) {
          activeProject = null;
          activateProject(project, li);
        }
      });

      if (opts && opts.fade) {
        list.style.opacity = '0';
        requestAnimationFrame(function () {
          list.style.transition = 'opacity .25s ease';
          list.style.opacity = '1';
        });
      }
    }

    tabsWrap.querySelectorAll('.proyectos__tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        if (tab.dataset.category === activeCategory) return;
        tabsWrap.querySelectorAll('.proyectos__tab').forEach(function (t) {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        renderList(tab.dataset.category, { fade: true });
      });
    });

    renderList('ai');

    /* desktop: la sección se va armando con el scroll, pieza por pieza */
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var afterZoom = !!(window.gsap && window.ScrollTrigger && window.innerWidth >= 1200 && !reduced &&
      document.getElementById('quien-soy-layout') && document.getElementById('stack-video'));
    /* después del zoom al monitor la sección aparece entera de una (monitor-stage.js) */
    if (afterZoom) document.getElementById('proyectos').classList.add('proyectos--after-zoom');
    if (!afterZoom && window.gsap && window.ScrollTrigger && window.innerWidth >= 1200 && !reduced) {
      gsap.registerPlugin(ScrollTrigger);
      var section = document.getElementById('proyectos');
      section.querySelectorAll('.reveal').forEach(function (el) { el.classList.remove('reveal'); });
      var pieces = [].concat(
        [section.querySelector('.proyectos__tag'), section.querySelector('.proyectos__title'), tabsWrap],
        [].slice.call(list.children),
        [catDesc, section.querySelector('.proyectos__stack')]
      ).filter(Boolean);
      var preview = document.getElementById('proyectos-preview');
      var tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 90%', end: 'top 10%', scrub: 0.6 }
      });
      tl.fromTo(pieces, { opacity: 0, y: 50, rotateX: -25 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.3, stagger: 0.06, ease: 'none' }, 0);
      tl.fromTo(preview, { opacity: 0, scale: 0.88, y: 60 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'none' }, 0.15);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
