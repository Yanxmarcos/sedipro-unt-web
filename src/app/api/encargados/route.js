// src/app/api/encargados/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import EncargadoAsistencia from '@/models/EncargadoAsistencia'
import Sediprano from '@/models/Sediprano'
import Asistencia from '@/models/Asistencia'

// POST /api/encargados — Asignar encargado a una asistencia
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

        // Verificar que el sediprano existe y NO es de DIRECTIVA
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

        // Si ya existe encargado para esta asistencia, eliminarlo primero
        await EncargadoAsistencia.findOneAndDelete({ asistenciaId })

        // Crear nuevo encargado — passwordHash se setea al DNI, el pre-save lo hashea
        const encargado = new EncargadoAsistencia({
            asistenciaId,
            sedipranoId,
            nombres: sediprano.nombres,
            apellidos: sediprano.apellidos,
            dni: sediprano.dni,
            passwordHash: sediprano.dni, // El DNI es la contraseña temporal
        })

        await encargado.save()

        return NextResponse.json({
            encargado: {
                _id: encargado._id,
                asistenciaId: encargado.asistenciaId,
                sedipranoId: encargado.sedipranoId,
                nombres: encargado.nombres,
                apellidos: encargado.apellidos,
                dni: encargado.dni,
            }
        }, { status: 201 })

    } catch (error) {
        console.error('[POST /api/encargados]', error)
        return NextResponse.json({ message: 'Error al asignar encargado' }, { status: 500 })
    }
}