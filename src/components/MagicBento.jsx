import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { createPortal } from 'react-dom';

const DEFAULT_PARTICLE_COUNT = 20;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

// Utilidad para detectar dispositivos táctiles
const isTouchDevice = () => {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
};

const cardData = [
    {
        color: '#2B8C000D',
        title: '',
        description: 'Gestión del Talento Humano',
        label: 'GTH',
        backgroundImage: "/img/areas/logo-gth.webp",
        modalImage: '/img/areas/gth.webp',
        modalTitle: 'Tecnologías de la Información',
        modalDescription: 'Información detallada sobre las tecnologías de la información y su impacto en la industria moderna.'
    },
    {
        color: '#FFF7000D',
        title: '',
        description: 'Project Management Office',
        label: 'PMO',
        backgroundImage: "/img/areas/logo-pmo.webp",
        modalImage: '/img/areas/pmo.webp',
        modalTitle: 'Dashboard Centralizado',
        modalDescription: 'Visualización centralizada de datos para una mejor toma de decisiones empresariales.'
    },
    {
        color: '#FF00000D',
        title: '',
        description: 'Marketing',
        label: 'MKT',
        backgroundImage: "/img/areas/logo-mkt.webp",
        modalImage: '/img/areas/mkt.webp',
        modalTitle: 'Colaboración en Equipo',
        modalDescription: 'Herramientas y metodologías para trabajar en equipo de manera efectiva y sincronizada.'
    },
    {
        color: '#00FBFF0D',
        title: '',
        description: 'Logística y Finanzas',
        label: 'LTK & FNZ',
        backgroundImage: "/img/areas/logo-ltk.webp",
        modalImage: '/img/areas/ltk.webp',
        modalTitle: 'Automatización de Procesos',
        modalDescription: 'Optimización de flujos de trabajo mediante automatización inteligente y eficiente.'
    },
    {
        color: '#FF6F000D',
        title: '',
        description: 'Tecnologías de la Información',
        label: 'TI',
        backgroundImage: "/img/areas/logo-ti.webp",
        modalImage: '/img/areas/ti.webp',
        modalTitle: '',
        modalDescription: ''
    }
];

