// src\app\api\sedinvita\ediciones\[id]\route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function PATCH(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { nombre, anio, estado, fechaInicio, fechaFin, activa, seleccionTurnosAbierta } = body;

        await connectToDatabase();

        const edicion = await SedinvitaEdicion.findById(id);
        if (!edicion) {
            return NextResponse.json({ error: 'Edición no encontrada' }, { status: 404 });
        }

        if (nombre !== undefined) edicion.nombre = nombre.trim();
        if (anio !== undefined) edicion.anio = anio;
        if (estado !== undefined) {
            // Validar que el estado sea válido
            const estadosValidos = ['planificacion', 'abierto', 'cerrado', 'finalizado'];
            if (estadosValidos.includes(estado)) {
                edicion.estado = estado;
            }
        }
        if (fechaInicio !== undefined) edicion.fechaInicio = fechaInicio || null;
        if (fechaFin !== undefined) edicion.fechaFin = fechaFin || null;
        if (seleccionTurnosAbierta !== undefined) edicion.seleccionTurnosAbierta = !!seleccionTurnosAbierta;

        // Solo puede haber una edición activa: si esta se marca como activa,
        // se desactivan todas las demás primero.
        if (activa === true && !edicion.activa) {
            await SedinvitaEdicion.updateMany({ _id: { $ne: id }, activa: true }, { activa: false });
            edicion.activa = true;
        } else if (activa === false) {
            edicion.activa = false;
        }

        await edicion.save();

        return NextResponse.json({ success: true, data: edicion });

    } catch (error) {
        console.error('Error al actualizar edición:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}