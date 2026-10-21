export const SITE_URL = "https://sediprount.org";
export const SITE_NAME = "SEDIPRO UNT";
export const SITE_DESCRIPTION = "Somos la Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo. Conoce nuestro equipo, proyectos y comunidad en Trujillo, Perú.";
export const IS_PREVIEW = Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");

// Full supplied artwork, compressed without cropping or changing the composition.
export const SOCIAL_IMAGE = {
  url: `${SITE_URL}/social/sedipro-unt-seo.jpg`,
  width: 1672,
  height: 941,
  type: "image/jpeg",
  alt: "SEDIPRO UNT — Proyectando Vidas. Comunidad de la Universidad Nacional de Trujillo.",
};

export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};
export const NOINDEX_ROBOTS = { index: false, follow: false };

export const PUBLIC_PAGES = [
  { path: "/", name: "Inicio", title: "SEDIPRO UNT | Sección Estudiantil de Dirección de Proyectos de la UNT", description: SITE_DESCRIPTION },
  { path: "/nosotros", name: "Nosotros", title: "Nosotros: equipo y áreas | SEDIPRO UNT", description: "Conoce SEDIPRO UNT, nuestra directiva, las áreas GTH, PMO, Marketing, Logística y Finanzas y TI, y nuestros reconocimientos en dirección de proyectos." },
  { path: "/proyectos", name: "Proyectos", title: "Proyectos e iniciativas estudiantiles | SEDIPRO UNT", description: "Explora los proyectos de SEDIPRO UNT: Proyectando Vocaciones, SEDINVITA, Crown Night y Sedichampions. Liderazgo y trabajo en equipo desde la UNT." },
  { path: "/tecnologias-de-la-informacion", name: "Tecnologías de la Información", title: "Área de Tecnologías de la Información (TI) | SEDIPRO UNT", description: "Conoce al equipo de TI de SEDIPRO UNT y su trabajo en interfaces, sistemas, backend y datos para los proyectos de la Universidad Nacional de Trujillo." },
  { path: "/360pm", name: "360° Project Mastery", title: "360° Project Mastery | Formación en gestión de proyectos", description: "Programa experiencial de gestión de proyectos para estudiantes y profesionales: potencia tus competencias en Project Management con SEDIPRO UNT." },
  { path: "/crown-night", name: "Crown Night", title: "Crown Night | SEDIPRO UNT", description: "Crown Night reúne el talento, liderazgo e identidad de las áreas funcionales de SEDIPRO UNT en una noche compartida por nuestra comunidad." },
  { path: "/sedichampions", name: "Sedichampions League", title: "Sedichampions League | SEDIPRO UNT", description: "Conoce Sedichampions League, el campeonato de SEDIPRO UNT que fortalece la integración, el trabajo en equipo y el compañerismo mediante el deporte." },
  { path: "/sedinvita", name: "SEDINVITA", title: "SEDINVITA: únete a nuestra comunidad | SEDIPRO UNT", description: "Descubre SEDINVITA, el proceso de incorporación a SEDIPRO UNT. Conoce nuestras áreas y desarrolla tu liderazgo en dirección de proyectos." },
];

export function absoluteUrl(path) {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function pageMetadata(path, overrides = {}) {
  const page = PUBLIC_PAGES.find(item => item.path === path);
  if (!page) throw new Error(`SEO page is not configured: ${path}`);
  const { title = page.title, description = page.description, image = SOCIAL_IMAGE } = overrides;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: IS_PREVIEW ? NOINDEX_ROBOTS : INDEXABLE_ROBOTS,
    openGraph: { title, description, url: absoluteUrl(path), siteName: SITE_NAME, locale: "es_PE", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: image.url, alt: image.alt }] },
  };
}

export function privateMetadata(title) {
  return { title: `${title} | ${SITE_NAME}`, robots: NOINDEX_ROBOTS, alternates: { canonical: null }, openGraph: null, twitter: null };
}
