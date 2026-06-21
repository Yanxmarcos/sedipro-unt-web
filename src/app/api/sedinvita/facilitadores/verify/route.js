// src/app/api/sedinvita/facilitadores/verify/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('facilitador_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.rol !== 'facilitador') {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        await connectToDatabase();

        const grupos = await SedinvitaGrupo.find({ facilitadores: decoded.id })
            .populate('turnoId', 'nombre fase horarioInicio horarioFin')
            .populate('postulantes', 'nombres apellidos codigoMatricula estadoGeneral');

        if (!grupos.length) {
            return NextResponse.json({ error: 'Ya no tienes grupos asignados' }, { status: 403 });
        }

        return NextResponse.json({
            user: {
                id: decoded.id,
                dni: decoded.dni,
                nombres: decoded.nombres,
                apellidos: decoded.apellidos,
                rol: decoded.rol,
            },
            grupos,
        });

    } catch (error) {
        console.error('Error al verificar sesión de facilitador:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}