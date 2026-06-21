// src/app/api/sedinvita/evaluaciones/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaEvaluacion from '@/models/sedinvita/SedinvitaEvaluacion';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticateAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

// Corrección administrativa: la directiva puede ajustar una evaluación ya
// registrada por un facilitador. No es la vía principal de evaluación.
export async function PATCH(request, { params }) {
    try {
        const payload = await authenticateAdmin();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { puntajes, comentario, opinionInfiltrado } = body;

        await connectToDatabase();

        const evaluacion = await SedinvitaEvaluacion.findById(id);
        if (!evaluacion) {
            return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 });
        }

        if (puntajes !== undefined) {
            const lista = puntajes.filter(p => p?.competencia && p?.puntaje);
            if (lista.length !== 3 || lista.some(p => p.puntaje < 1 || p.puntaje > 4)) {
                return NextResponse.json({ error: 'Debes calificar las tres competencias con un puntaje entre 1 y 4' }, { status: 400 });
            }
            evaluacion.puntajes = lista;
        }
        if (comentario !== undefined) evaluacion.comentario = comentario.trim();
        if (opinionInfiltrado !== undefined) evaluacion.opinionInfiltrado = opinionInfiltrado.trim();

        await evaluacion.save();

        return NextResponse.json({ success: true, data: evaluacion });

    } catch (error) {
        console.error('Error al corregir evaluación:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// DELETE: Eliminar una evaluación específica (solo administradores)
export async function DELETE(request, { params }) {
    try {
        const payload = await authenticateAdmin();
        if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { id } = await params;

        await connectToDatabase();

        // 1. Buscar la evaluación para obtener el postulanteId y grupoId
        const evaluacion = await SedinvitaEvaluacion.findById(id);
        if (!evaluacion) {
            return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 });
        }

        const { postulanteId, grupoId } = evaluacion;

        // 2. Eliminar la evaluación
        await SedinvitaEvaluacion.deleteOne({ _id: id });

        // 3. Verificar si el postulante tiene otras evaluaciones para este grupo
        const otrasEvaluaciones = await SedinvitaEvaluacion.countDocuments({
            postulanteId,
            grupoId
        });

        // 4. Si no tiene más evaluaciones, actualizar su estado operativo
        if (otrasEvaluaciones === 0) {
            // Buscar el postulante y actualizar su estado
            const postulante = await SedinvitaPostulante.findById(postulanteId);
            if (postulante) {
                // Verificar si el postulante tiene un turno asignado
                // Si tiene turno, debería estar en estado de espera de evaluación
                // Si no tiene turno, debería estar pendiente de turno
                const estadoAnterior = postulante.estadoOperativo;
                
                // Solo actualizar si estaba en estado 'evaluado' o similar
                if (estadoAnterior === 'evaluado' || estadoAnterior === 'grupo_evaluado') {
                    // Restaurar a 'grupo_asignado' si tiene grupo y turno
                    if (postulante.grupoId && postulante.turnoId) {
                        postulante.estadoOperativo = 'grupo_asignado';
                    } else if (postulante.turnoId) {
                        postulante.estadoOperativo = 'turno_elegido';
                    } else {
                        postulante.estadoOperativo = 'pendiente_turno';
                    }
                    
                    await postulante.save();
                    
                    console.log(`Estado operativo del postulante ${postulante.codigoMatricula} actualizado de "${estadoAnterior}" a "${postulante.estadoOperativo}"`);
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Evaluación eliminada correctamente',
            data: {
                postulanteId,
                grupoId,
                evaluacionesRestantes: otrasEvaluaciones
            }
        });

    } catch (error) {
        console.error('Error al eliminar evaluación:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}