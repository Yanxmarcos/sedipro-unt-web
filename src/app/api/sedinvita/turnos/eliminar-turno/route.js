// src/app/api/sedinvita/turnos/eliminar-turno/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function DELETE(request) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const codigoMatricula = searchParams.get('codigo');
        const turnoId = searchParams.get('turnoId');

        if (!codigoMatricula || !turnoId) {
            return NextResponse.json(
                { success: false, error: 'Código y turnoId son requeridos' },
                { status: 400 }
            );
        }

        // 1. Buscar el postulante
        const postulante = await SedinvitaPostulante.findOne({
            codigoMatricula: codigoMatricula,
            estadoOperativo: 'turno_elegido',
            turnoId: turnoId
        }).session(session);

        if (!postulante) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { success: false, error: 'Postulante no encontrado o no tiene este turno' },
                { status: 404 }
            );
        }

        // 2. Actualizar postulante: quitar turno
        await SedinvitaPostulante.findByIdAndUpdate(
            postulante._id,
            {
                $set: {
                    turnoId: null,
                    estadoOperativo: 'pendiente_turno'
                }
            },
            { session }
        );

        // 3. Actualizar turno: decrementar inscritos
        const turno = await SedinvitaTurno.findById(turnoId).session(session);
        if (turno) {
            const nuevosInscritos = Math.max(0, (turno.inscritos || 0) - 1);
            const nuevoEstado = nuevosInscritos >= (turno.cupo || 0) ? 'lleno' : 'abierto';
            
            await SedinvitaTurno.findByIdAndUpdate(
                turnoId,
                {
                    $set: {
                        inscritos: nuevosInscritos,
                        estado: nuevoEstado
                    }
                },
                { session }
            );
        }

        // 4. Commit de la transacción
        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({
            success: true,
            message: 'Turno eliminado exitosamente',
            data: {
                postulante: {
                    codigoMatricula: postulante.codigoMatricula,
                    nombres: postulante.nombres,
                    apellidos: postulante.apellidos
                }
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error al eliminar turno:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}