import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Asistencia from '@/models/Asistencia'
import Sediprano from '@/models/Sediprano'
import EncargadoAsistencia from '@/models/EncargadoAsistencia'
import { verifyToken } from '@/lib/jwt'
import { getTokenFromRequest } from '@/lib/cookies'

const ESTADOS_PERMITIDOS = ['presente', 'tardanza']

export async function POST(request, { params }) {
    try {
        await connectToDatabase()
        const { asistenciaId } = await params
        const { dni, estado = 'presente' } = await request.json()

        if (!dni?.trim()) {
            return NextResponse.json({ message: 'El DNI es requerido' }, { status: 400 })
        }

        if (!ESTADOS_PERMITIDOS.includes(estado)) {
            return NextResponse.json(
                { message: 'Estado no válido. Debe ser "presente" o "tardanza"' },
                { status: 400 }
            )
        }

        const token   = getTokenFromRequest(request)
        const decoded = token ? verifyToken(token) : null

        if (!decoded || decoded.rol !== 'ENCARGADO') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
        }

        const encargados = await EncargadoAsistencia.find({ asistenciaId }).lean()

        if (!encargados.length) {
            return NextResponse.json(
                { message: 'Ya no tienes acceso a esta asistencia. Contacta a la directiva.' },
                { status: 403 }
            )
        }

        const esEncargadoActual = encargados.some(e => e.dni === decoded.dni)
        if (!esEncargadoActual) {
            return NextResponse.json(
                { message: 'Tu acceso ha sido revocado. Ya no eres encargado de esta asistencia.' },
                { status: 403 }
            )
        }

        const sediprano = await Sediprano.findOne({ dni: dni.trim() }).lean()
        if (!sediprano) {
            return NextResponse.json(
                { message: 'No se encontró ningún sediprano con ese DNI' },
                { status: 404 }
            )
        }

        const asistencia = await Asistencia.findById(asistenciaId)
        if (!asistencia) {
            return NextResponse.json({ message: 'Asistencia no encontrada' }, { status: 404 })
        }

        const idx = asistencia.registro.findIndex(
            r => r.sedipranoId.toString() === sediprano._id.toString()
        )

        if (idx === -1) {
            return NextResponse.json(
                { message: `${sediprano.nombres} ${sediprano.apellidos} no está en el registro de esta asistencia` },
                { status: 404 }
            )
        }

        const estadoActual = asistencia.registro[idx].estado

        if (estadoActual !== 'ausente') {
            const etiquetas = {
                presente:    'presente ✓',
                justificado: 'justificado',
                tardanza:    'tardanza ⏰',
            }
            return NextResponse.json({
                message: `${sediprano.nombres} ${sediprano.apellidos} ya fue marcado como ${etiquetas[estadoActual] ?? estadoActual}`,
                yaRegistrado: true,
                sediprano: {
                    nombres:   sediprano.nombres,
                    apellidos: sediprano.apellidos,
                    area:      sediprano.area,
                },
                estadoActual,
            })
        }

        // Marcar con el estado elegido y recalcular resumen
        asistencia.registro[idx].estado = estado
        asistencia.registro[idx].hora = new Date()
        const primerNombre = (decoded.nombres || '').split(' ')[0]
        const primerApellido = (decoded.apellidos || '').split(' ')[0]
        asistencia.registro[idx].registradoPor = `${primerNombre} ${primerApellido}`.trim() || decoded.dni

        asistencia.resumen = {
            presentes:    asistencia.registro.filter(r => r.estado === 'presente').length,
            ausentes:     asistencia.registro.filter(r => r.estado === 'ausente').length,
            justificados: asistencia.registro.filter(r => r.estado === 'justificado').length,
            tardanzas:    asistencia.registro.filter(r => r.estado === 'tardanza').length,
        }

        await asistencia.save()

        const etiquetaEstado = estado === 'tardanza' ? 'tardanza ⏰' : 'presente ✓'

        return NextResponse.json({
            message: `¡${sediprano.nombres} ${sediprano.apellidos} registrado como ${etiquetaEstado}!`,
            sediprano: {
                nombres:   sediprano.nombres,
                apellidos: sediprano.apellidos,
                area:      sediprano.area,
            },
            estadoActual: estado,
        })

    } catch (error) {
        return NextResponse.json({ message: 'Error al registrar asistencia' }, { status: 500 })
    }
}