'use client';
import React, { useState } from 'react';
import { Check, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const DNIInput = ({ value, onChange, error, isLoading }) => {
    const handleChange = (e) => {
        const input = e.target.value.replace(/\D/g, '').slice(0, 11);
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
                {value.length}/10 dígitos (Código de Matrícula)
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

const TurnoSelector = ({ turnos, selectedTurno, onSelect, isLoading, codigo }) => {
    return (
        <div className="space-y-4">
            <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4">
                <p className="text-sm text-[#d0bcff] mb-2">Información del Participante</p>
                <p className="text-xs text-[#d0bcff]/70 break-all"> <strong>Código:</strong> {codigo}</p>
                <p className="text-xs text-[#d0bcff]/70 break-all"> <strong>Nombre:</strong> Yanxmarcos Chan Vásquez</p>
            </div>
            
            <div>
                <p className="text-sm font-semibold text-[#d0bcff] mb-3">Selecciona tu turno</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                    {turnos.map((turno) => (
                        <button
                            key={turno.id}
                            onClick={() => onSelect(turno)}
                            disabled={turno.inscritos >= turno.maximo || isLoading}
                            className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                                selectedTurno?.id === turno.id
                                    ? 'border-[#05df72] bg-[#05df72]/20 shadow-lg shadow-[#05df72]/20'
                                    : turno.inscritos >= turno.maximo
                                    ? 'border-red-500/30 bg-red-500/10 cursor-not-allowed opacity-50'
                                    : 'border-white/10 bg-[#0b1326]/40 hover:border-[#6b46c1]/50 hover:bg-[#0b1326]/60'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                    <p className="font-semibold text-[#d0bcff]">{turno.hora}</p>
                                    <p className="text-xs text-[#d0bcff]/70 mt-1">{turno.dia}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#d0bcff]/60">
                                        {turno.inscritos}/{turno.maximo}
                                    </p>
                                    {turno.inscritos >= turno.maximo && (
                                        <p className="text-xs text-red-400 font-semibold mt-1">LLENO</p>
                                    )}
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
                </div>
            </div>
        </div>
    );
};

const ConfirmationMessage = ({ codigo, turno, onExit }) => {
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
                        <p className="text-sm font-mono text-[#d0bcff] break-all"> <strong>Código:</strong> {codigo}</p>
                        <p className="text-sm font-mono text-[#d0bcff] break-all"><strong>Nombre:</strong> Yanxmarcos Chan Vásquez</p>
                    </div>
                    <div className="pt-3 border-t border-[#6b46c1]/20">
                        <p className="text-xs text-[#d0bcff]/60 mb-2 text-center">Tu Turno</p>
                        <div className="flex flex-col items-center justify-center text-center">
                            <p className="text-lg font-bold text-[#d0bcff]">{turno.hora}</p>
                            <p className="text-sm text-[#d0bcff]/70">{turno.dia}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-amber-200"> <strong>Nota:</strong> Por favor, <strong>llega 10 minutos antes</strong> de la hora establecida</p>
                </div>
            </div>
            
            <button
                onClick={onExit}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                Salir
            </button>
        </div>
    );
};

export default function TurnoModal ({ isOpen, onClose }) {
    const [step, setStep] = useState(1); // 1: DNI, 2: Turno, 3: Confirmación
    const [codigo, setCodigo] = useState('');
    const [selectedTurno, setSelectedTurno] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Datos mockeados de turnos - Reemplazar con datos reales de API
    const turnos = [
        { id: 1, hora: '08:00 AM', dia: 'Sábado 27 de Junio', inscritos: 28, maximo: 30 },
        { id: 2, hora: '10:00 AM', dia: 'Sábado 27 de Junio', inscritos: 30, maximo: 30 },
        { id: 3, hora: '02:00 PM', dia: 'Sábado 27 de Junio', inscritos: 15, maximo: 30 },
        { id: 4, hora: '04:00 PM', dia: 'Sábado 27 de Junio', inscritos: 22, maximo: 30 },
    ];
 
    const handleDNISubmit = async () => {
        setError('');
        
        if (!codigo.trim()) {
            setError('Por favor ingresa tu número');
            return;
        }
        
        if (codigo.length !== 10) {
            setError('Debes ingresar 10 dígitos exactamente');
            return;
        }
 
        setIsLoading(true);
        
        // Simular validación con API
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
        }, 800);
    };
 
    const handleTurnoSelect = async () => {
        if (!selectedTurno) {
            setError('Por favor selecciona un turno');
            return;
        }
 
        setIsLoading(true);
        
        // Simular registro en API
        setTimeout(() => {
            setIsLoading(false);
            setStep(3);
        }, 1200);
    };
 
    const handleExit = () => {
        setStep(1);
        setCodigo('');
        setSelectedTurno(null);
        setError('');
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
            {/* Fondo oscuro - IMPORTANTE: Permitir clicks solo en el fondo */}
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
            <div className={`relative z-50 w-full max-w-lg mx-4 my-auto rounded-2xl transition-all duration-500 overflow-hidden ${
                step === 1 ? 'animate-fadeInUp' : step === 2 ? 'animate-fadeInUp' : 'animate-fadeInUp'
            }`}
                style={{
                    background: 'linear-gradient(135deg, rgba(11, 19, 38, 0.95), rgba(59, 1, 145, 0.85))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(107, 70, 193, 0.3)',
                    boxShadow: '0 25px 50px -12px rgba(59, 1, 145, 0.5)'
                }}>
                
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
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-on-surface"
                            >
                            SEDInvita 2026
                        </h2>
                        
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
                                    Para seleccionar un turno, primero ingrese tu código de matrícula UNT:
                                </p>
                                <DNIInput 
                                    value={codigo}
                                    onChange={setCodigo}
                                    error={error}
                                    isLoading={isLoading}
                                />
                            </div>
                            
                            <button
                                onClick={handleDNISubmit}
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
                                codigo={codigo}
                            />
                            
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                    <span className="text-red-200 text-xs">{error}</span>
                                </div>
                            )}
 
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBackToTurnos}
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
                                            <span>Registrar</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
 
                    {step === 3 && (
                        <div className="animate-fadeIn">
                            <ConfirmationMessage 
                                codigo={codigo}
                                turno={selectedTurno}
                                onExit={handleExit}
                            />
                        </div>
                    )}
 
                    {/* Footer */}
                    <p className="text-[#d0bcff]/50 text-xs text-center mt-8">
                        © 2026 SEDIPRO UNT. Todos los derechos reservados.
                    </p>
                </div>
            </div>
 
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.5s ease-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};