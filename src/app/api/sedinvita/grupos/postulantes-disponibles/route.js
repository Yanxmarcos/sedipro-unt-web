// src/app/api/sedinvita/grupos/postulantes-disponibles/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
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
        const turnoId = searchParams.get('turnoId');
        const grupoId = searchParams.get('grupoId'); // Para excluir postulantes ya en este grupo

        if (!turnoId) {
            return NextResponse.json({ error: 'Turno ID es requerido' }, { status: 400 });
        }

        await connectToDatabase();

        // Verificar que el turno existe
        const turno = await SedinvitaTurno.findById(turnoId);
        if (!turno) {
            return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
        }

        // Construir filtro
        const filter = {
            turnoId: turnoId,
            faseActual: turno.fase,
            estadoGeneral: 'habilitado',
        };

        // Si hay grupoId, excluir postulantes que ya están en ese grupo
        if (grupoId) {
            filter.grupoId = { $ne: grupoId };
        }

        // Obtener postulantes habilitados de este turno que no tienen grupo
        const postulantes = await SedinvitaPostulante.find(filter)
            .sort({ apellidos: 1, nombres: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            total: postulantes.length,
            data: postulantes,
        });

    } catch (error) {
        console.error('Error al obtener postulantes:', error);
        return NextResponse.json({ 
            error: 'Error interno del servidor',
            details: error.message,
        }, { status: 500 });
    }
}