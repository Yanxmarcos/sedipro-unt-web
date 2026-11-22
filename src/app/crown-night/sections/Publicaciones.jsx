import Image from 'next/image'
import { ArrowUpRight, Play } from 'lucide-react'

const publications = [
    { title: 'Gracias por ser parte de Crown Night', type: 'Publicación', href: 'https://www.facebook.com/SediproUNT/posts/pfbid0zHa21oE4uFHEbfoZdHKR7QLSEuToS8iaariD1eSDkf25qMY9C7NWpm4jFGVWmYdGl' },
    { title: 'Noche de gala', type: 'Reel', href: 'https://www.facebook.com/reel/1374400654344920/' },
    { title: '13 años, una noche para recordar', type: 'Publicación', href: 'https://www.facebook.com/SediproUNT/posts/pfbid023cDYiYDcPEMYBFVeyDnMxZfPHBxwYdRsmEDj4HrHRADHdopKZ6tDKkABmo8GWzF9l' },
    { title: 'Detrás de cámaras', type: 'Reel', href: 'https://www.facebook.com/reel/1378276037745997/' },
    { title: 'Rumbo a la corona', type: 'Publicación', href: 'https://www.facebook.com/photo.php?fbid=1348092357483037&set=a.559333899692224&type=3' },
]

export default function Publicaciones() {
    return (
        <section id="publicaciones" aria-labelledby="publicaciones-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 id="publicaciones-title" className="text-3xl font-bold text-white sm:text-5xl">Publicaciones</h2>
            <p className="mt-3 text-slate-300">Revive Crown Night en las publicaciones y reels de SEDIPRO UNT.</p>
            <div className="mt-8 grid overflow-hidden rounded-2xl border border-violet-200/20 bg-[#131a30] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div aria-hidden="true" className="relative grid min-h-44 place-items-center bg-gradient-to-br from-[#1a2248] to-[#281438] p-6">
                    <Image src="/crown-night/logo2.webp" alt="" width={155} height={216} className="h-32 w-auto object-contain md:h-56" />
                </div>
                <ul className="divide-y divide-violet-200/15 px-4 sm:px-6">
                    {publications.map(({ title, type, href }) => (
                        <li key={href}>
                            <a href={href} target="_blank" rel="noopener noreferrer" className="flex min-h-20 items-center gap-3 rounded-lg px-2 py-3 text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-300 sm:gap-4">
                                {type === 'Reel' ? <Play aria-hidden="true" className="size-4 shrink-0 text-violet-200" /> : null}
                                <span className="min-w-0 flex-1">
                                    <span className="block font-semibold">{title}</span>
                                    <span className="mt-1 block text-sm text-violet-200">{type} en Facebook</span>
                                </span>
                                <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 text-violet-200" />
                                <span className="sr-only">Abre en otra pestaña</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
