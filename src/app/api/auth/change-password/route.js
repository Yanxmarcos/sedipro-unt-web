import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { getTokenFromRequest } from '@/lib/cookies';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
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
                { message: 'Token inválido o expirado' },
                { status: 401 }
            );
        }
        
        const { currentPassword, newPassword } = await request.json();
        
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: 'Contraseña actual y nueva son requeridas' },
                { status: 400 }
            );
        }
        
        if (newPassword.length < 6) {
            return NextResponse.json(
                { message: 'La nueva contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            );
        }
        
        await connectToDatabase();
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            );
        }
        
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return NextResponse.json(
                { message: 'Contraseña actual incorrecta' },
                { status: 401 }
            );
        }
        
        user.password = newPassword;
        await user.save();
        
        return NextResponse.json({
            message: 'Contraseña actualizada correctamente'
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}