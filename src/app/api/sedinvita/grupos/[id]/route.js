// src/app/api/sedinvita/grupos/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
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

export async function PATCH(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { nombre, facilitadores, postulantes } = body;

        await connectToDatabase();

        const grupo = await SedinvitaGrupo.findById(id);
        if (!grupo) {
            return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
        }

        if (nombre !== undefined) grupo.nombre = nombre.trim();

        if (facilitadores !== undefined) {
            if (facilitadores.length === 0) {
                return NextResponse.json({ error: 'Debe haber al menos un facilitador' }, { status: 400 });
            }
            grupo.facilitadores = facilitadores;
        }

        if (postulantes !== undefined) {
            // FIX: Desasignar postulantes del grupo anterior SIN resetear turnoId
            // El turnoId es crítico para asistencia y debe permanecer intacto
            await SedinvitaPostulante.updateMany(
                { grupoId: id },
                { $unset: { grupoId: '' } }  // Solo desasigna grupo, preserva turnoId
            );

            grupo.postulantes = postulantes;

            if (postulantes.length > 0) {
                await SedinvitaPostulante.updateMany(
                    { _id: { $in: postulantes } },
                    { grupoId: id, estadoOperativo: 'grupo_asignado' }
                );
            }
        }

        await grupo.save();

        const grupoPopulado = await SedinvitaGrupo.findById(grupo._id)
            .populate('facilitadores', 'nombres apellidos dni')
            .populate('turnoId', 'nombre horarioInicio horarioFin')
            .populate('postulantes', 'nombres apellidos codigoMatricula correoElectronico');

        return NextResponse.json({ success: true, data: grupoPopulado });

    } catch (error) {
        console.error('Error al actualizar grupo:', error);
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error.message,
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;

        await connectToDatabase();

        const grupo = await SedinvitaGrupo.findById(id);
        if (!grupo) {
            return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
        }

        if (grupo.postulantes && grupo.postulantes.length > 0) {
            // Desasignar grupo pero preservar turnoId
            await SedinvitaPostulante.updateMany(
                { grupoId: id },
                { $unset: { grupoId: '' }, estadoOperativo: 'turno_elegido' }
            );
        }

        await SedinvitaGrupo.deleteOne({ _id: id });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error al eliminar grupo:', error);
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error.message,
        }, { status: 500 });
    }
}