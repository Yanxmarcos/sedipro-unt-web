import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectToDatabase } from "@/lib/mongodb";
import Evento from "@/models/Evento";
import PersonaExterna from "@/models/PersonaExterna";
import InscripcionEvento from "@/models/InscripcionEvento";
import { requireEventManager } from "@/lib/eventAuth";
import { cleanDni, cleanEmail, qrToken, registrationCode } from "@/lib/eventos";
import { appendRegistrationToSheet } from "@/lib/googleSheets";

const aliases = {
  nombres: ["nombres", "nombre"],
  apellidos: ["apellidos", "apellido"],
  correo: [
    "correo",
    "correo electrónico",
    "correo electronico",
    "email",
    "e-mail",
  ],
  dni: ["dni", "documento", "número de documento", "numero de documento"],
  celular: [
    "celular",
    "teléfono",
    "telefono",
    "número de celular",
    "numero de celular",
  ],
  organizacion: [
    "organización",
    "organizacion",
    "universidad",
    "institución",
    "institucion",
    "empresa",
  ],
};
function value(row, names) {
  const key = Object.keys(row).find((k) =>
    names.includes(k.trim().toLowerCase()),
  );
  return key ? String(row[key] ?? "").trim() : "";
}

export async function POST(request, { params }) {
  const auth = await requireEventManager();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await params;
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function")
      return NextResponse.json(
        { error: "Selecciona un archivo CSV o Excel" },
        { status: 400 },
      );
    const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), {
      type: "buffer",
    });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (!rows.length)
      return NextResponse.json(
        { error: "El archivo no contiene filas" },
        { status: 400 },
      );
    await connectToDatabase();
    const event = await Evento.findById(id);
    if (!event)
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 },
      );
    const result = { created: 0, duplicates: 0, errors: [] };
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const nombres = value(row, aliases.nombres);
      const apellidos = value(row, aliases.apellidos);
      const correo = cleanEmail(value(row, aliases.correo));
      const dni = cleanDni(value(row, aliases.dni));
      if (!nombres || !apellidos || !/^\S+@\S+\.\S+$/.test(correo)) {
        result.errors.push({
          row: index + 2,
          error: "Faltan nombres, apellidos o un correo válido",
        });
        continue;
      }
      try {
        let person =
          (dni && (await PersonaExterna.findOne({ dni }))) ||
          (await PersonaExterna.findOne({ correo }));
        if (!person)
          person = await PersonaExterna.create({
            nombres,
            apellidos,
            correo,
            dni,
            celular: value(row, aliases.celular),
            organizacion: value(row, aliases.organizacion),
          });
        else {
          person.nombres = nombres;
          person.apellidos = apellidos;
          if (dni) person.dni = dni;
          if (value(row, aliases.celular))
            person.celular = value(row, aliases.celular);
          if (value(row, aliases.organizacion))
            person.organizacion = value(row, aliases.organizacion);
          await person.save();
        }
        if (
          await InscripcionEvento.exists({
            eventoId: id,
            personaId: person._id,
          })
        ) {
          result.duplicates++;
          continue;
        }
        if (event.cupo && event.inscritos >= event.cupo) {
          result.errors.push({
            row: index + 2,
            error: "Cupo del evento alcanzado",
          });
          continue;
        }
        const registration = await InscripcionEvento.create({
          eventoId: id,
          personaId: person._id,
          codigo: registrationCode(),
          qrToken: qrToken(),
          fuente: "google_forms_import",
          respuestas: Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k, String(v ?? "")]),
          ),
        });
        event.inscritos += 1;
        result.created++;
        try {
          const sheetRow = await appendRegistrationToSheet(
            event,
            registration,
            person,
          );
          if (sheetRow) {
            registration.googleSheetRow = sheetRow;
            await registration.save();
          }
        } catch (error) {
          console.warn("[Sheets import]", error.message);
        }
      } catch (error) {
        result.errors.push({
          row: index + 2,
          error:
            error.code === 11000
              ? "Registro duplicado"
              : "No se pudo importar la fila",
        });
      }
    }
    await event.save();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[import event]", error);
    return NextResponse.json(
      { error: "No se pudo procesar el archivo" },
      { status: 500 },
    );
  }
}
