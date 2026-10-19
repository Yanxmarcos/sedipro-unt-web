"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RotateCcw, ArrowUp } from "lucide-react";
import { useInView } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import { AREAS } from "./content";
import styles from "./about-experience.module.css";

export function AboutPlayground({ selectedArea, onSelectArea }) {
  const box = useRef(null), chips = useRef([]), world = useRef(null), held = useRef(null);
  const visible = useInView(box, { amount: .15 });
  const reduced = useReducedMotion();
  const [reset, setReset] = useState(0), [ready, setReady] = useState(false);
  useEffect(() => {
    let previous = box.current.clientWidth;
    const observer = new ResizeObserver(() => {
      if (!box.current) return;
      const width = box.current.clientWidth;
      if (Math.abs(width - previous) > 1) { previous = width; setReset(value => value + 1); }
    });
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || reduced) return;
    let cancelled = false, cleanup;
    void (async () => {
      const imported = await import("matter-js");
      if (cancelled) return;
      const { Engine, Bodies, Body, Composite, Sleeping } = imported.default ?? imported;
      const element = box.current, width = element.clientWidth, height = element.clientHeight;
      const size = chips.current[0].offsetWidth;
      const engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = 1;
      const walls = [Bodies.rectangle(width / 2, height + 30, width * 2, 60, { isStatic: true }), Bodies.rectangle(-30, height / 2, 60, height * 2, { isStatic: true }), Bodies.rectangle(width + 30, height / 2, 60, height * 2, { isStatic: true }), Bodies.rectangle(width / 2, -150, width * 2, 60, { isStatic: true })];
      const bodies = AREAS.map((_, index) => Bodies.rectangle(size / 2 + 12 + (width - size - 24) * index / 4, 45 + index * 25, size, size, { chamfer: { radius: 12 }, restitution: .65, friction: .25, frictionAir: .012, angle: (index % 2 ? -1 : 1) * .15 }));
      Composite.add(engine.world, [...walls, ...bodies]);
      world.current = { Body, Sleeping, bodies, size };
      setReady(true);
      let frame, previous;
      const tick = now => {
        const elapsed = previous ? Math.min(now - previous, 32) : 16.667;
        previous = now;
        if (!document.hidden) {
          Engine.update(engine, elapsed);
          bodies.forEach((body, index) => {
            chips.current[index].style.transform = `translate3d(${body.position.x - size / 2}px,${body.position.y - size / 2}px,0) rotate(${body.angle}rad)`;
          });
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      cleanup = () => { cancelAnimationFrame(frame); world.current = null; held.current = null; chips.current.forEach(chip => { if (chip) chip.style.transform = ""; }); Composite.clear(engine.world, false); Engine.clear(engine); };
    })();
    return () => { cancelled = true; cleanup?.(); };
  }, [visible, reduced, reset]);
  const launch = index => {
    const scene = world.current;
    if (!scene) return;
    const selected = index === undefined ? scene.bodies : [scene.bodies[index]];
    selected.forEach((body, i) => { scene.Sleeping.set(body, false); scene.Body.setStatic(body, false); scene.Body.setVelocity(body, { x: (i % 2 ? -1 : 1) * 5, y: -13 }); scene.Body.setAngularVelocity(body, (i % 2 ? -1 : 1) * .12); });
  };
  const release = (event, area) => {
    const drag = held.current, scene = world.current;
    if (!drag || !scene) return;
    scene.Body.setStatic(drag.body, false);
    scene.Body.setVelocity(drag.body, performance.now() - drag.time > 120 ? { x: 0, y: 0 } : drag.velocity);
    const activate = !drag.moved && event.type === "pointerup";
    held.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (activate) onSelectArea(area.short, true);
  };
  return <div className={styles.playgroundWrap}>
    <div className={styles.playControls}><h2 id="about-areas-title">Cinco áreas.</h2><div><button type="button" onClick={() => launch()} disabled={reduced}><ArrowUp size={17} aria-hidden="true" /><span>Lanzar todos</span></button><button type="button" onClick={() => setReset(value => value + 1)} disabled={reduced}><RotateCcw size={17} aria-hidden="true" /><span>Reiniciar</span></button></div></div>
    <div ref={box} className={styles.playground} data-physics={ready && !reduced || undefined} aria-label="Cubos de las cinco áreas">
      {AREAS.map((area, index) => <button type="button" key={area.short} ref={element => { chips.current[index] = element; }} className={styles.cube} style={{ "--cube-color": area.color, "--cube-ink": area.ink }} aria-label={`Ver información de ${area.name}`} aria-expanded={selectedArea === area.short} aria-controls={`area-detail-${area.short.replace(/\W/g, "")}`} onClick={event => { if (event.detail === 0) onSelectArea(area.short, true); }}
        onPointerDown={event => {
          const scene = world.current;
          if (!scene) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          const body = scene.bodies[index]; scene.Sleeping.set(body, false); scene.Body.setStatic(body, true);
          held.current = { body, startX: event.clientX, startY: event.clientY, moved: false, lastX: event.clientX, lastY: event.clientY, time: performance.now(), velocity: { x: 0, y: -2 } };
        }} onPointerMove={event => {
          const drag = held.current, scene = world.current;
          if (!drag || !scene || drag.body !== scene.bodies[index]) return;
          drag.moved ||= Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6;
          if (!drag.moved) return;
          const bounds = box.current.getBoundingClientRect();
          const scale = box.current.clientWidth / bounds.width;
          const now = performance.now(), elapsed = Math.max(8, now - drag.time);
          drag.velocity = { x: Math.max(-18, Math.min(18, (event.clientX - drag.lastX) * scale / elapsed * 16)), y: Math.max(-18, Math.min(18, (event.clientY - drag.lastY) * scale / elapsed * 16)) };
          scene.Body.setPosition(drag.body, { x: Math.max(scene.size / 2, Math.min(box.current.clientWidth - scene.size / 2, (event.clientX - bounds.left) * scale)), y: Math.max(scene.size / 2, Math.min(box.current.clientHeight - scene.size / 2, (event.clientY - bounds.top) * scale)) });
          Object.assign(drag, { lastX: event.clientX, lastY: event.clientY, time: now });
        }} onPointerUp={event => release(event, area)} onPointerCancel={event => release(event, area)}><span className={styles.cubeLogo}><Image src={area.logo} alt="" width={240} height={120} draggable={false} /></span><span className={styles.cubeName}>{area.short}</span></button>)}
    </div>
  </div>;
}
