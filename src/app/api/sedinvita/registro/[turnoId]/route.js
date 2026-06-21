// src/app/api/sedinvita/registro/[turnoId]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SedinvitaTurno from '@/models/sedinvita/SedinvitaTurno';
import SedinvitaPostulante from '@/models/sedinvita/SedinvitaPostulante';
import SedinvitaAsistencia from '@/models/sedinvita/SedinvitaAsistencia';
import SedinvitaEncargadoAsistencia from '@/models/sedinvita/SedinvitaEncargadoAsistencia';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function POST(request, { params }) {
    try {
        await connectToDatabase();
        const { turnoId } = await params;
        const { codigoMatricula } = await request.json();

        if (!codigoMatricula?.trim()) {
            return NextResponse.json({ message: 'El código de matrícula es requerido' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('sedinvita_encargado_token')?.value;
        const decoded = token ? verifyToken(token) : null;

        if (!decoded || decoded.rol !== 'sedinvita_encargado') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        // Se re-verifica contra la BD: si el encargado fue removido de este
        // turno, pierde el acceso de inmediato aunque su token siga vigente.
        const asignado = await SedinvitaEncargadoAsistencia.findOne({ turnoId, dni: decoded.dni }).lean();
        if (!asignado) {
            return NextResponse.json(
                { message: 'Ya no tienes acceso a este turno. Contacta a la directiva.' },
                { status: 403 }
            );
        }

        const turno = await SedinvitaTurno.findById(turnoId).lean();
        if (!turno) {
            return NextResponse.json({ message: 'Turno no encontrado' }, { status: 404 });
        }

        const postulante = await SedinvitaPostulante.findOne({
            turnoId,
            codigoMatricula: codigoMatricula.trim(),
        });

        if (!postulante) {
            return NextResponse.json(
                { message: 'No se encontró un postulante con ese código en este turno' },
                { status: 404 }
            );
        }

        if (postulante.estadoGeneral !== 'habilitado') {
            return NextResponse.json(
                { message: `${postulante.nombres} ${postulante.apellidos} ya no está habilitado para continuar en el proceso` },
                { status: 400 }
            );
        }

        let asistencia = await SedinvitaAsistencia.findOne({ postulanteId: postulante._id, turnoId });

        if (asistencia?.estado === 'presente') {
            return NextResponse.json({
                message: `${postulante.nombres} ${postulante.apellidos} ya fue registrado como presente`,
                yaRegistrado: true,
                postulante: { nombres: postulante.nombres, apellidos: postulante.apellidos, codigoMatricula: postulante.codigoMatricula },
            });
        }

        const registradoPor = `${decoded.nombres} ${decoded.apellidos}`;

        if (asistencia) {
            asistencia.estado = 'presente';
            asistencia.registradoPor = registradoPor;
            asistencia.hora = new Date();
            await asistencia.save();
        } else {
            asistencia = await SedinvitaAsistencia.create({
                edicionId: postulante.edicionId,
                fase: turno.fase,
                turnoId,
                postulanteId: postulante._id,
                estado: 'presente',
                registradoPor,
                hora: new Date(),
            });
        }

        // Avanza el flujo operativo del postulante dentro de la fase actual
        postulante.estadoOperativo = 'asistio';
        await postulante.save();

        return NextResponse.json({
            message: `¡${postulante.nombres} ${postulante.apellidos} registrado como presente!`,
            postulante: { nombres: postulante.nombres, apellidos: postulante.apellidos, codigoMatricula: postulante.codigoMatricula },
        });

    } catch (error) {
        console.error('Error al registrar asistencia:', error);
        return NextResponse.json({ message: 'Error al registrar asistencia' }, { status: 500 });
    }
}