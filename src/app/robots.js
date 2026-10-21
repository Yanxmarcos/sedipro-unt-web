import { IS_PREVIEW, SITE_URL } from "@/lib/seo.mjs";

export default function robots() {
  if (IS_PREVIEW) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/private/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
