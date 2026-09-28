"use client";

import { useRouter } from "next/navigation";
import { CircleUserRound, KeyRound, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePanelSession } from "@/components/admin/panel-session";
import { panelApi } from "@/lib/panel-api";
import { ROLE_LABELS, normalizeRole } from "@/lib/panel-permissions.mjs";
import { toast } from "sonner";

export default function ProfileDropdown() {
  const router = useRouter();
  const { user } = usePanelSession();
  const name =
    [user?.nombres, user?.apellidos].filter(Boolean).join(" ") ||
    user?.user ||
    "Usuario";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function logout() {
    try {
      await panelApi("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (failure) {
      toast.error(failure.message);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Menú de mi cuenta"
          />
        }
      >
        <Avatar>
          <AvatarImage src={user?.fotoPerfil?.url} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex min-w-0 flex-col gap-1 px-2 py-2.5 font-normal">
            <span className="break-words font-semibold">{name}</span>
            <span className="text-xs text-muted-foreground">
              {ROLE_LABELS[normalizeRole(user?.rol)] || user?.rol}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/panel/perfil")}
            disabled={user?.mustChangePassword}
          >
            <CircleUserRound /> Mi perfil
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/panel/cambiar-contrasena")}
          >
            <KeyRound /> Cambiar contraseña
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={logout}>
            <LogOutIcon /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
