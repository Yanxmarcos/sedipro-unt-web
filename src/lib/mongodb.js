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
    if (cached.conn) { return cached.conn; }

    if (!cached.promise) {
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
            throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}