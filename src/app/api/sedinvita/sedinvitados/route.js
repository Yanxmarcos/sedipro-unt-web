// src/app/api/sedinvita/sedinvitados/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sedinvitado from '@/models/Sedinvitado';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

// GET - Obtener todos los invitados (lectura)
export async function GET() {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await connectToDatabase();

        const invitados = await Sedinvitado.find({})
            .sort({ apellidos: 1, nombres: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            total: invitados.length,
            data: invitados
        });

    } catch (error) {
        console.error('Error al obtener invitados:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

// POST - Crear un invitado (solo admin, pero lo dejamos bloqueado)
export async function POST() {
    return NextResponse.json(
        { error: 'Método no permitido. Use el script de importación.' },
        { status: 405 }
    );
}

// DELETE - Eliminar todos (bloqueado)
export async function DELETE() {
    return NextResponse.json(
        { error: 'Método no permitido' },
        { status: 405 }
    );
}