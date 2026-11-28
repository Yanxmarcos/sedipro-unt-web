"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import styles from "./navisedipro-announcement.module.css";

const message = "Esta Navidad, podemos hacer que más de 150 niños vivan un momento especial.";

function CampaignPrint({ close }) {
  const stage = useRef(null), canvas = useRef(null), image = useRef(null);
  const engine = useRef(null), pointer = useRef(null), pinned = useRef(false);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [peeled, setPeeled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let disposed = false;
    let revealTimer;
    const poster = image.current;
    Promise.all([import("./poster-peel"), poster.decode()]).then(([{ createPosterPeel }]) => {
      if (disposed) return;
      engine.current = createPosterPeel(canvas.current, stage.current, poster, message);
      setReady(true);
      revealTimer = setTimeout(() => {
        pinned.current = true;
        engine.current.peel(true);
        setPeeled(true);
      }, 750);
    }).catch(() => {});
    return () => {
      disposed = true;
      clearTimeout(revealTimer);
      engine.current?.dispose();
      engine.current = null;
    };
  }, [reduced]);

  const interactive = ready && !reduced;
  function peel(value) {
    engine.current?.peel(value);
    setPeeled(value);
  }

  return (
    <>
      <div className={styles.stage} ref={stage} data-rendered={interactive || undefined}>
        {/* The same poster is the fallback and the source of the WebGL texture. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={image} src="/proyectos/navisedipro.webp" alt="Afiche de NAVISEDIPRO de SEDIPRO UNT" width={1080} height={1350} />
        <canvas ref={canvas} aria-hidden="true" />
        <button type="button" className={styles.close} autoFocus aria-label="Cerrar anuncio"
          onClick={close}><X size={22} /></button>
        {interactive && <button type="button" className={styles.printButton}
          aria-label="Levantar o aplanar la esquina del afiche" aria-pressed={peeled}
          onPointerDown={event => { pointer.current = event.pointerType; }}
          onPointerEnter={event => { if (event.pointerType === "mouse") peel(true); }}
          onPointerLeave={event => { if (event.pointerType === "mouse" && !pinned.current) peel(false); }}
          onFocus={event => { if (event.currentTarget.matches(":focus-visible")) peel(true); }}
          onBlur={() => { if (!pinned.current) peel(false); }}
          onClick={event => {
            const toggle = event.detail === 0 || pointer.current === "touch" || pointer.current === "pen";
            pinned.current = toggle ? !peeled : !pinned.current;
            peel(pinned.current);
            pointer.current = null;
          }}
          onKeyDown={event => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              peel(event.key === "ArrowRight");
            }
          }} />}
      </div>
    </>
  );
}

export function NavisediproAnnouncement() {
  const dialog = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    let timeout;
    const blocked = () => document.hidden ||
      document.querySelector('[data-public-loader]:not([data-phase="idle"]), dialog[open]');
    const observer = new MutationObserver(schedule);
    function schedule() {
      if (blocked()) {
        clearTimeout(timeout);
        timeout = undefined;
        return;
      }
      if (timeout !== undefined) return;
      timeout = setTimeout(() => {
        timeout = undefined;
        if (blocked() || !element.isConnected) return;
        observer.disconnect();
        document.removeEventListener("visibilitychange", schedule);
        element.showModal();
        setShown(true);
      }, 1700);
    }
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-phase", "open"] });
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);

  return (
    <dialog ref={dialog} className={styles.dialog} aria-label="Campaña solidaria NAVISEDIPRO"
      onClose={() => setShown(false)}
      onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      {shown && <div className={styles.notice}>
        <CampaignPrint close={() => dialog.current.close()} />
        <div className={styles.caption}>
          <p>{message}</p>
          <Link href="/navisedipro" className={styles.cta} onClick={() => dialog.current.close()}>
            Conoce más sobre el proyecto <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>}
    </dialog>
  );
}
