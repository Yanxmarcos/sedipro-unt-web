import { absoluteUrl, IS_PREVIEW, PUBLIC_PAGES, SOCIAL_IMAGE } from "@/lib/seo.mjs";
import { editions, editionPath, editionMedia } from "./navisedipro/ediciones/archive";

export default function sitemap() {
  if (IS_PREVIEW) return [];
  // No synthetic lastmod dates: only canonical, public and indexable pages.
  return [
    ...PUBLIC_PAGES.map(page => ({ url: absoluteUrl(page.path), images: [(page.image ?? SOCIAL_IMAGE).url] })),
    ...editions.filter(edition => !edition.esPlantilla).map(edition => ({
      url: absoluteUrl(editionPath(edition)),
      images: [absoluteUrl(editionMedia(edition, "portada.webp"))],
    })),
  ];
}
