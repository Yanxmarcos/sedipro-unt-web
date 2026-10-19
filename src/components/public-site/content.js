export const PUBLIC_REDESIGN_PATHS = ["/", "/proyectos", "/nosotros", "/login"];

export const EMAIL = "sedipro@unitru.edu.pe";
export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/sedipro.unt/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/sediprount/" },
  { label: "Facebook", href: "https://www.facebook.com/SediproUNT" },
  { label: "YouTube", href: "https://www.youtube.com/c/SEDIPROUNT" },
  { label: "TikTok", href: "https://www.tiktok.com/@sediprount" },
];

export const AREAS = [
  { name: "Gestión del Talento Humano", short: "GTH", color: "#74bd4f", ink: "#173718", logo: "/img/areas/logo-gth.webp", description: "El área de Gestión del Talento Humano se enfoca en cultivar el liderazgo proactivo, fomentar la integración y compromiso, mejorar las habilidades de comunicación, crear un ambiente de confianza y resolver conflictos." },
  { name: "Project Management Office", short: "PMO", color: "#f4d53d", ink: "#332b00", logo: "/img/areas/logo-pmo.webp", description: "Se encarga de la formación en gestión de proyectos, el seguimiento de proyectos en curso, la estandarización de procesos y la asesoría estratégica en la sección. Su objetivo es garantizar la eficiencia y el éxito en la ejecución de proyectos." },
  { name: "Marketing", short: "MKT", color: "#e85b63", ink: "#3b1014", logo: "/img/areas/logo-mkt.webp", description: "Desempeña funciones clave como la edición de videos, diseño de material gráfico, análisis de redes sociales y la implementación de herramientas innovadoras para gestionar contenidos. Estas tareas se centran en promover la marca de SEDIPRO UNT y maximizar su visibilidad." },
  { name: "Logística y Finanzas", short: "LTK & FNZ", color: "#69c8e8", ink: "#0b3241", logo: "/img/areas/logo-ltk.webp", description: "El área de Logística y Finanzas se encarga de mantener actualizada la base de datos de inventario, generar fondos, proporcionar soporte logístico a proyectos y planificar/controlar adquisiciones y contratación de servicios." },
  { name: "Tecnologías de la Información", short: "TI", color: "#f39a4a", ink: "#442008", logo: "/img/areas/logo-ti.webp", href: "/tecnologias-de-la-informacion", description: "El área de Tecnologías de la Información en SEDIPRO UNT se encarga de la gestión de sistemas, control interno, reportes, proyectos, asesoría y capacitación en TI para garantizar el uso eficiente de la tecnología." },
];

export const IMPACT = [
  { value: "+12", label: "años de experiencia" },
  { value: "+100", label: "miembros activos" },
  { value: "+60", label: "proyectos" },
  { value: "5", label: "áreas funcionales" },
  { value: "+20", label: "carreras representadas" },
  { value: "+100", label: "eventos" },
  { value: "+13", label: "años proyectando vidas" },
];

export const IMAGERY = {
  formation: { src: "/360pm/acerca-de.webp", alt: "Formación en dirección de proyectos" },
  community: { src: "/crown-night/todos1.webp", alt: "Participantes de Crown Night en la Universidad Nacional de Trujillo" },
  impact: { src: "/360pm/impacto.webp", alt: "Iniciativas de impacto social de SEDIPRO UNT" },
};

