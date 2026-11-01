import { headers } from "next/headers";
import { notFound } from "next/navigation";
import NotFound from "@/app/not-found";
import { privateMetadata } from "@/lib/seo.mjs";

export const dynamic = "force-dynamic";
export const metadata = privateMetadata("Página no encontrada");

export default async function ShortLinkUnavailablePage() {
  // Reuse the site's exact 404 UI while retaining a temporary 503 HTTP status.
  // A direct visit without a resolver result is an ordinary native 404.
  if ((await headers()).get("x-sedipro-short-link-status") !== "503")
    notFound();
  return <NotFound />;
}
