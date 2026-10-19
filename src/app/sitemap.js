import { absoluteUrl, IS_PREVIEW, PUBLIC_PAGES, SOCIAL_IMAGE } from "@/lib/seo.mjs";

export default function sitemap() {
  if (IS_PREVIEW) return [];
  // No synthetic lastmod dates: only canonical, public and indexable pages.
  return PUBLIC_PAGES.map(page => ({ url: absoluteUrl(page.path), images: [SOCIAL_IMAGE.url] }));
}
