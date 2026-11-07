const PREFIXES = ["fb", "ig", "lk", "tk", "wa", "fm", "yt", "gd", "go"];
const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
};
function unavailable(status) {
  return new Response(null, {
    status,
    headers: {
      ...responseHeaders,
      ...(status === 503 ? { "Retry-After": "60" } : {}),
    },
  });
}
export async function shortLinkResponse(
  request,
  prefix,
  code,
  {
    fetcher = fetch,
    origin = process.env.API_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api-sediprount.vercel.app"
        : "http://localhost:6001"),
  } = {},
) {
  if (!["GET", "HEAD"].includes(request.method))
    return new Response(null, {
      status: 405,
      headers: { ...responseHeaders, Allow: "GET, HEAD" },
    });
  if (!PREFIXES.includes(prefix) || !/^[a-z0-9]{3}$/.test(code))
    return unavailable(404);
  try {
    const prefetch = /\bprefetch\b/i.test(
      `${request.headers.get("purpose") || ""} ${request.headers.get("sec-purpose") || ""}`,
    );
    const upstream = await fetcher(
      new URL(`/api/enlaces/public/${prefix}/${code}`, origin),
      {
        method: request.method,
        ...(prefetch ? { headers: { Purpose: "prefetch" } } : {}),
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (upstream.status !== 302)
      return unavailable([404, 410].includes(upstream.status) ? 404 : 503);
    const location = upstream.headers.get("location");
    if (
      !location ||
      location.length > 8192 ||
      /[\u0000-\u0020\u007f\\]/u.test(location)
    )
      return unavailable(503);
    const url = new URL(location);
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return unavailable(503);
    return new Response(null, {
      status: 302,
      headers: { ...responseHeaders, Location: url.href },
    });
  } catch {
    return unavailable(503);
  }
}
