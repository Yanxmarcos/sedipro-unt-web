"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { EMAIL } from "./content";
import styles from "./hero-connections.module.css";

export function CopyEmail() {
  const [status, setStatus] = useState("idle");
  const timer = useRef(null);
  const tooltipId = useId();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(EMAIL);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    timer.current = window.setTimeout(() => setStatus("idle"), 2200);
  }

  const message = status === "copied" ? "Copiado" : status === "error" ? "No se pudo copiar. Intenta otra vez" : "Presiona para copiar";
  const Icon = status === "copied" ? Check : Copy;

  return (
    <span className={styles.copyWrap} data-feedback={status !== "idle"}>
      <button type="button" onClick={copy} className={styles.copyButton} aria-label={`Copiar ${EMAIL}`} aria-describedby={tooltipId}>
        <Icon size={17} aria-hidden="true" />
      </button>
      <span id={tooltipId} role="tooltip" className={styles.tooltip}>{message}</span>
      <span className="sr-only" role="status">{status === "idle" ? "" : message}</span>
    </span>
  );
}
