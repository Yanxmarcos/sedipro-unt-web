import { absoluteUrl, PUBLIC_PAGES, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_IMAGE } from "@/lib/seo.mjs";
import { AREAS, EMAIL, PROJECTS, SOCIALS } from "@/components/public-site/content";

export function StructuredData({ path }) {
  const page = PUBLIC_PAGES.find(item => item.path === path);
  if (!page) return null;
  const pageId = `${absoluteUrl(path)}#webpage`;
  const graph = [{
    "@type": path === "/nosotros" ? "AboutPage" : path === "/proyectos" ? "CollectionPage" : "WebPage",
    "@id": pageId,
    url: absoluteUrl(path),
    name: page.title,
    description: page.description,
    inLanguage: "es-PE",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    primaryImageOfPage: { "@type": "ImageObject", url: SOCIAL_IMAGE.url, width: SOCIAL_IMAGE.width, height: SOCIAL_IMAGE.height },
  }];

  if (path === "/") {
    graph.push({
      "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME,
      alternateName: "Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo",
      inLanguage: "es-PE", publisher: { "@id": `${SITE_URL}/#organization` },
    });
  }
  if (path === "/" || path === "/nosotros") {
    graph.push({
      "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME,
      alternateName: "Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo",
      url: `${SITE_URL}/`, description: SITE_DESCRIPTION, email: EMAIL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logos/sedi-logo.svg`, width: 1563, height: 555 },
      image: SOCIAL_IMAGE.url, sameAs: SOCIALS.map(social => social.href),
      location: { "@type": "Place", name: "Universidad Nacional de Trujillo", address: { "@type": "PostalAddress", addressLocality: "Trujillo", addressRegion: "La Libertad", addressCountry: "PE" } },
      department: AREAS.map(area => ({ "@type": "Organization", name: `${area.name} — ${SITE_NAME}`, alternateName: area.short, description: area.description })),
    });
  }
  if (path !== "/") {
    graph[0].breadcrumb = { "@id": `${absoluteUrl(path)}#breadcrumb` };
    graph.push({ "@type": "BreadcrumbList", "@id": `${absoluteUrl(path)}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: page.name, item: absoluteUrl(path) },
    ] });
  }
  if (path === "/proyectos") {
    const listId = `${absoluteUrl(path)}#projects`;
    graph[0].mainEntity = { "@id": listId };
    graph.push({ "@type": "ItemList", "@id": listId, name: "Proyectos de SEDIPRO UNT", itemListElement: PROJECTS.map((project, index) => ({
      "@type": "ListItem", position: index + 1, item: { "@type": "CreativeWork", name: project.title, description: project.description, url: absoluteUrl(project.href), image: absoluteUrl(project.image) },
    })) });
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }} />;
}
