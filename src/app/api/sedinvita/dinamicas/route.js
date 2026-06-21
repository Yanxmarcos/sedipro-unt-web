// src/app/api/sedinvita/dinamicas/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaDinamica from '@/models/sedinvita/SedinvitaDinamica';
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

        const dinamicas = await SedinvitaDinamica.find({ turnoId })
            .sort({ orden: 1, nombre: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            total: dinamicas.length,
            data: dinamicas,
        });

    } catch (error) {
        console.error('Error al obtener dinámicas:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { edicionId, turnoId, nombre, descripcion, competencias, orden } = body;

        if (!edicionId || !turnoId || !nombre) {
            return NextResponse.json({ error: 'Edición, turno y nombre son requeridos' }, { status: 400 });
        }

        const lista = (competencias || []).map(c => c.trim()).filter(Boolean);
        if (lista.length !== 3) {
            return NextResponse.json({ error: 'Debes indicar exactamente tres competencias' }, { status: 400 });
        }

        await connectToDatabase();

        const dinamica = await SedinvitaDinamica.create({
            edicionId,
            turnoId,
            nombre: nombre.trim(),
            descripcion: descripcion?.trim(),
            competencias: lista,
            orden: orden ?? 0,
        });

        return NextResponse.json({ success: true, data: dinamica }, { status: 201 });

    } catch (error) {
        console.error('Error al crear dinámica:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}