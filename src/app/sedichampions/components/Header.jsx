'use client'

import Image from 'next/image'
import Link from 'next/link'
import Shuffle from './Shuffle'
import './Header.css'

export default function Header({ onOpenArticle, timeout, isArticleVisible }) {
	const navItems = [
		{ key: 'futbol', label: 'FÚTBOL' },
		{ key: 'voley', label: 'VOLEY' },
		{ key: 'gymkana', label: 'GYMKANA' },
		{ key: 'lugar', label: 'LUGAR' },
	]

	return (
		<header
			id="header"
			className={`
        flex flex-col items-center max-w-full text-center
        transition-all duration-[0.325s] ease-in-out
        ${isArticleVisible ? 'opacity-0 scale-95 blur-[0.1rem]' : ''}
        ${timeout ? 'opacity-0 blur-[0.125rem]' : ''}
      `}
			style={{
				backgroundImage: 'radial-gradient(rgba(0,0,0,0.25) 25%, rgba(0,0,0,0) 55%)',
			}}
		>
			{/* Logo SEDIPRO UNT */}
			<Link
				href="https://sediprount.org"
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center gap-1.5 sm:gap-3 hover:opacity-80 transition-opacity group mt-4 mb-2 max-sm:mt-3 max-[400px]:mt-2 max-[400px]:mb-1.5"
			>
				<div className="relative w-6 h-6 sm:w-10 sm:h-10 flex-shrink-0">
					<Image
						src="/logos/isotipo.webp"
						alt="Logo SEDIPRO UNT"
						fill
						className="object-contain"
						sizes="(max-width: 640px) 24px, 40px"
					/>
				</div>
				<span className="inline text-[0.65rem] sm:text-base md:text-lg font-bold text-white whitespace-nowrap transition-colors">
					SEDIPRO UNT
				</span>
			</Link>

			{/* Logo (copa) - AHORA MÁS GRANDE EN MÓVIL */}
			<div
				className={`
          flex items-center justify-center flex-shrink-0
          transition-opacity duration-[0.325s] ease-in-out
          w-56 h-56 max-md:w-44 max-md:h-44 max-sm:w-56 max-sm:h-56 max-[400px]:w-28 max-[400px]:h-28
        `}
			>
				<Image
					src="/sedichampions/logo.webp"
					alt="SediChampions League 2016"
					width={200}
					height={200}
					className="w-full h-full object-contain"
					priority
				/>
			</div>

			{/* Content - Título con bordes blancos sólidos */}
			<div className="max-w-full w-full flex justify-center mt-2 max-sm:mt-1">
				<div
					className={`
            p-6 max-h-[40rem] overflow-hidden
            transition-all duration-[0.75s] ease
            delay-[0.25s]
            max-sm:p-6
            max-[400px]:p-4
            ${timeout ? 'max-h-0 pt-0 pb-0 opacity-0' : ''}
          `}
				>
					<div className="inline-block border-[3px] border-white px-4 py-2 max-sm:px-3 max-sm:py-1.5 max-[400px]:px-2 max-[400px]:py-1">
						<Shuffle
							text="SEDICHAMPIONS LEAGUE 2026"
							tag="h1"
							className="shuffle-title font-bold m-0 text-white"
							shuffleDirection="right"
							duration={0.45}
							shuffleTimes={2}
							animationMode="evenodd"
							stagger={0.035}
							ease="power3.out"
							scrambleCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
							threshold={0.1}
							rootMargin="0px"
							triggerOnce={true}
							triggerOnHover={true}
							respectReducedMotion={true}
							colorFrom="rgba(255,255,255,0.35)"
							colorTo="#ffffff"
						/>
					</div>
				</div>
			</div>

			{/* Navigation - SIN whitespace-nowrap para que no se corte */}
			<nav className="w-full flex justify-center px-2 sm:px-0">
				<ul className="flex mb-0 list-none p-0 border-2 border-white rounded overflow-hidden w-full max-w-sm sm:max-w-md">
					{navItems.map((item, i) => (
						<li
							key={item.key}
							className={`
                border-l-2 border-white flex-1 min-w-0
                ${i === 0 ? 'border-l-0' : ''}
              `}
						>
							<button
								onClick={() => onOpenArticle(item.key)}
								className={`
                  block w-full px-2 sm:px-5 h-11 leading-11
                  uppercase tracking-[0.1rem] sm:tracking-[0.1rem] text-[0.6rem] sm:text-[0.8rem] font-medium
                  bg-transparent border-0 text-white cursor-pointer
                  hover:bg-white hover:text-[#1b1f22]
                  active:bg-white/80 active:text-[#1b1f22]
                  focus-visible:bg-white focus-visible:text-[#1b1f22] focus-visible:outline-none
                  transition-colors duration-200
                  max-[400px]:text-[0.55rem] max-[400px]:px-1
                `}
							>
								{item.label}
							</button>
						</li>
					))}
				</ul>
			</nav>
			<div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white">
				<a href="#ganadores" className="underline underline-offset-4">Ganadores y resultados</a>
				<a href="#galeria" className="underline underline-offset-4">Galería</a>
			</div>

			<section
				aria-labelledby="sedichampions-reels"
				className={`
          w-full max-w-[584px] mx-auto my-14
          transition-all duration-[0.325s] ease-in-out
          ${timeout ? 'opacity-0' : 'opacity-100'}
        `}
			>
				<h2 id="sedichampions-reels" className="mb-5 text-center text-sm font-semibold uppercase tracking-widest text-white">
					Videos de SEDICHAMPIONS
				</h2>
				<div className="grid gap-6 sm:grid-cols-2">
					{[
						{ id: '1047014287716451', title: 'Video promocional' },
						{ id: '1373321634765231', title: 'Reel de SEDICHAMPIONS' },
					].map(({ id, title }) => {
						const href = `https://www.facebook.com/reel/${id}/`
						return (
							<div key={id} className="mx-auto w-full max-w-[280px] text-center">
								<iframe
									title={title}
									src={`https://www.facebook.com/plugins/video.php?height=476&href=${encodeURIComponent(href)}&show_text=false&width=267&t=0`}
									className="aspect-[267/476] w-full rounded-lg border border-white/20"
									scrolling="no"
									allowFullScreen
									allow="autoplay; encrypted-media; picture-in-picture"
									loading="lazy"
								/>
								<a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm text-white underline underline-offset-4" aria-label={`Ver ${title} en Facebook (abre en otra pestaña)`}>
									Ver en Facebook
								</a>
							</div>
						)
					})}
				</div>
			</section>
		</header>
	)
}
