"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/motion";
import { PROJECTS } from "./content";
import { Reveal } from "./motion";
import styles from "./public-site.module.css";

export function ProjectCarousel() {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const projects = PROJECTS.slice(0, 4);
  const active = projects[selected];
  return (
    <section className={styles.carouselSection} aria-labelledby="projects-heading">
      <div className={styles.carouselIntro}>
        <Reveal><h2 id="projects-heading">Las grandes ideas<br />necesitan<br /><em>grandes equipos.</em></h2></Reveal>
        <p>Descubre nuestras experiencias más destacadas.</p>
        <Link href="/proyectos" className={styles.action}>Ver todos los proyectos <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
      <div className={styles.carousel}>
        <div className={styles.carouselTabs} role="tablist" aria-label="Proyectos destacados">
          {projects.map((project, index) => <button key={project.id} type="button" role="tab" id={`project-tab-${index}`} aria-selected={selected === index} aria-controls="featured-project" tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={(event) => {
            const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? (index + 1) % projects.length : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (index + projects.length - 1) % projects.length : event.key === "Home" ? 0 : event.key === "End" ? projects.length - 1 : null;
            if (next === null) return;
            event.preventDefault(); setSelected(next); document.getElementById(`project-tab-${next}`)?.focus();
          }}><span>{String(index + 1).padStart(2, "0")}</span><span>{project.iconLabel}</span></button>)}
        </div>
        <div className={styles.carouselPanel} id="featured-project" role="tabpanel" aria-labelledby={`project-tab-${selected}`} tabIndex={0}>
          <div className={styles.carouselImages}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div key={active.id} className={styles.carouselImage} initial={reduced ? false : { opacity: 0, y: 55, rotate: 5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -30, rotate: -4 }} transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <Image src={active.image} alt={active.imageAlt} fill sizes="(max-width: 767px) 90vw, 480px" className={styles.poster} />
              </motion.div>
            </AnimatePresence>
          </div>
          <Link href={active.href} target={active.href.startsWith("http") ? "_blank" : undefined} rel={active.href.startsWith("http") ? "noopener noreferrer" : undefined} className={styles.carouselCaption}>
            <span><strong>{active.title}</strong><span>{active.meta}</span></span><ArrowUpRight aria-hidden="true" />
          </Link>
          <p className={styles.carouselDescription}>{active.description}</p>
        </div>
      </div>
    </section>
  );
}

export function ProjectArchive() {
  return (
    <section className={styles.archive} id="contenido" aria-label="Todos los proyectos">
      {PROJECTS.map((project, index) => (
        <Reveal key={project.id} className={styles.projectRow}>
          <Link href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined} className={styles.projectImage}>
            <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 767px) 90vw, 45vw" className={styles.poster} priority={index === 0} />
          </Link>
          <div className={styles.projectInfo}>
            <span className={styles.projectMeta}>{project.meta}</span>
            <h2><Link href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}>{project.title} <ArrowUpRight aria-hidden="true" /></Link></h2>
            <p>{project.description}</p>
            <Link href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined} className={styles.textLink}>Conocer el proyecto <ArrowUpRight size={20} aria-hidden="true" /></Link>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
