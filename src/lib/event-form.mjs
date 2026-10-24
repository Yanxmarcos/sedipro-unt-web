// Pure contract shared with the independently deployed frontend. Keep both copies identical.
export const CONSENT_TEXT =
  "Autorizo a SEDIPRO UNT a tratar los datos proporcionados para gestionar mi inscripción y participación en este evento.";
export const FIELD_TYPES = Object.freeze(
  [
    ["nombres", "Nombres"],
    ["apellidos", "Apellidos"],
    ["dni", "DNI"],
    ["correo", "Correo electrónico"],
    ["texto", "Respuesta corta"],
    ["textarea", "Párrafo"],
    ["celular", "Celular peruano"],
    ["matricula", "Matrícula UNT"],
    ["institucion", "Institución"],
    ["carrera", "Carrera"],
    ["numero", "Número"],
    ["fecha", "Fecha"],
    ["seleccion", "Opción única"],
    ["multiple", "Casillas de selección"],
    ["desplegable", "Desplegable"],
    ["booleano", "Sí / No"],
    ["escala", "Escala de valoración"],
    ["contenido", "Título y descripción"],
  ].map(([type, label]) => ({ type, label })),
);
export const CORE_FIELDS = ["nombres", "apellidos", "dni", "correo"];
export const UNT_EMAIL_DOMAIN = "unitru.edu.pe";
export function normalizeFieldInput(type, value) {
  return typeof value === "string" && ["nombres", "apellidos"].includes(type)
    ? value.toLocaleUpperCase("es-PE").normalize("NFC")
    : value;
}
const types = new Set(FIELD_TYPES.map((f) => f.type));
const choices = new Set(["seleccion", "multiple", "desplegable"]);
const idOk = (value) =>
  typeof value === "string" &&
  /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(value) &&
  !["__proto__", "prototype", "constructor"].includes(value);
