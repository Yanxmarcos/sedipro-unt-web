// src/app/api/sedinvita/postulantes/sin-area/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaPostulanteArea from '@/models/sedinvita/SedinvitaPostulanteArea';

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function GET(request) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const edicionId = searchParams.get('edicionId');

        if (!edicionId) {
            return NextResponse.json(
                { error: 'edicionId es requerido' },
                { status: 400 }
            );
        }

        // Obtener todos los postulantes en Fase 3
        const postulantes = await SedinvitaPostulante.find({
            edicionId: edicionId,
            faseActual: 'fase3',
            estadoGeneral: 'habilitado'
        }).lean();

        // Obtener IDs de postulantes que ya tienen área
        const areasRegistradas = await SedinvitaPostulanteArea.find({
            edicionId: edicionId
        }).select('postulanteId').lean();

        const idsConArea = new Set(
            areasRegistradas.map(a => a.postulanteId.toString())
        );

        // Filtrar postulantes sin área
        const postulantesSinArea = postulantes.filter(p => 
            !idsConArea.has(p._id.toString())
        );

        return NextResponse.json({
            success: true,
            total: postulantesSinArea.length,
            data: postulantesSinArea
        });

    } catch (error) {
        console.error('Error en sin-area:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}