import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Votacion from '@/models/Votacion'
import Sediprano from '@/models/Sediprano'
import Voto from '@/models/Voto'

export async function GET(request) {
    try {
        await connectToDatabase()
        const { searchParams } = new URL(request.url)
        const dni = searchParams.get('dni')

        const ahora = new Date()

        const votacion = await Votacion.findOne({
            estado: 'activa',
            $or: [
                { fechaInicio: { $lte: ahora }, fechaCierre: { $gte: ahora } },
                { fechaInicio: { $lte: ahora }, fechaCierre: null },
                { fechaInicio: null, fechaCierre: null },
                { fechaInicio: null, fechaCierre: { $gte: ahora } },
            ]
        }).lean()

        if (!votacion) {
            console.log('Server Time:', new Date().toISOString());
            console.log('Server TZ:', process.env.TZ);
            return NextResponse.json({ activa: false })
        }

        // Si hay DNI, verificar si puede votar
        if (dni) {
            const sediprano = await Sediprano.findOne({ dni }).lean()
            if (!sediprano) {
                return NextResponse.json({ activa: true, votacion, sediprano: null, error: 'DNI no encontrado en el padrón de SEDIPRO' })
            }

            const yaVoto = await Voto.findOne({ votacionId: votacion._id, sedipranoId: sediprano._id }).lean()
            return NextResponse.json({
                activa: true,
                votacion,
                sediprano: { _id: sediprano._id, nombres: sediprano.nombres, apellidos: sediprano.apellidos, dni: sediprano.dni },
                yaVoto: !!yaVoto,
            })
        }

        return NextResponse.json({ activa: true, votacion })
    } catch (error) {
        console.error('[GET /api/votaciones/activa]', error)
        return NextResponse.json({ message: 'Error al verificar votación' }, { status: 500 })
    }
}