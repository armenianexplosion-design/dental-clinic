import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { MotionValue } from "motion/react";

type MeshData = { positions: number[]; indices: number[] };
export async function mountAligner(host: HTMLElement, progress: MotionValue<number>, reduced: boolean, ready: () => void, failed: () => void) {
  const response = await fetch("/models/aligner-study.json");
  if (!response.ok) throw new Error("Dental model unavailable");
  const data: { teeth: MeshData; tray: MeshData } = await response.json();
  // Check after async loading so a departed route never acquires a renderer.
  if (!host.isConnected) return () => {};
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, .04);
  scene.environment = env.texture;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x18243b, 2));
  const key = new THREE.DirectionalLight(0xfff0da, 3); key.position.set(-3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0x769eff, 4); rim.position.set(4, 2, -3); scene.add(rim);
  const material = new THREE.MeshPhysicalMaterial({ color: 0xf1eadd, roughness: .24, metalness: 0, clearcoat: .6, clearcoatRoughness: .15 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xd9eeff, roughness: .08, metalness: 0, transmission: .86, thickness: .06, ior: 1.46, transparent: true, opacity: .8, clearcoat: 1, envMapIntensity: 2.4, side: THREE.DoubleSide, depthWrite: false });
  function geometry(mesh: MeshData) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(mesh.positions, 3)); g.setIndex(mesh.indices); g.computeVertexNormals(); return g;
  }
  const teethGeometry = geometry(data.teeth), trayGeometry = geometry(data.tray);
  const group = new THREE.Group();
  const teeth = new THREE.Mesh(teethGeometry, material), tray = new THREE.Mesh(trayGeometry, glass);
  group.add(teeth, tray); scene.add(group);
  let frame = 0, visible = false, disposed = false, lost = false;
  const draw = () => {
    frame = 0;
    if (disposed || !visible || lost || document.hidden) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, 4.6, camera.aspect < 1.15 ? 10.5 : 8.7);
    camera.lookAt(0, .2, 0); camera.updateProjectionMatrix();
    const p = reduced ? .5 : THREE.MathUtils.clamp(progress.get(), 0, 1);
    group.rotation.set(.04, -.35 + p * .7, -.035);
    tray.position.y = .04 + Math.sin(Math.PI * p) * 1.08;
    renderer.render(scene, camera); ready();
  };
  const schedule = () => { if (!frame && !disposed && !lost) frame = requestAnimationFrame(draw); };
  const unsubscribe = reduced ? () => {} : progress.on("change", schedule);
  const intersection = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) schedule(); }); intersection.observe(host);
  const resize = new ResizeObserver(schedule); resize.observe(host);
  const contextLost = (event: Event) => { event.preventDefault(); lost = true; failed(); };
  const contextRestored = () => { lost = false; schedule(); };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
  document.addEventListener("visibilitychange", schedule);
  return () => {
    disposed = true; cancelAnimationFrame(frame); unsubscribe(); intersection.disconnect(); resize.disconnect();
    document.removeEventListener("visibilitychange", schedule);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost); renderer.domElement.removeEventListener("webglcontextrestored", contextRestored);
    teethGeometry.dispose(); trayGeometry.dispose(); material.dispose(); glass.dispose(); env.dispose(); renderer.dispose(); renderer.domElement.remove();
  };
}
