import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Votacion from '@/models/Votacion'
import Asistencia from '@/models/Asistencia'

export async function GET() {
    try {
        await connectToDatabase()
        const votaciones = await Votacion.find({}).sort({ createdAt: -1 }).lean()

        const asistenciaIds = [...new Set(votaciones.map(v => v.asistenciaId?.toString()))]
        const asistencias = await Asistencia.find({ _id: { $in: asistenciaIds } }, 'fecha descripcion resumen').lean()
        const asistenciaMap = Object.fromEntries(asistencias.map(a => [a._id.toString(), a]))

        const enriched = votaciones.map(v => ({
            ...v,
            asistencia: asistenciaMap[v.asistenciaId?.toString()] || null,
        }))

        return NextResponse.json({ votaciones: enriched })
    } catch (error) {
        console.error('[GET /api/votaciones]', error)
        return NextResponse.json({ message: 'Error al obtener votaciones' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectToDatabase()
        const { asistenciaId, titulo, tipo, opciones, fechaInicio, fechaCierre } = await request.json()

        if (!asistenciaId) return NextResponse.json({ message: 'Selecciona una asistencia' }, { status: 400 })
        if (!titulo?.trim()) return NextResponse.json({ message: 'El título es requerido' }, { status: 400 })
        if (!tipo) return NextResponse.json({ message: 'El tipo de votación es requerido' }, { status: 400 })

        const asistencia = await Asistencia.findById(asistenciaId).lean()
        if (!asistencia) return NextResponse.json({ message: 'Asistencia no encontrada' }, { status: 404 })
        if (!asistencia.resumen?.presentes || asistencia.resumen.presentes === 0) {
            return NextResponse.json({ message: 'La asistencia no tiene presentes registrados' }, { status: 400 })
        }

        let opcionesFinales = []
        if (tipo === 'binaria') {
            opcionesFinales = ['SI', 'NO']
        } else {
            if (!opciones || opciones.length < 2) return NextResponse.json({ message: 'Mínimo 2 opciones requeridas' }, { status: 400 })
            if (opciones.length > 10) return NextResponse.json({ message: 'Máximo 10 opciones permitidas' }, { status: 400 })
            const opcionesLimpias = opciones.map(o => o.trim()).filter(Boolean)
            const uniqueOpciones = new Set(opcionesLimpias.map(o => o.toLowerCase()))
            if (uniqueOpciones.size !== opcionesLimpias.length) return NextResponse.json({ message: 'No se pueden repetir opciones' }, { status: 400 })
            opcionesFinales = opcionesLimpias
        }

        const votacion = await Votacion.create({
            asistenciaId,
            titulo: titulo.trim(),
            tipo,
            opciones: opcionesFinales,
            estado: 'activa',
            fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
            fechaCierre: fechaCierre ? new Date(fechaCierre) : null,
            resumen: {
                totalVotos: 0,
                opciones: opcionesFinales.map(o => ({ opcion: o, votos: 0 })),
            },
        })

        return NextResponse.json({ votacion }, { status: 201 })
    } catch (error) {
        console.error('[POST /api/votaciones]', error)
        return NextResponse.json({ message: 'Error al crear votación' }, { status: 500 })
    }
}