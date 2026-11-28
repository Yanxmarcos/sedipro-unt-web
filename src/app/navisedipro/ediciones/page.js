import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo.mjs";
import { archivePath, editions, editionPath, editionMedia, editionDate } from "./archive";
import styles from "./archive.module.css";

export const metadata = pageMetadata(archivePath);

export default function EditionsPage() {
  return (
    <main id="main-content" className={styles.archive}>
      <section className={styles.intro} aria-labelledby="navi-archive-title">
        <div className={styles.decorations} aria-hidden="true">
          {["rama", "lazo", "regalo", "bastones"].map((item) => (
            <Image key={item} src={`/navisedipro/adorno-${item}.webp`} alt="" width={512} height={512} sizes="15vw" />
          ))}
        </div>
        <h1 id="navi-archive-title">Ediciones de <span>NaviSEDIPRO</span></h1>
        <p>Recorre las Navidades que compartimos con la comunidad.</p>
      </section>
      <ul className={styles.editions}>
        {editions.map((edition) => (
          <li key={edition.slug}>
            <Link href={editionPath(edition)} className={styles.card}>
              <div className={styles.cardPhoto}>
                <Image src={editionMedia(edition, "portada.webp")} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" />
              </div>
              <div className={styles.cardCopy}>
                <h2>{edition.nombre}</h2>
                <p>{edition.resumen}</p>
                <span className={styles.cardDate}>{editionDate(edition) || edition.anio}</span>
              </div>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
