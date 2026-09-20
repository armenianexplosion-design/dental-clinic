import * as THREE from "three";
import type { MotionValue } from "motion/react";

// Premium scroll-driven particle tooth.
// A sculptural incisor is built from a rounded crown + tapering root, then
// re-expressed as thousands of GPU points. Scroll progress disperses them into
// a cinematic 3D particle field; scrolling back reconstructs the tooth exactly.

type Capability = { count: number; sizeScale: number };

function classifyCapability(): Capability {
  const w = window.innerWidth;
  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = w < 768;
  const tablet = w >= 768 && w < 1024;
  if (mobile) return { count: dpr > 2 || cores >= 8 ? 6500 : 4200, sizeScale: 1.25 };
  if (tablet) return { count: 9000, sizeScale: 1.1 };
  if (cores >= 8 && dpr <= 2) return { count: 15000, sizeScale: 1.0 };
  return { count: 11000, sizeScale: 1.0 };
}

// Simple deterministic PRNG so dispersion vectors are stable across reloads.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildToothGeometries() {
  // Crown: a rounded, slightly squashed form — chisel-like incisor crown.
  const crown = new THREE.SphereGeometry(1, 64, 48);
  const crownMatrix = new THREE.Matrix4().makeScale(0.95, 1.28, 0.72);
  crown.applyMatrix4(crownMatrix);

  // Incisal edge: flatten the bottom of the crown a touch for a chisel read.
  const pos = crown.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < -0.4) pos.setY(i, y * 0.55);
  }
  crown.computeVertexNormals();

  // Root: a single tapering cone dropping below the crown.
  const root = new THREE.ConeGeometry(0.42, 1.85, 40, 18, true);
  root.translate(0, -1.78, 0);
  root.rotateX(Math.PI); // apex pointing down
  root.translate(0, -1.05, 0);
  root.computeVertexNormals();

  return [crown, root];
}

type Sample = { positions: Float32Array; normals: Float32Array };

function sampleSurface(geometries: THREE.BufferGeometry[], count: number, rand: () => number): Sample {
  // Gather triangles across all geometries with area weighting.
  const tris: { g: THREE.BufferGeometry; a: number; b: number; c: number; area: number; mtx: THREE.Matrix4 }[] = [];
  let total = 0;
  const v = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  for (const g of geometries) {
    g.computeVertexNormals();
    const p = g.attributes.position as THREE.BufferAttribute;
    const idx = g.index;
    const triCount = idx ? idx.count / 3 : p.count / 3;
    for (let t = 0; t < triCount; t++) {
      const a = idx ? idx.getX(t * 3) : t * 3;
      const b = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
      const c = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      const ax = p.getX(a), ay = p.getY(a), az = p.getZ(a);
      const bx = p.getX(b), by = p.getY(b), bz = p.getZ(b);
      const cx = p.getX(c), cy = p.getY(c), cz = p.getZ(c);
      const ux = bx - ax, uy = by - ay, uz = bz - az;
      const wx = cx - ax, wy = cy - ay, wz = cz - az;
      const crossY = uz * wx - ux * wz;
      const crossZ = ux * wy - uy * wx;
      const crossX = uy * wz - uz * wy;
      const area = 0.5 * Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
      tris.push({ g, a, b, c, area, mtx: g.matrixWorld });
      total += area;
    }
  }
  void v; void tmp;

  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const pa = new THREE.Vector3(), pb = new THREE.Vector3(), pc = new THREE.Vector3();
  const na = new THREE.Vector3(), nb = new THREE.Vector3(), nc = new THREE.Vector3();
  const n = new THREE.Vector3(), p = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    let r = rand() * total;
    let tri = tris[0];
    for (let k = 0; k < tris.length; k++) { if (r < tris[k].area) { tri = tris[k]; break; } r -= tris[k].area; }
    // barycentric
    let u = rand(), vv = rand();
    if (u + vv > 1) { u = 1 - u; vv = 1 - vv; }
    const ww = 1 - u - vv;
    const attr = tri.g.attributes.position as THREE.BufferAttribute;
    const nattr = tri.g.attributes.normal as THREE.BufferAttribute;
    pa.set(attr.getX(tri.a), attr.getY(tri.a), attr.getZ(tri.a));
    pb.set(attr.getX(tri.b), attr.getY(tri.b), attr.getZ(tri.b));
    pc.set(attr.getX(tri.c), attr.getY(tri.c), attr.getZ(tri.c));
    na.set(nattr.getX(tri.a), nattr.getY(tri.a), nattr.getZ(tri.a));
    nb.set(nattr.getX(tri.b), nattr.getY(tri.b), nattr.getZ(tri.b));
    nc.set(nattr.getX(tri.c), nattr.getY(tri.c), nattr.getZ(tri.c));
    p.copy(pa).multiplyScalar(ww).addScaledVector(pb, u).addScaledVector(pc, vv);
    n.copy(na).multiplyScalar(ww).addScaledVector(nb, u).addScaledVector(nc, vv).normalize();
    p.applyMatrix4(tri.mtx);
    // transform normal by upper-left 3x3 (uniform-ish scale here, so normalize is fine)
    const m = tri.mtx;
    n.set(
      n.x * m.elements[0] + n.y * m.elements[4] + n.z * m.elements[8],
      n.x * m.elements[1] + n.y * m.elements[5] + n.z * m.elements[9],
      n.x * m.elements[2] + n.y * m.elements[6] + n.z * m.elements[10],
    ).normalize();
    positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z;
    normals[i * 3] = n.x; normals[i * 3 + 1] = n.y; normals[i * 3 + 2] = n.z;
  }
  return { positions, normals };
}

