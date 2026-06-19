// src/models/Sedinvitado.js
import mongoose from 'mongoose';

const sedinvitadoSchema = new mongoose.Schema({
    correoElectronico: {
        type: String,
        required: [true, 'El correo electrónico es requerido'],
        trim: true,
        lowercase: true,
        index: true,
    },
    apellidos: {
        type: String,
        required: [true, 'Los apellidos son requeridos'],
        trim: true,
    },
    nombres: {
        type: String,
        required: [true, 'Los nombres son requeridos'],
        trim: true,
    },
    codigoMatricula: {
        type: String,
        required: [true, 'El código de matrícula es requerido'],
        unique: true,
        trim: true,
        index: true,
    },
    numeroCelular: {
        type: String,
        trim: true,
    },
}, {
    collection: 'sedinvitados',
    timestamps: true,  // createdAt, updatedAt automáticos
});

// Virtual: nombre completo
sedinvitadoSchema.virtual('nombreCompleto').get(function () {
    return `${this.nombres} ${this.apellidos}`;
});

// Virtual: apellidos y nombres (para búsquedas)
sedinvitadoSchema.virtual('apellidosNombres').get(function () {
    return `${this.apellidos}, ${this.nombres}`;
});

// Asegurar que los virtuals se incluyan en los JSON
sedinvitadoSchema.set('toJSON', { virtuals: true });
sedinvitadoSchema.set('toObject', { virtuals: true });

export default mongoose.models.Sedinvitado || mongoose.model('Sedinvitado', sedinvitadoSchema);