import { ProjectPortfolio } from "@/components/public-site/project-portfolio";
import { PublicFooter } from "@/components/public-site/footer";
import { ElasticSection } from "@/components/public-site/elastic-section";

export const metadata = {
  title: "Proyectos | SEDIPRO UNT",
  description: "Una muestra del compromiso y trabajo de SEDIPRO UNT.",
};

export default function ProjectsPage() {
  return <main id="main-content"><ProjectPortfolio /><ElasticSection surface="#141020" previous="#29295d" revealBackground pronounced><div><PublicFooter socialShowcase /></div></ElasticSection></main>;
}
