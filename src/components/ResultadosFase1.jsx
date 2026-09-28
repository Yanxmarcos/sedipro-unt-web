'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronUp, ChevronDown, User, ArrowRight, ArrowUp } from 'lucide-react';

// Listado oficial: Fase 1 habilitados para Fase 2
const RESULTADOS_FASE1 = [
    { apellidos: 'Acosta Velásquez', nombres: 'María Cristina' },
    { apellidos: 'Alayo Rebaza', nombres: 'Nicol Yaquelin' },
    { apellidos: 'Aldave Siccha', nombres: 'Daniel Alberto' },
    { apellidos: 'Alvitres Izquierdo', nombres: 'Sarumi' },
    { apellidos: 'Ambrocio Valderrama', nombres: 'Isaias Noe' },
    { apellidos: 'Araujo Ruiz', nombres: 'Jheison Valentino' },
    { apellidos: 'Arellano Mendieta', nombres: 'Verónica Nohelia' },
    { apellidos: 'Armas Reyes', nombres: 'Piero Sebastian' },
    { apellidos: 'Avalos Ibañez', nombres: 'Jhunior Denilson' },
    { apellidos: 'Baca Pretel', nombres: 'Fabricio Josue' },
    { apellidos: 'Bazan Romero', nombres: 'Pamela Lizbeth' },
    { apellidos: 'Benites Gonzáles', nombres: 'Alison Geraldine' },
    { apellidos: 'Burgos Montenegro', nombres: 'Cristhofer Jesus' },
    { apellidos: 'Caballero Murga', nombres: 'Harold Alessandro' },
    { apellidos: 'Calderón Guevara', nombres: 'Luana Belén' },
    { apellidos: 'Carranza Paico', nombres: 'Kiara Sttefany' },
    { apellidos: 'Castillo Cueva', nombres: 'Anthony Neyser' },
    { apellidos: 'Castillo Rodriguez', nombres: 'Dayana Valeria' },
    { apellidos: 'Chacon Reyes', nombres: 'Jose Alberto' },
    { apellidos: 'Chancafe Azabache', nombres: 'Angela Daniela' },
    { apellidos: 'Chavez Cochayalle', nombres: 'Claudia Sabina Mayumi' },
    { apellidos: 'Chavez Geronimo', nombres: 'Traesy Carolina' },
    { apellidos: 'Chavez Rojas', nombres: 'Claudia Sharon' },
    { apellidos: 'Cruz Rivera', nombres: 'Margely Selene' },
    { apellidos: 'De La Cruz Del Castillo', nombres: 'Paula Rosa' },
    { apellidos: 'Diaz Condor', nombres: 'Ismael Levi' },
    { apellidos: 'Escobedo Zavaleta', nombres: 'Renzo Anibal' },
    { apellidos: 'Esquivel Cespedes', nombres: 'Rodrigo Salvador' },
    { apellidos: 'Figueroa Campos', nombres: 'Cristhofer Leonardo' },
    { apellidos: 'Flores Alayo', nombres: 'Kate Leonela' },
    { apellidos: 'Gálvez Rodríguez', nombres: 'Jhon Patrick' },
    { apellidos: 'Gamboa Otiniano', nombres: 'Yassini Yrene' },
    { apellidos: 'Guevara Medrano', nombres: 'Lleiner Gonsalo' },
    { apellidos: 'Guevara Rodriguez', nombres: 'Marjorit Arlette' },
    { apellidos: 'Gutiérrez Burgos', nombres: 'Eriksson Sander' },
    { apellidos: 'Gutierrez Navarro', nombres: 'Angel Eduardo' },
    { apellidos: 'Huamán Córdova', nombres: 'Angie Xiomara' },
    { apellidos: 'Huamán Quispe', nombres: 'Alexandra Betzabe' },
    { apellidos: 'Huanca Pretell', nombres: 'Mathias Sebastian' },
    { apellidos: 'Huertas Ruiz', nombres: 'Vanessa Del Carmen' },
    { apellidos: 'Jaico Durand', nombres: 'Rosa Luz' },
    { apellidos: 'Joaquín Calderón', nombres: 'Sandy Paola' },
    { apellidos: 'Jorge Puente', nombres: 'Juan Jose' },
    { apellidos: 'Julca Cabos', nombres: 'Melanie Nicole' },
    { apellidos: 'Julca Davila', nombres: 'Ricky Gilbert' },
    { apellidos: 'Linares Vasquez', nombres: 'Ana Paula' },
    { apellidos: 'Llontop Lobaton', nombres: 'David Alejandro' },
    { apellidos: 'Loo Jave', nombres: 'Paula Yucsian' },
    { apellidos: 'Lucero Fernandez', nombres: 'Lucero Sarai' },
    { apellidos: 'Marcelo Arana', nombres: 'Lorena Elizabeth' },
    { apellidos: 'Mariños Cruz', nombres: 'Gabriela De Los Angeles' },
    { apellidos: 'Mattus Orbegoso', nombres: 'Gabriel Valentino' },
    { apellidos: 'Mejia Medina', nombres: 'Ana Claudia' },
    { apellidos: 'Melgarejo Medina', nombres: 'Maicol Alexander' },
    { apellidos: 'Merino Jiménez', nombres: 'María Ana Gabrielle' },
    { apellidos: 'Mimbela Ravines', nombres: 'Daniela Gabriela' },
    { apellidos: 'Miranda Varas', nombres: 'Juan Pablo' },
    { apellidos: 'Mogollon Bolivia', nombres: 'Mariana Nicolle' },
    { apellidos: 'Monzón Espinoza', nombres: 'Alejandro Rafael' },
    { apellidos: 'Moreno Alvarado', nombres: 'Alejandra Jhamilet' },
    { apellidos: 'Murga Llanos', nombres: 'Estefany Lucero' },
    { apellidos: 'Obando Deza', nombres: 'Luciana Nicole' },
    { apellidos: 'Ormeño Ortega', nombres: 'Abel Junior' },
    { apellidos: 'Osorio Pérez', nombres: 'Gianfranco Gabriel' },
    { apellidos: 'Paredes Gil', nombres: 'Diego Anderzon' },
    { apellidos: 'Pesantes Huaylla', nombres: 'Jhunior Alexander' },
    { apellidos: 'Pichen Mostacero', nombres: 'Cesia Gema Coral' },
    { apellidos: 'Ponte Soto', nombres: 'Frank Hemilen' },
    { apellidos: 'Quiroz Vilca', nombres: 'Jhonatan Kevin' },
    { apellidos: 'Requelme Sanchez', nombres: 'Mariana Jhomara' },
    { apellidos: 'Reyes Ruiz', nombres: 'Carlos Manuel Enrique' },
    { apellidos: 'Reymundo Vilca', nombres: 'Diego Stefano' },
    { apellidos: 'Rodriguez Hermenegildo', nombres: 'Juan Carlos' },
    { apellidos: 'Rodriguez Sandoval', nombres: 'Harry Sly' },
    { apellidos: 'Rojas Valles', nombres: 'Klingler Jhosimar' },
    { apellidos: 'Roque Aranda', nombres: 'Christina Lizbeth' },
    { apellidos: 'Ruiz Alcocer', nombres: 'Farid Obed' },
    { apellidos: 'Salazar Leon', nombres: 'Jefferson Moises' },
    { apellidos: 'Sánchez Guevara', nombres: 'Bryan Paul' },
    { apellidos: 'Santa Cruz Yovera', nombres: 'Lenin Jesus' },
    { apellidos: 'Santillan Hermenegildo', nombres: 'Jhon Bryan' },
    { apellidos: 'Siapo Sevillano', nombres: 'Janeth Elida' },
    { apellidos: 'Siccha Sánchez', nombres: 'Mitzi Mirella' },
    { apellidos: 'Silvestre Ferrer', nombres: 'Jeffran Alberto' },
    { apellidos: 'Solis Medina', nombres: 'Trasy Yadhira' },
    { apellidos: 'Tapia Del Aguila', nombres: 'Sebastian Antonio' },
    { apellidos: 'Ugas Barriga', nombres: 'Manuel' },
    { apellidos: 'Valladolid Leon', nombres: 'Anyel Paola' },
    { apellidos: 'Valverde Ramirez', nombres: 'Ryan Geofrey' },
    { apellidos: 'Vega Gutiérrez', nombres: 'Kevin Yair' },
    { apellidos: 'Velásquez García', nombres: 'Ricardo Bernardo' },
    { apellidos: 'Villanueva Blas', nombres: 'Nicol Evelyn' },
    { apellidos: 'Yenque Moncada', nombres: 'Priscila Dianely' },
    { apellidos: 'Ygnacio Salazar', nombres: 'Yoni Yerson' },
];

