// src/app/api/sedinvita/turnos/estadisticas/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
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
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const fase = searchParams.get('fase') || 'fase2';
        const edicionId = searchParams.get('edicionId');

        // Si no se pasa edicionId, buscar la activa
        let edicionActiva;
        if (edicionId) {
            edicionActiva = await SedinvitaEdicion.findById(edicionId).lean();
        } else {
            edicionActiva = await SedinvitaEdicion.findOne({ activa: true }).lean();
        }

        if (!edicionActiva) {
            return NextResponse.json(
                { success: false, error: 'No hay una edición activa' },
                { status: 404 }
            );
        }

        // Total postulantes habilitados en esta fase
        const totalPostulantes = await SedinvitaPostulante.countDocuments({
            edicionId: edicionActiva._id,
            estadoGeneral: 'habilitado',
            faseActual: fase
        });

        // Postulantes con turno elegido
        const conTurno = await SedinvitaPostulante.countDocuments({
            edicionId: edicionActiva._id,
            estadoGeneral: 'habilitado',
            faseActual: fase,
            // estadoOperativo: 'turno_elegido',
            turnoId: { $ne: null }
        });

        const sinTurno = totalPostulantes - conTurno;

        // Turnos de la fase
        const turnos = await SedinvitaTurno.find({
            edicionId: edicionActiva._id,
            fase: fase
        })
        .sort({ horarioInicio: 1 })
        .lean();

        // Estadísticas por turno
        const turnosStats = turnos.map(t => ({
            id: t._id,
            nombre: t.nombre,
            horarioInicio: t.horarioInicio,
            inscritos: t.inscritos || 0,
            cupo: t.cupo || 0,
            estado: t.estado,
            disponible: (t.cupo || 0) - (t.inscritos || 0),
            porcentaje: t.cupo > 0 ? Math.round(((t.inscritos || 0) / t.cupo) * 100) : 0
        }));

        // Totales de cupos
        const totalCupos = turnosStats.reduce((sum, t) => sum + t.cupo, 0);
        const totalInscritos = turnosStats.reduce((sum, t) => sum + t.inscritos, 0);

        return NextResponse.json({
            success: true,
            data: {
                edicion: {
                    id: edicionActiva._id,
                    nombre: edicionActiva.nombre,
                    anio: edicionActiva.anio
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
                    porcentajeOcupacion: totalCupos > 0 ? Math.round((totalInscritos / totalCupos) * 100) : 0
                },
                turnos: turnosStats
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}