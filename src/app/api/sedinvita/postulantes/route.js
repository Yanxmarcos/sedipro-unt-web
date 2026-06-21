import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
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
        const edicionId = searchParams.get('edicionId');

        // Regla de arquitectura: nunca mezclar datos entre años.
        // Si no se especifica edición explícita, se usa la edición activa.
        const edicion = edicionId
            ? await SedinvitaEdicion.findById(edicionId).lean()
            : await SedinvitaEdicion.findOne({ activa: true }).lean();

        if (!edicion) {
            return NextResponse.json({ error: 'No hay una edición activa configurada' }, { status: 404 });
        }

        const postulantes = await SedinvitaPostulante.find({ edicionId: edicion._id })
            .sort({ apellidos: 1, nombres: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            total: postulantes.length,
            data: postulantes,
            edicion,
        });

    } catch (error) {
        console.error('Error al obtener postulantes:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { edicionId, correoElectronico, apellidos, nombres, codigoMatricula, numeroCelular } = body;

        if (!edicionId || !correoElectronico || !apellidos || !nombres || !codigoMatricula) {
            return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
        }

        if (!/^\S+@\S+\.\S+$/.test(correoElectronico.trim())) {
            return NextResponse.json({ error: 'El correo electrónico no es válido' }, { status: 400 });
        }

        await connectToDatabase();

        const existing = await SedinvitaPostulante.findOne({
            edicionId,
            codigoMatricula: codigoMatricula.trim(),
        });
        if (existing) {
            return NextResponse.json({ error: 'Ya existe un postulante con ese código de matrícula en esta edición' }, { status: 409 });
        }

        const postulante = await SedinvitaPostulante.create({
            edicionId,
            correoElectronico: correoElectronico.trim().toLowerCase(),
            apellidos: apellidos.trim(),
            nombres: nombres.trim(),
            codigoMatricula: codigoMatricula.trim(),
            numeroCelular: numeroCelular?.trim(),
        });

        return NextResponse.json({ success: true, data: postulante }, { status: 201 });

    } catch (error) {
        console.error('Error al crear postulante:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Ya existe un postulante con ese código de matrícula en esta edición' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}