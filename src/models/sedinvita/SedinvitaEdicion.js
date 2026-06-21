// src/models/sedinvita/SedinvitaEdicion.js
import mongoose from 'mongoose';

const sedinvitaEdicionSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la edición es requerido'],
        trim: true,
    },
    anio: {
        type: Number,
        required: [true, 'El año es requerido'],
    },
    estado: {
        type: String,
        enum: ['planificacion', 'abierto', 'cerrado', 'finalizado'], // Cambiado para coincidir con frontend
        default: 'planificacion',
    },
    // Solo una edición puede estar activa a la vez (ver índice más abajo)
    activa: {
        type: Boolean,
        default: false,
    },
    fechaInicio: {
        type: Date,
    },
    fechaFin: {
        type: Date,
    },
    // Interruptor único para abrir/cerrar la selección pública de turnos
    seleccionTurnosAbierta: {
        type: Boolean,
        default: false,
    },
}, {
    collection: 'sedinvita_ediciones',
    timestamps: true,
});

// Garantiza a nivel de base de datos que nunca haya dos ediciones activas a la vez
sedinvitaEdicionSchema.index(
    { activa: 1 },
    { unique: true, partialFilterExpression: { activa: true } }
);

export default mongoose.models.SedinvitaEdicion || mongoose.model('SedinvitaEdicion', sedinvitaEdicionSchema);