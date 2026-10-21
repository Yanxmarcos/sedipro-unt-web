/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.1.*'],
  productionBrowserSourceMaps: false,
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
      return [{ source: "/:path*", headers: noindex }];
    }
    return [
      "/api/:path*", "/panel/:path*", "/login", "/registro/:path*", "/votacion/:path*",
      "/eventos/:path*", "/sedinvita/login", "/sedinvita/registro/:path*", "/sedinvita/facilitador/:path*",
    ].map(source => ({ source, headers: noindex }));
  },
  experimental: {
    // Avoid reusing the persistent dev cache after Turbopack storage failures.
    turbopackFileSystemCacheForDev: false,
  },
    images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.dribbble.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "hoirqrkdgbmvpwutwuwj.supabase.co" },
    ],
  },
};
export default nextConfig;