const IVORY = new THREE.Color("#f3efe6");
const CHAMPAGNE = new THREE.Color("#c9ac78");
const PEARL = new THREE.Color("#e7ddc9");
const HIGHLIGHT = new THREE.Color("#fff4e0");

function buildColors(positions: Float32Array, rand: () => number): Float32Array {
  const n = positions.length / 3;
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) { const y = positions[i * 3 + 1]; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  const colors = new Float32Array(n * 3);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const y = positions[i * 3 + 1];
    const t = (y - minY) / (maxY - minY); // 0 bottom .. 1 top
    const champFactor = 0.16 + 0.22 * rand() + 0.18 * (1 - t);
    c.copy(IVORY).lerp(CHAMPAGNE, champFactor);
    if (t > 0.82) c.lerp(PEARL, 0.45);
    if (t > 0.93 && rand() > 0.6) c.lerp(HIGHLIGHT, 0.5);
    // occasional champagne metallic sparkles
    if (rand() > 0.965) c.copy(CHAMPAGNE).lerp(HIGHLIGHT, 0.3);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  return colors;
}

function buildDispersion(
  positions: Float32Array,
  normals: Float32Array,
  rand: () => number,
) {
  const n = positions.length / 3;
  const disp = new Float32Array(n * 3);
  const mag = new Float32Array(n);
  const delay = new Float32Array(n);
  const range = new Float32Array(n);
  const size = new Float32Array(n);
  const dir = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const spherical = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    normal.set(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]);
    // base outward direction with a random spherical perturbation
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    spherical.set(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi));
    dir.copy(normal).multiplyScalar(0.7).addScaledVector(spherical, 0.5).normalize();
    // depth bias: ~35% drift toward camera, ~25% recede into background
    const depthRoll = rand();
    if (depthRoll > 0.65) dir.z += 0.9 + rand() * 0.8;
    else if (depthRoll < 0.25) dir.z -= 0.8 + rand() * 0.8;
    dir.normalize();
    const speedClass = rand();
    const magnitude = 1.6 + rand() * 3.2 + (speedClass > 0.85 ? 3.0 : 0);
    disp[i * 3] = dir.x; disp[i * 3 + 1] = dir.y; disp[i * 3 + 2] = dir.z;
    mag[i] = magnitude;
    // staggered onset so the tooth dissolves progressively, not all at once
    delay[i] = rand() * 0.32;
    range[i] = 0.42 + rand() * 0.3;
    size[i] = 0.6 + rand() * 1.1;
  }
  return { disp, mag, delay, range, size };
}

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  attribute vec3 aDisp;
  attribute float aMag;
  attribute float aDelay;
  attribute float aRange;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;

  float ease(float t) { return t * t * (3.0 - 2.0 * t); }

  void main() {
    vColor = aColor;
    float local = clamp((uProgress - aDelay) / aRange, 0.0, 1.0);
    float amt = ease(local);
    vec3 pos = position + aDisp * aMag * amt;
    // whisper of life while the tooth is assembled; vanishes as it disperses
    float idle = (1.0 - amt) * 0.012;
    pos += normal * sin(uTime * 0.7 + aDelay * 50.0) * idle;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    vDepth = dist;
    gl_PointSize = aSize * uSizeScale * uPixelRatio * (320.0 / dist) * (0.9 + amt * 0.7);
    vAlpha = mix(0.92, 0.6, amt);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);
    // champagne metallic sheen concentrated at the particle core
    float sheen = pow(1.0 - clamp(d * 2.0, 0.0, 1.0), 2.5) * 0.35;
    float depthFade = clamp((vDepth - 2.0) / 18.0, 0.0, 1.0);
    vec3 col = vColor + sheen * vec3(1.0, 0.92, 0.78);
    gl_FragColor = vec4(col, vAlpha * soft * (1.0 - depthFade * 0.25));
  }
