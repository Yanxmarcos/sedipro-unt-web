import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Evento from "@/models/Evento";
import InscripcionEvento from "@/models/InscripcionEvento";
import AsistenciaEvento from "@/models/AsistenciaEvento";
import { requireEventManager } from "@/lib/eventAuth";

export async function GET(request, { params }) {
  const auth = await requireEventManager();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectToDatabase();
  const { id } = await params;
  const [event, registrations, attendances] = await Promise.all([
    Evento.findById(id).lean(),
    InscripcionEvento.countDocuments({ eventoId: id, estado: "inscrito" }),
    AsistenciaEvento.countDocuments({ eventoId: id }),
  ]);
  if (!event)
    return NextResponse.json(
      { error: "Evento no encontrado" },
      { status: 404 },
    );
  return NextResponse.json({
    data: {
      ...event,
      totalInscripciones: registrations,
      totalAsistencias: attendances,
    },
  });
}

export async function PATCH(request, { params }) {
  const auth = await requireEventManager();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectToDatabase();
  const { id } = await params;
  const body = await request.json();
  const allowed = [
    "titulo",
    "descripcion",
    "fechaInicio",
    "fechaFin",
    "lugar",
    "cupo",
    "estado",
    "inscripcionAbierta",
    "camposPersonalizados",
  ];
  const update = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key)),
  );
  if (update.fechaInicio) update.fechaInicio = new Date(update.fechaInicio);
  if (update.fechaFin) update.fechaFin = new Date(update.fechaFin);
  if (update.cupo !== undefined)
    update.cupo = update.cupo ? Number(update.cupo) : null;
  const event = await Evento.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!event)
    return NextResponse.json(
      { error: "Evento no encontrado" },
      { status: 404 },
    );
  return NextResponse.json({ data: event });
}

export async function DELETE(request, { params }) {
  const auth = await requireEventManager();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectToDatabase();
  const { id } = await params;
  const registrations = await InscripcionEvento.countDocuments({
    eventoId: id,
  });
  if (registrations)
    return NextResponse.json(
      {
        error:
          "No puedes eliminar un evento con inscripciones. Ciérralo o finalízalo.",
      },
      { status: 409 },
    );
  const event = await Evento.findByIdAndDelete(id);
  if (!event)
    return NextResponse.json(
      { error: "Evento no encontrado" },
      { status: 404 },
    );
  return NextResponse.json({ success: true });
}
