// src/app/api/sedinvita/public/verificar-fase4/route.js
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
            return NextResponse.json({ error: 'Código de matrícula requerido' }, { status: 400 });
        }

        const codigoLimpio = codigo.replace(/\D/g, '');
        if (codigoLimpio.length !== 10) {
            return NextResponse.json({ error: 'El código debe tener exactamente 10 dígitos' }, { status: 400 });
        }

        const edicion = await SedinvitaEdicion.findOne({ activa: true });
        if (!edicion) {
            return NextResponse.json({ error: 'No hay edición activa' }, { status: 404 });
        }

        const postulante = await SedinvitaPostulante.findOne({
            edicionId: edicion._id,
            codigoMatricula: codigoLimpio
        });

        if (!postulante) {
            return NextResponse.json(
                { error: 'Código no encontrado en el proceso de selección.' },
                { status: 404 }
            );
        }

        // Caso 1: No pasó a Fase 4 (está en Fase 2 o 3)
        if (postulante.faseActual === 'fase2' || postulante.faseActual === 'fase3') {
            return NextResponse.json({
                success: true,
                paso: false,
                mensaje: 'No has superado la Fase 3. Sigue esforzándote para futuras convocatorias.',
                faseActual: postulante.faseActual,
                postulante: {
                    codigoMatricula: postulante.codigoMatricula,
                    nombres: postulante.nombres,
                    apellidos: postulante.apellidos,
                }
            });
        }

        // Caso 2: Está en Fase 4 - Pasó exitosamente
        if (postulante.faseActual === 'fase4') {
            // Obtener el área que eligió en Fase 3
            const areaRegistro = await SedinvitaPostulanteArea.findOne({
                edicionId: edicion._id,
                postulanteId: postulante._id
            });

            // Mapear nombres de áreas para mostrar en el frontend
            const nombresAreas = {
                'gth': 'Gestión del Talento Humano',
                'pmo': 'Project Management Office',
                'ti': 'Tecnologías de la Información',
                'mkt': 'Marketing',
                'ltkyfnz': 'Logística y Finanzas'
            };

            // Determinar el área final (si tiene asignación final, usarla, sino la principal)
            const areaFinal = areaRegistro?.areaFinal || areaRegistro?.area || null;
            const areaNombre = areaFinal ? nombresAreas[areaFinal] : null;

            return NextResponse.json({
                success: true,
                paso: true,
                mensaje: '¡Felicidades! Has superado exitosamente la Fase 3 y formas parte de la Fase 4.',
                faseActual: postulante.faseActual,
                areaFinal: areaFinal,
                areaNombre: areaNombre,
                postulante: {
                    codigoMatricula: postulante.codigoMatricula,
                    nombres: postulante.nombres,
                    apellidos: postulante.apellidos,
                }
            });
        }

        return NextResponse.json({ error: 'Estado del postulante no válido' }, { status: 400 });

    } catch (error) {
        console.error('Error en verificar-fase4:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}