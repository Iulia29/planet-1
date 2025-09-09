import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';

// --- SCENĂ ȘI CAMERĂ ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 40, 120);

// --- RENDERER ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- CONTROLS ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- STELE ---
const starsGeometry = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 2000; i++) {
  starVertices.push(
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000
  );
}
starsGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Twinkle efect
gsap.to(starsMaterial, {
  duration: 1,
  opacity: 0.3,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut"
});

// --- LOADER TEXTURI ---
const loader = new THREE.TextureLoader();

// --- SOARE CU GLOW HALO ---
const sunGeometry = new THREE.SphereGeometry(4, 64, 64);
const sunMaterial = new THREE.MeshPhongMaterial({
  emissive: 0xffdd00,
  emissiveIntensity: 1,
  color: 0xffff00
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Halo glow
const sunGlowGeo = new THREE.SphereGeometry(5, 32, 32);
const sunGlowMat = new THREE.MeshBasicMaterial({ color: 0xffdd00, transparent: true, opacity: 0.2 });
const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
scene.add(sunGlow);

// --- LUMINĂ ---
const pointLight = new THREE.PointLight(0xffffff, 2, 300);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// --- DATE PLANETE ---
const planetData = [
  { name: "Mercur", texture: "textures/mercury.jpg", radius: 2, distance: 8 },
  { name: "Venus", texture: "textures/venus.jpg", radius: 3, distance: 12 },
  { name: "Pământ", texture: "textures/earth.jpg", radius: 3.2, distance: 16 },
  { name: "Marte", texture: "textures/mars.jpg", radius: 2.4, distance: 20 },
  { name: "Jupiter", texture: "textures/jupiter.jpg", radius: 5, distance: 26 },
  { name: "Saturn", texture: "textures/saturn.jpg", radius: 4.4, distance: 32 },
  { name: "Uranus", texture: "textures/uranus.jpg", radius: 3.6, distance: 38 },
  { name: "Neptun", texture: "textures/neptune.jpg", radius: 3.4, distance: 44 },
  { name: "Pluto", texture: "textures/pluto.jpg", radius: 1.6, distance: 50 }
];

const planets = [];

planetData.forEach((data) => {
  const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
  const material = new THREE.MeshStandardMaterial({ map: loader.load(data.texture) });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = data.distance;
  scene.add(mesh);
  planets.push(mesh);

  // Orbit vizual
  const orbitGeo = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 128);
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
  const orbit = new THREE.Mesh(orbitGeo, orbitMat);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  // Inele Saturn
  if (data.name === "Saturn") {
    const ringGeo = new THREE.RingGeometry(data.radius + 0.5, data.radius + 1.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    mesh.add(ring);
  }

  // Luna Pământ
  if (data.name === "Pământ") {
    const moonGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(data.radius + 3, 0, 0);
    mesh.add(moon);
    mesh.userData.moon = moon;
  }
});

// --- INTERACTIVITATE (hover glow + click puls) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredPlanet = null;

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("click", () => {
  if (hoveredPlanet) {
    gsap.to(hoveredPlanet.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.2, yoyo: true, repeat: 1 });
    gsap.to(camera.position, {
      duration: 1.5,
      x: hoveredPlanet.position.x + 10,
      y: hoveredPlanet.position.y + 5,
      z: hoveredPlanet.position.z + 10,
      onUpdate: () => camera.lookAt(hoveredPlanet.position)
    });
  }
});

// --- ANIMAȚIE PLANETE ---
let angle = 0;
function animate() {
  requestAnimationFrame(animate);
  angle += 0.001;

  planets.forEach((p, i) => {
    const speed = 0.001 + i * 0.0005;
    p.rotation.y += speed;
    p.position.x = planetData[i].distance * Math.cos(angle * (i + 1));
    p.position.z = planetData[i].distance * Math.sin(angle * (i + 1));

    if (p.userData.moon) {
      const moon = p.userData.moon;
      moon.position.x = 3 * Math.cos(angle * 5);
      moon.position.z = 3 * Math.sin(angle * 5);
    }
  });

  // Hover glow
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    if (hoveredPlanet && hoveredPlanet !== intersects[0].object) {
      hoveredPlanet.material.emissive.setHex(0x000000);
    }
    hoveredPlanet = intersects[0].object;
    hoveredPlanet.material.emissive.setHex(0x333333);
  } else if (hoveredPlanet) {
    hoveredPlanet.material.emissive.setHex(0x000000);
    hoveredPlanet = null;
  }

  sun.rotation.y += 0.002;
  sunGlow.rotation.y += 0.002;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- REDIMENSIONARE ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
