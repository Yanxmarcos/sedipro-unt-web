// src\app\api\sedinvita\turnos\[id]\route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
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
        const { nombre, horarioInicio, horarioFin, cupo, estado } = body;

        await connectToDatabase();

        const turno = await SedinvitaTurno.findById(id);
        if (!turno) {
            return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
        }

        if (nombre !== undefined) turno.nombre = nombre.trim();
        if (horarioInicio !== undefined) turno.horarioInicio = horarioInicio || null;
        if (horarioFin !== undefined) turno.horarioFin = horarioFin || null;
        if (estado !== undefined) turno.estado = estado;
        if (cupo !== undefined) {
            if (Number(cupo) < turno.inscritos) {
                return NextResponse.json(
                    { error: `El cupo no puede ser menor a los ${turno.inscritos} inscritos actuales` },
                    { status: 400 }
                );
            }
            turno.cupo = Number(cupo);
        }

        await turno.save();

        return NextResponse.json({ success: true, data: turno });

    } catch (error) {
        console.error('Error al actualizar turno:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { id } = await params;

        await connectToDatabase();

        const turno = await SedinvitaTurno.findById(id);
        if (!turno) {
            return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
        }

        if (turno.inscritos > 0) {
            return NextResponse.json(
                { error: 'No se puede eliminar un turno con postulantes inscritos' },
                { status: 409 }
            );
        }

        await SedinvitaTurno.deleteOne({ _id: id });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error al eliminar turno:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}