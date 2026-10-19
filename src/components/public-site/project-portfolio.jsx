"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import { PROJECTS } from "./content";
import styles from "./project-portfolio.module.css";

const projects = [...PROJECTS].sort((a, b) => b.date.localeCompare(a.date));
const spring = { stiffness: 210, damping: 21, mass: .7 };

// Four elastic edges follow the nearby cursor; the content itself stays readable.
function outline(width, height, x, y, strength) {
  const r = 16, inset = 2;
  const left = inset, right = width - inset, top = inset, bottom = height - inset;
  const bump = (position, cursor, distance) => 18 * strength * Math.exp(-(((position - cursor) / 75) ** 2)) * Math.max(0, 1 - Math.abs(distance) / 100);
  let path = `M ${left + r} ${top}`;
  for (let i = 1; i <= 48; i++) {
    const px = left + r + (right - left - 2 * r) * i / 48;
    path += ` L ${px} ${top + bump(px, x, y - top)}`;
  }
  path += ` Q ${right} ${top} ${right} ${top + r}`;
  for (let i = 1; i <= 16; i++) {
    const py = top + r + (bottom - top - 2 * r) * i / 16;
    path += ` L ${right - bump(py, y, right - x)} ${py}`;
  }
  path += ` Q ${right} ${bottom} ${right - r} ${bottom}`;
  for (let i = 1; i <= 48; i++) {
    const px = right - r - (right - left - 2 * r) * i / 48;
    path += ` L ${px} ${bottom - bump(px, x, bottom - y)}`;
  }
  path += ` Q ${left} ${bottom} ${left} ${bottom - r}`;
  for (let i = 1; i <= 16; i++) {
    const py = bottom - r - (bottom - top - 2 * r) * i / 16;
    path += ` L ${left + bump(py, y, x - left)} ${py}`;
  }
  return `${path} Q ${left} ${top} ${left + r} ${top} Z`;
}

function ElasticProject({ project, index, onFocus }) {
  const row = useRef(null);
  const reduced = useReducedMotion();
  const [size, setSize] = useState({ width: 1000, height: 240 });
  const pointerX = useMotionValue(500), pointerY = useMotionValue(120), tension = useMotionValue(0);
  const x = useSpring(pointerX, spring), y = useSpring(pointerY, spring), pull = useSpring(tension, spring);
  const path = useTransform([x, y, pull], ([px, py, amount]) => outline(size.width, size.height, px, py, amount));
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.target.clientWidth, height: entry.target.clientHeight }));
    const desktop = window.matchMedia("(min-width: 768px)");
    const update = () => { observer.disconnect(); if (desktop.matches && row.current) observer.observe(row.current); };
    update(); desktop.addEventListener("change", update);
    return () => { observer.disconnect(); desktop.removeEventListener("change", update); };
  }, []);
  const external = project.href.startsWith("http");
  return <li className={styles.projectItem}>
    <Link ref={row} href={project.href} className={styles.project} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      onFocus={event => onFocus(event.currentTarget)}
      onPointerMove={event => {
        if (reduced || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(event.clientX - rect.left); pointerY.set(event.clientY - rect.top); tension.set(1);
      }} onPointerLeave={() => tension.set(0)}>
      <svg className={styles.outline} viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden="true">
        <motion.path d={path} />
      </svg>
      <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <span className={styles.image}><Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 767px) 76px, 116px" /></span>
      <span className={styles.info}>
        <time dateTime={project.date}>{project.meta}</time>
        <h2>{project.title}</h2>
        <span className={styles.description}>{project.description}</span>
      </span>
      <span className={styles.visit}><span>Ver proyecto</span><ArrowUpRight size={23} aria-hidden="true" /></span>
    </Link>
  </li>;
}

