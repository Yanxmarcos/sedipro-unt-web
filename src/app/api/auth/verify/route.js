import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getTokenFromRequest } from '@/lib/cookies';

export async function GET(request) {
    const token = getTokenFromRequest(request);
    
    if (!token) {
        return NextResponse.json(
            { message: 'No autenticado' },
            { status: 401 }
        );
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return NextResponse.json(
            { message: 'Token inválido' },
            { status: 401 }
        );
    }
    
    return NextResponse.json({
        authenticated: true,
        user: {
            id: decoded.id,
            user: decoded.user,
            rol: decoded.rol,
            nombres: decoded.nombres,
            apellidos: decoded.apellidos
        }
    }, { status: 200 });
}