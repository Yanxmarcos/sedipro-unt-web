"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import styles from "./campaign.module.css";

const platforms = {
  Instagram: { href: "https://www.instagram.com/", instruction: "Pega el enlace en un mensaje o en el sticker de enlace de una historia." },
  TikTok: { href: "https://www.tiktok.com/", instruction: "Pega el enlace en un mensaje a la persona con quien quieras compartir la campaña." },
};
const appButtons = [
  ["Instagram", FaInstagram, styles.shareInstagram],
  ["TikTok", FaTiktok, styles.shareTikTok],
];

function ShareOptions({ url }) {
  const dialog = useRef(null);
  const [platform, setPlatform] = useState("Instagram");
  const [status, setStatus] = useState("");
  const [canShare, setCanShare] = useState(false);
  const text = "Conoce NAVISEDIPRO, la campaña solidaria de SEDIPRO UNT.";
  const encodedUrl = encodeURIComponent(url);

  function openShare(name) {
    setPlatform(name);
    setStatus("");
    setCanShare(typeof navigator.share === "function");
    dialog.current.showModal();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Enlace copiado.");
    } catch {
      setStatus("Selecciona y copia el enlace del campo de arriba.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: "NAVISEDIPRO", text, url });
    } catch (error) {
      if (error.name !== "AbortError") await copyLink();
    }
  }

  return (
    <>
      <div className={styles.shareLinks}>
        <a className={styles.shareWhatsApp} href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp aria-hidden="true" /> WhatsApp</a>
        <a className={styles.shareFacebook} href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer"><FaFacebookF aria-hidden="true" /> Facebook</a>
        {appButtons.map(([name, Icon, className]) => (
          <button key={name} className={className} type="button" onClick={() => openShare(name)}><Icon aria-hidden="true" /> {name}</button>
        ))}
      </div>
      <dialog ref={dialog} className={styles.shareDialog} aria-labelledby="navi-share-title">
        <h4 id="navi-share-title">Compartir en {platform}</h4>
        <p>{platforms[platform].instruction}</p>
        <input aria-label="Enlace de NAVISEDIPRO" value={url} readOnly onFocus={(event) => event.currentTarget.select()} />
        <div className={styles.shareLinks}>
          <button type="button" onClick={copyLink}>Copiar enlace</button>
          {canShare && <button type="button" onClick={share}>Menú de compartir</button>}
          <a href={platforms[platform].href} target="_blank" rel="noopener noreferrer">Abrir {platform}</a>
        </div>
        <p role="status">{status}</p>
        <form method="dialog"><button className={styles.button}>Cerrar</button></form>
      </dialog>
    </>
  );
}

export function DonationSteps({ options, actions, campaignUrl }) {
  return (
    <ul className={styles.donationCards}>
      {options.map(([title, description, instructions], index) => (
        <li key={title} className={styles.donationCard}>
          <div className={styles.cardArt}>
            {index === 0 ? <>
              <Image className={styles.yapeLogo} src="/navisedipro/yape-transparente.webp" alt="Yape" width={215} height={256} unoptimized />
              <Image src="/navisedipro/bcp.svg" alt="BCP" width={110} height={45} unoptimized />
            </> : <Image src={index === 1 ? "/navisedipro/ayuda-regalos.webp" : "/navisedipro/ayuda-megafono.webp"} alt="" width={512} height={512} sizes="180px" />}
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
          {instructions && <details className={styles.cardInstructions}>
            <summary>Ver pasos</summary>
            <ol>{instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol>
          </details>}
          <div className={styles.cardActions}>{index === 2 ? <ShareOptions url={campaignUrl} /> : actions[index]}</div>
        </li>
      ))}
    </ul>
  );
}
