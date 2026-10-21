/* SoberanoLab — boot sequence, reveals, demos de producto (simulados) */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var voiceEnabled = true;
  var maleVoice = null;

  var MALE_VOICE_HINTS = ['alvaro', 'pablo', 'jorge', 'diego', 'juan', 'carlos', 'tomas', 'fernando', 'enrique', 'alonso', 'arnau', 'liberto', 'miguel', 'raul', 'sergio', 'male', 'hombre'];
  var FEMALE_VOICE_HINTS = ['helena', 'laura', 'sabina', 'monica', 'paulina', 'elvira', 'lucia', 'conchita', 'female', 'mujer'];
  var QUALITY_HINTS = ['natural', 'online', 'neural', 'google', 'premium'];

  function pickMaleSpanishVoice() {
    if (!('speechSynthesis' in window)) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    var es = voices.filter(function (v) { return /^es/i.test(v.lang); });
    if (!es.length) return null;

    function score(v) {
      var n = v.name.toLowerCase();
      var s = 0;
      if (QUALITY_HINTS.some(function (h) { return n.indexOf(h) !== -1; })) s += 10;
      if (MALE_VOICE_HINTS.some(function (h) { return n.indexOf(h) !== -1; })) s += 5;
      if (FEMALE_VOICE_HINTS.some(function (h) { return n.indexOf(h) !== -1; })) s -= 5;
      return s;
    }

    var best = es[0];
    var bestScore = score(best);
    es.forEach(function (v) {
      var s = score(v);
      if (s > bestScore) { bestScore = s; best = v; }
    });
    return best;
  }

  function initVoiceSelection() {
    if (!('speechSynthesis' in window)) return;
    maleVoice = pickMaleSpanishVoice();
    window.speechSynthesis.addEventListener('voiceschanged', function () {
      maleVoice = pickMaleSpanishVoice();
    });
  }

  function speakText(text) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-AR';
    utter.rate = 1.02;
    if (maleVoice) utter.voice = maleVoice;
    window.speechSynthesis.speak(utter);
  }

  function initVoiceToggle() {
    var btn = document.getElementById('ia-voice-toggle');
    if (!btn) return;
    if (!('speechSynthesis' in window)) { btn.hidden = true; return; }
    btn.addEventListener('click', function () {
      voiceEnabled = !voiceEnabled;
      btn.setAttribute('aria-pressed', String(voiceEnabled));
      if (!voiceEnabled) window.speechSynthesis.cancel();
    });
  }

  function initVoiceInput() {
    var micBtn = document.getElementById('ia-chat-mic');
    var textarea = document.getElementById('input-soberano-ai');
    if (!micBtn || !textarea) return;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { micBtn.hidden = true; return; }

    var recognition = new SR();
    recognition.lang = 'es-AR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    var listening = false;

    recognition.addEventListener('result', function (e) {
      var transcript = e.results[0][0].transcript;
      textarea.value = transcript;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      var form = textarea.closest('form');
      if (form && transcript.trim()) form.requestSubmit();
    });
    recognition.addEventListener('end', function () {
      listening = false;
      micBtn.setAttribute('aria-pressed', 'false');
    });
    recognition.addEventListener('error', function () {
      listening = false;
      micBtn.setAttribute('aria-pressed', 'false');
    });

    micBtn.addEventListener('click', function () {
      if (textarea.disabled) return;
      if (listening) { recognition.stop(); return; }
      listening = true;
      micBtn.setAttribute('aria-pressed', 'true');
      try { recognition.start(); } catch (err) {
        listening = false;
        micBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  function normalize(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim();
  }

  /* ------------------------------------------------------------------ */
  /* 1. Boot loader (0% -> 100%)                                         */
  /* ------------------------------------------------------------------ */
  function runBootLoader(onDone) {
    var loader = document.getElementById('boot-loader');
    if (!loader) { onDone(); return; }
    var countEl = loader.querySelector('.boot-loader__count');
    var barEl = loader.querySelector('.boot-loader__bar-fill');
    var logoFillEl = loader.querySelector('.boot-loader__logo--fill');

    if (reducedMotion) {
      if (logoFillEl) logoFillEl.style.clipPath = 'inset(0 0 0 0)';
      loader.setAttribute('data-done', 'true');
      onDone();
      return;
    }

    var start = null;
    var duration = 1100;
    function frame(ts) {
      if (!start) start = ts;
      var progress = Math.min(1, (ts - start) / duration);
      var pct = Math.round(progress * 100);
      if (countEl) countEl.textContent = pct + '%';
      if (barEl) barEl.style.width = pct + '%';
      if (logoFillEl) logoFillEl.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        loader.setAttribute('data-done', 'true');
        setTimeout(onDone, 350);
      }
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ */
  /* 2. Video de fondo del hero (respeta reduced-motion)                 */
  /* ------------------------------------------------------------------ */
  function initBackgroundVideos() {
    document.querySelectorAll('video[data-bg]').forEach(function (v) {
      if (reducedMotion) {
        v.removeAttribute('autoplay');
        v.pause();
      } else {
        v.play().catch(function () {});
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. Header: sombra al hacer scroll + menu mobile                     */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* 4. Reveal on scroll                                                  */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 4a2. Tilt 3D sutil en las cards de "quiénes somos" (solo desktop)    */
  /* ------------------------------------------------------------------ */
  function initCardTilt() {
    if (reducedMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var cards = document.querySelectorAll('[data-tilt]');
    var MAX_TILT = 6;
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var tiltY = (px - 0.5) * MAX_TILT * 2;
        var tiltX = (0.5 - py) * MAX_TILT * 2;
        card.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
        card.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4b. "Quiénes somos" — contadores que suben al entrar en pantalla     */
  /* ------------------------------------------------------------------ */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count-to]');
    if (!nums.length) return;

    function run(el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reducedMotion) {
        el.textContent = target + suffix;
        return;
      }
      var start = null;
      var duration = 1100;
      function frame(ts) {
        if (!start) start = ts;
        var progress = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) {
      nums.forEach(run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 5. Demos de producto (simuladas, sin backend)                       */
  /* ------------------------------------------------------------------ */
  var DEMOS = {
    'soberano-ai': {
      title: 'soberano@lab',
      greeting: 'Hola, soy la IA propia de SoberanoLab. Esto es un adelanto simulado mientras conectamos el motor local en vivo — preguntame lo que quieras sobre lo que hacemos.',
      script: [
        { kw: ['quienes son', 'quien es soberanolab', 'que es soberanolab', 'que hacen'], reply: 'Somos una empresa de tecnologia que construye agentes de IA propios, corriendo en servidores propios con Ollama, sin depender de la nube de nadie.' },
        { kw: ['ollama', 'modelo local', 'servidor propio', 'infraestructura'], reply: 'Corremos modelos open source con Ollama en infraestructura propia. Ni tus datos ni los de tus clientes salen a una nube de terceros.' },
        { kw: ['producto', 'catalogo', 'agentes'], reply: 'Tenemos 4 agentes listos: Asistente Comercial 24/7, Cotizador Inteligente, Atencion al Cliente y Pagina Web Inteligente. Los podes ver y probar en el catalogo.' },
        { kw: ['precio', 'cuesta', 'vale'], reply: 'Cada agente tiene su propio setup y mensualidad, lo ves en su ficha dentro del catalogo.' },
        { kw: ['proyecto', 'trabajo', 'portfolio', 'casos'], reply: 'Podes ver nuestros proyectos reales mas abajo, con casos como Salvatierra, LMASM Deco y HouseGur.' },
        { kw: ['contacto', 'contactar', 'hablar con alguien', 'whatsapp', 'email', 'correo'], reply: 'Podes escribirnos por WhatsApp o mail desde la seccion de Contacto, mas abajo en esta pagina.' }
      ],
      fallback: [
        'Todavia estoy en modo vista previa. Preguntame sobre que hacemos, nuestros agentes o la infraestructura propia.',
        'Puedo contarte sobre SoberanoLab, nuestros agentes o como funciona la infraestructura local. ¿Que queres saber?',
        'Esta es una vista previa simulada del motor local. Preguntame algo sobre SoberanoLab.'
      ]
    },
    'comprar-asesor': {
      title: 'asesor@soberanolab',
      greeting: '¡Hola! Antes de comprar, contame qué necesita resolver tu negocio y te digo qué agente te conviene.',
      script: [
        { kw: ['vender', 'atender', 'tienda', 'ecommerce', 'clientes todo el dia', '24/7', 'catalogo'], reply: 'Para eso te conviene el Asistente Comercial 24/7 — responde dudas y guía la compra en tu tienda online, corriendo en tu propio servidor.' },
        { kw: ['precio', 'cotizar', 'cotizacion', 'presupuesto', 'calcular'], reply: 'Eso lo resuelve el Cotizador Inteligente — calcula precios y genera el PDF de cotización al instante.' },
        { kw: ['horario', 'pregunta frecuente', 'faq', 'duda', 'consulta basica'], reply: 'Te conviene Atención al Cliente — resuelve preguntas frecuentes y horarios para cualquier rubro.' },
        { kw: ['pagina web', 'sitio', 'landing', 'agente en mi web', 'web inteligente'], reply: 'Ahí encaja Página Web Inteligente — e-commerce o landing page con un agente de IA integrado.' }
      ],
      fallback: [
        'Contame un poco más: ¿necesitás vender, cotizar, atender consultas, o un agente integrado en tu web?',
        'Para recomendarte bien, decime qué es lo primero que querés resolver en tu negocio.',
        'Cuando quieras, abajo tenés el botón para comprar directo — pero si me contás qué necesitás te ayudo a elegir mejor.'
      ]
    }
  };

  /* ------------------------------------------------------------------ */
  /* 5d. Agente real (webhook n8n) — con el simulador como respaldo       */
  /* ------------------------------------------------------------------ */
  var AGENT_WEBHOOK_URL = 'https://palasino.app.n8n.cloud/webhook/059f93e8-6c33-4b70-97f9-1925e03e5002/chat';

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'sid-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function askOllama(config, userText) {
    if (!config._sessionId) config._sessionId = uuid();

    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 15000);

    return fetch(AGENT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput: userText, sessionId: config._sessionId }),
      signal: controller.signal
    }).then(function (res) {
      clearTimeout(timeout);
      if (!res.ok) throw new Error('agent http ' + res.status);
      return res.json();
    }).then(function (data) {
      var reply = (data && (data.output || data.text || data.message || data.reply || data.answer) || '').toString().trim();
      if (!reply) throw new Error('respuesta vacia');
      return reply;
    }).catch(function (err) {
      clearTimeout(timeout);
      throw err;
    });
  }

  function matchReply(config, userText) {
    var norm = normalize(userText);
    var best = null;
    var bestScore = 0;
    config.script.forEach(function (entry) {
      var score = entry.kw.reduce(function (acc, kw) {
        return acc + (norm.indexOf(normalize(kw)) !== -1 ? 1 : 0);
      }, 0);
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    if (best) return best.reply;
    config._fbIndex = ((config._fbIndex || 0) + 1) % config.fallback.length;
    return config.fallback[config._fbIndex];
  }

  function appendMsg(body, who, text) {
    var wrap = document.createElement('div');
    wrap.className = 'demo-msg ' + (who === 'agent' ? 'demo-msg--agent' : 'demo-msg--user');
    var label = document.createElement('span');
    label.className = 'who';
    label.textContent = who === 'agent' ? 'agente' : 'vos';
    var content = document.createElement('span');
    content.textContent = text;
    wrap.appendChild(label);
    wrap.appendChild(content);
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
    return wrap;
  }

  function bootChatPanel(panel, config, opts) {
    opts = opts || {};
    var body = panel.querySelector('[data-demo-body]');
    var form = panel.querySelector('[data-demo-form]');
    var input = panel.querySelector('[data-demo-input]');
    if (!body || !form || !input) return;

    if (reducedMotion) {
      appendMsg(body, 'agent', config.greeting);
      if (opts.voice) speakText(config.greeting);
      enableForm();
    } else {
      var connecting = document.createElement('p');
      connecting.className = 'demo-typing';
      connecting.textContent = 'conectando...';
      body.appendChild(connecting);
      setTimeout(function () {
        connecting.remove();
        appendMsg(body, 'agent', config.greeting);
        if (opts.voice) speakText(config.greeting);
        enableForm();
      }, 700);
    }

    function enableForm() {
      input.disabled = false;
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();
      if (!value) return;
      appendMsg(body, 'user', value);
      input.value = '';
      input.disabled = true;

      var typing = document.createElement('p');
      typing.className = 'demo-typing';
      typing.textContent = 'agente escribiendo...';
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;

      function finish(reply) {
        typing.remove();
        appendMsg(body, 'agent', reply);
        if (opts.voice) speakText(reply);
        input.disabled = false;
        input.focus();
      }

      askOllama(config, value).then(finish).catch(function () {
        var delay = reducedMotion ? 150 : (400 + Math.random() * 500);
        setTimeout(function () { finish(matchReply(config, value)); }, delay);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* AI Experience — el chat aparece al tocar el boton                   */
  /* ------------------------------------------------------------------ */
  function initAiExperience() {
    var trigger = document.getElementById('ia-trigger');
    var wrap = document.getElementById('ia-chat-wrap');
    var panel = document.getElementById('ia-chat');
    var config = DEMOS['soberano-ai'];
    if (!trigger || !wrap || !panel || !config) return;
    var started = false;

    trigger.addEventListener('click', function () {
      var willOpen = !wrap.classList.contains('is-open');
      wrap.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

      if (willOpen && !started) {
        started = true;
        bootChatPanel(panel, config, { voice: true });
      } else if (willOpen) {
        var input = panel.querySelector('[data-demo-input]');
        if (input && !input.disabled) input.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Asesor de compra — modal que abre el tile "Comprar" del catálogo     */
  /* ------------------------------------------------------------------ */
  function initBuyAdvisor() {
    var trigger = document.getElementById('comprar-trigger');
    var modal = document.getElementById('comprar-chat-modal');
    var backdrop = document.getElementById('comprar-modal-backdrop');
    var closeBtn = document.getElementById('comprar-modal-close');
    var config = DEMOS['comprar-asesor'];
    if (!trigger || !modal || !config) return;
    var started = false;

    function open() {
      modal.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      if (!started) {
        started = true;
        bootChatPanel(modal, config);
      }
    }
    function close() {
      modal.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', open);
    if (backdrop) backdrop.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });

    var textarea = document.getElementById('input-comprar-asesor');
    var sendBtn = document.getElementById('comprar-chat-send');
    var form = textarea ? textarea.closest('form') : null;
    if (!textarea || !sendBtn || !form) return;

    var MIN_H = 24;
    var MAX_H = 160;
    function resize() {
      textarea.style.height = MIN_H + 'px';
      var next = Math.max(MIN_H, Math.min(textarea.scrollHeight, MAX_H));
      textarea.style.height = next + 'px';
    }
    function updateSendState() {
      sendBtn.classList.toggle('is-active', textarea.value.trim().length > 0);
    }
    textarea.addEventListener('input', function () { resize(); updateSendState(); });
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!textarea.disabled && textarea.value.trim()) form.requestSubmit();
      }
    });
    form.addEventListener('submit', function () {
      setTimeout(function () { resize(); updateSendState(); }, 0);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Composer del chat de IA Experience: auto-resize, Enter, chips        */
  /* ------------------------------------------------------------------ */
  function initIaChatComposer() {
    var textarea = document.getElementById('input-soberano-ai');
    var sendBtn = document.getElementById('ia-chat-send');
    var quickWrap = document.getElementById('ia-chat-quick');
    var form = textarea ? textarea.closest('form') : null;
    if (!textarea || !sendBtn || !form) return;

    var MIN_H = 24;
    var MAX_H = 160;

    function resize() {
      textarea.style.height = MIN_H + 'px';
      var next = Math.max(MIN_H, Math.min(textarea.scrollHeight, MAX_H));
      textarea.style.height = next + 'px';
    }

    function updateSendState() {
      sendBtn.classList.toggle('is-active', textarea.value.trim().length > 0);
    }

    textarea.addEventListener('input', function () {
      resize();
      updateSendState();
    });

    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!textarea.disabled && textarea.value.trim()) form.requestSubmit();
      }
    });

    form.addEventListener('submit', function () {
      setTimeout(function () {
        resize();
        updateSendState();
      }, 0);
    });

    if (quickWrap) {
      quickWrap.querySelectorAll('[data-quick-prompt]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (textarea.disabled) return;
          textarea.value = btn.getAttribute('data-quick-prompt') || '';
          resize();
          updateSendState();
          form.requestSubmit();
        });
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initReveal();
    initCardTilt();
    initCounters();
    initAiExperience();
    initBuyAdvisor();
    initIaChatComposer();
    initVoiceSelection();
    initVoiceToggle();
    initVoiceInput();
    initBackgroundVideos();
    runBootLoader(function () {});
  });
})();
