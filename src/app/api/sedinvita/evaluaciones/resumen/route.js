// src/app/api/sedinvita/evaluaciones/resumen/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
import SedinvitaDinamica from '@/models/sedinvita/SedinvitaDinamica';
import SedinvitaEvaluacion from '@/models/sedinvita/SedinvitaEvaluacion';
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

        const grupos = await SedinvitaGrupo.find({ turnoId })
            .populate('facilitadores', 'nombres apellidos')
            .lean();

        const totalDinamicas = await SedinvitaDinamica.countDocuments({ turnoId });

        const data = await Promise.all(grupos.map(async (g) => {
            const totalPostulantes = g.postulantes.length;
            const totalEsperado = totalDinamicas * totalPostulantes;
            const completadas = await SedinvitaEvaluacion.countDocuments({ grupoId: g._id });
            return {
                _id: g._id,
                nombre: g.nombre,
                facilitadores: g.facilitadores,
                totalPostulantes,
                totalDinamicas,
                completadas,
                porcentaje: totalEsperado ? Math.round((completadas / totalEsperado) * 100) : 0,
            };
        }));

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Error al obtener resumen de evaluación:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}