/* Galería orbital 3D — "quiénes somos".
   Misma idea que el componente ParticleSphere (react-three-fiber) que nos pasaron:
   una nube de partículas + fotos orbitando una esfera. Está hecho con Three.js
   directo (ESM nativo del navegador, sin build ni Babel) en vez de react-three-fiber:
   r3f depende de su propio reconciliador de React, demasiado frágil para meterlo
   sin un entorno de build donde probarlo antes de que lo veas — Three.js puro
   da el mismo resultado visual e interactivo con muchas menos piezas que puedan romperse. */

import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

(function () {
  var mount = document.getElementById('orbit-gallery');
  if (!mount) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Fotos y videos reales de SoberanoLab — nada de stock. */
  var ASSETS = [
    { type: 'video', src: 'img/V2.mp4' },
    { type: 'video', src: 'img/v1.2.mp4' },
    { type: 'image', src: 'img/PHOTO-2026-02-18-13-00-44.jpg' },
    { type: 'video', src: 'img/vvz.mov' },
    { type: 'image', src: 'img/zzs.jpg' },
    { type: 'image', src: 'img/logo_sin_c.png' },
  ];

  /* Contenedor invisible donde viven los <video> reales (hacen falta en el DOM
     para que el navegador los reproduzca de forma confiable). */
  var videoHost = document.createElement('div');
  videoHost.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
  document.body.appendChild(videoHost);

  function makeTexture(asset, loader) {
    if (asset.type === 'video') {
      var video = document.createElement('video');
      video.src = asset.src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = reducedMotion ? 'none' : 'auto';
      videoHost.appendChild(video);
      if (!reducedMotion) video.play().catch(function () {});
      var tex = new THREE.VideoTexture(video);
      if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }
    var imgTex = loader.load(asset.src);
    if ('colorSpace' in imgTex) imgTex.colorSpace = THREE.SRGBColorSpace;
    return imgTex;
  }

  var SPHERE_RADIUS = 9;
  var IMAGE_SIZE = 1.6;
  var IMAGE_COUNT = 18;
  var PARTICLE_COUNT = reducedMotion ? 0 : 700;
  var POSITION_RANDOMNESS = 4;

  var width = mount.clientWidth || 1;
  var height = mount.clientHeight || 1;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(-10, 1.5, 10);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  var pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  var group = new THREE.Group();
  scene.add(group);

  /* Nube de partículas — blanca y sutil, no arcoíris como el original. */
  var particleGeo = new THREE.SphereGeometry(1, 6, 4);
  var particleMat = new THREE.MeshBasicMaterial({ color: 0xf2f2f0, transparent: true, opacity: 0.45 });
  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
    var theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
    var r = SPHERE_RADIUS + (Math.random() - 0.5) * POSITION_RANDOMNESS;
    var x = r * Math.cos(theta) * Math.sin(phi);
    var y = r * Math.cos(phi);
    var z = r * Math.sin(theta) * Math.sin(phi);
    var particle = new THREE.Mesh(particleGeo, particleMat);
    particle.position.set(x, y, z);
    particle.scale.setScalar(Math.random() * 0.006 + 0.004);
    group.add(particle);
  }

  /* Fotos/videos orbitando, mirando hacia afuera de la esfera.
     Una sola textura por asset (se reutiliza si el ciclo la repite). */
  var loader = new THREE.TextureLoader();
  var textures = ASSETS.map(function (asset) { return makeTexture(asset, loader); });
  var planeGeo = new THREE.PlaneGeometry(IMAGE_SIZE, IMAGE_SIZE);
  for (var j = 0; j < IMAGE_COUNT; j++) {
    var angle = (j / IMAGE_COUNT) * Math.PI * 2;
    var ix = SPHERE_RADIUS * Math.cos(angle);
    var iz = SPHERE_RADIUS * Math.sin(angle);
    var pos = new THREE.Vector3(ix, 0, iz);
    var tex = textures[j % textures.length];
    var mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true });
    var plane = new THREE.Mesh(planeGeo, mat);
    plane.position.copy(pos);
    plane.lookAt(pos.clone().multiplyScalar(2));
    group.add(plane);
  }

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableRotate = !reducedMotion;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  function animate() {
    if (!reducedMotion) group.rotation.y += 0.0009;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  if (reducedMotion) renderer.render(scene, camera);

  window.addEventListener('resize', function () {
    var w = mount.clientWidth || 1;
    var h = mount.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
