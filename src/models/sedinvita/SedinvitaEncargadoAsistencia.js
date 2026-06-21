// src/models/sedinvita/SedinvitaEncargadoAsistencia.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const sedinvitaEncargadoAsistenciaSchema = new mongoose.Schema({
    turnoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaTurno',
        required: true,
        index: true,
    },
    edicionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaEdicion',
        required: true,
        index: true,
    },
    sedipranoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sediprano',
        required: true,
    },
    nombres: { type: String, required: true, trim: true },
    apellidos: { type: String, required: true, trim: true },
    dni: { type: String, required: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
}, {
    collection: 'sedinvita_encargados_asistencia',
    timestamps: true,
});

// Un mismo sediprano no puede asignarse dos veces al mismo turno
sedinvitaEncargadoAsistenciaSchema.index({ turnoId: 1, sedipranoId: 1 }, { unique: true });

sedinvitaEncargadoAsistenciaSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    } catch (error) {
        throw error;
    }
});

sedinvitaEncargadoAsistenciaSchema.methods.comparePassword = async function (candidate) {
    return await bcrypt.compare(candidate, this.passwordHash);
};

sedinvitaEncargadoAsistenciaSchema.virtual('nombreCompleto').get(function () {
    return `${this.nombres} ${this.apellidos}`;
});

export default mongoose.models.SedinvitaEncargadoAsistencia ||
    mongoose.model('SedinvitaEncargadoAsistencia', sedinvitaEncargadoAsistenciaSchema);