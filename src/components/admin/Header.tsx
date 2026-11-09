"use client";

import { usePathname } from "next/navigation";
import ModeToggle from "@/components/admin/ModeToggle";
import ProfileDropdown from "@/components/admin-shared/ProfileDropdown";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SessionCountdown } from "@/components/admin/session-countdown";
import { usePanelSession } from "@/components/admin/panel-session";

const Header = () => {
  const pathname = usePathname();
  const { permissions, assignments } = usePanelSession();
  const attendanceId = /^\/panel\/asistencias\/tomar\/([^/]+)$/.exec(
    pathname,
  )?.[1];
  const attendanceName = attendanceId
    ? assignments.find(
        (item: { _id: string; descripcion: string }) =>
          String(item._id) === attendanceId,
      )?.descripcion || "Tomar asistencia"
    : "";
  const shortAttendanceName =
    attendanceName.length > 56
      ? attendanceName.slice(0, 55).trimEnd() + "…"
      : attendanceName;
  const title = attendanceId
    ? shortAttendanceName
    : pathname === "/panel/recursos"
      ? "Recursos institucionales"
    : pathname === "/panel" && permissions.role === "SEDIPRANO"
      ? "Resumen"
      : /^\/panel\/eventos\/[^/]+\/checkin$/.test(pathname)
        ? "Asistencia de evento"
        : /^\/panel\/eventos\/[^/]+$/.test(pathname)
          ? "Evento"
          : pathname
              .split("/")
              .filter(Boolean)
              .slice(-1)[0]
              ?.replace(/-/g, " ") || "Resumen";

  return (
    <header className="bg-card sticky top-0 z-50 min-w-0 border-b">
      <div className="mx-auto flex min-w-0 max-w-360 items-center justify-between gap-3 px-4 py-2 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <SidebarTrigger className="[&_svg]:size-5!" />
          <Separator
            orientation="vertical"
            className="hidden h-4! data-vertical:self-center sm:block"
          />
          <span
            title={attendanceName || undefined}
            className="truncate text-sm font-medium capitalize"
          >
            {title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SessionCountdown />
          <ModeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
