import * as THREE from 'three';

var mount = document.getElementById('node-sphere-mount');
if (mount) {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 7.2;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  mount.appendChild(renderer.domElement);

  var group = new THREE.Group();
  scene.add(group);

  /* Esfera de nodos: icosaedro subdividido -> vértices = nodos, aristas = conexiones */
  var icoGeo = new THREE.IcosahedronGeometry(3, 2);
  var edges = new THREE.EdgesGeometry(icoGeo);
  var lineMat = new THREE.LineBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.16 });
  var lines = new THREE.LineSegments(edges, lineMat);
  group.add(lines);

  var pointsMat = new THREE.PointsMaterial({ color: 0x0a0a0a, size: 0.075, transparent: true, opacity: 0.85, sizeAttenuation: true });
  var points = new THREE.Points(icoGeo, pointsMat);
  group.add(points);

  /* Núcleo central con "respiración" */
  var coreGeo = new THREE.IcosahedronGeometry(0.62, 1);
  var coreMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.9, wireframe: true });
  var core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);
  var coreGlowMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.06 });
  var coreGlow = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), coreGlowMat);
  group.add(coreGlow);

  /* Pulsos de luz viajando entre nodos al azar */
  var vertexPositions = icoGeo.attributes.position;
  var vertexCount = vertexPositions.count;
  function randomVertex() {
    var i = Math.floor(Math.random() * vertexCount);
    return new THREE.Vector3(vertexPositions.getX(i), vertexPositions.getY(i), vertexPositions.getZ(i));
  }
  var MAX_PULSES = 5;
  var pulseGeo = new THREE.SphereGeometry(0.05, 8, 8);
  var pulses = [];
  function spawnPulse() {
    if (reducedMotion || pulses.length >= MAX_PULSES) return;
    var mat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 1 });
    var mesh = new THREE.Mesh(pulseGeo, mat);
    var from = randomVertex();
    var to = randomVertex();
    mesh.position.copy(from);
    group.add(mesh);
    pulses.push({ mesh: mesh, mat: mat, from: from, to: to, t: 0, duration: 0.9 + Math.random() * 0.6 });
  }

  /* Partículas ambientales, opacidad baja */
  var ambientGeo = new THREE.BufferGeometry();
  var AMBIENT_COUNT = 140;
  var ambientPos = new Float32Array(AMBIENT_COUNT * 3);
  for (var i = 0; i < AMBIENT_COUNT; i++) {
    var r = 5.5 + Math.random() * 3;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    ambientPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    ambientPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    ambientPos[i * 3 + 2] = r * Math.cos(phi);
  }
  ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPos, 3));
  var ambientMat = new THREE.PointsMaterial({ color: 0x0a0a0a, size: 0.045, transparent: true, opacity: 0.18 });
  var ambient = new THREE.Points(ambientGeo, ambientMat);
  scene.add(ambient);

  function resize() {
    var w = mount.clientWidth || 1;
    var h = mount.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  /* Interacción: arrastrar para rotar, auto-rotación cuando está quieto */
  var isDragging = false;
  var lastX = 0, lastY = 0;
  var velX = 0.0016, velY = 0.0009;
  var dragVelX = 0, dragVelY = 0;
  var idleTimer = null;
  var AUTO_RESUME_MS = 2200;

  function onPointerDown(e) {
    isDragging = true;
    lastX = e.clientX; lastY = e.clientY;
    if (idleTimer) clearTimeout(idleTimer);
    mount.setPointerCapture && e.pointerId != null && mount.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!isDragging) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    dragVelX = dx * 0.004;
    dragVelY = dy * 0.004;
    group.rotation.y += dragVelX;
    group.rotation.x += dragVelY;
  }
  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      velX = 0.0016; velY = 0.0009;
    }, AUTO_RESUME_MS);
  }
  mount.style.touchAction = 'none';
  mount.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  if (reducedMotion) {
    resize();
    renderer.render(scene, camera);
  } else {
    var lastSpawn = 0;
    var clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      var dt = clock.getDelta();
      var t = clock.elapsedTime;

      if (!isDragging) {
        group.rotation.y += velX;
        group.rotation.x += velY * 0.4;
      }

      var breathe = 1 + Math.sin(t * 1.4) * 0.08;
      core.scale.setScalar(breathe);
      coreGlow.scale.setScalar(breathe * 1.05);
      coreGlow.material.opacity = 0.05 + Math.sin(t * 1.4) * 0.02;

      ambient.rotation.y += 0.00025;

      if (t - lastSpawn > 1.1) {
        lastSpawn = t;
        spawnPulse();
      }
      for (var i = pulses.length - 1; i >= 0; i--) {
        var p = pulses[i];
        p.t += dt / p.duration;
        if (p.t >= 1) {
          group.remove(p.mesh);
          p.mesh.geometry === pulseGeo || p.mesh.geometry.dispose();
          p.mat.dispose();
          pulses.splice(i, 1);
          continue;
        }
        p.mesh.position.lerpVectors(p.from, p.to, p.t);
        p.mat.opacity = Math.sin(p.t * Math.PI);
      }

      renderer.render(scene, camera);
    })();
  }
}
