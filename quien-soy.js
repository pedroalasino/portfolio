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
        gsap.set(titleEl, { opacity: 1, y: 0 });
        gsap.set(leftItems, { opacity: 1, x: 0, rotateY: 0 });
        gsap.set(tabsEl, { opacity: 1, x: 0, rotateY: 0 });
        gsap.set(experienceRows, { opacity: 0, y: -30 });
        gsap.set(educationRows, { opacity: 1, x: 0, rotateY: 0 });
        gsap.set([seg0, seg1, seg2], { scaleX: 1 });
        syncTabs(1);
      }

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: function () { return '+=' + Math.round(window.innerHeight * 4); },
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            syncTabs(self.progress);
            if (self.progress >= 0.995) forceEndState();
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

      /* clic en pestañas -> scroll suave al tramo correspondiente */
      function scrollToFraction(frac) {
        var st = tl.scrollTrigger;
        if (!st) return;
        var y = st.start + (st.end - st.start) * frac;
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
