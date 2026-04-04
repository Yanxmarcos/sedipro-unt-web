import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Sediprano from '@/models/Sediprano'
import Asistencia from '@/models/Asistencia'
import Votacion from '@/models/Votacion'
import User from '@/models/User'

export async function GET() {
    try {
        await connectToDatabase()

        const [sedipranos, asistencias, votaciones, usuarios] = await Promise.all([
            Sediprano.countDocuments(),
            Asistencia.countDocuments(),
            Votacion.countDocuments(),
            User.countDocuments(),
        ])

        return NextResponse.json({
            sedipranos,
            asistencias,
            votaciones,
            usuarios,
        })
    } catch (error) {
        console.error('[DASHBOARD_STATS]', error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        )
    }
}