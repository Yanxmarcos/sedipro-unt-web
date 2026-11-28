"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef } from "react";
import { donationForm } from "./links";
import styles from "./donor.module.css";

export default function DonationButton({ children, className }) {
  const dialog = useRef(null);
  const title = useId();

  return <>
    <button className={className} type="button" aria-haspopup="dialog"
      onClick={() => dialog.current.showModal()}>{children}</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={title}>
      <form method="dialog">
        <button className={styles.close} aria-label="Cerrar">×</button>
      </form>
      <Image className={styles.mascot} src="/navisedipro/hito-donacion.webp" alt="" width={259} height={320} unoptimized />
      <h2 id={title}>Dona a NAVISEDIPRO</h2>
      <div className={styles.actions}>
        <a href={donationForm} target="_blank" rel="noopener noreferrer"
          onClick={() => dialog.current.close()}>Quiero hacer una donación</a>
        <Link href="/navisedipro/donadores" onClick={() => dialog.current.close()}>Ya soy donador</Link>
      </div>
    </dialog>
  </>;
}
