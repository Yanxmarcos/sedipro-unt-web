'use client'

import { useState, useEffect } from 'react'
import { usePageEffects } from './usePageEffects'
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaRegEnvelope } from 'react-icons/fa';
import { SquarePen, FileDown, Menu, X } from 'lucide-react'
import * as Icons from 'lucide-react'

const PRODUCTS = [
	{
		nm: 'FORMACIÓN', ct: 'Actualiza y fortalece tus competencias en gestión de proyectos.', pr: 0, img: '/360pm/formacion-1.webp',
		icon: 'GraduationCap', link: '#pilar-formacion'
	},
	{
		nm: 'NETWORKING', ct: 'Conecta con speakers, referentes, profesionales, sponsors y otros participantes.', pr: 0,
		img: '/360pm/networking.webp', icon: 'Users', link: '#pilar-networking'
	},
	{
		nm: 'LIFESTYLE', ct: 'Vive la experiencia más allá del aula con desafíos, experiencias, premios y oportunidades.', pr: 0,
		img: '/360pm/lifestyle.webp', icon: 'Heart', link: '#pilar-lifestyle'
	},
	{
		nm: 'IMPACTO', ct: 'Parte de los resultados del programa se destinan a iniciativas y proyectos de beneficio social.', pr: 0,
		img: '/360pm/impacto.webp', icon: 'Target', link: '#pilar-impacto'
	},
]

