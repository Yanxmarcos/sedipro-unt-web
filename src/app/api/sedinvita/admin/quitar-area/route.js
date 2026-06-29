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
        // Probar con ambos nombres de cookie
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
        // 1. Autenticación
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        // 2. Obtener parámetros
        const { searchParams } = new URL(request.url);
        const codigo = searchParams.get('codigo');

        console.log('🔍 Buscando código:', codigo); // DEBUG

        if (!codigo) {
            return NextResponse.json(
                { error: 'Código de matrícula requerido' },
                { status: 400 }
            );
        }

        const codigoLimpio = codigo.replace(/\D/g, '');
        if (codigoLimpio.length !== 10) {
            return NextResponse.json(
                { error: 'El código debe tener exactamente 10 dígitos' },
                { status: 400 }
            );
        }

        // 3. Obtener edición activa
        const edicion = await SedinvitaEdicion.findOne({ activa: true });
        console.log('📘 Edición activa:', edicion?._id); // DEBUG

        if (!edicion) {
            return NextResponse.json(
                { error: 'No hay edición activa' },
                { status: 404 }
            );
        }

        // 4. Buscar postulante
        const postulante = await SedinvitaPostulante.findOne({
            edicionId: edicion._id,
            codigoMatricula: codigoLimpio
        });

        console.log('👤 Postulante encontrado:', postulante?._id); // DEBUG

        if (!postulante) {
            return NextResponse.json(
                { error: 'Postulante no encontrado' },
                { status: 404 }
            );
        }

        // 5. Buscar registro de área
        const areaRegistro = await SedinvitaPostulanteArea.findOne({
            edicionId: edicion._id,
            postulanteId: postulante._id
        });

        console.log('📋 Área registro:', areaRegistro); // DEBUG

        if (!areaRegistro) {
            return NextResponse.json(
                { error: 'El postulante no tiene área asignada' },
                { status: 404 }
            );
        }

        const areaEliminada = areaRegistro.area;

        // 6. Eliminar el registro
        await SedinvitaPostulanteArea.deleteOne({
            _id: areaRegistro._id
        });

        console.log('Área eliminada:', areaEliminada); // DEBUG

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
        // Devolver error detallado
        return NextResponse.json(
            { 
                error: 'Error interno del servidor', 
                details: error.message 
            },
            { status: 500 }
        );
    }
}