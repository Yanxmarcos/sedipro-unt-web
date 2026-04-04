import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';
import { TOKEN_NAME } from './lib/cookies';

const publicRoutes = ['/login', '/api/auth/login'];
const publicApiRoutes = ['/api/auth/login'];

export default function proxy(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(TOKEN_NAME)?.value;

    const isPublicRoute = publicRoutes.some(route => pathname === route);
    const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));
    
    if (isPublicRoute || isPublicApiRoute) {
        if (token && pathname === '/login') {
            const verified = verifyToken(token);
            if (verified) {
                return NextResponse.redirect(new URL('/panel', request.url));
            }
        }
        return NextResponse.next();
    }
    
    if (pathname.startsWith('/panel') || pathname.startsWith('/api/auth/change-password')) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const verified = verifyToken(token);
        if (!verified) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete(TOKEN_NAME);
            return response;
        }
    
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', verified.id);
        requestHeaders.set('x-user-rol', verified.rol);
        
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/panel/:path*',
        '/login',
        '/api/auth/:path*',
    ],
};