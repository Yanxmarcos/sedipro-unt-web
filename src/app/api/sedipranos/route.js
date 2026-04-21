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

export async function GET() {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        await connectToDatabase();

        const sedipranos = await Sediprano.find({})
            .select('area nombres apellidos dni')
            .sort({ area: 1, apellidos: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            total: sedipranos.length,
            data: sedipranos,
        });

    } catch (error) {
        console.error('Error al obtener sedipranos:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { area, nombres, apellidos, dni } = body;

        if (!area || !nombres || !apellidos || !dni) {
            return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
        }

        if (!/^\d{8}$/.test(dni.trim())) {
            return NextResponse.json({ error: 'El DNI debe tener exactamente 8 dígitos' }, { status: 400 });
        }

        await connectToDatabase();

        const existing = await Sediprano.findOne({ dni: dni.trim() });
        if (existing) {
            return NextResponse.json({ error: 'Ya existe un sediprano con ese DNI' }, { status: 409 });
        }

        const sediprano = await Sediprano.create({
            area: area.trim().toUpperCase(),
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            dni: dni.trim(),
        });

        return NextResponse.json({ success: true, data: sediprano }, { status: 201 });

    } catch (error) {
        console.error('Error al crear sediprano:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Ya existe un sediprano con ese DNI' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}