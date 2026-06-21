// src/app/api/sedinvita/encargados-asistencia/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaEncargadoAsistencia from '@/models/sedinvita/SedinvitaEncargadoAsistencia';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function DELETE(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { id } = await params;

        await connectToDatabase();

        // Al eliminar el documento, el endpoint de registro deja de encontrarlo
        // y el acceso queda revocado de inmediato, sin esperar que expire el token.
        const encargado = await SedinvitaEncargadoAsistencia.findByIdAndDelete(id);
        if (!encargado) {
            return NextResponse.json({ error: 'Encargado no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error al eliminar encargado:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}