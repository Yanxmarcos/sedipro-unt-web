# Sitio web de SEDIPRO UNT

## Acortador institucional · T-017

Disponible en **Herramientas → Acortador de enlaces** (`/panel/enlaces`). Todos
los roles del panel gestionan la biblioteca y la papelera; Administrador y
Superadministrador consultan la auditoría y pueden eliminar registros individualmente con confirmación. La interfaz conserva
los componentes, navegación, temas y validaciones del panel existente.

Solo Superadministrador dispone de **Eliminar definitivamente** en cada fila de
la papelera. Requiere confirmación y elimina los datos del enlace, conservando
una reserva mínima del código y el historial de auditoría. No se puede restaurar.

El proxy del frontend atiende `/fb/`, `/ig/`, `/lk/`, `/tk/`, `/wa/`, `/fm/`, `/yt/` y `/go/`
con redirección HTTP directa. Los enlaces no disponibles reutilizan la página
404 institucional y conservan su dirección en el navegador. Configura
`API_BASE_URL` con el backend de tu entorno.
El backend debe preparar sus índices mediante `npm run db:enlaces:setup` y definir
`PUBLIC_SITE_URL`; la guía completa se encuentra en su archivo `ENLACES.md`.

Las pruebas del módulo se lanzan desde el backend con
`npm run test:enlaces:integration`: usan MongoDB temporal y servidores locales,
credenciales sintéticas, Playwright y salida `.next-enlaces-qa` separada de tu
sesión de desarrollo. Las capturas cubren biblioteca, formulario, papelera y
auditoría en escritorio/móvil y temas claro/oscuro.

## Sitio institucional

Sitio web para la **Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo**, un equipo multidisciplinario que forma futuros líderes mediante las buenas prácticas de gestión de proyectos, la metodología PMI y herramientas ágiles, con un enfoque académico, social y ambiental.

Desde el **área de Tecnologías de la Información (TI)** desarrollamos y mantenemos este sitio web para conectar a nuestra comunidad y apoyar las iniciativas de SEDIPRO UNT.

## Contributors

- [Yanxmarcos Chan Vasquez](https://github.com/Yanxmarcos)

<!-- Espacio reservado para incorporar a los próximos colaboradores. -->
