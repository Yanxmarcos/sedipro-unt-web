import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa6";
import { Reveal } from "./motion";
import { CoverArtwork } from "./cover-artwork";
import { EMAIL, SOCIALS } from "./content";
import styles from "./public-site.module.css";
import connectionStyles from "./hero-connections.module.css";
import { CopyEmail } from "./copy-email";

const SOCIAL_ICONS = {
  Instagram: { Icon: FaInstagram, color: "#e4405f" },
  LinkedIn: { Icon: FaLinkedin, color: "#0a66c2" },
  Facebook: { Icon: FaFacebook, color: "#0866ff" },
  YouTube: { Icon: FaYoutube, color: "#ff0033" },
  TikTok: { Icon: FaTiktok, color: "#25f4ee" },
};

export function PublicHero() {
  return (
    <section className={styles.coverHero} aria-labelledby="cover-heading">
      <h1 id="cover-heading" className="sr-only">SEDIPRO UNT — Proyectando vidas</h1>
      <CoverArtwork />
      <div className={styles.coverContact}>
        <p>Somos la Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo.</p>
        <div className={styles.coverConnections}>
          <nav aria-label="Redes sociales de SEDIPRO UNT">{SOCIALS.map(social => {
            const { Icon, color } = SOCIAL_ICONS[social.label];
            return <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"><Icon className={`${connectionStyles.brandIcon} ${social.label === "TikTok" ? connectionStyles.tiktok : ""}`} style={{ color }} aria-hidden="true" />{social.label}<ArrowUpRight size={14} aria-hidden="true" /></a>;
          })}</nav>
          <div className={connectionStyles.emailGroup}><CopyEmail /><a className={styles.coverEmail} href={`mailto:${EMAIL}`}>{EMAIL}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
        </div>
      </div>
      <a href="#historia" className={styles.coverScroll}>Explorar <ArrowDown size={16} aria-hidden="true" /></a>
    </section>
  );
}

export function PageHero({ title, line, description, photo }) {
  return (
    <section className={styles.pageHero}>
      <div className={styles.pageHeroGrid}>
        <div>
          <Reveal><h1>{title}<br />{line}</h1></Reveal>
          <p>{description}</p>
          <a href="#contenido" className={styles.action}>Explorar <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
        {photo && <Reveal className={styles.pageHeroPhoto}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 90vw, 40vw" priority /></Reveal>}
      </div>
    </section>
  );
}
