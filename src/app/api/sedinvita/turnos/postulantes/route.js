// src/app/api/sedinvita/turnos/postulantes/route.js
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
        const filtro = searchParams.get('filtro') || 'todos'; // todos, con_turno, sin_turno
        const busqueda = searchParams.get('busqueda') || '';

        // Obtener edición activa
        const edicionActiva = await SedinvitaEdicion.findOne({ activa: true }).lean();
        if (!edicionActiva) {
            return NextResponse.json(
                { success: false, error: 'No hay una edición activa' },
                { status: 404 }
            );
        }

        // Construir filtro
        const match = {
            edicionId: edicionActiva._id,
            estadoGeneral: 'habilitado',
            faseActual: fase
        };

        if (filtro === 'con_turno') {
            match.estadoOperativo = 'turno_elegido';
            match.turnoId = { $ne: null };
        } else if (filtro === 'sin_turno') {
            match.$or = [
                { estadoOperativo: { $ne: 'turno_elegido' } },
                { turnoId: null }
            ];
        }

        // Búsqueda
        if (busqueda) {
            match.$or = [
                { codigoMatricula: { $regex: busqueda, $options: 'i' } },
                { nombres: { $regex: busqueda, $options: 'i' } },
                { apellidos: { $regex: busqueda, $options: 'i' } }
            ];
        }

        // Obtener postulantes
        const postulantes = await SedinvitaPostulante.find(match)
            .sort({ apellidos: 1, nombres: 1 })
            .lean();

        // Obtener información de turnos
        const turnosIds = postulantes
            .filter(p => p.turnoId)
            .map(p => p.turnoId);

        const turnosMap = new Map();
        if (turnosIds.length > 0) {
            const turnos = await SedinvitaTurno.find({
                _id: { $in: turnosIds }
            }).lean();

            turnos.forEach(t => {
                turnosMap.set(t._id.toString(), t);
            });
        }

        // Formatear respuesta
        const postulantesFormateados = postulantes.map(p => {
            const tieneTurno = p.estadoOperativo === 'turno_elegido' && p.turnoId;
            const turno = tieneTurno ? turnosMap.get(p.turnoId.toString()) : null;

            return {
                codigoMatricula: p.codigoMatricula,
                nombres: p.nombres,
                apellidos: p.apellidos,
                correoElectronico: p.correoElectronico,
                numeroCelular: p.numeroCelular,
                tieneTurno,
                turno: turno ? {
                    id: turno._id,
                    nombre: turno.nombre,
                    horarioInicio: turno.horarioInicio,
                    horarioFin: turno.horarioFin
                } : null,
                estadoOperativo: p.estadoOperativo
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                edicion: {
                    id: edicionActiva._id,
                    nombre: edicionActiva.nombre,
                    anio: edicionActiva.anio
                },
                fase,
                total: postulantesFormateados.length,
                postulantes: postulantesFormateados
            }
        });

    } catch (error) {
        console.error('Error al obtener postulantes:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}