// src/app/api/sedinvita/postulantes/por-area/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaPostulanteArea from '@/models/sedinvita/SedinvitaPostulanteArea';

const NOMBRES_AREAS = {
    gth: 'GTH',
    pmo: 'PMO',
    ti: 'TI',
    mkt: 'MKT',
    ltkyfnz: 'LTK & FNZ'
};

async function authenticate() {
    const cookieStore = await cookies();
    // CAMBIADO: usar auth_token en lugar de sedipro_token
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function GET() {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const edicion = await SedinvitaEdicion.findOne({ activa: true });
        if (!edicion) {
            return NextResponse.json(
                { error: 'No hay edición activa' },
                { status: 404 }
            );
        }

        const registros = await SedinvitaPostulanteArea.find({
            edicionId: edicion._id
        }).populate('postulanteId', 'codigoMatricula nombres apellidos correoElectronico numeroCelular');

        const agrupado = {};
        const areasIds = ['gth', 'pmo', 'ti', 'mkt', 'ltkyfnz'];

        areasIds.forEach(areaId => {
            agrupado[areaId] = {
                area: areaId,
                nombre: NOMBRES_AREAS[areaId],
                postulantes: []
            };
        });

        registros.forEach(registro => {
            if (registro.postulanteId && agrupado[registro.area]) {
                agrupado[registro.area].postulantes.push({
                    codigoMatricula: registro.postulanteId.codigoMatricula,
                    nombres: registro.postulanteId.nombres,
                    apellidos: registro.postulanteId.apellidos,
                    correoElectronico: registro.postulanteId.correoElectronico,
                    numeroCelular: registro.postulanteId.numeroCelular,
                    fechaEleccion: registro.fechaEleccion,
                });
            }
        });

        const resultado = Object.values(agrupado);
        const total = registros.length;

        return NextResponse.json({
            success: true,
            areas: resultado,
            total
        });

    } catch (error) {
        console.error('Error en por-area:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}