import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaAsistencia from '@/models/sedinvita/SedinvitaAsistencia';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
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
        const turnoId = searchParams.get('turnoId');
        if (!turnoId) {
            return NextResponse.json({ error: 'turnoId es requerido' }, { status: 400 });
        }

        // SedinvitaGrupo es la fuente de verdad de quién estaba en cada turno.
        // turnoId en el postulante es un campo operativo que se limpia al avanzar fase,
        // así que no es confiable para datos históricos.
        const grupos = await SedinvitaGrupo.find({ turnoId }).lean();

        if (grupos.length === 0) {
            return NextResponse.json({
                success: true,
                total: 0,
                data: [],
                resumen: { presentes: 0, tardanzas: 0, ausentes: 0, total: 0 },
            });
        }

        // Recolectar todos los postulanteIds únicos de todos los grupos del turno
        const postulanteIdSet = new Set(
            grupos.flatMap(g => g.postulantes.map(id => id.toString()))
        );
        const postulanteIds = [...postulanteIdSet];

        const [postulantes, asistencias] = await Promise.all([
            SedinvitaPostulante.find({
                _id: { $in: postulanteIds },
                estadoGeneral: 'habilitado',
            }).sort({ apellidos: 1, nombres: 1 }).lean(),
            SedinvitaAsistencia.find({ turnoId }).lean(),
        ]);

        const asistenciaPorPostulante = new Map(
            asistencias.map(a => [a.postulanteId.toString(), a])
        );

        const data = postulantes.map(p => {
            const a = asistenciaPorPostulante.get(p._id.toString());
            return {
                ...p,
                asistencia: {
                    estado: a?.estado || 'ausente',
                    hora: a?.hora || null,
                    registradoPor: a?.registradoPor || null,
                },
            };
        });

        const presentes  = data.filter(p => p.asistencia.estado === 'presente').length;
        const tardanzas  = data.filter(p => p.asistencia.estado === 'tardanza').length;
        const ausentes   = data.filter(p => p.asistencia.estado === 'ausente').length;

        return NextResponse.json({
            success: true,
            total: data.length,
            data,
            resumen: { presentes, tardanzas, ausentes, total: data.length },
        });

    } catch (error) {
        console.error('Error al obtener asistencia:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// POST sin cambios — está bien como está
export async function POST(request) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { postulanteId, turnoId, estado } = body;

        if (!postulanteId || !turnoId || !['presente', 'tardanza', 'ausente'].includes(estado)) {
            return NextResponse.json({ error: 'postulanteId, turnoId y estado son requeridos' }, { status: 400 });
        }

        await connectToDatabase();

        const postulante = await SedinvitaPostulante.findById(postulanteId);
        if (!postulante) return NextResponse.json({ error: 'Postulante no encontrado' }, { status: 404 });

        const turno = await SedinvitaTurno.findById(turnoId).lean();
        if (!turno) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });

        let asistencia = await SedinvitaAsistencia.findOne({ postulanteId, turnoId });

        if (asistencia) {
            asistencia.estado = estado;
            asistencia.registradoPor = `${payload.nombres || ''} ${payload.apellidos || ''}`.trim() || 'Directiva';
            asistencia.hora = new Date();
            asistencia.registroManual = true;
            await asistencia.save();
        } else {
            asistencia = await SedinvitaAsistencia.create({
                edicionId: postulante.edicionId,
                fase: turno.fase,
                turnoId,
                postulanteId,
                estado,
                registradoPor: `${payload.nombres || ''} ${payload.apellidos || ''}`.trim() || 'Directiva',
                hora: new Date(),
                registroManual: true,
            });
        }

        postulante.estadoOperativo = estado === 'presente' ? 'asistio' : 'turno_elegido';
        await postulante.save();

        return NextResponse.json({ success: true, data: asistencia });

    } catch (error) {
        console.error('Error al marcar asistencia:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}