const empty = (value) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && !value.length);
const uid = (prefix) =>
  `${prefix}_${globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;

export function createField(type = "texto") {
  const label = FIELD_TYPES.find((f) => f.type === type)?.label || "Pregunta";
  return {
    id: uid("p"),
    type,
    label,
    help: "",
    required: false,
    ...(type === "correo" ? { emailDomain: "" } : {}),
    options: choices.has(type)
      ? [
          { id: uid("o"), label: "Opción 1" },
          { id: uid("o"), label: "Opción 2" },
        ]
      : [],
    condition: null,
    min: type === "escala" ? 1 : null,
    max: type === "escala" ? 5 : null,
    maxLength: type === "textarea" ? 2000 : 250,
  };
}

export function createDefaultForm(template = "general") {
  const core = CORE_FIELDS.map((type) => ({
    ...createField(type),
    id: type,
    required: true,
    maxLength: type === "correo" ? 254 : type === "dni" ? 8 : 100,
  }));
  const sections = [
    {
      id: "identidad",
      title: "Tus datos",
      description: "Completa tus datos para registrar tu participación.",
      fields: core,
      jump: null,
    },
  ];
  if (template === "unt")
    sections.push({
      id: "academico",
      title: "Información académica",
      description: "Cuéntanos un poco más sobre ti.",
      fields: [
        { ...createField("matricula"), required: true },
        { ...createField("carrera"), required: true },
      ],
      jump: null,
    });
  return {
    title: "Inscríbete al evento",
    description:
      "Un espacio para aprender, conectar y hacer que las cosas sucedan.",
    sections,
    settings: {
      multiStep: template === "unt",
      confirmationMessage:
        "Tu inscripción está confirmada. ¡Nos vemos en el evento!",
    },
  };
}

export function validateDefinition(input) {
  const errors = {};
  const fail = (key, message) => {
    errors[key] = message;
  };
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { success: false, errors: { form: "Formulario inválido" } };
  if (
    typeof input.title !== "string" ||
    !input.title.trim() ||
    input.title.length > 160
  )
    fail("title", "Escribe un título de hasta 160 caracteres.");
  if (typeof input.description !== "string" || input.description.length > 3000)
    fail("description", "Descripción demasiado extensa.");
  if (
    !Array.isArray(input.sections) ||
    !input.sections.length ||
    input.sections.length > 12
  )
    return {
      success: false,
      errors: { sections: "Usa entre 1 y 12 secciones." },
    };
  const sectionIds = new Set(),
    fieldIds = new Set(),
    previous = new Map();
  let total = 0;
  const form = {
    title: typeof input.title === "string" ? input.title.trim() : "",
    description: input.description,
    sections: [],
    settings: {
      multiStep: Boolean(input.settings?.multiStep),
      confirmationMessage: String(
        input.settings?.confirmationMessage ||
          "Tu inscripción está confirmada.",
      ).trim(),
    },
  };
  if (form.settings.confirmationMessage.length > 2000)
    fail("settings", "El mensaje final admite hasta 2000 caracteres.");
  for (const [si, s] of input.sections.entries()) {
    if (!s || !idOk(s.id) || sectionIds.has(s.id)) {
      fail("sections", "Identificadores de sección inválidos o repetidos.");
      continue;
    }
    sectionIds.add(s.id);
    if (typeof s.title !== "string" || !s.title.trim() || s.title.length > 160)
      fail(s.id, "Cada sección necesita un título de hasta 160 caracteres.");
    if (typeof s.description !== "string" || s.description.length > 2000)
      fail(s.id, "Descripción de sección inválida.");
    if (!Array.isArray(s.fields) || s.fields.length > 60) {
      fail(s.id, "Preguntas de sección inválidas.");
      continue;
    }
    const section = {
      id: s.id,
      title: typeof s.title === "string" ? s.title.trim() : "",
      description: s.description,
      fields: [],
      jump: null,
    };
    for (const f of s.fields) {
      total++;
      if (!f || !idOk(f.id) || fieldIds.has(f.id)) {
        fail(s.id, "Hay preguntas con identificadores inválidos o repetidos.");
        continue;
      }
      fieldIds.add(f.id);
      if (!types.has(f.type)) fail(f.id, "Tipo de pregunta no permitido.");
      if (
        typeof f.label !== "string" ||
        !f.label.trim() ||
        f.label.length > 250
      )
        fail(f.id, "La pregunta requiere un título de hasta 250 caracteres.");
      if (typeof f.help !== "string" || f.help.length > 2000)
        fail(f.id, "La ayuda admite hasta 2000 caracteres.");
      const field = {
        id: f.id,
        type: f.type,
        label: typeof f.label === "string" ? f.label.trim() : "",
        help: f.help,
        required: Boolean(f.required),
        options: [],
        condition: null,
        min: null,
        max: null,
        maxLength: f.type === "textarea" ? 2000 : 250,
      };
      if (f.type === "correo") {
        if (
          f.emailDomain !== undefined &&
          !["", UNT_EMAIL_DOMAIN].includes(f.emailDomain)
        )
          fail(f.id, "Selecciona cualquier correo o correo institucional UNT.");
        field.emailDomain = f.emailDomain || "";
      }
      if (
        CORE_FIELDS.includes(f.id) &&
        (si !== 0 || f.type !== f.id || !f.required || f.condition)
      )
        fail(
          f.id,
          "Los datos de identificación son obligatorios y permanecen en la primera sección.",
        );
      if (CORE_FIELDS.includes(f.type) && f.id !== f.type)
        fail(f.id, "Utiliza el campo de identificación existente.");
      if (f.maxLength != null) {
        if (
          !Number.isInteger(Number(f.maxLength)) ||
          Number(f.maxLength) < 1 ||
          Number(f.maxLength) > 5000
        )
          fail(f.id, "Longitud máxima inválida.");
        else field.maxLength = Number(f.maxLength);
      }
      for (const k of ["min", "max"])
        if (f[k] != null && f[k] !== "") {
          if (!Number.isFinite(Number(f[k])) || Math.abs(Number(f[k])) > 1e12)
            fail(f.id, "Límite numérico inválido.");
          else field[k] = Number(f[k]);
        }
      if (field.min != null && field.max != null && field.min > field.max)
        fail(f.id, "El mínimo no puede superar al máximo.");
      if (
        f.type === "escala" &&
        (!Number.isInteger(field.min) ||
          !Number.isInteger(field.max) ||
          field.min < 0 ||
          field.max > 10 ||
          field.min >= field.max)
      )
        fail(f.id, "La escala debe tener límites enteros entre 0 y 10.");
      if (choices.has(f.type)) {
        if (
          !Array.isArray(f.options) ||
          f.options.length < 1 ||
          f.options.length > 100
        )
          fail(f.id, "Agrega entre 1 y 100 opciones.");
        else {
          const optionIds = new Set();
          for (const o of f.options) {
            if (
              !o ||
              !idOk(o.id) ||
              optionIds.has(o.id) ||
              typeof o.label !== "string" ||
              !o.label.trim() ||
              o.label.length > 200
            )
              fail(
                f.id,
                "Las opciones deben tener títulos e identificadores únicos.",
              );
            else {
              optionIds.add(o.id);
              field.options.push({ id: o.id, label: o.label.trim() });
            }
          }
        }
      }
      if (f.condition) {
        const c = f.condition,
          source = previous.get(c.fieldId);
        if (
          !source ||
          !["equals", "not_equals", "contains"].includes(c.operator) ||
          typeof c.value !== "string" ||
          c.value.length > 250 ||
          !conditionValueOk(source, c.value) ||
          (c.operator === "contains" && source.type !== "multiple")
        )
          fail(
            f.id,
            "La condición debe usar una respuesta válida de una pregunta anterior.",
          );
        else
          field.condition = {
            fieldId: c.fieldId,
            operator: c.operator,
            value: c.value,
          };
      }
      section.fields.push(field);
      previous.set(field.id, field);
    }
    if (s.jump) {
      const j = s.jump,
        source = previous.get(j.fieldId),
        target = input.sections.findIndex((x) => x?.id === j.toSectionId);
      if (
        !source ||
        !section.fields.some((f) => f.id === j.fieldId) ||
        source.type === "contenido" ||
        target <= si ||
        typeof j.value !== "string" ||
        !conditionValueOk(source, j.value)
      )
        fail(
          s.id,
          "El salto debe usar una pregunta de esta sección y dirigirse a una sección posterior.",
        );
      else
        section.jump = {
          fieldId: j.fieldId,
          value: j.value,
          toSectionId: j.toSectionId,
        };
    }
    form.sections.push(section);
  }
  if (total > 60) fail("sections", "El formulario admite hasta 60 preguntas.");
  for (const key of CORE_FIELDS)
    if (!fieldIds.has(key))
      fail(key, "Falta un campo obligatorio de identificación.");
  return { success: !Object.keys(errors).length, errors, form };
}

function conditionValueOk(source, value) {
  if (choices.has(source.type))
    return source.options.some((o) => o.id === value);
  if (source.type === "booleano") return ["si", "no"].includes(value);
  return (
    ![
      "contenido",
      "nombres",
      "apellidos",
      "dni",
      "correo",
      "textarea",
    ].includes(source.type) && value.length > 0
  );
}

function matches(c, answers) {
  const value = answers[c.fieldId];
  if (empty(value)) return false;
  if (c.operator === "contains")
    return Array.isArray(value) && value.includes(c.value);
  const equal = Array.isArray(value)
    ? value.includes(c.value)
    : String(value) === String(c.value);
  return c.operator === "not_equals" ? !equal : equal;
}

export function getVisibleSections(form, answers = {}) {
  const result = [],
    known = {};
  for (let i = 0; i < form.sections.length; i++) {
    const section = form.sections[i];
    const fields = section.fields.filter((f) => {
      const visible = !f.condition || matches(f.condition, known);
      if (visible && Object.hasOwn(answers, f.id)) {
        const raw = answers[f.id];
        const normalized =
          typeof raw === "string" ? raw.trim().normalize("NFC") : raw;
        known[f.id] =
          ["numero", "escala"].includes(f.type) &&
          !empty(normalized) &&
          Number.isFinite(Number(normalized))
            ? Number(normalized)
            : normalized;
      }
      return visible;
    });
    result.push({ ...section, fields });
    if (
      section.jump &&
      matches({ ...section.jump, operator: "equals" }, known)
    ) {
      const target = form.sections.findIndex(
        (s) => s.id === section.jump.toSectionId,
      );
      if (target > i) i = target - 1;
    }
  }
  return result;
}

export function validateAnswers(form, input) {
  const errors = {},
    answers = {};
  if (!input || typeof input !== "object" || Array.isArray(input))
    return {
      success: false,
      errors: { form: "Respuestas inválidas." },
      answers,
      identity: {},
      sectionIds: [],
    };
  const allIds = new Set(
    form.sections.flatMap((s) => s.fields.map((f) => f.id)),
  );
  if (Object.keys(input).some((k) => !allIds.has(k)))
    errors.form =
      "El formulario contiene preguntas desconocidas. Actualiza la página.";
  const sections = getVisibleSections(form, input);
  for (const f of sections.flatMap((s) => s.fields)) {
    if (f.type === "contenido") continue;
    const raw = input[f.id];
    if (empty(raw)) {
      if (f.required) errors[f.id] = "Completa este campo.";
      continue;
    }
    if (f.type === "multiple") {
      if (
        !Array.isArray(raw) ||
        raw.length > f.options.length ||
        new Set(raw).size !== raw.length ||
        raw.some(
          (x) => typeof x !== "string" || !f.options.some((o) => o.id === x),
        )
      )
        errors[f.id] = "Selecciona opciones válidas.";
      else answers[f.id] = [...raw];
      continue;
    }
    if (typeof raw !== "string" && typeof raw !== "number") {
      errors[f.id] = "Ingresa una respuesta válida.";
      continue;
    }
    const value = normalizeFieldInput(
      f.type,
      String(raw).trim().normalize("NFC"),
    );
    if (!value) {
      if (f.required) errors[f.id] = "Completa este campo.";
      continue;
    }
    if (value.length > (f.maxLength || 250)) {
      errors[f.id] = `Usa hasta ${f.maxLength || 250} caracteres.`;
      continue;
    }
    if (
      ["nombres", "apellidos"].includes(f.type) &&
      (!/^[\p{L}][\p{L}\p{M}\s.'’\-]*$/u.test(value) || value.length > 100)
    )
      errors[f.id] = "Escribe un nombre válido.";
    if (f.type === "dni" && !/^\d{8}$/.test(value))
      errors[f.id] = "El DNI debe tener exactamente 8 dígitos.";
    if (f.type === "celular" && !/^\d{9}$/.test(value))
      errors[f.id] = "El celular debe tener exactamente 9 dígitos.";
    if (f.type === "matricula" && !/^\d{10}$/.test(value))
      errors[f.id] = "La matrícula debe tener exactamente 10 dígitos.";
    if (
      f.type === "correo" &&
      (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 254)
    )
      errors[f.id] = "Escribe un correo electrónico válido.";
    if (
      f.type === "correo" &&
      f.emailDomain === UNT_EMAIL_DOMAIN &&
      !/^[^\s@]+@unitru\.edu\.pe$/i.test(value)
    )
      errors[f.id] = "Usa tu correo institucional terminado en @unitru.edu.pe.";
    if (choices.has(f.type) && !f.options.some((o) => o.id === value))
      errors[f.id] = "Selecciona una opción válida.";
    if (f.type === "booleano" && !["si", "no"].includes(value))
      errors[f.id] = "Selecciona Sí o No.";
    if (f.type === "fecha") {
      const date = new Date(`${value}T12:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      )
        errors[f.id] = "Escribe una fecha válida.";
    }
    if (["numero", "escala"].includes(f.type)) {
      const n = Number(value);
      if (
        !/^-?\d+(\.\d+)?$/.test(value) ||
        !Number.isFinite(n) ||
        Math.abs(n) > 1e12 ||
        (f.type === "escala" && !Number.isInteger(n))
      )
        errors[f.id] = "Ingresa un número válido.";
      else if ((f.min != null && n < f.min) || (f.max != null && n > f.max))
        errors[f.id] =
          `El valor debe estar entre ${f.min ?? "−∞"} y ${f.max ?? "∞"}.`;
      else answers[f.id] = n;
    } else answers[f.id] = f.type === "correo" ? value.toLowerCase() : value;
  }
  return {
    success: !Object.keys(errors).length,
    errors,
    answers,
    identity: Object.fromEntries(CORE_FIELDS.map((k) => [k, answers[k] || ""])),
    sectionIds: sections.map((s) => s.id),
  };
}

export function displayAnswer(field, value) {
  if (value == null) return "";
  if (choices.has(field.type))
    return (Array.isArray(value) ? value : [value])
      .map((v) => field.options.find((o) => o.id === v)?.label || String(v))
      .join(", ");
  if (field.type === "booleano") return value === "si" ? "Sí" : "No";
  return String(value);
}
