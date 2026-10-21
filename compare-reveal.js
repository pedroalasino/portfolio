/* Compare Reveal — adaptado de Motiq (https://motiq.dev/components/compare-reveal), MIT.
   Cargado vía Babel Standalone (sin build): usa React/ReactDOM globales (UMD).
   Los colores salen de las variables --motiq-* que definimos en style.css, reskineadas
   a la paleta blanco/negro de SoberanoLab en vez del azul/rojo original. */

function cn() {
  return Array.prototype.slice.call(arguments).filter(Boolean).join(' ');
}

/* ---- hooks (inlineados) ---- */

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useVisibilityPause(ref, opts) {
  const threshold = (opts && opts.threshold) || 0.1;
  const [onScreen, setOnScreen] = React.useState(true);
  const [tabVisible, setTabVisible] = React.useState(true);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => setOnScreen(entries.some((e) => e.isIntersecting)),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);

  React.useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState !== 'hidden');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return onScreen && tabVisible;
}

function useControllableState(opts) {
  const { value, defaultValue, onChange } = opts;
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const current = isControlled ? value : internal;
  const set = React.useCallback(
    (next) => {
      if (!isControlled) setInternal(next);
      if (onChange) onChange(next);
    },
    [isControlled, onChange]
  );
  return [current, set];
}

/* ---- constantes (spec original) ---- */

const SPRING_K = 140;
const SPRING_C = 18;
const SWEEP_SECONDS = 2.6;
const KEY_STEP = 2;
const KEY_STEP_LARGE = 10;
const LABEL_FADE = 12;

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function sweepAt(u) {
  if (u < 0.38) return lerp(50, 96, easeInOutCubic(u / 0.38));
  if (u < 0.78) return lerp(96, 4, easeInOutCubic((u - 0.38) / 0.4));
  return lerp(4, 50, easeInOutCubic((u - 0.78) / 0.22));
}

function renderSide(source) {
  return source;
}

/* ---- componente ---- */

