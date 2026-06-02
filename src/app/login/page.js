'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const router = useRouter()

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		setIsLoading(true)

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: username.trim(),
					password: password
				})
			})
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Error al iniciar sesión')
			}

			router.push(data.redirectTo || '/panel')
		} catch (err) {
			console.error('[FRONT] Error:', err);
			setError(err.message || 'No se pudo iniciar sesión.')
		} finally {
			setIsLoading(false)
		}
	}

	const isReady = username.trim().length > 0 && password.trim().length > 0

	const getBaseInputStyle = () => {
		if (error) return { borderColor: 'var(--color-error)', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' }
		return { borderColor: '#D1D5DB', boxShadow: 'none' }
	}

	const btnStyle = isReady && !isLoading
		? { backgroundColor: 'var(--color-primary)', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(103,37,119,0.35)', cursor: 'pointer' }
		: { backgroundColor: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed' }

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
				<header className="text-center mb-4">
					<div className="flex justify-center mb-2">
						<img
							src="/logos/sedi-logo.svg"
							alt="Logo SEDIPRO UNT"
							className="w-24 h-24 lg:w-42 lg:h-42 object-contain transition-transform duration-300 hover:scale-105"
							style={{
								filter: 'drop-shadow(0 8px 16px rgba(103,37,119,0.30)) drop-shadow(0 2px 4px rgba(103,37,119,0.15))'
							}}
							onError={(e) => {
								const img = e.currentTarget
								const fb = document.createElement('div')
								fb.style.cssText = 'width:80px;height:80px;border-radius:50%;background:var(--color-primary);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(103,37,119,0.30)'
								fb.innerHTML = '<span style="color:#fff;font-size:1.5rem;font-weight:700;font-family:Montserrat,sans-serif">S</span>'
								img.replaceWith(fb)
							}}
						/>
					</div>

					<p className="text-base font-semibold font-poppins text-primary">
						Acceso al Sistema
					</p>
				</header>

				{/* Card */}
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

					<form onSubmit={handleSubmit} className="p-7 space-y-5" noValidate>

						<div>
							<label
								htmlFor="username"
								className="block text-sm font-semibold font-poppins mb-1.5 text-primary-active"
							>
								Usuario
							</label>

							<div className="relative">
								<span
									className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary"
									aria-hidden="true"
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
									</svg>
								</span>

								<input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Usuario"
									autoComplete="username"
									aria-required="true"
									aria-invalid={!!error}
									className="form-input w-full pl-9 pr-4 py-2.5 text-sm font-poppins rounded-lg border bg-white text-gray-900 transition-all duration-150 focus:outline-none focus:ring-0"
									style={getBaseInputStyle()}
									onFocus={(e) => {
										if (!error) {
											e.currentTarget.style.borderColor = 'var(--color-primary)'
											e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.15)'
										}
									}}
									onBlur={(e) => {
										if (!error) {
											e.currentTarget.style.borderColor = '#D1D5DB'
											e.currentTarget.style.boxShadow = 'none'
										}
									}}
								/>
							</div>
						</div>

						{/* Campo Contraseña */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-semibold font-poppins mb-1.5 text-primary-active"
							>
								Contraseña
							</label>

							<div className="relative">
								<span
									className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary"
									aria-hidden="true"
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
									</svg>
								</span>

								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="•••••••••"
									autoComplete="current-password"
									aria-required="true"
									aria-invalid={!!error}
									className="form-input w-full pl-9 pr-4 py-2.5 text-sm font-poppins rounded-lg border bg-white text-gray-900 transition-all duration-150 focus:outline-none focus:ring-0"
									style={getBaseInputStyle()}
									onFocus={(e) => {
										if (!error) {
											e.currentTarget.style.borderColor = 'var(--color-primary)'
											e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,37,119,0.15)'
										}
									}}
									onBlur={(e) => {
										if (!error) {
											e.currentTarget.style.borderColor = '#D1D5DB'
											e.currentTarget.style.boxShadow = 'none'
										}
									}}
								/>
							</div>
						</div>

						{/* Error */}
						{error && (
							<div
								id="login-error"
								role="alert"
								className="flex items-start gap-2.5 text-sm px-3.5 py-3 rounded-lg font-poppins bg-error-light border border-error text-error-dark animate-fade-in"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0 text-error"
									fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
									aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round"
										d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
								</svg>
								<span>{error}</span>
							</div>
						)}

						<button
							type="submit"
							disabled={!isReady || isLoading}
							className="w-full mt-2 py-2.5 px-4 rounded-lg font-semibold text-sm font-poppins transition-all duration-200 focus:outline-none focus:ring-0"
							style={btnStyle}
							onMouseEnter={(e) => {
								if (isReady && !isLoading) {
									e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-primary-hover), var(--color-secondary-hover))'
									e.currentTarget.style.boxShadow = '0 6px 18px rgba(103,37,119,0.45)'
								}
							}}
							onMouseLeave={(e) => {
								if (isReady && !isLoading) {
									e.currentTarget.style.background = 'var(--color-primary)'
									e.currentTarget.style.boxShadow = '0 4px 14px rgba(103,37,119,0.35)'
								}
							}}
							onMouseDown={(e) => {
								if (isReady && !isLoading) {
									e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-primary-active), var(--color-secondary-active))'
								}
							}}
							onMouseUp={(e) => {
								if (isReady && !isLoading) {
									e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-primary-hover), var(--color-secondary-hover))'
								}
							}}
						>
							{isLoading ? (
								<span className="flex items-center justify-center gap-2 text-white">
									<svg
										className="animate-spin w-4 h-4"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
									</svg>
									Iniciando sesión…
								</span>
							) : (
								'Ingresar'
							)}
						</button>
					</form>
				</div>

				{/* Footer */}
				<footer className="mt-5 text-center flex flex-col items-center gap-2">
					<p className="text-sm font-poppins text-gray-400">
						Acceso restringido. Exclusivo para la directiva de SEDIPRO UNT
					</p>
					<button
						type="button"
						onClick={() => router.push('/')}
						className="inline-block py-2.5 px-4 rounded-lg font-semibold text-sm font-poppins text-white transition-all duration-200 focus:outline-none text-center"
						style={{
							background: 'linear-gradient(135deg, #672577, #3454A1)',
							boxShadow: '0 4px 14px rgba(103,37,119,0.35)',
							borderRadius: '12px',
						}}
					>
						Salir de Aquí
					</button>
				</footer>
			</div>
		</div>
	)
}