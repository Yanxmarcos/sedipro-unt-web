import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Evento from "@/models/Evento";
import InscripcionEvento from "@/models/InscripcionEvento";
import AsistenciaEvento from "@/models/AsistenciaEvento";
import { requireEventManager } from "@/lib/eventAuth";
import { slugify } from "@/lib/eventos";

export async function GET() {
  const auth = await requireEventManager();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectToDatabase();
  const events = await Evento.find({}).sort({ fechaInicio: -1 }).lean();
  const ids = events.map((e) => e._id);
  const [registrations, attendances] = await Promise.all([
    InscripcionEvento.aggregate([
      { $match: { eventoId: { $in: ids } } },
      { $group: { _id: "$eventoId", total: { $sum: 1 } } },
    ]),
    AsistenciaEvento.aggregate([
      { $match: { eventoId: { $in: ids } } },
      { $group: { _id: "$eventoId", total: { $sum: 1 } } },
    ]),
  ]);
  const count = new Map(registrations.map((x) => [x._id.toString(), x.total]));
  const attendance = new Map(
    attendances.map((x) => [x._id.toString(), x.total]),
  );
  return NextResponse.json({
    data: events.map((e) => ({
      ...e,
      totalInscripciones: count.get(e._id.toString()) || 0,
      totalAsistencias: attendance.get(e._id.toString()) || 0,
    })),
  });
}

export async function POST(request) {
  const auth = await requireEventManager();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await request.json();
    const titulo = body.titulo?.trim();
    if (!titulo || !body.fechaInicio)
      return NextResponse.json(
        { error: "Título y fecha de inicio son requeridos" },
        { status: 400 },
      );
    await connectToDatabase();
    const base = slugify(body.slug || titulo);
    if (!base)
      return NextResponse.json(
        { error: "El título no permite crear una URL válida" },
        { status: 400 },
      );
    let slug = base;
    let n = 2;
    while (await Evento.exists({ slug })) slug = `${base}-${n++}`;
    const camposPersonalizados = Array.isArray(body.camposPersonalizados)
      ? body.camposPersonalizados
          .filter((x) => x?.clave && x?.etiqueta)
          .map((x) => ({ ...x, clave: slugify(x.clave).replaceAll("-", "_") }))
      : [];
    const event = await Evento.create({
      titulo,
      slug,
      descripcion: body.descripcion?.trim() || "",
      fechaInicio: new Date(body.fechaInicio),
      fechaFin: body.fechaFin ? new Date(body.fechaFin) : null,
      lugar: body.lugar?.trim() || "",
      cupo: body.cupo ? Number(body.cupo) : null,
      estado: body.estado || "borrador",
      inscripcionAbierta: Boolean(body.inscripcionAbierta),
      camposPersonalizados,
      creadoPor: auth.user.id,
    });
    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    console.error("[POST eventos]", error);
    return NextResponse.json(
      {
        error:
          error.code === 11000
            ? "La URL del evento ya existe"
            : "No se pudo crear el evento",
      },
      { status: 500 },
    );
  }
}