export default function MasteryPage() {
	usePageEffects()

	const getIcon = (iconName) => {
		const IconComponent = Icons[iconName]
		return IconComponent ? <IconComponent size={16} /> : <Icons.Circle size={16} />
	}

	const [navOpen, setNavOpen] = useState(false);

	useEffect(() => {
		document.body.style.overflow = navOpen ? 'hidden' : '';
		const onKey = (e) => e.key === 'Escape' && setNavOpen(false);
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [navOpen]);

	return (
		<div className="mastery-page">
			{/* ── Announcement Bar ──────────────────────────────────── */}
			<div className="ann" aria-hidden="true">
				<div className="row">
					<div className="tk">
						<span>Competencias técnicas multi-framework</span>
						<i>/</i>
						<span>Habilidades de liderazgo y comunicación</span>
						<i>/</i>
						<span>Networking de alto nivel</span>
						<i>/</i>
						<span>Posicionamiento profesional</span>
						<i>/</i>
						<span>Toma de decisiones directivas</span>
						<i>/</i>
						<span>Podrás vivir el Lifestyle real de un PM</span>
						<i>/</i>
						<span>Vivirás el impacto real fruto de tu trabajo</span>
						<i>/</i>
					</div>
					<div className="tk">
						<span>Competencias técnicas multi-framework</span>
						<i>/</i>
						<span>Habilidades de liderazgo y comunicación</span>
						<i>/</i>
						<span>Networking de alto nivel</span>
						<i>/</i>
						<span>Posicionamiento profesional</span>
						<i>/</i>
						<span>Toma de decisiones directivas</span>
						<i>/</i>
						<span>Podrás vivir el Lifestyle real de un PM</span>
						<i>/</i>
						<span>Vivirás el impacto real fruto de tu trabajo</span>
						<i>/</i>
					</div>
				</div>
			</div>

			{/* ── Nav ───────────────────────────────────────────────── */}
			<nav className="mastery-nav">
				<div className="wrap bar">
					<div className="nav-logo">
						<img
							src="/360pm/360-cont.webp"
							alt="360° Project Mastery"
							className="nav-logo-img"
						/>
					</div>

					<ul>
						<li><a href="#acerca">Acerca de</a></li>
						<li><a href="#experiencia">Experiencia 360° PM</a></li>
						<li><a href="#speakers">Speakers</a></li>
						<li><a href="#precios">Precios</a></li>
						<li><a href="#contacto">Contacto</a></li>
					</ul>
					<div className="mk"></div>
					<div className="util">
						<a href="https://drive.google.com/drive/folders/12MrWloN_9Zbx0BmvgEyCAljfUe4Ubf6U?usp=sharing" target='_blank' className="nav-btn-secondary">
							<span className="nav-label">Brochure</span>
							<FileDown size={18} className="nav-icon" />
						</a>
						<a href="https://docs.google.com/forms/d/e/1FAIpQLSf2Ww3KJDpnoJvWbgy2usLC8HzMIVn2ACtsUgurcyVHD5l68g/viewform?usp=sharing&ouid=113715154887696779779" target='_blank' className="nav-btn-primary">
							<span className="nav-label">Inscribirme</span>
							<SquarePen size={18} className="nav-icon" />
						</a>
						<button
							type="button"
							className="nav-btn-secondary nav-hamburger"
							onClick={() => setNavOpen(true)}
							aria-label="Abrir menú"
							aria-expanded={navOpen}
							aria-controls="mobile-drawer"
						>
							<Menu size={18} />
						</button>
					</div>
				</div>
				<div id="prog-bar" className="prog" />
			</nav>

			{/* ── Drawer móvil ─────────────────────────────────────── */}
			<div
				className={`nav-overlay ${navOpen ? 'on' : ''}`}
				onClick={() => setNavOpen(false)}
				aria-hidden="true"
			/>
			<aside
				id="mobile-drawer"
				className={`nav-drawer ${navOpen ? 'on' : ''}`}
				aria-hidden={!navOpen}
			>
				<div className="nav-drawer-top">
					<img
						src="/360pm/360-cont.webp"
						alt="360° Project Mastery"
						className="nav-drawer-logo"
					/>
					<button
						type="button"
						className="nav-drawer-close"
						onClick={() => setNavOpen(false)}
						aria-label="Cerrar menú"
					>
						<X size={22} />
					</button>
				</div>

				<ul className="nav-drawer-links">
					<li><a href="#acerca" onClick={() => setNavOpen(false)}>Acerca de</a></li>
					<li><a href="#experiencia" onClick={() => setNavOpen(false)}>Experiencia 360° PM</a></li>
					<li><a href="#speakers" onClick={() => setNavOpen(false)}>Speakers</a></li>
					<li><a href="#precios" onClick={() => setNavOpen(false)}>Precios</a></li>
					<li><a href="#contacto" onClick={() => setNavOpen(false)}>Contacto</a></li>
				</ul>

				<div className="nav-drawer-actions">
					<a href="https://drive.google.com/drive/folders/12MrWloN_9Zbx0BmvgEyCAljfUe4Ubf6U?usp=sharing" className="nav-btn-secondary" onClick={() => setNavOpen(false)}>
						<FileDown size={16} />
						<span>Brochure</span>
					</a>
					<a href="https://docs.google.com/forms/d/e/1FAIpQLSf2Ww3KJDpnoJvWbgy2usLC8HzMIVn2ACtsUgurcyVHD5l68g/viewform?usp=sharing&ouid=113715154887696779779" target='_blank' className="nav-btn-primary" onClick={() => setNavOpen(false)}>
						<SquarePen size={16} />
						<span>Inscribirse</span>
					</a>
				</div>
			</aside>

			{/* ── 1 · HERO ─────────────────────────────────────────── */}
			<header id="hero" className="hero">
				<div className="wrap">
					<div className="tl hv" id="h1">
						<p>Programa<br />experiencial<br /><span className='text-[#D5912D]'><strong>holístico</strong></span></p>
						<div className="rule" />
					</div>

					<div className="stage">
						<div className="word wordBack" aria-hidden="true">
							<b id="wb" className="
								bg-gradient-to-b from-white/30 via-[#c6c6c6]/35 to-white/15
								bg-clip-text text-transparent
								drop-shadow-[0_2px_4px_rgba(255,255,255,0.20)]
							">
								360° PM
							</b>
						</div>
						<img
							className="model hv"
							id="hm"
							src="/360pm/360.webp"
							alt="Logo de 360° Project Mastery"
						/>
					</div>

					<div className="br hv" id="h2">
						<p>Vive la<br />experiencia real de un<br /><span className='text-[#D5912D]'><strong>Project Manager</strong></span></p>
					</div>

					<div className="acts hv" id="h3">
						<a href="https://docs.google.com/forms/d/e/1FAIpQLSf2Ww3KJDpnoJvWbgy2usLC8HzMIVn2ACtsUgurcyVHD5l68g/viewform?usp=sharing&ouid=113715154887696779779" target='_blank' className="btn"><span>Únete a la experiencia</span></a>
						<a href="#precios" className="btnLine">Ver Precios</a>
					</div>
				</div>
			</header>

			{/* ── 2 · ACERCA DE ───────────────────────────────────────── */}
			<section id="acerca" className="season">
				<div className="grid">
					{/* Columna izquierda - Texto */}
					<div className="copy">
						<div className="lbl kick rv" style={{ marginBottom: 16, color: '' }}>ACERCA DE</div>
						<h2 className="rv">360° PROJECT MASTERY</h2>
						<p className="rv">
							Es un programa experiencial holístico diseñado para estudiantes y profesionales apasionados por la gestión de proyectos que desean
							potenciar sus competencias y convertirse en los próximos referentes del ecosistema de <strong>Project Management</strong> en el Perú.
						</p>
						{/* <p className="rv">
              "No solo aprenderás sobre gestión de proyectos, vivirás la experiencia de ser un <strong>Project Manager.</strong>"
            </p> */}
						<p className="rv">
							Impulsado por{" "}
							<a
								href="https://sielatam.com/"
								target="_blank"
								rel="noopener noreferrer"
							>
								Sociedad Latinoamericana de Innovación y Emprendimiento <strong>(SIE LATAM)</strong>
							</a>
							, en colaboración con{" "}
							<a
								href="https://sediprount.org/"
								target="_blank"
								rel="noopener noreferrer"
							>
								Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo <strong>(SEDIPRO UNT)</strong>
							</a>
							.
						</p>
					</div>

					{/* Columna derecha - Imagen */}
					<div className="shot">
						<img
							src="/360pm/acerca-de.webp"
							alt="Acerca de 360° Project Mastery"
							className="w-full h-full object-cover object-center"
							loading="lazy"
						/>
					</div>
				</div>
			</section>

			{/* ── 3 · Modalidad ──────────────────────────────────────── */}
			<section id="modalidad" className="atelier">
				<div className="agrid">
					<figure className="ashot rv" data-speed="0.05">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/360pm/modalidad.webp"
							alt="Imagen de modalidad del evento"
							loading="lazy" />
					</figure>
					<div className="acopy">
						{/* <div className="lbl rv" style={{ marginBottom: 16, color: 'rgba(239,237,232,.5)' }}>
              Público objetivo
            </div> */}
						<h2 className="rv">Modalidad del evento</h2>
						<h3 className="rv text-[#D5912D] font-bold">VIRTUAL (07 Y 17 DE OCTUBRE)</h3>
						<p className="rv">✔ Acceso virtual al curso de Gestión de Proyectos por la plataforma (07 de Octubre).</p>
						<p className="rv">✔ Acceso virtual al curso de Gestión de Proyectos por la plataforma (17 de Octubre).</p>
						<div className="acount rv"></div>
						<h3 className="rv text-[#D5912D] font-bold">PRESENCIAL (24 DE OCTUBRE)</h3>
						<p className="rv">✔ Acceso presencial al día central del evento.</p>
						<p className="rv">✔ Networking con los asistentes al evento.</p>
						<p className="rv">✔ Partcipación en el Challenge 360° PM.</p>
						<p className="rv">✔ Merchandising del evento.</p>
						<p className="rv">✔ Coffee Break.</p>
						{/* <div className="acount rv">
              <div><b data-to="11">0</b><span>People</span></div>
              <div><b data-to="42">0</b><span>Styles a year</span></div>
              <div><b data-to="120">0</b><span>Units per run</span></div>
            </div> */}
					</div>
				</div>
			</section>

			{/* 4. PORQUE 360 PROYECJ MASTERY */}
			<section id="porque" className="season">
				<div className="grid">
					{/* Columna izquierda - Texto */}
					<div className="copy">
						{/* <div className="lbl kick rv" style={{ marginBottom: 16, color: '' }}>ACERCA DE</div> */}
						<h2 className="rv">¿Por qué 360°PM?</h2>
						<p className="rv">
							360° Project Mastery no es un programa
							formativo tradicional. Es una experiencia
							transformadora donde desarrollarás:
						</p>
						<p>✔ Competencias técnicas multi-framework. <br />
							✔ Habilidades de liderazgo y comunicación. <br />
							✔ Networking de alto nivel. <br />
							✔ Posicionamiento profesional. <br />
							✔ Toma de decisiones directivas. <br />
							✔ Podrás vivir el Lifestyle real de un PM. <br />
							✔ Vivirás el impacto real fruto de tu trabajo. <br />
						</p>
					</div>

					{/* Columna derecha - Imagen */}
					<div className="shot">
						<img
							src="/360pm/porque.webp"
							alt="¿Por qué 360° PM?"
							className="w-full h-full object-cover object-center"
							loading="lazy"
						/>
					</div>
				</div>
			</section>

			{/* ── 3 · Público Objetivo ──────────────────────────────────────── */}
			<section id="publico" className="atelier">
				<div className="agrid">
					<figure className="ashot rv" data-speed="0.05">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/360pm/publico.webp"
							alt="Imagen de público objetivo de 360 Project Mastery"
							loading="lazy" />
					</figure>
					<div className="acopy">
						{/* <div className="lbl rv" style={{ marginBottom: 16, color: 'rgba(239,237,232,.5)' }}>
              Público objetivo
            </div> */}
						<h2 className="rv">Público Objetivo</h2>
						{/* <h3 className="rv text-[#D5912D] font-bold">VIRTUAL (07 Y 17 DE OCTUBRE)</h3> */}
						<p className="rv">✔ Estudiantes universitarios.</p>
						<p className="rv">✔ Profesionales de cualquier industria.</p>
						<p className="rv">✔ Emprendedores.</p>
						<p className="rv">✔ Líderes de proyectos.</p>
						<p className="rv">✔ Personas interesadas en certificaciones PMI.</p>
						<p className="rv">✔ Quienes desean potenciar su perfil profesional.</p>
						<p className="rv">✔ Profesionales de cualquier industria.</p>
					</div>
				</div>
			</section>

			{/* ── 4 · LOS 4 PILARES ─────────────────────────────────────────── */}
			<section id="experiencia" className="shop">
				<div className="wrap">
					<div className="hd">
						<h2 className="rv">Experiencia 360° PM</h2>
						<a href="#experiencia" className="btnLine rv">Los 4 Pilares</a>
					</div>

					{/* Imagen principal - pilares.jpg */}
					<div className="rv flex justify-center my-4 md:my-6">
						<img
							src="/360pm/pilares.webp"
							alt="Los 4 Pilares de 360° Project Mastery"
							className="w-[280px] md:w-[180px] lg:w-[700px] h-auto aspect-square object-contain"
							loading="lazy"
						/>
					</div>

					{/* Grid de los 4 pilares */}
					<div className="grid" style={{ marginTop: 'clamp(32px, 5vh, 56px)' }}>
						{PRODUCTS.map((p, i) => (
							<article key={i} className="card rv">
								<div className="ph">
									<img src={p.img} alt={p.nm} loading="lazy" />
									<button
										className="add"
										onClick={() => window.location.href = p.link || '#'}
									>
										{p.nm}
									</button>
								</div>
								<div className="meta">
									<div>
										<div className="nm">{p.nm}</div>
										<div className="ct">{p.ct}</div>
									</div>
									<div className="pr">
										{getIcon(p.icon)}
									</div>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* ── PILAR 1: FORMACIÓN ─────────────────────────────────────────── */}
			<section id="pilar-formacion" className="pilar">
				<div className="grid">
					<div className="copy">
						<div className="lbl rv">PILAR 1</div>
						<h2 className="rv text-[#D5912D]">FORMACIÓN</h2>
						<p className="rv" style={{ fontWeight: 600, color: 'var(--ink)' }}>MODALIDAD HÍBRIDA <br/> 4 Sesiones Virtuales (4 horas cada una)</p>
						<div className="rv" style={{ marginTop: 12 }}>
							<p>✔ Gerencia Estratégica (OPM) <br/>
							✔ PMBOK® 8.ª Edición <br/>
							✔ Modelo PMO Flywheel <br/>
							✔ Ejecución Híbrida con PM4R Agile</p>
						</div>
						<p className="rv" style={{ fontWeight: 600, color: 'var(--ink)', marginTop: 16 }}>Full Day Presencial</p>
						<div className="rv" style={{ marginTop: 4 }}>
							<p>✔ Roadmap de Certificaciones PMI <br/>
							✔ Power Skills para Project Managers <br/>
							✔ Posicionamiento Profesional <br/>
							✔ 360° Project Mastery Challenge</p>
						</div>
					</div>
					<div className="shot">
						<img src="/360pm/formacion-1.webp" alt="Pilar Formación" loading="lazy" />
					</div>
				</div>
			</section>

			{/* ── PILAR 2: NETWORKING ─────────────────────────────────────────── */}
			<section id="pilar-networking" className="pilar-invertido">
				<div className="agrid">
					<figure className="ashot rv" data-speed="0.05">
						<img src="/360pm/networking.webp" alt="Pilar Networking" loading="lazy" />
					</figure>
					<div className="acopy">
						<div className="lbl rv">PILAR 2</div>
						<h2 className="rv text-[#D5912D]">NETWORKING</h2>
						<p className="rv" style={{ fontWeight: 600, color: 'var(--ink)' }}>
							El Networking se abordará desde 2 frentes:
						</p>
						<div className="rv" style={{ marginTop: 12 }}>
							<p>
								<strong>1. Networking con speakers y referentes:</strong>
								<br />Se destinará un espacio para diálogo y fotografía con los speakers.
							</p>
							<p style={{ marginTop: 12 }}>
								<strong>2. Networking con sponsors y benefactores:</strong>
								<br />Se habilitará una feria de sponsors y benefactores para interacción durante el coffee break.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ── PILAR 3: LIFESTYLE / CHALLENGE ──────────────────────────────────── */}
			<section id="pilar-lifestyle" className="pilar">
				<div className="grid">
					<div className="copy">
						<div className="lbl rv">PILAR 3</div>
						<h2 className="rv text-[#D5912D]">LIFESTYLE</h2>
						<p className="rv">
							Participa en el Challenge 360°PM durante el Full Day Presencial.
							<br /><br />
							<strong>Los 5 mejores puntajes obtendrán:</strong>
							<br />Entrada 100% cubierta al Congreso Internacional de Dirección de Proyectos de PMI Norte Perú – Piura 2026.
						</p>
						<p className="rv" style={{ marginTop: 12, fontWeight: 600, color: 'var(--ink)' }}>Premios para los ganadores:</p>
						<div className="rv" style={{ marginTop: 4 }}>
							<p>🥇 <strong>1.er Lugar:</strong> 2 días de hospedaje en hotel 5 estrellas + Vale de consumo de S/500 + Pasajes terrestres cubiertos</p>
							<p>🥈 <strong>2.º Lugar:</strong> 2 días de hospedaje en hotel 5 estrellas</p>
							<p>🥉 <strong>3.er Lugar:</strong> 1 día de hospedaje en hotel 5 estrellas</p>
						</div>
						<a href="https://www.facebook.com/pminorteperu/posts/pfbid0Gu87GTMkYhm5nS2VjQetgVitLwYf5HHBoobJVCSN8VnUCe7KW4J1VNacBiJNsbH9l?rdid=yH3Ws3pFsr9Coxc7#" target='_blank' className="btn rv" style={{ marginTop: 24 }}>
							<span>PMI Tour Norte Perú | Piura 2026</span>
						</a>
					</div>
					<div className="shot">
						<img src="/360pm/lifestyle.webp" alt="Pilar Lifestyle" loading="lazy" />
					</div>
				</div>
			</section>

			{/* ── PILAR 4: IMPACTO ─────────────────────────────────────────── */}
			<section id="pilar-impacto" className="pilar-invertido">
				<div className="agrid">
					<figure className="ashot rv" data-speed="0.05">
						<img src="/360pm/impacto.webp" alt="Pilar Impacto" loading="lazy" />
					</figure>
					<div className="acopy">
						<div className="lbl rv">PILAR 4</div>
						<h2 className="rv text-[#D5912D]">IMPACTO</h2>
						<p className="rv" style={{ fontWeight: 600, color: 'var(--ink)' }}>
							Toda la utilidad recaudada después de costos operativos, logísticos y tributarios se destinará a obra social.
						</p>
						<p className="rv" style={{ marginTop: 12 }}>
							Contribuye a generar un cambio positivo: parte de los resultados del programa se destinan a iniciativas y proyectos de beneficio social.
						</p>
					</div>
				</div>
			</section>

			{/* ── 5 · SPEAKERS ───────────────────────────────────── */}
			<section id="speakers" className="cats">
				<div className="wrap hd">
					<h2 className="rv">SPEAKERS</h2>
					<a href="#speaker" className="btnLine rv">Referentes que inspiran</a>
				</div>
				{/* <div className="wrap row">

          <div className="speaker-card rv">
            <div className="ph">
              <img
                src="/360pm/speakers/diego.jpg"
                alt="MSc. Ing. Diego R. Beltrán"
                loading="lazy"
              />
            </div>

            <div>
              <h3>MSc. Ing. Diego R. Beltrán</h3>

              <p className="italic">
                CEO y Presidente de SIE LATAM | International Speaker
              </p>

              <p>
                Especialista en Gerencia de Proyectos, IA aplicada a negocios y
                Transformación Organizacional.
              </p>

              <a
                href="https://www.linkedin.com/in/dreyespmp/"
                className="linkedin-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-blue-800">
                  <FaLinkedinIn size={13} className="text-white" />
                </span>
              </a>
            </div>
          </div>

          <div className="speaker-card rv">
            <div className="ph">
              <img
                src="/360pm/speakers/diego.jpg"
                alt="MSc. Ing. Diego R. Beltrán"
                loading="lazy"
              />
            </div>

            <div>
              <h3>MSc. Ing. Diego R. Beltrán</h3>

              <p className="italic">
                CEO y Presidente de SIE LATAM | International Speaker
              </p>

              <p>
                Especialista en Gerencia de Proyectos, IA aplicada a negocios y
                Transformación Organizacional.
              </p>

              <a
                href="https://www.linkedin.com/in/dreyespmp/"
                className="linkedin-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-blue-800">
                  <FaLinkedinIn size={13} className="text-white" />
                </span>
              </a>
            </div>
          </div>

          <div className="speaker-card rv">
            <div className="ph">
              <img
                src="/360pm/speakers/diego.jpg"
                alt="MSc. Ing. Diego R. Beltrán"
                loading="lazy"
              />
            </div>

            <div>
              <h3>MSc. Ing. Diego R. Beltrán</h3>

              <p className="italic">
                CEO y Presidente de SIE LATAM | International Speaker
              </p>

              <p>
                Especialista en Gerencia de Proyectos, IA aplicada a negocios y
                Transformación Organizacional.
              </p>

              <a
                href="https://www.linkedin.com/in/dreyespmp/"
                className="linkedin-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-blue-800">
                  <FaLinkedinIn size={13} className="text-white" />
                </span>
              </a>
            </div>
          </div>

        </div> */}
				{/* ── fila 2 · SPEAKERS (por confirmar) ───────────── */}
				<div className="wrap row row-skeleton">

					<div className="speaker-card skeleton-card rv">
						<div className="ph skeleton-shimmer" />
						<div>
							<div className="skeleton-line skeleton-title skeleton-shimmer" />
							<div className="skeleton-line skeleton-subtitle skeleton-shimmer" />
							<div className="skeleton-line skeleton-text skeleton-shimmer" />
							<div className="skeleton-line skeleton-text short skeleton-shimmer" />
							<div className="skeleton-icon skeleton-shimmer" />
						</div>
					</div>

					<div className="speaker-card skeleton-card rv">
						<div className="ph skeleton-shimmer" />
						<div>
							<div className="skeleton-line skeleton-title skeleton-shimmer" />
							<div className="skeleton-line skeleton-subtitle skeleton-shimmer" />
							<div className="skeleton-line skeleton-text skeleton-shimmer" />
							<div className="skeleton-line skeleton-text short skeleton-shimmer" />
							<div className="skeleton-icon skeleton-shimmer" />
						</div>
					</div>

					<div className="speaker-card skeleton-card rv">
						<div className="ph skeleton-shimmer" />
						<div>
							<div className="skeleton-line skeleton-title skeleton-shimmer" />
							<div className="skeleton-line skeleton-subtitle skeleton-shimmer" />
							<div className="skeleton-line skeleton-text skeleton-shimmer" />
							<div className="skeleton-line skeleton-text short skeleton-shimmer" />
							<div className="skeleton-icon skeleton-shimmer" />
						</div>
					</div>

					<div className="speaker-card skeleton-card rv">
						<div className="ph skeleton-shimmer" />
						<div>
							<div className="skeleton-line skeleton-title skeleton-shimmer" />
							<div className="skeleton-line skeleton-subtitle skeleton-shimmer" />
							<div className="skeleton-line skeleton-text skeleton-shimmer" />
							<div className="skeleton-line skeleton-text short skeleton-shimmer" />
							<div className="skeleton-icon skeleton-shimmer" />
						</div>
					</div>

					<div className="speaker-card skeleton-card rv">
						<div className="ph skeleton-shimmer" />
						<div>
							<div className="skeleton-line skeleton-title skeleton-shimmer" />
							<div className="skeleton-line skeleton-subtitle skeleton-shimmer" />
							<div className="skeleton-line skeleton-text skeleton-shimmer" />
							<div className="skeleton-line skeleton-text short skeleton-shimmer" />
							<div className="skeleton-icon skeleton-shimmer" />
						</div>
					</div>

					<div className="speaker-card skeleton-card rv">
						<div className="ph skeleton-shimmer" />
						<div>
							<div className="skeleton-line skeleton-title skeleton-shimmer" />
							<div className="skeleton-line skeleton-subtitle skeleton-shimmer" />
							<div className="skeleton-line skeleton-text skeleton-shimmer" />
							<div className="skeleton-line skeleton-text short skeleton-shimmer" />
							<div className="skeleton-icon skeleton-shimmer" />
						</div>
					</div>

					<div className="skeleton-overlay rv">
						<p>Próximamente</p>
						<span>Se estarán publicando en fechas posteriores</span>
					</div>

				</div>
			</section>

			{/* ── 6 · CLOTH ENTRADAS + SPONSORS ─────────────────── */}
			<section id="precios" className="cloth">
				<div className="cgrid">

					<div className="ccopy">
						<h2 className="rv">PRECIO DE ENTRADAS</h2>
						{/* <p className="rv">
              Conoce los precios de 360° Project Mastery y prepárate para vivir una experiencia que combina formación, conexión y experiencias presenciales.
            </p> */}

						<dl className="rv price-table cols-3">
							<div className="price-head">
								<dt>Categoría</dt>
								<dd>Regular</dd>
								<dd>Early Bird</dd>
							</div>
							<div>
								<dt>Público en General</dt>
								<dd>S/ 600</dd>
								<dd>S/ 400</dd>
							</div>
							<div>
								<dt>Miembros PMI / Colegios Profesionales</dt>
								<dd>S/ 400</dd>
								<dd>S/ 250</dd>
							</div>
							<div>
								<dt>Estudiantes de Pregrado y Posgrado</dt>
								<dd>S/ 250</dd>
								<dd>S/ 180</dd>
							</div>
							<div>
								<dt>Miembros Activos SEDIPRO UNT e IESTs</dt>
								<dd>S/ 180</dd>
								<dd>S/ 130</dd>
							</div>
						</dl>

						<a href="https://docs.google.com/forms/d/e/1FAIpQLSf2Ww3KJDpnoJvWbgy2usLC8HzMIVn2ACtsUgurcyVHD5l68g/viewform?usp=sharing&ouid=113715154887696779779" target='_blank' className="btn text-white">
						<span>Inscribirse</span>
						</a>
					</div>

					<div id="sponsors" className="ccopy divider">
						<h2 className="rv">SPONSORS Y BENEFACTORES</h2>

						<dl className="rv price-table cols-2">
							<div className="price-head">
								<dt>Categoría</dt>
								<dd>Inversión</dd>
							</div>
							<div>
								<dt>Benefactores</dt>
								<dd>Libre <span className="ast">*</span></dd>
							</div>
							<div>
								<dt>Sponsor Silver</dt>
								<dd>S/ 500</dd>
							</div>
							<div>
								<dt>Sponsor Gold</dt>
								<dd>S/ 1000</dd>
							</div>
							<div>
								<dt>Sponsor Black</dt>
								<dd>S/ 1500</dd>
							</div>
						</dl>

						<p className="note rv">
							<span className="ast">*</span> Aplica para casos que quieran apoyar el evento en favor social.
						</p>

						<a href="#contacto" className="btn rv">
							<span>Contáctanos</span>
						</a>
					</div>

				</div>
			</section>

			{/* ── 4 · SERVICE ROW ──────────────────────────────────── */}
			{/* <section id="svc" className="svc">
        <div className="wrap row">
          <div className="rv"><h4>Fast delivery</h4><p>Dispatched within 24 hours, tracked.</p></div>
          <div className="rv"><h4>Easy returns</h4><p>30 days, prepaid label in the box.</p></div>
          <div className="rv"><h4>Made to last</h4><p>Repairs free for the first two years.</p></div>
          <div className="rv"><h4>Secure payment</h4><p>Every major method, nothing stored.</p></div>
        </div>
      		</section> */}

			{/* ── 6 · LOOKBOOK PRECIO ─────────────────────────────────────── */}
			<section id="look" className="look">
				<div className="wrap">
					<div className="lhd">
						<div>
							{/* <div className="lbl rv" style={{ marginBottom: 14, color: 'var(--mid)' }}>
                Precios
              </div> */}
							<h2 className="rv">360° Project Mastery</h2>
						</div>
						<p className="rv">
							"No solo aprenderás sobre gestión de proyectos, vivirás la experiencia de ser un Project Manager."
						</p>
					</div>

					{(() => {
						const posts = [
							{
								src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1481843890334216%2F&show_text=true&width=267&t=0",
								caption: "Reel · 360° PM",
								width: 267,
								height: 591,
							},
							{
								src: "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FSediproUNT%2Fposts%2Fpfbid02gQq5kR7ZM37g2WXjhJL3WPFeDhJBPVo8B8ACMAcEE8ztStzdBrSvNBbHVCJnYg5Hl&show_text=true&width=500",
								caption: "Publicación · 360° PM",
								width: 500,
								height: 679,
							},
							{
								src: "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2888182814874182%2F&show_text=true&width=380&t=0",
								caption: "Reel · 360° PM",
								width: 380,
								height: 591,
							},
							// 👉 agrega aquí más publicaciones, con su width/height reales del embed de Facebook
						];

						const posClass = ["lgA", "lgB", "lgC"];
						const speeds = ["0.06", "0.13", "0.03"];

						const rows = [];
						for (let i = 0; i < posts.length; i += 3) {
							rows.push(posts.slice(i, i + 3));
						}

						return rows.map((row, r) => (
							<div className="lgrid" key={r}>
								{row.map((post, j) => (
									<figure
										key={j}
										className={`${posClass[j]} rv`}
										data-scrub=""
										data-speed={speeds[j]}
									>
										<div
											className="ph fb-embed"
											style={{ aspectRatio: `${post.width} / ${post.height}` }}
										>
											<iframe
												src={post.src}
												title={post.caption}
												scrolling="no"
												frameBorder="0"
												allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
												allowFullScreen
												loading="lazy"
											/>
										</div>
										{/* <figcaption>
                      <span>{String(r * 3 + j + 1).padStart(2, "0")}</span> {post.caption}
                    </figcaption> */}
									</figure>
								))}
							</div>
						));
					})()}
				</div>
			</section>

			{/* ── 9 · SIGNUP - REGISTRO ───────────────────────────────────────── */}
			<section id="contacto" className="signup">
				<div className="signup-video" aria-hidden="true">
					<video
						autoPlay
						muted
						loop
						playsInline
						preload="metadata"
					>
						<source src="/360pm/videoplayback.mp4" type="video/mp4" />
					</video>
				</div>
				<div className="wrap">
					<h2 className="rv">Vive la <span className='text-[#D5912D]'>experiencia</span> 360° PM</h2>
					<p className="rv">
						Da el siguiente paso en tu desarrollo profesional y sé parte de una
						experiencia diseñada para formar, conectar, liderar y generar impacto.
					</p>
					<form className="rv" noValidate>
						<a
							href="https://wa.me/message/R5MDKFWLZVJ7N1"
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-whatsapp"
						>
							<FaWhatsapp size={16} />
							<span>Consultar</span>
						</a>

						<a
							href="mailto:executive.education@sielatam.com"
							className="btn btn-email"
							>
							<FaRegEnvelope size={16} />
							<span>Escríbenos</span>
						</a>

						<a href="https://docs.google.com/forms/d/e/1FAIpQLSf2Ww3KJDpnoJvWbgy2usLC8HzMIVn2ACtsUgurcyVHD5l68g/viewform?usp=sharing&ouid=113715154887696779779" target='_blank' className="btn">
							<span>Inscribirme ahora</span>
						</a>
					</form>
					<div className="ok on" role="status">
						Programa experiencial único en el mundo.
					</div>
				</div>
			</section>

			{/* ── Footer ───────────────────────────────────────────── */}
			<footer className="mastery-footer">
				<div className="wrap">
					{/* ── Logos de marcas ── */}
					<div className="footer-logos">
						{/* Logo del Evento */}
						<div className="footer-brand">
							<div className="footer-event-logo">
								<Image
									src="/360pm/360.webp"
									alt="360° Project Mastery"
									width={200}
									height={100}
									className="footer-event-img"
								/>
								<div className="footer-event-info">
									<span className="footer-event-name">360° PROJECT MASTERY</span>
									<span className="footer-event-tagline">Programa Experiencial Holístico</span>
								</div>
							</div>
						</div>

						{/* Organizadores con sus redes */}
						<div className="footer-organizers">
							{/* SIE LATAM */}
							<div className="footer-org">
								<a
									href="https://sielatam.com/"
									target="_blank"
									rel="noopener noreferrer"
									className="footer-org-link"
								>
									<Image
										src="/360pm/sielatam.webp"
										alt="SIE LATAM"
										width={120}
										height={40}
										className="footer-org-img"
									/>
									{/* <span className="footer-org-role">Organiza</span> */}
								</a>
								<div className="footer-org-socials">
									<a
										href="https://www.instagram.com/sie_latam/"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="Instagram SIE LATAM"
									>
										<FaInstagram size={14} />
									</a>
									<a
										href="https://www.facebook.com/sielatam/"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="Facebook SIE LATAM"
									>
										<FaFacebookF size={14} />
									</a>
									<a
										href="https://www.linkedin.com/company/sie-latam/"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="LinkedIn SIE LATAM"
									>
										<FaLinkedinIn size={14} />
									</a>
								</div>
							</div>

							<div className="footer-org-divider">+</div>

							{/* SEDIPRO UNT */}
							<div className="footer-org">
								<a
									href="https://sediprount.org/"
									target="_blank"
									rel="noopener noreferrer"
									className="footer-org-link"
								>
									<Image
										src="/logos/sedi-logo.svg"
										alt="SEDIPRO UNT"
										width={120}
										height={40}
										className="footer-org-img"
									/>
									{/* <span className="footer-org-role">Co-organiza</span> */}
								</a>
								<div className="footer-org-socials">
									<a
										href="https://www.instagram.com/sedipro.unt/"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="Instagram SEDIPRO UNT"
									>
										<FaInstagram size={14} />
									</a>
									<a
										href="https://www.facebook.com/SediproUNT"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="Facebook SEDIPRO UNT"
									>
										<FaFacebookF size={14} />
									</a>
									<a
										href="https://www.linkedin.com/company/sediprount/"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="LinkedIn SEDIPRO UNT"
									>
										<FaLinkedinIn size={14} />
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* ── Columnas ── */}
					<div className="cols">
						{/* Columna 1: Sobre el evento */}
						<div>
							<h4>Experiencia 360°</h4>
							<a href="#pilar-formacion">Formación</a>
							<a href="#pilar-networking">Networking</a>
							<a href="#pilar-lifestyle">Lifestyle</a>
							<a href="#pilar-impacto">Impacto</a>
						</div>

						{/* Columna 2: Navegación */}
						<div>
							<h4>Navegación</h4>
							<a href="#hero">Inicio</a>
							<a href="#acerca">Acerca de</a>
							<a href="#experiencia">Experiencia 360° PM</a>
							<a href="#speakers">Speakers</a>
							<a href="#precios">Precios</a>
							<a href="#contacto">Contacto</a>
						</div>

						{/* Columna 3: Contacto */}
						<div>
							<h4>Contacto</h4>
							<a href="mailto:executive.education@sielatam.com" target="_blank">
								<FaRegEnvelope size={14} /> executive.education@sielatam.com
							</a>
							<a href="https://wa.me/message/R5MDKFWLZVJ7N1" target='_blank'>
								<FaWhatsapp size={14} /> WhatsApp
							</a>
						</div>

						{/* Columna 4: Enlaces rápidos */}
						<div>
							<h4>Enlaces</h4>
							<a href="https://sielatam.com/" target="_blank" rel="noopener">
								www.sielatam.com
							</a>
							<a href="https://sediprount.org/" target="_blank" rel="noopener">
								www.sediprount.org
							</a>
							{/* <a href="#">Política de Privacidad</a>
              <a href="#">Términos y Condiciones</a> */}
						</div>
					</div>

					{/* ── Legal ── */}
					<div className="legal">
						<span>
							360° Project Mastery® es una marca registrada de La Sociedad Latinoamericana de Innovación y Emprendimiento. Todos los derechos reservados.
						</span>
						{/* <div className="legal-credit">
              <span>Hecho con</span>

              <Heart
                size={12}
                className="text-orange-400 fill-orange-400"
              />

              <span>por</span>

              <span className="ti-name">
                Área de TI
              </span>

              <div className="ti-logo">
                <Image
                  src="/img/area-ti.png"
                  alt="Logo Área de TI SEDIPRO"
                  width={18}
                  height={18}
                  className="object-contain"
                />
              </div>
            </div> */}
					</div>
				</div>
			</footer>


			{/* ── WhatsApp Floating Button (solo Tailwind) ──────────────────── */}
			<a
				href="https://wa.me/message/R5MDKFWLZVJ7N1"
				target="_blank"
				rel="noopener noreferrer"
				className="fixed bottom-6 right-6 z-[999] bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/40 hover:scale-110 transition-all duration-300 hover:shadow-xl hover:shadow-[#25D366]/50 md:w-16 md:h-16"
				aria-label="Consultar por WhatsApp"
			>
				<FaWhatsapp size={28} className="text-white md:text-[32px]" />
			</a>
		</div>
	)
}