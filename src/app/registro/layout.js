import WorkspaceShell from '@/components/admin/WorkspaceShell'
import { privateMetadata } from '@/lib/seo.mjs'

export const metadata = privateMetadata('Registro de asistencia')

export default function RegistroLayout({ children }) {
  return <WorkspaceShell>{children}</WorkspaceShell>
}
