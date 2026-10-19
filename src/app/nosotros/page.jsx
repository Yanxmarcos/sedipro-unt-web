import { AboutExperience } from "@/components/public-site/about-experience";
import { PublicFooter } from "@/components/public-site/footer";
import { ElasticSection } from "@/components/public-site/elastic-section";
import { EditorialBands } from "@/components/public-site/sequences";

export const metadata = {
  title: "Nosotros | SEDIPRO UNT",
  description: "Impulsando el liderazgo en dirección de proyectos.",
};

export default function AboutPage() {
  return <main id="main-content"><AboutExperience /><ElasticSection surface="#f6f1fa" previous="#f6f1fa" paper joined><EditorialBands closing compact /></ElasticSection><ElasticSection surface="#141020" previous="#f6f1fa" revealBackground pronounced><div><PublicFooter socialShowcase /></div></ElasticSection></main>;
}
