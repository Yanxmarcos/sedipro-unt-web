import { NextResponse } from 'next/server'

const protectedPrefixes = ['/panel', '/registro']

export default function proxy(request) {
  const { pathname } = request.nextUrl
  const protectedPage = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (protectedPage && !request.cookies.has('auth_token')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/panel/:path*', '/registro/:path*'],
}
