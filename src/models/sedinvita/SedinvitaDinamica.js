// src/models/sedinvita/SedinvitaDinamica.js
import mongoose from 'mongoose';

// Las dinámicas no están hardcodeadas: viven en la base de datos como datos
// semilla con un CRUD sencillo. Por ahora aplican únicamente a fase2
// (fase3/fase4 no contemplan dinámicas, según alcance actual del proyecto).
const sedinvitaDinamicaSchema = new mongoose.Schema({
    edicionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaEdicion',
        required: true,
        index: true,
    },
    turnoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaTurno',
        required: true,
        index: true,
    },
    nombre: {
        type: String,
        required: [true, 'El nombre de la dinámica es requerido'],
        trim: true,
    },
    descripcion: {
        type: String,
        trim: true,
    },
    // Cada dinámica evalúa exactamente tres competencias
    competencias: {
        type: [String],
        validate: {
            validator: (arr) => arr.length === 3,
            message: 'Una dinámica debe evaluar exactamente tres competencias',
        },
        required: true,
    },
    orden: {
        type: Number,
        default: 0,
    },
}, {
    collection: 'sedinvita_dinamicas',
    timestamps: true,
});

export default mongoose.models.SedinvitaDinamica || mongoose.model('SedinvitaDinamica', sedinvitaDinamicaSchema);