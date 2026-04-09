// src/app/api/asistencias/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Asistencia from '@/models/Asistencia'
import Sediprano from '@/models/Sediprano'
import EncargadoAsistencia from '@/models/EncargadoAsistencia'

export async function GET() {
    try {
        await connectToDatabase()
        const asistencias = await Asistencia.find({}).sort({ fecha: -1 }).lean()

        // Obtener todos los encargados de una sola consulta (eficiente)
        const encargados = await EncargadoAsistencia.find({}).lean()
        const encargadoMap = Object.fromEntries(
            encargados.map(e => [e.asistenciaId.toString(), {
                _id: e._id,
                nombres: e.nombres,
                apellidos: e.apellidos,
                dni: e.dni,
                sedipranoId: e.sedipranoId,
            }])
        )

        // Agregar info del encargado a cada asistencia
        const asistenciasConEncargado = asistencias.map(a => ({
            ...a,
            encargado: encargadoMap[a._id.toString()] || null,
        }))

        return NextResponse.json({ asistencias: asistenciasConEncargado })
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