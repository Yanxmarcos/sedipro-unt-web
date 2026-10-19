import { AboutExperience } from "@/components/public-site/about-experience";
import { PublicFooter } from "@/components/public-site/footer";
import { ElasticSection } from "@/components/public-site/elastic-section";
import { EditorialBands } from "@/components/public-site/sequences";
import { pageMetadata } from "@/lib/seo.mjs";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata = pageMetadata("/nosotros");

export default function AboutPage() {
  return <main id="main-content"><StructuredData path="/nosotros" /><AboutExperience /><ElasticSection surface="#f6f1fa" previous="#f6f1fa" paper joined><EditorialBands closing compact /></ElasticSection><ElasticSection surface="#141020" previous="#f6f1fa" revealBackground pronounced><div><PublicFooter socialShowcase /></div></ElasticSection></main>;
}
