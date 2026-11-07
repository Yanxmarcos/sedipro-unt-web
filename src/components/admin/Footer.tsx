import Link from "next/link";
import { BookOpen, BookUser, Bug, Tag } from "lucide-react";
import { CURRENT_VERSION } from "@/lib/app-version.mjs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Footer = () => (
  <footer className="text-muted-foreground mx-auto flex w-full max-w-360 items-center justify-between gap-1 border-t px-2 py-2 text-sm min-[360px]:gap-2 min-[360px]:px-4 sm:px-6 md:py-4">
    <span className="whitespace-nowrap text-xs sm:text-sm">
      © {new Date().getFullYear()} SEDIPRO UNT
    </span>

    <nav
      aria-label="Enlaces del pie del panel"
      className="flex shrink-0 items-center md:gap-x-4"
    >
      <a
        href="https://api-sediprount.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 md:size-auto"
      >
        <BookOpen aria-hidden="true" className="size-5 md:hidden" />
        <span className="sr-only md:not-sr-only">Documentación</span>
      </a>
      <a
        href="https://drive.google.com/file/d/1qZdcgXCaIopkoSZVI2lcJFaIWFhOrapg/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 md:size-auto"
      >
        <BookUser aria-hidden="true" className="size-5 md:hidden" />
        <span className="sr-only md:not-sr-only">Manual de Usuario</span>
      </a>
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href="mailto:ti.sedipro@unitru.edu.pe"
              className="hover:text-foreground focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 md:size-auto"
            />
          }
        >
          <Bug aria-hidden="true" className="size-5 md:hidden" />
          <span className="sr-only md:not-sr-only">Reportar</span>
        </TooltipTrigger>
        <TooltipContent>
          <span>
            Si has encontrado un problema, por favor escríbenos a{" "}
            <strong>ti.sedipro@unitru.edu.pe</strong> para que podamos
            atenderlo. 🙂
          </span>
        </TooltipContent>
      </Tooltip>
      <Link
        href="/panel/versiones"
        className="hover:text-foreground focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 md:size-auto"
        title={`Ver novedades de la versión ${CURRENT_VERSION}`}
      >
        <Tag aria-hidden="true" className="size-5 md:hidden" />
        <span className="sr-only md:not-sr-only">
          Versión {CURRENT_VERSION}
        </span>
      </Link>
    </nav>
  </footer>
);

export default Footer;
