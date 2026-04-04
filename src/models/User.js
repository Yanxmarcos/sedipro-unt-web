import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    user: {
        type: String,
        required: [true, 'El usuario es requerido'],
        unique: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    nombres: {
        type: String,
        required: [true, 'Los nombres son requeridos'],
        trim: true
    },
    apellidos: {
        type: String,
        required: [true, 'Los apellidos son requeridos'],
        trim: true
    },
    rol: {
        type: String,
        enum: ['DIRECTIVA', 'ADMIN', 'USER'],
        default: 'USER'
    },
    dni: {
        type: String,
        required: [true, 'El DNI es requerido'],
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
}, { 
    collection: 'users',
    timestamps: true 
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        user: this.user,
        nombres: this.nombres,
        apellidos: this.apellidos,
        rol: this.rol,
        dni: this.dni
    };
};

export default mongoose.models.User || mongoose.model('User', userSchema);