export function ProjectPortfolio() {
  const root = useRef(null), list = useRef(null);
  const reduced = useReducedMotion();
  const [metrics, setMetrics] = useState({ width: 0, height: 0, travel: 0, listHeight: 0 });
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });
  const vertical = Math.max(0, metrics.listHeight - metrics.height);
  const distance = metrics.travel + vertical;
  const fraction = distance ? metrics.travel / distance : 1;
  const openingX = useTransform(scrollYProgress, [0, fraction], [metrics.width + 1, 0]);
  const listY = useTransform(scrollYProgress, [fraction, 1], [0, -vertical]);
  const narrow = metrics.width < 768;
  const curveWidth = useTransform(scrollYProgress, [0, fraction * .55, fraction], [narrow ? 56 : 118, narrow ? 84 : 160, 0]);
  const titleX = useTransform(scrollYProgress, [0, fraction], [0, -metrics.width * .14]);
  const progressOpacity = useTransform(scrollYProgress, [fraction * .9, fraction], [0, 1]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const animated = !reduced && metrics.width >= 768;
  useEffect(() => {
    const measure = () => {
      if (!root.current || !list.current) return;
      const width = root.current.clientWidth, height = window.innerHeight;
      setMetrics({ width, height, travel: (width < 768 ? height : width) * .95, listHeight: list.current.offsetHeight });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(list.current); window.addEventListener("resize", measure); measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  useEffect(() => {
    if (!animated) return;
    return scrollYProgress.on("change", value => {
    if (value < fraction * .98) { setActiveIndex(-1); return; }
    const center = Math.max(0, value * distance - metrics.travel) + metrics.height * .4;
    const rows = list.current.querySelectorAll("li");
    let nearest = 0;
    rows.forEach((row, index) => { if (row.offsetTop < center) nearest = index; });
    setActiveIndex(nearest);
    });
  }, [animated, scrollYProgress, distance, fraction, metrics.height, metrics.travel]);
  const reveal = (row, behavior = "smooth") => {
    if (!animated) { (row || list.current)?.scrollIntoView({ block: row ? "center" : "start", behavior: reduced ? "instant" : behavior }); return; }
    const top = root.current.getBoundingClientRect().top + window.scrollY;
    const rowOffset = row ? row.parentElement.offsetTop - 110 : 0;
    window.scrollTo({ top: top + metrics.travel + Math.max(0, rowOffset), behavior });
  };
  return <section ref={root} className={styles.experience} data-animated={animated || undefined} style={animated ? { height: metrics.height + distance } : undefined} aria-label="Proyectos">
    <div className={styles.stage}>
      <motion.div className={styles.hero} style={animated && !narrow ? { x: titleX } : undefined}>
        <h1>Proyectos</h1>
        <p className={styles.heroDescription}>Algunos de nuestros proyectos más destacados.</p>
        <button type="button" className={styles.viewProjects} onClick={() => reveal()} aria-controls="lista-proyectos">Ver proyectos<ArrowRight size={20} aria-hidden="true" /></button>
      </motion.div>
      <motion.div className={styles.panel} style={animated ? { x: openingX } : undefined}>
        <motion.svg className={styles.curtain} viewBox="0 0 160 1000" preserveAspectRatio="none" style={{ width: animated ? curveWidth : 0 }} aria-hidden="true">
          <path d="M160 0 C160 250 160 280 100 370 C40 430 0 455 0 500 C0 545 40 570 100 630 C160 720 160 750 160 1000 Z" />
        </motion.svg>
        <svg className={styles.mobileCrest} viewBox="0 0 1000 140" preserveAspectRatio="none" aria-hidden="true"><path d="M0 140C230 140 335 140 415 68C470 18 530 18 585 68C665 140 770 140 1000 140V144H0Z" /></svg>
        <button type="button" className={styles.scrollCue} onClick={() => reveal()} tabIndex={activeIndex < 0 ? 0 : -1} aria-label="Explorar los proyectos"><span className={styles.desktopCue}>Explorar</span><span className={styles.mobileCue}>Desliza</span><ArrowRight size={24} aria-hidden="true" /></button>
        <motion.div className={styles.listMotion} style={animated ? { y: listY } : undefined}>
          <ol ref={list} className={styles.list} id="lista-proyectos">
            {projects.map((project, index) => <ElasticProject key={project.id} project={project} index={index} onFocus={row => reveal(row, "instant")} />)}
          </ol>
        </motion.div>
      </motion.div>
      <motion.nav className={styles.index} aria-label="Ir a un proyecto" aria-hidden={activeIndex < 0} style={animated ? { opacity: progressOpacity, visibility: activeIndex < 0 ? "hidden" : "visible" } : undefined}>
        {projects.map((project, index) => <button key={project.id} aria-label={project.title} aria-current={activeIndex === index ? "true" : undefined} tabIndex={activeIndex < 0 ? -1 : 0} onClick={() => reveal(list.current.children[index].querySelector("a"))}><span /></button>)}
      </motion.nav>
    </div>
  </section>;
}
