// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import EncargadoAsistencia from '@/models/EncargadoAsistencia'
import { generateToken } from '@/lib/jwt'

export async function POST(request) {
    try {
        const body = await request.json()
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json(
                { message: 'Usuario y contraseña son requeridos' },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // ── 1. Buscar en la colección de users (directiva/admin) ──────────────
        const user = await User.findOne({
            $or: [
                { user: username },
                { dni: username }
            ]
        })

        if (user) {
            const isValidPassword = await user.comparePassword(password)
            if (!isValidPassword) {
                return NextResponse.json(
                    { message: 'Credenciales inválidas' },
                    { status: 401 }
                )
            }

            user.lastLogin = new Date()
            await user.save()

            const token = generateToken(user)

            const response = NextResponse.json({
                message: 'Login exitoso',
                user: user.toPublicJSON(),
                redirectTo: '/panel',
            }, { status: 200 })

            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 6, // 6 horas
            })

            return response
        }

        // ── 2. No está en users → buscar en encargados_asistencia ─────────────
        const encargado = await EncargadoAsistencia.findOne({ dni: username })

        if (!encargado) {
            return NextResponse.json(
                { message: 'Credenciales inválidas' },
                { status: 401 }
            )
        }

        const isValidDni = await encargado.comparePassword(password)
        if (!isValidDni) {
            return NextResponse.json(
                { message: 'Credenciales inválidas' },
                { status: 401 }
            )
        }

        // Generar token con rol ENCARGADO e incluir asistenciaId
        const tokenPayload = {
            _id: encargado._id,
            user: encargado.dni,
            nombres: encargado.nombres,
            apellidos: encargado.apellidos,
            rol: 'ENCARGADO',
            dni: encargado.dni,
            asistenciaId: encargado.asistenciaId.toString(),
        }

        const token = generateToken(tokenPayload)
        const redirectTo = `/registro/${encargado.asistenciaId}`

        const response = NextResponse.json({
            message: 'Login exitoso',
            user: tokenPayload,
            redirectTo,
        }, { status: 200 })

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 8, // 8 horas para el encargado
        })

        return response

    } catch (error) {
        console.error('[API] Error en login:', error)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}