// src/app/api/sedinvita/encargados-asistencia/verify/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaEncargadoAsistencia from '@/models/sedinvita/SedinvitaEncargadoAsistencia';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('sedinvita_encargado_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.rol !== 'sedinvita_encargado') {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        await connectToDatabase();

        // Se vuelve a consultar la BD (no se confía en el token) para que una
        // revocación desde el panel admin surta efecto de inmediato.
        const asignaciones = await SedinvitaEncargadoAsistencia.find({ dni: decoded.dni })
            .populate('turnoId', 'nombre fase horarioInicio horarioFin estado');

        if (!asignaciones.length) {
            return NextResponse.json({ error: 'Tu acceso ha sido revocado' }, { status: 403 });
        }

        return NextResponse.json({
            user: {
                dni: decoded.dni,
                nombres: decoded.nombres,
                apellidos: decoded.apellidos,
                rol: decoded.rol,
            },
            turnos: asignaciones.map(a => a.turnoId),
        });

    } catch (error) {
        console.error('Error al verificar sesión de encargado:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}