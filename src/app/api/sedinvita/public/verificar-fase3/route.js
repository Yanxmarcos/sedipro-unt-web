// src/app/api/sedinvita/public/verificar-fase3/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaPostulanteArea from '@/models/sedinvita/SedinvitaPostulanteArea';

export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const codigo = searchParams.get('codigo');

        if (!codigo) {
            return NextResponse.json(
                { error: 'Código de matrícula requerido' },
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
            codigoMatricula: codigoLimpio
        });

        if (!postulante) {
            return NextResponse.json(
                { error: 'Código no encontrado en el proceso de selección. Verifica que sea correcto.' },
                { status: 404 }
            );
        }

        // Caso 1: Está en Fase 2 - No pasó
        if (postulante.faseActual === 'fase2') {
            return NextResponse.json({
                success: true,
                paso: false,
                mensaje: 'No superaste la Fase 2',
                faseActual: postulante.faseActual,
                estadoGeneral: postulante.estadoGeneral,
                postulante: {
                    codigoMatricula: postulante.codigoMatricula,
                    nombres: postulante.nombres,
                    apellidos: postulante.apellidos,
                }
            });
        }

        // Caso 2: Está en Fase 3 o superior
        if (postulante.faseActual === 'fase3' || postulante.faseActual === 'fase4') {
            // Verificar si ya eligió área
            const areaRegistro = await SedinvitaPostulanteArea.findOne({
                edicionId: edicion._id,
                postulanteId: postulante._id
            });

            // Si está en Fase 4, ya no puede elegir área
            if (postulante.faseActual === 'fase4') {
                return NextResponse.json({
                    success: true,
                    paso: true,
                    faseSuperior: true,
                    mensaje: 'Ya superaste todas las fases',
                    faseActual: postulante.faseActual,
                    yaEligio: !!areaRegistro,
                    area: areaRegistro?.area || null,
                    postulante: {
                        codigoMatricula: postulante.codigoMatricula,
                        nombres: postulante.nombres,
                        apellidos: postulante.apellidos,
                    }
                });
            }

            // Está en Fase 3 - Puede elegir área
            return NextResponse.json({
                success: true,
                paso: true,
                faseSuperior: false,
                mensaje: '¡Felicidades! Has superado la Fase 2',
                faseActual: postulante.faseActual,
                yaEligio: !!areaRegistro,
                area: areaRegistro?.area || null,
                postulante: {
                    codigoMatricula: postulante.codigoMatricula,
                    nombres: postulante.nombres,
                    apellidos: postulante.apellidos,
                }
            });
        }

        return NextResponse.json(
            { error: 'Estado del postulante no válido' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error en verificar-fase3:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}