// src/app/crown-night/hooks/useIsDesktop.js
'use client'

import { useState, useEffect } from 'react'

export function useIsDesktop(breakpoint = 1024) {
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        // Función para verificar el tamaño de pantalla
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= breakpoint)
        }

        // Verificar al montar
        checkScreenSize()

        // Escuchar cambios de tamaño
        window.addEventListener('resize', checkScreenSize)

        // Limpiar al desmontar
        return () => window.removeEventListener('resize', checkScreenSize)
    }, [breakpoint])

    return isDesktop
}