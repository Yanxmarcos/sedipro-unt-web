import { PublicHero } from "@/components/public-site/hero";
import { ScrollStory } from "@/components/public-site/motion";
import { EditorialBands } from "@/components/public-site/sequences";
import { HomeGoals, HomeFooterFrame } from "@/components/public-site/home-institutional";
import { HomeApproach } from "@/components/public-site/home-approach";
import { ProjectJourney } from "@/components/public-site/project-journey";
import { PublicFooter } from "@/components/public-site/footer";
import { ElasticSection } from "@/components/public-site/elastic-section";
import { pageMetadata } from "@/lib/seo.mjs";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata = pageMetadata("/");

export default function HomePage() {
  return (
    <main id="main-content">
      <StructuredData path="/" />
      <PublicHero />
      <div id="historia"><ElasticSection surface="#29295d" previous="#fbfaf7" revealBackground pronounced><ScrollStory /></ElasticSection></div>
      <ElasticSection surface="#304d90" previous="#29295d" revealBackground pronounced clearPrevious><ProjectJourney /></ElasticSection>
      <ElasticSection surface="#304d90" previous="#f6f1fa" joined revealBackground><HomeApproach /></ElasticSection>
      <ElasticSection surface="#f6f1fa" previous="#141020" paper joined><HomeGoals /></ElasticSection>
      <ElasticSection surface="#f6f1fa" previous="#f6f1fa" paper><EditorialBands closing /></ElasticSection>
      <ElasticSection surface="#141020" previous="#f6f1fa" revealBackground pronounced><HomeFooterFrame><PublicFooter socialShowcase /></HomeFooterFrame></ElasticSection>
    </main>
  );
}
