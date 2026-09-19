import mongoose from "mongoose";

const personaExternaSchema = new mongoose.Schema(
  {
    nombres: { type: String, required: true, trim: true },
    apellidos: { type: String, required: true, trim: true },
    correo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    dni: { type: String, trim: true, default: null, sparse: true },
    celular: { type: String, trim: true, default: "" },
    organizacion: { type: String, trim: true, default: "" },
  },
  { collection: "personas_externas", timestamps: true },
);

personaExternaSchema.index({ correo: 1 }, { unique: true });
personaExternaSchema.index({ dni: 1 }, { unique: true, sparse: true });

export default mongoose.models.PersonaExterna ||
  mongoose.model("PersonaExterna", personaExternaSchema);
