import Image from 'next/image'
import { missWorlds } from '../constants/missData'
import { misterWorlds } from '../constants/misterData'

const winners = [
    { category: 'Miss Crown Night', candidate: missWorlds.find(({ id }) => id === 'miss-4') },
    { category: 'Mister Crown Night', candidate: misterWorlds.find(({ id }) => id === 'mister-4') },
]

export default function Ganadores() {
    return (
        <section id="ganadores" aria-labelledby="ganadores-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm text-violet-200">Crown Night 2026</p>
            <h2 id="ganadores-title" className="mt-2 text-3xl font-bold text-white sm:text-5xl">Ganadores</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
                {winners.map(({ category, candidate }) => (
                    <article key={candidate.id} className="overflow-hidden rounded-2xl border border-violet-200/20 bg-[#131a30]">
                        <div className="relative aspect-[4/3]">
                            <Image src={candidate.imgUrl} alt={candidate.title} fill className="object-cover object-[center_25%]" sizes="(min-width: 640px) 50vw, 100vw" />
                        </div>
                        <div className="p-5 sm:p-7">
                            <p className="text-sm font-semibold text-violet-200">{category}</p>
                            <h3 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{candidate.title}</h3>
                            <p className="mt-2 text-sm text-slate-300">{candidate.area} · {candidate.career}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
