"use client";
import { usePathname } from "next/navigation";
export function PublicScrollbar() {
  const pathname = usePathname();
  return ["/", "/proyectos", "/nosotros", "/login"].includes(pathname) ||
    pathname.startsWith("/eventos/") ? (
    <span hidden data-public-scrollbar="true" />
  ) : null;
}
