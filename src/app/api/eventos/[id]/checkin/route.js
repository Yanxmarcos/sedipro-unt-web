import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import InscripcionEvento from "@/models/InscripcionEvento";
import PersonaExterna from "@/models/PersonaExterna";
import AsistenciaEvento from "@/models/AsistenciaEvento";
import Evento from "@/models/Evento";
import { requireEventManager } from "@/lib/eventAuth";
import { eventManagerName } from "@/lib/eventos";
import { appendAttendanceToSheet } from "@/lib/googleSheets";

export async function POST(request, { params }) {
  const auth = await requireEventManager();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const filter = body.token
      ? { eventoId: id, qrToken: body.token }
      : { _id: body.inscripcionId, eventoId: id };
    const registration =
      await InscripcionEvento.findOne(filter).select("+qrToken");
    if (!registration || registration.estado !== "inscrito")
      return NextResponse.json(
        { error: "No se encontró una inscripción activa para este evento" },
        { status: 404 },
      );
    const previous = await AsistenciaEvento.findOne({
      inscripcionId: registration._id,
    });
    const person = await PersonaExterna.findById(registration.personaId).lean();
    if (previous)
      return NextResponse.json({
        alreadyRegistered: true,
        data: {
          attendance: previous,
          person,
          registration: { _id: registration._id, codigo: registration.codigo },
        },
      });
    const attendance = await AsistenciaEvento.create({
      eventoId: id,
      inscripcionId: registration._id,
      estado: body.estado === "tardanza" ? "tardanza" : "presente",
      metodo: body.token ? "qr" : "manual",
      registradoPor: eventManagerName(auth.user),
    });
    const event = await Evento.findById(id).lean();
    try {
      await appendAttendanceToSheet(event, registration, person, attendance);
    } catch (error) {
      console.warn("[Google Sheets asistencia]", error.message);
    }
    return NextResponse.json({
      success: true,
      data: {
        attendance,
        person,
        registration: { _id: registration._id, codigo: registration.codigo },
      },
    });
  } catch (error) {
    console.error("[checkin]", error);
    return NextResponse.json(
      { error: "No se pudo registrar la asistencia" },
      { status: 500 },
    );
  }
}
