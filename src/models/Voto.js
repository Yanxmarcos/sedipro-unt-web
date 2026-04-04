import mongoose from 'mongoose'

const votoSchema = new mongoose.Schema({
    votacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Votacion', required: true },
    sedipranoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sediprano', required: true },
    opcionSeleccionada: { type: String, required: true },
    fechaVoto: { type: Date, default: Date.now },
}, {
    collection: 'votos',
    timestamps: false,
})

// Índice único: evitar doble voto
votoSchema.index({ votacionId: 1, sedipranoId: 1 }, { unique: true })

export default mongoose.models.Voto || mongoose.model('Voto', votoSchema)