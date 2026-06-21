// src/app/api/sedinvita/evaluaciones/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaGrupo from '@/models/sedinvita/SedinvitaGrupo';
import SedinvitaDinamica from '@/models/sedinvita/SedinvitaDinamica';
import SedinvitaEvaluacion from '@/models/sedinvita/SedinvitaEvaluacion';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function getAuth() {
    const cookieStore = await cookies();

    const adminToken = cookieStore.get('auth_token')?.value;
    if (adminToken) {
        const payload = verifyToken(adminToken);
        if (payload) return { tipo: 'admin', payload };
    }

    const facilitadorToken = cookieStore.get('facilitador_token')?.value;
    if (facilitadorToken) {
        const payload = verifyToken(facilitadorToken);
        if (payload && payload.rol === 'facilitador') return { tipo: 'facilitador', payload };
    }

    return null;
}

function esFacilitadorDelGrupo(grupo, facilitadorId) {
    return (grupo.facilitadores || []).some(f => f.toString() === facilitadorId);
}

export async function GET(request) {
    try {
        const auth = await getAuth();
        if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const grupoId = searchParams.get('grupoId');
        if (!grupoId) {
            return NextResponse.json({ error: 'grupoId es requerido' }, { status: 400 });
        }

        const grupo = await SedinvitaGrupo.findById(grupoId)
            .populate('turnoId', 'nombre fase')
            .populate('postulantes', 'nombres apellidos codigoMatricula estadoGeneral')
            .lean();

        if (!grupo) {
            return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
        }

        // Un facilitador solo puede ver grupos donde él está en el array `facilitadores`.
        // Se re-verifica contra la BD (no contra el token) para que una reasignación
        // tenga efecto inmediato.
        if (auth.tipo === 'facilitador' && !esFacilitadorDelGrupo(grupo, auth.payload.id)) {
            return NextResponse.json({ error: 'No puedes ver un grupo que no es tuyo' }, { status: 403 });
        }

        const dinamicas = await SedinvitaDinamica.find({ turnoId: grupo.turnoId._id })
            .sort({ orden: 1 })
            .lean();

        const evaluaciones = await SedinvitaEvaluacion.find({ grupoId }).lean();

        return NextResponse.json({ success: true, grupo, dinamicas, evaluaciones });

    } catch (error) {
        console.error('Error al obtener evaluaciones:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const auth = await getAuth();
        if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { grupoId, postulanteId, dinamicaId, puntajes, comentario, opinionInfiltrado } = body;

        if (!grupoId || !postulanteId || !dinamicaId) {
            return NextResponse.json({ error: 'grupoId, postulanteId y dinamicaId son requeridos' }, { status: 400 });
        }

        const lista = (puntajes || []).filter(p => p?.competencia && p?.puntaje);
        if (lista.length !== 3 || lista.some(p => p.puntaje < 1 || p.puntaje > 4)) {
            return NextResponse.json({ error: 'Debes calificar las tres competencias con un puntaje entre 1 y 4' }, { status: 400 });
        }

        await connectToDatabase();

        const grupo = await SedinvitaGrupo.findById(grupoId).lean();
        if (!grupo) {
            return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
        }

        if (auth.tipo !== 'facilitador' || !esFacilitadorDelGrupo(grupo, auth.payload.id)) {
            return NextResponse.json({ error: 'No autorizado a evaluar este grupo' }, { status: 403 });
        }

        const perteneceAlGrupo = grupo.postulantes.some(p => p.toString() === postulanteId);
        if (!perteneceAlGrupo) {
            return NextResponse.json({ error: 'Ese postulante no pertenece a tu grupo' }, { status: 400 });
        }

        const dinamica = await SedinvitaDinamica.findById(dinamicaId).lean();
        if (!dinamica || dinamica.turnoId.toString() !== grupo.turnoId.toString()) {
            return NextResponse.json({ error: 'Esa dinámica no corresponde al turno de tu grupo' }, { status: 400 });
        }

        const evaluacion = await SedinvitaEvaluacion.findOneAndUpdate(
            { postulanteId, dinamicaId },
            {
                edicionId: grupo.edicionId,
                postulanteId,
                dinamicaId,
                grupoId,
                facilitadorId: auth.payload.id,
                puntajes: lista,
                comentario: comentario?.trim(),
                opinionInfiltrado: opinionInfiltrado?.trim(),
            },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, data: evaluacion });

    } catch (error) {
        console.error('Error al guardar evaluación:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}