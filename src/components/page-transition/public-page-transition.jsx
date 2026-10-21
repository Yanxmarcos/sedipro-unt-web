import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PageTransition } from "./transition";

// Trusted repository vector is in the initial HTML: no logo-image request is needed.
const logo = readFileSync(join(process.cwd(), "public/logos/sedi-logo.svg"), "utf8");

export function PublicPageTransition({ children }) {
  return <PageTransition logo={<span dangerouslySetInnerHTML={{ __html: logo }} />}>{children}</PageTransition>;
}
