// src/app/crown-night/layout.js
export const metadata = {
    title: 'Crown Night | SEDIPRO UNT',
    description: 'Certamen oficial que reúne el talento, liderazgo e identidad de las áreas funcionales de SEDIPRO UNT.',
    keywords: 'Crown Night, SEDIPRO UNT, Miss, Mister, concurso, candidatos, rifa',
    authors: [{ name: 'SEDIPRO UNT - Área de TI' }],
    
    openGraph: {
        title: 'Crown Night | SEDIPRO UNT',
        description: 'Certamen oficial que reúne el talento, liderazgo e identidad de las áreas funcionales de SEDIPRO UNT.',
        url: 'https://sediprount.org/crown-night',
        siteName: 'SEDIPRO UNT',
        images: [
            {
                url: 'https://sediprount.org/crown-night/og-image.webp',
                width: 1200,
                height: 630,
                alt: 'Crown Night',
                type: 'image/webp',
            },
        ],
        type: 'website',
        locale: 'es_PE',
    },
    
    twitter: {
        card: 'summary_large_image',
        title: 'Crown Night | SEDIPRO UNT',
        description: 'Certamen oficial que reúne el talento, liderazgo e identidad de las áreas funcionales de SEDIPRO UNT.',
        images: ['https://sediprount.org/crown-night/og-image.webp'],
        creator: '@SediproUNT',
        site: '@SediproUNT',
    },
}

export default function CrownNightLayout({ children }) {
    return children
}