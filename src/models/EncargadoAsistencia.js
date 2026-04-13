import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const encargadoAsistenciaSchema = new mongoose.Schema({
    asistenciaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asistencia',
        required: true,
        index: true,
    },
    sedipranoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sediprano',
        required: true,
    },
    nombres:      { type: String, required: true, trim: true },
    apellidos:    { type: String, required: true, trim: true },
    dni:          { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
}, {
    collection: 'encargados_asistencia',
    timestamps: true,
})

encargadoAsistenciaSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return
    try {
        const salt = await bcrypt.genSalt(10)
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    } catch (error) {
        throw error
    }
})

encargadoAsistenciaSchema.methods.comparePassword = async function (candidate) {
    return await bcrypt.compare(candidate, this.passwordHash)
}

encargadoAsistenciaSchema.virtual('nombreCompleto').get(function () {
    return `${this.nombres} ${this.apellidos}`
})

export default mongoose.models.EncargadoAsistencia ||
    mongoose.model('EncargadoAsistencia', encargadoAsistenciaSchema)