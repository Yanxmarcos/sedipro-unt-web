import Login from '@/components/admin/Login'
import { privateMetadata } from '@/lib/seo.mjs'

export const metadata = privateMetadata('Iniciar sesión')

export default function LoginPage() {
  return <main id="main-content" data-nav-surface="ink"><Login kind='admin' /></main>
}
