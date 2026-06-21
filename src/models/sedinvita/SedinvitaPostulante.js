// src/models/sedinvita/SedinvitaPostulante.js
import mongoose from 'mongoose';

// Registro inmutable del historial de fases. Nunca se edita ni se elimina,
// solo se agregan nuevos registros cuando la directiva toma una decisión.
const historialFaseSchema = new mongoose.Schema({
    fase: {
        type: String,
        required: true,
        trim: true,
    },
    resultado: {
        type: String,
        enum: ['avanza', 'no_avanza'],
        required: true,
    },
    puntaje: {
        type: Number,
    },
    fecha: {
        type: Date,
        default: Date.now,
    },
    comentario: {
        type: String,
        trim: true,
    },
}, { _id: false });

const sedinvitaPostulanteSchema = new mongoose.Schema({
    edicionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaEdicion',
        required: true,
        index: true,
    },
    correoElectronico: {
        type: String,
        required: [true, 'El correo electrónico es requerido'],
        trim: true,
        lowercase: true,
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
        trim: true,
    },
    numeroCelular: {
        type: String,
        trim: true,
    },

    // ---- Modelo de estado del postulante (tres conceptos independientes) ----

    // 1. Estado General: solo indica si sigue participando. Nunca se elimina el registro.
    estadoGeneral: {
        type: String,
        enum: ['habilitado', 'inhabilitado'],
        default: 'habilitado',
        index: true,
    },

    // 2. Fase Actual: en qué fase está. Si queda eliminado, queda congelada aquí.
    faseActual: {
        type: String,
        enum: ['fase2', 'fase3', 'fase4'],
        default: 'fase2',
        index: true,
    },

    // 3. Estado Operativo: controla el flujo interno DENTRO de la fase actual.
    // Se reinicia cada vez que el postulante avanza de fase.
    // Valores típicos: pendiente_turno, turno_elegido, grupo_asignado,
    // asistio, evaluado, pendiente_decision (no se restringe a enum para
    // permitir nuevos estados operativos en fases futuras sin migrar el schema).
    estadoOperativo: {
        type: String,
        trim: true,
        default: 'pendiente_turno',
    },

    // Historial permanente de decisiones de fase. Solo se agrega, nunca se modifica.
    historialFases: {
        type: [historialFaseSchema],
        default: [],
    },

    // ---- Referencias operativas de la fase actual ----
    turnoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaTurno',
        default: null,
    },
    grupoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SedinvitaGrupo',
        default: null,
    },
}, {
    collection: 'sedinvita_postulantes',
    timestamps: true,
});

// El código de matrícula puede repetirse entre ediciones distintas (años),
// pero debe ser único dentro de la misma edición.
sedinvitaPostulanteSchema.index({ edicionId: 1, codigoMatricula: 1 }, { unique: true });

sedinvitaPostulanteSchema.virtual('nombreCompleto').get(function () {
    return `${this.nombres} ${this.apellidos}`;
});

sedinvitaPostulanteSchema.virtual('apellidosNombres').get(function () {
    return `${this.apellidos}, ${this.nombres}`;
});

sedinvitaPostulanteSchema.set('toJSON', { virtuals: true });
sedinvitaPostulanteSchema.set('toObject', { virtuals: true });

export default mongoose.models.SedinvitaPostulante || mongoose.model('SedinvitaPostulante', sedinvitaPostulanteSchema);