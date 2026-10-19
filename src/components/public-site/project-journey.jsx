"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Laptop, Loupe, Riffle, Settle, Stack } from "@lucasmarkes/hairline/react";
import { useReducedMotion } from "@/lib/motion";
import { JOURNEY_PHOTOS as photos } from "./journey-media";
import styles from "./project-journey.module.css";

const ROUTE_HEIGHT = 6101.5;
const TRACE_SPRING = { stiffness: 110, damping: 26, mass: .65, restDelta: .00001, restSpeed: .0001 };

function anchoredRoute(origin, definition, learning, end, bounds, profile) {
  // A uniform SVG scale keeps dash lengths and the visible tip in agreement.
  // Non-scaling strokes also change dash scaling, so cannot be used here.
  const desktopHeight = bounds.height * 1944.2 / bounds.width;
  const x = origin.x * 1944.2;
  const y = origin.y * desktopHeight;
  // Preserve the reference curve's proportions in screen space. Stretching a
  // shallow ellipse around the card makes the 500-unit ribbon fill its hole.
  const sourceY = value => definition.top * desktopHeight + value - 2623.45;
  const definitionY = sourceY(2510);
  const learningY = learning * desktopHeight;
  const endX = end.x * 1944.2;
  const endY = end.y * desktopHeight;
  const connector = `M${x} ${y} C${x} ${y + (sourceY(1703) - y) * .3} 124 ${sourceY(1157)} 1055.5 ${sourceY(1703)}`;
  const crossing = `M1055.5 ${sourceY(1703)} C1987 ${sourceY(2249)} 1397 ${sourceY(3353)} 733 ${sourceY(3318)}`;
  const first = `${connector} C1987 ${sourceY(2249)} 1397 ${sourceY(3353)} 733 ${sourceY(3318)} C69 ${sourceY(3283)} 127 ${sourceY(2600)} 679.4 ${definitionY}`;
  const middle = `${first} C1231.7 ${sourceY(2420)} 2368.7 ${definitionY + (learningY - definitionY) * .44} 1155 ${learningY}`;
  const desktop = `${middle} C170 ${learningY + (endY - learningY) * .45} ${endX} ${learningY + (endY - learningY) * .77} ${endX} ${endY}`;
  // Mobile uses the same scale on both axes, so round bends stay round.
  // Alternate broad turns between the real cards without travelling upwards.
  const mobileHeight = bounds.height * 400 / bounds.width;
  const mobileCards = [origin, profile, { x: definition.x, y: definition.center }, { x: .5, y: learning }, end];
  const mobilePoints = mobileCards.flatMap((card, index) => {
    const point = { x: card.x * 400, y: card.y * mobileHeight };
    if (!index) return [point];
    return [{ x: index % 2 ? 40 : 360, y: (mobileCards[index - 1].y + card.y) / 2 * mobileHeight }, point];
  });
  let mobile = `M${mobilePoints[0].x} ${mobilePoints[0].y}`;
  let mobileFirst = mobile;
  mobilePoints.slice(1).forEach((point, index) => {
    const previous = mobilePoints[index];
    const reach = (point.y - previous.y) * .55;
    mobile += ` C${previous.x} ${previous.y + reach} ${point.x} ${point.y - reach} ${point.x} ${point.y}`;
    if (index === 3) mobileFirst = mobile;
  });
  // Both round caps must fit entirely behind their paper cards at every width.
  const mobileStroke = Math.min(180, origin.height * mobileHeight * .9, end.height * mobileHeight * .9);
  const length = (d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return path.getTotalLength();
  };
  const total = length(desktop);
  const start = length(connector) / total;
  const timeline = (d, width, loopLength, height = ROUTE_HEIGHT) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    const totalLength = path.getTotalLength();
    const loopProgress = loopLength / totalLength;
    const scroll = [];
    const progress = [];
    let previous = path.getPointAtLength(0);
    let cursor = -Infinity;
    const samples = [...new Set([...Array.from({ length: 401 }, (_, i) => i / 400), loopProgress])].sort((a, b) => a - b);
    for (const fraction of samples) {
      const point = path.getPointAtLength(totalLength * fraction);
      const distance = Math.hypot((point.x - previous.x) * bounds.width / width, (point.y - previous.y) * bounds.height / height);
      // Keep progress monotonic even while the returning arc travels upwards.
      cursor = Math.max(cursor + Math.max(.01, distance * .1), bounds.top + point.y * bounds.height / height - bounds.viewport * .7);
      scroll.push(cursor);
      progress.push(Math.max(.0001, fraction));
      previous = point;
    }
    // Follow the tip's actual screen position. Anticipating the turn by the
    // card's entrance also accelerated every later segment off the viewport.
    return { scroll, progress };
  };
  return {
    desktop, mobile, crossing, desktopHeight, mobileHeight, mobileStroke,
    shadeStart: start, shadeEnd: start + length(crossing) / total,
    desktopTimeline: timeline(desktop, 1944.2, length(first), desktopHeight),
    mobileTimeline: timeline(mobile, 400, length(mobileFirst), mobileHeight),
  };
}
function Polaroid({ photo, className = "" }) {
  const crop = photo.crop;
  const imageStyle = crop ? { width: `${photo.width / crop[2] * 100}%`, height: `${photo.height / crop[3] * 100}%`, left: `${-crop[0] / crop[2] * 100}%`, top: `${-crop[1] / crop[3] * 100}%` } : undefined;
  const picture = <span className={styles.photoWindow} style={{ aspectRatio: crop ? `${crop[2]} / ${crop[3]}` : `${photo.width} / ${photo.height}` }}><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={crop ? "(max-width: 767px) 800px, 1080px" : "(max-width: 767px) 650px, 1000px"} className={crop ? styles.crop : styles.photo} style={imageStyle} /></span>;
  return <figure className={`${styles.polaroid} ${className}`} data-nav-media>
    {photo.href ? <a href={photo.href} target="_blank" rel="noopener noreferrer" aria-label={`${photo.caption}. Ver publicación en Instagram`}>{picture}</a> : picture}
    <figcaption>{photo.caption}{photo.href && <ArrowUpRight size={14} aria-hidden="true" />}</figcaption>
  </figure>;
}

