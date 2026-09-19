import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Evento from "@/models/Evento";
import PersonaExterna from "@/models/PersonaExterna";
import InscripcionEvento from "@/models/InscripcionEvento";
import { appendRegistrationToSheet } from "@/lib/googleSheets";
import { cleanDni, cleanEmail, qrToken, registrationCode } from "@/lib/eventos";

const emailOk = (value) => /^\S+@\S+\.\S+$/.test(value);
const uppercaseLetters = (value) =>
  String(value || "")
    .trim()
    .toLocaleUpperCase("es-PE");
const lettersOnly = (value) => /^[A-ZÁÉÍÓÚÜÑ\s]+$/.test(value);

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const correo = cleanEmail(body.correo);
    const dni = cleanDni(body.dni);
    const nombres = uppercaseLetters(body.nombres);
    const apellidos = uppercaseLetters(body.apellidos);
    const organizacion = uppercaseLetters(body.organizacion);
    const celular = String(body.celular || "").replace(/\D/g, "");
    if (
      !nombres ||
      !apellidos ||
      !emailOk(correo) ||
      !dni ||
      !celular ||
      !organizacion
    )
      return NextResponse.json(
        { error: "Completa todos los campos obligatorios con datos válidos" },
        { status: 400 },
      );
    if (
      !lettersOnly(nombres) ||
      !lettersOnly(apellidos) ||
      !lettersOnly(organizacion)
    )
      return NextResponse.json(
        {
          error: "Nombres, apellidos y organización solo deben contener letras",
        },
        { status: 400 },
      );
    if (organizacion.length > 100)
      return NextResponse.json(
        { error: "La organización debe tener como máximo 100 caracteres" },
        { status: 400 },
      );
    if (celular.length !== 9)
      return NextResponse.json(
        { error: "El celular debe tener exactamente 9 dígitos" },
        { status: 400 },
      );
    await connectToDatabase();
    const event = await Evento.findOne({ slug, estado: "publicado" });
    if (!event || !event.inscripcionAbierta)
      return NextResponse.json(
        { error: "Las inscripciones para este evento están cerradas" },
        { status: 409 },
      );
    const answers = body.respuestas || {};
    for (const field of event.camposPersonalizados)
      if (field.requerido && !String(answers[field.clave] || "").trim())
        return NextResponse.json(
          { error: `El campo “${field.etiqueta}” es requerido` },
          { status: 400 },
        );
    let person = dni ? await PersonaExterna.findOne({ dni }) : null;
    const byEmail = await PersonaExterna.findOne({ correo });
    if (person && byEmail && person._id.toString() !== byEmail._id.toString())
      return NextResponse.json(
        {
          error:
            "El DNI y correo pertenecen a registros distintos. Comunícate con SEDIPRO.",
        },
        { status: 409 },
      );
    person = person || byEmail;
    if (person) {
      person.nombres = nombres;
      person.apellidos = apellidos;
      person.celular = celular;
      person.organizacion = organizacion;
      person.dni = dni;
      await person.save();
    } else
      person = await PersonaExterna.create({
        nombres,
        apellidos,
        correo,
        dni,
        celular,
        organizacion,
      });
    const existing = await InscripcionEvento.findOne({
      eventoId: event._id,
      personaId: person._id,
    }).select("+qrToken");
    if (existing)
      return NextResponse.json(
        {
          error: "Ya existe una inscripción para este correo en el evento",
          code: "YA_INSCRITO",
        },
        { status: 409 },
      );
    if (event.cupo && event.inscritos >= event.cupo)
      return NextResponse.json(
        { error: "El evento alcanzó su capacidad máxima", code: "CUPO_LLENO" },
        { status: 409 },
      );
    const registration = await InscripcionEvento.create({
      eventoId: event._id,
      personaId: person._id,
      codigo: registrationCode(),
      qrToken: qrToken(),
      respuestas: answers,
    });
    await Evento.findByIdAndUpdate(event._id, { $inc: { inscritos: 1 } });
    try {
      const row = await appendRegistrationToSheet(event, registration, person);
      if (row) {
        registration.googleSheetRow = row;
        await registration.save();
      }
    } catch (error) {
      console.warn("[Google Sheets inscripción]", error.message);
    }
    const origin = new URL(request.url).origin;
    return NextResponse.json(
      {
        success: true,
        data: {
          codigo: registration.codigo,
          nombre: `${person.nombres} ${person.apellidos}`,
          qrValue: `${origin}/eventos/${event.slug}/registro/${registration.qrToken}`,
          eventTitle: event.titulo,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[public registration]", error);
    return NextResponse.json(
      {
        error:
          error.code === 11000
            ? "Ya existe una inscripción para este evento"
            : "No se pudo registrar la inscripción",
      },
      { status: 500 },
    );
  }
}
