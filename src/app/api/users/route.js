import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

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

        if (payload.rol !== 'ADMIN') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        await connectToDatabase();

        const users = await User.find({ rol: { $ne: 'ADMIN' } })
            .select('user nombres apellidos dni rol createdAt lastLogin updatedAt')
            .sort({ lastLogin: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            total: users.length,
            data: users,
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
