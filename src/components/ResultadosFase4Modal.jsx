// src/components/ResultadosFase4Modal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import {
    Check,
    XCircle,
    AlertCircle,
    ChevronRight,
    Sparkles,
    Calendar,
    Cpu,
    Users,
    Truck,
    Megaphone,
    ClipboardList,
} from 'lucide-react';
import Image from 'next/image';

// ─────────────────────────────────────────────────────────
// PADRÓN OFICIAL DE MIEMBROS ACEPTADOS - FASE 4 (SEDInvita 2026)
// ─────────────────────────────────────────────────────────
const PADRON_FASE4 = [
    { codigo: '1024000724', nombres: 'CRISTHOFER JESUS', apellidos: 'BURGOS MONTENEGRO', area: 'GTH' },
    { codigo: '1051400226', nombres: 'ANTHONY NEYSER', apellidos: 'CASTILLO CUEVA', area: 'GTH' },
    { codigo: '1102400425', nombres: 'ROSA LUZ', apellidos: 'JAICO DURAND', area: 'GTH' },
    { codigo: '1020101425', nombres: 'LUCERO SARAI', apellidos: 'LUCERO FERNANDEZ', area: 'GTH' },
    { codigo: '1521300523', nombres: 'JUAN PABLO', apellidos: 'MIRANDA VARAS', area: 'GTH' },
    { codigo: '1024000224', nombres: 'SEBASTIAN ANTONIO', apellidos: 'TAPIA DEL AGUILA', area: 'GTH' },
    { codigo: '1510502224', nombres: 'NICOL YAQUELIN', apellidos: 'ALAYO REBAZA', area: 'LTK Y FNZ' },
    { codigo: '1010100124', nombres: 'ANGELA DANIELA', apellidos: 'CHANCAFE AZABACHE', area: 'LTK Y FNZ' },
    { codigo: '1101601125', nombres: 'ALEJANDRO RAFAEL', apellidos: 'MONZÓN ESPINOZA', area: 'LTK Y FNZ' },
    { codigo: '1092700125', nombres: 'JHUNIOR ALEXANDER', apellidos: 'PESANTES HUAYLLA', area: 'LTK Y FNZ' },
    { codigo: '1058102323', nombres: 'CHRISTINA LIZBETH', apellidos: 'ROQUE ARANDA', area: 'LTK Y FNZ' },
    { codigo: '1513700823', nombres: 'TRASY YADHIRA', apellidos: 'SOLIS MEDINA', area: 'LTK Y FNZ' },
    { codigo: '1013701224', nombres: 'YONI YERSON', apellidos: 'YGNACIO SALAZAR', area: 'LTK Y FNZ' },
    { codigo: '1512701424', nombres: 'FABRICIO JOSUE', apellidos: 'BACA PRETEL', area: 'MKT' },
    { codigo: '1093600425', nombres: 'KIARA STTEFANY', apellidos: 'CARRANZA PAICO', area: 'MKT' },
    { codigo: '1030700223', nombres: 'ANA CLAUDIA', apellidos: 'MEJIA MEDINA', area: 'MKT' },
    { codigo: '1058500624', nombres: 'ESTEFANY LUCERO', apellidos: 'MURGA LLANOS', area: 'MKT' },
    { codigo: '1013700224', nombres: 'BRYAN PAUL', apellidos: 'SÁNCHEZ GUEVARA', area: 'MKT' },
    { codigo: '1010101225', nombres: 'NICOL EVELYN', apellidos: 'VILLANUEVA BLAS', area: 'MKT' },
    { codigo: '1510100824', nombres: 'JHONATAN KEVIN', apellidos: 'QUIROZ VILCA', area: 'MKT' },
    { codigo: '1024100124', nombres: 'ALISON GERALDINE', apellidos: 'BENITES GONZÁLES', area: 'MKT' },
    { codigo: '1023700824', nombres: 'HAROLD ALESSANDRO', apellidos: 'CABALLERO MURGA', area: 'PMO' },
    { codigo: '1513700224', nombres: 'LUANA BELÉN', apellidos: 'CALDERÓN GUEVARA', area: 'PMO' },
    { codigo: '1051301624', nombres: 'YASSINI YRENE', apellidos: 'GAMBOA OTINIANO', area: 'PMO' },
    { codigo: '1010100424', nombres: 'ALEXANDRA BETZABE', apellidos: 'HUAMÁN QUISPE', area: 'PMO' },
    { codigo: '1020100526', nombres: 'LUCIANA NICOLE', apellidos: 'OBANDO DEZA', area: 'PMO' },
    { codigo: '1453700224', nombres: 'CARLOS MANUEL ENRIQUE', apellidos: 'REYES RUIZ', area: 'PMO' },
    { codigo: '1102701025', nombres: 'CRISTHOFER LEONARDO', apellidos: 'FIGUEROA CAMPOS', area: 'TI' },
    { codigo: '1102701825', nombres: 'RICKY GILBERT', apellidos: 'JULCA DAVILA', area: 'TI' },
    { codigo: '1451000124', nombres: 'DAVID ALEJANDRO', apellidos: 'LLONTOP LOBATON', area: 'TI' },
    { codigo: '1052701922', nombres: 'GABRIEL VALENTINO', apellidos: 'MATTUS ORBEGOSO', area: 'TI' },
    { codigo: '1103300125', nombres: 'DIEGO ANDERZON', apellidos: 'PAREDES GIL', area: 'TI' },
    { codigo: '1103300225', nombres: 'DIEGO STEFANO', apellidos: 'REYMUNDO VILCA', area: 'TI' },
    { codigo: '1022700525', nombres: 'JEFFRAN ALBERTO', apellidos: 'SILVESTRE FERRER', area: 'TI' },
    { codigo: '1023300523', nombres: 'RICARDO BERNARDO', apellidos: 'VELÁSQUEZ GARCÍA', area: 'TI' },
    { codigo: '1010101625', nombres: 'JEFFERSON MOISES ', apellidos: 'SALAZAR LEON', area: 'PMO' },
];

