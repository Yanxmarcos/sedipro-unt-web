// src/app/crown-night/components/Navbar.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)
    const triggerRef = useRef(null)
    const reducedMotion = useReducedMotion()

    // Detectar el clic exterior antes de que React sustituya el icono.
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('pointerdown', handleClickOutside)
        return () => document.removeEventListener('pointerdown', handleClickOutside)
    }, [])

    // Cerrar menú al presionar Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
                triggerRef.current?.focus()
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [isOpen])

    const scrollToSection = (sectionId) => {
        setIsOpen(false)
        const section = document.getElementById(sectionId)
        if (section) {
            section.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' })
        }
    }

    const menuItems = [
        // { id: 'inicio', label: 'Inicio' },
        { id: 'about', label: 'Sobre Crown Night' },
        { id: 'ganadores', label: 'Ganadores' },
        { id: 'publicaciones', label: 'Publicaciones' },
        { id: 'miss', label: 'Miss' },
        { id: 'mister', label: 'Mister' },
        { id: 'todos', label: 'Apoya tu candidat@' },
        { id: 'resultados', label: 'Resultados' },
        { id: 'cronograma', label: 'Cronograma' },
        { id: 'areas', label: 'Áreas de Sedipro UNT' },
        { id: 'objetivos', label: 'Objetivos' },
        { id: 'dp', label: 'DP' },
    ]

    return (
        <nav
            aria-label="Navegación de Crown Night"
            className="px-4 sm:px-6 md:px-8 py-4 sticky top-0 z-60 bg-background/95 backdrop-blur-xl border-b border-border/10"
            ref={menuRef}
        >
            {/* Gradiente de fondo */}
            <div className="pointer-events-none absolute w-[50%] inset-0 bg-gradient-to-r from-primary/20 to-transparent blur-3xl" />

            <div className="max-w-7xl mx-auto flex justify-between items-center gap-8 relative">
                {/* Logo SEDIPRO UNT */}
                <Link 
                    href="https://sediprount.org" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity group"
                >
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <Image
                            src="/logos/isotipo.webp"
                            alt="Logo SEDIPRO UNT"
                            fill
                            className="object-contain"
                            sizes="(max-width: 640px) 32px, 40px"
                        />
                    </div>
                    <span className="hidden sm:inline font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                        SEDIPRO UNT
                    </span>
                </Link>

                {/* Título Crown Night - centrado */}
                <Link href="/crown-night" className="absolute left-1/2 -translate-x-1/2">
                    <h2 className="font-extrabold text-base sm:text-xl md:text-2xl text-foreground tracking-wider whitespace-nowrap">
                        <span className="text-primary">CROWN</span> NIGHT
                    </h2>
                </Link>

                {/* Botón Menú Hamburguesa */}
                <div className="relative z-10 ml-auto shrink-0">
                    <button
                        ref={triggerRef}
                        type="button"
                        onClick={() => setIsOpen((open) => !open)}
                        className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 text-sm font-semibold text-foreground hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? 'crown-night-menu' : undefined}
                    >
                        <span className="pointer-events-none sr-only sm:not-sr-only">{isOpen ? 'Cerrar' : 'Menú'}</span>
                        {isOpen ? <X size={22} className="pointer-events-none" aria-hidden="true" /> : <Menu size={22} className="pointer-events-none" aria-hidden="true" />}
                    </button>

                    {/* Menú desplegable hacia abajo */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                id="crown-night-menu"
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                                className="absolute right-0 mt-3 w-56 sm:w-64 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/10 overflow-hidden z-50"
                            >
                                <div className="py-2 max-h-[80vh] overflow-y-auto">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToSection(item.id)}
                                            className="w-full text-left px-4 py-3 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 text-sm font-medium"
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                    
                                    {/* Línea separadora */}
                                    <div className="border-t border-border/10 my-1" />
                                    
                                    {/* Botón de descarga de bases */}
                                    <a
                                        href="https://drive.google.com/file/d/1XOW3qTDqFG8zE90xupWA90I3sb9CB6ng/view"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 text-sm font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <svg 
                                            className="w-4 h-4"
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                                            />
                                        </svg>
                                        Descargar bases
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
