import { NextResponse } from 'next/server';

const API_ORIGIN = process.env.API_BASE_URL
    || (process.env.NODE_ENV === 'production'
        ? 'https://api-sediprount.vercel.app'
        : 'http://localhost:6001');

async function forward(request, { params }) {
    const origin = request.headers.get('origin');
    if (origin && origin !== request.nextUrl.origin) {
        return NextResponse.json(
            { message: 'Origen de petición no permitido' },
            { status: 403 },
        );
    }

    const { path } = await params;
    const target = new URL(`/api/${path.map(encodeURIComponent).join('/')}`, API_ORIGIN);
    target.search = request.nextUrl.search;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');
    headers.delete('connection');
    headers.delete('origin');

    const endpoint = `/${path.join('/')}`;
    const usesFacilitator = endpoint.startsWith('/sedinvita/facilitadores/verify')
        || endpoint.startsWith('/sedinvita/facilitadores/logout')
        || (endpoint.startsWith('/sedinvita/evaluaciones')
            && (request.headers.get('referer') || '').includes('/sedinvita/facilitador/'));
    const usesSedinvitaManager = endpoint.startsWith('/sedinvita/registro/')
        || endpoint.startsWith('/sedinvita/encargados-asistencia/verify')
        || endpoint.startsWith('/sedinvita/encargados-asistencia/logout');

    const token = usesFacilitator
        ? request.cookies.get('facilitador_token')?.value
        : usesSedinvitaManager
            ? request.cookies.get('sedinvita_encargado_token')?.value
            : request.cookies.get('auth_token')?.value
                || request.cookies.get('facilitador_token')?.value
                || request.cookies.get('sedinvita_encargado_token')?.value;

    if (token && !headers.has('authorization')) {
        headers.set('authorization', `Bearer ${token}`);
    }

    try {
        const upstream = await fetch(target, {
            method: request.method,
            headers,
            body: ['GET', 'HEAD'].includes(request.method)
                ? undefined
                : await request.arrayBuffer(),
            cache: 'no-store',
            redirect: 'manual',
        });

        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('content-length');
        responseHeaders.delete('set-cookie');

        const response = new NextResponse(upstream.body, {
            status: upstream.status,
            headers: responseHeaders,
        });

        for (const cookie of upstream.headers.getSetCookie()) {
            response.headers.append('set-cookie', cookie);
        }

        return response;
    } catch (error) {
        console.error('No se pudo conectar con la API:', error);
        return NextResponse.json(
            { message: 'La API no está disponible temporalmente' },
            { status: 502 },
        );
    }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;

