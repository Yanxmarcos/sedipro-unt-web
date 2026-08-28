import mongoose from 'mongoose'

const registroItemSchema = new mongoose.Schema({
    sedipranoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sediprano', required: true },
    estado: { type: String, enum: ['presente', 'ausente', 'justificado', 'tardanza'], default: 'ausente' },
    hora: { type: Date },
    registradoPor: { type: String, trim: true },
}, { _id: false })

const asistenciaSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    descripcion: { type: String, required: true, trim: true },
    registro: [registroItemSchema],
    resumen: {
        presentes:    { type: Number, default: 0 },
        ausentes:     { type: Number, default: 0 },
        justificados: { type: Number, default: 0 },
        tardanzas:    { type: Number, default: 0 },
    },
}, {
    collection: 'asistencias',
    timestamps: true,
})

export default mongoose.models.Asistencia || mongoose.model('Asistencia', asistenciaSchema)