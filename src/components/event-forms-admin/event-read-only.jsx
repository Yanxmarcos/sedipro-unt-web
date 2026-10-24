"use client";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventFormRunner } from "@/components/event-forms/form-runner";
import { Registrations } from "./registrations";
import { EventAttendance } from "./attendance";
import { formatEventDate } from "./event-settings";
import { venueSummary } from "@/lib/event-location.mjs";
export function EventReadOnly({ event }) {
  return (
    <div className="space-y-6">
      <Link
        href="/panel/eventos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="size-4" /> Todos los eventos
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight">
            {event.titulo}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatEventDate(event.fechaInicio)} · {venueSummary(event)}
          </p>
        </div>
        {event.formulario?.version > 0 && (
          <a
            href={`/eventos/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <ExternalLink /> Ver formulario público
          </a>
        )}
      </header>
      <Tabs defaultValue="inscripciones" className="min-w-0 flex-col gap-6">
        <div className="overflow-x-auto border-b">
          <TabsList variant="line">
            <TabsTrigger value="inscripciones">Inscripciones</TabsTrigger>
            <TabsTrigger value="formulario">Formulario</TabsTrigger>
            <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="inscripciones">
          <Registrations event={event} readOnly />
        </TabsContent>
        <TabsContent value="formulario">
          <p className="mb-5 text-sm text-muted-foreground">
            Vista previa del formulario. Las respuestas de esta vista no se
            guardan.
          </p>
          <div className="max-w-3xl rounded-xl border bg-card p-5 sm:p-6">
            <EventFormRunner
              form={event.formulario.published || event.formulario.draft}
              preview
            />
          </div>
        </TabsContent>
        <TabsContent value="asistencia">
          <EventAttendance id={event._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
