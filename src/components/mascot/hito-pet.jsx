"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, X, ChevronDown, ArrowDownToLine } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import manifest from "../../../public/img/hito-pet/hito.json";
import { drawHito, getHitoFrame } from "./hito-renderer";
import { HITO_ACTIONS, HITO_MESSAGES } from "./hito-messages";
import { PET_WIDTH, PET_HEIGHT, EDGE, boundHito, clamp } from "./hito-motion";
import styles from "./hito-pet.module.css";

const PREFERENCE_KEY = "sedipro:hito";
const PREFERENCE_EVENT = "sedipro:hito-preference";
const BUBBLE_WIDTH = 264;
const AUTOMATIC_STATES = ["walk", "idle", "walk", "think", "walk", "flutter", "walk", "sleep", "run", "hop", "walk", "work", "celebrate", "love"];

function getPreferences() {
  try { return sessionStorage.getItem(PREFERENCE_KEY) || "active"; }
  catch { return "active"; }
}
function subscribePreferences(callback) {
  window.addEventListener(PREFERENCE_EVENT, callback);
  return () => window.removeEventListener(PREFERENCE_EVENT, callback);
}
function savePreferences(value) {
  try { sessionStorage.setItem(PREFERENCE_KEY, value); } catch { /* Private browsing can deny storage. */ }
  window.dispatchEvent(new Event(PREFERENCE_EVENT));
}

