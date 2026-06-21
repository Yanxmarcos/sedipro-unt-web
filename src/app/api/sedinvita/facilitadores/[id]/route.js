// src/app/api/sedinvita/facilitadores/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaFacilitador from '@/models/sedinvita/SedinvitaFacilitador';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function authenticate() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return null;
        return verifyToken(token);
    } catch (error) {
        console.error('Error en authenticate:', error);
        return null;
    }
}

// Único uso esperado: resetear la contraseña de un facilitador (vuelve a su DNI).
// Nombres/apellidos/dni ya no se editan aquí: vienen siempre del Sediprano de origen.
export async function PATCH(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { resetPassword } = body;

        await connectToDatabase();

        const facilitador = await SedinvitaFacilitador.findById(id);
        if (!facilitador) {
            return NextResponse.json({ error: 'Facilitador no encontrado' }, { status: 404 });
        }

        if (resetPassword) {
            facilitador.passwordHash = facilitador.dni; // el pre-save lo hashea
        }

        await facilitador.save();

        return NextResponse.json({ success: true, data: facilitador });

    } catch (error) {
        console.error('Error al actualizar facilitador:', error);
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error.message,
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;

        await connectToDatabase();

        const facilitador = await SedinvitaFacilitador.findById(id);
        if (!facilitador) {
            return NextResponse.json({ error: 'Facilitador no encontrado' }, { status: 404 });
        }

        const grupos = await SedinvitaGrupo.find({ facilitadores: id });
        if (grupos.length > 0) {
            return NextResponse.json(
                { error: 'No se puede eliminar un facilitador con grupos asignados. Quítalo de esos grupos primero.' },
                { status: 409 }
            );
        }

        await SedinvitaFacilitador.deleteOne({ _id: id });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error al eliminar facilitador:', error);
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error.message,
        }, { status: 500 });
    }
}