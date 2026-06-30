// src/models/sedinvita/SedinvitaPostulanteArea.js
import mongoose from 'mongoose';

const sedinvitaPostulanteAreaSchema = new mongoose.Schema({
    edicionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaEdicion',
        required: true,
        index: true,
    },
    postulanteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaPostulante',
        required: true,
        index: true,
    },
    area: {
        type: String,
        enum: ['gth', 'pmo', 'ti', 'mkt', 'ltkyfnz'],
        required: true,
    },
    fechaEleccion: {
        type: Date,
        default: Date.now,
    },

    // ── NUEVO: Área de segunda opción ───────────────────────────────────────
    // Opcional. null hasta que el postulante (que ya tiene su área principal)
    // decida elegir una segunda opción. Una vez elegida, queda fija
    // (no se permite editar - regla de negocio confirmada con directiva).
    areaSecundaria: {
        type: String,
        enum: ['gth', 'pmo', 'ti', 'mkt', 'ltkyfnz'],
        default: null,
    },
    areaSecundariaFecha: {
        type: Date,
        default: null,
    },

    // Historial de cambios de área (se mantiene igual, sin cambios)
    historial: [{
        area: {
            type: String,
            enum: ['gth', 'pmo', 'ti', 'mkt', 'ltkyfnz'],
            required: true,
        },
        fecha: {
            type: Date,
            default: Date.now,
        },
        motivo: {
            type: String,
            trim: true,
        }
    }],
    // Quién registró (si fue admin manualmente)
    registradoPor: {
        type: String,
        trim: true,
        default: 'postulante'
    },
}, {
    collection: 'sedinvita_postulantes_area',
    timestamps: true,
});

// Un postulante solo puede tener un área por edición (sin cambios)
sedinvitaPostulanteAreaSchema.index(
    { edicionId: 1, postulanteId: 1 },
    { unique: true }
);

export default mongoose.models.SedinvitaPostulanteArea ||
    mongoose.model('SedinvitaPostulanteArea', sedinvitaPostulanteAreaSchema);