export const PROJECTS = [
    {
        id: "sedichampions",
        date: "2026-08-08",
        iconLabel: "SEDICHAMPIONS LEAGUE",
        title:
            "SEDICHAMPIONS LEAGUE 2026",
        description:
            "Es el campeonato deportivo que busca fortalecer la integración, el trabajo en equipo y el compañerismo entre estudiantes a través de actividades recreativas y competitivas.",
        meta: "Sábado 8 de agosto, 2026.",
        href: "/sedichampions",
        imageRatio: 2482 / 3510,
        image: "/proyectos/sedichampions.webp",
        imageAlt: "Imagen de SEDICHAMPIONS",
    },
    {
        id: "crown-night",
        date: "2026-08-29",
        iconLabel: "CROWN NIGHT",
        title:
            "CROWN NIGHT 2026",
        description:
            "Crown Night es el certamen oficial que reúne el talento, liderazgo e identidad de las áreas funcionales de SEDIPRO UNT en una noche inolvidable.",
        meta: "Sábado 29 de agosto, 2026.",
        href: "/crown-night",
        imageRatio: 3375 / 4219,
        image: "/proyectos/crown-night.webp",
        imageAlt: "Imagen de CROWN NIGHT",
    },
    {
        id: "sedinvita",
        date: "2026-07-18",
        iconLabel: "SEDINVITA",
        title:
            "SEDINVITA 2026",
        description:
            "Únete a la comunidad de líderes más influyente de la UNT. SEDInvita es el punto de partida para tu crecimiento profesional y personal.",
        meta: "Del 1 de junio al 18 de julio, 2026",
        href: "/sedinvita",
        imageRatio: 912 / 1136,
        image: "/proyectos/sedinvita1.webp",
        imageAlt: "Imagen de Sedinvita",
    },
    {
        id: "proyectando3",
        date: "2026-02-28",
        iconLabel: "PROYECTANDO VOCACIONES",
        title: "PROYECTANDO VOCACIONES 3.0",
        description:
            "Proyectando Vocaciones 3.0 fue un espacio que orientó, inspiró y acompañó a los jóvenes a descubrir su verdadera vocación y elegir su futuro con confianza.",
        meta: "Sábado 28 de febrero, 2026",
        href: "https://proyectando-vocaciones.vercel.app/galeria/pv3/",
        imageRatio: 912 / 1136,
        image: "/proyectos/proyectando_v.webp",
        imageAlt: "Imagen de Proyectando Vocaciones 3.0",
    },
    {
        id: "proyectando2",
        date: "2025-02-22",
        iconLabel: "PROYECTANDO VOCACIONES",
        title: "PROYECTANDO VOCACIONES 2.0",
        description:
            "Proyectando Vocaciones 2.0 consolidó el proyecto como un espacio de orientación universitaria, fortaleciendo su impacto en la comunidad estudiantil.",
        meta: "Sábado 22 de febrero, 2025",
        href: "https://proyectando-vocaciones.vercel.app/galeria/pv2/",
        imageRatio: 1024 / 1024,
        image: "/proyectos/proyectando2.webp",
        imageAlt: "Imagen de Proyectando Vocaciones 2.0",
    },
    {
        id: "proyectando1",
        date: "2022-12-16",
        iconLabel: "PROYECTANDO VOCACIONES",
        title: "PROYECTANDO VOCACIONES 1.0",
        description:
            "Proyectando Vocaciones 1.0 fue el inicio de una idea que nació para conectar a los estudiantes con su vocación universitaria, brindándoles orientación e inspiración para dar sus primeros pasos hacia la elección de su futuro profesional.",
        meta: "Viernes 16 de diciembre, 2022",
        href: "https://proyectando-vocaciones.vercel.app/galeria/pv1/",
        imageRatio: 1024 / 1024,
        image: "/proyectos/proyectando.webp",
        imageAlt: "Imagen de Proyectando Vocaciones 1.0",
    },
    
];

