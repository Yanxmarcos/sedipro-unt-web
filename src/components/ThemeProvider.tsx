'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      setResolvedTheme(resolved)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
      document.documentElement.style.colorScheme = resolved
    }

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [theme])

  function chooseTheme(nextTheme: Theme) {
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: chooseTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('ThemeProvider no está disponible')
  return context
}
