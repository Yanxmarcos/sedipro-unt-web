import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Sediprano from '@/models/Sediprano';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
    try {
        // Verificar autenticación
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const sedipranos = await Sediprano.find({})
            //.select('area nombres apellidos dni -_id')
            .select('area nombres apellidos dni')
            .sort({ area: 1, apellidos: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            total: sedipranos.length,
            data: sedipranos,
        });

    } catch (error) {
        console.error('Error al obtener sedipranos:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}