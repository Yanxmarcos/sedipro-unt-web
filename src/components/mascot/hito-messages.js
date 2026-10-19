// Add a route here and to LANDING_PATHS to reuse Hito on another public page.
export const HITO_MESSAGES = {
  "/": {
    greeting: "¡Hola! Soy Hito. ¿Creamos el próximo gran proyecto?",
    comments: ["Toda gran idea empieza con un pequeño paso.", "¡Un equipo, muchas ideas! Eso es SEDIPRO UNT.", "Yo pongo las alas. Tú pones las ideas."],
  },
  "/proyectos": {
    greeting: "¡Aquí las ideas se convierten en proyectos! Te acompaño a descubrirlos.",
    comments: ["Paso a paso, hito a hito. Así avanzamos.", "Planear, colaborar y aprender. ¡Vamos, equipo!", "Un proyecto crece cuando compartimos ideas."],
  },
  "/nosotros": {
    greeting: "¡Te presento a mi equipo! Somos SEDIPRO UNT.",
    comments: ["Diferentes talentos, un mismo equipo.", "Siempre hay algo nuevo que aprender juntos.", "Mi superpoder favorito: el trabajo en equipo."],
  },
  "/tecnologias-de-la-informacion": {
    greeting: "¡Bienvenido a TI! Por aquí también programamos con alas.",
    comments: ["Un pequeño commit, un gran paso para el equipo.", "Pensar, probar, mejorar. Y volver a intentar.", "Las buenas ideas también se construyen con código."],
  },
};

export const HITO_ACTIONS = [
  { state: "wave", label: "Saludar", message: "¡Hola, equipo! Qué bueno verte por aquí." },
  { state: "hop", label: "Saltar", message: "¡Un saltito más cerca de nuestra meta!" },
  { state: "celebrate", label: "Celebrar", message: "¡Otro hito cumplido! Este logro es de todo el equipo." },
  { state: "work", label: "Programar", message: "Modo TI: convirtiendo ideas en código." },
  { state: "love", label: "Dar cariño", message: "¡Gracias por ser parte de esta comunidad!" },
];
