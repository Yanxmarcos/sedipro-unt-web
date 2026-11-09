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
    canManageEvents: Boolean(ROLE_LABELS[role]),
    canDeleteEvents: isSuperadmin,
    canViewEventAudit: isSuperadmin,
    canViewAttendanceAudit: isSuperadmin,
    canViewCertificateAudit: isSuperadmin,
    canViewResourceAudit: isSuperadmin,
    canManageLinks: Boolean(ROLE_LABELS[role]),
    canViewLinkAudit: isAdmin,
    canPermanentlyDeleteLinks: isSuperadmin,
    canDelete: isAdmin,
    canManageRoles: isAdmin,
  };
}

export function assignableRoles(user) {
  switch (normalizeRole(user?.rol)) {
    case "SUPERADMINISTRADOR":
      return ["SEDIPRANO", "DIRECTIVA", "ADMINISTRADOR"];
    case "ADMINISTRADOR":
      return ["SEDIPRANO", "DIRECTIVA"];
    case "DIRECTIVA":
      return ["SEDIPRANO"];
    default:
      return [];
  }
}

export function canOpenPanelPage(pathname, user, assignments = []) {
  if (
    pathname === "/panel/recursos/auditoria" ||
    pathname.startsWith("/panel/recursos/auditoria/")
  )
    return panelPermissions(user).canViewResourceAudit;
  if (
    pathname === "/panel/certificados/auditoria" ||
    pathname.startsWith("/panel/certificados/auditoria/")
  )
    return panelPermissions(user).canViewCertificateAudit;
  if (
    pathname === "/panel/asistencias/auditoria" ||
    pathname.startsWith("/panel/asistencias/auditoria/")
  )
    return panelPermissions(user).canViewAttendanceAudit;
  if (
    pathname === "/panel/enlaces/auditoria" ||
    pathname.startsWith("/panel/enlaces/auditoria/")
  )
    return panelPermissions(user).canViewLinkAudit;
  if (pathname === "/panel/enlaces" || pathname.startsWith("/panel/enlaces/"))
    return panelPermissions(user).canManageLinks;
  if (pathname === "/panel") return true;
  if (pathname === "/panel/recursos")
    return Boolean(ROLE_LABELS[normalizeRole(user?.rol)]);
  if (pathname === "/panel/versiones")
    return Boolean(ROLE_LABELS[normalizeRole(user?.rol)]);
  if (pathname === "/panel/perfil" || pathname === "/panel/cambiar-contrasena")
    return true;
  if (pathname === "/panel/usuarios" || pathname.startsWith("/panel/usuarios/"))
    return panelPermissions(user).isAdmin;
  if (pathname === "/panel/sesiones" || pathname.startsWith("/panel/sesiones/"))
    return panelPermissions(user).isSuperadmin;
  if (pathname === "/panel/votaciones/votar") return true;
  if (
    pathname === "/panel/certificados" ||
    pathname.startsWith("/panel/certificados/")
  )
    return Boolean(ROLE_LABELS[normalizeRole(user?.rol)]);
  if (pathname === "/panel/eventos/comunicaciones")
    return panelPermissions(user).canManageEvents;
  if (pathname === "/panel/eventos/auditoria")
    return panelPermissions(user).canViewEventAudit;
  if (pathname === "/panel/eventos" || pathname.startsWith("/panel/eventos/"))
    return Boolean(ROLE_LABELS[normalizeRole(user?.rol)]);
  if (pathname === "/panel/asistencias/tomar") return true;
  if (pathname.startsWith("/panel/asistencias/tomar/")) {
    const id = pathname.split("/").at(-1);
    return assignments.some((item) => String(item._id) === id);
  }
  return panelPermissions(user).canManage;
}