function VideoPolaroid() {
  const ref = useRef(null);
  const visible = useInView(ref);
  useEffect(() => {
    const video = ref.current;
    if (!visible) video.pause();
    const pauseWhenHidden = () => { if (document.hidden) video.pause(); };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [visible]);
  return <figure className={`${styles.polaroid} ${styles.videoFrame}`} data-nav-media>
    <video ref={ref} controls playsInline muted preload="none" poster="/img/institutional/collage/reunion-general-2025-poster.jpg" aria-label="Video de la reunión general de SEDIPRO UNT, 10 de mayo de 2025">
      <source src="/img/institutional/collage/reunion-general-2025.mp4" type="video/mp4" />
      Tu navegador no puede reproducir este video. <a href="/img/institutional/collage/reunion-general-2025.mp4">Abrir video de la reunión</a>.
    </video>
    <figcaption>Un recuerdo en movimiento · 2025</figcaption>
  </figure>;
}

function FloatingPlane({ className }) {
  const ref = useRef(null);
  const visible = useInView(ref, { margin: "120px" });
  return <span ref={ref} className={`${styles.plane} ${className}`}>
    <span className={styles.planeDrift} style={{ animationPlayState: visible ? "running" : "paused" }}>
      <Image src="/img/institutional/collage/paper-plane.svg?v=gold" width={300} height={180} alt="" unoptimized />
    </span>
  </span>;
}

const FIGURES = {
  riffle: { Component: Riffle, label: "Tarjetas de ideas: explora con las flechas del teclado" },
  laptop: { Component: Laptop, label: "Una laptop para dar forma a los proyectos" },
  settle: { Component: Settle, label: "Ideas que encuentran su lugar" },
  stack: { Component: Stack, label: "Un conjunto de ideas para construir en equipo" },
  loupe: { Component: Loupe, label: "Una lupa para descubrir nuevas ideas" },
};

function JourneyFigure({ variant, className }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  const reduced = useReducedMotion();
  const { Component, label } = FIGURES[variant];
  return <div ref={ref} className={`${styles.journeyFigure} ${className}`} data-journey-figure={variant}>
    <Component theme="light" intensity={.35} play={visible && !reduced} label={label} />
  </div>;
}

function PaperDetails({ progress }) {
  const reduced = useReducedMotion();
  const y = useTransform(progress, [0, 1], [18, -55]);
  return <motion.div className={styles.details} style={reduced ? undefined : { y }} aria-hidden="true">
    <svg className={styles.wind} viewBox="0 0 160 300" fill="none"><path d="M90 5c75 42-76 77-61 114 8 19 83-12 82 27-1 23-60 39-47 77 7 20 40 33 65 64" /></svg>
    <FloatingPlane className={styles.firstPlane} />
    <FloatingPlane className={styles.middlePlane} />
    <FloatingPlane className={styles.lastPlane} />
    <FloatingPlane className={styles.celebrationPlane} />
    <svg className={styles.breeze} viewBox="0 0 220 80" fill="none"><path d="M4 60c58 8 19-62 74-48s16 62 68 47 36-50 70-42" /></svg>
  </motion.div>;
}

function PhotoCurve({ className, alternate = false }) {
  return <svg className={`${styles.photoCurve} ${className}`} viewBox="0 0 500 300" fill="none" aria-hidden="true" focusable="false">
    <path d={alternate ? "M18 250C170 295 484 212 447 95S195 8 248 134s225 64 228 123" : "M24 245C-24 110 135-22 312 40s188 217 53 211-199-179-88-214"} />
  </svg>;
}

export function ProjectJourney() {
  const sheet = useRef(null);
  const route = useRef(null);
  const lead = useRef(null);
  const profile = useRef(null);
  const definition = useRef(null);
  const learning = useRef(null);
  const community = useRef(null);
  const [geometry, setGeometry] = useState(null);
  const reduced = useReducedMotion();
  const id = useId().replaceAll(":", "");
  useEffect(() => {
    // One continuous ribbon follows the actual content positions at every
    // breakpoint, starting below the first card and ending inside the last.
    const placeOrigin = () => {
      if (![lead, profile, route, definition, learning, community].every(ref => ref.current)) return;
      const card = lead.current.getBoundingClientRect();
      const bounds = route.current.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const definitionCard = definition.current.getBoundingClientRect();
      const profileCard = profile.current.getBoundingClientRect();
      const learningCard = learning.current.getBoundingClientRect();
      const endCard = community.current.getBoundingClientRect();
      const originY = card.top + card.height / 2;
      const learningY = learningCard.top + learningCard.height / 2;
      const endY = endCard.top + endCard.height / 2;
      setGeometry({
        ...anchoredRoute(
          { x: (card.left + card.width / 2 - bounds.left) / bounds.width, y: (originY - bounds.top) / bounds.height, height: card.height / bounds.height },
          { x: (definitionCard.left + definitionCard.width / 2 - bounds.left) / bounds.width, top: (definitionCard.top - bounds.top) / bounds.height, center: (definitionCard.top + definitionCard.height / 2 - bounds.top) / bounds.height },
          (learningY - bounds.top) / bounds.height,
          { x: (endCard.left + endCard.width / 2 - bounds.left) / bounds.width, y: (endY - bounds.top) / bounds.height, height: endCard.height / bounds.height },
          { top: bounds.top + window.scrollY, width: bounds.width, height: bounds.height, viewport: window.innerHeight },
          { x: (profileCard.left + profileCard.width / 2 - bounds.left) / bounds.width, y: (profileCard.top + profileCard.height / 2 - bounds.top) / bounds.height },
        ),
      });
    };
    const observer = new ResizeObserver(placeOrigin);
    [lead, profile, route, definition, learning, community].forEach(ref => observer.observe(ref.current));
    observer.observe(document.body);
    window.addEventListener("resize", placeOrigin);
    placeOrigin();
    return () => { observer.disconnect(); window.removeEventListener("resize", placeOrigin); };
  }, []);
  const { scrollY, scrollYProgress } = useScroll({ target: sheet, offset: ["start end", "end end"] });
  const target = useTransform(scrollY, geometry?.desktopTimeline.scroll ?? [0, 1], geometry?.desktopTimeline.progress ?? [.0001, 1]);
  const mobileTarget = useTransform(scrollY, geometry?.mobileTimeline.scroll ?? [0, 1], geometry?.mobileTimeline.progress ?? [.0001, 1]);
  const drawn = useSpring(target, TRACE_SPRING);
  const mobileDrawn = useSpring(mobileTarget, TRACE_SPRING);
  useLayoutEffect(() => {
    // Layout changes and deep links should start at the correct position;
    // only subsequent user scrolling receives the damped follow-through.
    drawn.jump(target.get());
    mobileDrawn.jump(mobileTarget.get());
  }, [geometry, drawn, mobileDrawn, target, mobileTarget]);
  const shadeStart = geometry?.shadeStart ?? .3724;
  const shade = useTransform(drawn, [shadeStart, geometry?.shadeEnd ?? .7652], [0, 1]);
  const shadeOpacity = useTransform(drawn, [shadeStart, shadeStart + .0026], [0, 1]);
  const collageY = useTransform(scrollYProgress, [0, .55, 1], [0, -45, -65]);

  return <div className={styles.journey}><section className={styles.chapter} id="direccion" aria-labelledby="direction-heading">
    <header className={styles.hero} data-nav-surface="ink">
      <h2 id="direction-heading">Conoce la Dirección de Proyectos y SEDIPRO</h2>
      <p>Descubre los conceptos, organizaciones y comunidades que impulsan la gestión de proyectos en el ámbito profesional y universitario.</p>
      <a href="#direccion-concepto" className={styles.scrollLink}>Sigue el camino <ArrowDown size={20} aria-hidden="true" /></a>
    </header>
    <div ref={sheet} className={styles.sheet} data-nav-surface="mixed" id="direccion-concepto">
      <div className={styles.canvas}>
        <div ref={route} className={styles.route} style={{ visibility: geometry ? "visible" : "hidden" }} aria-hidden="true">
          <svg className={styles.desktopRoute} viewBox={`0 0 1944.2 ${geometry?.desktopHeight ?? ROUTE_HEIGHT}`} preserveAspectRatio="none" data-nav-ribbon focusable="false">
            <defs><linearGradient id={`depth-${id}`} x1="1730" y1="0" x2="620" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#304d90" /><stop offset=".3" stopColor="#29295d" /><stop offset=".8" stopColor="#304d90" /></linearGradient></defs>
            <motion.path d={geometry?.desktop ?? "M0 0"} strokeWidth={500} className={styles.ribbon} style={{ pathLength: reduced ? 1 : drawn }} />
            <motion.path d={geometry?.crossing ?? "M0 0"} strokeWidth={500} className={styles.ribbon} style={{ stroke: `url(#depth-${id})`, pathLength: reduced ? 1 : shade, opacity: reduced ? 1 : shadeOpacity }} />
          </svg>
          <svg className={styles.mobileRoute} viewBox={`0 0 400 ${geometry?.mobileHeight ?? ROUTE_HEIGHT}`} preserveAspectRatio="none" data-nav-ribbon focusable="false"><motion.path d={geometry?.mobile ?? "M0 0"} strokeWidth={geometry?.mobileStroke ?? 180} className={styles.ribbon} style={{ pathLength: reduced ? 1 : mobileDrawn }} /></svg>
        </div>
        <PaperDetails progress={scrollYProgress} />
        <div className={styles.intro}>
          <PhotoCurve className={styles.introCurve} />
          <article ref={lead} className={styles.lead} data-nav-surface="paper">
            <h3>La dirección de proyectos</h3>
            <p>La dirección de proyectos aplica conocimientos, habilidades, herramientas y técnicas a las actividades de un proyecto para cumplir sus requisitos.</p><p>Permite a las organizaciones ejecutar sus proyectos de manera eficaz y eficiente.</p>
          </article>
          <motion.div className={styles.collage} style={reduced ? undefined : { y: collageY }}>
            <Polaroid photo={photos.concepmi} className={styles.backPhoto} /><Polaroid photo={photos.team} className={styles.mainPhoto} />
          </motion.div>
          <Polaroid photo={photos.future} className={styles.introMemory} />
          <JourneyFigure variant="laptop" className={styles.laptopFigure} />
        </div>
        <div className={styles.lower} id="perfil-director">
          <Polaroid photo={photos.ipmc} className={styles.lowerPhoto} />
          <article ref={profile} className={styles.panel} data-nav-surface="paper">
            <h3 className={styles.profileHeading}>¿Por qué es importante el perfil de director de proyectos?</h3>
            <p>Los directores de proyectos son personas organizadas y orientadas a las metas. Entienden el papel estratégico de los proyectos para que una organización aprenda, cambie y tenga éxito.</p><p>Desarrollar sus competencias permite gestionar proyectos y formar equipos humanos en el entorno empresarial.</p>
          </article>
          <Polaroid photo={photos.lima} className={styles.limaMemory} />
        </div>
        <div className={styles.definitionStage}>
          <PhotoCurve className={styles.definitionCurve} alternate />
          <JourneyFigure variant="settle" className={styles.settleFigure} />
          <Polaroid photo={photos.visit} className={styles.visitMemory} />
          <article ref={definition} className={`${styles.panel} ${styles.definition}`} id="sedipro" aria-labelledby="sedipro-heading" data-nav-surface="paper">
            <h3 id="sedipro-heading">¿Qué es el PMI?</h3>
            <Image className={styles.pmiLogo} src="/img/institutional/pmi-norte-peru.webp" alt="Project Management Institute · Capítulo Norte Perú" width={1047} height={402} sizes="(max-width: 767px) 280px, 340px" />
            <p>El PMI (Project Management Institute) es una organización global sin fines de lucro que promueve las mejores prácticas en gestión de proyectos.</p>
            <p>Desarrolla estándares internacionales, como la Guía del PMBOK, y certifica profesionales mediante credenciales como CAPM (Certified Associate in Project Management).</p>
          </article>
          <Polaroid photo={photos.recognition} className={styles.recognitionMemory} />
          <Polaroid photo={photos.hackathon} className={styles.hackathonMemory} />
          <JourneyFigure variant="riffle" className={styles.ideaFigure} />
          <Polaroid photo={photos.christmas} className={styles.christmasMemory} />
          <JourneyFigure variant="loupe" className={styles.loupeFigure} />
        </div>
        <div className={`${styles.intro} ${styles.learning}`} id="sedipro-concepto">
          <PhotoCurve className={styles.learningCurve} />
          <article ref={learning} className={styles.lead} data-nav-surface="paper">
            <h3>¿Qué es una SEDIPRO?</h3>
            <p>Una Sección Estudiantil de Dirección de Proyectos reúne a estudiantes de distintas disciplinas para llevar la dirección de proyectos a la vida universitaria.</p>
            <p>Somos agrupaciones sin fines de lucro. Ponemos en práctica lo aprendido mediante iniciativas académicas, tecnológicas, ambientales y sociales.</p>
          </article>
          <motion.div className={styles.collage} style={reduced ? undefined : { y: collageY }}>
            <Polaroid photo={photos.gala} className={styles.portrait} /><VideoPolaroid />
            <Polaroid photo={photos.chocolate} className={styles.smallPhoto} />
            <Polaroid photo={photos.projectPlus} className={styles.projectMemory} />
          </motion.div>
          <JourneyFigure variant="stack" className={styles.stackFigure} />
          <Polaroid photo={photos.volunteer} className={styles.volunteerMemory} />
        </div>
        <div className={`${styles.lower} ${styles.community}`} id="comunidad-sedipro">
          <PhotoCurve className={styles.communityCurve} alternate />
          <div className={styles.communityPhotos}>
            <Polaroid photo={photos.vocations} className={styles.vocationsMemory} />
            <Polaroid photo={photos.welcome} className={styles.welcomeMemory} />
          </div>
          <article ref={community} className={styles.panel} data-nav-surface="paper">
            <h3>Existen...</h3>
            <p>Más de 30 universidades peruanas han contado con una Sección Estudiantil de Dirección de Proyectos. En 2017, se registraron 33 SEDIPRO agrupadas en la Red Universitaria de Dirección de Proyectos (RUDP).</p>
            <p>Esta comunidad ha tenido presencia en distintas regiones del país, incluyendo Lima, La Libertad, Arequipa, Piura, Cajamarca, Tacna, Puno, Cusco, Ica y Junín. En Trujillo, se han constituido SEDIPRO en la UNT, UPN y UCV.</p>
          </article>
        </div>
      </div>
    </div>
  </section></div>;
}
