// src/app/api/sedinvita/encargados-asistencia/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaEncargadoAsistencia from '@/models/sedinvita/SedinvitaEncargadoAsistencia';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
import Sediprano from '@/models/Sediprano';
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

        const encargados = await SedinvitaEncargadoAsistencia.find({ turnoId })
            .select('nombres apellidos dni sedipranoId turnoId')
            .lean();

        return NextResponse.json({ success: true, total: encargados.length, data: encargados });

    } catch (error) {
        console.error('Error al obtener encargados:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = await authenticate();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { turnoId, edicionId, sedipranoId } = body;

        if (!turnoId || !edicionId || !sedipranoId) {
            return NextResponse.json({ error: 'turnoId, edicionId y sedipranoId son requeridos' }, { status: 400 });
        }

        await connectToDatabase();

        const turno = await SedinvitaTurno.findById(turnoId).lean();
        if (!turno) {
            return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
        }

        const sediprano = await Sediprano.findById(sedipranoId).lean();
        if (!sediprano) {
            return NextResponse.json({ error: 'Sediprano no encontrado' }, { status: 404 });
        }
        if (sediprano.area?.toUpperCase() === 'DIRECTIVA') {
            return NextResponse.json({ error: 'Los miembros de Directiva no pueden ser encargados' }, { status: 400 });
        }

        const yaAsignado = await SedinvitaEncargadoAsistencia.findOne({ turnoId, sedipranoId }).lean();
        if (yaAsignado) {
            return NextResponse.json(
                { error: `${sediprano.nombres} ${sediprano.apellidos} ya es encargado de este turno` },
                { status: 409 }
            );
        }

        const encargado = await SedinvitaEncargadoAsistencia.create({
            turnoId,
            edicionId,
            sedipranoId,
            nombres: sediprano.nombres,
            apellidos: sediprano.apellidos,
            dni: sediprano.dni,
            passwordHash: sediprano.dni, // el DNI es la contraseña inicial; el pre-save lo hashea
        });

        return NextResponse.json({
            success: true,
            data: {
                _id: encargado._id,
                turnoId: encargado.turnoId,
                sedipranoId: encargado.sedipranoId,
                nombres: encargado.nombres,
                apellidos: encargado.apellidos,
                dni: encargado.dni,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Error al asignar encargado:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Ese sediprano ya es encargado de este turno' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}