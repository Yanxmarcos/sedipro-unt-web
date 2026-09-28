import type * as Icon from "lucide-react";

type IconName = keyof typeof Icon;

export type MenuLeafSubItem = {
  label: string;
  href: string;
  activePath?: string;
  badge?: string;
  badgeClassName?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
};

export type MenuGroupSubItem = {
  label: string;
  childItems: MenuLeafSubItem[];
};

export type MenuSubItem = MenuLeafSubItem | MenuGroupSubItem;

export type MenuItem = {
  icon: IconName;
  label: string;
  disabled?: boolean;
} & (
  | {
      href: string;
      badge?: string;
      badgeClassName?: string;
      childItems?: never;
      target?: "_blank" | "_self" | "_parent" | "_top";
    }
  | {
      href?: never;
      badge?: string;
      badgeClassName?: string;
      childItems: MenuSubItem[];
    }
);

export type NavItem = {
  groupLabel?: string;
  items: MenuItem[];
};

export const navItems: NavItem[] = [
  {
    groupLabel: "GENERAL",
    items: [{ icon: "LayoutDashboard", label: "Resumen", href: "/panel" }],
  },
  {
    groupLabel: "ASISTENCIA",
    items: [
      {
        icon: "CalendarCheck",
        label: "Asistencia",
        href: "/panel/asistencias",
      },
      {
        icon: "ClipboardCheck",
        label: "Tomar asistencia",
        href: "/panel/asistencias/tomar",
      },
    ],
  },
  {
    groupLabel: "VOTACIÓN",
    items: [
      { icon: "Vote", label: "Votación", href: "/panel/votaciones" },
      { icon: "Vote", label: "Votar", href: "/panel/votaciones/votar" },
    ],
  },
  {
    groupLabel: "EVENTOS",
    items: [
      {
        icon: "CalendarDays",
        label: "Eventos (Beta)",
        href: "/panel/eventos",
        disabled: true,
      },
    ],
  },
  {
    groupLabel: "PADRÓN",
    items: [
      { icon: "UsersRound", label: "Sedipranos", href: "/panel/sedipranos" },
    ],
  },
  {
    groupLabel: "ADMINISTRACIÓN",
    items: [
      { icon: "ShieldUser", label: "Usuarios", href: "/panel/usuarios" },
      { icon: "MonitorCheck", label: "Sesiones", href: "/panel/sesiones" },
    ],
  },
  {
    groupLabel: "Proyectos",
    items: [
      {
        icon: "Sparkles",
        label: "SEDInvita",
        childItems: [
          { label: "Edición", href: "/panel/sedinvita/edicion" },
          { label: "Postulantes", href: "/panel/sedinvita/postulantes" },
          { label: "Turnos", href: "/panel/sedinvita/turnos" },
          { label: "Áreas", href: "/panel/sedinvita/areas" },
          { label: "Grupos y facilitadores", href: "/panel/sedinvita/grupos" },
          { label: "Dinámicas", href: "/panel/sedinvita/dinamicas" },
          { label: "Asistencia", href: "/panel/sedinvita/asistencia" },
          { label: "Evaluación", href: "/panel/sedinvita/evaluacion" },
        ],
      },
    ],
  },
];
