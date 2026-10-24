// src/app/layout.js
import { Geist, Geist_Mono, Montserrat, Poppins } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { LandingOnly } from "@/components/layout/landing-only";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PublicPageTransition } from "@/components/page-transition/public-page-transition";
import { PublicScrollbar } from "@/components/layout/public-scrollbar";
import "./globals.css";
import "@/components/layout/scrollbar.css";
import { pageMetadata, SITE_URL } from "@/lib/seo.mjs";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "SEDIPRO UNT",
  ...pageMetadata("/"),
  // Canonicals belong to each public page, never inherited from the home page.
  alternates: {},
  authors: [{ name: "SEDIPRO UNT" }],
  creator: "SEDIPRO UNT",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SEDIPRO UNT" },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${poppins.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-poppins">
        <PublicScrollbar />
        <ThemeProvider>
          <Providers>
            <PublicPageTransition><LandingOnly>{children}</LandingOnly></PublicPageTransition>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
