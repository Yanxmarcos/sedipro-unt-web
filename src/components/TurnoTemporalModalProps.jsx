'use client';
import React, { useState } from 'react';
import { XCircle, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';

const TurnoTemporalModal = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Fondo oscuro - IMPORTANTE: Permitir clicks solo en el fondo */}
            <div 
                className="fixed inset-0 bg-black/40 z-40" 
                onClick={handleClose}
                role="button"
                tabIndex={0}
            />
            
            {/* Fondo con gradiente */}
            <div className="fixed inset-0 z-30 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b1326]/80 via-[#3b0191]/40 to-[#6b46c1]/50 backdrop-blur-[2px]"></div>
            </div>

            {/* Botón cerrar */}
            <button
                onClick={handleClose}
                className="fixed top-4 right-4 z-50 p-2 rounded-full bg-[#3b0191]/60 backdrop-blur-md text-white hover:bg-[#6b46c1]/80 transition-all duration-200 border border-white/20 active:scale-95"
                aria-label="Cerrar modal"
            >
                <XCircle size={28} />
            </button>

            {/* Modal */}
            <div className={`relative z-50 w-full max-w-lg mx-4 my-auto rounded-2xl transition-all duration-500 overflow-hidden animate-fadeInUp`}
                style={{
                    background: 'linear-gradient(135deg, rgba(11, 19, 38, 0.95), rgba(59, 1, 145, 0.85))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(107, 70, 193, 0.3)',
                    boxShadow: '0 25px 50px -12px rgba(59, 1, 145, 0.5)'
                }}>

                <div className="p-6 md:p-8">
                    {/* Header con logo y título */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 relative">
                            <Image
                                alt="SEDInvita 2026 Logo"
                                width={80}
                                height={80}
                                className="object-contain drop-shadow-lg"
                                src="/img/sedinvita-logo.webp"
                                priority
                            />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white bg-gradient-to-r from-[#d0bcff] to-white bg-clip-text text-transparent">
                            SEDInvita 2026
                        </h2>

                        {/* Marco de 3 rayas para estado */}
                        {/* Indicador de paso */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <div className={`h-1 flex-1 rounded-full transition-all bg-[#6b46c1]`}></div>
                            <div className={`h-1 flex-1 rounded-full transition-all bg-white/10`}></div>
                            <div className={`h-1 flex-1 rounded-full transition-all bg-white/10`}></div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="space-y-6 animate-fadeIn">
                        

                        {/* Mensaje principal */}
                        <div className="text-center space-y-4">
                            <h3 className="text-xl font-bold text-white">
                                Selección de Turnos
                            </h3>

                            <div className="bg-[#3b0191]/30 border border-[#6b46c1]/30 rounded-xl p-6 space-y-4">
                                {/* <div className="flex items-center justify-center gap-2 text-[#d0bcff]">
                                    <Calendar size={20} className="text-amber-400/80" />
                                    <span className="text-xs text-amber-400/80 font-medium">Próximamente</span>
                                </div> */}

                                <p className="text-[#d0bcff]/80 text-sm leading-relaxed">
                                    La selección de turnos ha finalizado.
                                    
                                </p>
                            </div>
                        </div>

                        {/* Botón de acción */}
                        <button
                            onClick={handleClose}
                            className="w-full px-6 py-3 bg-gradient-to-r from-[#3b0191] to-[#6b46c1] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                        >
                            Entendido
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-[#d0bcff]/40 text-xs text-center mt-8">
                        © 2026 SEDIPRO UNT. Todos los derechos reservados.
                    </p>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
        </div>
    );
};

export default TurnoTemporalModal;