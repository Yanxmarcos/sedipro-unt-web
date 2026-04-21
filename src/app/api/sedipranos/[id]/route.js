// src/app/api/sedipranos/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sediprano from '@/models/Sediprano';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function PUT(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { area, nombres, apellidos, dni } = body;

        if (!area || !nombres || !apellidos || !dni) {
            return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
        }

        if (!/^\d{8}$/.test(dni.trim())) {
            return NextResponse.json({ error: 'El DNI debe tener exactamente 8 dígitos' }, { status: 400 });
        }

        await connectToDatabase();

        const existing = await Sediprano.findOne({ dni: dni.trim(), _id: { $ne: id } });
        if (existing) {
            return NextResponse.json({ error: 'Ya existe un sediprano con ese DNI' }, { status: 409 });
        }

        const updated = await Sediprano.findByIdAndUpdate(
            id,
            {
                area: area.trim().toUpperCase(),
                nombres: nombres.trim(),
                apellidos: apellidos.trim(),
                dni: dni.trim(),
            },
            { new: true, runValidators: true }
        ).select('area nombres apellidos dni');

        if (!updated) {
            return NextResponse.json({ error: 'Sediprano no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error('Error al actualizar sediprano:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Ya existe un sediprano con ese DNI' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { id } = await params;
        await connectToDatabase();

        const deleted = await Sediprano.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Sediprano no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Sediprano eliminado correctamente' });

    } catch (error) {
        console.error('Error al eliminar sediprano:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}