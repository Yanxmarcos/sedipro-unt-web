import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Evento from "@/models/Evento";

export async function GET(request, { params }) {
  await connectToDatabase();
  const { slug } = await params;
  const event = await Evento.findOne({ slug, estado: "publicado" }).lean();
  if (!event)
    return NextResponse.json(
      { error: "Evento no disponible" },
      { status: 404 },
    );
  return NextResponse.json({
    data: {
      _id: event._id,
      titulo: event.titulo,
      slug: event.slug,
      descripcion: event.descripcion,
      fechaInicio: event.fechaInicio,
      fechaFin: event.fechaFin,
      lugar: event.lugar,
      cupo: event.cupo,
      inscritos: event.inscritos,
      inscripcionAbierta: event.inscripcionAbierta,
      camposPersonalizados: event.camposPersonalizados,
    },
  });
}
