// src/app/api/sedinvita/turnos/postulantes/route.js
// VERSIÓN MEJORADA: La verdad viene de las relaciones (turnoId, grupoId),
// no de estadoOperativo

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
        // La VERDAD viene de turnoId, no de estadoOperativo
        const match = {
            edicionId: edicionActiva._id,
            estadoGeneral: 'habilitado',
            faseActual: fase
        };

        if (filtro === 'con_turno') {
            // Un postulante "tiene turno" si turnoId está asignado
            match.turnoId = { $ne: null };
        } else if (filtro === 'sin_turno') {
            // Un postulante "sin turno" si turnoId es null
            match.turnoId = null;
        }
        // Si filtro === 'todos', no se agrega restricción de turnoId

        // Búsqueda por texto
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

        // Obtener información de turnos para los postulantes que tienen turno
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
        // La verdad: si turnoId !== null, tiene turno
        const postulantesFormateados = postulantes.map(p => {
            const tieneTurno = p.turnoId !== null;  // ← VERDAD SIMPLE
            const turno = tieneTurno ? turnosMap.get(p.turnoId.toString()) : null;

            return {
                _id: p._id,
                codigoMatricula: p.codigoMatricula,
                nombres: p.nombres,
                apellidos: p.apellidos,
                correoElectronico: p.correoElectronico,
                numeroCelular: p.numeroCelular,
                tieneTurno,           // ← Deducible de turnoId
                tieneGrupo: p.grupoId !== null,  // ← Bonus: también deducible
                turno: turno ? {
                    id: turno._id,
                    nombre: turno.nombre,
                    horarioInicio: turno.horarioInicio,
                    horarioFin: turno.horarioFin
                } : null,
                // No incluir estadoOperativo - es redundante
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