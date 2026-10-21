"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { ArrowDown, LoaderCircle, Play, RotateCcw, Volume2 } from "lucide-react";
import styles from "./home-approach.module.css";

const VIDEO = "/img/institutional/video-sedipro.mp4";

export function InstitutionalFilm({ revealed, prepared }) {
  const panel = useRef(null);
  const video = useRef(null);
  const manualPause = useRef(false);
  const automaticPause = useRef(false);
  const activeRef = useRef(false);
  const visible = useInView(panel, { amount: .6 });
  const active = revealed && visible;
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const player = video.current;
    let cancelled = false;
    activeRef.current = active;
    const pause = () => {
      automaticPause.current = true;
      player.pause();
    };
    const synchronize = async () => {
      if (!active || document.hidden) { pause(); return; }
      if (manualPause.current || player.ended) return;
      try {
        await player.play();
      } catch (failure) {
        if (cancelled || document.hidden || failure.name === "AbortError") return;
        // Audible autoplay is a browser permission, not something scroll can
        // grant. Fall back to silent playback with an explicit sound control.
        if (failure.name === "NotAllowedError") {
          player.muted = true;
          try { await player.play(); } catch { /* Native and central play controls remain available. */ }
        }
      }
      if (cancelled || !activeRef.current || document.hidden) pause();
    };
    synchronize();
    document.addEventListener("visibilitychange", synchronize);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", synchronize);
      pause();
    };
  }, [active]);

  const play = async () => {
    const player = video.current;
    manualPause.current = false;
    if (player.ended) player.currentTime = 0;
    if (player.error) { setError(false); player.load(); }
    try { await player.play(); } catch { setPlaying(false); }
  };

  return <div ref={panel} className={styles.film} id="video-institucional" inert={!revealed} aria-hidden={!revealed} data-nav-surface="ink">
    <video ref={video} controls playsInline preload={prepared ? "metadata" : "none"}
      aria-label="Video institucional de SEDIPRO UNT" src={VIDEO}
      onPlay={() => { automaticPause.current = false; manualPause.current = false; setPlaying(true); setEnded(false); }}
      onPause={() => {
        if (!automaticPause.current && activeRef.current && !document.hidden && !video.current.ended) manualPause.current = true;
        setPlaying(false);
      }}
      onEnded={() => { setPlaying(false); setEnded(true); }}
      onWaiting={() => setBuffering(true)} onPlaying={() => setBuffering(false)} onCanPlay={() => setBuffering(false)}
      onVolumeChange={() => setMuted(video.current.muted)} onError={() => { setError(true); setBuffering(false); }}
    >Tu navegador no puede reproducir este video. <a href={VIDEO}>Abrir video institucional</a>.</video>
    <div className={styles.filmCaption}>SEDIPRO UNT <span>Video institucional</span></div>
    {buffering && revealed && !error && <div className={styles.filmLoading} role="status"><LoaderCircle aria-hidden="true" /><span>Cargando video</span></div>}
    {!playing && !buffering && !error && <button className={styles.filmPlay} onClick={play} aria-label={ended ? "Volver a ver el video institucional" : "Reproducir video institucional"}>
      {ended ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" />}<span>{ended ? "Volver a ver" : "Reproducir video"}</span>
    </button>}
    {muted && playing && <button className={styles.soundButton} onClick={() => { video.current.muted = false; play(); }}><Volume2 size={18} aria-hidden="true" />Activar sonido</button>}
    {error && <div className={styles.filmError} role="alert"><p>No pudimos cargar el video.</p><button onClick={play}>Volver a intentar</button><a href={VIDEO}>Abrir video</a></div>}
    <a href="#ejes" className={styles.filmContinue}>Continúa hacia nuestros ejes <ArrowDown size={18} aria-hidden="true" /></a>
  </div>;
}
