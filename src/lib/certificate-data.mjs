// Certificate sessions only contain local working data. Directory reads never
// create certificates, change accounts, or upload the participant workbook.
export const MAX_PARTICIPANTS = 500;
export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
export const BASE_TEMPLATE_URL = "/certificados/plantilla-base.png";
export const CERTIFICATE_DIRECTORY_URL = "/api/certificados/sedipranos";
export const EXTERNAL_BODY =
  "Por su destacada participación como {rol} en el proyecto “{proyecto}” organizado por la Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo.";
export const clean = (value) =>
  String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim();
export const canonical = (value) =>
  clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-PE")
    .replace(/[^a-z0-9]/g, "");

export function titleCase(value) {
  return clean(value)
    .toLocaleLowerCase("es-PE")
    .replace(
      /(^|[\s'’-])(\p{L})/gu,
      (_, separator, letter) => separator + letter.toLocaleUpperCase("es-PE"),
    );
}

const AREAS = {
  ti: "Tecnologías de la Información",
  pmo: "Project Management Office",
  gth: "Gestión del Talento Humano",
  mkt: "Marketing",
  ltkyfnz: "Logística y Finanzas",
  directiva: "Directiva",
};
const AREA_LABELS = new Map(
  Object.entries(AREAS).flatMap(([code, label]) => [
    [code, label],
    [canonical(label), label],
  ]),
);

export function fullArea(value) {
  // Area labels can arrive as codes, full Excel labels or already formatted
  // participant data. Repeated formatting must preserve institutional spelling.
  return (
    AREA_LABELS.get(canonical(value)) ||
    titleCase(value).replace(
      /\b(?:Y|E|O|U|De|Del|La|Las|El|Los|En|Para|Por|Con|A|Al)\b/gu,
      (word, offset) => (offset === 0 ? word : word.toLocaleLowerCase("es-PE")),
    )
  );
}

export function roleLabel(type, sexo) {
  if (type === "external") return "Participante";
  if (!["MASCULINO", "FEMENINO"].includes(sexo)) return "";
  const female = sexo === "FEMENINO";
  return (
    {
      director: female ? "Directora de proyecto" : "Director de proyecto",
      coordinator: female ? "Coordinadora" : "Coordinador",
      advisor: female ? "Asesora" : "Asesor",
    }[type] || ""
  );
}

export function memberParticipant(member, roleType) {
  const sexo = ["MASCULINO", "FEMENINO"].includes(member.sexo)
    ? member.sexo
    : "NO_ESPECIFICADO";
  return {
    id: `member-${member._id}`,
    memberId: String(member._id),
    name: titleCase(`${member.nombres || ""} ${member.apellidos || ""}`),
    area: fullArea(member.area),
    sexo,
    roleType,
    role: roleLabel(roleType, sexo),
    photoUrl: member.fotoPerfil?.url || "",
    source: "directory",
  };
}

const ROLE_TYPES = {
  director: [
    "director",
    "directora",
    "directordeproyecto",
    "directoradeproyecto",
  ],
  coordinator: [
    "coordinador",
    "coordinadora",
    "coordinadordearea",
    "coordinadoradearea",
  ],
  advisor: ["asesor", "asesora", "asesordearea", "asesoradearea"],
};

let importSequence = 0;

export function parseParticipantRows(rows, kind) {
  // A new workbook must never inherit a previous person's uploaded signature
  // merely because both appeared at the same worksheet row.
  const importId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${++importSequence}`;
  const start = rows.findIndex((row) => row.some((value) => clean(value)));
  if (start < 0)
    throw new Error("El Excel está vacío. Usa la plantilla de ejemplo.");
  const headers = rows[start].map(canonical);
  const aliases = {
    name: ["nombre", "nombrecompleto", "nombresyapellidos", "participante"],
    role: ["rol", "cargo"],
    area: ["area", "areadeparticipacion"],
  };
  const columns = {};
  for (const key of kind === "sedipranos"
    ? ["name", "role", "area"]
    : ["name", "role"]) {
    const matches = headers.flatMap((header, index) =>
      aliases[key].includes(header) ? [index] : [],
    );
    if (matches.length !== 1)
      throw new Error(
        `La columna ${{ name: "Nombre", role: "Rol", area: "Área" }[key]} debe aparecer una sola vez en el Excel.`,
      );
    columns[key] = matches[0];
  }
  const result = [];
  for (let index = start + 1; index < rows.length; index++) {
    const row = rows[index];
    if (!Object.values(columns).some((column) => clean(row[column]))) continue;
    const rawRole = canonical(row[columns.role]);
    let roleType = "external";
    let sexo = "NO_ESPECIFICADO";
    if (kind === "sedipranos") {
      roleType = Object.keys(ROLE_TYPES).find((type) =>
        ROLE_TYPES[type].includes(rawRole),
      );
      if (!roleType)
        throw new Error(
          `Fila ${index + 1}: usa Director/Directora, Coordinador/Coordinadora o Asesor/Asesora.`,
        );
      sexo = /^(directora|coordinadora|asesora)/.test(rawRole)
        ? "FEMENINO"
        : "MASCULINO";
    }
    result.push({
      id: `excel-${importId}-${index}`,
      name: titleCase(row[columns.name]),
      roleType,
      sexo,
      role:
        kind === "sedipranos"
          ? roleLabel(roleType, sexo)
          : clean(row[columns.role]),
      area: kind === "sedipranos" ? fullArea(row[columns.area]) : "",
      source: "excel",
      row: index + 1,
    });
  }
  if (!result.length)
    throw new Error("Agrega al menos un participante al Excel.");
  const errors = validateParticipants(result, kind);
  if (errors.length) throw new Error(errors.slice(0, 5).join(" "));
  return result;
}

export function validateParticipants(
  records,
  kind,
  { requireDirector = true } = {},
) {
  const errors = [];
  if (!records.length) errors.push("Selecciona al menos un participante.");
  if (records.length > MAX_PARTICIPANTS)
    errors.push(`El máximo es ${MAX_PARTICIPANTS} participantes por sesión.`);
  if (
    kind === "sedipranos" &&
    records.filter((record) => record.roleType === "director").length > 7
  )
    errors.push(
      "Selecciona como máximo siete personas para la dirección del proyecto: junto con presidencia, el certificado admite hasta ocho firmantes.",
    );
  const seenMemberIds = new Set();
  const seenNames = new Map();
  for (const [index, record] of records.entries()) {
    const label = record.row
      ? `Fila ${record.row}`
      : `Participante ${index + 1}`;
    if (!clean(record.name) || clean(record.name).length > 180)
      errors.push(`${label}: ingresa un nombre de hasta 180 caracteres.`);
    if (!clean(record.role) || clean(record.role).length > 120)
      errors.push(`${label}: completa el rol (máximo 120 caracteres).`);
    if (kind === "sedipranos") {
      if (!Object.hasOwn(ROLE_TYPES, record.roleType))
        errors.push(`${label}: el rol de sediprano no es válido.`);
      if (!["MASCULINO", "FEMENINO"].includes(record.sexo))
        errors.push(`${label}: elige el tratamiento para escribir su cargo.`);
      if (
        ["coordinator", "advisor"].includes(record.roleType) &&
        !clean(record.area)
      )
        errors.push(`${label}: completa el área.`);
      const memberId = record.memberId ? String(record.memberId) : "";
      const nameKey = clean(record.name)
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLocaleLowerCase("es-PE")
        .replace(/[^\p{L}\p{N}]/gu, "");
      const priorNameIds = seenNames.get(nameKey);
      // Two distinct directory IDs may be genuine namesakes. An Excel row
      // has no member ID, so matching its name to any selected record is the
      // only way to stop the same person receiving a second project role.
      const duplicateId = memberId && seenMemberIds.has(memberId);
      const duplicateName =
        nameKey && priorNameIds && (!memberId || priorNameIds.has(""));
      if (duplicateId || duplicateName)
        errors.push(
          `${label}: ${record.name} ya está seleccionado. Una persona solo puede tener un rol en este lote.`,
        );
      if (memberId) seenMemberIds.add(memberId);
      if (nameKey) {
        if (!seenNames.has(nameKey)) seenNames.set(nameKey, new Set());
        seenNames.get(nameKey).add(memberId);
      }
    }
  }
  if (
    kind === "sedipranos" &&
    requireDirector &&
    !records.some((record) => record.roleType === "director")
  )
    errors.push(
      "Selecciona al menos una persona para la dirección del proyecto.",
    );
  return errors;
}

export function bodyTemplateErrors(text) {
  const tokens = [...String(text).matchAll(/\{([^{}]+)\}/g)].map(
    (match) => match[1],
  );
  const unknown = tokens.filter(
    (token) => !["nombre", "rol", "area", "proyecto"].includes(token),
  );
  const errors = [];
  if (!clean(text)) errors.push("Escribe el texto del certificado.");
  if (String(text).length > 2000)
    errors.push("El texto admite hasta 2000 caracteres.");
  if (unknown.length)
    errors.push(
      `Variables no reconocidas: ${[...new Set(unknown)].join(", ")}.`,
    );
  if (!tokens.includes("rol") || !tokens.includes("proyecto"))
    errors.push("Incluye {rol} y {proyecto} en el texto.");
  return errors;
}

export function buildBodySegments(
  participant,
  project,
  kind,
  externalText = EXTERNAL_BODY,
) {
  const institution =
    " organizado por la Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo.";
  const template =
    kind === "externos"
      ? externalText
      : participant.roleType === "director"
        ? `Por su destacada participación como {rol} de “{proyecto}”${institution}`
        : `Por su destacada participación como {rol} del área de {area} del proyecto “{proyecto}”${institution}`;
  const values = {
    nombre: titleCase(participant.name),
    rol: clean(participant.role),
    area: fullArea(participant.area),
    proyecto: clean(project),
  };
  return template
    .split(/(\{(?:nombre|rol|area|proyecto)\})/g)
    .filter(Boolean)
    .map((text) => {
      const token = text.match(/^\{(nombre|rol|area|proyecto)\}$/)?.[1];
      return { text: token ? values[token] : text, bold: Boolean(token) };
    });
}

export function institutionCandidates(members, cargo, year, area = "") {
  return members.filter(
    (member) =>
      member.activo !== false &&
      member.account?.active !== false &&
      canonical(member.area) === "directiva" &&
      member.cargoDirectiva === cargo &&
      Number(member.periodoDirectiva) === Number(year) &&
      (!area || canonical(member.areaDirectiva) === canonical(area)),
  );
}

export function officialSigner(member, office) {
  if (!member) return null;
  const female = member.sexo === "FEMENINO";
  const knownTreatment = ["MASCULINO", "FEMENINO"].includes(member.sexo);
  return {
    id: `member-${member._id}`,
    memberId: String(member._id),
    name: titleCase(`${member.nombres || ""} ${member.apellidos || ""}`),
    title: !knownTreatment
      ? ""
      : office === "president"
        ? `${female ? "Presidenta" : "Presidente"} de SEDIPRO UNT`
        : `${female ? "Directora" : "Director"} de Project Management Office`,
    sexo: member.sexo,
    office,
  };
}

export function signersForParticipant(
  participant,
  kind,
  officials,
  participants,
  externalSigners = [],
) {
  if (kind === "externos") return externalSigners;
  const signers =
    participant.roleType === "director"
      ? [officials.president, officials.pmo]
      : [
          officials.president,
          ...participants
            .filter((record) => record.roleType === "director")
            .map((record) => ({
              id: record.id,
              name: titleCase(record.name),
              title: roleLabel("director", record.sexo),
              sexo: record.sexo,
            })),
        ];
  return signers
    .filter(Boolean)
    .filter(
      (signer, index, list) =>
        list.findIndex((item) => item.id === signer.id) === index,
    );
}

export function exportNames(records, extension) {
  const used = new Set();
  return records.map((record) => {
    let name =
      titleCase(record.name)
        .normalize("NFC")
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
        .slice(0, 140)
        .replace(/[. ]+$/g, "") || "Participante";
    // Windows cannot extract device names, even with a PDF/PNG extension.
    if (/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(name))
      name = `Certificado ${name}`;
    let filename = `${name}.${extension}`;
    let count = 2;
    while (used.has(filename.toLocaleLowerCase("es-PE")))
      filename = `${name} (${count++}).${extension}`;
    used.add(filename.toLocaleLowerCase("es-PE"));
    return filename;
  });
}
