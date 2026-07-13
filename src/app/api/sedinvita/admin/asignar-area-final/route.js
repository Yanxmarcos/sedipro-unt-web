// src/app/api/sedinvita/admin/asignar-area-final/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaPostulanteArea from '@/models/sedinvita/SedinvitaPostulanteArea';

export async function POST(request) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { codigoMatricula, areaFinal } = body;

        if (!codigoMatricula || !areaFinal) {
            return NextResponse.json(
                { error: 'Código de matrícula y área final son requeridos' },
                { status: 400 }
            );
        }

        // Validar área
        const areasValidas = ['gth', 'pmo', 'ti', 'mkt', 'ltkyfnz'];
        if (!areasValidas.includes(areaFinal)) {
            return NextResponse.json(
                { error: 'Área no válida' },
                { status: 400 }
            );
        }

        // Obtener edición activa
        const edicion = await SedinvitaEdicion.findOne({ activa: true });
        if (!edicion) {
            return NextResponse.json(
                { error: 'No hay edición activa' },
                { status: 404 }
            );
        }

        // Buscar postulante
        const postulante = await SedinvitaPostulante.findOne({
            edicionId: edicion._id,
            codigoMatricula: codigoMatricula
        });

        if (!postulante) {
            return NextResponse.json(
                { error: 'Postulante no encontrado' },
                { status: 404 }
            );
        }

        // Verificar que esté en Fase 4
        if (postulante.faseActual !== 'fase4') {
            return NextResponse.json(
                { error: 'El postulante no está en Fase 4' },
                { status: 400 }
            );
        }

        // Buscar o crear registro de área
        let areaRegistro = await SedinvitaPostulanteArea.findOne({
            edicionId: edicion._id,
            postulanteId: postulante._id
        });

        if (!areaRegistro) {
            // Si no tiene área registrada (caso borde), crear uno
            areaRegistro = new SedinvitaPostulanteArea({
                edicionId: edicion._id,
                postulanteId: postulante._id,
                area: areaFinal,
                areaFinal: areaFinal,
                fechaAsignacionFinal: new Date(),
                asignadoPor: 'admin'
            });
            await areaRegistro.save();
        } else {
            // Actualizar área final
            areaRegistro.areaFinal = areaFinal;
            areaRegistro.fechaAsignacionFinal = new Date();
            areaRegistro.asignadoPor = 'admin';
            await areaRegistro.save();
        }

        // Actualizar estado operativo del postulante
        await SedinvitaPostulante.updateOne(
            { _id: postulante._id },
            {
                $set: {
                    estadoOperativo: 'area_asignada_fase4'
                }
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Área final asignada correctamente',
            data: {
                codigoMatricula: postulante.codigoMatricula,
                areaFinal: areaFinal,
                nombreCompleto: `${postulante.nombres} ${postulante.apellidos}`
            }
        });

    } catch (error) {
        console.error('Error al asignar área final:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}