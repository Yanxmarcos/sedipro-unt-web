import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { EMAIL } from "./content";
import { SocialShowcase } from "./social-showcase";
import styles from "./footer.module.css";

export function PublicFooter({ socialShowcase = false }) {
  return (
    <>
      {socialShowcase && <div id="contacto" className={styles.socialSection}><SocialShowcase /></div>}
      <footer className={styles.footer} id={socialShowcase ? "pie-de-pagina" : "contacto"} style={{ "--footer-previous": socialShowcase ? "#141020" : "#304d90" }}>
        <div className={styles.crest}>
          <svg viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 140H940C1050 140 1080 40 1180 40S1310 140 1420 140H1440V144H0Z" /></svg>
          <a href="#main-content" className={styles.backTop}><span>Volver arriba</span><ArrowUp size={34} strokeWidth={1.7} aria-hidden="true" /></a>
        </div>
        <div className={styles.content}>
          <a href={`mailto:${EMAIL}`} className={styles.email}>{EMAIL}</a>
          <div className={styles.middle}>
            <nav aria-label="Páginas públicas" className={styles.navigation}>
              <div><Link href="/">Inicio</Link><Link href="/proyectos">Proyectos</Link></div>
              <div><Link href="/nosotros">Nosotros</Link><Link href="/login">Acceso Sediprano</Link></div>
            </nav>
            <Image className={styles.logo} src="/logos/sedi-logo.svg" alt="SEDIPRO UNT" width={1563} height={555} />
          </div>
          <div className={styles.bottom}>
            <p>© 2026 SEDIPRO UNT. Todos los derechos reservados.</p>
            <p>Hecho con <span role="img" aria-label="amor">💜</span> por <Link href="/tecnologias-de-la-informacion">Área de TI.</Link></p>
          </div>
        </div>
      </footer>
    </>
  );
}
