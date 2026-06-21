// src/models/sedinvita/SedinvitaAsistencia.js
import mongoose from 'mongoose';

const sedinvitaAsistenciaSchema = new mongoose.Schema({
    edicionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaEdicion',
        required: true,
        index: true,
    },
    fase: {
        type: String,
        enum: ['fase2', 'fase3', 'fase4'],
        required: true,
        index: true,
    },
    turnoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaTurno',
        required: true,
        index: true,
    },
    postulanteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaPostulante',
        required: true,
        index: true,
    },
    estado: {
        type: String,
        enum: ['presente', 'ausente'],
        default: 'ausente',
    },
    // Quién tomó la asistencia (facilitador/admin que registró)
    registradoPor: {
        type: String,
        trim: true,
    },
    hora: {
        type: Date,
    },
    // true cuando se registró manualmente porque el postulante no tenía turno elegido
    registroManual: {
        type: Boolean,
        default: false,
    },
}, {
    collection: 'sedinvita_asistencias',
    timestamps: true,
});

// Un postulante solo puede tener un registro de asistencia por turno
sedinvitaAsistenciaSchema.index({ postulanteId: 1, turnoId: 1 }, { unique: true });

export default mongoose.models.SedinvitaAsistencia || mongoose.model('SedinvitaAsistencia', sedinvitaAsistenciaSchema);