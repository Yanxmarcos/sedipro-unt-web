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
const CHARACTER_DELAY_MS = 30;
const MAX_PENDING_CHARACTERS = 160;
const CHARACTERS_PER_KEY = 3;

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
  return <><p>Cada tecla añade tres caracteres al instante. Cuanto más rápido escribes, más rápido avanza el código. Al soltar el teclado, se detiene.</p><p>También puedes deslizar con el scroll o usar <strong>Codificar</strong> para escribir letra por letra a un ritmo pausado. En el celular, desliza sobre la pantalla o toca ese botón.</p><p>Al completar los 16 perfiles, la siguiente acción inicia una nueva ronda. El código continúa avanzando.</p><p><strong>Tab</strong> recorre el menú y los enlaces. <strong>Escape</strong> cierra esta ventana. Los atajos del navegador se mantienen disponibles.</p></>;
}

export function TITerminal() {
  const [state, setState] = useState(initialTerminal);
  const stateRef = useRef(initialTerminal());
  const [panel, setPanel] = useState(null);
  const canvas = useRef(null), code = useRef(null), gallery = useRef(null), dialog = useRef(null), closeButton = useRef(null);
  const queue = useRef(0), frame = useRef(null), touch = useRef(null);
  const enqueue = useCallback(amount => {
    queue.current = Math.min(MAX_PENDING_CHARACTERS, queue.current + amount);
    if (frame.current !== null) return;
    const tick = () => {
      // Consume one character per tick, regardless of input speed or frame rate.
      queue.current -= 1;
      const next = advanceTerminal(stateRef.current, 1, MEMBERS);
      stateRef.current = next;
      setState(next);
      if (next.complete) { queue.current = 0; frame.current = null; return; }
      if (queue.current > 0) frame.current = setTimeout(tick, CHARACTER_DELAY_MS);
      else frame.current = null;
    };
    frame.current = setTimeout(tick, CHARACTER_DELAY_MS);
  }, []);
  const typeKey = useCallback(() => {
    // Keyboard input follows the visitor's rhythm, without a timed backlog.
    if (frame.current !== null) clearTimeout(frame.current);
    frame.current = null;
    queue.current = 0;
    const next = advanceTerminal(stateRef.current, CHARACTERS_PER_KEY, MEMBERS);
    stateRef.current = next;
    setState(next);
  }, []);
  useEffect(() => () => { if (frame.current !== null) clearTimeout(frame.current); }, []);
  useEffect(() => {
    const element = canvas.current;
    const wheel = event => {
      if (panel || event.ctrlKey || Math.abs(event.deltaY) < 1) return;
      event.preventDefault();
      enqueue(Math.min(90, Math.max(12, Math.round(Math.abs(event.deltaY) * .2))));
    };
    const key = event => {
      if (panel || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      if (event.target instanceof Element && event.target.closest("input,textarea,select,[contenteditable],dialog")) return;
      if (event.target instanceof Element && event.target.closest("a,button") && ["Enter", " "].includes(event.key)) return;
      if (event.key === "F1") { event.preventDefault(); setPanel("help"); return; }
      if (["Tab", "Escape", "Shift", "Control", "Alt", "Meta", "CapsLock", "NumLock", "ScrollLock", "PrintScreen"].includes(event.key) || /^F\d{1,2}$/.test(event.key)) return;
      event.preventDefault(); typeKey();
    };
    element.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => { element.removeEventListener("wheel", wheel); window.removeEventListener("keydown", key); };
  }, [enqueue, panel, typeKey]);
  useEffect(() => {
    code.current.scrollTop = code.current.scrollHeight;
    if (gallery.current) gallery.current.scrollTop = gallery.current.scrollHeight;
  }, [state.total]);
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      code.current.scrollTop = code.current.scrollHeight;
      if (gallery.current) gallery.current.scrollTop = gallery.current.scrollHeight;
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
    <div ref={canvas} className={styles.canvas} data-has-profiles={frames.length > 0 || undefined} tabIndex={-1}
      onPointerDown={event => { if (event.pointerType === "touch" && !event.target.closest("a,button")) touch.current = event.clientY; }}
      onPointerMove={event => {
        if (event.pointerType !== "touch" || touch.current === null || panel) return;
        const distance = Math.abs(event.clientY - touch.current);
        if (distance > 3) { enqueue(Math.min(60, Math.round(distance * .5))); touch.current = event.clientY; }
      }} onPointerUp={() => { touch.current = null; }} onPointerCancel={() => { touch.current = null; }}>
      <div ref={code} className={styles.codeViewport} aria-hidden="true"><pre>{state.text}<span className={styles.caret}>▋</span></pre></div>
      {frames.length > 0 && <section ref={gallery} className={styles.gallery} aria-label="Perfiles del equipo construidos con código"><div className={styles.profileGrid}>{frames.map(({ member, index, progress }) => <MemberFrame key={`${state.cycle}-${member.name}`} member={member} index={index} progress={progress} />)}</div></section>}
      <span className={styles.srOnly} role="status">{state.total > 0 ? `Ronda ${state.cycle + 1}. ${frames.filter(item => item.progress >= 1).length} de 16 perfiles construidos.` : "Desliza o pulsa una tecla para comenzar. El menú permite consultar toda la información."}</span>
    </div>
    <footer className={styles.dock}><nav aria-label="Menú del área de TI"><Link href="/" className={styles.home}><ArrowLeft size={15} aria-hidden="true" />Inicio</Link><button type="button" onClick={() => setPanel("about")}>Área TI</button><button type="button" onClick={() => setPanel("work")}>Funciones</button><button type="button" onClick={() => setPanel("divisions")}>Subáreas</button><button type="button" onClick={() => setPanel("team")}>Equipo<span className={styles.count}>16</span></button><button type="button" onClick={() => setPanel("help")}>Ayuda</button><button type="button" className={styles.encode} onClick={() => { enqueue(120); canvas.current.focus({ preventScroll: true }); }}><Code2 size={15} aria-hidden="true" />Codificar</button></nav><span className={styles.hint}>{state.total > 0 ? "TI / SEDIPRO UNT" : "SCROLL OR PRESS ANY KEY"}</span></footer>
    <dialog ref={dialog} aria-labelledby="ti-dialog-title" className={`${styles.dialog} ${panel === "team" ? styles.teamDialog : ""}`} onCancel={event => { event.preventDefault(); setPanel(null); }} onClick={event => { if (event.target === dialog.current) setPanel(null); }}>
      <div className={styles.dialogHeading}><h2 id="ti-dialog-title">{PANELS[panel]}</h2><button ref={closeButton} type="button" onClick={() => setPanel(null)} aria-label="Cerrar ventana"><X size={20} aria-hidden="true" /></button></div>
      <div className={styles.dialogContent}><PanelContent panel={panel} /></div>
      <button type="button" className={styles.closeText} onClick={() => setPanel(null)}>Cerrar [ESC]</button>
    </dialog>
  </main>;
}
