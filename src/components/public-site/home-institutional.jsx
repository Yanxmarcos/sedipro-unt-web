"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import { HOME_AREAS, HOME_GOALS, HOME_MILESTONES, HOME_VALUES } from "./home-content";
import { SectionLiquid } from "./section-liquid";
import styles from "./home-institutional.module.css";

function ValueLine({ label, index, progress, reduced }) {
  const start = index / HOME_VALUES.length;
  const opacity = useTransform(progress, [Math.max(0,start-.08),start,start+.17,Math.min(1,start+.25)], [.58,1,1,.58]);
  const x = useTransform(progress, [start,start+.17], [0,12]);
  return <motion.li style={reduced ? undefined : { opacity,x }}>{label}</motion.li>;
}

export function HomeValues() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start","end end"] });
  return <section ref={ref} className={styles.values} aria-labelledby="values-heading"><div className={styles.valuesStage}>
    <SectionLiquid surface="#29295d" />
    <div className={styles.valuesLayout}><h2 id="values-heading" className={styles.display}>Nuestros<br />valores.</h2>
      <ul>{HOME_VALUES.map((label,index)=><ValueLine key={label} label={label} index={index} progress={scrollYProgress} reduced={reduced} />)}</ul>
    </div>
  </div></section>;
}

export function HomeAreas() {
  const [selected,setSelected] = useState(0);
  const tabs = useRef([]);
  const reduced = useReducedMotion();
  const area = HOME_AREAS[selected];
  function onKeyDown(event,index) {
    const next = event.key === "ArrowDown" || event.key === "ArrowRight" ? (index+1)%HOME_AREAS.length : event.key === "ArrowUp" || event.key === "ArrowLeft" ? (index+HOME_AREAS.length-1)%HOME_AREAS.length : event.key === "Home" ? 0 : event.key === "End" ? HOME_AREAS.length-1 : null;
    if(next===null) return;
    event.preventDefault(); setSelected(next); tabs.current[next]?.focus();
  }
  return <section className={styles.areas} aria-labelledby="areas-heading"><div className={styles.colorStage}>
    <SectionLiquid surface="#662065" />
    <div className={styles.areasContent}><h2 id="areas-heading" className={styles.display}>Cinco áreas.<br />Un mismo equipo.</h2>
      <div className={styles.areasLayout}><div className={styles.areaTabs} role="tablist" aria-label="Nuestras áreas" aria-orientation="vertical">
        {HOME_AREAS.map((item,index)=><button ref={el=>{tabs.current[index]=el;}} type="button" key={item.short} id={`home-area-tab-${index}`} role="tab" aria-selected={index===selected} aria-controls={`home-area-panel-${index}`} tabIndex={index===selected ? 0 : -1} onClick={()=>setSelected(index)} onKeyDown={event=>onKeyDown(event,index)}><span>{item.short}</span><ArrowUpRight size={24} aria-hidden="true" /></button>)}
      </div>
      <div role="tabpanel" id={`home-area-panel-${selected}`} aria-labelledby={`home-area-tab-${selected}`} tabIndex={0} className={styles.areaPanel}>
        <motion.div key={selected} initial={false} animate={reduced ? undefined : { opacity:[.5,1],x:[20,0] }} transition={{duration:.4,ease:[.16,1,.3,1]}}><div className={styles.areaEmblem}><Image src={area.logo} alt={`Emblema de ${area.name}`} width={420} height={210} /></div><h3>{area.name}</h3><p>{area.description}</p>{area.href&&<Link href={area.href} className={styles.textLink}>Conoce el área de TI <ArrowUpRight size={18} aria-hidden="true" /></Link>}</motion.div>
      </div></div>
    </div>
  </div></section>;
}

const goalGroups = [
  { title:"Personas.", goals:HOME_GOALS.slice(0,5) },
  { title:"Desarrollo.", goals:HOME_GOALS.slice(5,10) },
  { title:"Futuro\ncompartido.", goals:HOME_GOALS.slice(10) },
];

