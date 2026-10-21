import { ProjectPortfolio } from "@/components/public-site/project-portfolio";
import { PublicFooter } from "@/components/public-site/footer";
import { ElasticSection } from "@/components/public-site/elastic-section";
import { pageMetadata } from "@/lib/seo.mjs";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata = pageMetadata("/proyectos");

export default function ProjectsPage() {
  return <main id="main-content"><StructuredData path="/proyectos" /><ProjectPortfolio /><ElasticSection surface="#141020" previous="#29295d" revealBackground pronounced><div><PublicFooter socialShowcase /></div></ElasticSection></main>;
}
