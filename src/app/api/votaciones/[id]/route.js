import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Votacion from '@/models/Votacion'
import Voto from '@/models/Voto'
import Asistencia from '@/models/Asistencia'
import Sediprano from '@/models/Sediprano'

export async function GET(request, { params }) {
    try {
        await connectToDatabase()
        const { id } = await params

        const votacion = await Votacion.findById(id).lean()
        if (!votacion) return NextResponse.json({ message: 'Votación no encontrada' }, { status: 404 })

        const asistencia = await Asistencia.findById(votacion.asistenciaId).lean()

        // 1. Obtener votos con datos de sedipranos
        const votos = await Voto.find({ votacionId: id }).lean()
        const sedipranoIdsEnVotos = votos.map(v => v.sedipranoId)
        const sedipranosVotantes = await Sediprano.find({ _id: { $in: sedipranoIdsEnVotos } }).lean()
        const sedipranoMap = Object.fromEntries(sedipranosVotantes.map(s => [s._id.toString(), s]))

        const votosEnriquecidos = votos.map(v => ({
            ...v,
            sediprano: sedipranoMap[v.sedipranoId?.toString()] || null,
        }))

        // 2. Obtener HABILITADOS (Presentes + Tardanza) de la asistencia
        let presentes = []
        if (asistencia && asistencia.registro) {
            const registrosHabilitados = asistencia.registro.filter(r => 
                r.estado === 'presente' || r.estado === 'tardanza'
            )

            const habilitadosIds = registrosHabilitados.map(r => r.sedipranoId)
            const sedipranosHabilitados = await Sediprano.find({ _id: { $in: habilitadosIds } }).lean()
            
            const estadoMap = Object.fromEntries(
                registrosHabilitados.map(r => [r.sedipranoId.toString(), r.estado])
            )

            const votadosIds = new Set(votos.map(v => v.sedipranoId?.toString()))

            presentes = sedipranosHabilitados.map(s => ({
                ...s,
                estadoAsistencia: estadoMap[s._id.toString()], // Para saber en el front si fue tardanza
                yaVoto: votadosIds.has(s._id.toString()),
                voto: votos.find(v => v.sedipranoId?.toString() === s._id.toString()) || null,
            }))
        }

        return NextResponse.json({ 
            votacion: { ...votacion, asistencia }, 
            votos: votosEnriquecidos, 
            presentes
        })
    } catch (error) {
        console.error('[GET /api/votaciones/[id]]', error)
        return NextResponse.json({ message: 'Error al obtener votación' }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
    try {
        await connectToDatabase()
        const { id } = await params
        const { titulo, fechaCierre, estado } = await request.json()

        const votacion = await Votacion.findById(id)
        if (!votacion) return NextResponse.json({ message: 'Votación no encontrada' }, { status: 404 })

        const totalVotos = await Voto.countDocuments({ votacionId: id })
        if (totalVotos > 0) {
            return NextResponse.json({ message: 'No se puede editar una votación con votos registrados' }, { status: 400 })
        }

        if (titulo) votacion.titulo = titulo.trim()
        
        if (fechaCierre !== undefined) {
            if (fechaCierre) {
                const [fecha, hora] = fechaCierre.split('T')
                const [h, m] = hora.split(':')
                const fechaPeru = new Date(Date.UTC(
                    parseInt(fecha.split('-')[0]),
                    parseInt(fecha.split('-')[1]) - 1,
                    parseInt(fecha.split('-')[2]),
                    parseInt(h) + 5,
                    parseInt(m)
                ))
                votacion.fechaCierre = fechaPeru
            } else {
                votacion.fechaCierre = null
            }
        }
        
        if (estado && ['activa', 'cerrada'].includes(estado)) votacion.estado = estado

        await votacion.save()
        return NextResponse.json({ votacion })
    } catch (error) {
        console.error('[PUT /api/votaciones/[id]]', error)
        return NextResponse.json({ message: 'Error al actualizar votación' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDatabase()
        const { id } = await params

        const votacion = await Votacion.findById(id)
        if (!votacion) return NextResponse.json({ message: 'Votación no encontrada' }, { status: 404 })

        // Eliminar todos los votos primero
        await Voto.deleteMany({ votacionId: id })
        await Votacion.findByIdAndDelete(id)

        return NextResponse.json({ message: 'Votación eliminada correctamente' })
    } catch (error) {
        console.error('[DELETE /api/votaciones/[id]]', error)
        return NextResponse.json({ message: 'Error al eliminar votación' }, { status: 500 })
    }
}