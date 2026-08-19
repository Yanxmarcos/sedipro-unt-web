// src/app/crown-night/components/Navbar.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { navVariants } from '../utils/motion'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    // Cerrar menú al presionar Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    const scrollToSection = (sectionId) => {
        setIsOpen(false)
        const section = document.getElementById(sectionId)
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const menuItems = [
        // { id: 'inicio', label: 'Inicio' },
        { id: 'about', label: 'Sobre Crown Night' },
        { id: 'miss', label: 'Miss' },
        { id: 'mister', label: 'Mister' },
        { id: 'todos', label: 'Apoya tu candidato' },
        { id: 'objetivos', label: 'Objetivos' },
        { id: 'requisitos', label: 'Requisitos' },
        { id: 'areas', label: 'Áreas de Sedipro UNT' },
        { id: 'cronograma', label: 'Cronograma' },
    ]

    return (
        <motion.nav
            variants={navVariants}
            initial="hidden"
            whileInView="show"
            className="px-4 sm:px-6 md:px-8 py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/10"
            ref={menuRef}
        >
            {/* Gradiente de fondo */}
            <div className="absolute w-[50%] inset-0 bg-gradient-to-r from-primary/20 to-transparent blur-3xl" />

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
                    <h2 className="font-extrabold text-lg sm:text-xl md:text-2xl text-foreground tracking-wider whitespace-nowrap">
                        <span className="text-primary">CROWN</span> NIGHT
                    </h2>
                </Link>

                {/* Botón Menú Hamburguesa */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsOpen(!isOpen)
                        }}
                        className="flex flex-col gap-1.5 p-2 hover:bg-primary/10 rounded-lg transition-all duration-300 group"
                        aria-label="Menú"
                    >
                        <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>

                    {/* Menú desplegable hacia abajo */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
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
        </motion.nav>
    )
}

export default Navbar