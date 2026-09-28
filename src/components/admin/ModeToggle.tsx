'use client'

// Third-party Imports
import { useTheme } from '@/components/ThemeProvider'
import { MoonStarIcon, SunIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'

const ModeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme()

  const handleModeChange = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return (
    <Button variant='ghost' size='icon' className='relative' onClick={handleModeChange}>
      <MoonStarIcon className='scale-100 dark:scale-0' />
      <SunIcon className='absolute scale-0 dark:scale-100' />
      <span className='sr-only'>Cambiar tema</span>
    </Button>
  )
}

export default ModeToggle



