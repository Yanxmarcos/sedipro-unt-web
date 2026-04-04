'use client'
import Link from 'next/link'

export default function NotFound() {
	return (
		<div
			className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
			style={{ backgroundColor: '#f8f5fa' }}
		>
			<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
				<div
					className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl"
					style={{ backgroundColor: 'var(--color-primary)', opacity: 0.18 }}
				/>
				<div
					className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl"
					style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.13 }}
				/>
			</div>

			<div className="w-full max-w-sm relative z-10 animate-fade-in">

				<header className="text-center mb-7">
					<div className="flex justify-center mb-4">
						<img
							src="/logos/sedi-logo.svg"
							alt="Logo SEDIPRO UNT"
							className="w-24 h-24 lg:w-32 lg:h-32 object-contain transition-transform duration-300 hover:scale-105"
							style={{
								filter: 'drop-shadow(0 8px 16px rgba(103,37,119,0.30)) drop-shadow(0 2px 4px rgba(103,37,119,0.15))'
							}}
						/>
					</div>

					<p className="text-base font-semibold font-poppins text-primary">
						Error 404
					</p>
				</header>

				<div
					className="bg-white rounded-xl overflow-hidden"
					style={{
						boxShadow: 'var(--shadow-modal)',
						border: '1px solid rgba(214,182,223,0.45)'
					}}
				>
					<div
						className="h-1.5 w-full bg-linear-to-r from-primary via-secondary to-accent"
						aria-hidden="true"
					/>

					<div className="p-7 space-y-6 text-center">

						<div className="flex flex-col items-center justify-center space-y-3">
							<div
								className="w-16 h-16 rounded-full flex items-center justify-center"
								style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.5 20h15a2 2 0 001.71-3.14l-7.5-13a2 2 0 00-3.42 0z" />
								</svg>
							</div>

							<div>
								<h2 className="text-lg font-bold font-poppins text-accent">
									Te has perdido
								</h2>
								<p className="mt-1.5 text-sm font-poppins text-gray-500">
									La página que buscas no existe o fue movida.
								</p>
							</div>
						</div>

						{/* Línea divisoria */}
						<hr className="border-gray-200" />

						{/* Botón */}
						<Link
							href="/"
							className="block w-full py-2.5 px-4 rounded-lg font-semibold text-sm font-poppins text-white transition-all duration-200 focus:outline-none bg-primary hover:bg-primary-hover active:bg-primary-active text-center"
							style={{
								boxShadow: '0 4px 14px rgba(103,37,119,0.35)'
							}}
						>
							Volver al inicio
						</Link>

					</div>
				</div>

				{/* Footer */}
				<footer className="mt-5 text-center space-y-1">
					<p className="text-xs font-poppins text-gray-400">
						© {new Date().getFullYear()} SEDIPRO UNT. Todos los derechos reservados.
					</p>
				</footer>
			</div>
		</div>
	)
}