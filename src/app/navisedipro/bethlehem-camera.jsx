"use client";

import { useEffect, useRef } from "react";
import styles from "./campaign.module.css";

const shots = ["panorama", "calle", "pesebre"];

const ratios = [0, .25, .52, .76, 1];
const poses = [
  [0, 0, 0],
  [.31, -.55, 4.05],
  [-.18, -.26, 4.35],
  [.2, -.18, 3.05],
  [.42, -.09, 3.55],
];

// Depth is painted against the original view. The road recedes toward the
// village, while the palms and vegetation frame the near end of the path.
function depthAt(u, v, shot) {
  if (shot === 1) {
    const center = Math.exp(-((u - .58) ** 2 / .026 + (v - .48) ** 2 / .17));
    return 11 + 22 * center - 3 * v;
  }
  if (shot === 2) return 25 - 12 * v - 5 * u;
  const ground = Math.max(0, Math.min(1, (v - .57) / .43));
  const village = Math.max(0, Math.min(1, (v - .36) / .24));
  const road = 33 - 16 * village - 9 * Math.pow(ground, .75);
  const leftPalm = Math.exp(-((u - .049) ** 2 / .004 + (v - .52) ** 2 / .049));
  const rightPalm = Math.exp(-((u - .965) ** 2 / .003 + (v - .57) ** 2 / .045));
  return road - (road - 7) * .78 * Math.max(leftPalm, rightPalm);
}

function makeLandscape(three, shot) {
  const geometry = new three.PlaneGeometry(2, 2, 160, 90);
  const positions = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < positions.count; i++) {
    const u = uv.getX(i);
    const v = 1 - uv.getY(i);
    const depth = depthAt(u, v, shot);
    positions.setXYZ(i, (u - .5) * depth * 1.44, (.5 - v) * depth * .714, -depth);
  }
  geometry.computeBoundingSphere();
  return geometry;
}

export function BethlehemCamera({ progress }) {
  const canvas = useRef(null);

  useEffect(() => {
    const element = canvas.current;
    let disposed = false;
    let frame = 0;
    let release = () => {};

    async function initialize() {
      const three = await import("three");
      if (disposed) return;

      let renderer;
      try {
        renderer = new three.WebGLRenderer({ canvas: element, alpha: true, antialias: true });
      } catch {
        return;
      }

      const scene = new three.Scene();
      const camera = new three.PerspectiveCamera(43, 1, .1, 80);
      const dive = new three.CubicBezierCurve3(
        new three.Vector3(...poses[0]),
        new three.Vector3(-.55, .08, 1.1),
        new three.Vector3(-.75, -1.2, 3.55),
        new three.Vector3(...poses[1]),
      );
      const divePosition = new three.Vector3();
      let visible = false;
      let contextLost = false;
      const loader = new three.TextureLoader();
      const landscapes = shots.map((shot, index) => {
        const geometry = makeLandscape(three, index);
        const material = new three.MeshBasicMaterial({
          transparent: index > 0,
          depthTest: false,
          depthWrite: false,
        });
        const mesh = new three.Mesh(geometry, material);
        mesh.renderOrder = index;
        mesh.visible = false;
        scene.add(mesh);
        const texture = loader.load(
          `/navisedipro/belen-${shot}.webp`,
          queueDraw,
        );
        texture.colorSpace = three.SRGBColorSpace;
        material.map = texture;
        return mesh;
      });

      function draw() {
        if (!visible || document.hidden || contextLost) return;
        if (!landscapes[0].material.map.image) return;
        const t = progress.get();
        const street = three.MathUtils.smoothstep(t, .13, .28);
        const stable = three.MathUtils.smoothstep(t, .72, .86);
        const opacities = [1, street, stable];
        landscapes.forEach((mesh, index) => {
          mesh.material.opacity = opacities[index];
          mesh.visible = opacities[index] > 0 && Boolean(mesh.material.map.image);
        });
        const next = ratios.findIndex((ratio) => ratio >= t && ratio > 0);
        const end = next === -1 ? ratios.length - 1 : next;
        const position = three.MathUtils.smoothstep(t, ratios[end - 1], ratios[end]);
        const [x, y, z] = end === 1
          ? dive.getPoint(position, divePosition).toArray()
          : poses[end - 1].map((value, axis) => three.MathUtils.lerp(value, poses[end][axis], position));
        const downwardLook = end === 1 ? Math.sin(Math.PI * position) : 0;
        camera.position.set(x, y, -z);
        camera.lookAt(x * 2.1, y * 1.8 - downwardLook * 1.15, -18);
        camera.rotation.z -= downwardLook * .038;
        renderer.render(scene, camera);
        element.dataset.ready = "true";
      }

      function queueDraw() {
        cancelAnimationFrame(frame);
        if (!visible || document.hidden || contextLost) return;
        frame = requestAnimationFrame(draw);
      }

      function resize() {
        const { clientWidth, clientHeight } = element;
        if (!clientWidth || !clientHeight) return;
        camera.aspect = clientWidth / clientHeight;
        camera.fov = three.MathUtils.radToDeg(2 * Math.atan(Math.min(.326, .66 / camera.aspect)));
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
        renderer.setSize(clientWidth, clientHeight, false);
        queueDraw();
      }

      const observer = new ResizeObserver(resize);
      observer.observe(element);
      const admission = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        queueDraw();
      });
      admission.observe(element);
      const unsubscribe = progress.on("change", queueDraw);
      function showFallback(event) {
        event.preventDefault();
        contextLost = true;
        cancelAnimationFrame(frame);
        delete element.dataset.ready;
      }
      function restore() {
        contextLost = false;
        queueDraw();
      }
      document.addEventListener("visibilitychange", queueDraw);
      element.addEventListener("webglcontextlost", showFallback);
      element.addEventListener("webglcontextrestored", restore);
      resize();

      release = () => {
        unsubscribe();
        observer.disconnect();
        admission.disconnect();
        document.removeEventListener("visibilitychange", queueDraw);
        element.removeEventListener("webglcontextlost", showFallback);
        element.removeEventListener("webglcontextrestored", restore);
        for (const mesh of landscapes) {
          mesh.material.map.dispose();
          mesh.material.dispose();
          mesh.geometry.dispose();
        }
        renderer.dispose();
        renderer.forceContextLoss();
        delete element.dataset.ready;
      };
    }

    initialize().catch(() => { delete element.dataset.ready; });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      release();
    };
  }, [progress]);

  return <canvas ref={canvas} className={styles.camera} />;
}
