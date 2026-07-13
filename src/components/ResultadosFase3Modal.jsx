// src/components/ResultadosFase3Modal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { Check, XCircle, AlertCircle, ChevronRight, Sparkles, Heart, Target, Calendar } from 'lucide-react';
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

// Componente de resultado - Pasó a Fase 4
const ResultadoExitosoFase4 = ({ postulante, areaNombre, onExit }) => {
    return (
        <div className="space-y-5 text-center animate-fadeIn">
            {/* Logo de éxito */}
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-500/50 flex items-center justify-center animate-pulse">
                    <Sparkles size={36} className="text-green-400" />
                </div>
            </div>

            {/* Título con código y datos del estudiante */}
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ¡Felicidades!
                </h3>

                {/* Datos del estudiante - igual que en Fase 2 */}
                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Código:</strong> {postulante?.codigoMatricula || '---'}
                    </p>
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Estudiante:</strong> {postulante?.nombres || ''} {postulante?.apellidos || ''}
                    </p>
                </div>

                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-3">
                    <p className="text-[#d0bcff] text-sm leading-relaxed">
                        Nos complace informarte que has <strong className="text-green-400">pasado satisfactoriamente la Fase 3</strong> del proceso de selección de <strong>SEDInvita 2026</strong> y que ahora formas parte de la <strong className="text-[#d0bcff]">Fase 4</strong>.
                    </p>
                </div>
            </div>

            {/* Área asignada */}
            <div className="bg-[#3b0191]/40 border border-[#6b46c1]/40 rounded-lg p-4">
                <p className="text-xs text-[#d0bcff]/60 mb-2 flex items-center justify-center gap-2">
                    <Target size={14} />
                    Tu área para la Fase 4
                </p>
                <p className="text-xl font-bold text-[#d0bcff]">
                    {areaNombre || 'Área asignada'}
                </p>
            </div>

            {/* Próximo paso */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
                <p className="text-xs text-amber-400 font-semibold justify-center flex items-center gap-2">
                    <Calendar size={14} />
                    Próximo paso
                </p>
                <p className="text-sm text-[#d0bcff] font-semibold">
                    El director de tu área se comunicará contigo
                </p>
                <p className="text-xs text-[#d0bcff]/70 leading-relaxed">
                    En los próximos días, el director de <strong>{areaNombre || 'tu área'}</strong> se pondrá en contacto contigo directamente al número de celular que brindaste durante la Fase 1, para coordinar los siguientes detalles del proceso.
                </p>
            </div>

            <button
                onClick={onExit}
                className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                Finalizar
            </button>
        </div>
    );
};

// Componente de resultado - No pasó
const ResultadoNoExitosoFase4 = ({ postulante, onExit }) => {
    return (
        <div className="space-y-6 text-center animate-fadeIn">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center animate-pulse">
                    <Heart size={36} className="text-blue-400" />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    ¡No te desanimes!
                </h3>

                {/* Datos del estudiante - igual que en Fase 2 */}
                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Código:</strong> {postulante?.codigoMatricula || '---'}
                    </p>
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Estudiante:</strong> {postulante?.nombres || ''} {postulante?.apellidos || ''}
                    </p>
                </div>

                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-[#d0bcff] leading-relaxed">
                        Lamentamos informarte que no has superado la Fase 3 del proceso de selección de <strong>SEDInvita 2026</strong>.
                    </p>
                    <p className="text-sm text-[#d0bcff] leading-relaxed">
                        Queremos que sepas que <strong className="text-amber-400">tu esfuerzo y dedicación son valiosos</strong>. Cada paso que das te acerca más a tus metas.
                    </p>
                </div>

                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-amber-200 leading-relaxed">
                        Te invitamos a seguir preparándote y a participar en futuras convocatorias. 
                        <span className="block mt-1 text-xs text-amber-200/70">
                            El camino hacia el éxito está lleno de aprendizajes que te harán más fuerte.
                        </span>
                    </p>
                </div>

                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4">
                    <p className="text-sm text-[#d0bcff]/80">
                        Gracias por formar parte de este proceso y por confiar en <strong className="text-[#d0bcff]">SEDIPRO UNT</strong>.
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
export default function ResultadosFase3Modal({ isOpen, onClose }) {
    const [step, setStep] = useState(0); // 0: Input código, 1: Resultado éxito, 2: Resultado no éxito
    const [codigo, setCodigo] = useState('');
    const [postulante, setPostulante] = useState(null);
    const [areaNombre, setAreaNombre] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            resetModal();
        }
    }, [isOpen]);

    const resetModal = () => {
        setStep(0);
        setCodigo('');
        setPostulante(null);
        setAreaNombre('');
        setError('');
        setIsLoading(false);
    };

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
            const res = await fetch(`/api/sedinvita/public/verificar-fase4?codigo=${codigo}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al verificar');
            }

            if (!data.success) {
                throw new Error(data.error || 'Error al verificar');
            }

            setPostulante(data.postulante);
            setAreaNombre(data.areaNombre || '');

            if (data.paso === true) {
                setStep(1); // Pasó a Fase 4
            } else {
                setStep(2); // No pasó
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al verificar el código');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExit = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Fondo oscuro */}
            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={(e) => {
                    if (e.target === e.currentTarget && step !== 1 && step !== 2) {
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

            {/* Botón cerrar - Solo en paso 0 */}
            {step === 0 && (
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
                    <div className="text-center mb-6">
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
                            RESULTADOS FASE 3
                        </p>
                    </div>

                    {/* Contenido por paso */}
                    {step === 0 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <p className="text-[#d0bcff] text-sm mb-4 text-center">
                                    Ingresa tu código de matrícula UNT para conocer los resultados de la Fase 3:
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
                                        <span>Ver Resultados</span>
                                        <ChevronRight size={18} />
                                    </div>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <ResultadoExitosoFase4
                            postulante={postulante}
                            areaNombre={areaNombre}
                            onExit={handleExit}
                        />
                    )}

                    {step === 2 && (
                        <ResultadoNoExitosoFase4
                            postulante={postulante}
                            onExit={handleExit}
                        />
                    )}

                    {/* Footer - Solo en paso 0 */}
                    {step === 0 && (
                        <div className="text-center mt-8">
                            <p className="text-[#d0bcff]/50 text-xs">
                                © {new Date().getFullYear()} SEDIPRO UNT. Todos los derechos reservados.
                            </p>
                            <a
                                href="https://wa.me/51963159172?text=Hola,%20tengo%20un%20problema%20con%20mis%20resultados%20de%20Fase%203"
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