// src/app/api/sedinvita/turnos/postulantes/route.js
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
        const fase     = searchParams.get('fase') || 'fase2';
        const filtro   = searchParams.get('filtro') || 'todos'; // todos | con_turno | sin_turno
        const busqueda = searchParams.get('busqueda') || '';

        const edicionActiva = await SedinvitaEdicion.findOne({ activa: true }).lean();
        if (!edicionActiva) {
            return NextResponse.json({ success: false, error: 'No hay una edición activa' }, { status: 404 });
        }

        const edicionId = edicionActiva._id;

        // ── Fuente de verdad histórica ──────────────────────────────────────
        // SedinvitaGrupo guarda qué postulantes estuvieron en qué turno y fase.
        // Esto no cambia cuando el postulante avanza de fase, a diferencia de
        // postulante.turnoId y postulante.faseActual que son campos operativos.
        const gruposDeFase = await SedinvitaGrupo.find({ edicionId, fase }).lean();

        // Mapa: postulanteId → { turnoId, grupoId } para esta fase
        const postulanteEnGrupo = new Map(); // postulanteId.str → { turnoId, grupoId }
        for (const grupo of gruposDeFase) {
            for (const postulanteId of grupo.postulantes) {
                postulanteEnGrupo.set(postulanteId.toString(), {
                    turnoId: grupo.turnoId,
                    grupoId: grupo._id,
                });
            }
        }

        const conTurnoIds = [...postulanteEnGrupo.keys()]; // los que tuvieron turno en esta fase

        // ── Construir query de postulantes ─────────────────────────────────
        // NO filtramos por faseActual porque los que avanzaron ya cambiaron de fase.
        // Filtramos por edicionId y estadoGeneral únicamente.
        const match = {
            edicionId,
            estadoGeneral: 'habilitado',
        };

        if (filtro === 'con_turno') {
            // Solo los que aparecen en algún grupo de esta fase
            match._id = { $in: conTurnoIds.map(id => new (require('mongoose').Types.ObjectId)(id)) };
        } else if (filtro === 'sin_turno') {
            // Los que NO aparecen en ningún grupo de esta fase
            match._id = { $nin: conTurnoIds.map(id => new (require('mongoose').Types.ObjectId)(id)) };
        }
        // filtro === 'todos' → sin restricción de _id

        if (busqueda) {
            match.$or = [
                { codigoMatricula: { $regex: busqueda, $options: 'i' } },
                { nombres:         { $regex: busqueda, $options: 'i' } },
                { apellidos:       { $regex: busqueda, $options: 'i' } },
            ];
        }

        const postulantes = await SedinvitaPostulante.find(match)
            .sort({ apellidos: 1, nombres: 1 })
            .lean();

        // ── Cargar turnos referenciados ────────────────────────────────────
        const turnoIdsUnicos = [...new Set(
            gruposDeFase.map(g => g.turnoId.toString())
        )];

        const turnosArr = await SedinvitaTurno.find({
            _id: { $in: turnoIdsUnicos },
        }).lean();

        const turnosMap = new Map(turnosArr.map(t => [t._id.toString(), t]));

        // ── Formatear respuesta ────────────────────────────────────────────
        const postulantesFormateados = postulantes.map(p => {
            const enGrupo    = postulanteEnGrupo.get(p._id.toString());
            const tieneTurno = !!enGrupo;
            const turno      = tieneTurno ? turnosMap.get(enGrupo.turnoId.toString()) : null;

            return {
                _id:               p._id,
                codigoMatricula:   p.codigoMatricula,
                nombres:           p.nombres,
                apellidos:         p.apellidos,
                correoElectronico: p.correoElectronico,
                numeroCelular:     p.numeroCelular,
                faseActual:        p.faseActual,   // útil para saber si avanzó
                tieneTurno,
                tieneGrupo:        tieneTurno,
                turno: turno ? {
                    id:            turno._id,
                    nombre:        turno.nombre,
                    horarioInicio: turno.horarioInicio,
                    horarioFin:    turno.horarioFin,
                } : null,
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                edicion: {
                    id:     edicionActiva._id,
                    nombre: edicionActiva.nombre,
                    anio:   edicionActiva.anio,
                },
                fase,
                total:       postulantesFormateados.length,
                postulantes: postulantesFormateados,
            },
        });

    } catch (error) {
        console.error('Error al obtener postulantes:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}