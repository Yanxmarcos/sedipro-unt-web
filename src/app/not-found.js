'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LiquidEther from '@/components/shaders/LiquidEther'
import { ShaderFlow } from '@/components/shaders/shader-flow'

const MOBILE_BREAKPOINT = 768

export default function NotFound() {
	const [canRenderHeavyBg, setCanRenderHeavyBg] = useState(false)

	useEffect(() => {
		const checkCapability = () => {
			const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
			const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT
			setCanRenderHeavyBg(!isTouch && !isSmallScreen)
		}
		checkCapability()
		window.addEventListener('resize', checkCapability)
		return () => window.removeEventListener('resize', checkCapability)
	}, [])

	return (
		<div className="min-h-screen relative overflow-hidden flex flex-col">
			{/* ============================================
			    FONDO — Capa 1: ShaderFlow (agua-espejo base)
			    ============================================ */}
			<div
				className="fixed inset-0 overflow-hidden pointer-events-none"
				style={{ zIndex: 0 }}
			>
				<div className="absolute inset-0 opacity-50 md:opacity-100">
					<ShaderFlow
						brightness={3}
						iterations={10}
						flowSpeed={[0, 0.1]}
						className="absolute inset-0 h-full w-full"
					/>
				</div>
			</div>

			{/* ============================================
			    FONDO — Capa 2: LiquidEther (flama que sigue al mouse)
			    Con mix-blend-mode: screen para sumar luz sin tapar
			    ============================================ */}
			{canRenderHeavyBg && (
				<div
					className="fixed inset-0 overflow-hidden pointer-events-none"
					style={{
						zIndex: 1,
						mixBlendMode: 'screen'
					}}
				>
					<LiquidEther
						colors={['#5227FF', '#FF9FFC', '#B497CF']}
						mouseForce={20}
						cursorSize={100}
						isViscous
						viscous={10}
						iterationsViscous={32}
						iterationsPoisson={32}
						resolution={0.5}
						isBounce={false}
						autoDemo
						autoSpeed={0.5}
						autoIntensity={2.2}
						takeoverDuration={0.25}
						autoResumeDelay={3000}
						autoRampDuration={0.6}
						color0="#5227FF"
						color1="#FF9FFC"
						color2="#B497CF"
					/>
				</div>
			)}

			{/* ============================================
			    NAV SUPERIOR
			    ============================================ */}
			<nav className="relative z-20 w-full px-5 sm:px-8 lg:px-12 py-5 flex items-center justify-between">
				<Link
					href="/"
					className="flex items-center gap-3 group"
					aria-label="Ir al inicio"
				>
					<div
						className="w-10 h-10 rounded-full glass-card flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-110"
						style={{
							boxShadow: '0 0 20px rgba(103, 37, 119, 0.5)'
						}}
					>
						<img
							src="/logos/sedi-logo.svg"
							alt="SEDIPRO UNT"
							className="w-full h-full object-contain"
						/>
					</div>
					<span className="hidden sm:block text-sm font-semibold font-poppins text-white/90 group-hover:text-white transition-colors">
						SEDIPRO UNT
					</span>
				</Link>
			</nav>

			{/* ============================================
			    CONTENIDO PRINCIPAL — Layout asimétrico 2 columnas
			    ============================================ */}
			<main className="relative z-10 flex-1 flex items-center px-5 sm:px-8 lg:px-12 py-8">
				<div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-32 xl:gap-40 items-center">

					{/* ───────── COLUMNA IZQUIERDA: 404 gigante ───────── */}
					<div className="lg:col-span-4 flex flex-col items-center lg:items-start order-2 lg:order-1">
						<div className="relative flex flex-col items-center lg:items-start">
							{/* "Error" — prefacio pequeño, introduce al 404 */}
							<span
								className="text-lg sm:text-xl lg:text-2xl font-bold font-montserrat tracking-[0.5em] uppercase mb-1 lg:mb-2 text-glow select-none"
								style={{
									background: 'linear-gradient(135deg, #d0bcff 0%, #b497cf 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text',
									filter: 'drop-shadow(0 0 22px rgba(208, 188, 255, 0.5))'
								}}
							>
								Error
							</span>

							{/* "404" — protagonista gigante */}
							<h1
								className="text-[7rem] sm:text-[10rem] lg:text-[12rem] xl:text-[14rem] font-black font-montserrat leading-none text-glow select-none animate-float"
								style={{
									background:
										'linear-gradient(135deg, #d0bcff 0%, #b497cf 50%, #6b46c1 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text',
									filter: 'drop-shadow(0 0 40px rgba(208, 188, 255, 0.5))'
								}}
							>
								404
							</h1>
						</div>
					</div>

					{/* ───────── COLUMNA DERECHA: mensaje + acciones ───────── */}
					<div className="lg:col-span-8 lg:pl-3 xl:pl-6 order-1 lg:order-2 flex flex-col gap-8">

						{/* Encabezado con mensaje */}
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div
									className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center flex-shrink-0"
									style={{
										boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
										border: '1px solid rgba(245, 158, 11, 0.4)'
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="#F59E0B"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 9v2m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.5 20h15a2 2 0 001.71-3.14l-7.5-13a2 2 0 00-3.42 0z"
										/>
									</svg>
								</div>
								<span className="text-xs font-bold font-poppins tracking-[0.25em] text-[#d0bcff] uppercase">
									Oops... algo salió mal
								</span>
							</div>

							<h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-poppins text-white text-glow leading-tight">
								¡No puede ser,
								<br />
								<span
									style={{
										background:
											'linear-gradient(135deg, #d0bcff 0%, #FF9FFC 100%)',
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text'
									}}
								>
									te has perdido!
								</span>
							</h2>

							<p className="text-base sm:text-lg font-poppins text-[#dae2fd]/75 leading-relaxed max-w-xl">
								El contenido que buscas ha sido movido o no existe.
								Puedes regresar al inicio o volver a la página anterior.
							</p>
						</div>

						{/* Acción principal */}
						<div className="max-w-md">
							<Link
								href="/"
								className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3.5 px-8 rounded-xl font-semibold text-sm font-poppins text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#d0bcff]/50 hover:scale-[1.02] active:scale-[0.98]"
								style={{
									background:
										'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)',
									boxShadow: '0 8px 24px rgba(103, 37, 119, 0.5)'
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2.5}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M10 19l-7-7m0 0l7-7m-7 7h18"
									/>
								</svg>
								Volver al inicio
							</Link>
						</div>

						{/* Acción secundaria — mismo diseño que el principal */}
						<div className="max-w-md">
							<button
								type="button"
								onClick={() => window.history.back()}
								className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3.5 px-8 rounded-xl font-semibold text-sm font-poppins text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#d0bcff]/50 hover:scale-[1.02] active:scale-[0.98]"
								style={{
									background:
										'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)',
									boxShadow: '0 8px 24px rgba(103, 37, 119, 0.5)'
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2.5}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M11 17l-5-5m0 0l5-5m-5 5h12"
									/>
								</svg>
								Regresar a la página anterior
							</button>
						</div>
					</div>
				</div>
			</main>

			{/* ============================================
			    FOOTER
			    ============================================ */}
			<footer className="relative z-10 w-full px-5 sm:px-8 lg:px-12 py-5">
				<div
					className="max-w-7xl mx-auto pt-5"
					style={{
						borderTop: '1px solid rgba(208, 188, 255, 0.12)'
					}}
				>
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
						<p className="text-xs font-poppins text-[#dae2fd]/50">
							© {new Date().getFullYear()} SEDIPRO UNT. Todos los derechos reservados.
						</p>
						<p className="text-xs font-poppins text-[#dae2fd]/40">
							Sección Estudiantil de Dirección de Proyectos
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}