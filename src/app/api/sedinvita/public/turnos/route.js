// src/app/api/sedinvita/public/turnos/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';

export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const fase = searchParams.get('fase') || 'fase2';

        // Obtener edición activa
        const edicionActiva = await SedinvitaEdicion.findOne({ 
            activa: true,
            seleccionTurnosAbierta: true
        }).lean();

        if (!edicionActiva) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'No hay una edición activa con selección de turnos disponible',
                    code: 'NO_EDICION_ACTIVA'
                },
                { status: 404 }
            );
        }

        // Obtener turnos de la edición activa para la fase solicitada
        const turnos = await SedinvitaTurno.find({
            edicionId: edicionActiva._id,
            fase: fase,
            estado: { $in: ['abierto', 'lleno'] } // Incluir llenos pero mostrarlos como no disponibles
        })
        .sort({ horarioInicio: 1, nombre: 1 })
        .lean();

        // Formatear turnos para el frontend
        const turnosFormateados = turnos.map(turno => ({
            id: turno._id.toString(),
            nombre: turno.nombre,
            hora_inicio: formatearHora(turno.horarioInicio),
            hora_fin: formatearHora(turno.horarioFin),
            inscritos: turno.inscritos || 0,
            maximo: turno.cupo || 0,
            fase: turno.fase,
            estado: turno.estado,
            nombre: turno.nombre
        }));

        return NextResponse.json({
            success: true,
            data: {
                edicion: {
                    id: edicionActiva._id,
                    nombre: edicionActiva.nombre,
                    anio: edicionActiva.anio
                },
                fase: fase,
                turnos: turnosFormateados,
                total: turnosFormateados.length
            }
        });

    } catch (error) {
        console.error('Error al obtener turnos:', error);
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