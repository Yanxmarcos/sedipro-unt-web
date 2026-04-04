import mongoose from 'mongoose'

const resumenOpcionSchema = new mongoose.Schema({
    opcion: { type: String, required: true },
    votos: { type: Number, default: 0 },
}, { _id: false })

const votacionSchema = new mongoose.Schema({
    asistenciaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asistencia', required: true },
    titulo: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ['binaria', 'multiple'], required: true },
    opciones: [{ type: String }],
    estado: { type: String, enum: ['activa', 'cerrada'], default: 'activa' },
    fechaInicio: { type: Date },
    fechaCierre: { type: Date },
    resumen: {
        totalVotos: { type: Number, default: 0 },
        opciones: [resumenOpcionSchema],
    },
}, {
    collection: 'votaciones',
    timestamps: true,
})

export default mongoose.models.Votacion || mongoose.model('Votacion', votacionSchema)