// ─────────────────────────────────────────────────────────
// THEMING POR ÁREA (clases estáticas para que Tailwind las detecte en build)
// TI: naranja | PMO: amarillo | GTH: verde | LTK Y FNZ: celeste | MKT: rojo
// ─────────────────────────────────────────────────────────
const AREA_CONFIG = {
    TI: {
        nombreCompleto: 'Tecnologías de la Información',
        Icono: Cpu,
        iconWrap: 'bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-500/50',
        iconColor: 'text-orange-400',
        tituloGradient: 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent',
        badgeBg: 'bg-orange-500/15',
        badgeBorder: 'border-orange-500/40',
        badgeText: 'text-orange-300',
    },
    PMO: {
        nombreCompleto: 'Project Management Office',
        Icono: ClipboardList,
        iconWrap: 'bg-gradient-to-br from-yellow-500/30 to-amber-400/30 border-2 border-yellow-500/50',
        iconColor: 'text-yellow-400',
        tituloGradient: 'bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent',
        badgeBg: 'bg-yellow-500/15',
        badgeBorder: 'border-yellow-500/40',
        badgeText: 'text-yellow-300',
    },
    GTH: {
        nombreCompleto: 'Gestión del Talento Humano',
        Icono: Users,
        iconWrap: 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-500/50',
        iconColor: 'text-green-400',
        tituloGradient: 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent',
        badgeBg: 'bg-green-500/15',
        badgeBorder: 'border-green-500/40',
        badgeText: 'text-green-300',
    },
    'LTK Y FNZ': {
        nombreCompleto: 'Logística y Finanzas',
        Icono: Truck,
        iconWrap: 'bg-gradient-to-br from-sky-500/30 to-cyan-500/30 border-2 border-sky-500/50',
        iconColor: 'text-sky-400',
        tituloGradient: 'bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent',
        badgeBg: 'bg-sky-500/15',
        badgeBorder: 'border-sky-500/40',
        badgeText: 'text-sky-300',
    },
    MKT: {
        nombreCompleto: 'Marketing',
        Icono: Megaphone,
        iconWrap: 'bg-gradient-to-br from-red-500/30 to-rose-500/30 border-2 border-red-500/50',
        iconColor: 'text-red-400',
        tituloGradient: 'bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent',
        badgeBg: 'bg-red-500/15',
        badgeBorder: 'border-red-500/40',
        badgeText: 'text-red-300',
    },
};

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