export function HomeGoals() {
  const ref = useRef(null);
  const viewport = useRef(null);
  const track = useRef(null);
  const [distance,setDistance] = useState(0);
  const [slideWidth,setSlideWidth] = useState(0);
  const [selected,setSelected] = useState(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref,offset:["start start","end end"] });
  const x = useTransform(scrollYProgress,[0,.06,.94,1],[0,0,-distance,-distance]);
  useMotionValueEvent(scrollYProgress,"change",value=>{
    if(!window.matchMedia("(max-width:767px)").matches) setSelected(Math.max(0,Math.min(3,Math.round((value-.06)/.88*3))));
  });
  function selectSlide(index) {
    if(window.matchMedia("(max-width:767px)").matches && !reduced) {
      viewport.current.scrollTo({left:index*viewport.current.clientWidth,behavior:"smooth"});
    } else if(reduced) {
      track.current.children[index].scrollIntoView({behavior:"instant",block:"start"});
    } else {
      const bounds=ref.current.getBoundingClientRect();
      window.scrollTo({top:window.scrollY+bounds.top+(.06+index/3*.88)*(bounds.height-window.innerHeight),behavior:"instant"});
    }
    setSelected(index);
  }
  useLayoutEffect(()=>{
    const update=()=>{
      // Native mobile scrolling must not offset the desktop scroll-driven track.
      if(!window.matchMedia("(max-width:767px)").matches) viewport.current.scrollLeft=0;
      setSlideWidth(viewport.current.clientWidth);
      setDistance(Math.max(0,track.current.scrollWidth-viewport.current.clientWidth));
    };
    const observer=new ResizeObserver(update);
    observer.observe(viewport.current); observer.observe(track.current);
    return ()=>observer.disconnect();
  },[]);
  return <section ref={ref} id="ejes" className={styles.goals} aria-labelledby="goals-heading" style={{"--goal-travel":`${distance}px`,"--goal-width":slideWidth ? `${slideWidth}px` : undefined}}>
    <div ref={viewport} className={styles.goalsStage} tabIndex={0} aria-label="Explorar ejes temáticos" onScroll={event=>{if(window.matchMedia("(max-width:767px)").matches) setSelected(Math.round(event.currentTarget.scrollLeft/event.currentTarget.clientWidth));}}>
      <motion.div ref={track} className={styles.goalsTrack} style={reduced ? undefined : {x}}>
        <article className={styles.goalSlide}>
          <div><h2 id="goals-heading" className={styles.display}>Nuestros ejes<br />temáticos.</h2><p>Una mirada al desarrollo sostenible desde la comunidad universitaria.</p><p>Los Objetivos de Desarrollo Sostenible reúnen desafíos para las personas, el planeta y un futuro compartido. Estos son los objetivos presentes en nuestros ejes temáticos.</p><a href="https://www.un.org/sustainabledevelopment/es/sustainable-development-goals/" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Conoce los ODS <ArrowUpRight size={18} aria-hidden="true" /></a></div>
          <Image className={styles.goalOverview} src="/img/institutional/brochure/ejes-ods.webp" alt="Ejes temáticos de SEDIPRO UNT: ODS 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 13, 14, 15, 16 y 17." width={1064} height={627} sizes="(max-width:767px) 90vw, 47vw" />
        </article>
        {goalGroups.map(group=><article key={group.title} className={styles.goalSlide}><h3 className={styles.display}>{group.title.split('\n').map((line,index)=><span key={line}>{index>0&&<br/>}{line}</span>)}</h3><ul className={styles.goalList}>{group.goals.map(goal=><li key={goal.number}><Image src={`/img/institutional/brochure/ods-${goal.number}.webp`} alt="" width={76} height={76}/><span>{goal.name}</span></li>)}</ul></article>)}
      </motion.div>
      <div className={styles.goalProgress}><span>Desliza para explorar <ArrowRight size={18} aria-hidden="true"/></span><div aria-hidden="true"><motion.i style={{scaleX: reduced ? 1 : scrollYProgress}} /></div></div>
      <div className={styles.goalControls} role="group" aria-label="Secciones de ejes temáticos">{["Introducción","Personas","Desarrollo","Futuro compartido"].map((label,index)=><button key={label} type="button" aria-label={`Ver ${label}`} aria-pressed={selected===index} onClick={()=>selectSlide(index)}><span aria-hidden="true"/></button>)}</div>
    </div>
  </section>;
}

export function HomePMI() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({target:ref,offset:["start end","end start"]});
  const y = useTransform(scrollYProgress,[0,1],[35,-35]);
  return <section ref={ref} className={styles.pmi} aria-labelledby="pmi-heading"><div className={styles.colorStage}>
    <SectionLiquid surface="#304d90" />
    <div className={styles.pmiLayout}><div><h2 id="pmi-heading" className={styles.display}>¿Qué es<br />el PMI?</h2><p className={styles.lead}>Project Management Institute.</p><p>Es una organización global sin fines de lucro que promueve las mejores prácticas en gestión de proyectos. Desarrolla estándares internacionales, como la Guía del PMBOK, y certifica profesionales en dirección de proyectos.</p><p>Una de sus certificaciones es CAPM: Certified Associate in Project Management.</p><a href="https://www.pmi.org/" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Explora el PMI <ArrowUpRight size={18} aria-hidden="true" /></a></div>
      <motion.figure style={reduced ? undefined : {y}}><Image src="/img/institutional/brochure/encuentro-pmi-2023.webp" alt="Delegación de SEDIPRO UNT en el Congreso Nacional de Comunidades Estudiantiles del PMI, Lima 2023." width={862} height={588} sizes="(max-width:767px) 90vw, 45vw"/><figcaption>Comunidad, aprendizaje y dirección de proyectos.<br/>SEDIPRO UNT · Lima, 2023.</figcaption></motion.figure>
    </div>
  </div></section>;
}

export function HomeMilestones() {
  return <section className={styles.milestones} aria-labelledby="milestones-heading"><h2 id="milestones-heading" className={styles.display}>Proyectando vidas<br />desde 2013.</h2><ol>{HOME_MILESTONES.map(item=><li key={item.year}><time dateTime={item.year}>{item.year}</time><div><h3>{item.title}</h3><p>{item.detail}</p></div></li>)}</ol><Link href="/nosotros" className={styles.textLink}>Más sobre nuestra historia <ArrowUpRight size={18} aria-hidden="true" /></Link></section>;
}

export function HomeFooterFrame({children}) {
  return <div className={styles.homeFooter}><div className={styles.footerContent}>{children}</div></div>;
}
