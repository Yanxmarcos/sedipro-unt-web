import './styles.css'

export const metadata = {
  title: '360° Project Mastery | Fórmate como un Project Manager',
  description:
    'Es un programa experiencial holístico diseñado para estudiantes y profesionales apasionados por la gestión de proyectos que desean potenciar sus competencias y convertirse en los próximos referentes del ecosistema de Project Management en el Perú.',
  keywords: [
    '360 Project Mastery',
    'Gestión de Proyectos',
    'Project Management',
    'Project Manager',
    'PMI',
    'SEDIPRO UNT',
    'SIE LATAM',
  ],

  openGraph: {
    title: '360° Project Mastery | Fórmate como un Project Manager',
    description:
      'Programa experiencial holístico diseñado para estudiantes y profesionales apasionados por la gestión de proyectos',
    url: '/360pm',
    siteName: '360° Project Mastery',
    images: [
      {
        url: '/360pm/og-image.webp',
        width: 1200,
        height: 630,
        alt: '360° Project Mastery',
      },
    ],
    type: 'website',
    locale: 'es_PE',
  },

  twitter: {
    card: 'summary_large_image',
    title: '360° Project Mastery | Fórmate como un Project Manager',
    description:
      'Programa experiencial para estudiantes y profesionales que buscan potenciar sus competencias y convertirse en referentes del Project Management en el Perú.',
    images: ['/360pm/og-image.webp'],
  },

  alternates: {
    canonical: '/360pm',
  },
}

export default function MasteryLayout({ children }) {
  return children
}