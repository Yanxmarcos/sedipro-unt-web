// /src/lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Por favor define la variable MONGODB_URI en .env.local');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) { 
        return cached.conn; 
    }

    if (!cached.promise) {
        // FIX VERCEL: Cargar todos los modelos ANTES de conectar
        // Esto asegura que Mongoose tenga los schemas registrados
        await loadModels();

        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        .then((mongoose) => {
            return mongoose;
        })
        .catch((error) => {
            console.error('Error al conectar a base de datos:', error);
            cached.promise = null; // Reset para reintentar
            throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// FIX VERCEL: Registrar todos los modelos de Mongoose
// En Vercel, cada Lambda es aislada y pierde el registro de modelos
async function loadModels() {
    try {
        // Modelos SEDInvita - TODOS AQUÍ
        await Promise.all([
            import('@/models/sedinvita/SedinvitaEdicion'),
            import('@/models/sedinvita/SedinvitaTurno'),
            import('@/models/sedinvita/SedinvitaPostulante'),
            import('@/models/sedinvita/SedinvitaGrupo'),
            import('@/models/sedinvita/SedinvitaFacilitador'),
            import('@/models/sedinvita/SedinvitaEncargadoAsistencia'),
            import('@/models/sedinvita/SedinvitaDinamica'),
            import('@/models/sedinvita/SedinvitaEvaluacion'),
            import('@/models/sedinvita/SedinvitaAsistencia'),
            
            // Otros modelos
            import('@/models/User'),
            import('@/models/Asistencia'),
            import('@/models/EncargadoAsistencia'),
            import('@/models/Sediprano'),
            import('@/models/Votacion'),
            import('@/models/Voto'),
        ]);
    } catch (error) {
        // Si algún modelo no existe, no falla - solo ignora
        // Esto es normal si no tienes todos los modelos
        console.warn('Algunos modelos no pudieron cargarse:', error.message);
    }
}