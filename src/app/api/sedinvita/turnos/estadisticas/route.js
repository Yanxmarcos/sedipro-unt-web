import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function GET(request) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const fase = searchParams.get('fase') || 'fase2';
        const edicionId = searchParams.get('edicionId');

        const edicionActiva = edicionId
            ? await SedinvitaEdicion.findById(edicionId).lean()
            : await SedinvitaEdicion.findOne({ activa: true }).lean();

        if (!edicionActiva) {
            return NextResponse.json({ success: false, error: 'No hay una edición activa' }, { status: 404 });
        }

        // Para fase2 (histórico): los postulantes que avanzaron ya tienen faseActual:'fase3',
        // así que no se puede filtrar por faseActual. SedinvitaGrupo es la fuente de verdad
        // histórica de quién participó en cada turno de cada fase.
        //
        // Para fase3 en adelante: igual, siempre usamos grupos como referencia.
        const gruposDeFase = await SedinvitaGrupo.find({
            edicionId: edicionActiva._id,
            fase,
        }).lean();

        // IDs únicos de postulantes que participaron en esta fase
        const postulanteIdSet = new Set(
            gruposDeFase.flatMap(g => g.postulantes.map(id => id.toString()))
        );
        const totalPostulantes = postulanteIdSet.size;

        // "Con turno" = todos los que están en grupos (tuvieron turno asignado)
        const conTurno = totalPostulantes;
        const sinTurno = 0; // Si están en el grupo, tenían turno. Los que no avanzaron no cuentan.

        // Turnos de la fase con sus contadores originales (no se tocaron)
        const turnos = await SedinvitaTurno.find({
            edicionId: edicionActiva._id,
            fase,
        }).sort({ horarioInicio: 1 }).lean();

        const turnosStats = turnos.map(t => ({
            id: t._id,
            nombre: t.nombre,
            horarioInicio: t.horarioInicio,
            inscritos: t.inscritos || 0,
            cupo: t.cupo || 0,
            estado: t.estado,
            disponible: (t.cupo || 0) - (t.inscritos || 0),
            porcentaje: t.cupo > 0 ? Math.round(((t.inscritos || 0) / t.cupo) * 100) : 0,
        }));

        const totalCupos     = turnosStats.reduce((sum, t) => sum + t.cupo, 0);
        const totalInscritos = turnosStats.reduce((sum, t) => sum + t.inscritos, 0);

        return NextResponse.json({
            success: true,
            data: {
                edicion: {
                    id: edicionActiva._id,
                    nombre: edicionActiva.nombre,
                    anio: edicionActiva.anio,
                },
                fase,
                resumen: {
                    totalPostulantes,
                    conTurno,
                    sinTurno,
                    porcentajeAvance: totalPostulantes > 0 ? Math.round((conTurno / totalPostulantes) * 100) : 0,
                    totalCupos,
                    totalInscritos,
                    cuposDisponibles: totalCupos - totalInscritos,
                    porcentajeOcupacion: totalCupos > 0 ? Math.round((totalInscritos / totalCupos) * 100) : 0,
                },
                turnos: turnosStats,
            },
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}