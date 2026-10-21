/* ============================================================
   PANEL DEL AGENTE — "Agente de Pedro"
   Chat por texto y voz contra el mismo webhook de n8n que ya
   usa el resto del sitio. Degrada con gracia si no hay mic.
   ============================================================ */
(function () {
  var AGENT_WEBHOOK_URL = 'https://palasino.app.n8n.cloud/webhook/a0b11cac-a4c1-4b03-b174-efa78beab36e/chat';
  var GREETING = 'Hola, soy el agente de Pedro. Preguntame por su experiencia, sus proyectos o su stack.';

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'sid-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function init() {
    var panel = document.getElementById('agent-panel');
    if (!panel) return;

    var orb = document.getElementById('agent-orb');
    var statusEl = document.getElementById('agent-status');
    var messagesEl = document.getElementById('agent-messages');
    var form = document.getElementById('agent-form');
    var input = document.getElementById('agent-input');
    var micBtn = document.getElementById('agent-mic');

    var sessionId = uuid();
    var IDLE_STATUS = 'Tocá el micrófono o escribí';

    function setOrbState(state) {
      orb.classList.remove('is-listening', 'is-thinking', 'is-speaking');
      if (state) orb.classList.add(state);
    }

    function setStatus(text) {
      statusEl.textContent = text;
    }

    function addMessage(text, who) {
      var div = document.createElement('div');
      div.className = 'agent-msg agent-msg--' + who;
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    addMessage(GREETING, 'agent');

    /* ---------------- Voz: síntesis (TTS) ---------------- */
    var cachedVoices = [];
    function loadVoices() {
      try { cachedVoices = window.speechSynthesis.getVoices() || []; } catch (_) {}
    }
    function pickVoice() {
      if (!cachedVoices.length) loadVoices();
      var spanishVoices = cachedVoices.filter(function (v) { return /es/i.test(v.lang); });
      var natural = spanishVoices.find(function (v) { return /natural|neural|online/i.test(v.name); });
      if (natural) return natural;
      var male = spanishVoices.find(function (v) { return /male|hombre|jorge|diego/i.test(v.name); });
      if (male) return male;
      return spanishVoices[0] || cachedVoices[0] || null;
    }
    if ('speechSynthesis' in window) {
      loadVoices();
      try { window.speechSynthesis.onvoiceschanged = loadVoices; } catch (_) {}
    }

    function speak(text) {
      if (!('speechSynthesis' in window)) {
        setOrbState(null);
        setStatus(IDLE_STATUS);
        return;
      }
      try {
        window.speechSynthesis.cancel();
        var utt = new SpeechSynthesisUtterance(text);
        var voice = pickVoice();
        if (voice) utt.voice = voice;
        utt.lang = 'es-AR';
        utt.rate = 0.98;
        utt.pitch = 0.95;
        utt.volume = 0.85;
        utt.onstart = function () {
          setOrbState('is-speaking');
          setStatus('Hablando…');
        };
        utt.onend = function () {
          setOrbState(null);
          setStatus(IDLE_STATUS);
        };
        utt.onerror = function () {
          setOrbState(null);
          setStatus(IDLE_STATUS);
        };
        window.speechSynthesis.speak(utt);
      } catch (_) {
        setOrbState(null);
        setStatus(IDLE_STATUS);
      }
    }

    var currentAudio = null;
    function playAudioReply(url, fallbackText) {
      try {
        currentAudio = new Audio(url);
        currentAudio.onplay = function () {
          setOrbState('is-speaking');
          setStatus('Hablando…');
        };
        currentAudio.onended = function () {
          setOrbState(null);
          setStatus(IDLE_STATUS);
        };
        currentAudio.onerror = function () {
          speak(fallbackText);
        };
        currentAudio.play().catch(function () { speak(fallbackText); });
      } catch (_) {
        speak(fallbackText);
      }
    }

    /* ---------------- Backend: mismo webhook de n8n ---------------- */
    function askAgent(userText) {
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 15000);
      return fetch(AGENT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: userText, sessionId: sessionId }),
        signal: controller.signal
      }).then(function (res) {
        clearTimeout(timeout);
        if (!res.ok) throw new Error('agent http ' + res.status);
        return res.json();
      }).then(function (data) {
        var reply = (data && (data.output || data.text || data.message || data.reply || data.answer) || '').toString().trim();
        if (!reply) throw new Error('respuesta vacia');
        var audio = null;
        if (data && data.audioUrl) {
          audio = data.audioUrl;
        } else if (data && data.audioBase64) {
          audio = 'data:audio/mpeg;base64,' + data.audioBase64;
        }
        return { reply: reply, audio: audio };
      }).catch(function (err) {
        clearTimeout(timeout);
        throw err;
      });
    }

    function sendMessage(text) {
      text = (text || '').trim();
      if (!text) return;
      addMessage(text, 'user');
      input.value = '';
      setOrbState('is-thinking');
      setStatus('Pensando…');

      askAgent(text).then(function (result) {
        addMessage(result.reply, 'agent');
        if (result.audio) {
          playAudioReply(result.audio, result.reply);
        } else {
          speak(result.reply);
        }
      }).catch(function () {
        var fallback = 'No pude conectar con el agente justo ahora. Probá de nuevo en un rato.';
        addMessage(fallback, 'agent');
        setOrbState(null);
        setStatus(IDLE_STATUS);
      });
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      sendMessage(input.value);
    });

    /* ---------------- Voz: reconocimiento (STT) ---------------- */
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !micBtn) {
      if (micBtn) micBtn.hidden = true;
      return;
    }

    var recognition = new SR();
    recognition.lang = 'es-AR';
    recognition.interimResults = false;
    recognition.continuous = false;
    var listening = false;

    recognition.onstart = function () {
      listening = true;
      micBtn.setAttribute('aria-pressed', 'true');
      setOrbState('is-listening');
      setStatus('Escuchando…');
    };
    recognition.onresult = function (event) {
      var transcript = '';
      for (var i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      transcript = transcript.trim();
      if (transcript) sendMessage(transcript);
    };
    recognition.onerror = function () {
      listening = false;
      micBtn.setAttribute('aria-pressed', 'false');
      setOrbState(null);
      setStatus(IDLE_STATUS);
    };
    recognition.onend = function () {
      listening = false;
      micBtn.setAttribute('aria-pressed', 'false');
      if (statusEl.textContent === 'Escuchando…') {
        setOrbState(null);
        setStatus(IDLE_STATUS);
      }
    };

    micBtn.addEventListener('click', function () {
      try {
        if (listening) {
          recognition.stop();
        } else {
          recognition.start();
        }
      } catch (_) {
        setOrbState(null);
        setStatus(IDLE_STATUS);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
