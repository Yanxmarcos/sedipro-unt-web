// src/app/api/sedinvita/facilitadores/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaFacilitador from '@/models/sedinvita/SedinvitaFacilitador';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
import Sediprano from '@/models/Sediprano';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticate() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return null;
        return verifyToken(token);
    } catch (error) {
        console.error('Error en authenticate:', error);
        return null;
    }
}

export async function GET(request) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const edicionId = searchParams.get('edicionId');

        await connectToDatabase();

        let edicionIdFinal = edicionId;
        if (!edicionIdFinal) {
            const edicionActiva = await SedinvitaEdicion.findOne({ activa: true }).lean();
            if (!edicionActiva) {
                return NextResponse.json({ error: 'No hay una edición activa configurada' }, { status: 404 });
            }
            edicionIdFinal = edicionActiva._id;
        }

        const facilitadores = await SedinvitaFacilitador.find({ edicionId: edicionIdFinal })
            .sort({ apellidos: 1, nombres: 1 })
            .lean();

        // Conteo de grupos por facilitador (ahora es un array, se busca con $in implícito)
        const facilitadoresConGrupos = await Promise.all(facilitadores.map(async (fac) => {
            const grupos = await SedinvitaGrupo.find({ facilitadores: fac._id }).select('nombre').lean();
            return {
                ...fac,
                totalGrupos: grupos.length,
                grupos: grupos.map(g => g.nombre),
            };
        }));

        return NextResponse.json({
            success: true,
            total: facilitadores.length,
            data: facilitadoresConGrupos,
        });

    } catch (error) {
        console.error('Error al obtener facilitadores:', error);
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error.message,
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { edicionId, sedipranoId } = body;

        if (!edicionId || !sedipranoId) {
            return NextResponse.json({ error: 'Edición y sediprano son requeridos' }, { status: 400 });
        }

        await connectToDatabase();

        const sediprano = await Sediprano.findById(sedipranoId).lean();
        if (!sediprano) {
            return NextResponse.json({ error: 'Sediprano no encontrado' }, { status: 404 });
        }

        const existente = await SedinvitaFacilitador.findOne({ edicionId, sedipranoId });
        if (existente) {
            return NextResponse.json(
                { error: `${sediprano.nombres} ${sediprano.apellidos} ya es facilitador en esta edición` },
                { status: 409 }
            );
        }

        const facilitador = await SedinvitaFacilitador.create({
            edicionId,
            sedipranoId,
            nombres: sediprano.nombres,
            apellidos: sediprano.apellidos,
            dni: sediprano.dni,
            passwordHash: sediprano.dni, // El DNI es la contraseña inicial; el pre-save lo hashea
        });

        return NextResponse.json({ success: true, data: facilitador }, { status: 201 });

    } catch (error) {
        console.error('Error al asignar facilitador:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Ese sediprano ya es facilitador en esta edición' }, { status: 409 });
        }
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error.message,
        }, { status: 500 });
    }
}