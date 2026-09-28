export const ROLE_LABELS = {
  SEDIPRANO: "Sediprano",
  DIRECTIVA: "Directiva",
  ADMINISTRADOR: "Administrador",
  SUPERADMINISTRADOR: "Superadministrador",
};

export function normalizeRole(role) {
  return { ADMIN: "ADMINISTRADOR", USER: "SEDIPRANO" }[role] || role;
}

export function panelPermissions(user) {
  const role = normalizeRole(user?.rol);
  const isSuperadmin = role === "SUPERADMINISTRADOR";
  const isAdmin = isSuperadmin || role === "ADMINISTRADOR";
  return {
    role,
    isSuperadmin,
    isAdmin,
    canManage: isAdmin || role === "DIRECTIVA",
    canDelete: isAdmin,
    canManageRoles: isSuperadmin,
  };
}

export function canOpenPanelPage(pathname, user, assignments = []) {
  if (pathname === "/panel") return true;
  if (pathname === "/panel/perfil" || pathname === "/panel/cambiar-contrasena")
    return true;
  if (pathname === "/panel/sesiones")
    return panelPermissions(user).isSuperadmin;
  if (pathname === "/panel/votaciones/votar") return true;
  if (pathname === "/panel/asistencias/tomar") return true;
  if (pathname.startsWith("/panel/asistencias/tomar/")) {
    const id = pathname.split("/").at(-1);
    return assignments.some((item) => String(item._id) === id);
  }
  return panelPermissions(user).canManage;
}
