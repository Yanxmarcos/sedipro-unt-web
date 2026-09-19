import mongoose from "mongoose";

const campoSchema = new mongoose.Schema(
  {
    clave: { type: String, required: true, trim: true },
    etiqueta: { type: String, required: true, trim: true },
    tipo: {
      type: String,
      enum: ["texto", "numero", "seleccion", "textarea"],
      default: "texto",
    },
    requerido: { type: Boolean, default: false },
    opciones: [{ type: String, trim: true }],
  },
  { _id: false },
);

const eventoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    descripcion: { type: String, trim: true, default: "" },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date },
    lugar: { type: String, trim: true, default: "" },
    cupo: { type: Number, min: 1, default: null },
    inscritos: { type: Number, default: 0, min: 0 },
    estado: {
      type: String,
      enum: ["borrador", "publicado", "cerrado", "finalizado"],
      default: "borrador",
      index: true,
    },
    inscripcionAbierta: { type: Boolean, default: false },
    camposPersonalizados: { type: [campoSchema], default: [] },
    googleSheetId: { type: String, trim: true, default: null },
    googleSheetUrl: { type: String, trim: true, default: null },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { collection: "eventos", timestamps: true },
);

export default mongoose.models.Evento || mongoose.model("Evento", eventoSchema);
