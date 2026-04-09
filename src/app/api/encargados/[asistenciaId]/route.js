// src/app/api/encargados/[asistenciaId]/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import EncargadoAsistencia from '@/models/EncargadoAsistencia'

// GET /api/encargados/[asistenciaId] — Obtener encargado de una asistencia
export async function GET(request, { params }) {
    try {
        await connectToDatabase()
        const { asistenciaId } = await params

        const encargado = await EncargadoAsistencia.findOne({ asistenciaId }).lean()
        if (!encargado) {
            return NextResponse.json({ encargado: null })
        }

        return NextResponse.json({
            encargado: {
                _id: encargado._id,
                asistenciaId: encargado.asistenciaId,
                sedipranoId: encargado.sedipranoId,
                nombres: encargado.nombres,
                apellidos: encargado.apellidos,
                dni: encargado.dni,
            }
        })
    } catch (error) {
        console.error('[GET /api/encargados/[asistenciaId]]', error)
        return NextResponse.json({ message: 'Error al obtener encargado' }, { status: 500 })
    }
}

// DELETE /api/encargados/[asistenciaId] — Eliminar encargado
export async function DELETE(request, { params }) {
    try {
        await connectToDatabase()
        const { asistenciaId } = await params

        const encargado = await EncargadoAsistencia.findOneAndDelete({ asistenciaId })
        if (!encargado) {
            return NextResponse.json({ message: 'Encargado no encontrado' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Encargado eliminado correctamente' })
    } catch (error) {
        console.error('[DELETE /api/encargados/[asistenciaId]]', error)
        return NextResponse.json({ message: 'Error al eliminar encargado' }, { status: 500 })
    }
}