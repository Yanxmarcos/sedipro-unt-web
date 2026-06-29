// src/components/ResultadosFase2Modal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { Check, XCircle, AlertCircle, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';

// Áreas disponibles para segunda fase
const AREAS_DISPONIBLES = [
    { 
        id: 'gth', 
        nombre: 'GTH', 
        corto: 'Gestión del Talento Humano', 
        logo: '/img/areas/logo-gth.webp',
        color: 'from-green-400 to-emerald-500',
        textColor: 'text-green-400',
        checkColor: 'text-green-400',
        bgSelected: 'bg-green-500/10',
        borderSelected: 'border-green-500/50'
    },
    { 
        id: 'pmo', 
        nombre: 'PMO', 
        corto: 'Project Management Office', 
        logo: '/img/areas/logo-pmo.webp',
        color: 'from-yellow-400 to-amber-500',
        textColor: 'text-yellow-400',
        checkColor: 'text-yellow-400',
        bgSelected: 'bg-yellow-500/10',
        borderSelected: 'border-yellow-500/50'
    },
    { 
        id: 'ti', 
        nombre: 'TI', 
        corto: 'Tecnologías de la Información', 
        logo: '/img/areas/logo-ti.webp',
        color: 'from-orange-400 to-orange-500',
        textColor: 'text-orange-400',
        checkColor: 'text-orange-400',
        bgSelected: 'bg-orange-500/10',
        borderSelected: 'border-orange-500/50'
    },
    { 
        id: 'mkt', 
        nombre: 'MKT', 
        corto: 'Marketing', 
        logo: '/img/areas/logo-mkt.webp',
        color: 'from-red-400 to-red-500',
        textColor: 'text-red-400',
        checkColor: 'text-red-400',
        bgSelected: 'bg-red-500/10',
        borderSelected: 'border-red-500/50'
    },
    { 
        id: 'ltkyfnz', 
        nombre: 'LTK & FNZ', 
        corto: 'Logística y Finanzas', 
        logo: '/img/areas/logo-ltk.webp',
        color: 'from-cyan-400 to-sky-500',
        textColor: 'text-cyan-400',
        checkColor: 'text-cyan-400',
        bgSelected: 'bg-cyan-500/10',
        borderSelected: 'border-cyan-500/50'
    },
];

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

