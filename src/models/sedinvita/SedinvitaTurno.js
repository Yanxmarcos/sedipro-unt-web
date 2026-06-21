// src/models/sedinvita/SedinvitaTurno.js
import mongoose from 'mongoose';

const sedinvitaTurnoSchema = new mongoose.Schema({
    edicionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaEdicion',
        required: [true, 'La edición es requerida'],
    },
    fase: {
        type: String,
        enum: ['fase2', 'fase3', 'fase4'],
        required: [true, 'La fase es requerida'],
        default: 'fase2',
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del turno es requerido'],
        trim: true,
    },
    horarioInicio: {
        type: String, // Cambiado de Date a String
        trim: true,
    },
    horarioFin: {
        type: String, // Cambiado de Date a String
        trim: true,
    },
    cupo: {
        type: Number,
        required: [true, 'El cupo es requerido'],
        min: [0, 'El cupo no puede ser negativo'],
    },
    inscritos: {
        type: Number,
        default: 0,
        min: [0, 'Los inscritos no pueden ser negativos'],
    },
    estado: {
        type: String,
        enum: ['abierto', 'lleno', 'cerrado'],
        default: 'abierto',
    },
}, {
    collection: 'sedinvita_turnos',
    timestamps: true,
});

// Índices para mejorar rendimiento
sedinvitaTurnoSchema.index({ edicionId: 1, fase: 1 });
sedinvitaTurnoSchema.index({ edicionId: 1, fase: 1, nombre: 1 });

export default mongoose.models.SedinvitaTurno || mongoose.model('SedinvitaTurno', sedinvitaTurnoSchema);