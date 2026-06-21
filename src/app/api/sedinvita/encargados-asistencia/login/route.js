// src/app/api/sedinvita/encargados-asistencia/login/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaEncargadoAsistencia from '@/models/sedinvita/SedinvitaEncargadoAsistencia';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
    try {
        const body = await request.json();
        const { dni, password } = body;

        if (!dni || !password) {
            return NextResponse.json({ error: 'DNI y contraseña son requeridos' }, { status: 400 });
        }

        await connectToDatabase();

        // Un mismo DNI puede estar asignado como encargado de varios turnos
        const asignaciones = await SedinvitaEncargadoAsistencia.find({ dni: dni.trim() })
            .populate('turnoId', 'nombre fase horarioInicio horarioFin estado');

        if (!asignaciones.length) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const isValid = await asignaciones[0].comparePassword(password);
        if (!isValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const { nombres, apellidos } = asignaciones[0];

        const token = jwt.sign(
            {
                dni: dni.trim(),
                nombres,
                apellidos,
                rol: 'sedinvita_encargado',
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        const response = NextResponse.json({
            success: true,
            data: {
                encargado: { nombres, apellidos, dni: dni.trim() },
                turnos: asignaciones.map(a => a.turnoId),
            },
        });

        response.cookies.set('sedinvita_encargado_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 8, // 8 horas
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Error en login de encargado SEDInvita:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}