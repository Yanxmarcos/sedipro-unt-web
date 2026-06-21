// src/app/api/sedinvita/encargados-asistencia/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.set('sedinvita_encargado_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
    });
    return response;
}