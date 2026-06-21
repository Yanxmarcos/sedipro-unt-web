// src/models/sedinvita/SedinvitaFacilitador.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const sedinvitaFacilitadorSchema = new mongoose.Schema({
    edicionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaEdicion',
        required: true,
        index: true,
    },
    // El facilitador SIEMPRE es un Sediprano existente (de cualquier área,
    // incluida Directiva). Sus datos se copian del Sediprano al asignarlo,
    // no se capturan a mano.
    sedipranoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sediprano',
        required: true,
    },
    nombres: {
        type: String,
        required: [true, 'Los nombres son requeridos'],
        trim: true,
    },
    apellidos: {
        type: String,
        required: [true, 'Los apellidos son requeridos'],
        trim: true,
    },
    dni: {
        type: String,
        required: [true, 'El DNI es requerido'],
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
}, {
    collection: 'sedinvita_facilitadores',
    timestamps: true,
});

// Un mismo sediprano no puede registrarse dos veces como facilitador en la misma edición
sedinvitaFacilitadorSchema.index({ edicionId: 1, sedipranoId: 1 }, { unique: true });

sedinvitaFacilitadorSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    } catch (error) {
        throw error;
    }
});

sedinvitaFacilitadorSchema.methods.comparePassword = async function (candidate) {
    return await bcrypt.compare(candidate, this.passwordHash);
};

sedinvitaFacilitadorSchema.virtual('nombreCompleto').get(function () {
    return `${this.nombres} ${this.apellidos}`;
});

export default mongoose.models.SedinvitaFacilitador || mongoose.model('SedinvitaFacilitador', sedinvitaFacilitadorSchema);