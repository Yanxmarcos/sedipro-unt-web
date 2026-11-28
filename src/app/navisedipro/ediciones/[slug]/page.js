import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { absoluteUrl, IS_PREVIEW, INDEXABLE_ROBOTS, NOINDEX_ROBOTS } from "@/lib/seo.mjs";
import { archivePath, editions, editionPath, editionMedia, editionDate } from "../archive";
import styles from "../archive.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return editions.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const edition = editions.find((entry) => entry.slug === slug);
  if (!edition) return {};
  return {
    title: `${edition.nombre} | SEDIPRO UNT`,
    description: edition.resumen,
    alternates: { canonical: absoluteUrl(editionPath(edition)) },
    robots: IS_PREVIEW || edition.esPlantilla ? NOINDEX_ROBOTS : INDEXABLE_ROBOTS,
  };
}

function ArchivePhotos({ edition, group, title }) {
  const files = edition.media[group];
  if (!files?.length) return null;
  return (
    <section className={styles.detailSection}>
      <h2>{title}</h2>
      <div className={styles.gallery}>
        {files.map((file, index) => {
          const src = editionMedia(edition, `${group}/${file}`);
          const label = edition.textos?.[file.replace(/\.[^.]+$/, "")] || `${title} de ${edition.nombre}, foto ${index + 1}`;
          return (
            <figure key={file}>
              <a href={src} target="_blank" rel="noopener noreferrer"><Image src={src} alt={label} width={640} height={480} sizes="(max-width: 760px) 50vw, 30vw" /></a>
              {group !== "galeria" && edition.textos?.[file.replace(/\.[^.]+$/, "")] && <figcaption>{label}</figcaption>}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

export default async function EditionPage({ params }) {
  const { slug } = await params;
  const index = editions.findIndex((entry) => entry.slug === slug);
  if (index < 0) notFound();
  const edition = editions[index];
  const neighbors = [editions[index + 1], editions[index - 1]].filter(Boolean);
  return (
    <main id="main-content" className={styles.detail}>
      <header className={styles.detailHero}>
        <Link className={styles.back} href={archivePath}>← Todas las ediciones</Link>
        <time>{editionDate(edition) || edition.anio}</time>
        <h1>{edition.nombre}</h1>
        <p>{edition.resumen}</p>
        <div className={styles.detailCover}>
          <Image src={editionMedia(edition, "portada.webp")} alt={`Portada de ${edition.nombre}`} fill sizes="(max-width: 760px) 100vw, 1030px" preload />
        </div>
      </header>
      <div className={styles.detailBody}>
        {!!edition.historia?.length && <section className={styles.detailSection}><h2>Historia</h2>{edition.historia.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>}
        <ArchivePhotos edition={edition} group="historia" title="Archivo de la campaña" />
        {edition.alcance && <section className={styles.detailSection}>
          <h2>Alcance</h2>
          {edition.alcance.descripcion && <p>{edition.alcance.descripcion}</p>}
          {!!edition.alcance.datos?.length && <dl className={styles.facts}>{edition.alcance.datos.map(({ etiqueta, valor }) => <div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor}</dd></div>)}</dl>}
        </section>}
        {!!edition.objetivos?.length && <section className={styles.detailSection}><h2>Objetivos</h2><ul>{edition.objetivos.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        <ArchivePhotos edition={edition} group="galeria" title="Galería" />
        {!!edition.media.videos?.length && <section className={styles.detailSection}>
          <h2>Videos</h2>
          <div className={styles.videos}>{edition.media.videos.map((file) => (
            <figure key={file}>
              <video controls playsInline preload="none" src={editionMedia(edition, `videos/${file}`)} />
              <figcaption>{edition.textos?.[file.replace(/\.[^.]+$/, "")] || `Video memorial de ${edition.nombre}`}</figcaption>
            </figure>
          ))}</div>
        </section>}
        <ArchivePhotos edition={edition} group="equipo" title="Equipo" />
        {!!edition.aliados?.length && <section className={styles.detailSection}><h2>Aliados</h2><ul>{edition.aliados.map((name) => <li key={name}>{name}</li>)}</ul></section>}
        <nav className={styles.neighbors} aria-label="Otras ediciones">{neighbors.map((neighbor) => <Link key={neighbor.slug} href={editionPath(neighbor)}>{neighbor.nombre} ↗</Link>)}</nav>
      </div>
    </main>
  );
}
