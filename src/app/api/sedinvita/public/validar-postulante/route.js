// src/app/api/sedinvita/public/validar-postulante/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';

export async function POST(request) {
    try {
        await connectToDatabase();

        const { codigoMatricula } = await request.json();

        // Validar que el código esté presente
        if (!codigoMatricula || codigoMatricula.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'El código de matrícula es requerido' },
                { status: 400 }
            );
        }

        // Limpiar y validar formato (solo números, 10 dígitos)
        const codigoLimpio = codigoMatricula.replace(/\D/g, '');
        if (codigoLimpio.length !== 10) {
            return NextResponse.json(
                { success: false, error: 'El código debe tener exactamente 10 dígitos' },
                { status: 400 }
            );
        }

        // Obtener edición activa
        const edicionActiva = await SedinvitaEdicion.findOne({ 
            activa: true,
            seleccionTurnosAbierta: true // Asegurar que la selección de turnos esté abierta
        }).lean();

        if (!edicionActiva) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'No hay una edición activa con selección de turnos disponible en este momento',
                    code: 'NO_EDICION_ACTIVA'
                },
                { status: 404 }
            );
        }

        // Buscar postulante
        const postulante = await SedinvitaPostulante.findOne({
            edicionId: edicionActiva._id,
            codigoMatricula: codigoLimpio,
            estadoGeneral: 'habilitado'
        }).lean();

        if (!postulante) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Código de matrícula no válido o no habilitado para este proceso',
                    code: 'POSTULANTE_NO_ENCONTRADO'
                },
                { status: 404 }
            );
        }

        // Verificar si el postulante ya eligió un turno en la fase actual
        const yaTieneTurno = postulante.turnoId !== null && 
                           postulante.estadoOperativo === 'turno_elegido';

        if (yaTieneTurno) {
            // Obtener información del turno elegido
            const SedinvitaTurno = (await import('@/models/sedinvita/SedinvitaTurno')).default;
            const turnoElegido = await SedinvitaTurno.findById(postulante.turnoId).lean();
            
            return NextResponse.json({
                success: false,
                error: 'Ya has seleccionado un turno para esta fase',
                code: 'YA_TIENE_TURNO',
                data: {
                    postulante: {
                        codigoMatricula: postulante.codigoMatricula,
                        nombres: postulante.nombres,
                        apellidos: postulante.apellidos
                    },
                    turnoActual: turnoElegido ? {
                        nombre: turnoElegido.nombre,
                        horarioInicio: formatearHora(turnoElegido.horarioInicio),
                        horarioFin: formatearHora(turnoElegido.horarioFin),
                        fase: turnoElegido.fase
                    } : null
                }
            }, { status: 409 });
        }

        // Verificar que el postulante esté en la fase correcta
        // Por defecto fase2, pero podría ser dinámico
        const faseActual = postulante.faseActual || 'fase2';

        return NextResponse.json({
            success: true,
            data: {
                postulante: {
                    codigoMatricula: postulante.codigoMatricula,
                    nombres: postulante.nombres,
                    apellidos: postulante.apellidos,
                    faseActual: faseActual,
                    estadoOperativo: postulante.estadoOperativo
                },
                edicion: {
                    id: edicionActiva._id,
                    nombre: edicionActiva.nombre,
                    anio: edicionActiva.anio
                }
            }
        });

    } catch (error) {
        console.error('Error al validar postulante:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

// Función para formatear hora "08:00" a "8:00 AM" o "17:00" a "5:00 PM"
function formatearHora(horarioInicio) {
    if (!horarioInicio) return 'Hora no disponible';
    
    try {
        // Si es un string con formato "HH:MM"
        if (typeof horarioInicio === 'string' && horarioInicio.includes(':')) {
            const [hora, minuto] = horarioInicio.split(':').map(Number);
            
            if (isNaN(hora) || isNaN(minuto)) return horarioInicio;
            
            const periodo = hora >= 12 ? 'PM' : 'AM';
            const hora12 = hora === 0 ? 12 : hora > 12 ? hora - 12 : hora;
            
            return `${hora12}:${minuto.toString().padStart(2, '0')} ${periodo}`;
        }
        
        // Si es un objeto Date o string con fecha completa
        const fecha = new Date(horarioInicio);
        if (!isNaN(fecha.getTime())) {
            const hora = fecha.getHours();
            const minuto = fecha.getMinutes();
            const periodo = hora >= 12 ? 'PM' : 'AM';
            const hora12 = hora === 0 ? 12 : hora > 12 ? hora - 12 : hora;
            
            return `${hora12}:${minuto.toString().padStart(2, '0')} ${periodo}`;
        }
        
        return horarioInicio;
    } catch (error) {
        return horarioInicio;
    }
}