import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { AREAS, DIRECTIVA, RECOGNITIONS } from "./content";
import { Reveal, PublicVideo } from "./motion";
import { ImpactStrip } from "./sequences";
import styles from "./public-site.module.css";

export function AboutContent() {
  const years = [...new Set(RECOGNITIONS.map((item) => item.period))];
  return (
    <>
      <section className={styles.aboutIntro} id="contenido">
        <Reveal><h2>Quiénes<br /><em>somos.</em></h2></Reveal>
        <div>
          <p>Somos la <strong>Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo</strong>, un equipo multidisciplinario comprometido con la formación de estudiantes mediante la difusión de las buenas prácticas en gestión de proyectos, utilizando la metodología PMI y herramientas ágiles bajo un enfoque académico, social y ambiental.</p>
          <div className={styles.missionRow}><h3>Misión</h3><p>Formar a los futuros líderes en las buenas prácticas de dirección de proyectos mediante un enfoque integral e innovador.</p></div>
          <div className={styles.missionRow}><h3>Visión</h3><p>Ser la mejor SEDIPRO a nivel nacional, impulsando el desarrollo de gestores comprometidos con la excelencia y el impacto positivo.</p></div>
        </div>
      </section>
      <section className={styles.teamSection} aria-labelledby="team-heading">
        <Reveal className={styles.sectionHeader}><h2 id="team-heading">Nuestra<br /><em>directiva.</em></h2><p>SEDIPRO UNT · 2026</p></Reveal>
        <div className={styles.teamGrid}>
          {DIRECTIVA.map((person, index) => <Reveal key={person.nombre} className={styles.person} delay={index % 3 * 0.05}>
            <div className={styles.personImage}><Image src={person.imagen} alt={person.nombre} fill sizes="(max-width: 767px) 45vw, 32vw" /></div>
            <h3>{person.nombre}</h3><p>{person.cargo}</p>
          </Reveal>)}
        </div>
      </section>
      <section className={styles.areasSection} aria-labelledby="areas-heading">
        <Reveal><h2 id="areas-heading">Cinco áreas.<br /><em>Una dirección.</em></h2></Reveal>
        <div className={styles.areaList}>{AREAS.map((area) => <div key={area.short} className={styles.areaRow}>
          <Image src={area.logo} alt="" width={58} height={58} /><span>{area.short}</span>
          {area.href ? <Link href={area.href}>{area.name}<ArrowUpRight aria-hidden="true" /></Link> : <h3>{area.name}</h3>}
        </div>)}</div>
      </section>
      <ImpactStrip />
      <section className={styles.recognitions} aria-labelledby="recognitions-heading">
        <div><h2 id="recognitions-heading">El impacto<br /><em>de hacerlo juntos.</em></h2><p>Más de 12 años de experiencia, alianzas estratégicas, networking y más de 13 años proyectando vidas.</p></div>
        <div className={styles.recognitionList}>{years.map((year, index) => <details key={year} open={index === 0}>
          <summary>{year}<Plus size={22} aria-hidden="true" /></summary>
          <ul>{RECOGNITIONS.filter((entry) => entry.period === year).map((entry) => <li key={entry.company}><h3>{entry.company}</h3><p>{entry.role}</p></li>)}</ul>
        </details>)}</div>
      </section>
      <section className={styles.videoSection}><Reveal><h2>Un poco<br /><em>de nosotros.</em></h2></Reveal><PublicVideo /></section>
    </>
  );
}
