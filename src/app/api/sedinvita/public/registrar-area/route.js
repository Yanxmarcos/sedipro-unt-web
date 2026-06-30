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

        const { codigo, area, tipo } = await request.json();
        // tipo: 'principal' (default, compatibilidad con llamadas antiguas) | 'secundaria'
        const esSecundaria = tipo === 'secundaria';

        // ── Validaciones comunes ────────────────────────────────────────────
        if (!codigo) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: 'Código de matrícula requerido' }, { status: 400 });
        }

        if (!area) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: 'Área requerida' }, { status: 400 });
        }

        if (!AREAS_VALIDAS.includes(area)) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: 'Área no válida' }, { status: 400 });
        }

        const codigoLimpio = codigo.replace(/\D/g, '');
        if (codigoLimpio.length !== 10) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: 'El código debe tener exactamente 10 dígitos' }, { status: 400 });
        }

        const edicion = await SedinvitaEdicion.findOne({ activa: true }).session(session);
        if (!edicion) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: 'No hay edición activa' }, { status: 404 });
        }

        const postulante = await SedinvitaPostulante.findOne({
            edicionId: edicion._id,
            codigoMatricula: codigoLimpio
        }).session(session);

        if (!postulante) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: 'Código no encontrado' }, { status: 404 });
        }

        if (postulante.faseActual !== 'fase3') {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { error: 'Solo los postulantes en Fase 3 pueden elegir área' },
                { status: 400 }
            );
        }

        const areaExistente = await SedinvitaPostulanteArea.findOne({
            edicionId: edicion._id,
            postulanteId: postulante._id
        }).session(session);

        // ──────────────────────────────────────────────────────────────────
        // FLUJO: ÁREA SECUNDARIA
        // ──────────────────────────────────────────────────────────────────
        if (esSecundaria) {
            // Debe existir ya su área principal
            if (!areaExistente) {
                await session.abortTransaction();
                session.endSession();
                return NextResponse.json(
                    { error: 'Debes elegir primero tu área principal' },
                    { status: 400 }
                );
            }

            // No se puede editar una vez elegida (regla de negocio confirmada)
            if (areaExistente.areaSecundaria) {
                await session.abortTransaction();
                session.endSession();
                return NextResponse.json(
                    {
                        error: 'Ya has elegido tu área de segunda opción',
                        areaSecundariaActual: areaExistente.areaSecundaria,
                        nombreAreaSecundaria: NOMBRES_AREAS[areaExistente.areaSecundaria]
                    },
                    { status: 400 }
                );
            }

            // El área secundaria debe ser distinta a la principal
            if (area === areaExistente.area) {
                await session.abortTransaction();
                session.endSession();
                return NextResponse.json(
                    { error: 'El área de segunda opción debe ser diferente a tu área principal' },
                    { status: 400 }
                );
            }

            areaExistente.areaSecundaria = area;
            areaExistente.areaSecundariaFecha = new Date();
            await areaExistente.save({ session });

            await session.commitTransaction();
            session.endSession();

            return NextResponse.json({
                success: true,
                mensaje: 'Área de segunda opción registrada exitosamente',
                area: areaExistente.area,
                nombreArea: NOMBRES_AREAS[areaExistente.area],
                areaSecundaria: area,
                nombreAreaSecundaria: NOMBRES_AREAS[area],
                postulante: {
                    codigoMatricula: postulante.codigoMatricula,
                    nombres: postulante.nombres,
                    apellidos: postulante.apellidos,
                }
            });
        }

        // ──────────────────────────────────────────────────────────────────
        // FLUJO: ÁREA PRINCIPAL (sin cambios respecto al original)
        // ──────────────────────────────────────────────────────────────────
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

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({
            success: true,
            mensaje: 'Área registrada exitosamente',
            area: area,
            nombreArea: NOMBRES_AREAS[area],
            areaSecundaria: null,
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
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}