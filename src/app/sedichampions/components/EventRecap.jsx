import Image from 'next/image'

const assetRoot = '/sedichampions/edicion-2026'
const podium = [
  ['RCP Titans', 'Primer lugar · Fútbol', 'futbol-primer-lugar.jpeg'],
  ['Procesos F.C.', 'Segundo lugar · Fútbol', 'futbol-segundo-lugar.jpeg'],
  ['Lakers', 'Primer lugar · Vóley', 'voley-primer-lugar.jpeg'],
]
const gymkana = [
  ['Carrera de sacos', 'Química', 'LKT & FNZ', 'GTH'],
  ['Canta y gana', 'Química', 'GTH', 'MKT'],
  ['Glotones', 'GTH', 'Química', 'MKT'],
  ['Jalar cuerda', 'Química', 'GTH', 'MKT'],
  ['Bailetón', 'GTH', 'PMO', 'Química'],
]
const gallery = [
  'Foto grupal de la jornada',
  'Partidos de fútbol y vóley',
  'Entrega de reconocimientos',
  'Participantes reunidos en la cancha',
  'Fotos de los equipos',
]

function Poster({ file, caption }) {
  return (
    <a href={`${assetRoot}/${file}`} target="_blank" rel="noopener noreferrer"
      className="block overflow-hidden rounded-lg border border-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
      <Image src={`${assetRoot}/${file}`} alt={caption} width={1080} height={1350}
        sizes="(min-width: 768px) 360px, (min-width: 480px) 50vw, 100vw"
        className="block h-auto w-full" />
      <span className="sr-only">Ver imagen completa (abre en otra pestaña)</span>
    </a>
  )
}

export default function EventRecap() {
  return (
    <div className="w-full max-w-6xl space-y-16 px-2 pb-16 text-white sm:px-4">
      <section id="ganadores" aria-labelledby="ganadores-title" className="scroll-mt-8 rounded-xl border border-white/20 bg-[#1b1f22]/95 p-4 sm:p-8">
        <h2 id="ganadores-title" className="text-2xl font-bold uppercase tracking-widest sm:text-3xl">Ganadores y resultados</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {podium.map(([team, place, file]) => (
            <figure key={file}>
              <Poster file={file} caption={`Afiche de ${team}, ${place}`} />
              <figcaption className="mt-3">
                <p className="text-sm text-violet-200">{place}</p>
                <h3 className="mt-1 text-xl font-semibold">{team}</h3>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 border-t border-white/20 pt-6">
          <h3 className="text-xl font-semibold">Resultados de gymkana</h3>
          <div className="mt-4 grid items-start gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <ul className="divide-y divide-white/15">
              {gymkana.map(([activity, ...teams]) => (
                <li key={activity} className="py-3 first:pt-0">
                  <h4 className="font-semibold">{activity}</h4>
                  <ol className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/85">
                    {teams.map((team, i) => <li key={team}>{i + 1}.º {team}</li>)}
                  </ol>
                </li>
              ))}
            </ul>
            <Poster file="gymkana-resultados.jpeg" caption="Afiche oficial de resultados de gymkana" />
          </div>
        </div>
      </section>
      <section id="galeria" aria-labelledby="galeria-title" className="scroll-mt-8 rounded-xl border border-white/20 bg-[#1b1f22]/95 p-4 sm:p-8">
        <h2 id="galeria-title" className="text-2xl font-bold uppercase tracking-widest sm:text-3xl">Galería</h2>
        <p className="mt-2 text-sm text-white/80">8 de agosto de 2026</p>
        <div className="mt-6 grid gap-4 min-[480px]:grid-cols-2 md:grid-cols-3">
          {gallery.map((caption, i) => (
            <figure key={caption}>
              <Poster file={`galeria-${i + 1}.jpeg`} caption={caption} />
              <figcaption className="mt-2 text-sm text-white/85">{caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}
