// src/app/api/sedinvita/dinamicas/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaDinamica from '@/models/sedinvita/SedinvitaDinamica';
import SedinvitaEvaluacion from '@/models/sedinvita/SedinvitaEvaluacion';
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
        const { nombre, descripcion, competencias, orden } = body;

        await connectToDatabase();

        const dinamica = await SedinvitaDinamica.findById(id);
        if (!dinamica) {
            return NextResponse.json({ error: 'Dinámica no encontrada' }, { status: 404 });
        }

        if (nombre !== undefined) dinamica.nombre = nombre.trim();
        if (descripcion !== undefined) dinamica.descripcion = descripcion.trim();
        if (orden !== undefined) dinamica.orden = orden;
        if (competencias !== undefined) {
            const lista = competencias.map(c => c.trim()).filter(Boolean);
            if (lista.length !== 3) {
                return NextResponse.json({ error: 'Debes indicar exactamente tres competencias' }, { status: 400 });
            }
            dinamica.competencias = lista;
        }

        await dinamica.save();

        return NextResponse.json({ success: true, data: dinamica });

    } catch (error) {
        console.error('Error al actualizar dinámica:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { id } = await params;

        await connectToDatabase();

        const tieneEvaluaciones = await SedinvitaEvaluacion.countDocuments({ dinamicaId: id });
        if (tieneEvaluaciones > 0) {
            return NextResponse.json(
                { error: 'No se puede eliminar: ya existen evaluaciones registradas con esta dinámica' },
                { status: 409 }
            );
        }

        const dinamica = await SedinvitaDinamica.findByIdAndDelete(id);
        if (!dinamica) {
            return NextResponse.json({ error: 'Dinámica no encontrada' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error al eliminar dinámica:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}