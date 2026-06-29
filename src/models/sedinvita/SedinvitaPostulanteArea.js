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
    // Historial de cambios de área
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

// Un postulante solo puede tener un área por edición
sedinvitaPostulanteAreaSchema.index(
    { edicionId: 1, postulanteId: 1 },
    { unique: true }
);

export default mongoose.models.SedinvitaPostulanteArea || 
    mongoose.model('SedinvitaPostulanteArea', sedinvitaPostulanteAreaSchema);