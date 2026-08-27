/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.1.*'],
  productionBrowserSourceMaps: false,
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