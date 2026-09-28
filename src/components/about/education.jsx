// src/components/about/education.jsx

import Image from "next/image";

const DIRECTIVA = [
  {
    nombre: "María Fernanda Herrera Cerquin",
    cargo: "Presidenta SEDIPRO UNT",
    periodo: "2026",
    imagen: "/img/directiva/mafer.webp",
  },
  {
    nombre: "Celine Huamán Martínez",
    cargo: "Vicepresidenta SEDIPRO UNT",
    periodo: "2026",
    imagen: "/img/directiva/celine.webp",
  },
  {
    nombre: "José Avila Santillan",
    cargo: "Director del área de GTH",
    periodo: "2026",
    imagen: "/img/directiva/jose.webp",
  },
  {
    nombre: "Christian Valverde Caspito",
    cargo: "Director del área de LTK & FNZ",
    periodo: "2026",
    imagen: "/img/directiva/caspito.webp",
  },
  {
    nombre: "Abel Pereda Cabanillas",
    cargo: "Director del área de PMO",
    periodo: "2026",
    imagen: "/img/directiva/abel.webp",
  },
  {
    nombre: "Elder De La Cruz Calderón",
    cargo: "Director del área de TI",
    periodo: "2026",
    imagen: "/img/directiva/elder.webp",
  },
  {
    nombre: "Cielo Abanto Rojas",
    cargo: "Directora del área de MKT",
    periodo: "2026",
    imagen: "/img/directiva/cielo.webp",
  },
];

const ROW_HEIGHT = 64;

export function Education() {
  return (
    <div className="flex flex-col gap-3 mt-10 sm:mt-10">
      <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
        Directiva
      </h3>
      <div className="border-foreground/5 bg-foreground/2 dark:bg-foreground/5 relative rounded-4xl border p-2 sm:p-4">
        <ul className="flex flex-col gap-2">
          {DIRECTIVA.map((entry) => (
            <li
              key={`${entry.nombre}-${entry.periodo}`}
              className="bg-background border-foreground/5 flex items-center gap-4 rounded-3xl border p-2"
              style={{ minHeight: ROW_HEIGHT }}
            >
              <SchoolLogo entry={entry} />
              <div className="flex min-w-0 flex-col">
                <span className="text-foreground text-[17px] font-semibold tracking-tight sm:text-[18px]">
                  {entry.nombre}
                </span>
                <span className="text-foreground/65 mt-0.5 text-[14px] tracking-tight sm:text-[15px]">
                  {entry.cargo}
                  <span className="text-foreground/30 mx-2">•</span>
                  <span className="text-foreground/55">{entry.periodo}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SchoolLogo({ entry }) {
  // Si tiene imagen, mostrarla
  if (entry.imagen) {
    return (
      <span
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-foreground/15"
        aria-hidden="true"
        style={{ borderRadius: 14 }}
      >
        <Image
          src={entry.imagen}
          alt={entry.nombre}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  // Si no tiene imagen, mostrar iniciales
  const initials = entry.nombre.charAt(0);
  return (
    <span
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center border border-foreground/15 bg-foreground/5"
      aria-hidden="true"
      style={{ borderRadius: 14 }}
    >
      <span className="text-foreground/60 text-[18px] font-semibold tracking-tight">
        {initials}
      </span>
    </span>
  );
}
