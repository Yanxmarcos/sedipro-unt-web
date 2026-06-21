// src/app/api/sedinvita/grupos/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
import SedinvitaFacilitador from '@/models/sedinvita/SedinvitaFacilitador';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticate() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return null;
        return verifyToken(token);
    } catch (error) {
        console.error('Error en authenticate:', error);
        return null;
    }
}

export async function GET(request) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const turnoId = searchParams.get('turnoId');
        const edicionId = searchParams.get('edicionId');
        const fase = searchParams.get('fase') || 'fase2';
        const facilitadorId = searchParams.get('facilitadorId');

        await connectToDatabase();

        let edicionIdFinal = edicionId;
        if (!edicionIdFinal) {
            const edicionActiva = await SedinvitaEdicion.findOne({ activa: true }).lean();
            if (!edicionActiva) {
                return NextResponse.json({ error: 'No hay una edición activa configurada' }, { status: 404 });
            }
            edicionIdFinal = edicionActiva._id;
        }

        const filter = { edicionId: edicionIdFinal, fase };
        if (turnoId) filter.turnoId = turnoId;
        if (facilitadorId) filter.facilitadores = facilitadorId;

        const grupos = await SedinvitaGrupo.find(filter)
            .populate('facilitadores', 'nombres apellidos dni')
            .populate('turnoId', 'nombre horarioInicio horarioFin')
            .populate('postulantes', 'nombres apellidos codigoMatricula correoElectronico')
            .sort({ nombre: 1 })
            .lean();

        const gruposConConteo = grupos.map(grupo => ({
            ...grupo,
            totalPostulantes: grupo.postulantes?.length || 0,
        }));

        return NextResponse.json({
            success: true,
            total: grupos.length,
            data: gruposConConteo,
        });

    } catch (error) {
        console.error('Error al obtener grupos:', error);
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error.message,
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { edicionId, fase, turnoId, facilitadores, nombre, postulantes } = body;

        if (!edicionId || !turnoId || !facilitadores || facilitadores.length === 0) {
            return NextResponse.json({
                error: 'Edición, turno y al menos un facilitador son requeridos'
            }, { status: 400 });
        }

        await connectToDatabase();

        const turno = await SedinvitaTurno.findById(turnoId);
        if (!turno) {
            return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
        }

        const facilitadoresExistentes = await SedinvitaFacilitador.find({ _id: { $in: facilitadores } });
        if (facilitadoresExistentes.length !== facilitadores.length) {
            return NextResponse.json({ error: 'Alguno de los facilitadores seleccionados no existe' }, { status: 404 });
        }

        if (postulantes && postulantes.length > 0) {
            const postulantesExistentes = await SedinvitaPostulante.find({
                _id: { $in: postulantes },
                edicionId,
                faseActual: fase,
                estadoGeneral: 'habilitado',
            });

            if (postulantesExistentes.length !== postulantes.length) {
                return NextResponse.json({
                    error: 'Algunos postulantes no existen o no están habilitados'
                }, { status: 400 });
            }
        }

        let nombreFinal = nombre;
        if (!nombreFinal) {
            const count = await SedinvitaGrupo.countDocuments({ edicionId, fase, turnoId });
            nombreFinal = `Grupo ${String.fromCharCode(65 + count)}`;
        }

        const grupo = await SedinvitaGrupo.create({
            edicionId,
            fase: fase || 'fase2',
            turnoId,
            facilitadores,
            nombre: nombreFinal.trim(),
            postulantes: postulantes || [],
        });

        if (postulantes && postulantes.length > 0) {
            await SedinvitaPostulante.updateMany(
                { _id: { $in: postulantes } },
                { grupoId: grupo._id, estadoOperativo: 'grupo_asignado' }
            );
        }

        const grupoPopulado = await SedinvitaGrupo.findById(grupo._id)
            .populate('facilitadores', 'nombres apellidos dni')
            .populate('turnoId', 'nombre horarioInicio horarioFin')
            .populate('postulantes', 'nombres apellidos codigoMatricula correoElectronico');

        return NextResponse.json({ success: true, data: grupoPopulado }, { status: 201 });

    } catch (error) {
        console.error('Error al crear grupo:', error);
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error.message,
        }, { status: 500 });
    }
}