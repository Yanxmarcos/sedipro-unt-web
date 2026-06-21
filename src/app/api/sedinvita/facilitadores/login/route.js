// src/app/api/sedinvita/facilitadores/login/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaFacilitador from '@/models/sedinvita/SedinvitaFacilitador';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
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

        const facilitador = await SedinvitaFacilitador.findOne({ dni: dni.trim() });
        if (!facilitador) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const isValid = await facilitador.comparePassword(password);
        if (!isValid) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        const edicionActiva = await SedinvitaEdicion.findOne({
            _id: facilitador.edicionId,
            activa: true,
        });
        if (!edicionActiva) {
            return NextResponse.json({ error: 'La edición no está activa' }, { status: 403 });
        }

        // Un grupo puede tener varios facilitadores: se busca por pertenencia al array
        const grupos = await SedinvitaGrupo.find({ facilitadores: facilitador._id })
            .populate('turnoId', 'nombre horarioInicio horarioFin')
            .populate('postulantes', 'nombres apellidos codigoMatricula');

        if (!grupos.length) {
            return NextResponse.json({ error: 'Aún no tienes ningún grupo asignado' }, { status: 403 });
        }

        const token = jwt.sign(
            {
                id: facilitador._id,
                dni: facilitador.dni,
                nombres: facilitador.nombres,
                apellidos: facilitador.apellidos,
                edicionId: facilitador.edicionId,
                rol: 'facilitador',
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        const response = NextResponse.json({
            success: true,
            data: {
                facilitador: {
                    id: facilitador._id,
                    nombres: facilitador.nombres,
                    apellidos: facilitador.apellidos,
                    dni: facilitador.dni,
                },
                grupos,
                edicion: edicionActiva,
            },
        });

        response.cookies.set('facilitador_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 8,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Error en login de facilitador:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}