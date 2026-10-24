"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/public-site/public-shell";
import { PublicFooter } from "@/components/public-site/footer";
import { ElasticSection } from "@/components/public-site/elastic-section";
import { PUBLIC_REDESIGN_PATHS } from "@/components/public-site/content";
import styles from "@/components/public-site/not-found.module.css";

export default function NotFound() {
  const pathname = usePathname();
  const content = <main id="main-content" data-public-scrollbar="true">
    <section className={styles.hero} data-nav-surface="ink" aria-labelledby="not-found-title">
      <div className={styles.wordmark} aria-hidden="true"><span>SEDIPRO</span><span>UNT</span></div>
      <div className={styles.center}>
        <h1 id="not-found-title">404</h1>
        <p>Página no encontrada</p>
      </div>
      <div className={styles.bottom}>
        <div><h2>Parece que nos perdimos…</h2><p>La página que buscas no existe o fue movida.<br />Volvamos al inicio.</p></div>
        <Link href="/" className={styles.returnLink}>Volver al inicio <ArrowRight size={25} strokeWidth={1.7} aria-hidden="true" /></Link>
      </div>
    </section>
    <ElasticSection surface="#141020" previous="#29295d" revealBackground pronounced clearPrevious><div><PublicFooter socialShowcase /></div></ElasticSection>
  </main>;

  return PUBLIC_REDESIGN_PATHS.includes(pathname) ? content : <PublicShell pathname={pathname}>{content}</PublicShell>;
}
