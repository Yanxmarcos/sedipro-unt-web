// src/app/api/sedinvita/postulantes/fase4/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaPostulanteArea from '@/models/sedinvita/SedinvitaPostulanteArea';

export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const edicionId = searchParams.get('edicionId');

        if (!edicionId) {
            return NextResponse.json(
                { error: 'edicionId es requerido' },
                { status: 400 }
            );
        }

        // Obtener edición activa si no se especifica
        let edicion;
        if (edicionId) {
            edicion = await SedinvitaEdicion.findById(edicionId);
        } else {
            edicion = await SedinvitaEdicion.findOne({ activa: true });
        }

        if (!edicion) {
            return NextResponse.json(
                { error: 'Edición no encontrada' },
                { status: 404 }
            );
        }

        // 1. Obtener todos los postulantes en Fase 4
        const postulantes = await SedinvitaPostulante.find({
            edicionId: edicion._id,
            faseActual: 'fase4'
        }).lean();

        if (postulantes.length === 0) {
            return NextResponse.json({
                success: true,
                postulantes: [],
                areas: [],
                sinArea: [],
                total: 0
            });
        }

        // 2. Obtener las áreas de estos postulantes
        const postulanteIds = postulantes.map(p => p._id);
        const areasRegistro = await SedinvitaPostulanteArea.find({
            edicionId: edicion._id,
            postulanteId: { $in: postulanteIds }
        }).lean();

        // Crear mapa de áreas por postulante
        const areaMap = {};
        areasRegistro.forEach(area => {
            areaMap[area.postulanteId.toString()] = area;
        });

        // 3. Combinar datos
        const postulantesConArea = postulantes.map(p => {
            const area = areaMap[p._id.toString()] || {};
            return {
                ...p,
                areaPrincipal: area.area || null,
                areaSecundaria: area.areaSecundaria || null,
                areaFinal: area.areaFinal || null,
                fechaAsignacionFinal: area.fechaAsignacionFinal || null,
            };
        });

        // 4. Agrupar por área final (si tiene)
        const areasAgrupadas = {};
        postulantesConArea.forEach(p => {
            const areaFinal = p.areaFinal;
            if (areaFinal) {
                if (!areasAgrupadas[areaFinal]) {
                    areasAgrupadas[areaFinal] = [];
                }
                areasAgrupadas[areaFinal].push(p);
            }
        });

        const areas = Object.keys(areasAgrupadas).map(area => ({
            area,
            postulantes: areasAgrupadas[area]
        }));

        // 5. Postulantes sin área final asignada
        const sinArea = postulantesConArea.filter(p => !p.areaFinal);

        return NextResponse.json({
            success: true,
            postulantes: postulantesConArea,
            areas: areas,
            sinArea: sinArea,
            total: postulantesConArea.length
        });

    } catch (error) {
        console.error('Error en /api/sedinvita/postulantes/fase4:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor: ' + error.message },
            { status: 500 }
        );
    }
}