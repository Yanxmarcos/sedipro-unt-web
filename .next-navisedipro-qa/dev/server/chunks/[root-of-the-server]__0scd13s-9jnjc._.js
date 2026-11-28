module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/build/adapter/setup-node-env.external.js [external] (next/dist/build/adapter/setup-node-env.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/build/adapter/setup-node-env.external.js", () => require("next/dist/build/adapter/setup-node-env.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/memory-cache.external.js [external] (next/dist/server/lib/incremental-cache/memory-cache.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/memory-cache.external.js", () => require("next/dist/server/lib/incremental-cache/memory-cache.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/shared-cache-controls.external.js [external] (next/dist/server/lib/incremental-cache/shared-cache-controls.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/shared-cache-controls.external.js", () => require("next/dist/server/lib/incremental-cache/shared-cache-controls.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/router-utils/instrumentation-globals.external.js [external] (next/dist/server/lib/router-utils/instrumentation-globals.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/lib/router-utils/instrumentation-globals.external.js", () => require("next/dist/server/lib/router-utils/instrumentation-globals.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/short-link-response.mjs [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shortLinkResponse",
    ()=>shortLinkResponse
]);
const PREFIXES = [
    "fb",
    "ig",
    "lk",
    "tk",
    "wa",
    "fm",
    "yt",
    "gd",
    "go"
];
const responseHeaders = {
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"
};
function unavailable(status) {
    return new Response(null, {
        status,
        headers: {
            ...responseHeaders,
            ...status === 503 ? {
                "Retry-After": "60"
            } : {}
        }
    });
}
async function shortLinkResponse(request, prefix, code, { fetcher = fetch, origin = process.env.API_BASE_URL || (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : "http://localhost:6001") } = {}) {
    if (![
        "GET",
        "HEAD"
    ].includes(request.method)) return new Response(null, {
        status: 405,
        headers: {
            ...responseHeaders,
            Allow: "GET, HEAD"
        }
    });
    if (!PREFIXES.includes(prefix) || !/^[a-z0-9]{3}$/.test(code)) return unavailable(404);
    try {
        const prefetch = /\bprefetch\b/i.test(`${request.headers.get("purpose") || ""} ${request.headers.get("sec-purpose") || ""}`);
        const upstream = await fetcher(new URL(`/api/enlaces/public/${prefix}/${code}`, origin), {
            method: request.method,
            ...prefetch ? {
                headers: {
                    Purpose: "prefetch"
                }
            } : {},
            redirect: "manual",
            cache: "no-store",
            signal: AbortSignal.timeout(8000)
        });
        if (upstream.status !== 302) return unavailable([
            404,
            410
        ].includes(upstream.status) ? 404 : 503);
        const location = upstream.headers.get("location");
        if (!location || location.length > 8192 || /[\u0000-\u0020\u007f\\]/u.test(location)) return unavailable(503);
        const url = new URL(location);
        if (url.protocol !== "https:" || url.username || url.password || url.port) return unavailable(503);
        return new Response(null, {
            status: 302,
            headers: {
                ...responseHeaders,
                Location: url.href
            }
        });
    } catch  {
        return unavailable(503);
    }
}
}),
"[project]/src/proxy.js [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$short$2d$link$2d$response$2e$mjs__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/short-link-response.mjs [middleware] (ecmascript)");
;
;
const protectedPrefixes = [
    "/panel",
    "/registro"
];
async function proxy(request) {
    const { pathname } = request.nextUrl;
    if (process.env.SEDINVITA_ENABLED !== 'true' && (/^\/sedinvita\/.+/i.test(pathname) || /^\/panel\/sedinvita(?:\/|$)/i.test(pathname))) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/sedinvita', request.url), {
            headers: {
                'Cache-Control': 'no-store'
            }
        });
    }
    const shortPath = /^\/(fb|ig|lk|tk|wa|fm|yt|gd|go)(?:\/([^/]+))?\/?$/.exec(pathname);
    if (shortPath) {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$short$2d$link$2d$response$2e$mjs__$5b$middleware$5d$__$28$ecmascript$29$__["shortLinkResponse"])(request, shortPath[1], shortPath[2] || "");
        if (response.status === 302 || response.status === 405 || request.method === "HEAD") return response;
        // Let Next render the existing root not-found page at the original short URL.
        // Only public response metadata is copied; its own CSP/assets stay intact.
        const notFoundUrl = request.nextUrl.clone();
        notFoundUrl.pathname = response.status === 503 ? "/enlace-no-encontrado" : "/404";
        notFoundUrl.search = "";
        const headers = new Headers({
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow",
            "Referrer-Policy": "no-referrer"
        });
        if (response.status === 503) headers.set("Retry-After", "60");
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-sedipro-short-link-status", String(response.status));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(notFoundUrl, {
            status: response.status,
            headers,
            request: {
                headers: requestHeaders
            }
        });
    }
    const protectedPage = protectedPrefixes.some((prefix)=>pathname === prefix || pathname.startsWith(`${prefix}/`));
    if (protectedPage && !request.cookies.has("auth_token")) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/panel/:path*",
        "/registro/:path*",
        "/sedinvita/:path*",
        "/fb/:path*",
        "/ig/:path*",
        "/lk/:path*",
        "/tk/:path*",
        "/wa/:path*",
        "/fm/:path*",
        "/yt/:path*",
        "/gd/:path*",
        "/go/:path*"
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0scd13s-9jnjc._.js.map