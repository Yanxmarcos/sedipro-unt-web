import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Asistencia from '@/models/Asistencia'
import Sediprano from '@/models/Sediprano'
import Votacion from '@/models/Votacion'

export async function GET(request, { params }) {
    try {
        await connectToDatabase()
        const { id } = await params

        const asistencia = await Asistencia.findById(id).lean()
        if (!asistencia) {
            return NextResponse.json({ message: 'Asistencia no encontrada' }, { status: 404 })
        }

        const sedipranoIds = asistencia.registro.map(r => r.sedipranoId)
        const sedipranos = await Sediprano.find({ _id: { $in: sedipranoIds } }).lean()
        const sedipranoMap = Object.fromEntries(sedipranos.map(s => [s._id.toString(), s]))

        const registroCompleto = asistencia.registro.map(r => ({
            sedipranoId: r.sedipranoId,
            estado: r.estado,
            sediprano: sedipranoMap[r.sedipranoId.toString()] || null,
        }))

        const votacionesCount = await Votacion.countDocuments({ asistenciaId: id })

        return NextResponse.json({
            asistencia: { ...asistencia, registro: registroCompleto },
            votacionesVinculadas: votacionesCount,
        })
    } catch (error) {
        console.error('[GET /api/asistencias/[id]]', error)
        return NextResponse.json({ message: 'Error al obtener asistencia' }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
    try {
        await connectToDatabase()
        const { id } = await params
        const { fecha, descripcion, registro } = await request.json()

        const asistencia = await Asistencia.findById(id)
        if (!asistencia) {
            return NextResponse.json({ message: 'Asistencia no encontrada' }, { status: 404 })
        }

        if (fecha) asistencia.fecha = new Date(fecha)
        if (descripcion) asistencia.descripcion = descripcion.trim()

        if (registro) {
            asistencia.registro = registro.map(r => ({
                sedipranoId: r.sedipranoId,
                estado: r.estado,
            }))

            const presentes = registro.filter(r => r.estado === 'presente').length
            const justificados = registro.filter(r => r.estado === 'justificado').length
            const ausentes = registro.filter(r => r.estado === 'ausente').length

            asistencia.resumen = { presentes, ausentes, justificados }
        }

        await asistencia.save()
        return NextResponse.json({ asistencia })
    } catch (error) {
        console.error('[PUT /api/asistencias/[id]]', error)
        return NextResponse.json({ message: 'Error al actualizar asistencia' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDatabase()
        const { id } = await params

        const votacionesCount = await Votacion.countDocuments({ asistenciaId: id })
        if (votacionesCount > 0) {
            return NextResponse.json({
                message: `Esta asistencia tiene ${votacionesCount} votación(es) vinculada(s). Elimina primero las votaciones para poder eliminar esta asistencia.`,
                hasVotaciones: true,
                votacionesCount,
            }, { status: 409 })
        }

        const asistencia = await Asistencia.findByIdAndDelete(id)
        if (!asistencia) {
            return NextResponse.json({ message: 'Asistencia no encontrada' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Asistencia eliminada correctamente' })
    } catch (error) {
        console.error('[DELETE /api/asistencias/[id]]', error)
        return NextResponse.json({ message: 'Error al eliminar asistencia' }, { status: 500 })
    }
}