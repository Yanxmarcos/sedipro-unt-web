"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { LoginHito } from "./login-hito";
import styles from "./login-access.module.css";

export function LoginAccess({ username, setUsername, password, setPassword, showPassword, setShowPassword, error, loading, onSubmit }) {
  const [coverEyes, setCoverEyes] = useState(false);
  const gripId = `login-grip-${useId().replace(/:/g, "")}`;
  const scene = useRef(null);
  const stage = useRef(null);
  const group = useRef(null);
  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;
  useLayoutEffect(() => {
    const fit = () => {
      if (!stage.current || !group.current) return;
      const scale = Math.min(1, stage.current.clientWidth / (group.current.offsetWidth + 14), stage.current.clientHeight / (group.current.offsetHeight + 16));
      group.current.style.setProperty("--login-scale", String(Math.max(.1, scale)));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(stage.current); observer.observe(group.current); fit();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const visibility = () => { if (scene.current) scene.current.dataset.motionPaused = String(document.hidden); };
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return <div ref={scene} className={styles.scene}>
    <div className={styles.planes} aria-hidden="true">
      {[styles.planeLeft, styles.planeRight].map(className => <div className={className} key={className}><span><Image src="/img/institutional/collage/paper-plane.svg?v=gold" width={300} height={180} alt="" unoptimized /></span></div>)}
    </div>
    <div ref={stage} className={styles.stage}>
    <div ref={group} className={styles.group}>
      <LoginHito covered={coverEyes} />
      <section className={styles.card} aria-labelledby="login-title">
        <h1 id="login-title" className="sr-only">Acceso sediprano</h1>
        {[styles.handLeft, styles.handRight].map((className, index) => <svg key={className} className={className} viewBox="720 450 250 240" aria-hidden="true" focusable="false">
          <defs><clipPath id={`${gripId}-${index}`}><path d="M755 690C755 625 770 570 794 536C804 523 816 516 830 516C890 516 944 546 970 580L970 690Z" /></clipPath></defs>
          <image href="/img/institutional/login/hito-rig.png" width="2172" height="724" clipPath={`url(#${gripId}-${index})`} />
        </svg>)}
        <form className={styles.form} onSubmit={event => { if (!canSubmit) { event.preventDefault(); return; } onSubmit(event); }}>
          <div className={styles.field}>
            <label htmlFor="username">Usuario</label>
            <input id="username" name="username" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" placeholder="Ingresa tu usuario" disabled={loading} required />
          </div>
          <div className={styles.field} onFocusCapture={() => setCoverEyes(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setCoverEyes(false); }}>
            <label htmlFor="password">Contraseña</label>
            <div className={styles.password}>
              <input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" placeholder="Ingresa tu contraseña" disabled={loading} required />
              <button type="button" className={styles.reveal} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword(value => !value)} disabled={loading}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
            </div>
          </div>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <button className={styles.submit} type="submit" disabled={!canSubmit} aria-busy={loading}>{loading ? <><LoaderCircle className={styles.spinner} size={20} aria-hidden="true" />Ingresando…</> : <>Ingresar <ArrowRight size={20} aria-hidden="true" /></>}</button>
        </form>
      </section>
      <svg className={styles.feet} viewBox="300 910 480 170" aria-hidden="true" focusable="false"><image href="/img/hito3.webp" width="1080" height="1080" /></svg>
    </div>
    </div>
  </div>;
}
