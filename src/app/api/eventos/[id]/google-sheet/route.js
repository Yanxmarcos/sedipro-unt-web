import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Evento from "@/models/Evento";
import InscripcionEvento from "@/models/InscripcionEvento";
import AsistenciaEvento from "@/models/AsistenciaEvento";
import {
  createEventSheet,
  appendRegistrationToSheet,
  appendAttendanceToSheet,
} from "@/lib/googleSheets";
import { requireEventManager } from "@/lib/eventAuth";

export async function POST(request, { params }) {
  const auth = await requireEventManager();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    await connectToDatabase();
    const { id } = await params;
    const event = await Evento.findById(id);
    if (!event)
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 },
      );
    if (event.googleSheetUrl)
      return NextResponse.json({
        data: { url: event.googleSheetUrl, id: event.googleSheetId },
        alreadyExists: true,
      });
    const sheet = await createEventSheet(event);
    event.googleSheetId = sheet.id;
    event.googleSheetUrl = sheet.url;
    await event.save();
    // Si la hoja se vincula después de abrir el formulario o importar respuestas,
    // se replica todo el historial para que no empiece vacía.
    const registrations = await InscripcionEvento.find({ eventoId: event._id })
      .populate("personaId")
      .lean();
    const attendance = await AsistenciaEvento.find({
      eventoId: event._id,
    }).lean();
    const attendanceByRegistration = new Map(
      attendance.map((a) => [a.inscripcionId.toString(), a]),
    );
    for (const registration of registrations) {
      const person = registration.personaId;
      if (!person) continue;
      const row = await appendRegistrationToSheet(event, registration, person);
      if (row)
        await InscripcionEvento.findByIdAndUpdate(registration._id, {
          googleSheetRow: row,
        });
      const record = attendanceByRegistration.get(registration._id.toString());
      if (record)
        await appendAttendanceToSheet(event, registration, person, record);
    }
    return NextResponse.json({ data: sheet }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudo crear la hoja" },
      { status: 500 },
    );
  }
}
