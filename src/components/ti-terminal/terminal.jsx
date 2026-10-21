"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Code2, X } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { MEMBERS } from "./members";
import { advanceTerminal, initialTerminal, profileProgress } from "./code-stream.mjs";
import styles from "./terminal.module.css";

const NETWORKS = { github: { Icon: FaGithub, label: "GitHub" }, linkedin: { Icon: FaLinkedinIn, label: "LinkedIn" } };
const PANELS = { about: "Área de Tecnologías de la Información", work: "Qué hacemos", divisions: "Nuestras subáreas", team: "Equipo TI · 2026", help: "Cómo explorar esta terminal" };
const CHARACTERS_PER_KEY = 3;
const AUTO_CHARACTERS_PER_TICK = 24;
const AUTO_DELAY_MS = 18;

function MemberFrame({ member, index, progress = 1, directory = false }) {
  const scan = Math.min(1, Math.max(0, progress));
  const ready = progress >= 1;
  return <article className={styles.member} data-ready={ready || undefined} data-directory={directory || undefined} style={{ "--scan": scan }} aria-label={member.name}>
    <div className={styles.frameHeader}><span>PROFILE_{String(index + 1).padStart(2, "0")}</span><span>{ready ? "READY" : "BUILDING"}</span></div>
    <div className={styles.portrait}><Image src={member.image} alt={member.name} fill sizes="(max-width: 600px) 45vw, (max-width: 1000px) 25vw, 180px" draggable={false} /><span className={styles.scanLine} aria-hidden="true" /></div>
    <div className={styles.memberInfo} style={{ visibility: ready ? "visible" : "hidden" }}>
      <h3>{member.name}</h3><p>{member.career}{member.role ? ` · ${member.role}` : ""}</p>
      {member.socials && <nav className={styles.socials} aria-label={`Redes de ${member.name}`}>{Object.entries(member.socials).filter(([network]) => Object.hasOwn(NETWORKS, network)).map(([network, href]) => {
        const { Icon, label } = NETWORKS[network];
        return <Link key={network} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} de ${member.name}`} tabIndex={ready ? 0 : -1}><Icon size={14} aria-hidden="true" /><ArrowUpRight size={10} aria-hidden="true" /></Link>;
      })}</nav>}
    </div>
  </article>;
}

function PanelContent({ panel }) {
  if (panel === "about") return <><p>El área de Tecnologías de la Información en SEDIPRO UNT se encarga de la gestión de sistemas, control interno, reportes, proyectos, asesoría y capacitación en TI para garantizar el uso eficiente de la tecnología.</p><p>El equipo diseña, desarrolla y mantiene las soluciones digitales que impulsan los proyectos de SEDIPRO UNT.</p></>;
  if (panel === "work") return <dl className={styles.definitionList}><div><dt>Gestión de sistemas</dt><dd>Desarrollo y mantenimiento de las soluciones digitales de SEDIPRO UNT.</dd></div><div><dt>Control interno y reportes</dt><dd>Herramientas para organizar información y apoyar el seguimiento de las actividades.</dd></div><div><dt>Proyectos tecnológicos</dt><dd>Soluciones que acompañan las necesidades de los equipos y sus proyectos.</dd></div><div><dt>Asesoría y capacitación</dt><dd>Acompañamiento para aprovechar la tecnología de forma eficiente.</dd></div></dl>;
  if (panel === "divisions") return <><p>Tres subáreas conectadas por el mismo propósito.</p><ol className={styles.divisions}><li><strong>Interfaces</strong><p>La experiencia que las personas ven y utilizan: diseño e interfaces digitales.</p></li><li><strong>Sistemas y backend</strong><p>La lógica y los servicios que permiten que los sistemas funcionen.</p></li><li><strong>Datos</strong><p>Información organizada, análisis y reportes para apoyar las decisiones.</p></li></ol></>;
  if (panel === "team") return <><p>16 integrantes · Periodo 2026</p><div className={styles.directory}>{MEMBERS.map((member, index) => <MemberFrame key={member.name} member={member} index={index} directory />)}</div></>;
  return <><p>Cada tecla añade tres caracteres al instante. Cuanto más rápido escribes, más rápido avanza el código. Al soltar el teclado, se detiene.</p><p><strong>Codificar</strong> activa la escritura automática rápida. Mientras está activa, el botón cambia a <strong>Codificar manual</strong>; pulsa cualquier tecla para pausarla y continuar a tu propio ritmo.</p><p>La rueda, el trackpad y el gesto vertical sirven para recorrer el código y los perfiles sin generar caracteres.</p><p>Al completar los 16 perfiles, la escritura automática se detiene. La siguiente acción inicia una nueva ronda y el código continúa avanzando.</p><p><strong>Tab</strong> recorre el menú y los enlaces. <strong>Escape</strong> cierra esta ventana. Los atajos del navegador se mantienen disponibles.</p></>;
}

export function TITerminal() {
  const [state, setState] = useState(initialTerminal);
  const stateRef = useRef(initialTerminal());
  const [automatic, setAutomatic] = useState(false);
  const [panel, setPanel] = useState(null);
  const canvas = useRef(null), code = useRef(null), gallery = useRef(null), dialog = useRef(null), closeButton = useRef(null);
  const automaticTimer = useRef(null), followCode = useRef(true), followGallery = useRef(true);
  const write = useCallback(amount => {
    const next = advanceTerminal(stateRef.current, amount, MEMBERS);
    stateRef.current = next;
    setState(next);
    return next;
  }, []);
  const typeKey = useCallback(() => {
    setAutomatic(false);
    write(CHARACTERS_PER_KEY);
  }, [write]);
  useEffect(() => {
    if (!automatic || panel) return;
    const tick = () => {
      const next = write(AUTO_CHARACTERS_PER_TICK);
      if (next.complete) { setAutomatic(false); return; }
      automaticTimer.current = window.setTimeout(tick, AUTO_DELAY_MS);
    };
    automaticTimer.current = window.setTimeout(tick, AUTO_DELAY_MS);
    return () => window.clearTimeout(automaticTimer.current);
  }, [automatic, panel, write]);
  useEffect(() => {
    const key = event => {
      if (panel || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      if (event.target instanceof Element && event.target.closest("input,textarea,select,[contenteditable],dialog")) return;
      if (event.target instanceof Element && event.target.closest("a,button") && ["Enter", " "].includes(event.key)) return;
      if (event.key === "F1") { event.preventDefault(); setPanel("help"); return; }
      if (["Tab", "Escape", "Shift", "Control", "Alt", "Meta", "CapsLock", "NumLock", "ScrollLock", "PrintScreen"].includes(event.key) || /^F\d{1,2}$/.test(event.key)) return;
      event.preventDefault(); typeKey();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [panel, typeKey]);
  useEffect(() => {
    if (followCode.current) code.current.scrollTop = code.current.scrollHeight;
    if (gallery.current && followGallery.current) gallery.current.scrollTop = gallery.current.scrollHeight;
  }, [state.total]);
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (followCode.current) code.current.scrollTop = code.current.scrollHeight;
      if (gallery.current && followGallery.current) gallery.current.scrollTop = gallery.current.scrollHeight;
    });
    observer.observe(code.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (panel) { dialog.current.showModal(); closeButton.current.focus(); }
    else if (dialog.current.open) dialog.current.close();
  }, [panel]);
  const frames = MEMBERS.map((member, index) => ({ member, index, progress: profileProgress(state, index, MEMBERS) })).filter(item => item.progress > 0);
  return <main className={styles.terminal} data-ti-terminal data-cycle={state.cycle + 1} data-profile-count={frames.filter(item => item.progress >= 1).length}>
    <h1 className={styles.srOnly}>Área de Tecnologías de la Información · SEDIPRO UNT</h1>
    <div ref={canvas} className={styles.canvas} data-has-profiles={frames.length > 0 || undefined} tabIndex={-1}>
      <div ref={code} className={styles.codeViewport} aria-hidden="true" onScroll={event => { const element = event.currentTarget; followCode.current = element.scrollHeight - element.scrollTop - element.clientHeight < 40; }}><pre>{state.text}<span className={styles.caret}>▋</span></pre></div>
      {frames.length > 0 && <section ref={gallery} className={styles.gallery} aria-label="Perfiles del equipo construidos con código" onScroll={event => { const element = event.currentTarget; followGallery.current = element.scrollHeight - element.scrollTop - element.clientHeight < 40; }}><div className={styles.profileGrid}>{frames.map(({ member, index, progress }) => <MemberFrame key={`${state.cycle}-${member.name}`} member={member} index={index} progress={progress} />)}</div></section>}
      <span className={styles.srOnly} role="status">{state.total > 0 ? `Ronda ${state.cycle + 1}. ${frames.filter(item => item.progress >= 1).length} de 16 perfiles construidos.${automatic ? " Codificación automática activa." : " Codificación manual activa."}` : "Pulsa una tecla o activa Codificar para comenzar. El menú permite consultar toda la información."}</span>
    </div>
    <footer className={styles.dock}><nav aria-label="Menú del área de TI"><Link href="/" className={styles.home}><ArrowLeft size={15} aria-hidden="true" />Inicio</Link><button type="button" onClick={() => setPanel("about")}>Área TI</button><button type="button" onClick={() => setPanel("work")}>Funciones</button><button type="button" onClick={() => setPanel("divisions")}>Subáreas</button><button type="button" onClick={() => setPanel("team")}>Equipo<span className={styles.count}>16</span></button><button type="button" onClick={() => setPanel("help")}>Ayuda</button><button type="button" className={styles.encode} aria-pressed={automatic} onClick={() => { setAutomatic(active => !active); canvas.current.focus({ preventScroll: true }); }}><Code2 size={15} aria-hidden="true" />{automatic ? "Codificar manual" : "Codificar"}</button></nav><span className={styles.hint}>{automatic ? "AUTO / PRESS ANY KEY TO PAUSE" : state.total > 0 ? "MANUAL / PRESS ANY KEY" : "PRESS ANY KEY"}</span></footer>
    <dialog ref={dialog} aria-labelledby="ti-dialog-title" className={`${styles.dialog} ${panel === "team" ? styles.teamDialog : ""}`} onCancel={event => { event.preventDefault(); setPanel(null); }} onClick={event => { if (event.target === dialog.current) setPanel(null); }}>
      <div className={styles.dialogHeading}><h2 id="ti-dialog-title">{PANELS[panel]}</h2><button ref={closeButton} type="button" onClick={() => setPanel(null)} aria-label="Cerrar ventana"><X size={20} aria-hidden="true" /></button></div>
      <div className={styles.dialogContent}><PanelContent panel={panel} /></div>
      <button type="button" className={styles.closeText} onClick={() => setPanel(null)}>Cerrar [ESC]</button>
    </dialog>
  </main>;
}
