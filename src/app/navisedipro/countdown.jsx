"use client";

import { useEffect, useState } from "react";
import { eventDate } from "./links";
import styles from "./campaign.module.css";

export function Countdown({ deadline = eventDate, label = "Tiempo para el inicio de NAVISEDIPRO", className = styles.countdown }) {
  const endTime = Date.parse(deadline);
  const [seconds, setSeconds] = useState(null);
  useEffect(() => {
    const update = () => setSeconds(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [endTime]);
  const values = seconds === null ? ["—", "—", "—", "—"] :
    [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];

  return <dl className={className} aria-label={label}>
    {["Días", "Horas", "Minutos", "Segundos"].map((label, index) => (
      <div key={label}><dt>{label}</dt><dd>{String(values[index]).padStart(values[index] === "—" ? 1 : 2, "0")}</dd></div>
    ))}
  </dl>;
}
