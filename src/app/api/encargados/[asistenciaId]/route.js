import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import EncargadoAsistencia from '@/models/EncargadoAsistencia'

export async function GET(request, { params }) {
    try {
        await connectToDatabase()
        const { asistenciaId } = await params

        const encargados = await EncargadoAsistencia.find({ asistenciaId }).lean()

        return NextResponse.json({
            encargados: encargados.map(e => ({
                _id:          e._id,
                asistenciaId: e.asistenciaId,
                sedipranoId:  e.sedipranoId,
                nombres:      e.nombres,
                apellidos:    e.apellidos,
                dni:          e.dni,
            }))
        })
    } catch (error) {
        console.error('[GET /api/encargados/[asistenciaId]]', error)
        return NextResponse.json({ message: 'Error al obtener encargados' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDatabase()
        const { asistenciaId } = await params
        const { searchParams } = new URL(request.url)
        const encargadoId = searchParams.get('id')

        if (encargadoId) {
            // Eliminar uno específico
            const encargado = await EncargadoAsistencia.findOneAndDelete({
                _id: encargadoId,
                asistenciaId,
            })
            if (!encargado) {
                return NextResponse.json({ message: 'Encargado no encontrado' }, { status: 404 })
            }
            return NextResponse.json({ message: 'Encargado eliminado correctamente' })
        }

        // Eliminar todos (cuando se borra la asistencia)
        await EncargadoAsistencia.deleteMany({ asistenciaId })
        return NextResponse.json({ message: 'Encargados eliminados correctamente' })

    } catch (error) {
        console.error('[DELETE /api/encargados/[asistenciaId]]', error)
        return NextResponse.json({ message: 'Error al eliminar encargado' }, { status: 500 })
    }
}