"use client";

import { useState } from "react";
import Image from "next/image";
import { Landmark, Medal, Trophy, Users } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import { RECOGNITIONS } from "./content";
import { RecognitionLandscape } from "./recognition-landscape";
import styles from "./about-recognition-journey.module.css";

const YEARS = [...new Set(RECOGNITIONS.map(item => item.period))].sort();

function AchievementIcon({ item, ...props }) {
  const Icon = item.role === "Reconocimiento Institucional" ? Landmark : item.role === "Organización de Evento" ? Users : item.company.startsWith("1er") ? Trophy : Medal;
  return <Icon {...props} />;
}

function Summit() {
  return <div className={styles.summit} aria-hidden="true">
    <svg viewBox="0 0 700 1100" preserveAspectRatio="none" className={styles.mountains}>
      <path d="M0 1100L185 520L285 760L465 60L700 1100Z" fill="#ced7eb" />
      <path d="M0 1100L185 520L205 1100Z" fill="#496da9" />
      <path d="M185 520L285 760L430 1100H205Z" fill="#304d90" />
      <path d="M220 1100L465 60L450 1100Z" fill="#4975ae" />
      <path d="M465 60L700 1100H450Z" fill="#253d78" />
      <path d="M361 502L465 60L568 517L488 400L450 470L425 350Z" fill="#edf0f8" />
      <path d="M110 752L185 520L258 696L206 658L182 700L165 632Z" fill="#edf0f8" />
      <path d="M-40 1100L95 815L235 1100Z" fill="#7897c2" />
      <path d="M95 815L235 1100H110Z" fill="#44649e" />
      <path d="M59 891L95 815L135 896L103 872L89 890L80 866Z" fill="#dce5f2" />
    </svg>
    <div className={styles.flagPole}><div className={styles.flag}><Image src="/logos/sedi-logo.svg" alt="" width={156} height={55} /></div></div>
  </div>;
}

export function AboutRecognitionJourney() {
  const [selected, setSelected] = useState("2025");
  const reduced = useReducedMotion();
  const chooseYear = year => {
    setSelected(year);
    document.getElementById(`logros-${year}`)?.scrollIntoView({ block: "center", behavior: reduced ? "instant" : "smooth" });
  };
  return <section id="reconocimientos" className={styles.section} data-nav-surface="paper" aria-labelledby="recognitions-title">
    <div className={styles.heading}><h2 id="recognitions-title">Nuestros<br />{" "}<span>reconocimientos.</span></h2>
      <nav className={styles.years} aria-label="Explorar reconocimientos por año">{YEARS.map(year => <button type="button" key={year} onClick={() => chooseYear(year)} aria-pressed={selected === year}>{year}</button>)}</nav>
    </div>
    <RecognitionLandscape />
    <div className={styles.map}>
      <Summit />
      <ol className={styles.timeline} aria-label="Camino de reconocimientos de 2020 a 2025">{YEARS.map((year, index) => {
        const achievements = RECOGNITIONS.filter(item => item.period === year);
        return <li key={year} id={`logros-${year}`} className={styles.year} data-selected={selected === year || undefined} style={{ "--year-row": 3 - Math.floor(index / 2), "--year-column": index % 2 + 1 }}>
          <svg className={styles.mobileRoad} viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden="true"><path d="M50 0C100 70 0 110 50 160S100 245 50 300" fill="none" stroke="#304d90" strokeWidth="25" /><path d="M50 0C100 70 0 110 50 160S100 245 50 300" fill="none" stroke="#f6f1fa" strokeWidth="1.5" strokeDasharray="5 5" /></svg>
          <div className={styles.yearHeading}><button type="button" className={styles.pin} aria-label={`Destacar reconocimientos de ${year}`} aria-pressed={selected === year} onClick={() => setSelected(year)}><Trophy size={25} strokeWidth={1.6} aria-hidden="true" /></button><h3>{year}</h3></div>
          <ul className={styles.achievements}>{achievements.map(item => <li key={item.company}><AchievementIcon item={item} size={18} strokeWidth={1.6} aria-hidden="true" /><div><h4>{item.company}</h4><p>{item.role}</p></div></li>)}</ul>
        </li>;
      })}</ol>
    </div>
  </section>;
}
