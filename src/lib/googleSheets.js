import { google } from "googleapis";

function sheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  if (!email || !key) return null;
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });
  return google.sheets({ version: "v4", auth });
}

export async function createEventSheet(event) {
  const sheets = sheetsClient();
  if (!sheets)
    throw new Error(
      "Google Sheets no está configurado. Agrega GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
    );
  const created = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `SEDIPRO - ${event.titulo}` },
      sheets: [
        { properties: { title: "Inscritos" } },
        { properties: { title: "Asistencia" } },
      ],
    },
  });
  const spreadsheetId = created.data.spreadsheetId;
  const headers = [
    "Código",
    "Nombres",
    "Apellidos",
    "Correo",
    "DNI",
    "Celular",
    "Organización",
    "Estado",
    "Fuente",
    "Fecha de inscripción",
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Inscritos!A1:J1",
    valueInputOption: "RAW",
    requestBody: { values: [headers] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Asistencia!A1:G1",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          "Código",
          "Nombres",
          "Correo",
          "Estado",
          "Hora",
          "Método",
          "Registrado por",
        ],
      ],
    },
  });
  return {
    id: spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}

export async function appendRegistrationToSheet(event, registration, person) {
  if (!event.googleSheetId) return null;
  const sheets = sheetsClient();
  if (!sheets) return null;
  const result = await sheets.spreadsheets.values.append({
    spreadsheetId: event.googleSheetId,
    range: "Inscritos!A:J",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          registration.codigo,
          person.nombres,
          person.apellidos,
          person.correo,
          person.dni || "",
          person.celular || "",
          person.organizacion || "",
          registration.estado,
          registration.fuente,
          new Date(registration.createdAt).toLocaleString("es-PE"),
        ],
      ],
    },
  });
  const updatedRange = result.data.updates?.updatedRange || "";
  const row = Number(updatedRange.match(/![A-Z]+(\d+)/)?.[1]);
  return Number.isFinite(row) ? row : null;
}

export async function appendAttendanceToSheet(
  event,
  registration,
  person,
  attendance,
) {
  if (!event.googleSheetId) return;
  const sheets = sheetsClient();
  if (!sheets) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId: event.googleSheetId,
    range: "Asistencia!A:G",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          registration.codigo,
          `${person.nombres} ${person.apellidos}`,
          person.correo,
          attendance.estado,
          new Date(attendance.hora).toLocaleString("es-PE"),
          attendance.metodo,
          attendance.registradoPor,
        ],
      ],
    },
  });
}
