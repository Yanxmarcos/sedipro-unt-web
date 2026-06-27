// src/app/api/sedinvita/registro/[turnoId]/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante'
import SedinvitaAsistencia from '@/models/sedinvita/SedinvitaAsistencia'
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno'
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo'
import SedinvitaEncargadoAsistencia from '@/models/sedinvita/SedinvitaEncargadoAsistencia'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

const ESTADOS_PERMITIDOS = ['presente', 'tardanza']

export async function POST(request, { params }) {
    try {
        await connectToDatabase()
        const { turnoId } = await params
        const { codigoMatricula, estado = 'presente' } = await request.json()

        if (!codigoMatricula?.trim()) {
            return NextResponse.json({ message: 'El código de matrícula es requerido' }, { status: 400 })
        }

        if (!ESTADOS_PERMITIDOS.includes(estado)) {
            return NextResponse.json(
                { message: 'Estado no válido. Debe ser "presente" o "tardanza"' },
                { status: 400 }
            )
        }

        // Obtener token de la cookie sedinvita_encargado_token (igual que en verify)
        const cookieStore = await cookies()
        const token = cookieStore.get('sedinvita_encargado_token')?.value
        
        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        if (!decoded || decoded.rol !== 'sedinvita_encargado') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
        }

        // Buscar encargados para este turno (igual que en el archivo que funciona)
        const encargados = await SedinvitaEncargadoAsistencia.find({ turnoId }).lean()

        if (!encargados.length) {
            return NextResponse.json(
                { message: 'Ya no tienes acceso a este turno. Contacta a la directiva.' },
                { status: 403 }
            )
        }

        // Verificar que el encargado actual está en la lista (por DNI)
        const esEncargadoActual = encargados.some(e => e.dni === decoded.dni)
        if (!esEncargadoActual) {
            return NextResponse.json(
                { message: 'Tu acceso ha sido revocado. Ya no eres encargado de este turno.' },
                { status: 403 }
            )
        }

        // Buscar el turno
        const turno = await SedinvitaTurno.findById(turnoId).lean()
        if (!turno) {
            return NextResponse.json({ message: 'Turno no encontrado' }, { status: 404 })
        }

        // Buscar postulante por código de matrícula en esta edición
        const postulante = await SedinvitaPostulante.findOne({
            edicionId: turno.edicionId,
            codigoMatricula: codigoMatricula.trim(),
        }).lean()

        if (!postulante) {
            return NextResponse.json(
                { message: 'No se encontró un postulante con ese código de matrícula' },
                { status: 404 }
            )
        }

        // Verificar que el postulante esté en el turno correcto
        if (postulante.turnoId?.toString() !== turnoId) {
            return NextResponse.json(
                { message: `${postulante.nombres} ${postulante.apellidos} no está en el registro de este turno` },
                { status: 404 }
            )
        }

        // Buscar el grupo del postulante
        const grupo = await SedinvitaGrupo.findOne({
            edicionId: turno.edicionId,
            fase: turno.fase,
            turnoId: turnoId,
            postulantes: postulante._id,
        }).lean()

        // Verificar si ya existe registro de asistencia
        const asistenciaExistente = await SedinvitaAsistencia.findOne({
            turnoId: turnoId,
            postulanteId: postulante._id,
        })

        const encargadoActual = encargados.find(e => e.dni === decoded.dni)

        if (asistenciaExistente) {
            const estadoActual = asistenciaExistente.estado

            if (estadoActual !== 'ausente') {
                const etiquetas = {
                    presente: 'presente ✓',
                    tardanza: 'tardanza ⏰',
                }
                return NextResponse.json({
                    message: `${postulante.nombres} ${postulante.apellidos} ya fue marcado como ${etiquetas[estadoActual] ?? estadoActual}`,
                    yaRegistrado: true,
                    postulante: {
                        nombres: postulante.nombres,
                        apellidos: postulante.apellidos,
                        codigoMatricula: postulante.codigoMatricula,
                        grupo: grupo ? grupo.nombre : null,
                    },
                    estadoActual,
                })
            }

            // Si está ausente, actualizar
            asistenciaExistente.estado = estado
            asistenciaExistente.hora = new Date()
            asistenciaExistente.registradoPor = `${encargadoActual.nombres} ${encargadoActual.apellidos}`
            await asistenciaExistente.save()

            const etiquetaEstado = estado === 'tardanza' ? 'tardanza ⏰' : 'presente ✓'

            return NextResponse.json({
                message: `¡${postulante.nombres} ${postulante.apellidos} registrado como ${etiquetaEstado}!`,
                postulante: {
                    nombres: postulante.nombres,
                    apellidos: postulante.apellidos,
                    codigoMatricula: postulante.codigoMatricula,
                    grupo: grupo ? grupo.nombre : null,
                },
                estadoActual: estado,
            })
        }

        // Crear nuevo registro
        const nuevaAsistencia = await SedinvitaAsistencia.create({
            edicionId: turno.edicionId,
            fase: turno.fase,
            turnoId: turnoId,
            postulanteId: postulante._id,
            estado: estado,
            registradoPor: `${encargadoActual.nombres} ${encargadoActual.apellidos}`,
            hora: new Date(),
            registroManual: false,
        })

        // Actualizar estado operativo del postulante
        await SedinvitaPostulante.findByIdAndUpdate(postulante._id, {
            estadoOperativo: estado === 'presente' ? 'asistio' : 'tardanza'
        })

        const etiquetaEstado = estado === 'tardanza' ? 'tardanza ⏰' : 'presente ✓'

        return NextResponse.json({
            message: `¡${postulante.nombres} ${postulante.apellidos} registrado como ${etiquetaEstado}!`,
            postulante: {
                nombres: postulante.nombres,
                apellidos: postulante.apellidos,
                codigoMatricula: postulante.codigoMatricula,
                grupo: grupo ? grupo.nombre : null,
            },
            estadoActual: estado,
        })

    } catch (error) {
        console.error('Error al registrar asistencia:', error)
        return NextResponse.json({ message: 'Error al registrar asistencia' }, { status: 500 })
    }
}

