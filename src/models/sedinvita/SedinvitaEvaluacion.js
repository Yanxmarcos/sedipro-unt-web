// src/models/sedinvita/SedinvitaEvaluacion.js
import mongoose from 'mongoose';

const puntajeCompetenciaSchema = new mongoose.Schema({
    competencia: {
        type: String,
        required: true,
        trim: true,
    },
    puntaje: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
    },
}, { _id: false });

const sedinvitaEvaluacionSchema = new mongoose.Schema({
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
    dinamicaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaDinamica',
        required: true,
        index: true,
    },
    // Se guarda explícito (no solo derivable vía postulante/dinámica) para que
    // la vista del facilitador filtre "evaluaciones de mi grupo" directamente,
    // sin tener que resolver primero la colección Grupo en cada consulta.
    grupoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaGrupo',
        required: true,
        index: true,
    },
    facilitadorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaFacilitador',
        required: true,
    },
    puntajes: {
        type: [puntajeCompetenciaSchema],
        validate: {
            validator: (arr) => arr.length === 3,
            message: 'Debe registrarse el puntaje de las tres competencias',
        },
        required: true,
    },
    comentario: {
        type: String,
        trim: true,
    },
    opinionInfiltrado: {
        type: String,
        trim: true,
    },
}, {
    collection: 'sedinvita_evaluaciones',
    timestamps: true,
});

// Un postulante recibe una sola evaluación por dinámica (evita duplicados por doble envío)
sedinvitaEvaluacionSchema.index({ postulanteId: 1, dinamicaId: 1 }, { unique: true });

export default mongoose.models.SedinvitaEvaluacion || mongoose.model('SedinvitaEvaluacion', sedinvitaEvaluacionSchema);