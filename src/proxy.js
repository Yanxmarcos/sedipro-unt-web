import { NextResponse } from "next/server";
import { shortLinkResponse } from "./lib/short-link-response.mjs";

const protectedPrefixes = ["/panel", "/registro"];

export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  const shortPath = /^\/(fb|ig|lk|tk|wa|fm|yt|go)(?:\/([^/]+))?\/?$/.exec(
    pathname,
  );
  if (shortPath) {
    const response = await shortLinkResponse(
      request,
      shortPath[1],
      shortPath[2] || "",
    );
    if (
      response.status === 302 ||
      response.status === 405 ||
      request.method === "HEAD"
    )
      return response;
    // Let Next render the existing root not-found page at the original short URL.
    // Only public response metadata is copied; its own CSP/assets stay intact.
    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname =
      response.status === 503 ? "/enlace-no-encontrado" : "/404";
    notFoundUrl.search = "";
    const headers = new Headers({
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    });
    if (response.status === 503) headers.set("Retry-After", "60");
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-sedipro-short-link-status", String(response.status));
    return NextResponse.rewrite(notFoundUrl, {
      status: response.status,
      headers,
      request: { headers: requestHeaders },
    });
  }
  const protectedPage = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (protectedPage && !request.cookies.has("auth_token")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/registro/:path*",
    "/fb/:path*",
    "/ig/:path*",
    "/lk/:path*",
    "/tk/:path*",
    "/wa/:path*",
    "/fm/:path*",
    "/yt/:path*",
    "/go/:path*",
  ],
};
