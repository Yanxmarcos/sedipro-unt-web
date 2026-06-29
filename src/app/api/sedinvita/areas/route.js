// src/app/api/sedinvita/areas/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const AREAS = [
    { id: 'gth', nombre: 'GTH', corto: 'Gestión del Talento Humano' },
    { id: 'pmo', nombre: 'PMO', corto: 'Project Management Office' },
    { id: 'ti', nombre: 'TI', corto: 'Tecnologías de la Información' },
    { id: 'mkt', nombre: 'MKT', corto: 'Marketing' },
    { id: 'ltkyfnz', nombre: 'LTK & FNZ', corto: 'Logística y Finanzas' },
];

async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('sedipro_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function GET() {
    try {
        const payload = await authenticate();
        if (!payload) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            areas: AREAS
        });
    } catch (error) {
        console.error('Error en areas:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}