// src/app/api/sedinvita/sedinvitados/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sedinvitado from '@/models/Sedinvitado';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import mongoose from 'mongoose';

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

// GET - Obtener un invitado por ID
export async function GET(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        await connectToDatabase();

        const invitado = await Sedinvitado.findById(id).lean();

        if (!invitado) {
            return NextResponse.json({ error: 'Invitado no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: invitado });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar (bloqueado, para futuro)
export async function PUT() {
    return NextResponse.json(
        { error: 'Método no disponible actualmente' },
        { status: 405 }
    );
}

// DELETE - Eliminar por ID (bloqueado)
export async function DELETE() {
    return NextResponse.json(
        { error: 'Método no disponible actualmente' },
        { status: 405 }
    );
}