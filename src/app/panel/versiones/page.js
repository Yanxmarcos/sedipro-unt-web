import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CURRENT_VERSION, RELEASES, versionAnchor } from "@/lib/releases.mjs";
import { privateMetadata } from "@/lib/seo.mjs";

export const metadata = privateMetadata("Versiones y novedades");

function VersionIndex({ mobile = false }) {
  return (
    <nav
      aria-label={mobile ? "Índice de versiones móvil" : "Índice de versiones"}
    >
      <ol className={mobile ? "mt-3 grid grid-cols-3 gap-2" : "mt-3 space-y-1"}>
        {RELEASES.map((release, index) => (
          <li key={release.version}>
            <a
              href={`#${versionAnchor(release.version)}`}
              className={`focus-visible:ring-ring inline-flex min-h-9 items-center rounded-md px-2 text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 ${index === 0 ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              v{release.version}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function VersionsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b px-1 pt-5 pb-8 text-center sm:pt-8 sm:pb-10">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Versión {CURRENT_VERSION} · Sistema web de SEDIPRO UNT
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Cada mejora cuenta. Conoce cómo ha crecido nuestro sistema y las
          herramientas que acompañan el trabajo de la comunidad.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span>Historial de actualizaciones</span>
          <span aria-hidden="true" className="text-muted-foreground">
            ·
          </span>
          <Badge variant="secondary">Versión actual</Badge>
        </div>
      </header>
      <details className="group border-b py-3 lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          Explorar versiones
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-180"
          />
        </summary>
        <VersionIndex mobile />
      </details>
      <div className="grid items-start gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_10rem] lg:pt-10">
        <div className="min-w-0">
          {RELEASES.map((release, index) => (
            <article
              key={release.version}
              id={versionAnchor(release.version)}
              aria-labelledby={`${versionAnchor(release.version)}-title`}
              className={`scroll-mt-24 border-b pb-8 last:border-b-0 ${index > 0 ? "pt-8" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2
                  id={`${versionAnchor(release.version)}-title`}
                  className="text-xl font-semibold tracking-tight"
                >
                  Versión {release.version}
                </h2>
                {index === 0 && <Badge variant="outline">Actual</Badge>}
              </div>
              <ul className="mt-4 max-w-[75ch] list-disc space-y-2 pl-5 text-sm leading-6 marker:text-muted-foreground">
                {release.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <aside className="sticky top-24 hidden lg:block">
          <h2 className="px-2 text-sm font-semibold">En esta página</h2>
          <VersionIndex />
        </aside>
      </div>
    </div>
  );
}
