"use client";

import { usePathname } from "next/navigation";
import ModeToggle from "@/components/admin/ModeToggle";
import ProfileDropdown from "@/components/admin-shared/ProfileDropdown";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SessionCountdown } from "@/components/admin/session-countdown";

const Header = () => {
  const pathname = usePathname();
  const title = /^\/panel\/eventos\/[^/]+\/checkin$/.test(pathname)
    ? "Asistencia de evento"
    : /^\/panel\/eventos\/[^/]+$/.test(pathname)
    ? "Evento"
    : pathname.split("/").filter(Boolean).slice(-1)[0]?.replace(/-/g, " ") ||
      "Resumen";

  return (
    <header className="bg-card sticky top-0 z-50 min-w-0 border-b">
      <div className="mx-auto flex min-w-0 max-w-360 items-center justify-between gap-3 px-4 py-2 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <SidebarTrigger className="[&_svg]:size-5!" />
          <Separator
            orientation="vertical"
            className="hidden h-4! data-vertical:self-center sm:block"
          />
          <span className="truncate text-sm font-medium capitalize">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SessionCountdown />
          <ModeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
