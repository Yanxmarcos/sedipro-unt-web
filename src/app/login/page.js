import Login from '@/components/admin/Login'
import { privateMetadata } from '@/lib/seo.mjs'

export const metadata = privateMetadata('Acceso Sediprano')

export default function LoginPage() {
  return <main id="main-content" data-nav-surface="ink"><Login kind='admin' /></main>
}
