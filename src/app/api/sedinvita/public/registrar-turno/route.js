// src/app/api/sedinvita/public/registrar-turno/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';

export async function POST(request) {
    // Usar una sesión de MongoDB para transacciones atómicas
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await connectToDatabase();

        const { codigoMatricula, turnoId, fase } = await request.json();

        // Validar datos de entrada
        if (!codigoMatricula || !turnoId) {
            return NextResponse.json(
                { success: false, error: 'Código de matrícula y ID de turno son requeridos' },
                { status: 400 }
            );
        }

        // Limpiar código
        const codigoLimpio = codigoMatricula.replace(/\D/g, '');
        if (codigoLimpio.length !== 10) {
            return NextResponse.json(
                { success: false, error: 'El código debe tener exactamente 10 dígitos' },
                { status: 400 }
            );
        }

        // 1. Obtener edición activa con bloqueo
        const edicionActiva = await SedinvitaEdicion.findOne({ 
            activa: true,
            seleccionTurnosAbierta: true
        }).session(session);

        if (!edicionActiva) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'No hay una edición activa con selección de turnos disponible',
                    code: 'NO_EDICION_ACTIVA'
                },
                { status: 404 }
            );
        }

        // 2. Verificar postulante con bloqueo para lectura consistente
        const postulante = await SedinvitaPostulante.findOne({
            edicionId: edicionActiva._id,
            codigoMatricula: codigoLimpio,
            estadoGeneral: 'habilitado'
        }).session(session);

        if (!postulante) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Código de matrícula no válido o no habilitado',
                    code: 'POSTULANTE_NO_ENCONTRADO'
                },
                { status: 404 }
            );
        }

        // 3. Verificar que el postulante no tenga ya un turno en esta fase
        if (postulante.turnoId && postulante.estadoOperativo === 'turno_elegido') {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Ya has seleccionado un turno para esta fase',
                    code: 'YA_TIENE_TURNO'
                },
                { status: 409 }
            );
        }

        // 4. Verificar fase del postulante
        const fasePostulante = postulante.faseActual || 'fase2';
        const faseTurno = fase || 'fase2';

        if (fasePostulante !== faseTurno) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { 
                    success: false, 
                    error: `La fase del postulante (${fasePostulante}) no coincide con la fase del turno (${faseTurno})`,
                    code: 'FASE_INCORRECTA'
                },
                { status: 400 }
            );
        }

        // 5. Verificar turno con bloqueo para evitar race conditions
        const turno = await SedinvitaTurno.findById(turnoId).session(session);

        if (!turno) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Turno no encontrado',
                    code: 'TURNO_NO_ENCONTRADO'
                },
                { status: 404 }
            );
        }

        // Validar que el turno pertenezca a la edición activa
        if (turno.edicionId.toString() !== edicionActiva._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'El turno no pertenece a la edición activa',
                    code: 'TURNO_INVALIDO'
                },
                { status: 400 }
            );
        }

        // Validar que el turno esté abierto
        if (turno.estado !== 'abierto') {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { 
                    success: false, 
                    error: turno.estado === 'lleno' 
                        ? 'Este turno ya está completo' 
                        : 'Este turno no está disponible',
                    code: 'TURNO_NO_DISPONIBLE'
                },
                { status: 409 }
            );
        }

        // Validar cupo disponible (verificación atómica)
        if (turno.inscritos >= turno.cupo) {
            // Actualizar estado del turno a 'lleno' si está lleno
            await SedinvitaTurno.findByIdAndUpdate(
                turnoId,
                { estado: 'lleno' },
                { session }
            );
            
            await session.commitTransaction();
            session.endSession();
            
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Este turno ya está completo',
                    code: 'TURNO_LLENO'
                },
                { status: 409 }
            );
        }

        // 6. Actualizar todo en una transacción atómica
        // Actualizar turno: incrementar inscritos y actualizar estado si es necesario
        const nuevoInscritos = turno.inscritos + 1;
        const nuevoEstado = nuevoInscritos >= turno.cupo ? 'lleno' : 'abierto';

        await SedinvitaTurno.findByIdAndUpdate(
            turnoId,
            {
                $inc: { inscritos: 1 },
                $set: { estado: nuevoEstado }
            },
            { session }
        );

        // Actualizar postulante
        await SedinvitaPostulante.findByIdAndUpdate(
            postulante._id,
            {
                $set: {
                    turnoId: turnoId,
                    estadoOperativo: 'turno_elegido'
                }
            },
            { session }
        );

        // 7. Commit de la transacción
        await session.commitTransaction();
        session.endSession();

        // 8. Obtener datos actualizados para la respuesta
        const postulanteActualizado = await SedinvitaPostulante.findById(postulante._id).lean();
        const turnoActualizado = await SedinvitaTurno.findById(turnoId).lean();

        return NextResponse.json({
            success: true,
            message: 'Turno registrado exitosamente',
            data: {
                postulante: {
                    codigoMatricula: postulanteActualizado.codigoMatricula,
                    nombres: postulanteActualizado.nombres,
                    apellidos: postulanteActualizado.apellidos
                },
                turno: {
                    id: turnoActualizado._id,
                    nombre: turnoActualizado.nombre,
                    horarioInicio: turnoActualizado.horarioInicio,
                    horarioFin: turnoActualizado.horarioFin,
                    inscritos: turnoActualizado.inscritos,
                    maximo: turnoActualizado.cupo,
                    estado: turnoActualizado.estado
                }
            }
        });

    } catch (error) {
        // Si hay error, abortar transacción
        await session.abortTransaction();
        session.endSession();
        
        console.error('Error al registrar turno:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}