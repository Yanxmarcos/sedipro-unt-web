export const LANDING_PATHS = [
  "/",
  "/nosotros",
  "/proyectos",
  "/tecnologias-de-la-informacion",
];

export function isLandingPath(pathname) {
  return LANDING_PATHS.includes(pathname);
}
