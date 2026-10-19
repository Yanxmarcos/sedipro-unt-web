"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { EMAIL, IMPACT } from "./content";
import { STORY_RECOGNITIONS } from "./home-content";
import styles from "./public-site.module.css";

const bandPhotos = [STORY_RECOGNITIONS[0], STORY_RECOGNITIONS[2]];

export function EditorialBands({ closing = false, compact = false }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-18%"]);
  const reverse = useTransform(scrollYProgress, [0, 1], ["-18%", "10%"]);
  const lines = closing ? ["Proyectando vidas", "Construyendo futuro"] : ["Buenas prácticas", "Nuevas ideas"];
  return (
    <section ref={ref} className={`${styles.editorialBands} ${compact ? styles.compactBands : ""}`} aria-label={lines.join(". ")}>
      {lines.map((line, index) => <motion.div key={line} className={styles.editorialBand} style={reduced ? undefined : { x: index ? reverse : x }} aria-hidden="true">
        {[0, 1].map((copy) => <span key={copy}>{line}<span className={styles.bandImage}><Image src={bandPhotos[index].src} alt="" fill sizes="(max-width: 767px) 44vw, (max-width: 1538px) 26vw, 400px" /></span></span>)}
      </motion.div>)}
    </section>
  );
}

function ApproachCircle({ label, index, progress, reduced }) {
  const x = useTransform(progress, [0, 0.4], [index === 0 ? -80 : index === 1 ? 80 : 0, 0]);
  const y = useTransform(progress, [0, 0.4], [index === 2 ? 80 : -30, 0]);
  const scale = useTransform(progress, [0.55, 1], [1, 9]);
  return <motion.div className={styles.approachCircle} style={reduced ? undefined : { x, y, scale }}><span>{label}</span></motion.div>;
}

export function ApproachScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const opacity = useTransform(scrollYProgress, [0.65, 0.85], [1, 0]);
  return (
    <section ref={ref} className={styles.approach} aria-labelledby="approach-heading">
      <div className={styles.approachStage}>
        <div className={styles.approachDiagram} aria-label="Enfoque académico, social y ambiental">
          {["Académico", "Social", "Ambiental"].map((label, index) => <ApproachCircle key={label} label={label} index={index} progress={scrollYProgress} reduced={reduced} />)}
          <span className={styles.intersection} aria-hidden="true" />
        </div>
        <motion.div className={styles.approachCopy} style={reduced ? undefined : { opacity }}>
          <h2 id="approach-heading">Nuestro<br />enfoque.</h2>
          <p>Difundimos las buenas prácticas en gestión de proyectos, utilizando la metodología PMI y herramientas ágiles bajo un enfoque académico, social y ambiental.</p>
          <a href={`mailto:${EMAIL}`} className={styles.action}>Conecta con nosotros <ArrowUpRight size={18} aria-hidden="true" /></a>
        </motion.div>
      </div>
    </section>
  );
}

function StatementWord({ word, index, total, progress, reduced }) {
  const opacity = useTransform(progress, [index / total * 0.7, (index + 1) / total * 0.7], [0.5, 1]);
  return <motion.span style={{ opacity: reduced ? 1 : opacity }} aria-hidden="true">{word} </motion.span>;
}

export function ScrollStatement() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const text = "Somos un equipo multidisciplinario comprometido con la formación de estudiantes mediante las buenas prácticas en dirección de proyectos.";
  const words = text.split(" ");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  return <section ref={ref} className={styles.statement}><h2 aria-label={text}>{words.map((word, index) => <StatementWord key={index} word={word} index={index} total={words.length} progress={scrollYProgress} reduced={reduced} />)}</h2><Link href="/nosotros" className={styles.action}>Conoce al equipo <ArrowUpRight size={18} aria-hidden="true" /></Link></section>;
}

export function ImpactStrip() {
  const [paused, setPaused] = useState(false);
  return (
    <section className={styles.impact} aria-label="SEDIPRO UNT en cifras">
      <div className={styles.impactControls}><span>SEDIPRO UNT en cifras</span><button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}{paused ? "Reanudar cifras" : "Pausar cifras"}</button></div>
      <div className={styles.impactWindow}><div className={styles.impactTrack} style={{ animationPlayState: paused ? "paused" : undefined }}>{[0, 1].map((copy) => <div key={copy} className={styles.impactGroup} aria-hidden={copy ? true : undefined}>{IMPACT.map((item) => <div key={item.label}><span>{item.value}</span><p>{item.label}</p></div>)}</div>)}</div></div>
    </section>
  );
}
