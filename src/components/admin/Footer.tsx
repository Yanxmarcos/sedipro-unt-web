import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Footer = () => (
  <footer className="text-muted-foreground mx-auto flex w-full max-w-360 flex-col gap-2 border-t px-4 py-4 text-sm sm:px-6 md:flex-row md:items-center md:justify-between">
    <span>© {new Date().getFullYear()} SEDIPRO UNT</span>

    <nav
      aria-label="Enlaces del pie del panel"
      className="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <Link
        href="/tecnologias-de-la-informacion"
        target="_blank"
        className="hover:text-foreground transition-colors"
      >
        TI
      </Link>
      <a
        href="https://api-sediprount.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        Documentación
      </a>
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href="mailto:ti.sedipro@unitru.edu.pe"
              className="hover:text-foreground transition-colors"
            />
          }
        >
          Reportar un problema
        </TooltipTrigger>
        <TooltipContent>Escríbenos a esta dirección de email</TooltipContent>
      </Tooltip>
    </nav>
  </footer>
);

export default Footer;