// Quita tildes/diéresis para que la búsqueda no dependa de cómo el usuario escriba
const normalize = (str = '') =>
    str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

export default function ResultadosFase1() {
    const [input, setInput] = useState('');
    const [activeMatch, setActiveMatch] = useState(0);
    const [showBackToSearch, setShowBackToSearch] = useState(false);
    const itemRefs = useRef([]);
    const searchAnchorRef = useRef(null);
    const inputRef = useRef(null);
    const sectionRef = useRef(null); // Referencia a la sección completa

    const query = normalize(input);

    const matches = useMemo(() => {
        if (query.length < 2) return [];
        return RESULTADOS_FASE1.reduce((acc, persona, i) => {
            const full = normalize(`${persona.apellidos} ${persona.nombres}`);
            if (full.includes(query)) acc.push(i);
            return acc;
        }, []);
    }, [query]);

    const scrollToMatch = (matchPos) => {
        const targetIndex = matches[matchPos];
        if (targetIndex === undefined) return;
        setActiveMatch(matchPos);
        itemRefs.current[targetIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    };

    const scrollToSearch = () => {
        searchAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // setTimeout(() => {
        //     inputRef.current?.focus();
        // }, 300);
    };

    // Control de visibilidad de la flecha
    useEffect(() => {
        const searchNode = searchAnchorRef.current;
        const sectionNode = sectionRef.current;
        if (!searchNode || !sectionNode) return;

        const handleScroll = () => {
            const searchRect = searchNode.getBoundingClientRect();
            const sectionRect = sectionNode.getBoundingClientRect();

            // La flecha se muestra SOLO cuando:
            // 1. El buscador NO es visible (scrolleó más allá)
            // 2. Y la sección de resultados todavía es visible (no scrolleó más allá de la sección)
            const isSearchVisible = searchRect.bottom > 0 && searchRect.top < window.innerHeight;
            const isSectionVisible = sectionRect.bottom > 0 && sectionRect.top < window.innerHeight;

            setShowBackToSearch(!isSearchVisible && isSectionVisible);
        };

        // Usamos un observer con mejor precisión
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Si la sección ya no es visible, ocultar flecha
                if (!entry.isIntersecting) {
                    setShowBackToSearch(false);
                }
            },
            {
                threshold: 0,
                rootMargin: '0px 0px 0px 0px'
            }
        );

        observer.observe(sectionNode);

        // También escuchamos scroll para detectar cuando el buscador desaparece
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        handleScroll(); // Ejecutar inicialmente

        return () => {
            observer.unobserve(sectionNode);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    // Resetear índice activo cuando cambia la búsqueda
    useEffect(() => {
        setActiveMatch(0);
    }, [query]);

    const handleKeyDown = (e) => {
        if (e.key !== 'Enter' || matches.length === 0) return;
        e.preventDefault();
        scrollToMatch(activeMatch);
    };

    const activeGlobalIndex = matches[activeMatch];

    return (
        <div ref={sectionRef} className="relative">
            {/* Buscador */}
            <div ref={searchAnchorRef} className="max-w-md mx-auto scroll-mt-28">
                <div className="glass-card relative z-10 isolate rounded-full flex items-center gap-3 px-5 py-3 border border-transparent focus-within:border-primary/50 transition-colors">
                    <Search size={18} className="text-[#cbc3d5] flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Busca tu nombre o apellido"
                        aria-label="Buscar en el listado de resultados"
                        className="relative z-10 w-full min-w-0 appearance-none rounded-full border-0 bg-transparent p-0 font-body-md text-body-md leading-none text-[#dae2fd] placeholder:text-[#cbc3d5]/60 shadow-none outline-none ring-0 focus:border-0 focus:shadow-none focus:outline-none focus:ring-0"
                        style={{
                            caretColor: '#6b46c1',
                            color: '#ffffff'
                        }}
                    />
                    {input && (
                        <button
                            onClick={() => setInput('')}
                            aria-label="Limpiar búsqueda"
                            className="relative z-10 text-[#cbc3d5] hover:text-primary transition-colors flex-shrink-0"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {query.length >= 2 && (
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-3 font-label-sm text-label-sm text-[#cbc3d5]">
                        {matches.length > 0 ? (
                            <>
                                <span>
                                    {activeMatch + 1} de {matches.length} resultado{matches.length > 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={() => scrollToMatch(activeMatch)}
                                    className="flex items-center gap-1 text-primary font-semibold hover:gap-1.5 transition-all"
                                >
                                    Ir ahí
                                    <ArrowRight size={12} />
                                </button>
                                {matches.length > 1 && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() =>
                                                scrollToMatch((activeMatch - 1 + matches.length) % matches.length)
                                            }
                                            aria-label="Resultado anterior"
                                            className="w-6 h-6 rounded-full glass-card flex items-center justify-center hover:text-primary transition-colors"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        <button
                                            onClick={() => scrollToMatch((activeMatch + 1) % matches.length)}
                                            aria-label="Siguiente resultado"
                                            className="w-6 h-6 rounded-full glass-card flex items-center justify-center hover:text-primary transition-colors"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span>No encontramos coincidencias con ese nombre.</span>
                        )}
                    </div>
                )}
            </div>

            {/* Listado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-stack-md mt-6">
                {RESULTADOS_FASE1.map((persona, i) => {
                    const isMatch = matches.includes(i);
                    const isActive = i === activeGlobalIndex;

                    return (
                        <div
                            key={`${persona.apellidos}-${persona.nombres}`}
                            ref={(el) => (itemRefs.current[i] = el)}
                            className={`glass-card rounded-2xl p-4 flex items-center gap-3 scroll-mt-32 border transition-all duration-300 ${
                                isActive
                                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                                    : isMatch
                                    ? 'border-primary/40'
                                    : 'border-transparent'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                                <User size={18} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-headline-md text-body-md font-bold text-[#dae2fd] uppercase tracking-tight truncate">
                                    {persona.apellidos}
                                </p>
                                <p className="font-body-md text-body-md text-[#cbc3d5] truncate">
                                    {persona.nombres}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Flechita para volver al buscador - SOLO dentro de la sección de resultados */}
            <button
                onClick={scrollToSearch}
                aria-label="Volver al buscador"
                className={`fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-full shadow-2xl shadow-primary/30 hover:scale-110 transition-all duration-500 ${
                    showBackToSearch
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
            >
                <ArrowUp size={24} strokeWidth={2.5} />
            </button>
        </div>
    );
}