// Componente de resultado - Miembro aceptado en SEDIPRO UNT
const ResultadoAceptado = ({ postulante, onExit }) => {
    const config = AREA_CONFIG[postulante?.area] || AREA_CONFIG.TI;
    const { Icono } = config;

    return (
        <div className="space-y-5 text-center animate-fadeIn">
            {/* Logo de éxito, temático al área */}
            <div className="flex justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center animate-pulse ${config.iconWrap}`}>
                    <Sparkles size={36} className={config.iconColor} />
                </div>
            </div>

            {/* Título */}
            <div className="space-y-4">
                <h3 className={`text-2xl font-bold text-center ${config.tituloGradient}`}>
                    ¡Felicidades!
                </h3>

                {/* Datos del estudiante */}
                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Código:</strong> {postulante?.codigo || '---'}
                    </p>
                    <p className="text-sm font-mono text-[#d0bcff] break-all">
                        <strong>Estudiante:</strong> {postulante?.nombres || ''} {postulante?.apellidos || ''}
                    </p>
                </div>

                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4 space-y-3">
                    <p className="text-[#d0bcff] text-sm leading-relaxed">
                        Nos complace darte la bienvenida oficial a <strong>SEDIPRO UNT</strong>. Has sido <strong className="text-green-400">aceptado(a) como miembro</strong> de nuestra sección tras culminar satisfactoriamente el proceso de selección de <strong>SEDInvita 2026</strong>.
                    </p>
                </div>
            </div>

            {/* Área asignada, temática */}
            <div className={`rounded-lg p-4 border ${config.badgeBg} ${config.badgeBorder}`}>
                <p className="text-xs text-[#d0bcff]/60 mb-2 flex items-center justify-center gap-2">
                    {/* <Icono size={14} className={config.iconColor} /> */}
                    Tu área en SEDIPRO UNT
                </p>
                <p className={`text-xl font-bold ${config.badgeText}`}>
                    {config.nombreCompleto}
                </p>
                <p className="text-xs text-[#d0bcff]/50 mt-1 uppercase tracking-wide">
                    {postulante?.area}
                </p>
            </div>

            {/* Próximo paso */}
            {/* <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
                <p className="text-xs text-amber-400 font-semibold justify-center flex items-center gap-2">
                    <Calendar size={14} />
                    Próximo paso
                </p>
                <p className="text-sm text-[#d0bcff] font-semibold">
                    Nos pondremos en contacto contigo
                </p>
                <p className="text-xs text-[#d0bcff]/70 leading-relaxed">
                    En los próximos días, un representante de <strong>{config.nombreCompleto}</strong> se estará comunicando contigo al número de celular que brindaste durante el proceso de postulación, para coordinar los siguientes pasos de tu incorporación.
                </p>
            </div> */}

            <button
                onClick={onExit}
                className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                Finalizar
            </button>
        </div>
    );
};

// Componente de resultado - Código no encontrado en el padrón
const ResultadoNoEncontrado = ({ onReintentar }) => {
    return (
        <div className="space-y-6 text-center animate-fadeIn">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                    <XCircle size={36} className="text-red-400" />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#d0bcff]">
                    Código no encontrado en el padrón
                </h3>
                <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-lg p-4">
                    <p className="text-sm text-[#d0bcff]/80 leading-relaxed">
                        Verifica que el código de matrícula ingresado sea correcto e inténtalo nuevamente.
                    </p>
                </div>
            </div>

            <button
                onClick={onReintentar}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                Intentar de nuevo
            </button>
        </div>
    );
};

// Componente principal
export default function ResultadosFase4Modal({ isOpen, onClose }) {
    const [step, setStep] = useState(0); // 0: Input código, 1: Aceptado, 2: No encontrado
    const [codigo, setCodigo] = useState('');
    const [postulante, setPostulante] = useState(null);
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
        setError('');
        setIsLoading(false);
    };

    const handleCodigoSubmit = () => {
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

        // Búsqueda local en el padrón (sin consumo de API)
        setTimeout(() => {
            const encontrado = PADRON_FASE4.find((p) => p.codigo === codigo);

            if (encontrado) {
                setPostulante(encontrado);
                setStep(1);
            } else {
                setStep(2);
            }

            setIsLoading(false);
        }, 400);
    };

    const handleReintentar = () => {
        setStep(0);
        setCodigo('');
        setError('');
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
                    if (e.target === e.currentTarget && step === 0) {
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
            <div
                className="relative z-50 w-full max-w-lg mx-4 my-auto rounded-2xl transition-all duration-500 overflow-hidden animate-fadeInUp"
                style={{
                    background: 'linear-gradient(135deg, rgba(11, 19, 38, 0.95), rgba(59, 1, 145, 0.85))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(107, 70, 193, 0.3)',
                    boxShadow: '0 25px 50px -12px rgba(59, 1, 145, 0.5)',
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
                            RESULTADOS FASE 4
                        </p>
                    </div>

                    {/* Contenido por paso */}
                    {step === 0 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <p className="text-[#d0bcff] text-sm mb-4 text-center">
                                    Ingresa tu código de matrícula UNT para conocer los resultados de la Fase 4:
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
                        <ResultadoAceptado postulante={postulante} onExit={handleExit} />
                    )}

                    {step === 2 && (
                        <ResultadoNoEncontrado onReintentar={handleReintentar} />
                    )}

                    {/* Footer - Solo en paso 0 */}
                    {step === 0 && (
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