export const DIRECTIVA = [
  {
    nombre: "María Fernanda Herrera Cerquin",
    cargo: "Presidenta SEDIPRO UNT",
    periodo: "2026",
    imagen: "/img/directiva/mafer.webp",
    carrera: "Ingeniería Industrial",
    linkedin: "https://linkedin.com/in/maria-herrera-cerquin",
  },
  {
    nombre: "Celine Huamán Martínez",
    cargo: "Vicepresidenta SEDIPRO UNT",
    periodo: "2026",
    imagen: "/img/directiva/celine.webp",
    carrera: "Ingeniería Metalúrgica",
    linkedin: "https://linkedin.com/in/maria-celine-huaman-martinez-481335267",
  },
  {
    nombre: "José Avila Santillan",
    cargo: "Director del área de GTH",
    periodo: "2026",
    imagen: "/img/directiva/jose.webp",
    carrera: "Ingeniería Civil",
    linkedin: "https://linkedin.com/in/josé-avila-santillan-b367b4307",
  },
  {
    nombre: "Christian Rodrigo Valverde Caspito",
    cargo: "Director del área de LTK & FNZ",
    periodo: "2026",
    imagen: "/img/directiva/caspito.webp",
    carrera: "Ingeniería Industrial",
    linkedin: "https://linkedin.com/in/christian-rodrigo-0386b92a3",
  },
  {
    nombre: "Abel Pereda Cabanillas",
    cargo: "Director del área de PMO",
    periodo: "2026",
    imagen: "/img/directiva/abel.webp",
    carrera: "Ingeniería Ambiental",
    linkedin: "https://linkedin.com/in/abel-pereda",
  },
  {
    nombre: "Elder Eli de la Cruz Calderón",
    cargo: "Director del área de TI",
    periodo: "2026",
    imagen: "/img/directiva/elder.webp",
    carrera: "Informática",
    linkedin: "https://linkedin.com/in/elder-de-la-cruz-calderon-b4200833a/",
  },
  {
    nombre: "Cielo Valentina Abanto Rojas",
    cargo: "Directora del área de MKT",
    periodo: "2026",
    imagen: "/img/directiva/cielo.webp",
    carrera: "Administración",
    linkedin: "https://linkedin.com/in/cielo-valentina-abanto-rojas-9ab66029a",
  },
];

export const RECOGNITIONS = [
    {
        company: "3er puesto en el International Project Management Championship (IPMC) Perú",
        role: "Competencia Internacional",
        period: "2025",
    },
    {
        company: "Reconocimiento de la Municipalidad Provincial de Trujillo como mejor voluntariado universitario",
        role: "Reconocimiento Institucional",
        period: "2025",
    },
    {
        company: "1er puesto en CONCEPMI",
        role: "Competencia Nacional",
        period: "2025",
    },
    {
        company: "Organizadores del Congreso Nacional de Conexiones Estudiantiles del Project Management Institute (PMI)",
        role: "Organización de Evento",
        period: "2024",
    },
    {
        company: "3er puesto a nivel nacional en IPMC",
        role: "Competencia Nacional",
        period: "2024",
    },
    {
        company: "Organizadores del International Project Management Perú",
        role: "Organización de Evento",
        period: "2024",
    },
    {
        company: "Reconocimiento de la Municipalidad Provincial de Trujillo como mejor voluntariado universitario",
        role: "Reconocimiento Institucional",
        period: "2024",
    },
    {
        company: "1er puesto en CONCEPMI",
        role: "Competencia Nacional",
        period: "2023",
    },
    {
        company: "3er puesto en Changemakers Students",
        role: "Competencia Nacional",
        period: "2022",
    },
    {
        company: "2do puesto en PM Championship",
        role: "Competencia Nacional",
        period: "2022",
    },
    {
        company: "1er puesto en International Project Management Championship (IPMC)",
        role: "Competencia Internacional",
        period: "2021",
    },
    {
        company: "1er puesto en Peruvian Project Management Championship (PMC)",
        role: "Competencia Nacional",
        period: "2021",
    },
    {
        company: "3er puesto en International Project Management Championship (IPMC)",
        role: "Competencia Internacional",
        period: "2020",
    },
    {
        company: "1er puesto en Peruvian Project Management Championship (PMC)",
        role: "Competencia Nacional",
        period: "2020",
    },
];
