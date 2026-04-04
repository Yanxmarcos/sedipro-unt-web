import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Votacion from '@/models/Votacion'
import Voto from '@/models/Voto'
import Asistencia from '@/models/Asistencia'
import Sediprano from '@/models/Sediprano'

export async function POST(request, { params }) {
    try {
        await connectToDatabase()
        const { id } = await params
        const { sedipranoId, opcionSeleccionada } = await request.json()

        if (!sedipranoId || !opcionSeleccionada) {
            return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 })
        }

        const votacion = await Votacion.findById(id)
        if (!votacion) return NextResponse.json({ message: 'Votación no encontrada' }, { status: 404 })
        if (votacion.estado === 'cerrada') return NextResponse.json({ message: 'Esta votación está cerrada' }, { status: 400 })

        // Verificar fecha de cierre
        if (votacion.fechaCierre && new Date() > new Date(votacion.fechaCierre)) {
            return NextResponse.json({ message: 'El plazo de votación ha vencido' }, { status: 400 })
        }

        // Verificar fecha de inicio
        if (votacion.fechaInicio && new Date() < new Date(votacion.fechaInicio)) {
            return NextResponse.json({ message: 'La votación aún no ha comenzado' }, { status: 400 })
        }

        // Verificar que la opción existe
        if (!votacion.opciones.includes(opcionSeleccionada)) {
            return NextResponse.json({ message: 'Opción inválida' }, { status: 400 })
        }

        // Verificar que el sediprano está presente en la asistencia
        const asistencia = await Asistencia.findById(votacion.asistenciaId).lean()
        if (!asistencia) return NextResponse.json({ message: 'Asistencia vinculada no encontrada' }, { status: 404 })

        const estaPresente = asistencia.registro.some(
            r => r.sedipranoId.toString() === sedipranoId && r.estado === 'presente'
        )
        if (!estaPresente) return NextResponse.json({ message: 'Solo los presentes en la asistencia pueden votar' }, { status: 403 })

        // Verificar doble voto
        const yaVoto = await Voto.findOne({ votacionId: id, sedipranoId })
        if (yaVoto) return NextResponse.json({ message: 'Ya registraste tu voto en esta votación' }, { status: 409 })

        // Registrar voto
        await Voto.create({ votacionId: id, sedipranoId, opcionSeleccionada, fechaVoto: new Date() })

        // Actualizar resumen atómicamente
        await Votacion.updateOne(
            { _id: id, 'resumen.opciones.opcion': opcionSeleccionada },
            { $inc: { 'resumen.totalVotos': 1, 'resumen.opciones.$.votos': 1 } }
        )

        return NextResponse.json({ message: 'Voto registrado correctamente' }, { status: 201 })
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Ya registraste tu voto en esta votación' }, { status: 409 })
        }
        console.error('[POST /api/votaciones/[id]/votar]', error)
        return NextResponse.json({ message: 'Error al registrar voto' }, { status: 500 })
    }
}