export function HitoPet({ pathname = "/" }) {
  const preference = useSyncExternalStore(subscribePreferences, getPreferences, () => "active");
  const reducedMotion = useReducedMotion();
  const hidden = preference.startsWith("hidden");
  const paused = preference.includes("paused");
  const actorRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const controlsRef = useRef(null);
  const bubbleRef = useRef(null);
  const gestureRef = useRef(null);
  const renderRef = useRef(null);
  const interactionRef = useRef({ open: false, hovered: false, focused: false });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [assetFailed, setAssetFailed] = useState(false);
  const messages = HITO_MESSAGES[pathname] || HITO_MESSAGES["/"];

  useEffect(() => {
    interactionRef.current.open = open;
  }, [open]);

  useEffect(() => {
    if (hidden) return;
    const actor = actorRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!actor || !context) return;
    const paintCanvas = document.createElement("canvas");
    const previousCanvas = document.createElement("canvas");
    for (const buffer of [paintCanvas, previousCanvas]) {
      buffer.width = manifest.frame.width;
      buffer.height = manifest.frame.height;
    }
    const paintContext = paintCanvas.getContext("2d");
    const previousContext = previousCanvas.getContext("2d");
    let paintedState = null;
    let turnStarted = null;
    let disposed = false;
    let raf = 0;
    let lastTime = 0;
    let lastDraw = 0;
    const image = new window.Image();
    const rigImage = new window.Image();
    const engine = engineRef.current || {
      x: Math.max(EDGE, Math.min(window.innerWidth - PET_WIDTH - EDGE, window.innerWidth * 0.72)),
      y: 0, walkDistance: 0, dragging: false,
      direction: -1, state: "wave", age: 0, clock: 0, sequence: 0,
      nextComment: 34000, commentUntil: 7200, commentIndex: 0,
      nextBlink: 2900, blinkUntil: 0, look: { x: 0, y: 0 },
      requested: null, greeted: false,
    };
    engineRef.current = engine;
    function position() {
      const bottom = parseFloat(getComputedStyle(actor).bottom) || 8;
      Object.assign(engine, boundHito(engine.x, engine.y, window.innerWidth, window.innerHeight, bottom));
      const x = engine.x;
      actor.style.transform = `translate3d(${x}px, ${-engine.y}px, 0)`;
      // Leave one extra pixel for browser rounding of fractional transforms.
      const bubbleLeft = Math.max(EDGE + 1, Math.min(window.innerWidth - BUBBLE_WIDTH - EDGE - 1, x + PET_WIDTH / 2 - BUBBLE_WIDTH / 2));
      actor.style.setProperty("--bubble-left", `${bubbleLeft - x}px`);
      actor.style.setProperty("--bubble-tail", `${Math.max(16, Math.min(BUBBLE_WIDTH - 24, x + PET_WIDTH / 2 - bubbleLeft))}px`);
      const top = window.innerHeight - bottom - PET_HEIGHT - engine.y;
      const bubbleHeight = bubbleRef.current?.offsetHeight || 300;
      const above = top - EDGE - 12;
      const below = window.innerHeight - top - PET_HEIGHT - EDGE - 12;
      const placement = above >= bubbleHeight || above >= below ? "above" : "below";
      actor.dataset.bubblePlacement = placement;
      actor.style.setProperty("--bubble-max-height", `${Math.max(40, placement === "above" ? above : below)}px`);
      actor.dataset.dragging = String(engine.dragging);
      actor.dataset.floating = String(engine.y > 1);
    }
    function draw() {
      if (!image.complete || !image.naturalWidth) return;
      const state = engine.dragging ? "walk" : paused || reducedMotion ? "idle" : engine.state;
      const animation = manifest.animations[state];
      const frame = paused || reducedMotion ? 0 : getHitoFrame(animation, engine.age);
      if (paintedState !== state) {
        const walking = (value) => value === "walk" || value === "run";
        const turning = walking(paintedState) && state === "idle" || paintedState === "idle" && walking(state);
        if (turning && !paused && !reducedMotion && !engine.dragging) {
          previousContext.clearRect(0, 0, canvas.width, canvas.height);
          previousContext.drawImage(canvas, 0, 0);
          turnStarted = engine.clock;
        } else turnStarted = null;
        paintedState = state;
      }
      actor.dataset.state = state;
      actor.dataset.direction = engine.direction < 0 ? "left" : "right";
      drawHito(paintContext, image, manifest, state, frame, engine.direction,
        reducedMotion || paused ? { x: 0, y: 0 } : engine.look,
        !paused && !reducedMotion && engine.clock < engine.blinkUntil,
        { image: rigImage, distance: reducedMotion ? 0 : engine.walkDistance });
      context.clearRect(0, 0, canvas.width, canvas.height);
      const progress = turnStarted === null ? 1 : clamp((engine.clock - turnStarted) / 120, 0, 1);
      if (progress < 1) {
        const blend = 1 - (1 - progress) ** 3;
        context.globalAlpha = 1 - blend;
        context.drawImage(previousCanvas, 0, 0);
        context.globalAlpha = blend;
      } else turnStarted = null;
      context.drawImage(paintCanvas, 0, 0);
      context.globalAlpha = 1;
    }
    renderRef.current = () => { position(); draw(); };
    function tick(time) {
      if (disposed) return;
      const delta = lastTime ? Math.min(time - lastTime, 80) : 0;
      lastTime = time;
      engine.clock += delta;
      const interaction = interactionRef.current;
      const held = interaction.open || interaction.hovered || interaction.focused;
      if (!paused && !reducedMotion && !engine.dragging && !gestureRef.current) {
        engine.age += delta;
        if (engine.requested) {
          engine.state = engine.requested;
          engine.requested = null;
          engine.age = 0;
        } else if (engine.age >= manifest.animations[engine.state].duration) {
          engine.state = held ? "idle" : AUTOMATIC_STATES[engine.sequence++ % AUTOMATIC_STATES.length];
          engine.age = 0;
        }
        if (held && manifest.animations[engine.state].speed) {
          engine.state = "idle";
          engine.age = 0;
        }
        const speed = manifest.animations[engine.state].speed || 0;
        if (!held && speed) {
          const previousX = engine.x;
          engine.x += engine.direction * speed * delta / 1000;
          const max = Math.max(EDGE, window.innerWidth - PET_WIDTH - EDGE);
          if (engine.x <= EDGE || engine.x >= max) {
            engine.x = Math.max(EDGE, Math.min(max, engine.x));
            engine.direction *= -1;
          }
          engine.walkDistance += Math.abs(engine.x - previousX);
        }
        if (engine.clock >= engine.nextBlink) {
          engine.blinkUntil = engine.clock + 160;
          engine.nextBlink = engine.clock + 2600 + Math.random() * 2800;
        }
        if (!held && engine.clock >= engine.nextComment) {
          setMessage(messages.comments[engine.commentIndex++ % messages.comments.length]);
          engine.commentUntil = engine.clock + 6000;
          engine.nextComment = engine.clock + 32000 + Math.random() * 10000;
          engine.state = "think";
          engine.age = 0;
        }
      }
      if (!interaction.open && engine.commentUntil && engine.clock >= engine.commentUntil) {
        setMessage("");
        engine.commentUntil = 0;
      }
      position();
      // A small 160x192 canvas at 30 fps; movement stays continuous between poses.
      if (time - lastDraw >= 1000 / 30) { draw(); lastDraw = time; }
      raf = requestAnimationFrame(tick);
    }
    function visibility() {
      cancelAnimationFrame(raf);
      lastTime = 0;
      if (document.hidden && gestureRef.current) {
        engine.dragging = false;
        gestureRef.current = null;
        interactionRef.current.hovered = false;
        const button = controlsRef.current;
        if (button?.hasPointerCapture(engine.pointerId)) button.releasePointerCapture(engine.pointerId);
        position();
      }
      if (!document.hidden && !paused && !reducedMotion && image.complete && image.naturalWidth) raf = requestAnimationFrame(tick);
    }
    function lookAt(event) {
      if (event.pointerType === "touch" || engine.dragging) return;
      engine.look = {
        x: (event.clientX - engine.x - PET_WIDTH / 2) / 180,
        y: (event.clientY - window.innerHeight + engine.y + 66) / 140,
      };
    }
    function resetLook() { engine.look = { x: 0, y: 0 }; }
    function resize() { position(); draw(); }
    const bubbleObserver = new ResizeObserver(position);
    // The actor's child list changes when controls or an automatic reply open.
    const childObserver = new MutationObserver(() => {
      bubbleObserver.disconnect();
      if (bubbleRef.current) bubbleObserver.observe(bubbleRef.current);
      position();
    });
    childObserver.observe(actor, { childList: true });
    image.onload = () => {
      if (disposed) return;
      position(); draw();
      if (!engine.greeted && !paused && !reducedMotion) {
        setMessage(messages.greeting);
        engine.greeted = true;
      }
      if (!document.hidden && !paused && !reducedMotion) raf = requestAnimationFrame(tick);
    };
    image.onerror = () => { if (!disposed) setAssetFailed(true); };
    rigImage.onload = () => { if (!disposed) draw(); };
    if (manifest.gait?.image) rigImage.src = manifest.gait.image;
    image.src = manifest.image;
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", lookAt, { passive: true });
    document.addEventListener("pointerleave", resetLook);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      image.onload = null;
      image.onerror = null;
      rigImage.onload = null;
      renderRef.current = null;
      engine.dragging = false;
      gestureRef.current = null;
      childObserver.disconnect();
      bubbleObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", lookAt);
      document.removeEventListener("pointerleave", resetLook);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [hidden, paused, reducedMotion, messages]);

  useEffect(() => {
    if (!open) return;
    function closeOnOutside(event) {
      if (!actorRef.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        controlsRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function toggleControls() {
    setOpen((value) => !value);
    setMessage(messages.greeting);
    if (engineRef.current) {
      engineRef.current.requested = "wave";
      engineRef.current.commentUntil = engineRef.current.clock + 6000;
    }
  }
  function interact(event) {
    // Pointer activation is handled on release, after distinguishing a tap
    // from a drag. Native delayed touch clicks must not toggle it twice.
    if (event.detail === 0) toggleControls();
  }
  function perform(action) {
    setMessage(action.message);
    if (engineRef.current) engineRef.current.requested = action.state;
  }
  function hide() {
    setOpen(false);
    setMessage("");
    savePreferences(paused ? "hidden-paused" : "hidden");
  }

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0 || !engineRef.current) return;
    const engine = engineRef.current;
    gestureRef.current = {
      id: event.pointerId, clientX: event.clientX, clientY: event.clientY,
      x: engine.x, y: engine.y, previousX: event.clientX, moved: false,
    };
    engine.pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    const gesture = gestureRef.current;
    const engine = engineRef.current;
    if (!gesture || gesture.id !== event.pointerId || !engine) return;
    const dx = event.clientX - gesture.clientX;
    const dy = event.clientY - gesture.clientY;
    if (!gesture.moved && Math.hypot(dx, dy) < 6) return;
    if (!gesture.moved) {
      gesture.moved = true;
      engine.dragging = true;
      engine.requested = null;
      engine.commentUntil = 0;
      interactionRef.current.open = false;
      setOpen(false);
      setMessage("");
    }
    const direction = event.clientX - gesture.previousX;
    if (Math.abs(direction) > 0.5) engine.direction = Math.sign(direction);
    gesture.previousX = event.clientX;
    const previousX = engine.x;
    engine.x = gesture.x + dx;
    engine.y = gesture.y - dy;
    const bottom = parseFloat(getComputedStyle(actorRef.current).bottom) || 8;
    Object.assign(engine, boundHito(engine.x, engine.y, window.innerWidth, window.innerHeight, bottom));
    engine.walkDistance += Math.abs(engine.x - previousX);
    engine.state = "walk";
    engine.age = 0;
    engine.look = { x: 0, y: 0 };
    renderRef.current?.();
  }

  function endDrag(event) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    gestureRef.current = null;
    const engine = engineRef.current;
    engine.dragging = false;
    if (gesture.moved) {
      engine.state = "walk";
      engine.age = 0;
      interactionRef.current.hovered = false;
      interactionRef.current.focused = false;
      controlsRef.current?.blur();
    } else if (event.type === "pointerup") {
      toggleControls();
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    renderRef.current?.();
  }

  function returnToBase() {
    if (!engineRef.current) return;
    engineRef.current.y = 0;
    renderRef.current?.();
  }

  function moveWithKeyboard(event) {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    const direction = directions[event.key];
    if (event.key === "Home") { event.preventDefault(); returnToBase(); return; }
    if (!direction || !engineRef.current) return;
    event.preventDefault();
    const engine = engineRef.current;
    const previousX = engine.x;
    const step = event.shiftKey ? 32 : 12;
    engine.x += direction[0] * step;
    engine.y += direction[1] * step;
    engine.direction = direction[0] || engine.direction;
    engine.walkDistance += Math.abs(clamp(engine.x, EDGE, window.innerWidth - PET_WIDTH - EDGE) - previousX);
    engine.state = "walk";
    engine.age = 0;
    renderRef.current?.();
  }

  if (assetFailed) return null;
  if (hidden) return (
    <button className={styles.restore} onClick={() => savePreferences(paused ? "paused" : "active")} aria-label="Mostrar a Hito">
      <span className={styles.miniEyes} aria-hidden="true"><i /><i /></span>
      <span>Hito</span>
    </button>
  );

  return (
    <div className={styles.root} data-testid="hito-pet" data-paused={paused || reducedMotion}>
      <span id="hito-drag-help" className={styles.visuallyHidden}>Arrastra para mover a Hito. Con el teclado, usa las flechas para moverlo y la tecla Inicio para volver a la base.</span>
      <div ref={actorRef} className={styles.actor} data-state="idle"
        onPointerEnter={() => { interactionRef.current.hovered = true; }}
        onPointerLeave={() => { interactionRef.current.hovered = false; }}
        onFocusCapture={() => { interactionRef.current.focused = true; }}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) interactionRef.current.focused = false; }}>
        {(message || open) && (
          <div ref={bubbleRef} className={styles.bubble} id="hito-controls" data-open={open}>
            <div className={styles.bubbleHeader}>
              <span className={styles.name}>HITO <span> / SEDIPRO UNT</span></span>
              {open && <button onClick={() => setOpen(false)} aria-label="Cerrar controles de Hito"><ChevronDown size={16} aria-hidden="true" /></button>}
            </div>
            {/* Announce user-requested replies only, never interrupt reading with ambient chatter. */}
            <p role={open ? "status" : undefined}>{message || messages.greeting}</p>
            {open && (
              <div className={styles.controls}>
                <div className={styles.actions}>
                  {HITO_ACTIONS.map((action) => <button key={action.state} onClick={() => perform(action)}>{action.label}</button>)}
                </div>
                <div className={styles.settings}>
                  <button onClick={() => savePreferences(paused ? "active" : "paused")} disabled={reducedMotion}>
                    {paused || reducedMotion ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
                    {reducedMotion ? "Movimiento reducido" : paused ? "Reanudar" : "Pausar"}
                  </button>
                  <button onClick={hide}><X size={13} aria-hidden="true" /> Ocultar</button>
                </div>
                <button className={styles.returnToBase} onClick={returnToBase}><ArrowDownToLine size={13} aria-hidden="true" /> Volver a la base</button>
                <p className={styles.dragHint}>Arrástrame para moverme. También puedes usar las flechas del teclado.</p>
              </div>
            )}
          </div>
        )}
        <span className={styles.shadow} aria-hidden="true" />
        <button ref={controlsRef} className={styles.pet} onClick={interact}
          onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
          onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={moveWithKeyboard}
          aria-label="Hito, mascota de SEDIPRO. Abrir controles"
          aria-describedby="hito-drag-help"
          aria-expanded={open} aria-controls={open ? "hito-controls" : undefined}
          title="Soy Hito. ¡Tócame o arrástrame!">
          <canvas ref={canvasRef} width={manifest.frame.width} height={manifest.frame.height} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
