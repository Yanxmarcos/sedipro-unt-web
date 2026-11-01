import { BookOpen, Bug } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Footer = () => (
  <footer className="text-muted-foreground mx-auto flex w-full max-w-360 items-center justify-between gap-2 border-t px-4 py-2 text-sm sm:px-6 md:py-4">
    <span className="whitespace-nowrap">© {new Date().getFullYear()} SEDIPRO UNT</span>

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
          <span className="sr-only md:not-sr-only">Reportar un problema</span>
        </TooltipTrigger>
        <TooltipContent>
          Escríbenos a ti.sedipro@unitru.edu.pe
        </TooltipContent>
      </Tooltip>
    </nav>
  </footer>
);

export default Footer;
