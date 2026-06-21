// src\app\api\sedinvita\turnos\route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
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
        let edicionId = searchParams.get('edicionId');
        const fase = searchParams.get('fase') || 'fase2';

        if (!edicionId) {
            const edicionActiva = await SedinvitaEdicion.findOne({ activa: true }).lean();
            if (!edicionActiva) {
                return NextResponse.json({ error: 'No hay una edición activa configurada' }, { status: 404 });
            }
            edicionId = edicionActiva._id;
        }

        const turnos = await SedinvitaTurno.find({ edicionId, fase })
            .sort({ horarioInicio: 1, nombre: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            total: turnos.length,
            data: turnos,
        });

    } catch (error) {
        console.error('Error al obtener turnos:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { edicionId, fase, nombre, horarioInicio, horarioFin, cupo, estado } = body;

        if (!edicionId || !fase || !nombre || cupo === undefined || cupo === null || cupo === '') {
            return NextResponse.json({ error: 'Edición, fase, nombre y cupo son requeridos' }, { status: 400 });
        }

        if (Number(cupo) < 0) {
            return NextResponse.json({ error: 'El cupo no puede ser negativo' }, { status: 400 });
        }

        await connectToDatabase();

        const turno = await SedinvitaTurno.create({
            edicionId,
            fase,
            nombre: nombre.trim(),
            horarioInicio: horarioInicio || undefined,
            horarioFin: horarioFin || undefined,
            cupo: Number(cupo),
            estado: estado || 'abierto',
        });

        return NextResponse.json({ success: true, data: turno }, { status: 201 });

    } catch (error) {
        console.error('Error al crear turno:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}