// Componente Modal Mejorado con soporte táctil
const Modal = ({ isOpen, onClose, image, glowColor }) => {
    const overlayRef = useRef(null);
    const contentRef = useRef(null);
    const startYRef = useRef(0);
    const startXRef = useRef(0);
    const scrollPositionRef = useRef(0);
    
    useEffect(() => {
        if (isOpen) {
            scrollPositionRef.current = window.scrollY;
            document.body.style.overflow = 'hidden';
            // document.body.style.touchAction = 'none'; // Previene scroll táctil
            document.body.style.height = '100vh'; // Mantener altura
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.style.height = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollPositionRef.current);
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.style.height = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    // Manejar gestos táctiles para cerrar
    useEffect(() => {
        if (!isOpen || !overlayRef.current) return;
        
        const handleTouchStart = (e) => {
            startYRef.current = e.touches[0].clientY;
            startXRef.current = e.touches[0].clientX;
        };
        
        const handleTouchEnd = (e) => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const diffY = endY - startYRef.current;
            const diffX = endX - startXRef.current;
            
            // Swipe down o up para cerrar
            if (Math.abs(diffY) > 80 && Math.abs(diffY) > Math.abs(diffX)) {
                onClose();
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        const overlay = overlayRef.current;
        overlay.addEventListener('touchstart', handleTouchStart, { passive: true });
        overlay.addEventListener('touchend', handleTouchEnd, { passive: true });
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            overlay.removeEventListener('touchstart', handleTouchStart);
            overlay.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={overlayRef}
            className="modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(11,19,38,0.8) 0%, rgba(59,1,145,0.4) 50%, rgba(107,70,193,0.5) 100%)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '16px',
                WebkitOverflowScrolling: 'touch',
                animation: 'fadeIn 0.3s ease',
                touchAction: 'manipulation',
            }}
        >
            <div
                ref={contentRef}
                className="modal-content"
                onClick={e => e.stopPropagation()}
                style={{
                    backgroundColor: '#1a1a2e',
                    borderRadius: '20px',
                    maxWidth: '95vw',
                    maxHeight: '90vh',
                    width: 'auto',
                    height: 'auto',
                    position: 'relative',
                    animation: 'scaleIn 0.3s ease',
                    boxShadow: `0 20px 60px rgba(${glowColor}, 0.3), 0 0 80px rgba(${glowColor}, 0.1)`,
                    border: `2px solid rgba(${glowColor}, 0.3)`,
                    overflow: 'hidden',
                    touchAction: 'manipulation',
                    WebkitTransform: 'translateZ(0)',
                    transform: 'translateZ(0)',
                }}
            >
                {/* Indicador de arrastre para móvil */}
                <div 
                    style={{
                        display: 'none', // Se mostrará solo en móvil vía media query
                        width: '40px',
                        height: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '2px',
                        margin: '2px auto 0',
                    }}
                    className="modal-drag-indicator"
                />
                
                {/* Botón cerrar mejorado para táctil */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    aria-label="Cerrar modal"
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        touchAction: 'manipulation',
                        padding: '10px',
                        WebkitTapHighlightColor: 'transparent',
                        transition: 'all 0.3s ease',
                    }}
                    onTouchStart={e => {
                        e.currentTarget.style.backgroundColor = `rgba(${glowColor}, 0.4)`;
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onTouchEnd={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    ✕
                </button>

                {/* Imagen con mejor manejo táctil */}
                {image && (
                    <img
                        src={image}
                        alt="Modal"
                        loading="lazy"
                        style={{
                            display: 'block',
                            maxWidth: '100%',
                            maxHeight: '80vh',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: '20px',
                            touchAction: 'manipulation',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                            WebkitTransform: 'translateZ(0)',
                            pointerEvents: 'none',
                        }}
                        draggable={false}
                    />
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .modal-overlay {
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                }
                
                @media (max-width: 768px) {
                    .modal-overlay {
                        padding: 12px;
                        align-items: flex-end;
                    }
                    .modal-content {
                        max-width: 100vw;
                        max-height: 85vh;
                        border-radius: 20px 20px 0 0;
                        margin-bottom: 0;
                    }
                    .modal-drag-indicator {
                        display: block !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .modal-overlay {
                        padding: 8px;
                    }
                    .modal-content {
                        max-height: 80vh;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
};

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
    return el;
};

const calculateSpotlightValues = radius => ({
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
    const rect = card.getBoundingClientRect();
    const relativeX = ((mouseX - rect.left) / rect.width) * 100;
    const relativeY = ((mouseY - rect.top) / rect.height) * 100;

    card.style.setProperty('--glow-x', `${relativeX}%`);
    card.style.setProperty('--glow-y', `${relativeY}%`);
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', `${radius}px`);
};

const ParticleCard = ({
    children,
    className = '',
    disableAnimations = false,
    style,
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
    enableTilt = true,
    clickEffect = false,
    enableMagnetism = false,
    onCardClick = null
}) => {
    const cardRef = useRef(null);
    const particlesRef = useRef([]);
    const timeoutsRef = useRef([]);
    const isHoveredRef = useRef(false);
    const memoizedParticles = useRef([]);
    const particlesInitialized = useRef(false);
    const magnetismAnimationRef = useRef(null);
    const isTouchDeviceRef = useRef(false);
    const touchTimeoutRef = useRef(null);

    useEffect(() => {
        isTouchDeviceRef.current = isTouchDevice();
    }, []);

    const initializeParticles = useCallback(() => {
        if (particlesInitialized.current || !cardRef.current) return;
        const { width, height } = cardRef.current.getBoundingClientRect();
        memoizedParticles.current = Array.from({ length: particleCount }, () =>
            createParticleElement(Math.random() * width, Math.random() * height, glowColor)
        );
        particlesInitialized.current = true;
    }, [particleCount, glowColor]);

    const clearAllParticles = useCallback(() => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        if (touchTimeoutRef.current) {
            clearTimeout(touchTimeoutRef.current);
        }
        magnetismAnimationRef.current?.kill();
        particlesRef.current.forEach(particle => {
            gsap.to(particle, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () => particle.parentNode?.removeChild(particle)
            });
        });
        particlesRef.current = [];
    }, []);

    const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
        const timeoutId = setTimeout(() => {
            if (!isHoveredRef.current || !cardRef.current) return;
            const clone = particle.cloneNode(true);
            cardRef.current.appendChild(clone);
            particlesRef.current.push(clone);
            
            // Animación más duradera y visible
            gsap.fromTo(clone, 
                { scale: 0, opacity: 0 }, 
                { 
                    scale: 1.5,  // Aumentado de 1 a 1.5
                    opacity: 1, 
                    duration: 0.5, // Aumentado de 0.3 a 0.5
                    ease: 'back.out(1.7)' 
                }
            );
            
            gsap.to(clone, {
                x: (Math.random() - 0.5) * 150, // Mayor rango de movimiento
                y: (Math.random() - 0.5) * 150,
                rotation: Math.random() * 360,
                duration: 3 + Math.random() * 2, // Más lento
                ease: 'none',
                repeat: -1,
                yoyo: true
            });
            
            gsap.to(clone, {
                opacity: 0.6, // Más visible (era 0.3)
                duration: 2, // Más duradero
                ease: 'power2.inOut',
                repeat: -1,
                yoyo: true
            });
        }, index * 50); // Menos tiempo entre partículas
        timeoutsRef.current.push(timeoutId);
    });
}, [initializeParticles]);

    useEffect(() => {
        if (!cardRef.current) return;
        const element = cardRef.current;

        // Click SIEMPRE se registra, independiente de disableAnimations
        const handleClick = e => {
            if (onCardClick) onCardClick(e);
            if (!clickEffect || disableAnimations) return;
            // ...ripple effect
        };
        element.addEventListener('click', handleClick);

        return () => {
            element.removeEventListener('click', handleClick);
        };
    }, [onCardClick, clickEffect, disableAnimations, glowColor]);

    useEffect(() => {
        if (disableAnimations || !cardRef.current) return;
        const element = cardRef.current;
        const touchDevice = isTouchDeviceRef.current;

        // Eventos de mouse para escritorio
        const handleMouseEnter = () => {
            if (touchDevice) return;
            isHoveredRef.current = true;
            animateParticles();
            if (enableTilt) {
                gsap.to(element, {
                    rotateX: 5,
                    rotateY: 5,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            }
        };

        const handleMouseLeave = () => {
            if (touchDevice) return;
            isHoveredRef.current = false;
            clearAllParticles();
            if (enableTilt) {
                gsap.to(element, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
            if (enableMagnetism) {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        const handleMouseMove = e => {
            if (touchDevice || (!enableTilt && !enableMagnetism)) return;
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            if (enableTilt) {
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                gsap.to(element, {
                    rotateX,
                    rotateY,
                    duration: 0.1,
                    ease: 'power2.out',
                });
            }

            if (enableMagnetism) {
                const magnetX = (x - centerX) * 0.05;
                const magnetY = (y - centerY) * 0.05;
                magnetismAnimationRef.current = gsap.to(element, {
                    x: magnetX,
                    y: magnetY,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        // Eventos táctiles para móvil
        const handleTouchStart = (e) => {
            if (!touchDevice) return;
            isHoveredRef.current = true;
            animateParticles();
            
            if (enableTilt) {
                gsap.to(element, {
                    rotateX: 2,
                    rotateY: 2,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            }
        };

        const handleTouchMove = (e) => {
            if (!touchDevice || (!enableTilt && !enableMagnetism)) return;
            
            const touch = e.touches[0];
            const rect = element.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            if (enableTilt) {
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;
                gsap.to(element, {
                    rotateX,
                    rotateY,
                    duration: 0.2,
                    ease: 'power2.out',
                });
            }

            if (enableMagnetism) {
                const magnetX = (x - centerX) * 0.03;
                const magnetY = (y - centerY) * 0.03;
                magnetismAnimationRef.current = gsap.to(element, {
                    x: magnetX,
                    y: magnetY,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        const handleTouchEnd = () => {
            if (!touchDevice) return;
            
            // Pequeño retraso para mantener las partículas visibles
            touchTimeoutRef.current = setTimeout(() => {
                isHoveredRef.current = false;
                clearAllParticles();
            }, 2000);
            
            if (enableTilt) {
                gsap.to(element, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)',
                });
            }
            if (enableMagnetism) {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)',
                });
            }
        };

        const handleClick = e => {
            if (onCardClick) {
                onCardClick(e);
            }
            if (!clickEffect) return;
            
            const rect = element.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || rect.left + rect.width / 2;
            const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || rect.top + rect.height / 2;
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            
            const size = Math.max(rect.width, rect.height) * 1.5;
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                left: ${x - size / 2}px;
                top: ${y - size / 2}px;
                pointer-events: none;
                z-index: 1000;
                touch-action: none;
            `;
            
            element.appendChild(ripple);
            gsap.fromTo(
                ripple,
                { scale: 0, opacity: 1 },
                {
                    scale: 1,
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    onComplete: () => ripple.remove()
                }
            );
        };

        // Registrar eventos según dispositivo
        if (touchDevice) {
            element.addEventListener('touchstart', handleTouchStart, { passive: true });
            element.addEventListener('touchmove', handleTouchMove, { passive: true });
            element.addEventListener('touchend', handleTouchEnd);
            element.addEventListener('touchcancel', handleTouchEnd);
        } else {
            element.addEventListener('mouseenter', handleMouseEnter);
            element.addEventListener('mouseleave', handleMouseLeave);
            element.addEventListener('mousemove', handleMouseMove);
        }
        
        element.addEventListener('click', handleClick);

        return () => {
            isHoveredRef.current = false;
            if (touchDevice) {
                element.removeEventListener('touchstart', handleTouchStart);
                element.removeEventListener('touchmove', handleTouchMove);
                element.removeEventListener('touchend', handleTouchEnd);
                element.removeEventListener('touchcancel', handleTouchEnd);
            } else {
                element.removeEventListener('mouseenter', handleMouseEnter);
                element.removeEventListener('mouseleave', handleMouseLeave);
                element.removeEventListener('mousemove', handleMouseMove);
            }
            element.removeEventListener('click', handleClick);
            clearAllParticles();
        };
    }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor, onCardClick]);

    return (
        <div
            ref={cardRef}
            className={`${className} relative overflow-hidden`}
            style={{ 
                ...style, 
                position: 'relative', 
                overflow: 'hidden', 
                cursor: 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTransform: 'translateZ(0)',
            }}
        >
            {children}
        </div>
    );
};

const GlobalSpotlight = ({
    gridRef,
    disableAnimations = false,
    enabled = true,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR
}) => {
    const spotlightRef = useRef(null);
    const isInsideSection = useRef(false);
    const touchDevice = useRef(false);

    useEffect(() => {
        touchDevice.current = isTouchDevice();
    }, []);

    useEffect(() => {
        if (disableAnimations || !gridRef?.current || !enabled) return;
        if (touchDevice.current) return; // Desactivar en móviles

        const spotlight = document.createElement('div');
        spotlight.className = 'global-spotlight';
        
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        const spotlightSize = isMobile ? '400px' : '800px';
        
        spotlight.style.cssText = `
            position: fixed;
            width: ${spotlightSize};
            height: ${spotlightSize};
            border-radius: 50%;
            pointer-events: none;
            background: radial-gradient(circle,
                rgba(${glowColor}, 0.15) 0%,
                rgba(${glowColor}, 0.08) 15%,
                rgba(${glowColor}, 0.04) 25%,
                rgba(${glowColor}, 0.02) 40%,
                rgba(${glowColor}, 0.01) 65%,
                transparent 70%
            );
            z-index: 200;
            opacity: 0;
            transform: translate(-50%, -50%);
            mix-blend-mode: screen;
            display: ${isMobile ? 'none' : 'block'};
        `;
        
        document.body.appendChild(spotlight);
        spotlightRef.current = spotlight;

        const handleMouseMove = e => {
            if (!spotlightRef.current || !gridRef.current) return;

            const section = gridRef.current.closest('.bento-section');
            const rect = section?.getBoundingClientRect();
            const mouseInside =
                rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

            isInsideSection.current = mouseInside || false;
            const cards = gridRef.current.querySelectorAll('.card');

            if (!mouseInside) {
                gsap.to(spotlightRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                cards.forEach(card => {
                    card.style.setProperty('--glow-intensity', '0');
                });
                return;
            }

            const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
            let minDistance = Infinity;

            cards.forEach(card => {
                const cardElement = card;
                const cardRect = cardElement.getBoundingClientRect();
                const centerX = cardRect.left + cardRect.width / 2;
                const centerY = cardRect.top + cardRect.height / 2;
                const distance =
                    Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
                const effectiveDistance = Math.max(0, distance);

                minDistance = Math.min(minDistance, effectiveDistance);

                let glowIntensity = 0;
                if (effectiveDistance <= proximity) {
                    glowIntensity = 1;
                } else if (effectiveDistance <= fadeDistance) {
                    glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
                }

                updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
            });

            gsap.to(spotlightRef.current, {
                left: e.clientX,
                top: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });

            const targetOpacity =
                minDistance <= proximity
                    ? 0.8
                    : minDistance <= fadeDistance
                        ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
                        : 0;

            gsap.to(spotlightRef.current, {
                opacity: targetOpacity,
                duration: targetOpacity > 0 ? 0.2 : 0.5,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            isInsideSection.current = false;
            gridRef.current?.querySelectorAll('.card').forEach(card => {
                card.style.setProperty('--glow-intensity', '0');
            });
            if (spotlightRef.current) {
                gsap.to(spotlightRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
        };
    }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

    return null;
};

const BentoCardGrid = ({ children, gridRef }) => (
    <div
        className="bento-section w-full mx-auto grid gap-2 p-0 select-none relative"
        style={{ fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.5rem)' }}
        ref={gridRef}
    >
        {children}
    </div>
);

const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

const MagicBento = ({
    textAutoHide = true,
    enableStars = true,
    enableSpotlight = true,
    enableBorderGlow = true,
    disableAnimations = false,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    particleCount = DEFAULT_PARTICLE_COUNT,
    enableTilt = false,
    glowColor = DEFAULT_GLOW_COLOR,
    clickEffect = true,
    enableMagnetism = true,
    showBackgroundImages = true,
    imageOpacity = 0.3
}) => {
    const gridRef = useRef(null);
    const isMobile = useMobileDetection();
    const shouldDisableAnimations = disableAnimations || isMobile;
    const [modalData, setModalData] = useState(null);

    // Ajustar configuraciones para móvil
    const mobileAdjustedProps = {
        particleCount: isMobile ? Math.floor(particleCount / 2) : particleCount,
        enableTilt: isMobile ? false : enableTilt,
        enableMagnetism: isMobile ? false : enableMagnetism,
        clickEffect: isMobile ? false : clickEffect,
    };

    const openModal = (card) => {
        setModalData({
            image: card.modalImage || card.backgroundImage,
            title: card.modalTitle || card.title,
            description: card.modalDescription || card.description
        });
    };

    const closeModal = () => {
        setModalData(null);
    };

    return (
        <>
            <style>
                {`
                    .bento-section {
                        --glow-x: 50%;
                        --glow-y: 50%;
                        --glow-intensity: 0;
                        --glow-radius: 200px;
                        --glow-color: ${glowColor};
                        --border-color: #2F293A;
                        --background-dark: #120F17;
                        --white: hsl(0, 0%, 100%);
                        --purple-primary: rgba(132, 0, 255, 1);
                        --purple-glow: rgba(132, 0, 255, 0.2);
                        --purple-border: rgba(132, 0, 255, 0.8);
                    }

                    .card-background-image {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        opacity: ${imageOpacity};
                        border-radius: 28px;
                        z-index: 0;
                        pointer-events: none;
                    }

                    /* ESTILOS ESPECÍFICOS PARA LA ÚLTIMA TARJETA */
                    @media (min-width: 768px) {
                        .card-responsive .card:last-child .card-background-image {
                            object-fit: contain !important;
                            object-position: center !important;
                            width: 100% !important;
                            height: 100% !important;
                            opacity: 0.9 !important;
                            border-radius: 16px !important;
                            transform: scale(1.75) !important;
                        }
                    }

                    .card-content-overlay {
                        position: relative;
                        z-index: 1;
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        justify-content: space-between;
                    }

                    .card-responsive {
                        grid-template-columns: 1fr;
                        width: 100%;
                        margin: 0 auto;
                        padding: 0;
                        gap: 1.25rem;
                    }

                    .card-responsive .card {
                        width: 100%;
                        min-height: 180px;
                        border-radius: 28px !important;
                        overflow: hidden;
                        position: relative;
                        transition: all 0.3s ease;
                    }

                    .card-responsive .card:active {
                        transform: scale(0.98);
                    }

                    @media (min-width: 768px) {
                        .card-responsive {
                            width: 100%;
                            grid-template-columns: repeat(2, 1fr);
                            grid-template-rows: repeat(3, minmax(160px, 1fr)) minmax(165px, auto);
                            gap: 0.75rem;
                        }

                        .card-responsive .card {
                            min-height: 0;
                            width: auto;
                        }

                        .card-responsive .card:nth-child(1) {
                            grid-column: 1;
                            grid-row: 1;
                        }

                        .card-responsive .card:nth-child(2) {
                            grid-column: 1;
                            grid-row: 2 / span 2;
                        }

                        .card-responsive .card:nth-child(3) {
                            grid-column: 2;
                            grid-row: 1 / span 2;
                        }

                        .card-responsive .card:nth-child(4) {
                            grid-column: 2;
                            grid-row: 3;
                        }

                        .card-responsive .card:nth-child(5) {
                            grid-column: 1 / -1;
                            grid-row: 4;
                        }
                    }

                    .card--border-glow::after {
                        content: '';
                        position: absolute;
                        inset: 0;
                        padding: 6px;
                        background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                            rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
                            rgba(${glowColor}, calc(var(--glow-intensity) * 0.4)) 30%,
                            transparent 60%);
                        border-radius: 28px !important;
                        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                        -webkit-mask-composite: xor;
                        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                        mask-composite: exclude;
                        pointer-events: none;
                        opacity: 1;
                        transition: opacity 0.3s ease;
                        z-index: 2;
                    }

                    .card--border-glow:hover::after {
                        opacity: 1;
                    }

                    .card--border-glow:hover {
                        box-shadow: 0 4px 20px rgba(46, 24, 78, 0.4), 0 0 30px rgba(${glowColor}, 0.2);
                    }

                    .particle {
                        z-index: 3 !important;
                    }

                    .particle::before {
                        content: '';
                        position: absolute;
                        top: -2px;
                        left: -2px;
                        right: -2px;
                        bottom: -2px;
                        background: rgba(${glowColor}, 0.2);
                        border-radius: 50%;
                        z-index: -1;
                    }

                    .particle-container:hover {
                        box-shadow: 0 4px 20px rgba(46, 24, 78, 0.2), 0 0 30px rgba(${glowColor}, 0.2);
                    }

                    .text-clamp-1 {
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 1;
                        line-clamp: 1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .text-clamp-2 {
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;
                        line-clamp: 2;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .card-clickable {
                        cursor: pointer;
                    }

                    /* ESTILOS MEJORADOS PARA MÓVIL */
                    @media (max-width: 768px) {
                        .card-responsive .card {
                            min-height: 150px;
                            border-radius: 20px !important;
                        }
                        
                        .card-background-image {
                            opacity: 0.25;
                        }
                        
                        .card--border-glow::after {
                            opacity: 0.3;
                        }
                        
                        .card__title {
                            font-size: 0.95rem !important;
                        }
                        
                        .card__description {
                            font-size: 0.8rem !important;
                            line-height: 1.4 !important;
                        }
                        
                        .card__label {
                            font-size: 0.85rem !important;
                        }
                        
                        .card-responsive .card:last-child .card-background-image {
                            transform: scale(1.6) !important;
                            object-fit: contain !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .card-responsive {
                            width: 100%;
                            gap: 1.25rem;
                        }
                        
                        .card-responsive .card {
                            min-height: 130px;
                            padding: 0.75rem;
                        }
                        
                        .card-content-overlay {
                            padding: 0.5rem;
                        }
                    }
                `}
            </style>

            {/* Modal */}
            <Modal
                isOpen={!!modalData}
                onClose={closeModal}
                image={modalData?.image}
                title={modalData?.title}
                description={modalData?.description}
                glowColor={glowColor}
            />

            {enableSpotlight && (
                <GlobalSpotlight
                    gridRef={gridRef}
                    disableAnimations={shouldDisableAnimations}
                    enabled={enableSpotlight}
                    spotlightRadius={spotlightRadius}
                    glowColor={glowColor}
                />
            )}

            <BentoCardGrid gridRef={gridRef}>
                <div className="card-responsive grid gap-2">
                    {cardData.map((card, index) => {
                        const baseClassName = `card flex flex-col justify-between relative w-full max-w-full p-5 rounded-[28px] border border-solid font-light overflow-hidden transition-colors duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card-clickable ${enableBorderGlow ? 'card--border-glow' : ''
                            }`;

                        const cardStyle = {
                            backgroundColor: card.color || 'var(--background-dark)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--white)',
                            '--glow-x': '50%',
                            '--glow-y': '50%',
                            '--glow-intensity': '0',
                            '--glow-radius': '200px'
                        };

                        const cardContent = (
                            <>
                                {/* Imagen de fondo */}
                                {showBackgroundImages && card.backgroundImage && (
                                    <img
                                        src={card.backgroundImage}
                                        alt={card.imageAlt || card.title}
                                        className="card-background-image"
                                        loading="lazy"
                                    />
                                )}

                                {/* Contenido encima de la imagen */}
                                <div className="card-content-overlay">
                                    <div className="card__header flex justify-between gap-3 relative text-white">
                                        <span className="card__label text-base">{card.label}</span>
                                    </div>
                                    <div className="card__content flex flex-col relative text-white">
                                        <h3 className={`card__title font-normal text-base m-0 mb-1 ${textAutoHide ? 'text-clamp-1' : ''}`}>
                                            {card.title}
                                        </h3>
                                        <p className={`card__description text-xs leading-5 opacity-90 ${textAutoHide ? 'text-clamp-2' : ''}`}>
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                            </>
                        );

                        if (enableStars) {
                            return (
                                <ParticleCard
                                    key={index}
                                    className={baseClassName}
                                    style={cardStyle}
                                    disableAnimations={shouldDisableAnimations}
                                    particleCount={mobileAdjustedProps.particleCount}
                                    glowColor={glowColor}
                                    enableTilt={mobileAdjustedProps.enableTilt}
                                    clickEffect={mobileAdjustedProps.clickEffect}
                                    enableMagnetism={mobileAdjustedProps.enableMagnetism}
                                    onCardClick={() => openModal(card)}
                                >
                                    {cardContent}
                                </ParticleCard>
                            );
                        }

                        return (
                            <div
                                key={index}
                                className={baseClassName}
                                style={cardStyle}
                                onClick={() => openModal(card)}
                                ref={el => {
                                    if (!el) return;

                                    const handleMouseMove = e => {
                                        if (shouldDisableAnimations) return;
                                        const rect = el.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const y = e.clientY - rect.top;
                                        const centerX = rect.width / 2;
                                        const centerY = rect.height / 2;

                                        if (enableTilt) {
                                            const rotateX = ((y - centerY) / centerY) * -10;
                                            const rotateY = ((x - centerX) / centerX) * 10;
                                            gsap.to(el, {
                                                rotateX,
                                                rotateY,
                                                duration: 0.1,
                                                ease: 'power2.out',
                                            });
                                        }

                                        if (enableMagnetism) {
                                            const magnetX = (x - centerX) * 0.05;
                                            const magnetY = (y - centerY) * 0.05;
                                            gsap.to(el, {
                                                x: magnetX,
                                                y: magnetY,
                                                duration: 0.3,
                                                ease: 'power2.out'
                                            });
                                        }
                                    };

                                    const handleMouseLeave = () => {
                                        if (shouldDisableAnimations) return;
                                        if (enableTilt) {
                                            gsap.to(el, {
                                                rotateX: 0,
                                                rotateY: 0,
                                                duration: 0.3,
                                                ease: 'power2.out'
                                            });
                                        }
                                        if (enableMagnetism) {
                                            gsap.to(el, {
                                                x: 0,
                                                y: 0,
                                                duration: 0.3,
                                                ease: 'power2.out'
                                            });
                                        }
                                    };

                                    const handleClick = e => {
                                        if (!clickEffect || shouldDisableAnimations) return;
                                        const rect = el.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const y = e.clientY - rect.top;
                                        const maxDistance = Math.max(
                                            Math.hypot(x, y),
                                            Math.hypot(x - rect.width, y),
                                            Math.hypot(x, y - rect.height),
                                            Math.hypot(x - rect.width, y - rect.height)
                                        );
                                        const ripple = document.createElement('div');
                                        ripple.style.cssText = `
                                            position: absolute;
                                            width: ${maxDistance * 2}px;
                                            height: ${maxDistance * 2}px;
                                            border-radius: 50%;
                                            background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                                            left: ${x - maxDistance}px;
                                            top: ${y - maxDistance}px;
                                            pointer-events: none;
                                            z-index: 1000;
                                        `;
                                        el.appendChild(ripple);
                                        gsap.fromTo(
                                            ripple,
                                            { scale: 0, opacity: 1 },
                                            {
                                                scale: 1,
                                                opacity: 0,
                                                duration: 0.8,
                                                ease: 'power2.out',
                                                onComplete: () => ripple.remove()
                                            }
                                        );
                                    };

                                    el.addEventListener('mousemove', handleMouseMove);
                                    el.addEventListener('mouseleave', handleMouseLeave);
                                    el.addEventListener('click', handleClick);
                                }}
                            >
                                {cardContent}
                            </div>
                        );
                    })}
                </div>
            </BentoCardGrid>
        </>
    );
};

export default MagicBento;