// Componente de área selector
const AreaSelector = ({ selectedArea, onSelect, isLoading, estudiante }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-500/50 flex items-center justify-center animate-pulse">
                    <Sparkles size={36} className="text-green-400" />
                </div>
            </div>

            <div className="space-y-3 text-center animate-fadeIn">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ¡Felicidades!
                </h3>
                <p className="text-[#d0bcff] text-sm">
                    Has superado exitosamente la Fase 2 del proceso de selección.
                </p>

                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Código:</strong> {estudiante?.codigoMatricula || '---'}
                    </p>
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Estudiante:</strong> {estudiante?.nombres || ''} {estudiante?.apellidos || ''}
                    </p>
                </div>
            </div>
            
            <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 text-center">
                <p className="text-[#d0bcff] text-sm">
                    Ahora selecciona el <strong>área</strong> a la que deseas postular:
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2">
                {AREAS_DISPONIBLES.map((area) => {
                    const isSelected = selectedArea?.id === area.id;
                    return (
                        <button
                            key={area.id}
                            onClick={() => onSelect(area)}
                            disabled={isLoading}
                            className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                                isSelected
                                    ? `${area.borderSelected} ${area.bgSelected} shadow-lg`
                                    : 'border-white/10 bg-[#0b1326]/40 hover:border-[#6b46c1]/50 hover:bg-[#0b1326]/60'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <p className={`font-semibold transition-colors duration-300 ${
                                        isSelected ? area.textColor : 'text-[#d0bcff]'
                                    }`}>
                                        {area.nombre}
                                    </p>
                                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                                        isSelected ? area.textColor : 'text-[#d0bcff]/50'
                                    }`}>
                                        {area.corto}
                                    </p>
                                </div>
                                <div className="w-15 h-15 rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                        src={area.logo}
                                        alt={`Logo ${area.nombre}`}
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full"
                                        style={{ 
                                            transform: 'scale(2)',
                                            objectPosition: 'center center'
                                        }}
                                    />
                                </div>
                            </div>
                            {isSelected && (
                                <div className={`flex items-center gap-1 mt-3 ${area.checkColor}`}>
                                    <Check size={14} />
                                    <span className="text-xs font-semibold">Seleccionado</span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Componente de resultado - Pasó
const ResultadoExitoso = ({ estudiante, areaSeleccionada, onExit }) => {
    const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/FUoKXYbQ2C41bZtU2JDE35";

    const handleJoinWhatsApp = () => {
        window.open(WHATSAPP_GROUP_URL, '_blank');
    };

    return (
        <div className="space-y-6 text-center animate-fadeIn">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-500/50 flex items-center justify-center animate-pulse">
                    <Sparkles size={36} className="text-green-400" />
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ¡Felicidades!
                </h3>
                <p className="text-[#d0bcff] text-sm">
                    Has superado exitosamente la Fase 2 del proceso de selección.
                </p>

                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Código:</strong> {estudiante?.codigoMatricula || '---'}
                    </p>
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Estudiante:</strong> {estudiante?.nombres || ''} {estudiante?.apellidos || ''}
                    </p>
                    {areaSeleccionada && (
                        <div className="pt-3 border-t border-[#6b46c1]/20">
                            <p className="text-xs text-[#d0bcff]/60 mb-1">Área seleccionada</p>
                            <p className="text-sm font-semibold text-[#d0bcff]">{areaSeleccionada.nombre}</p>
                            <p className="text-sm text-[#d0bcff]">{areaSeleccionada.corto}</p>
                        </div>
                    )}
                </div>

                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 space-y-2">
                    <p className="text-xs text-amber-200 flex items-center justify-center gap-2">
                        <span>Tu área seleccionada ha sido registrada exitosamente.</span>
                    </p>
                </div>
            </div>

            <button
                onClick={handleJoinWhatsApp}
                className="w-full px-6 py-3 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
                <FaWhatsapp size={25} />
                Unirme Comunidad de Fase 3
            </button>

            <button
                onClick={onExit}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                Finalizar
            </button>
        </div>
    );
};

// Componente de resultado - No pasó
const ResultadoNoExitoso = ({ estudiante, onExit }) => {
    return (
        <div className="space-y-6 text-center animate-fadeIn">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center animate-pulse">
                    <Heart size={36} className="text-red-400" />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    ¡No te desanimes!
                </h3>

                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Código:</strong> {estudiante?.codigoMatricula || '---'}
                    </p>
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Estudiante:</strong> {estudiante?.nombres || ''} {estudiante?.apellidos || ''}
                    </p>
                </div>

                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-amber-200">
                        Lamentamos informarte que no has superado la Fase 2 del proceso de selección.
                    </p>
                    <p className="text-sm text-amber-200">
                        Te invitamos a seguir preparándote y participar en futuras convocatorias.
                    </p>
                </div>

                <div className="bg-[#0b1326]/40 border border-white/10 rounded-lg p-4">
                    <p className="text-sm text-[#d0bcff]/90 italic">
                        Gracias por formar parte de este proceso y por confiar en <strong>SEDIPRO UNT.</strong>
                    </p>
                </div>
            </div>

            <button
                onClick={onExit}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                Entendido
            </button>
        </div>
    );
};

// Componente principal
export default function ResultadosFase2Modal({ isOpen, onClose }) {
    const [step, setStep] = useState(0); // 0: Input código, 1: Seleccionar área, 2: Resultado éxito, 3: Resultado no éxito
    const [codigo, setCodigo] = useState('');
    const [estudiante, setEstudiante] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [yaEligio, setYaEligio] = useState(false);
    const [areaElegida, setAreaElegida] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            resetModal();
        }
    }, [isOpen]);

    const resetModal = () => {
        setStep(0);
        setCodigo('');
        setEstudiante(null);
        setSelectedArea(null);
        setError('');
        setIsLoading(false);
        setYaEligio(false);
        setAreaElegida(null);
    };

    // Verificar código con el endpoint real
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
            const res = await fetch(`/api/sedinvita/public/verificar-fase3?codigo=${codigo}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al verificar');
            }

            if (!data.success) {
                throw new Error(data.error || 'Error al verificar');
            }

            // Guardar datos del postulante
            setEstudiante(data.postulante);

            if (data.paso === false) {
                // No pasó a Fase 3
                setStep(3);
            } else if (data.paso === true && data.faseSuperior === true) {
                // Ya está en Fase 4 o superior
                setError('Ya has completado todas las fases del proceso.');
                setStep(3);
            } else if (data.paso === true) {
                // Pasó a Fase 3
                if (data.yaEligio) {
                    // Ya eligió área
                    setYaEligio(true);
                    const areaEncontrada = AREAS_DISPONIBLES.find(a => a.id === data.area);
                    setAreaElegida(areaEncontrada || null);
                    setStep(2); // Mostrar resultado exitoso directamente
                } else {
                    // Puede elegir área
                    setYaEligio(false);
                    setStep(1);
                }
            } else {
                setError('Estado no válido');
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al verificar el código');
        } finally {
            setIsLoading(false);
        }
    };

    // Confirmar selección de área con el endpoint real
    const handleAreaConfirm = async () => {
        if (!selectedArea) {
            setError('Por favor selecciona un área');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/sedinvita/public/registrar-area', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo: codigo,
                    area: selectedArea.id
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al registrar área');
            }

            if (!data.success) {
                throw new Error(data.error || 'Error al registrar área');
            }

            // Actualizar estudiante con área seleccionada
            setEstudiante(prev => ({
                ...prev,
                areaSeleccionada: selectedArea.id
            }));

            setStep(2);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al registrar el área');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExit = () => {
        resetModal();
        onClose();
    };

    const handleBackToInput = () => {
        setStep(0);
        setCodigo('');
        setEstudiante(null);
        setSelectedArea(null);
        setError('');
        setYaEligio(false);
        setAreaElegida(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Fondo oscuro */}
            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={(e) => {
                    if (e.target === e.currentTarget && step !== 2 && step !== 3) {
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

            {/* Botón cerrar */}
            {step !== 2 && step !== 3 && (
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
                            SEDInvita 2026
                        </h2>
                        <p className="text-xs text-[#d0bcff]/50">
                            Resultados de Segunda Fase
                        </p>

                        {(step === 0 || step === 1) && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <div className={`h-1 flex-1 rounded-full transition-all ${step >= 0 ? 'bg-[#6b46c1]' : 'bg-white/10'}`}></div>
                                <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-[#6b46c1]' : 'bg-white/10'}`}></div>
                                <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-[#6b46c1]' : 'bg-white/10'}`}></div>
                            </div>
                        )}
                    </div>

                    {/* Contenido por paso */}
                    {step === 0 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <p className="text-[#d0bcff] text-sm mb-4">
                                    Ingresa tu código de matrícula UNT para conocer tu resultado:
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
                                        <span>Verificando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Verificar Resultado</span>
                                        <ChevronRight size={18} />
                                    </div>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <AreaSelector
                                selectedArea={selectedArea}
                                onSelect={setSelectedArea}
                                isLoading={isLoading}
                                estudiante={estudiante}
                            />

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                    <span className="text-red-200 text-xs">{error}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleBackToInput}
                                    className="flex-1 px-4 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/5 transition-all duration-300 active:scale-95"
                                >
                                    Atrás
                                </button>
                                <button
                                    onClick={handleAreaConfirm}
                                    disabled={isLoading || !selectedArea}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Registrando...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <span>Confirmar Área</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <ResultadoExitoso
                            estudiante={estudiante}
                            areaSeleccionada={selectedArea || areaElegida}
                            onExit={handleExit}
                        />
                    )}

                    {step === 3 && (
                        <ResultadoNoExitoso
                            estudiante={estudiante}
                            onExit={handleExit}
                        />
                    )}

                    {/* Footer */}
                    {step !== 2 && step !== 3 && (
                        <div className="text-center mt-8">
                            <p className="text-[#d0bcff]/50 text-xs">
                                © {new Date().getFullYear()} SEDIPRO UNT. Todos los derechos reservados.
                            </p>
                            <a
                                href="https://wa.me/51963159172?text=Hola,%20tengo%20un%20problema"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-red-500/50 hover:text-red-500 text-xs hover:scale-105 transition-all duration-200 mt-1.5"
                            >
                                <AlertCircle className="w-3 h-3" />
                                Reportar un problema
                            </a>
                        </div>
                    )}
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