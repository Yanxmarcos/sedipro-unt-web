import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import InscripcionEvento from "@/models/InscripcionEvento";
import PersonaExterna from "@/models/PersonaExterna";
import AsistenciaEvento from "@/models/AsistenciaEvento";
import { requireEventManager } from "@/lib/eventAuth";

export async function GET(request, { params }) {
  const auth = await requireEventManager();
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  await connectToDatabase();
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const registrations = await InscripcionEvento.find({ eventoId: id })
    .sort({ createdAt: -1 })
    .populate("personaId", "nombres apellidos correo dni celular organizacion")
    .lean();
  const attendance = await AsistenciaEvento.find({ eventoId: id }).lean();
  const attendanceMap = new Map(
    attendance.map((x) => [x.inscripcionId.toString(), x]),
  );
  const data = registrations
    .map((r) => ({
      ...r,
      asistencia: attendanceMap.get(r._id.toString()) || null,
    }))
    .filter(
      (r) =>
        !q ||
        [
          r.codigo,
          r.personaId?.nombres,
          r.personaId?.apellidos,
          r.personaId?.correo,
          r.personaId?.dni,
        ].some((x) =>
          String(x || "")
            .toLowerCase()
            .includes(q.toLowerCase()),
        ),
    );
  return NextResponse.json({ data });
}
