"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowRight, Plus } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import { AREAS, DIRECTIVA, IMPACT } from "./content";
import { AboutPlayground } from "./about-playground";
import { AboutRecognitionJourney } from "./about-recognition-journey";
import { ElasticSection } from "./elastic-section";
import styles from "./about-experience.module.css";

function Flight({ className = "", progress, reverse = false }) {
  const x = useTransform(progress, [0, 1], reverse ? [80, -100] : [-50, 160]);
  const y = useTransform(progress, [0, .5, 1], [20, -40, 20]);
  const rotate = useTransform(progress, [0, 1], reverse ? [25, -30] : [-15, 25]);
  const reduced = useReducedMotion();
  return <motion.div className={`${styles.flight} ${className}`} style={reduced ? undefined : { x, y, rotate }} aria-hidden="true"><Image src="/img/institutional/collage/paper-plane.svg" alt="" width={300} height={180} /></motion.div>;
}

function ChapterCurve({ color }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const target = useMotionValue(0);
  const bend = useSpring(target, { stiffness: 180, damping: 20, mass: .5 });
  useMotionValueEvent(velocity, "change", value => target.set(reduced ? 0 : -60 * Math.tanh(value / 1800)));
  const path = useTransform(bend, value => `M0 80L140 80C300 80 350 ${80 + value} 500 ${80 + value}C650 ${80 + value} 700 80 860 80L1000 80V164H0Z`);
  return <div className={styles.chapterCurve} aria-hidden="true"><svg viewBox="0 0 1000 160" preserveAspectRatio="none"><motion.path d={path} fill={color} /></svg></div>;
}

function AboutHero() {
  return <section className={styles.hero} aria-labelledby="about-heading">
    <h1 id="about-heading">Nosotros</h1>
    <p>Impulsando el liderazgo en dirección de proyectos.</p>
    <a className={styles.heroButton} href="#contenido">Conócenos<ArrowDown size={20} aria-hidden="true" /></a>
  </section>;
}

// Native document scroll drives a horizontal stretch, then releases back to vertical flow.
function HorizontalScene({ children, className = "", label, anchor, compact = false }) {
  const root = useRef(null), track = useRef(null);
  const reduced = useReducedMotion();
  const [travel, setTravel] = useState(0);
  const [height, setHeight] = useState(0);
  const [wide, setWide] = useState(false);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);
  useEffect(() => {
    const measure = () => {
      if (!track.current || !root.current) return;
      const desktop = window.matchMedia("(min-width: 900px)").matches;
      setWide(desktop && !reduced);
      setTravel(desktop && !reduced ? Math.max(0, track.current.scrollWidth - root.current.clientWidth) : 0);
      setHeight(window.innerHeight);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track.current); window.addEventListener("resize", measure); measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [reduced]);
  return <section ref={root} id={anchor} className={`${styles.horizontal} ${className}`} data-horizontal={wide || undefined} style={wide ? { height: height + travel } : undefined} aria-label={label}>
    {anchor === "contenido" && <div className={styles.storyEntrance}><svg viewBox="0 0 1000 140" preserveAspectRatio="none" aria-hidden="true"><path d="M0 140C230 140 335 140 415 68C470 18 530 18 585 68C665 140 770 140 1000 140V144H0Z" /></svg><a href="#contenido"><span>Explorar</span><ArrowDown size={24} aria-hidden="true" /></a></div>}
    <div className={styles.sticky}>
      <motion.div ref={track} className={`${styles.track} ${compact ? styles.peopleTrack : ""}`} style={travel ? { x } : undefined}>{children}</motion.div>
      {travel > 0 && <div className={styles.sceneGuide} aria-hidden="true"><span>{label}</span><span>Continúa explorando <ArrowRight size={17} /></span><motion.i style={{ scaleX: scrollYProgress }} /></div>}
    </div>
  </section>;
}

function AboutStory() {
  return <HorizontalScene className={styles.story} label="Nuestra esencia" anchor="contenido">
    <article className={styles.storyPanel}>
      <h2>Quiénes<br /><span>somos.</span></h2>
      <div className={styles.storyCopy}><p>Somos la <strong>Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo</strong>, un equipo multidisciplinario comprometido con la formación de estudiantes mediante la difusión de las buenas prácticas en gestión de proyectos, utilizando la metodología PMI y herramientas ágiles bajo un enfoque académico, social y ambiental.</p></div>
      <span className={styles.orbit} aria-hidden="true" />
    </article>
    <article className={`${styles.storyPanel} ${styles.mission}`}>
      <ChapterCurve color="#662065" />
      <h2>Nuestra<br /><span>misión.</span></h2>
      <p className={styles.quote}>Formar a los futuros líderes en las buenas prácticas de dirección de proyectos mediante un enfoque integral e innovador.</p>
      <Image className={styles.storyPlane} src="/img/institutional/collage/paper-plane.svg" alt="" width={260} height={156} />
    </article>
    <article className={`${styles.storyPanel} ${styles.vision}`}>
      <ChapterCurve color="#29295d" />
      <h2>Nuestra<br /><span>visión.</span></h2>
      <p className={styles.quote}>Ser la mejor SEDIPRO a nivel nacional, impulsando el desarrollo de gestores comprometidos con la excelencia y el impacto positivo.</p>
      <span className={styles.visionShape} aria-hidden="true"><i /><i /><i /></span>
    </article>
  </HorizontalScene>;
}

