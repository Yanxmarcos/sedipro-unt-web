// src\app\api\sedinvita\ediciones\route.js
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

export async function GET() {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        await connectToDatabase();

        const ediciones = await SedinvitaEdicion.find({})
            .sort({ anio: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            total: ediciones.length,
            data: ediciones,
        });

    } catch (error) {
        console.error('Error al obtener ediciones:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { nombre, anio, estado, fechaInicio, fechaFin, activa, seleccionTurnosAbierta } = body;

        if (!nombre || !anio) {
            return NextResponse.json({ error: 'El nombre y el año son requeridos' }, { status: 400 });
        }

        await connectToDatabase();

        const totalEdiciones = await SedinvitaEdicion.countDocuments();
        // La primera edición creada en todo el sistema queda activa automáticamente
        const debeQuedarActiva = totalEdiciones === 0 ? true : !!activa;

        if (debeQuedarActiva) {
            await SedinvitaEdicion.updateMany({ activa: true }, { activa: false });
        }

        // Validar que el estado sea válido
        const estadosValidos = ['planificacion', 'abierto', 'cerrado', 'finalizado'];
        const estadoFinal = estado && estadosValidos.includes(estado) ? estado : 'planificacion';

        const edicion = await SedinvitaEdicion.create({
            nombre: nombre.trim(),
            anio,
            estado: estadoFinal,
            fechaInicio: fechaInicio || undefined,
            fechaFin: fechaFin || undefined,
            activa: debeQuedarActiva,
            seleccionTurnosAbierta: !!seleccionTurnosAbierta,
        });

        return NextResponse.json({ success: true, data: edicion }, { status: 201 });

    } catch (error) {
        console.error('Error al crear edición:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}