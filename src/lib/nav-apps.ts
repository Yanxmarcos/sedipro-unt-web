export type NavApp = {
  icon: string
  name: string
  href: string
  openInNewTab?: boolean
}

export const getNavApps = async (): Promise<NavApp[]> => []
