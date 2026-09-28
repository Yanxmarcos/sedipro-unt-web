// React Imports
import type { ReactNode } from 'react'

// Component Imports
import { SidebarProvider } from './ui/sidebar'
import { TooltipProvider } from './ui/tooltip'

type Props = {
  children: ReactNode
  sidebarDefaultOpen?: boolean
}

const Providers = ({ children, sidebarDefaultOpen }: Props) => {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={sidebarDefaultOpen}>{children}</SidebarProvider>
    </TooltipProvider>
  )
}

export default Providers