`;

export async function mountToothParticles(
  host: HTMLElement,
  progress: MotionValue<number>,
  reduced: boolean,
  ready: () => void,
  failed: () => void,
) {
  const cap = classifyCapability();
  const rand = mulberry32(20260920);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);

  // Build the tooth from crown + root, bake world matrices, then sample points.
  const geoms = buildToothGeometries();
  const group = new THREE.Group();
  const meshes = geoms.map((g) => {
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial());
    group.add(m);
    return m;
  });
  group.updateMatrixWorld(true);
  // center the tooth vertically
  const box = new THREE.Box3().setFromObject(group);
  const centerY = (box.min.y + box.max.y) / 2;
  group.position.y = -centerY;
  group.updateMatrixWorld(true);

  const sample = sampleSurface(geoms, cap.count, rand);
  const colors = buildColors(sample.positions, rand);
  const disp = buildDispersion(sample.positions, sample.normals, rand);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(sample.positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(sample.normals, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aDisp", new THREE.BufferAttribute(disp.disp, 3));
  geometry.setAttribute("aMag", new THREE.BufferAttribute(disp.mag, 1));
  geometry.setAttribute("aDelay", new THREE.BufferAttribute(disp.delay, 1));
  geometry.setAttribute("aRange", new THREE.BufferAttribute(disp.range, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(disp.size, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: reduced ? 0 : 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uSizeScale: { value: cap.sizeScale },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geometry, material);
  // the sample positions are already in world space of the original group;
  // re-parent into a rotating group so the whole field rotates with the tooth
  const rotor = new THREE.Group();
  rotor.add(points);
  scene.add(rotor);

  // discard the source meshes (only used for sampling)
  meshes.forEach((m) => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
  geoms.forEach((g) => g.dispose());

  let frame = 0, visible = false, disposed = false, lost = false;
  const clock = new THREE.Clock();

  const draw = () => {
    frame = 0;
    if (disposed || !visible || lost || document.hidden) return;
    const rect = host.getBoundingClientRect();
    const width = rect.width, height = rect.height;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, 0.15, 8.4);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    const p = reduced ? 0 : THREE.MathUtils.clamp(progress.get(), 0, 1);
    material.uniforms.uProgress.value = p;
    material.uniforms.uTime.value = clock.getElapsedTime();
    // cinematic rotation + subtle dolly as the tooth dissolves
    rotor.rotation.y = -0.5 + p * 0.9;
    rotor.rotation.x = 0.05 - p * 0.12;
    camera.position.z = 8.4 + p * 1.6;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    ready();
  };

  const schedule = () => { if (!frame && !disposed && !lost) frame = requestAnimationFrame(draw); };
  const unsubscribe = reduced ? () => {} : progress.on("change", schedule);
  const intersection = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) schedule(); });
  intersection.observe(host);
  const resize = new ResizeObserver(schedule); resize.observe(host);
  const contextLost = (event: Event) => { event.preventDefault(); lost = true; failed(); };
  const contextRestored = () => { lost = false; schedule(); };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
  document.addEventListener("visibilitychange", schedule);

  // animate time so the idle shimmer breathes while assembled
  let raf = 0;
  const tick = () => { if (disposed) return; raf = requestAnimationFrame(tick); schedule(); };
  if (!reduced) raf = requestAnimationFrame(tick);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame); cancelAnimationFrame(raf);
    unsubscribe(); intersection.disconnect(); resize.disconnect();
    document.removeEventListener("visibilitychange", schedule);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    renderer.domElement.removeEventListener("webglcontextrestored", contextRestored);
    geometry.dispose(); material.dispose();
    geoms.forEach((g) => g.dispose());
    renderer.dispose(); renderer.domElement.remove();
  };
}
