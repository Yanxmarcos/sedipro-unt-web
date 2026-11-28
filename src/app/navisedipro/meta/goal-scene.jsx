"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import DonationButton from "../donation-button";
import { Countdown } from "../countdown";
import { donationDeadline } from "../links";
import campaignStyles from "../campaign.module.css";
import styles from "./meta.module.css";

const goal = 150;
const initialFraction = .19;
const caravan = [["rojo", 285], ["verde", 290], ["morado", 268]];
const stars = [
  [6, 9, 0], [13, 24, 1.4], [19, 6, 2.1], [27, 17, .7],
  [34, 5, 1.9], [41, 27, .3], [52, 8, 2.6], [58, 21, 1.1],
  [66, 4, .5], [72, 29, 2.3], [88, 7, 1.7], [95, 22, .9],
  [9, 38, 2.8], [47, 15, 3.1], [79, 13, .2], [91, 36, 2],
];

export default function GoalScene() {
  const [validatedDonations, setValidatedDonations] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let refreshing = false;
    async function refresh() {
      if (refreshing || document.hidden) return;
      refreshing = true;
      try {
        const response = await fetch("/api/navisedipro/public/meta", {
          cache: "no-store", signal: controller.signal,
        });
        if (response.ok) {
          const { validated } = await response.json();
          if (!controller.signal.aborted && Number.isSafeInteger(validated) && validated >= 0)
            setValidatedDonations(validated);
        }
      } catch {
        // Keep the last confirmed total until the next refresh.
      } finally {
        refreshing = false;
      }
    }
    refresh();
    const interval = window.setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const progress = Math.min(goal, validatedDonations ?? 0);
  const fraction = initialFraction + (1 - initialFraction) * (progress / goal);
  const percentage = Math.round(fraction * 100);

  return (
    <main id="main-content" className={styles.scene} data-goal-scene data-advanced={(fraction > 0 && fraction < 1) || undefined} style={{ "--progress": fraction }}>
      <Image className={styles.background} src="/navisedipro/fondo-belen.webp" alt="" fill sizes="100vw" preload />
      <div className={styles.stars} aria-hidden="true">
        {stars.map(([x, y, delay]) => (
          <span key={x} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }} />
        ))}
      </div>
      <h1 className={styles.title}>Meta</h1>
      <p className={styles.intro}>Esta Navidad, podemos hacer que más de 150 niños vivan un momento especial.</p>
      <p className={styles.deadline}>Puedes donar hasta la medianoche del 15 de diciembre (hora de Perú).</p>
      <Countdown deadline={donationDeadline} label="Tiempo restante para donar" className={`${campaignStyles.countdown} ${styles.deadlineCountdown}`} />
      <DonationButton className={`${campaignStyles.button} ${styles.donate}`}>Quiero donar</DonationButton>
      <div className={styles.shepherd}>
        <Image src="/navisedipro/buho-pastor.webp" alt="" width={1221} height={1292} sizes="(max-width: 700px) 36vw, 26vw" />
      </div>
      <div className={styles.stable}>
        <Image src="/navisedipro/establo-nacimiento.webp" alt="" width={1616} height={1090} sizes="(max-width: 700px) 49vw, 39vw" />
      </div>
      {progress === goal && <p className={styles.goalStatus} role="status">Meta completada</p>}
      <div className={styles.road} role="progressbar" aria-label="Avance de la campaña NAVISEDIPRO"
        aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={`${percentage}% en la barra de campaña, con un punto de partida del 19%`}>
        <div className={styles.track}>
          <div className={styles.fill} />
          <div className={styles.caravan} aria-hidden="true">
            {caravan.map(([color, width], index) => (
              <span key={color} className={styles.king} style={{
                "--sprite": `url("/navisedipro/rey-${color}.webp")`,
                aspectRatio: `${width} / 300`,
                animationDelay: `${index * -.3}s`,
              }} />
            ))}
          </div>
        </div>
        <span className={styles.roadValue} aria-hidden="true">{percentage}%</span>
      </div>
    </main>
  );
}


