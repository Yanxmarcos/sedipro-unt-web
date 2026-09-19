import mongoose from "mongoose";

const inscripcionEventoSchema = new mongoose.Schema(
  {
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
      required: true,
      index: true,
    },
    personaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PersonaExterna",
      required: true,
      index: true,
    },
    codigo: { type: String, required: true, unique: true, index: true },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },
    estado: {
      type: String,
      enum: ["inscrito", "cancelado", "lista_espera"],
      default: "inscrito",
      index: true,
    },
    fuente: {
      type: String,
      enum: ["formulario_sedipro", "google_forms_import", "manual"],
      default: "formulario_sedipro",
    },
    respuestas: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    googleSheetRow: { type: Number, default: null },
  },
  { collection: "inscripciones_eventos", timestamps: true },
);

inscripcionEventoSchema.index({ eventoId: 1, personaId: 1 }, { unique: true });

export default mongoose.models.InscripcionEvento ||
  mongoose.model("InscripcionEvento", inscripcionEventoSchema);
