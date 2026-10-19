"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { motion, transform, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ArrowDown, Clapperboard } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import { InstitutionalFilm } from "./institutional-film";
import styles from "./home-approach.module.css";

const CENTERS = [[235, 235], [565, 235], [400, 521]];
const RADIUS = 220;
const CORE = { x: 400, y: 330.4, radius: 29.4 };
const LABELS = [
  { title: "Académico", detail: ["Formación", "académica"] },
  { title: "Social", detail: ["Impacto", "social"] },
  { title: "Profesional", detail: ["Desarrollo", "profesional"] },
];

// Keep every layer on the same JS progress clock. Native scroll-timeline
// acceleration otherwise gives opacity a different range from sticky zoom.
function useProgressRange(progress, input, output) {
  return useTransform(progress, value => transform(value, input, output));
}

function FocusLabel({ index, progress, reduced }) {
  const simple = useProgressRange(progress, [0, .07, .11, 1], [1, 1, 0, 0]);
  const detailed = useProgressRange(progress, [0, .41, .47, .54, .62, 1], [0, 0, 1, 1, 0, 0]);
  const [x, y] = CENTERS[index];
  return <g className={styles.labels} textAnchor="middle">
    <motion.text x={x} y={y + 14} className={styles.label} style={{ opacity: reduced ? 1 : simple }}>{LABELS[index].title}</motion.text>
    <motion.text x={x} y={y - 13} className={styles.detail} style={{ opacity: reduced ? 0 : detailed }}>
      <tspan x={x}>{LABELS[index].detail[0]}</tspan><tspan x={x} dy="43">{LABELS[index].detail[1]}</tspan>
    </motion.text>
  </g>;
}

function FocusCircle({ index, progress, reduced }) {
  const [cx, cy] = CENTERS[index];
  // Join at the shared center, hold the union, then reopen for the detailed
  // labels. Labels are hidden during travel so no boundary crosses a word.
  const times = [0, .11, .23, .3, .42, 1];
  const x = useProgressRange(progress, times, [0, 0, CORE.x - cx, CORE.x - cx, 0, 0]);
  const y = useProgressRange(progress, times, [0, 0, CORE.y - cy, CORE.y - cy, 0, 0]);
  return <motion.g style={reduced ? undefined : { x, y }}>
    <circle cx={cx} cy={cy} r={RADIUS} className={`${styles.circle} ${styles[`circle${index}`]}`} />
  </motion.g>;
}

export function HomeApproach() {
  const section = useRef(null);
  const stage = useRef(null);
  const frame = useRef(null);
  const step = useRef({ prepared: false, revealed: false });
  const [film, setFilm] = useState({ prepared: false, revealed: false });
  const [geometry, setGeometry] = useState({ x: 0, y: 0, cover: 50 });
  const reduced = useReducedMotion();
  const id = useId().replaceAll(":", "");
  const { scrollYProgress: progress } = useScroll({ target: section, offset: ["start start", "end end"] });
  useLayoutEffect(() => {
    const measure = () => {
      const bounds = stage.current.getBoundingClientRect();
      const diagram = frame.current.getBoundingClientRect();
      const unit = diagram.width / 800;
      if (!unit) return;
      setGeometry({
        x: bounds.width / 2 - (diagram.left - bounds.left + CORE.x * unit),
        y: bounds.height / 2 - (diagram.top - bounds.top + CORE.y * unit),
        cover: Math.hypot(bounds.width, bounds.height) / (2 * CORE.radius * unit) * 1.08,
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage.current); observer.observe(frame.current);
    measure();
    return () => observer.disconnect();
  }, []);
  useMotionValueEvent(progress, "change", value => {
    const next = { prepared: step.current.prepared || value >= .5, revealed: value >= .89 };
    if (next.prepared !== step.current.prepared || next.revealed !== step.current.revealed) {
      step.current = next; setFilm(next);
    }
  });
  const zoom = useProgressRange(progress, [.54, .8], [0, 1]);
  const scale = useTransform(zoom, value => Math.exp(Math.log(geometry.cover) * value));
  const x = useProgressRange(progress, [.54, .72], [0, geometry.x]);
  const y = useProgressRange(progress, [.54, .72], [0, geometry.y]);
  const copyOpacity = useProgressRange(progress, [.58, .68], [1, 0]);
  const coreOpacity = useProgressRange(progress, [.42, .49], [0, 1]);
  const mergedOpacity = useProgressRange(progress, [0, .2, .24, .3, .38, 1], [0, 0, 1, 1, 0, 0]);
  const filmOpacity = useProgressRange(progress, [.82, .9], [0, 1]);
  const introOpacity = useProgressRange(progress, [.76, .81, .85, .91], [0, 1, 1, 0]);
  const showVideo = () => {
    if (reduced) { document.getElementById("video-institucional").scrollIntoView({ behavior: "instant" }); return; }
    const bounds = section.current.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + bounds.top + (bounds.height - window.innerHeight) * .94, behavior: "smooth" });
  };

  return <section ref={section} id="enfoque" className={styles.focus} aria-labelledby="focus-heading" data-nav-surface="ink">
    <div ref={stage} className={styles.stage}>
      <div className={styles.visual}>
        <div ref={frame} className={styles.diagramFrame}>
          <motion.div className={styles.diagram} style={reduced ? undefined : { x, y, scale }}>
            <svg viewBox="0 0 800 760" role="img" aria-label="Tres ámbitos que se unen en proyectos reales: académico, social y profesional">
              <defs>{CENTERS.map(([cx, cy], i) => <clipPath key={i} id={`focus-${id}-${i}`}><circle cx={cx} cy={cy} r={RADIUS} /></clipPath>)}</defs>
              {CENTERS.map((_, i) => <FocusCircle key={i} index={i} progress={progress} reduced={reduced} />)}
              <motion.g clipPath={`url(#focus-${id}-0)`} style={{ opacity: reduced ? 1 : coreOpacity }}><g clipPath={`url(#focus-${id}-1)`}><circle cx="400" cy="521" r={RADIUS} fill="#8b4c99" /></g></motion.g>
              {LABELS.map((_, i) => <FocusLabel key={i} index={i} progress={progress} reduced={reduced} />)}
              <motion.text x={CORE.x} y={CORE.y - 10} textAnchor="middle" className={styles.mergedLabel} style={{ opacity: reduced ? 0 : mergedOpacity }}>
                <tspan x={CORE.x}>Proyectos</tspan><tspan x={CORE.x} dy="43">reales</tspan>
              </motion.text>
            </svg>
          </motion.div>
        </div>
        <motion.div className={styles.copy} style={reduced ? undefined : { opacity: copyOpacity }}>
          <h2 id="focus-heading">Nuestro<br /> enfoque.</h2>
          <p>Conectamos el aprendizaje académico, el compromiso social y el desarrollo profesional a través de proyectos reales y el trabajo en equipos multidisciplinarios.</p>
          <button type="button" onClick={showVideo} className={styles.watchLink}>Desliza<ArrowDown size={18} aria-hidden="true" /></button>
        </motion.div>
      </div>
      <motion.div className={styles.filmIntro} style={{ opacity: reduced ? 0 : introOpacity }} aria-hidden="true"><Clapperboard /><span>Video institucional</span></motion.div>
      <motion.div className={styles.filmSurface} style={{ opacity: reduced ? 1 : filmOpacity }}>
        <InstitutionalFilm revealed={reduced || film.revealed} prepared={reduced || film.prepared} />
      </motion.div>
    </div>
  </section>;
}
