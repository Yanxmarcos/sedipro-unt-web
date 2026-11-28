import { privateMetadata } from "@/lib/seo.mjs";
import DonorGallery from "./donor-gallery";
import styles from "../donor.module.css";

export const metadata = privateMetadata("Donadores de NAVISEDIPRO");

export default function DonorPage() {
  return <main id="main-content" className={styles.galleryPage}>
    <h1>Acceso exclusivo para donadores</h1>
    <DonorGallery />
  </main>;
}
