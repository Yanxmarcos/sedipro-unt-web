"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import { STORY_RECOGNITIONS } from "./home-content";
import styles from "./public-site.module.css";

const ease = [0.16, 1, 0.3, 1];
function subscribeVisibility(callback) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
const getVisibility = () => !document.hidden;
const getServerVisibility = () => true;

function subscribeStoryViewport(callback) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getStoryMobile = () => window.matchMedia("(max-width: 767px)").matches;
const getServerStoryMobile = () => false;

// On phones the next photograph is already visible below the active one.
// Each outgoing photograph continues upward while shrinking to the right.
const mobileStoryFrames = [
  { stops: [0, 0.32, 0.64, 1], x: ["0vw", "20vw", "22vw", "22vw"], y: ["0svh", "-30svh", "-68svh", "-112svh"], scale: [1, 0.58, 0.5, 0.5] },
  { stops: [0, 0.28, 0.5, 0.82, 1], x: ["14vw", "14vw", "0vw", "20vw", "22vw"], y: ["45svh", "15svh", "0svh", "-32svh", "-65svh"], scale: [0.68, 0.68, 1, 0.58, 0.5] },
  { stops: [0, 0.4, 0.64, 0.9, 1], x: ["14vw", "14vw", "14vw", "0vw", "0vw"], y: ["90svh", "56svh", "35svh", "0svh", "0svh"], scale: [0.68, 0.68, 0.68, 1, 1] },
];

export function Reveal({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  return <motion.div initial={false} whileInView={reduced ? undefined : { y: [18, 0], opacity: [0.65, 1] }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7, delay, ease }} className={className}>{children}</motion.div>;
}

export function HeroTile({ photo, alternate, square = false }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const visible = useSyncExternalStore(subscribeVisibility, getVisibility, getServerVisibility);
  return (
    <span ref={ref} className={`${styles.heroTile} ${square ? styles.squareTile : ""}`} data-running={inView && visible && !reduced} aria-hidden="true">
      <Image src={photo.src} alt="" fill sizes="(max-width: 767px) 100px, 280px" priority />
      {alternate && <Image src={alternate.src} alt="" fill sizes="(max-width: 767px) 100px, 280px" className={styles.alternateTile} />}
    </span>
  );
}

function StoryImage({ photo, index, progress, reduced, mobile }) {
  const frames = mobile ? mobileStoryFrames[index] : null;
  const stops = frames?.stops ?? (index === 0 ? [0, 0.18, 0.4, 1] : index === 1 ? [0, 0.18, 0.4, 0.58, 0.8, 1] : [0, 0.58, 0.8, 1]);
  const x = useTransform(progress, stops, frames?.x ?? (index === 0 ? ["0vw", "0vw", "24vw", "24vw"] : index === 1 ? ["24vw", "24vw", "0vw", "0vw", "24vw", "24vw"] : ["24vw", "24vw", "0vw", "0vw"]));
  const y = useTransform(progress, stops, frames?.y ?? (index === 0 ? ["0svh", "0svh", "-92svh", "-92svh"] : index === 1 ? ["100svh", "100svh", "0svh", "0svh", "-92svh", "-92svh"] : ["100svh", "100svh", "0svh", "0svh"]));
  const scale = useTransform(progress, stops, frames?.scale ?? (index === 0 ? [1, 1, 0.72, 0.72] : index === 1 ? [0.72, 0.72, 1, 1, 0.72, 0.72] : [0.72, 0.72, 1, 1]));
  return (
    <motion.figure className={styles.storyPhoto} style={{ "--story-ratio": photo.width / photo.height, ...(reduced ? {} : { x, y, scale, zIndex: index + 1 }) }}>
      <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={`(max-width: 767px) 66vw, ${index === 0 ? "49.5vw" : "44vw"}`} />
    </motion.figure>
  );
}

const storyLines = [
  ["Formamos a los", "futuros líderes", "en proyectos."],
  ["Metodología PMI.", "Herramientas ágiles.", "Buenas prácticas."],
  ["Un equipo", "multidisciplinario.", "SEDIPRO UNT."],
];

function StoryCaption({ progress, reduced }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const visible = useSyncExternalStore(subscribeVisibility, getVisibility, getServerVisibility);
  const [phase, setPhase] = useState(0);
  const [display, setDisplay] = useState({ phase: 0, count: Infinity });
  const current = useRef(display);
  useMotionValueEvent(progress, "change", value => setPhase(value < 0.32 ? 0 : value < 0.65 ? 1 : 2));

  useEffect(() => {
    if (reduced || !inView || !visible) return;
    const before = current.current;
    const previousCount = Math.min(before.count, storyLines[before.phase].join("").length);
    const total = storyLines[phase].join("").length;
    const eraseTime = before.phase === phase ? 0 : 200;
    let start;
    let frame;
    const tick = time => {
      start ??= time;
      const elapsed = time - start;
      const next = elapsed < eraseTime
        ? { phase: before.phase, count: Math.floor(previousCount * (1 - elapsed / eraseTime)) }
        : { phase, count: Math.floor(total * Math.min(1, (elapsed - eraseTime) / 780)) };
      if (next.phase !== current.current.phase || next.count !== current.current.count) {
        current.current = next;
        setDisplay(next);
      }
      if (elapsed < eraseTime + 780) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, reduced, inView, visible]);

  const lines = storyLines[reduced ? 0 : display.phase];
  const count = reduced ? Infinity : display.count;
  let offset = 0;
  return <h2 ref={ref} id="story-heading" className={styles.storyHeadline} data-story-phase={reduced ? 0 : display.phase} aria-label={lines.join(" ")}>
    {lines.map((text, index) => {
      const start = offset;
      offset += text.length;
      const letters = text.slice(0, Math.max(0, count - start));
      const cursor = !reduced && index === lines.length - 1 && count >= offset;
      return <span key={index} className={styles.storyTextLine} aria-hidden="true">{letters}{cursor && <span className={styles.storyCaret} style={{ animationPlayState: inView && visible ? "running" : "paused" }} />}</span>;
    })}
  </h2>;
}

export function ScrollStory() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const mobile = useSyncExternalStore(subscribeStoryViewport, getStoryMobile, getServerStoryMobile);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section ref={ref} className={styles.story} aria-labelledby="story-heading">
      <div className={styles.storyStage}>
        <div className={styles.storyInteractiveBackground} aria-hidden="true" />
        <div className={styles.storyComposition}>
          <div className={styles.storyVisual}>
            {STORY_RECOGNITIONS.map((photo, index) => <StoryImage key={photo.src} photo={photo} index={index} progress={scrollYProgress} reduced={reduced} mobile={mobile} />)}
          </div>
          <div className={styles.storyCopy}><StoryCaption progress={scrollYProgress} reduced={reduced} /></div>
          <div className={styles.storyInvite} aria-hidden="true">Desliza <ArrowDown size={16} /></div>
          <div className={styles.storyNotes}>
            <h3>SEDIPRO UNT</h3>
            <p>Somos la Sección Estudiantil de Dirección de Proyectos de la UNT.</p>
            <Link href="/nosotros" className={styles.action}>Conoce a SEDIPRO UNT <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PublicVideo() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  return (
    <figure className={styles.videoFigure}>
      <video ref={ref} src="/video/video.mp4" poster="/crown-night/todos1.webp" controls loop muted playsInline preload="none" aria-label="Un poco de nosotros, SEDIPRO UNT" onPlay={() => { if (reduced && ref.current) ref.current.loop = false; }} />
      <figcaption>Un poco de nosotros · SEDIPRO UNT</figcaption>
    </figure>
  );
}