function AboutTeam() {
  return <HorizontalScene className={styles.team} label="Nuestra directiva · 2026" anchor="directiva" compact>
    <div className={styles.teamIntro}><h2>Nuestra<br /><span>directiva.</span></h2><p>SEDIPRO UNT · 2026</p><ArrowRight size={34} aria-hidden="true" /></div>
    {DIRECTIVA.map(person => <article key={person.nombre} className={styles.person}>
      <div className={styles.portrait}><Image src={person.imagen} alt={person.nombre} fill sizes="(max-width: 600px) 88vw, 300px" /></div>
      <h3>{person.nombre}</h3><p>{person.cargo}</p>
      <div className={styles.personDetails}><p>{person.carrera}</p><a href={person.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${person.nombre}`}><FaLinkedinIn size={18} aria-hidden="true" /></a></div>
    </article>)}
  </HorizontalScene>;
}

function AboutImpact() {
  const root = useRef(null);
  const [held, setHeld] = useState(false);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start end", "end start"] });
  return <section ref={root} className={styles.impact} id="impacto" aria-labelledby="impact-title">
    <div className={styles.impactTitle}><h2 id="impact-title">El impacto de<br /><span>hacerlo juntos.</span></h2></div>
    <div className={styles.impactWindow} role="region" tabIndex={0} aria-label="Datos de impacto. Mantén presionado para pausar; suelta para continuar." onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setHeld(true); }} onPointerUp={() => setHeld(false)} onPointerCancel={() => setHeld(false)} onLostPointerCapture={() => setHeld(false)} onBlur={() => setHeld(false)} onKeyDown={event => { if (event.code === "Space" || event.code === "Enter") { event.preventDefault(); setHeld(true); } }} onKeyUp={() => setHeld(false)}>
      <div className={styles.impactBelt} data-held={held || undefined}>{[0, 1].map(copy => <div key={copy} className={styles.impactGroup} aria-hidden={copy === 1 || undefined}>{IMPACT.map(item => <article key={item.label} className={styles.impactFact}><strong>{item.value}</strong><span>{item.label}</span></article>)}</div>)}</div>
    </div>
    <Flight className={styles.impactFlight} progress={scrollYProgress} reverse />
  </section>;
}

function AboutAreas() {
  const [active, setActive] = useState(null);
  const reduced = useReducedMotion();
  const selectArea = (short, fromCube = false) => {
    setActive(current => current === short ? null : short);
    if (fromCube) requestAnimationFrame(() => document.getElementById(`area-toggle-${short.replace(/\W/g, "")}`)?.scrollIntoView({ block: "center", behavior: reduced ? "instant" : "smooth" }));
  };
  return <section className={styles.areas} id="areas" data-nav-surface="paper" aria-labelledby="about-areas-title">
    <AboutPlayground selectedArea={active} onSelectArea={selectArea} />
    <ul className={styles.areasList}>{AREAS.map(area => {
      const key = area.short.replace(/\W/g, "");
      return <li key={area.short}>
        <h3><button type="button" id={`area-toggle-${key}`} aria-expanded={active === area.short} aria-controls={`area-detail-${key}`} onClick={() => selectArea(area.short)}>
          <span className={styles.areaLogo}><Image src={area.logo} alt="" width={180} height={90} /></span><span className={styles.areaShort}>{area.short}</span><span>{area.name}</span><Plus size={20} aria-hidden="true" />
        </button></h3>
        <div className={styles.areaDetail} id={`area-detail-${key}`} role="region" aria-labelledby={`area-toggle-${key}`} hidden={active !== area.short}><p>{area.description}</p></div>
      </li>;
    })}</ul>
  </section>;
}

export function AboutExperience() {
  return <div className={styles.about}>
    <AboutHero />
    <AboutStory />
    <ElasticSection surface="#211c3d" previous="#29295d" revealBackground><AboutTeam /></ElasticSection>
    <ElasticSection surface="#f6f1fa" previous="#211c3d" revealBackground paper><AboutAreas /></ElasticSection>
    <ElasticSection surface="#662065" previous="#f6f1fa" joined revealBackground><AboutImpact /></ElasticSection>
    <ElasticSection surface="#f6f1fa" previous="#662065" joined revealBackground paper><AboutRecognitionJourney /></ElasticSection>
  </div>;
}
