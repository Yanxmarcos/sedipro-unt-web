import mongoose from "mongoose";

const asistenciaEventoSchema = new mongoose.Schema(
  {
    eventoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evento",
      required: true,
      index: true,
    },
    inscripcionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InscripcionEvento",
      required: true,
      unique: true,
      index: true,
    },
    estado: {
      type: String,
      enum: ["presente", "tardanza"],
      default: "presente",
    },
    hora: { type: Date, default: Date.now },
    metodo: {
      type: String,
      enum: ["qr", "manual", "importacion"],
      required: true,
    },
    registradoPor: { type: String, trim: true, required: true },
  },
  { collection: "asistencias_eventos", timestamps: true },
);

export default mongoose.models.AsistenciaEvento ||
  mongoose.model("AsistenciaEvento", asistenciaEventoSchema);
