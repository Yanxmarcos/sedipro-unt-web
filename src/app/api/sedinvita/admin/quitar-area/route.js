// src/app/api/sedinvita/admin/quitar-area/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import SedinvitaEdicion from '@/models/sedinvita/SedinvitaEdicion';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaPostulanteArea from '@/models/sedinvita/SedinvitaPostulanteArea';

async function authenticate() {
    try {
        const cookieStore = await cookies();
        let token = cookieStore.get('auth_token')?.value;
        if (!token) {
            token = cookieStore.get('sedipro_token')?.value;
        }
        if (!token) return null;
        return verifyToken(token);
    } catch (error) {
        console.error('Error en authenticate:', error);
        return null;
    }
}

export async function DELETE(request) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const codigo = searchParams.get('codigo');
        // NUEVO: 'principal' (default, comportamiento original) | 'secundaria'
        const tipo = searchParams.get('tipo') || 'principal';
        const esSecundaria = tipo === 'secundaria';

        console.log('🔍 Buscando código:', codigo, '| tipo:', tipo);

        if (!codigo) {
            return NextResponse.json({ error: 'Código de matrícula requerido' }, { status: 400 });
        }

        const codigoLimpio = codigo.replace(/\D/g, '');
        if (codigoLimpio.length !== 10) {
            return NextResponse.json({ error: 'El código debe tener exactamente 10 dígitos' }, { status: 400 });
        }

        const edicion = await SedinvitaEdicion.findOne({ activa: true });
        console.log('📘 Edición activa:', edicion?._id);

        if (!edicion) {
            return NextResponse.json({ error: 'No hay edición activa' }, { status: 404 });
        }

        const postulante = await SedinvitaPostulante.findOne({
            edicionId: edicion._id,
            codigoMatricula: codigoLimpio
        });

        console.log('👤 Postulante encontrado:', postulante?._id);

        if (!postulante) {
            return NextResponse.json({ error: 'Postulante no encontrado' }, { status: 404 });
        }

        const areaRegistro = await SedinvitaPostulanteArea.findOne({
            edicionId: edicion._id,
            postulanteId: postulante._id
        });

        console.log('📋 Área registro:', areaRegistro);

        if (!areaRegistro) {
            return NextResponse.json({ error: 'El postulante no tiene área asignada' }, { status: 404 });
        }

        // ──────────────────────────────────────────────────────────────────
        // NUEVO: Quitar solo el área secundaria (no toca la principal)
        // ──────────────────────────────────────────────────────────────────
        if (esSecundaria) {
            if (!areaRegistro.areaSecundaria) {
                return NextResponse.json(
                    { error: 'El postulante no tiene área de segunda opción asignada' },
                    { status: 404 }
                );
            }

            const areaSecundariaEliminada = areaRegistro.areaSecundaria;
            areaRegistro.areaSecundaria = null;
            areaRegistro.areaSecundariaFecha = null;
            await areaRegistro.save();

            console.log('Área secundaria eliminada:', areaSecundariaEliminada);

            return NextResponse.json({
                success: true,
                mensaje: 'Área de segunda opción eliminada correctamente',
                areaEliminada: areaSecundariaEliminada,
                postulante: {
                    codigoMatricula: postulante.codigoMatricula,
                    nombres: postulante.nombres,
                    apellidos: postulante.apellidos,
                }
            });
        }

        // ──────────────────────────────────────────────────────────────────
        // Quitar área principal — sin cambios respecto al original.
        // Esto borra el documento completo, lo cual también elimina la
        // secundaria si la tenía (correcto: no puede existir secundaria
        // sin principal).
        // ──────────────────────────────────────────────────────────────────
        const areaEliminada = areaRegistro.area;

        await SedinvitaPostulanteArea.deleteOne({ _id: areaRegistro._id });

        console.log('Área eliminada:', areaEliminada);

        return NextResponse.json({
            success: true,
            mensaje: 'Área eliminada correctamente',
            areaEliminada: areaEliminada,
            postulante: {
                codigoMatricula: postulante.codigoMatricula,
                nombres: postulante.nombres,
                apellidos: postulante.apellidos,
            }
        });

    } catch (error) {
        console.error('❌ Error en quitar-area:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}