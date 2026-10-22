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
      /* al final, la cámara entra a la pantalla del monitor (PZ) y la pantalla
         llena todo con el gris del sitio: de ahí sigue la sección Proyectos */
      var QS = 4, TR = stack ? 1 : 0, ST = stack ? stack.count * 0.9 : 0;
      var PZ = stack && stack.video ? 1.6 : 0;
      /* Proyectos sube encima del final del zoom: sin pantalla gris vacía en el medio */
      var projSection = document.getElementById('proyectos');
      if (PZ && projSection) projSection.classList.add('proyectos--after-zoom');
      var TOTAL = QS + TR + ST + PZ;
      var screenEl = null;
      if (PZ) {
        screenEl = document.createElement('div');
        screenEl.className = 'monitor-zoom';
        layout.appendChild(screenEl);
      }
      var zoomed = false;
      /* zoom directo: la cámara entra a la pantalla del monitor hasta llenarla;
         al final todo se funde con el gris del sitio */
      function placeScreen(e) {
        screenEl.style.opacity = Math.max(0, Math.min(1, (e - 0.65) / 0.25));
      }

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
            var z = 0;
            if (screenEl) {
              z = Math.max(0, Math.min(1, (screens - QS - TR - ST) / PZ));
              var e = z < 0.5 ? 4 * z * z * z : 1 - Math.pow(-2 * z + 2, 3) / 2;
              placeScreen(e);
              /* la cámara entra a la pantalla del monitor */
              if (stack.video && z > 0) {
                stack.video.style.transform = 'scale(' + (1 + e * 13) + ')';
                zoomed = true;
              } else if (stack.video && zoomed) {
                stack.video.style.transform = 'scale(1)';
                stack.video.style.opacity = 1;
                zoomed = false;
              }
              stack.layer.style.setProperty('--sfade', 1 - Math.min(1, e * 3));
              /* el título tiene opacidad propia (lo anima la transición): se apaga aparte */
              if (z > 0) stack.title.style.opacity = 1 - Math.min(1, e * 3);
              else if (stack.title.style.opacity !== '' && screens > QS + TR) stack.title.style.opacity = 1;
            }
            if (stack) {
              stack.apply((screens - QS - TR) / ST * stack.count);
              stack.layer.style.pointerEvents = screens > QS + TR * 0.6 && z < 0.2 ? 'auto' : 'none';
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
