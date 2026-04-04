import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '6h'; // 6 horas

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en .env.local');
}

export function generateToken(user) {
    const payload = {
        id: user._id,
        user: user.user,
        rol: user.rol,
        nombres: user.nombres,
        apellidos: user.apellidos
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
}