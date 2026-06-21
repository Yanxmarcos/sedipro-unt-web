// src/models/sedinvita/SedinvitaGrupo.js
import mongoose from 'mongoose';

const sedinvitaGrupoSchema = new mongoose.Schema({
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
    // Un grupo puede tener uno o más facilitadores asignados
    facilitadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaFacilitador',
    }],
    nombre: {
        type: String,
        trim: true,
    },
    postulantes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaPostulante',
    }],
}, {
    collection: 'sedinvita_grupos',
    timestamps: true,
});

export default mongoose.models.SedinvitaGrupo || mongoose.model('SedinvitaGrupo', sedinvitaGrupoSchema);