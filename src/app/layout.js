import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

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
	title: "SEDIPRO UNT | App web",
	description: "Plataforma oficial de asistencias para SEDIPRO UNT.",
	icons: {
		icon: [
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
		],
		apple: [
			{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
		],
	},
	manifest: '/site.webmanifest',
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="es"
			className={`${montserrat.variable} ${poppins.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col font-poppins">
				{children}
			</body>
		</html>
	);
}