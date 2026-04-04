import mongoose from 'mongoose';

const sedipranoSchema = new mongoose.Schema({
    area: {
        type: String,
        required: [true, 'El área es requerida'],
        trim: true,
        index: true,
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
        unique: true,
        trim: true,
    },
}, {
    collection: 'sedipranos',
    timestamps: true,
});

sedipranoSchema.virtual('nombreCompleto').get(function () {
    return `${this.nombres} ${this.apellidos}`;
});

export default mongoose.models.Sediprano || mongoose.model('Sediprano', sedipranoSchema);