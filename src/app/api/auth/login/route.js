import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;
        
        if (!username || !password) {
            return NextResponse.json(
                { message: 'Usuario y contraseña son requeridos' },
                { status: 400 }
            );
        }
        await connectToDatabase();
        const user = await User.findOne({
            $or: [
                { user: username },
                { dni: username }
            ]
        });
        
        if (!user) {
            return NextResponse.json(
                { message: 'Credenciales inválidas' },
                { status: 401 }
            );
        }  

        const isValidPassword = await user.comparePassword(password);
        
        if (!isValidPassword) {
            return NextResponse.json(
                { message: 'Credenciales inválidas' },
                { status: 401 }
            );
        }
        
        user.lastLogin = new Date();
        await user.save();
        const token = generateToken(user);
        
        const response = NextResponse.json({
            message: 'Login exitoso',
            user: user.toPublicJSON()
        }, { status: 200 });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 6 // 6 horas
        });

        return response;
        
    } catch (error) {
        console.error('[API] Error en login:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}