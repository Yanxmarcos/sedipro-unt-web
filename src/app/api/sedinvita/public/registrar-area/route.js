// src/app/api/sedinvita/public/registrar-area/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaPostulanteArea from '@/models/sedinvita/SedinvitaPostulanteArea';

const AREAS_VALIDAS = ['gth', 'pmo', 'ti', 'mkt', 'ltkyfnz'];
const NOMBRES_AREAS = {
    gth: 'GTH',
    pmo: 'PMO',
    ti: 'TI',
    mkt: 'MKT',
    ltkyfnz: 'LTK & FNZ'
};

export async function POST(request) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await connectToDatabase();

        const { codigo, area } = await request.json();

        // Validaciones
        if (!codigo) {
            return NextResponse.json(
                { error: 'Código de matrícula requerido' },
                { status: 400 }
            );
        }

        if (!area) {
            return NextResponse.json(
                { error: 'Área requerida' },
                { status: 400 }
            );
        }

        if (!AREAS_VALIDAS.includes(area)) {
            return NextResponse.json(
                { error: 'Área no válida' },
                { status: 400 }
            );
        }

        const codigoLimpio = codigo.replace(/\D/g, '');
        if (codigoLimpio.length !== 10) {
            return NextResponse.json(
                { error: 'El código debe tener exactamente 10 dígitos' },
                { status: 400 }
            );
        }

        // Obtener edición activa
        const edicion = await SedinvitaEdicion.findOne({ activa: true }).session(session);
        if (!edicion) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { error: 'No hay edición activa' },
                { status: 404 }
            );
        }

        // Buscar postulante
        const postulante = await SedinvitaPostulante.findOne({
            edicionId: edicion._id,
            codigoMatricula: codigoLimpio
        }).session(session);

        if (!postulante) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { error: 'Código no encontrado' },
                { status: 404 }
            );
        }

        // Verificar que esté en Fase 3
        if (postulante.faseActual !== 'fase3') {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { error: 'Solo los postulantes en Fase 3 pueden elegir área' },
                { status: 400 }
            );
        }

        // Verificar que no haya elegido ya
        const areaExistente = await SedinvitaPostulanteArea.findOne({
            edicionId: edicion._id,
            postulanteId: postulante._id
        }).session(session);

        if (areaExistente) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                {
                    error: 'Ya has elegido un área',
                    areaActual: areaExistente.area,
                    nombreArea: NOMBRES_AREAS[areaExistente.area]
                },
                { status: 400 }
            );
        }

        // Crear registro de área
        const nuevoRegistro = new SedinvitaPostulanteArea({
            edicionId: edicion._id,
            postulanteId: postulante._id,
            area: area,
            registradoPor: 'postulante',
            historial: [{
                area: area,
                motivo: 'Elección inicial por postulante'
            }]
        });

        await nuevoRegistro.save({ session });

        // Commit de la transacción
        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({
            success: true,
            mensaje: 'Área registrada exitosamente',
            area: area,
            nombreArea: NOMBRES_AREAS[area],
            postulante: {
                codigoMatricula: postulante.codigoMatricula,
                nombres: postulante.nombres,
                apellidos: postulante.apellidos,
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error en registrar-area:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}