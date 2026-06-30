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
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function GET() {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await connectToDatabase();

        const edicion = await SedinvitaEdicion.findOne({ activa: true });
        if (!edicion) {
            return NextResponse.json({ error: 'No hay edición activa' }, { status: 404 });
        }

        const registros = await SedinvitaPostulanteArea.find({
            edicionId: edicion._id
        }).populate('postulanteId', 'codigoMatricula nombres apellidos correoElectronico numeroCelular');

        const areasIds = ['gth', 'pmo', 'ti', 'mkt', 'ltkyfnz'];

        // ── Agrupación por ÁREA PRINCIPAL (sin cambios respecto al original) ──
        const agrupado = {};
        areasIds.forEach(areaId => {
            agrupado[areaId] = { area: areaId, nombre: NOMBRES_AREAS[areaId], postulantes: [] };
        });

        // ── NUEVO: Agrupación por ÁREA SECUNDARIA ───────────────────────────
        const agrupadoSecundaria = {};
        areasIds.forEach(areaId => {
            agrupadoSecundaria[areaId] = { area: areaId, nombre: NOMBRES_AREAS[areaId], postulantes: [] };
        });

        // NUEVO: postulantes que ya tienen principal pero aún no eligieron secundaria
        const postulantesSinSecundaria = [];

        registros.forEach(registro => {
            if (!registro.postulanteId) return;

            const datosBase = {
                codigoMatricula: registro.postulanteId.codigoMatricula,
                nombres: registro.postulanteId.nombres,
                apellidos: registro.postulanteId.apellidos,
                correoElectronico: registro.postulanteId.correoElectronico,
                numeroCelular: registro.postulanteId.numeroCelular,
            };

            // Principal — igual que antes
            if (agrupado[registro.area]) {
                agrupado[registro.area].postulantes.push({
                    ...datosBase,
                    fechaEleccion: registro.fechaEleccion,
                });
            }

            // Secundaria — NUEVO
            if (registro.areaSecundaria && agrupadoSecundaria[registro.areaSecundaria]) {
                agrupadoSecundaria[registro.areaSecundaria].postulantes.push({
                    ...datosBase,
                    areaPrincipal: registro.area,
                    nombreAreaPrincipal: NOMBRES_AREAS[registro.area],
                    fechaEleccion: registro.areaSecundariaFecha,
                });
            } else if (!registro.areaSecundaria) {
                // Tiene principal pero no ha elegido segunda opción
                postulantesSinSecundaria.push({
                    ...datosBase,
                    areaPrincipal: registro.area,
                    nombreAreaPrincipal: NOMBRES_AREAS[registro.area],
                    fechaEleccionPrincipal: registro.fechaEleccion,
                });
            }
        });

        const resultado = Object.values(agrupado);
        const resultadoSecundaria = Object.values(agrupadoSecundaria);
        const total = registros.length;
        const totalSecundaria = registros.filter(r => !!r.areaSecundaria).length;

        return NextResponse.json({
            success: true,
            // ── Sin cambios (compatibilidad total con el panel actual) ──
            areas: resultado,
            total,
            // ── NUEVO ──
            areasSecundaria: resultadoSecundaria,
            totalSecundaria,
            postulantesSinSecundaria,
        });

    } catch (error) {
        console.error('Error en por-area:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}