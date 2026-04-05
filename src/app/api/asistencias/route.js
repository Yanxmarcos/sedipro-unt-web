import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Asistencia from '@/models/Asistencia'
import Sediprano from '@/models/Sediprano'

export async function GET() {
    try {
        await connectToDatabase()
        const asistencias = await Asistencia.find({}).sort({ fecha: -1 }).lean()
        return NextResponse.json({ asistencias })
    } catch (error) {
        console.error('[GET /api/asistencias]', error)
        return NextResponse.json({ message: 'Error al obtener asistencias' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectToDatabase()
        const { fecha, descripcion } = await request.json()

        if (!fecha || !descripcion?.trim()) {
            return NextResponse.json({ message: 'Fecha y descripción son requeridos' }, { status: 400 })
        }

        const sedipranos = await Sediprano.find({}, '_id').lean()
        const registro = sedipranos.map(s => ({
            sedipranoId: s._id,
            estado: 'ausente',
        }))

        const asistencia = await Asistencia.create({
            fecha: new Date(fecha + 'T00:00:00-05:00'),
            descripcion: descripcion.trim(),
            registro,
            resumen: {
                presentes: 0,
                ausentes: sedipranos.length,
                justificados: 0,
            },
        })

        return NextResponse.json({ asistencia }, { status: 201 })
    } catch (error) {
        console.error('[POST /api/asistencias]', error)
        return NextResponse.json({ message: 'Error al crear asistencia' }, { status: 500 })
    }
}