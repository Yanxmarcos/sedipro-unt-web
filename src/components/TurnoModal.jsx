// src/components/TurnoModal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { Check, XCircle, AlertCircle, ChevronRight, Clock, Calendar, Users } from 'lucide-react';
import {
  FaWhatsapp
} from 'react-icons/fa';
import Image from 'next/image';

// Componente de input de código
const CodigoInput = ({ value, onChange, error, isLoading }) => {
    const handleChange = (e) => {
        const input = e.target.value.replace(/\D/g, '').slice(0, 10);
        onChange(input);
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <input
                    type="text"
                    placeholder="0000000000"
                    maxLength="10"
                    inputMode="numeric"
                    value={value}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full h-14 rounded-lg text-white px-4 text-center text-lg tracking-widest font-mono focus:outline-none placeholder-gray-500 bg-[#0b1326]/80 border border-white/10 backdrop-blur-sm transition-all duration-300 focus:border-[#6b46c1]/50 focus:bg-[#0b1326]/60 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ caretColor: '#6b46c1' }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {value.length === 10 && !isLoading && (
                        <Check size={20} className="text-green-400 animate-pulse" />
                    )}
                    {isLoading && (
                        <div className="w-5 h-5 border-2 border-[#6b46c1] border-t-transparent rounded-full animate-spin"></div>
                    )}
                </div>
            </div>
            <p className="text-xs text-[#d0bcff]/60 text-center">
                {value.length}/10 dígitos (Código de Matrícula UNT)
            </p>
            {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                    <span className="text-red-200 text-xs">{error}</span>
                </div>
            )}
        </div>
    );
};