// GET para buscar postulante por código
export async function GET(request, { params }) {
    try {
        await connectToDatabase()
        const { turnoId } = await params
        const { searchParams } = new URL(request.url)
        const codigoMatricula = searchParams.get('codigo')

        if (!codigoMatricula?.trim()) {
            return NextResponse.json(
                { message: 'El código de matrícula es requerido' },
                { status: 400 }
            )
        }

        // Obtener token de la cookie sedinvita_encargado_token
        const cookieStore = await cookies()
        const token = cookieStore.get('sedinvita_encargado_token')?.value
        
        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        if (!decoded || decoded.rol !== 'sedinvita_encargado') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
        }

        // Verificar que el encargado tiene acceso a este turno
        const encargados = await SedinvitaEncargadoAsistencia.find({ turnoId }).lean()
        if (!encargados.length) {
            return NextResponse.json(
                { message: 'Ya no tienes acceso a este turno' },
                { status: 403 }
            )
        }

        const esEncargadoActual = encargados.some(e => e.dni === decoded.dni)
        if (!esEncargadoActual) {
            return NextResponse.json(
                { message: 'Tu acceso ha sido revocado' },
                { status: 403 }
            )
        }

        // Buscar el turno
        const turno = await SedinvitaTurno.findById(turnoId).lean()
        if (!turno) {
            return NextResponse.json({ message: 'Turno no encontrado' }, { status: 404 })
        }

        // Buscar postulante
        const postulante = await SedinvitaPostulante.findOne({
            edicionId: turno.edicionId,
            codigoMatricula: codigoMatricula.trim(),
        }).lean()

        if (!postulante) {
            return NextResponse.json(
                { message: 'No se encontró un postulante con ese código de matrícula' },
                { status: 404 }
            )
        }

        // Verificar que el postulante esté en el turno correcto
        if (postulante.turnoId?.toString() !== turnoId) {
            return NextResponse.json(
                { message: 'El postulante no pertenece a este turno' },
                { status: 400 }
            )
        }

        // Buscar el grupo del postulante
        const grupo = await SedinvitaGrupo.findOne({
            edicionId: turno.edicionId,
            fase: turno.fase,
            turnoId: turnoId,
            postulantes: postulante._id,
        }).lean()

        // Buscar asistencia existente
        const asistencia = await SedinvitaAsistencia.findOne({
            turnoId: turnoId,
            postulanteId: postulante._id,
        }).lean()

        return NextResponse.json({
            success: true,
            postulante: {
                _id: postulante._id,
                nombres: postulante.nombres,
                apellidos: postulante.apellidos,
                codigoMatricula: postulante.codigoMatricula,
                correoElectronico: postulante.correoElectronico,
                numeroCelular: postulante.numeroCelular,
                grupo: grupo ? grupo.nombre : null,
                grupoId: grupo ? grupo._id : null,
                estadoGeneral: postulante.estadoGeneral,
                estadoOperativo: postulante.estadoOperativo,
            },
            asistencia: asistencia ? {
                _id: asistencia._id,
                estado: asistencia.estado,
                hora: asistencia.hora,
                registradoPor: asistencia.registradoPor,
            } : null
        })

    } catch (error) {
        console.error('Error al buscar postulante:', error)
        return NextResponse.json(
            { message: 'Error al buscar postulante' },
            { status: 500 }
        )
    }
}