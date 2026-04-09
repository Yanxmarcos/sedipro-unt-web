// src/app/api/registro/[asistenciaId]/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Asistencia from '@/models/Asistencia'
import Sediprano from '@/models/Sediprano'
import EncargadoAsistencia from '@/models/EncargadoAsistencia'
import { verifyToken } from '@/lib/jwt'
import { getTokenFromRequest } from '@/lib/cookies'

export async function POST(request, { params }) {
    try {
        await connectToDatabase()
        const { asistenciaId } = await params
        const { dni } = await request.json()

        if (!dni?.trim()) {
            return NextResponse.json({ message: 'El DNI es requerido' }, { status: 400 })
        }

        // ── 1. Verificar el token del request ─────────────────────────────────
        const token   = getTokenFromRequest(request)
        const decoded = token ? verifyToken(token) : null

        if (!decoded || decoded.rol !== 'ENCARGADO') {
            return NextResponse.json(
                { message: 'No autorizado' },
                { status: 401 }
            )
        }

        // ── 2. Buscar el encargado ACTUALMENTE asignado en la BD ──────────────
        const encargado = await EncargadoAsistencia.findOne({ asistenciaId }).lean()

        if (!encargado) {
            return NextResponse.json(
                { message: 'Ya no tienes acceso a esta asistencia. Contacta a la directiva.' },
                { status: 403 }
            )
        }

        // ── 3. Validar que el token pertenece al encargado actual ─────────────
        if (decoded.dni !== encargado.dni) {
            return NextResponse.json(
                { message: 'Tu acceso ha sido revocado. Ya no eres el encargado de esta asistencia.' },
                { status: 403 }
            )
        }

        // ── 4. Buscar sediprano por DNI ingresado ─────────────────────────────
        const sediprano = await Sediprano.findOne({ dni: dni.trim() }).lean()
        if (!sediprano) {
            return NextResponse.json(
                { message: 'No se encontró ningún sediprano con ese DNI' },
                { status: 404 }
            )
        }

        // ── 5. Buscar y actualizar la asistencia ──────────────────────────────
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

        // ── Solo se puede marcar como presente si está ausente ────────────────
        // justificado y tardanza son estados asignados desde el panel (directiva)
        // y el encargado no debe sobreescribirlos
        if (estadoActual !== 'ausente') {
            const etiquetas = {
                presente:    'presente ✓',
                justificado: 'justificado',
                tardanza:    'tardanza',
            }
            return NextResponse.json({
                message: `${sediprano.nombres} ${sediprano.apellidos} ya fue marcado como ${etiquetas[estadoActual] ?? estadoActual}`,
                yaRegistrado: true,
                sediprano: {
                    nombres: sediprano.nombres,
                    apellidos: sediprano.apellidos,
                    area: sediprano.area,
                },
                estadoActual,
            })
        }

        // Marcar presente y recalcular resumen
        asistencia.registro[idx].estado = 'presente'

        asistencia.resumen = {
            presentes:    asistencia.registro.filter(r => r.estado === 'presente').length,
            ausentes:     asistencia.registro.filter(r => r.estado === 'ausente').length,
            justificados: asistencia.registro.filter(r => r.estado === 'justificado').length,
            tardanzas:    asistencia.registro.filter(r => r.estado === 'tardanza').length,
        }

        await asistencia.save()

        return NextResponse.json({
            message: `¡${sediprano.nombres} ${sediprano.apellidos} registrado como presente!`,
            sediprano: {
                nombres: sediprano.nombres,
                apellidos: sediprano.apellidos,
                area: sediprano.area,
            },
            estadoActual: 'presente',
        })

    } catch (error) {
        console.error('[POST /api/registro/[asistenciaId]]', error)
        return NextResponse.json({ message: 'Error al registrar asistencia' }, { status: 500 })
    }
}