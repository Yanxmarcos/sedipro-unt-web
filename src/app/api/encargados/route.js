import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import EncargadoAsistencia from '@/models/EncargadoAsistencia'
import Sediprano from '@/models/Sediprano'
import Asistencia from '@/models/Asistencia'

export async function POST(request) {
    try {
        await connectToDatabase()
        const { asistenciaId, sedipranoId } = await request.json()

        if (!asistenciaId || !sedipranoId) {
            return NextResponse.json(
                { message: 'asistenciaId y sedipranoId son requeridos' },
                { status: 400 }
            )
        }

        // Verificar que la asistencia existe
        const asistencia = await Asistencia.findById(asistenciaId).lean()
        if (!asistencia) {
            return NextResponse.json({ message: 'Asistencia no encontrada' }, { status: 404 })
        }

        // Verificar que el sediprano existe y NO es DIRECTIVA
        const sediprano = await Sediprano.findById(sedipranoId).lean()
        if (!sediprano) {
            return NextResponse.json({ message: 'Sediprano no encontrado' }, { status: 404 })
        }
        if (sediprano.area?.toUpperCase() === 'DIRECTIVA') {
            return NextResponse.json(
                { message: 'Los miembros de Directiva no pueden ser encargados' },
                { status: 400 }
            )
        }

        // Verificar que este sediprano no esté ya asignado a esta asistencia
        const yaAsignado = await EncargadoAsistencia.findOne({ asistenciaId, sedipranoId }).lean()
        if (yaAsignado) {
            return NextResponse.json(
                { message: `${sediprano.nombres} ${sediprano.apellidos} ya es encargado de esta asistencia` },
                { status: 409 }
            )
        }

        const otrasAsignaciones = await EncargadoAsistencia.find({ 
            sedipranoId, 
            asistenciaId: { $ne: asistenciaId }
        }).lean()

        if (otrasAsignaciones.length > 0) {
            const otrasAsistenciasIds = otrasAsignaciones.map(e => e.asistenciaId)
            const otrasAsistencias = await Asistencia.find({ 
                _id: { $in: otrasAsistenciasIds } 
            }).lean()
            
            const asistenciaMap = new Map()
            otrasAsistencias.forEach(a => {
                asistenciaMap.set(a._id.toString(), {
                    descripcion: a.descripcion,
                    fecha: a.fecha
                })
            })
            
            const conflictos = otrasAsignaciones.map(enc => {
                const asistenciaData = asistenciaMap.get(enc.asistenciaId.toString())
                const fechaFormateada = asistenciaData?.fecha 
                    ? new Date(asistenciaData.fecha).toLocaleDateString('es-PE')
                    : 'Fecha no disponible'
                return `"${asistenciaData?.descripcion || 'Sin descripción'}" (${fechaFormateada})`
            }).join(', ')
            
            const mensaje = `${sediprano.nombres} ${sediprano.apellidos} ya está asignado como encargado en la siguiente asistencia: ${conflictos}. Por favor, elimínelo de esa asistencia antes de asignarlo a "${asistencia.descripcion}" (${new Date(asistencia.fecha).toLocaleDateString('es-PE')})`
            
            return NextResponse.json({ 
                message: mensaje,
                conflictos: otrasAsignaciones.map(enc => ({
                    encargadoId: enc._id,
                    asistenciaId: enc.asistenciaId,
                    descripcion: asistenciaMap.get(enc.asistenciaId.toString())?.descripcion,
                    fecha: asistenciaMap.get(enc.asistenciaId.toString())?.fecha
                }))
            }, { status: 409 })
        }

        const encargado = new EncargadoAsistencia({
            asistenciaId,
            sedipranoId,
            nombres:      sediprano.nombres,
            apellidos:    sediprano.apellidos,
            dni:          sediprano.dni,
            passwordHash: sediprano.dni, // El DNI es la contraseña, el pre-save lo hashea
        })

        await encargado.save()

        return NextResponse.json({
            encargado: {
                _id:          encargado._id,
                asistenciaId: encargado.asistenciaId,
                sedipranoId:  encargado.sedipranoId,
                nombres:      encargado.nombres,
                apellidos:    encargado.apellidos,
                dni:          encargado.dni,
            }
        }, { status: 201 })

    } catch (error) {
        console.error('[POST /api/encargados]', error)
        return NextResponse.json({ message: 'Error al asignar encargado' }, { status: 500 })
    }
}