function CompareRevealBase(props) {
  const {
    before,
    after,
    defaultPosition = 50,
    position,
    onPositionChange,
    introSweep = true,
    stiffness = SPRING_K,
    damping = SPRING_C,
    labels = ['Before', 'After'],
    snapOnDoubleClick = 50,
    reducedMotion,
    pauseWhenHidden = true,
    className,
    ...rest
  } = props;

  const rootRef = React.useRef(null);
  const topRef = React.useRef(null);
  const dividerRef = React.useRef(null);
  const handleRef = React.useRef(null);
  const labelRefs = React.useRef([]);
  const paintRef = React.useRef(() => {});

  const systemReduced = useReducedMotion();
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  const still = reducedMotion === true || (hydrated && systemReduced);

  const onScreen = useVisibilityPause(rootRef, { threshold: 0.2 });
  const animate = !still && (!pauseWhenHidden || onScreen);

  const [pct, setPct] = useControllableState({
    value: position,
    defaultValue: clamp(defaultPosition, 0, 100),
    onChange: (v) => onPositionChange && onPositionChange(v),
  });

  const initialPct = clamp(position !== undefined ? position : defaultPosition, 0, 100);
  const sim = React.useRef({
    x: initialPct,
    v: 0,
    target: initialPct,
    dragging: false,
    pointerId: null,
    introActive: false,
    introDone: false,
    introStart: 0,
  });

  const params = React.useRef({ stiffness, damping, still, introSweep });
  params.current = { stiffness, damping, still, introSweep };

  const pctRef = React.useRef(pct);
  pctRef.current = pct;

  React.useEffect(() => {
    const paint = () => {
      const x = clamp(sim.current.x, 0, 100);
      const top = topRef.current;
      if (top) top.style.clipPath = `inset(0 ${(100 - x).toFixed(3)}% 0 0)`;
      const divider = dividerRef.current;
      if (divider) divider.style.left = `${x.toFixed(3)}%`;
      if (handleRef.current) handleRef.current.setAttribute('aria-valuenow', String(Math.round(x)));
      const l0 = labelRefs.current[0];
      const l1 = labelRefs.current[1];
      if (l0) l0.style.opacity = x > LABEL_FADE ? '1' : '0';
      if (l1) l1.style.opacity = x < 100 - LABEL_FADE ? '1' : '0';
    };
    paintRef.current = paint;
    paint();

    if (!animate) {
      sim.current.introDone = true;
      sim.current.introActive = false;
      return () => {
        if (sim.current.introActive) {
          sim.current.introActive = false;
          sim.current.introDone = false;
        }
      };
    }

    if (params.current.introSweep && !sim.current.introDone) {
      sim.current.introActive = true;
      sim.current.introStart = performance.now() / 1000;
    }

    let raf = 0;
    let last = performance.now();
    const frame = (ts) => {
      const dt = Math.min(0.05, Math.max(0.001, (ts - last) / 1000));
      last = ts;
      const now = ts / 1000;
      const p = params.current;
      const s = sim.current;

      if (s.introActive) {
        const u = (now - s.introStart) / SWEEP_SECONDS;
        if (u >= 1) {
          s.introActive = false;
          s.introDone = true;
          s.target = clamp(pctRef.current, 0, 100);
        } else {
          s.target = sweepAt(u);
        }
      }
      s.v += ((s.target - s.x) * p.stiffness - s.v * p.damping) * dt;
      s.x += s.v * dt;
      if (s.x < 0) { s.x = 0; s.v = 0; }
      if (s.x > 100) { s.x = 100; s.v = 0; }
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (sim.current.introActive) {
        sim.current.introActive = false;
        sim.current.introDone = false;
        sim.current.target = clamp(pctRef.current, 0, 100);
      }
    };
  }, [animate]);

  const commit = React.useCallback(
    (next) => {
      const s = sim.current;
      s.introActive = false;
      s.introDone = true;
      setPct(clamp(next, 0, 100));
    },
    [setPct]
  );

  React.useEffect(() => {
    const s = sim.current;
    if (s.introActive) return;
    const t = clamp(pct, 0, 100);
    if (Math.abs(s.target - t) < 0.0001) return;
    s.target = t;
    if (params.current.still) {
      s.x = t;
      s.v = 0;
      paintRef.current();
    }
  }, [pct]);

  const positionFromEvent = (clientX) => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    commit(((clientX - rect.left) / Math.max(1, rect.width)) * 100);
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    sim.current.dragging = true;
    sim.current.pointerId = e.pointerId;
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    positionFromEvent(e.clientX);
  };

  const onPointerMove = (e) => {
    if (!sim.current.dragging || e.pointerId !== sim.current.pointerId) return;
    positionFromEvent(e.clientX);
  };

  const endDrag = () => {
    sim.current.dragging = false;
    sim.current.pointerId = null;
  };

  const onKeyDown = (e) => {
    const step = e.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const base = sim.current.target;
    let next = base;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = base + step;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = base - step;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 100;
    else return;
    e.preventDefault();
    commit(next);
  };

  const shown = Math.round(clamp(pct, 0, 100));

  return React.createElement(
    'div',
    {
      ref: rootRef,
      role: 'group',
      'aria-label': rest['aria-label'] || `Comparacion: ${labels[0]} versus ${labels[1]}`,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onDoubleClick: () => commit(snapOnDoubleClick),
      'data-motion': still ? 'static' : 'animated',
      className: cn(
        'relative aspect-[16/10] w-full touch-pan-y select-none overflow-hidden rounded-[20px]',
        'border border-[var(--motiq-border)] bg-[var(--motiq-bg-elevated)] cursor-ew-resize',
        className
      ),
      ...rest,
    },
    React.createElement('div', { className: 'absolute inset-0' }, renderSide(after)),
    React.createElement(
      'div',
      {
        ref: topRef,
        className: 'absolute inset-0 will-change-[clip-path]',
        style: { clipPath: `inset(0 ${100 - shown}% 0 0)` },
      },
      renderSide(before)
    ),
    [labels[0], labels[1]].map((text, i) =>
      React.createElement(
        'span',
        {
          key: text + i,
          ref: (el) => { labelRefs.current[i] = el; },
          'aria-hidden': 'true',
          className: cn(
            'pointer-events-none absolute top-4 z-[8] rounded-full px-3 py-1.5 transition-opacity duration-300',
            'border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.55)] backdrop-blur-[6px]',
            'font-sans text-[10.5px] uppercase tracking-[0.12em] text-white',
            i === 0 ? 'left-4' : 'right-4'
          ),
        },
        text
      )
    ),
    React.createElement(
      'div',
      {
        ref: dividerRef,
        className: 'pointer-events-none absolute bottom-0 top-0 z-10 -ml-px w-0.5 will-change-[left]',
        style: { left: `${shown}%`, background: 'var(--motiq-signature)' },
      },
      React.createElement(
        'button',
        {
          ref: handleRef,
          type: 'button',
          role: 'slider',
          'aria-label': `Divisor de comparacion, ${labels[0]} a ${labels[1]}`,
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': shown,
          'aria-valuetext': `${shown}% ${labels[0]}`,
          onKeyDown,
          className: cn(
            'pointer-events-auto absolute left-1/2 top-1/2 grid h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2',
            'cursor-ew-resize place-items-center rounded-full p-0 backdrop-blur-[4px] transition-shadow duration-200',
            'border-2 border-[var(--motiq-signature)] text-[var(--motiq-signature)]',
            'bg-[color-mix(in_oklab,var(--motiq-bg-elevated)_82%,transparent)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--motiq-signature)] focus-visible:ring-offset-2'
          ),
          style: {
            boxShadow:
              '0 0 0 6px color-mix(in oklab, var(--motiq-signature) 18%, transparent), 0 0 26px color-mix(in oklab, var(--motiq-signature) 45%, transparent)',
          },
        },
        React.createElement(
          'svg',
          { width: 18, height: 14, viewBox: '0 0 18 14', fill: 'none', 'aria-hidden': 'true' },
          React.createElement('path', { d: 'M6 1 L1 7 L6 13', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
          React.createElement('path', { d: 'M12 1 L17 7 L12 13', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
        )
      )
    )
  );
}

function CompareReveal(props) {
  return React.createElement(CompareRevealBase, props);
}

/* ---- contenido: "sin IA" vs "con SoberanoLab" ---- */

function ProblemaCompare() {
  /* Escena "wireframe": grilla + gráfico en baja, colores originales de la referencia. */
  const before = React.createElement(
    'div',
    { className: 'relative h-full w-full bg-[#0b1220]' },
    React.createElement(
      'svg',
      { viewBox: '0 0 640 400', preserveAspectRatio: 'xMidYMid slice', className: 'absolute inset-0 h-full w-full' },
      React.createElement(
        'defs',
        null,
        React.createElement(
          'pattern',
          { id: 'cr-grid', width: 32, height: 32, patternUnits: 'userSpaceOnUse' },
          React.createElement('path', { d: 'M32 0H0v32', fill: 'none', stroke: '#2b4a7a', strokeWidth: 1 })
        )
      ),
      React.createElement('rect', { width: 640, height: 400, fill: 'url(#cr-grid)' }),
      React.createElement('path', {
        d: 'M0 160 L110 210 L220 190 L330 250 L440 225 L540 270 L640 250',
        fill: 'none', stroke: '#4f7cff', strokeWidth: 2,
      }),
      React.createElement('path', {
        d: 'M0 120 L150 150 L260 145 L380 190 L500 175 L640 200',
        fill: 'none', stroke: '#2b4a7a', strokeWidth: 1.5, strokeDasharray: '5 5',
      }),
      React.createElement('circle', { cx: 470, cy: 290, r: 34, fill: 'none', stroke: '#4f7cff', strokeWidth: 2, strokeDasharray: '4 6' })
    ),
    React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent' }),
    React.createElement(
      'div',
      { className: 'absolute inset-x-0 bottom-0 p-6 md:p-8' },
      React.createElement(
        'ul',
        { className: 'space-y-1.5 font-sans text-sm text-[var(--motiq-muted)] md:text-base' },
        React.createElement('li', null, 'Consultas sin responder'),
        React.createElement('li', null, 'Cotizaciones que tardan horas'),
        React.createElement('li', null, 'Un equipo saturado')
      )
    )
  );

  /* Escena "render": cielo con sol y montañas, colores originales de la referencia. */
  const after = React.createElement(
    'div',
    { className: 'relative h-full w-full' },
    React.createElement(
      'svg',
      { viewBox: '0 0 640 400', preserveAspectRatio: 'xMidYMid slice', className: 'absolute inset-0 h-full w-full' },
      React.createElement(
        'defs',
        null,
        React.createElement(
          'linearGradient',
          { id: 'cr-sky', x1: 0, y1: 0, x2: 0, y2: 1 },
          React.createElement('stop', { offset: '0%', stopColor: '#2a1a4a' }),
          React.createElement('stop', { offset: '55%', stopColor: '#c2503f' }),
          React.createElement('stop', { offset: '100%', stopColor: '#f6b94a' })
        )
      ),
      React.createElement('rect', { width: 640, height: 400, fill: 'url(#cr-sky)' }),
      React.createElement('circle', { cx: 470, cy: 110, r: 34, fill: '#ffe9b0', opacity: 0.95 }),
      React.createElement('path', { d: 'M0 300 L120 240 L210 275 L320 205 L430 255 L540 195 L640 235 V400 H0Z', fill: '#3a2340' }),
      React.createElement('path', { d: 'M0 340 L150 300 L260 325 L380 270 L500 305 L640 275 V400 H0Z', fill: '#231630' })
    ),
    React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent' }),
    React.createElement(
      'div',
      { className: 'absolute inset-x-0 bottom-0 p-6 md:p-8' },
      React.createElement('span', { className: 'mb-2 block font-sans text-2xl font-bold text-[var(--motiq-signature)] md:text-3xl' }, '+40%'),
      React.createElement(
        'ul',
        { className: 'space-y-1.5 font-sans text-sm text-[var(--motiq-fg)] md:text-base' },
        React.createElement('li', null, 'Respuestas al instante, 24/7'),
        React.createElement('li', null, '−60% tiempo de respuesta'),
        React.createElement('li', null, '+40% conversiones')
      )
    )
  );

  return React.createElement(CompareReveal, {
    before,
    after,
    labels: ['Sin IA', 'Con SoberanoLab'],
    defaultPosition: 50,
    introSweep: true,
    snapOnDoubleClick: 50,
    className: 'w-full shadow-[0_30px_60px_rgba(0,0,0,0.15)]',
  });
}

const rootEl = document.getElementById('problema-compare-root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(React.createElement(ProblemaCompare));
}
