/* ============================================================
   QUIÉN SOY — video central + columnas con pestañas Experiencia/
   Educación. Desktop: sección pinned (GSAP ScrollTrigger, ~4
   pantallas) con entrada 3D scrubeada al scroll, reversible.
   Mobile / reduced-motion / sin GSAP: todo visible, sin pin,
   Experiencia y Educación apiladas una debajo de la otra.
   ============================================================ */
(function () {
  function init() {
    var layout = document.getElementById('quien-soy-layout');
    var section = document.getElementById('quienes-somos');
    if (!layout || !section) return;

    var titleEl = document.getElementById('quien-soy-title');
    var videoWrap = document.getElementById('quien-soy-video-wrap');
    var videoEl = document.getElementById('quien-soy-video');
    var colLeft = layout.querySelector('.quien-soy__col--left');
    var tabsEl = document.getElementById('quien-soy-tabs');
    var tabExperiencia = tabsEl ? tabsEl.querySelector('[data-tab="experiencia"]') : null;
    var tabEducacion = tabsEl ? tabsEl.querySelector('[data-tab="educacion"]') : null;
    var panelExperiencia = document.querySelector('[data-panel="experiencia"]');
    var panelEducacion = document.querySelector('[data-panel="educacion"]');
    var progressEls = Array.prototype.slice.call(document.querySelectorAll('#quien-soy-progress .quien-soy__seg i'));

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isDesktop = window.innerWidth >= 1200;
    var hasGsap = !!(window.gsap && window.ScrollTrigger);
    var canAnimate = hasGsap && isDesktop && !reducedMotion &&
      titleEl && videoWrap && colLeft && tabsEl && tabExperiencia && tabEducacion &&
      panelExperiencia && panelEducacion && progressEls.length === 3;

    /* ---------------- entrada pinned + scrub (solo desktop) ---------------- */
    if (canAnimate) {
      gsap.registerPlugin(ScrollTrigger);
      layout.classList.add('js-pinned');

      var leftItems = Array.prototype.slice.call(colLeft.querySelectorAll('[data-reveal]'));
      var experienceRows = Array.prototype.slice.call(panelExperiencia.querySelectorAll('[data-reveal]'));
      var educationRows = Array.prototype.slice.call(panelEducacion.querySelectorAll('[data-reveal]'));
      var rightPhase1 = [tabsEl].concat(experienceRows);
      var seg0 = progressEls[0], seg1 = progressEls[1], seg2 = progressEls[2];

      gsap.set(titleEl, { opacity: 0, y: 24 });
      gsap.set(leftItems, { opacity: 0, x: -60, rotateY: 25 });
      gsap.set(rightPhase1, { opacity: 0, x: 60, rotateY: -25 });
      gsap.set(educationRows, { opacity: 0, x: 60, rotateY: -25 });
      gsap.set([seg0, seg1, seg2], { scaleX: 0 });

      function syncTabs(progress) {
        var eduActive = progress >= 0.66;
        tabExperiencia.classList.toggle('is-active', !eduActive);
        tabEducacion.classList.toggle('is-active', eduActive);
        panelExperiencia.style.pointerEvents = eduActive ? 'none' : '';
        panelEducacion.style.pointerEvents = eduActive ? '' : 'none';
      }
      syncTabs(0);

      function forceEndState() {
        if (!stack) gsap.set(titleEl, { opacity: 1, y: 0 }); /* con Stack, el título lo maneja la transición */
        gsap.set(leftItems, { opacity: 1, x: 0, rotateY: 0 });
        gsap.set(tabsEl, { opacity: 1, x: 0, rotateY: 0 });
        gsap.set(experienceRows, { opacity: 0, y: -30 });
        gsap.set(educationRows, { opacity: 1, x: 0, rotateY: 0 });
        gsap.set([seg0, seg1, seg2], { scaleX: 1 });
        syncTabs(1);
      }

      /* el Stack se monta adentro: Quién soy (QS) + transición (TR) + Stack (ST),
         medidos en pantallas de scroll, todo en un solo pin */
      var stack = window.StackStage ? window.StackStage.mountMerged(layout, videoWrap) : null;
      /* cierre: la cámara viaja a una toma sobre el hombro (XF), en el monitor se
         arma Proyectos (PS) y la cámara entra a la pantalla (PZ) */
      var QS = 4, TR = stack ? 1 : 0, ST = stack ? stack.count * 0.9 : 0;
      var monitor = stack && window.MonitorStage ? window.MonitorStage.mount(layout, videoWrap) : null;
      /* el armado de la pantalla y el zoom no dependen del scroll: cuando termina el
         video se reproducen solos y la página queda en Proyectos (AUTO = un margen corto) */
      var XF = monitor ? 1.6 : 0, AUTO = monitor ? 0.4 : 0;
      var TOTAL = QS + TR + ST + XF + AUTO;
      var auto = { raf: 0, done: false };
      function stopAuto() {
        if (auto.raf) cancelAnimationFrame(auto.raf);
        auto.raf = 0;
        auto.done = false;
      }
      function runAuto() {
        if (auto.raf || auto.done) return;
        var start = performance.now(), DUR = 2400;
        function step(now) {
          var t = Math.min(1, (now - start) / DUR);
          monitor.apply(1, Math.min(1, t / 0.45), Math.max(0, (t - 0.45) / 0.55));
          if (t < 1) { auto.raf = requestAnimationFrame(step); return; }
          auto.raf = 0;
          auto.done = true;
          /* la sección Proyectos queda en pantalla, arriba de todo */
          var st = tl.scrollTrigger;
          if (st && st.direction > 0 && window.scrollY < st.end) window.scrollTo(0, st.end + 1);
        }
        auto.raf = requestAnimationFrame(step);
      }
      function part(screens, from, len) { return len ? Math.max(0, Math.min(1, (screens - from) / len)) : 0; }

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: function () { return '+=' + Math.round(window.innerHeight * TOTAL); },
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            var screens = self.progress * TOTAL;
            var qsProgress = Math.min(1, screens / QS);
            syncTabs(qsProgress);
            if (qsProgress >= 0.995) forceEndState();
            var xf = 0;
            if (monitor) {
              var end = QS + TR + ST;
              xf = part(screens, end, XF);
              if (xf < 0.999) {
                stopAuto();
                monitor.apply(xf, 0, 0);
              } else if (auto.done || self.direction < 0) {
                /* subiendo desde Proyectos: queda abierto, sin animación ni salto */
                if (auto.raf) cancelAnimationFrame(auto.raf);
                auto.raf = 0;
                auto.done = true;
                monitor.apply(1, 1, 1);
              } else {
                runAuto(); /* terminó el video: se abre Proyectos */
              }
              /* el video del escritorio pasa la posta al de la transición */
              if (stack.video) stack.video.style.visibility = xf > 0 ? 'hidden' : '';
              var fade = Math.min(1, xf * 4);
              stack.layer.style.setProperty('--sfade', 1 - fade);
              /* el título tiene opacidad propia (lo anima la transición): se apaga aparte */
              if (xf > 0) stack.title.style.opacity = 1 - fade;
              else if (stack.title.style.opacity !== '' && screens > QS + TR) stack.title.style.opacity = 1;
            }
            if (stack) {
              stack.apply((screens - QS - TR) / ST * stack.count);
              stack.layer.style.pointerEvents = screens > QS + TR * 0.6 && xf < 0.2 ? 'auto' : 'none';
            }
          },
          onLeave: forceEndState
        }
      });

      tl.to(titleEl, { opacity: 1, y: 0, duration: 0.06, ease: 'none' }, 0);

      tl.to(leftItems, { opacity: 1, x: 0, rotateY: 0, duration: 0.12, stagger: 0.035, ease: 'none' }, 0.04);
      tl.to(seg0, { scaleX: 1, duration: 0.26, ease: 'none' }, 0.04);

      tl.to(rightPhase1, { opacity: 1, x: 0, rotateY: 0, duration: 0.12, stagger: 0.045, ease: 'none' }, 0.32);
      tl.to(seg1, { scaleX: 1, duration: 0.3, ease: 'none' }, 0.32);

      tl.to(experienceRows, { opacity: 0, y: -30, duration: 0.06, ease: 'none' }, 0.66);

      tl.to(educationRows, { opacity: 1, x: 0, rotateY: 0, duration: 0.12, stagger: 0.035, ease: 'none' }, 0.72);
      tl.to(seg2, { scaleX: 1, duration: 0.26, ease: 'none' }, 0.72);

      /* transición a Stack: Quién soy sale, cambia el título, el video se
         funde con el del Stack y entran las columnas nuevas */
      if (stack) {
        var colRight = layout.querySelector('.quien-soy__col--right');
        var qsProgressEl = document.getElementById('quien-soy-progress');
        var t0 = 1.02; /* unidades del timeline: 1 = las 4 pantallas de Quién soy */
        gsap.set(stack.layer, { opacity: 0 });
        gsap.set(stack.title, { opacity: 0, y: 30 });
        if (stack.video) gsap.set(stack.video, { opacity: 0, scale: 1.06 });

        tl.to(colLeft, { opacity: 0, x: -80, rotateY: 20, duration: 0.1, ease: 'none' }, t0);
        tl.to(colRight, { opacity: 0, x: 80, rotateY: -20, duration: 0.1, ease: 'none' }, t0);
        tl.to(titleEl, { opacity: 0, y: -30, duration: 0.07, ease: 'none' }, t0);
        if (qsProgressEl) tl.to(qsProgressEl, { opacity: 0, duration: 0.06, ease: 'none' }, t0);
        if (videoEl) tl.to(videoEl, { opacity: 0, duration: 0.14, ease: 'none' }, t0 + 0.04);
        if (stack.video) tl.to(stack.video, { opacity: 1, scale: 1, duration: 0.16, ease: 'none' }, t0 + 0.04);
        tl.to(stack.layer, { opacity: 1, duration: 0.08, ease: 'none' }, t0 + 0.1);
        tl.to(stack.title, { opacity: 1, y: 0, duration: 0.08, ease: 'none' }, t0 + 0.1);
        /* el timeline tiene que durar lo mismo que el scroll total */
        tl.to({}, { duration: 0.01 }, TOTAL / QS - 0.01);

        stack.goTo = function (i) {
          var st = tl.scrollTrigger;
          var screens = QS + TR + (i + 0.85) / stack.count * ST;
          window.scrollTo({ top: st.start + (st.end - st.start) * (screens / TOTAL), behavior: 'smooth' });
        };
        if (stack.video) {
          var pr = stack.video.play();
          if (pr && pr.catch) pr.catch(function () {});
        }
      }

      /* clic en pestañas -> scroll suave al tramo correspondiente */
      function scrollToFraction(frac) {
        var st = tl.scrollTrigger;
        if (!st) return;
        var y = st.start + (st.end - st.start) * frac * QS / TOTAL;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      tabExperiencia.addEventListener('click', function () { scrollToFraction(0.45); });
      tabEducacion.addEventListener('click', function () { scrollToFraction(0.85); });

      /* el video carga async y puede cambiar la altura de la sección:
         recalcular el pin una vez que el layout esté asentado. */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { ScrollTrigger.refresh(); });
      });
      if (videoEl) {
        videoEl.addEventListener('loadedmetadata', function () { ScrollTrigger.refresh(); });
      }
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    } else if (!reducedMotion) {
      /* mobile / tablet / sin GSAP: sin pin, fade simple uno por uno al entrar en pantalla */
      var revealItems = Array.prototype.slice.call(layout.querySelectorAll('[data-reveal]'));
      if ('IntersectionObserver' in window && revealItems.length) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            revealItems.forEach(function (el, i) {
              setTimeout(function () { el.classList.add('is-in'); }, i * 80);
            });
            io.disconnect();
          });
        }, { threshold: 0.1 });
        io.observe(layout);
      } else {
        revealItems.forEach(function (el) { el.classList.add('is-in'); });
      }
    }

    /* ---------------- tilt 3D del video con el mouse ---------------- */
    if (videoWrap && videoEl && !reducedMotion && window.matchMedia('(hover: hover)').matches) {
      videoWrap.addEventListener('pointermove', function (e) {
        var r = videoWrap.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        videoEl.style.transition = 'transform .1s ease-out';
        videoEl.style.transform = 'rotateX(' + (-py * 4) + 'deg) rotateY(' + (px * 4) + 'deg)';
      });
      videoWrap.addEventListener('pointerleave', function () {
        videoEl.style.transition = 'transform .5s cubic-bezier(.2,.75,.2,1)';
        videoEl.style.transform = 'rotateX(0deg) rotateY(0deg)';
      });
    }

    /* ---------------- filas de experiencia -> ir al proyecto ---------------- */
    layout.querySelectorAll('[data-project-link]').forEach(function (row) {
      row.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById('proyectos');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        var projectName = row.getAttribute('data-project-link');
        setTimeout(function () {
          try {
            var items = document.querySelectorAll('#proyectos-list .proyectos__name');
            for (var i = 0; i < items.length; i++) {
              if (items[i].textContent.trim() === projectName) {
                var li = items[i].closest('li');
                if (li) li.click();
                break;
              }
            }
          } catch (_) {}
        }, 500);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