// Componente selector de turnos
const TurnoSelector = ({ turnos, selectedTurno, onSelect, isLoading, postulante }) => {
    // Filtrar turnos disponibles (con cupo)
    const turnosDisponibles = turnos.filter(t => t.inscritos < t.maximo);
    const turnosLlenos = turnos.filter(t => t.inscritos >= t.maximo);

    return (
        <div className="space-y-4">
            <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 text-center">
                <p className="text-sm text-[#d0bcff] mb-2">Información del Estudiante</p>
                <p className="text-sm font-mono text-[#d0bcff]/70 break-all">
                    <strong>Código:</strong> {postulante?.codigoMatricula || '---'}
                </p>
                <p className="text-sm font-mono text-[#d0bcff]/70 break-all">
                    <strong>Estudiante:</strong> {postulante?.nombres || ''} {postulante?.apellidos || ''}
                </p>
                {/* <p className="text-xs text-[#d0bcff]/70 mt-1">
                    <strong>Fase:</strong> {postulante?.faseActual || 'fase2'}
                </p> */}
            </div>
            
            <div>
                <p className="text-sm font-semibold text-[#d0bcff] mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Día: Sábado 27 de Junio.
                </p>
                
                {turnosDisponibles.length === 0 && turnosLlenos.length === 0 && (
                    <div className="text-center py-8 text-[#d0bcff]/60">
                        <p>No hay turnos disponibles en este momento</p>
                    </div>
                )}

                <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                    {/* Turnos disponibles */}
                    {turnosDisponibles.map((turno) => (
                        <button
                            key={turno.id}
                            onClick={() => onSelect(turno)}
                            disabled={isLoading}
                            className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                                selectedTurno?.id === turno.id
                                    ? 'border-[#05df72] bg-[#05df72]/20 shadow-lg shadow-[#05df72]/20'
                                    : 'border-white/10 bg-[#0b1326]/40 hover:border-[#6b46c1]/50 hover:bg-[#0b1326]/60'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                    <p className="font-semibold text-[#d0bcff]">{turno.nombre}</p>
                                    <p className="text-xs text-[#d0bcff]/70 mt-1 flex items-center gap-1">
                                        <Clock size={12} />
                                        De {turno.hora_inicio} a {turno.hora_fin}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#d0bcff]/60 flex items-center gap-1">
                                        <Users size={12} />
                                        {turno.inscritos}/{turno.maximo}
                                    </p>
                                    <p className="text-xs text-green-400 font-semibold mt-1">DISPONIBLE</p>
                                </div>
                            </div>
                            {selectedTurno?.id === turno.id && (
                                <div className="flex items-center gap-1 mt-3 text-[#05df72]">
                                    <Check size={14} />
                                    <span className="text-xs font-semibold">Seleccionado</span>
                                </div>
                            )}
                        </button>
                    ))}

                    {/* Turnos llenos */}
                    {turnosLlenos.map((turno) => (
                        <button
                            key={turno.id}
                            disabled
                            className="w-full p-4 rounded-lg border-2 border-red-500/30 bg-red-500/10 cursor-not-allowed opacity-50 text-left"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                    <p className="font-semibold text-[#d0bcff]">{turno.nombre}</p>
                                    <p className="text-xs text-[#d0bcff]/70 mt-1 flex items-center gap-1">
                                        <Clock size={12} />
                                        De {turno.hora_inicio} a {turno.hora_fin}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#d0bcff]/60 flex items-center gap-1">
                                        <Users size={12} />
                                        {turno.inscritos}/{turno.maximo}
                                    </p>
                                    <p className="text-xs text-red-400 font-semibold mt-1">LLENO</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Componente de confirmación
const ConfirmationMessage = ({ postulante, turno, onExit }) => {
    // URL del grupo de WhatsApp de Segunda Fase
    const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/FzMKPpdtimK4xetowyxRTZ";

    const handleJoinWhatsApp = () => {
        window.open(WHATSAPP_GROUP_URL, '_blank');
    };

    return (
        <div className="space-y-6 text-center">
            <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center animate-pulse">
                    <Check size={32} className="text-green-400" />
                </div>
            </div>
            
            <div className="space-y-3">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ¡Tu turno ha sido registrado!
                </h3>
                
                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-3">
                    <div>
                        <p className="text-sm font-mono text-[#d0bcff] break-all">
                            <strong>Código:</strong> {postulante?.codigoMatricula || '---'}
                        </p>
                        <p className="text-sm font-mono text-[#d0bcff] break-all">
                            <strong>Estudiante:</strong> {postulante?.nombres || ''} {postulante?.apellidos || ''}
                        </p>
                    </div>
                    <div className="pt-3 border-t border-[#6b46c1]/20">
                        <p className="text-xs text-[#d0bcff]/60 mb-2 text-center">Tu Turno</p>
                        <div className="flex flex-col items-center justify-center text-center">
                            <p className="text-lg font-bold text-[#d0bcff]">{turno?.nombre}</p>
                            <p className="text-sm text-[#d0bcff]/70">De {turno?.hora_inicio} a {turno?.hora_fin}</p>
                            <p className="text-xs text-[#d0bcff]/50 mt-1">
                                Cupo: {turno?.inscritos || 0}/{turno?.maximo || 0}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 space-y-2">
                    <p className="text-xs text-amber-200">
                        Por favor, <strong>llega 10 minutos antes</strong> de la hora establecida
                    </p>
                </div>
            </div>

            {/* ⭐ NUEVO BOTÓN: Unirme al grupo de WhatsApp */}
            <button
                onClick={handleJoinWhatsApp}
                className="w-full mb-4 px-6 py-3 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
                <FaWhatsapp size={25} />
                Unirme al grupo de Fase 2
            </button>
            
            <button
                onClick={onExit}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                Salir
            </button>
        </div>
    );
};

// Componente principal
export default function TurnoModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1); // 1: Código, 2: Turno, 3: Confirmación
    const [codigo, setCodigo] = useState('');
    const [postulante, setPostulante] = useState(null);
    const [turnos, setTurnos] = useState([]);
    const [selectedTurno, setSelectedTurno] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [edicionInfo, setEdicionInfo] = useState(null);

    // Resetear estado al cerrar
    useEffect(() => {
        if (!isOpen) {
            resetModal();
        }
    }, [isOpen]);

    const resetModal = () => {
        setStep(1);
        setCodigo('');
        setPostulante(null);
        setTurnos([]);
        setSelectedTurno(null);
        setError('');
        setIsLoading(false);
    };

    // Validar código y obtener información del postulante
    const handleCodigoSubmit = async () => {
        setError('');
        
        if (!codigo.trim()) {
            setError('Por favor ingresa tu código de matrícula');
            return;
        }
        
        if (codigo.length !== 10) {
            setError('Debes ingresar 10 dígitos exactamente');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/sedinvita/public/validar-postulante', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ codigoMatricula: codigo }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                if (result.code === 'YA_TIENE_TURNO') {
                    // El postulante ya tiene turno
                    setError(`Ya tienes un turno asignado: ${result.data?.turnoActual ? `${result.data.turnoActual.nombre} (De ${result.data.turnoActual.horarioInicio} a  ${result.data.turnoActual.horarioFin})` : ''}`);
                    // Mostrar opción para ver su turno actual
                } else {
                    setError(result.error || 'Error al validar el código');
                }
                setIsLoading(false);
                return;
            }

            // Guardar información del postulante
            setPostulante(result.data.postulante);
            setEdicionInfo(result.data.edicion);

            // Cargar turnos disponibles
            await cargarTurnos(result.data.postulante.faseActual || 'fase2');

            // Avanzar al paso 2
            setStep(2);

        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar turnos disponibles
    const cargarTurnos = async (fase = 'fase2') => {
        try {
            const response = await fetch(`/api/sedinvita/public/turnos?fase=${fase}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(result.error || 'Error al cargar los turnos');
                return;
            }

            setTurnos(result.data.turnos);
            setEdicionInfo(result.data.edicion);

            // Actualizar fase del postulante si es necesario
            if (postulante && !postulante.faseActual) {
                setPostulante(prev => ({ ...prev, faseActual: result.data.fase }));
            }

        } catch (error) {
            console.error('Error al cargar turnos:', error);
            setError('Error de conexión al cargar los turnos');
        }
    };

    // Seleccionar turno y registrar
    const handleTurnoSelect = async () => {
        if (!selectedTurno) {
            setError('Por favor selecciona un turno');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/sedinvita/public/registrar-turno', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigoMatricula: codigo,
                    turnoId: selectedTurno.id,
                    fase: postulante?.faseActual || 'fase2',
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                if (result.code === 'TURNO_LLENO') {
                    // Si el turno se llenó justo en ese momento, recargar turnos
                    await cargarTurnos(postulante?.faseActual || 'fase2');
                    setError('El turno seleccionado se llenó. Por favor, elige otro.');
                    setSelectedTurno(null);
                } else if (result.code === 'YA_TIENE_TURNO') {
                    setError('Ya tienes un turno asignado. No puedes seleccionar otro.');
                } else {
                    setError(result.error || 'Error al registrar el turno');
                }
                setIsLoading(false);
                return;
            }

            // Actualizar información del postulante y turno
            setPostulante(result.data.postulante);
            setSelectedTurno({
                ...selectedTurno,
                inscritos: result.data.turno.inscritos,
                maximo: result.data.turno.maximo,
                estado: result.data.turno.estado
            });

            // Avanzar a confirmación
            setStep(3);

        } catch (error) {
            console.error('Error al registrar turno:', error);
            setError('Error de conexión al registrar el turno');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExit = () => {
        resetModal();
        onClose();
    };

    const handleBackToTurnos = () => {
        setStep(2);
        setSelectedTurno(null);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Fondo oscuro */}
            <div 
                className="fixed inset-0 bg-black/40 z-40" 
                onClick={(e) => {
                    if (e.target === e.currentTarget && step !== 3) {
                        handleExit();
                    }
                }}
                role="button"
                tabIndex={0}
            />
            
            {/* Fondo con gradiente */}
            <div className="fixed inset-0 z-30 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b1326]/80 via-[#3b0191]/40 to-[#6b46c1]/50 backdrop-blur-[2px]"></div>
            </div>

            {/* Botón cerrar - Solo en paso 1 y 2 */}
            {step !== 3 && (
                <button
                    onClick={handleExit}
                    className="fixed top-4 right-4 z-50 p-2 rounded-full bg-[#3b0191]/40 backdrop-blur-md text-white hover:bg-[#6b46c1]/60 transition-all duration-200 border border-white/20 active:scale-95"
                    aria-label="Cerrar modal"
                >
                    <XCircle size={28} />
                </button>
            )}

            {/* Modal */}
            <div className={`relative z-50 w-full max-w-lg mx-4 my-auto rounded-2xl transition-all duration-500 overflow-hidden animate-fadeInUp`}
                style={{
                    background: 'linear-gradient(135deg, rgba(11, 19, 38, 0.95), rgba(59, 1, 145, 0.85))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(107, 70, 193, 0.3)',
                    boxShadow: '0 25px 50px -12px rgba(59, 1, 145, 0.5)'
                }}
            >
                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                            <Image
                                alt="SEDInvita 2026 Logo"
                                width={64}
                                height={64}
                                className="object-contain drop-shadow-lg"
                                src="/img/sedinvita-logo.webp"
                                priority
                            />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#d0bcff]">
                            SEDInvita {edicionInfo?.anio || '2026'}
                        </h2>
                        <p className="text-xs text-[#d0bcff]/50">
                            {/* {edicionInfo?.nombre || 'Edición'} */}
                            Selección de Turnos
                        </p>
                        
                        {/* Indicador de paso */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-[#6b46c1]' : 'bg-white/10'}`}></div>
                            <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-[#6b46c1]' : 'bg-white/10'}`}></div>
                            <div className={`h-1 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-[#6b46c1]' : 'bg-white/10'}`}></div>
                        </div>
                    </div>

                    {/* Contenido por paso */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <p className="text-[#d0bcff] text-sm mb-4">
                                    Para seleccionar un turno, ingresa tu código de matrícula UNT:
                                </p>
                                <CodigoInput 
                                    value={codigo}
                                    onChange={setCodigo}
                                    error={error}
                                    isLoading={isLoading}
                                />
                            </div>
                            
                            <button
                                onClick={handleCodigoSubmit}
                                disabled={isLoading || codigo.length !== 10}
                                className="w-full px-6 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Validando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Continuar</span>
                                        <ChevronRight size={18} />
                                    </div>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <TurnoSelector 
                                turnos={turnos}
                                selectedTurno={selectedTurno}
                                onSelect={setSelectedTurno}
                                isLoading={isLoading}
                                postulante={postulante}
                            />
                            
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                    <span className="text-red-200 text-xs">{error}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStep(1); setSelectedTurno(null); setError(''); }}
                                    className="flex-1 px-4 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/5 transition-all duration-300 active:scale-95"
                                >
                                    Atrás
                                </button>
                                <button
                                    onClick={handleTurnoSelect}
                                    disabled={isLoading || !selectedTurno}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Registrando...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <span>Registrar Turno</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fadeIn">
                            <ConfirmationMessage 
                                postulante={postulante}
                                turno={selectedTurno}
                                onExit={handleExit}
                            />
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-[#d0bcff]/50 text-xs">
                            © {new Date().getFullYear()} SEDIPRO UNT. Todos los derechos reservados.
                        </p>
                        <a 
                            href="https://wa.me/51963159172?text=Hola,%20tengo%20un%20problema%20con%20mi%20registro%20de%20turno."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-red-500/50 hover:text-red-500 text-xs hover:scale-105 transition-all duration-200 mt-1.5"
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            Reportar un problema
                        </a>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.4s ease-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}