import { CURRENT_VERSION } from "./app-version.mjs";
export { CURRENT_VERSION };

// Retrospective editorial milestones based on existing features and the supplied
// sprint records. Versions are release-note groupings, not reconstructed Git tags.
// Undated milestones deliberately omit publication dates.
export const RELEASES = [
  {
    version: CURRENT_VERSION,
    changes: [
      "Se incorporó Recursos institucionales en Herramientas para que todos los roles encuentren y descarguen la marca de SEDIPRO UNT, sus isotipos, logos de áreas, insignias y poses de Hito.",
      "Se añadió una galería con buscador y categorías, previsualización en fondos claros y oscuros, selección de variantes y fondo de descarga personalizado.",
      "Se habilitaron descargas PNG, WebP y JPG, archivos SVG y PDF cuando el recurso es vectorial, kits de variantes y la fuente original de Illustrator.",
      "Se prepararon insignias de áreas a 4096 píxeles y se corrigió el fondo de Hito corriendo, conservando las fuentes originales y la identidad de la marca.",
      "Se añadió la opción de copiar imágenes PNG en alta resolución desde la galería y el detalle para pegarlas en Canva, conservando las opciones de descarga.",
    ],
  },
  {
    version: "2.4.0",
    title: "QR personalizados y novedades del sistema",
    phase: "Herramientas y experiencia de uso",
    changes: [
      "Se incorporaron tres estilos de descarga para los QR de enlaces: institucional, negro sobre blanco y blanco sobre negro.",
      "Se añadió una previsualización para elegir el estilo antes de descargar el código.",
      "Se habilitaron descargas PNG de 4096 × 4096 píxeles y SVG vectorial para publicaciones, documentos y material impreso.",
      "Se mejoró la integración del logo de SEDIPRO UNT y su separación para conservar una identidad institucional reconocible.",
      "Se corrigió el contenido de los QR para guardar la dirección web en su formato habitual y se reforzó su comprobación de lectura.",
      "Se estrenó el historial de versiones para que todos los integrantes puedan conocer la evolución del sistema.",
      "Se actualizó el pie del panel con accesos a Documentación, Reportar y la versión actual, también mediante iconos en móviles.",
    ],
  },
  {
    version: "2.3.0",
    title: "Una visión más completa de SEDIPRO",
    phase: "Métricas y seguimiento",
    changes: [
      "Se renovó el resumen de gestión con indicadores de participación y datos históricos de asistencia y votación.",
      "Se incorporaron filtros de año, periodo y área para consultar la participación de los convocados en cada actividad.",
      "Se añadieron gráficos de distribución de sedipranos por carrera y sexo, con selección por área.",
      "Se creó un resumen para el rol Sediprano con saludo personalizado, área, accesos y actividades disponibles.",
      "Se incorporó la actividad reciente de los módulos para seguir el trabajo institucional según los permisos de cada cuenta.",
      "Se reorganizaron los indicadores del padrón para distinguir integrantes activos, inactivos y total registrado.",
    ],
  },
  {
    version: "2.2.0",
    title: "Enlaces cortos con identidad institucional",
    phase: "Nuevas herramientas",
    changes: [
      "Se estrenó el acortador de enlaces dentro de Herramientas para compartir direcciones con el dominio de SEDIPRO UNT.",
      "Se añadió la identificación de plataformas como Instagram, Facebook, LinkedIn, TikTok, WhatsApp, formularios y YouTube.",
      "Se incorporó una biblioteca compartida con título interno, campaña opcional, notas y búsqueda de enlaces.",
      "Se añadieron estados de activación y pausa, vencimiento opcional, papelera y recuperación de enlaces.",
      "Se habilitó la redirección directa al destino y se reutilizó la página 404 institucional para enlaces no disponibles.",
      "Se incorporó el contador de clics de los enlaces acortados.",
      "Se añadió la eliminación definitiva con permisos restringidos y protección frente a la reutilización de códigos retirados.",
    ],
  },
  {
    version: "2.1.1",
    title: "Asistencia más precisa y trazable",
    phase: "Mejoras del trabajo interno",
    changes: [
      "Se amplió la convocatoria de asistencias para incluir a todo SEDIPRO o seleccionar una o varias áreas.",
      "Se incluyó automáticamente a los directores de las áreas convocadas y se añadieron opciones para Presidencia y Vicepresidencia.",
      "Se conservaron los convocados originales de cada asistencia para mantener la coherencia de sus reportes históricos.",
      "Se añadieron filtros por presentes, tardanzas, justificados y ausentes en las vistas de consulta y edición.",
      "Se incorporó el cierre y la reapertura del registro para controlar cuándo se pueden modificar las asistencias.",
      "Se mejoró la toma de asistencia con una confirmación que muestra la foto, el nombre completo y el área del integrante.",
      "Se ajustaron los reportes Excel para incluir únicamente a los convocados de cada sesión y sus totales correspondientes.",
    ],
  },
  {
    version: "2.1.0",
    title: "Eventos, inscripciones y certificados",
    phase: "Herramientas para las actividades institucionales",
    changes: [
      "Se incorporó el módulo de Eventos para organizar actividades y sus formularios de inscripción.",
      "Se habilitaron formularios para actividades gratuitas y con costo, con preguntas y condiciones de registro configurables.",
      "Se añadieron credenciales QR para consultar inscripciones y registrar la asistencia de participantes externos.",
      "Se incorporó la asignación de responsables para controlar el acceso y la asistencia de cada evento.",
      "Se añadieron opciones de conexión con Google Sheets para el seguimiento de las inscripciones.",
      "Se estrenó el generador de certificados dentro del panel, con preparación de participantes desde el padrón, eventos, Excel o ingreso manual.",
      "Se incorporaron plantillas, firmas y edición de la composición de los certificados antes de su descarga.",
      "Se habilitó la generación individual y por lotes, con archivos de trabajo temporales en el navegador.",
    ],
  },
  {
    version: "2.0.1",
    title: "Una experiencia más consistente",
    phase: "Correcciones y ajustes de la renovación",
    changes: [
      "Se mejoró el acceso para dirigir al panel a las personas que ya tienen una sesión iniciada.",
      "Se unificaron botones, bordes y estados visuales para facilitar el uso del sitio en ambos temas.",
      "Se renovó la página 404 y su navegación para orientar a quienes llegan a una dirección no disponible.",
      "Se corrigieron recortes de textos y alineaciones en las secciones de la página de inicio.",
      "Se ajustó el comportamiento del desplazamiento suave en las páginas públicas.",
    ],
  },
  {
    version: "2.0.0",
    title: "Una nueva etapa para el sitio y el panel",
    phase: "Renovación del sistema",
    changes: [
      "Se renovó la interfaz del panel con una estructura común de navegación, formularios, tablas y acciones.",
      "Se consolidaron las vistas adaptadas a escritorio y móvil, con soporte para temas claro y oscuro.",
      "Se separaron frontend y backend para facilitar el mantenimiento y la incorporación de nuevas funcionalidades.",
      "Se actualizaron la página de inicio y la presentación de la comunidad, sus proyectos, áreas e hitos institucionales.",
      "Se incorporó a Hito como mascota animada de la experiencia pública de SEDIPRO UNT.",
      "Se ampliaron y organizaron las fichas del padrón para mejorar la información disponible de los integrantes.",
      "Se añadieron enlaces opcionales a redes y perfiles profesionales en la presentación del equipo de TI.",
    ],
  },
  {
    version: "1.4.0",
    title: "Seguimiento y asignación de áreas en SEDInvita",
    phase: "Consolidación de SEDInvita",
    changes: [
      "Se incorporó la organización de postulantes por área de interés y por área final asignada.",
      "Se añadió la asignación y corrección del área final en la etapa de incorporación.",
      "Se diferenciaron los postulantes con área asignada de quienes todavía requieren una decisión.",
      "Se reunieron filtros e indicadores para consultar el avance del proceso y acompañar el cierre de cada edición.",
    ],
  },
  {
    version: "1.3.0",
    title: "Evaluación de postulantes por competencias",
    phase: "Evolución de SEDInvita",
    changes: [
      "Se incorporó la configuración de dinámicas para las etapas de evaluación del proceso.",
      "Se organizaron las evaluaciones mediante competencias y puntajes asociados a cada dinámica.",
      "Se añadieron comentarios y observaciones para complementar el seguimiento de los postulantes.",
      "Se incorporó una vista de revisión y corrección de las evaluaciones registradas.",
    ],
  },
  {
    version: "1.2.0",
    title: "Grupos, facilitadores y acompañamiento",
    phase: "Evolución de SEDInvita",
    changes: [
      "Se incorporó la distribución de postulantes en grupos vinculados a sus turnos y fases.",
      "Se añadió la asignación de facilitadores para acompañar las dinámicas y el proceso de evaluación.",
      "Se habilitaron accesos de trabajo para los responsables de cada grupo.",
      "Se mejoró la consulta y organización de participantes para preparar las actividades de cada turno.",
    ],
  },
  {
    version: "1.1.0",
    title: "Turnos y asistencia para SEDInvita",
    phase: "Evolución de SEDInvita",
    changes: [
      "Se añadió la configuración de turnos por fase, con horarios y cupos disponibles.",
      "Se incorporó la consulta de postulantes con y sin turno para facilitar la organización de las jornadas.",
      "Se habilitó la asignación de encargados de asistencia para las actividades del proceso.",
      "Se incorporó el registro de asistencia de postulantes y el resumen de presentes, tardanzas y ausentes por turno.",
    ],
  },
  {
    version: "1.0.0",
    title: "SEDInvita llega al sistema",
    phase: "Primer gran módulo de convocatoria",
    changes: [
      "Se estrenó el módulo SEDInvita para administrar el proceso de postulación e incorporación a SEDIPRO UNT.",
      "Se incorporó la configuración de ediciones y fases para organizar cada convocatoria.",
      "Se habilitó el formulario público de inscripción y el registro de las preferencias de área de los postulantes.",
      "Se añadió un directorio de postulantes para consultar sus datos y acompañar su avance en el proceso.",
      "Se estableció una base común para integrar turnos, grupos, asistencias y evaluaciones en una misma herramienta.",
    ],
  },
  {
    version: "0.3.0",
    title: "Las primeras votaciones internas",
    phase: "Primeros módulos",
    changes: [
      "Se incorporó la creación de votaciones internas con opciones de respuesta para los integrantes habilitados.",
      "Se añadió el registro del voto y la consulta de resultados agrupados.",
      "Se estableció la relación entre las asistencias y la participación en las votaciones.",
    ],
  },
  {
    version: "0.2.0",
    title: "El primer control de asistencia",
    phase: "Primeros módulos",
    changes: [
      "Se incorporó el registro de asistencias generales para las actividades de la comunidad.",
      "Se añadió la consulta de integrantes y el marcado de su estado de asistencia.",
      "Se incorporaron totales básicos para revisar la participación en cada sesión.",
    ],
  },
  {
    version: "0.1.0",
    title: "El padrón de sedipranos",
    phase: "Primeros módulos",
    changes: [
      "Se creó el directorio de integrantes de SEDIPRO UNT con sus datos y área de pertenencia.",
      "Se incorporaron la creación, consulta y actualización de las fichas de sedipranos.",
      "Se añadieron herramientas básicas de búsqueda y organización del padrón.",
    ],
  },
  {
    version: "0.0.1",
    title: "El inicio del panel interno",
    phase: "Primeras bases",
    changes: [
      "Se puso en marcha el acceso al sistema para comenzar a centralizar la gestión interna de SEDIPRO UNT.",
      "Se incorporaron el inicio de sesión y una estructura inicial de navegación para los integrantes autorizados.",
      "Se estableció la base sobre la que crecerían el padrón, las asistencias y las votaciones de la comunidad.",
    ],
  },
];

export const versionAnchor = (version) =>
  `version-${version.replaceAll(".", "-")}`;
