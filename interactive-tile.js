/* ============================================================
   TILES INTERACTIVAS — "Comprar" y "Quiero ser revendedor"
   Escena 3D real hecha a mano con Three.js (nada de Spline, nada
   de distorsionar un video): una esfera de partículas que gira
   lento y se abre/repele alrededor de donde está el cursor.
   Si no hay soporte WebGL, mouse real, o el usuario pidió
   reduced-motion, se deja el <video> de fondo de siempre (fallback).
   ============================================================ */
(function () {
  function fibonacciSpherePoints(count, radius) {
    var positions = new Float32Array(count * 3);
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < count; i++) {
      var y = 1 - (i / (count - 1)) * 2;
      var r = Math.sqrt(1 - y * y);
      var theta = goldenAngle * i;
      var x = Math.cos(theta) * r;
      var z = Math.sin(theta) * r;
      positions[i * 3] = x * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = z * radius;
    }
    return positions;
  }

  function initInteractiveTile(tile) {
    if (!tile || typeof THREE === 'undefined') return;

    var video = tile.querySelector('.catalogo-tile__video');
    var canvas = tile.querySelector('[data-interactive-canvas]');
    if (!canvas) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var noHover = window.matchMedia('(hover: none)').matches;
    if (reduceMotion || noHover) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) {
      return;
    }

    tile.classList.add('catalogo-tile--has-canvas');
    if (video) {
      video.pause();
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4;

    var COUNT = 1400;
    var RADIUS = 1.35;
    var basePositions = fibonacciSpherePoints(COUNT, RADIUS);
    var positions = new Float32Array(basePositions);

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aBase', new THREE.BufferAttribute(basePositions, 3));

    var uniforms = {
      uMouse: { value: new THREE.Vector2(10, 10) },
      uHover: { value: 0 },
      uAngle: { value: 0 }
    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: [
        'attribute vec3 aBase;',
        'uniform vec2 uMouse;',
        'uniform float uHover;',
        'uniform float uAngle;',
        'varying float vAlpha;',
        '',
        'void main() {',
        '  float c = cos(uAngle);',
        '  float s = sin(uAngle);',
        '  vec3 pos = aBase;',
        '  pos.x = aBase.x * c + aBase.z * s;',
        '  pos.z = aBase.z * c - aBase.x * s;',
        '',
        '  vec2 toMouse = pos.xy - uMouse;',
        '  float dist = length(toMouse) + 0.0001;',
        '  float falloff = smoothstep(0.9, 0.0, dist) * uHover;',
        '  vec2 dir = toMouse / dist;',
        '  pos.xy += dir * falloff * 0.55;',
        '  pos.z += falloff * 0.35;',
        '',
        '  vAlpha = 1.0 - falloff * 0.55;',
        '  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);',
        '  gl_PointSize = (2.6 + falloff * 4.5) * (220.0 / -mvPosition.z);',
        '  gl_Position = projectionMatrix * mvPosition;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying float vAlpha;',
        'void main() {',
        '  vec2 c = gl_PointCoord - vec2(0.5);',
        '  float d = length(c);',
        '  if (d > 0.5) discard;',
        '  float alpha = smoothstep(0.5, 0.0, d) * vAlpha;',
        '  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);',
        '}'
      ].join('\n')
    });

    var points = new THREE.Points(geometry, material);
    scene.add(points);

    function resize() {
      var rect = tile.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener('resize', resize);

    var targetMouse = new THREE.Vector2(10, 10);
    var targetHover = 0;

    tile.addEventListener('pointermove', function (e) {
      var rect = tile.getBoundingClientRect();
      var nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      var ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouse.x = nx * RADIUS * 1.1;
      targetMouse.y = ny * RADIUS * 1.1;
    });
    tile.addEventListener('pointerenter', function () {
      targetHover = 1;
    });
    tile.addEventListener('pointerleave', function () {
      targetHover = 0;
    });

    var isVisible = true;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      io.observe(tile);
    }

    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      var dt = clock.getDelta();

      uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.08;
      uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.08;
      uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.08;
      uniforms.uAngle.value += dt * 0.18;

      renderer.render(scene, camera);
    }
    animate();
  }

  function initAll() {
    var tiles = document.querySelectorAll('[data-interactive-tile]');
    for (var i = 0; i < tiles.length; i++) initInteractiveTile(tiles[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
