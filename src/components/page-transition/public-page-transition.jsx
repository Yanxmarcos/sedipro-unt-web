import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PageTransition } from "./transition";

// Trusted repository vector is in the initial HTML: no logo-image request is needed.
const logo = readFileSync(join(process.cwd(), "public/logos/sedi-logo.svg"), "utf8")
  .replace(/<path\b/g, (_, index, source) => {
    // The official SVG stores the wordmark before the three symbol paths.
    const position = source.slice(0, index).split("<path").length - 1;
    const order = position < 10 ? position + 3 : position - 10;
    return `<path pathLength="1" style="--trace-delay:${order * 22}ms"`;
  });

export function PublicPageTransition({ children }) {
  return <PageTransition logo={<span dangerouslySetInnerHTML={{ __html: logo }} />}>{children}</PageTransition>;
}
