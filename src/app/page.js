'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Check, Heart, Menu, X, Lock } from 'lucide-react';
import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaTiktok } from 'react-icons/fa';

const ShaderBackground = () => {
    const canvasRef = useRef(null);

    const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

    const fsSource = `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;

    const float overallSpeed = 0.2;
    const float gridSmoothWidth = 0.015;
    const float axisWidth = 0.05;
    const float majorLineWidth = 0.025;
    const float minorLineWidth = 0.0125;
    const float majorLineFrequency = 5.0;
    const float minorLineFrequency = 1.0;
    const float scale = 5.0;
    const float minLineWidth = 0.01;
    const float maxLineWidth = 0.2;
    const float lineSpeed = 1.0 * overallSpeed;
    const float lineAmplitude = 1.0;
    const float lineFrequency = 0.2;
    const float warpSpeed = 0.2 * overallSpeed;
    const float warpFrequency = 0.5;
    const float warpAmplitude = 1.0;
    const float offsetFrequency = 0.5;
    const float offsetSpeed = 1.33 * overallSpeed;
    const float minOffsetSpread = 0.6;
    const float maxOffsetSpread = 2.0;
    const int linesPerGroup = 16;

    // ========== COLORES DEL HERO (gradiente: #0b1326 → #3b0191 → #6b46c1) ==========
    // Color base azul oscuro: #0b1326
    vec4 bgColor1 = vec4(0.043, 0.075, 0.149, 1.0);  // #0b1326
    // Color intermedio morado intenso: #3b0191
    vec4 bgColor2 = vec4(0.231, 0.004, 0.569, 1.0);  // #3b0191
    // Color acento morado claro: #6b46c1
    vec4 accentColor = vec4(0.420, 0.275, 0.757, 1.0); // #6b46c1
    
    // Color de líneas: morado claro con opacidad
    vec4 lineColor = vec4(0.420, 0.275, 0.757, 0.8); // #6b46c1 semi-transparente
    // ===========================================

    #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
    #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
    #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
    #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

    float drawGridLines(float axis) {
      return drawCrispLine(0.0, axisWidth, axis)
            + drawPeriodicLine(majorLineFrequency, majorLineWidth, axis)
            + drawPeriodicLine(minorLineFrequency, minorLineWidth, axis);
    }

    float drawGrid(vec2 space) {
      return min(1.0, drawGridLines(space.x) + drawGridLines(space.y));
    }

    float random(float t) {
      return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
    }

    float getPlasmaY(float x, float horizontalFade, float offset) {
      return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
    }

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec4 fragColor;
      vec2 uv = fragCoord.xy / iResolution.xy;
      vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

      float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
      float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

      space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
      space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

      vec4 lines = vec4(0.0);
      
      // Gradiente animado similar al hero: azul oscuro → morado intenso → morado claro
      float gradientFactor = (sin(iTime * 0.2) + 1.0) / 2.0;
      
      // Primera mezcla: base azul oscuro con morado intenso
      vec4 mixed1 = mix(bgColor1, bgColor2, uv.x * 1.2);
      // Segunda mezcla: añadir morado claro en los bordes
      vec4 mixed2 = mix(mixed1, accentColor, gradientFactor * 0.6);
      
      // Añadir un poco de variación vertical
      vec4 dynamicBg = mix(mixed2, bgColor2, uv.y * 0.5);

      for(int l = 0; l < linesPerGroup; l++) {
        float normalizedLineIndex = float(l) / float(linesPerGroup);
        float offsetTime = iTime * offsetSpeed;
        float offsetPosition = float(l) + space.x * offsetFrequency;
        float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
        float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
        float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
        float linePosition = getPlasmaY(space.x, horizontalFade, offset);
        float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

        float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
        vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
        float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

        line = line + circle;
        float lineIntensity = 0.4 + rand * 0.6;
        lines += line * lineColor * lineIntensity;
      }

      // Color base con el gradiente del hero
      fragColor = dynamicBg;
      fragColor *= verticalFade;
      fragColor.a = 1.0;
      
      // Añadir las líneas con brillo sutil
      fragColor += lines * 0.8;
      
      // Viñeta sutil para dar profundidad
      float vignette = 1.0 - (length(uv - 0.5) * 0.3);
      fragColor.rgb *= vignette;

      gl_FragColor = fragColor;
    }
  `;

    // ... (resto de funciones loadShader, initShaderProgram, useEffect igual que antes)
    const loadShader = (gl, type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error: ', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };

    const initShaderProgram = (gl, vsSource, fsSource) => {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Shader program link error: ', gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.warn('WebGL not supported.');
            return;
        }
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        const programInfo = {
            program: shaderProgram,
            attribLocations: { vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition') },
            uniformLocations: {
                resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
                time: gl.getUniformLocation(shaderProgram, 'iTime'),
            },
        };
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        let startTime = Date.now();
        const render = () => {
            const currentTime = (Date.now() - startTime) / 1000;
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(programInfo.program);
            gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
            gl.uniform1f(programInfo.uniformLocations.time, currentTime);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10" />;
};

const images = [
    { src: '/img/hito1.webp', alt: 'Hito 1' },
    { src: '/img/hito2.webp', alt: 'Hito 2' },
    { src: '/img/hito3.webp', alt: 'Hito 3' },
    { src: '/img/hito4.webp', alt: 'Hito 4' },
    { src: '/img/hito5.webp', alt: 'Hito 5' },
    { src: '/img/hito6.webp', alt: 'Hito 6' },
];

export default function Home() {

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('inicio');

    // CONFIGURACIÓN DE FASES
    // glass-card-selected-glow
    // glass-card
    // glass-card-locked
    const CONFIG_FASES = {
        1: { clase: 'glass-card-selected-glow' },
        2: { clase: 'glass-card-locked' },
        3: { clase: 'glass-card-locked' },
        4: { clase: 'glass-card-locked' }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
            setIsTransitioning(false);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleAnchorClick = (e) => {
            const anchor = e.target.closest('a[href^="#"]');

            if (anchor) {
                e.preventDefault();

                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                    });
                }
            }
        };

        const handleScroll = () => {
            const scroll = window.pageYOffset;
            const mascot = document.querySelector('.animate-float');

            if (mascot) {
                mascot.style.transform =
                    `translateY(${scroll * 0.1}px) translateY(${Math.sin(scroll * 0.005) * 10}px)`;
            }
        };

        document.addEventListener('click', handleAnchorClick);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('click', handleAnchorClick);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const sections = document.querySelectorAll('section[id]');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                threshold: 0.5,
            }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* TopNavBar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 bg-surface-container/80 backdrop-blur-2xl rounded-full mt-4 mx-4 md:mx-auto max-w-container-max border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative">
                        <Image
                            alt="SEDInvita 2026"
                            fill
                            sizes="40px"
                            className="object-contain"
                            src="/img/sedinvita-logo.webp"
                        />
                    </div>
                    <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                        SEDInvita 2026
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a
                        href="#inicio"
                        className={`pb-1 font-label-md text-label-md transition-all duration-300 ${activeSection === 'inicio'
                                ? 'text-on-surface-variant/70 font-medium hover:text-primary border-b-2'
                                : 'text-primary border-primary font-bold'
                            }`}
                    >
                        Inicio
                    </a>

                    <a
                        href="#fases"
                        className={`pb-1 font-label-md text-label-md transition-all duration-300 ${activeSection === 'fases'
                                ? 'text-on-surface-variant/70 font-medium hover:text-primary border-b-2'
                                : 'text-primary border-primary font-bold'
                            }`}
                    >
                        Fases
                    </a>

                    <a
                        href="#beneficios"
                        className={`pb-1 font-label-md text-label-md transition-all duration-300 ${activeSection === 'beneficios'
                                ? 'text-on-surface-variant/70 font-medium hover:text-primary border-b-2'
                                : 'text-primary border-primary font-bold'
                            }`}
                    >
                        Beneficios
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <a href="https://forms.gle/uVSW131HtsJnKzE17" target='_blank' className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container rounded-full font-label-md text-label-md font-bold active:scale-95 transform transition-transform duration-200 shadow-lg">
                        Inscribirme Ahora
                    </a>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-on-surface"
                    >
                        {mobileMenuOpen ? (
                            <X size={28} />
                        ) : (
                            <Menu size={28} />
                        )}
                    </button>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="fixed top-24 left-4 right-4 z-40 md:hidden">
                    <div className="glass-card rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
                        <a
                            href="#inicio"
                            onClick={() => setMobileMenuOpen(false)}
                            className="font-semibold text-on-surface"
                        >
                            Inicio
                        </a>
                        <a
                            href="#fases"
                            onClick={() => setMobileMenuOpen(false)}
                            className="font-semibold text-on-surface"
                        >
                            Fases
                        </a>
                        <a
                            href="#beneficios"
                            onClick={() => setMobileMenuOpen(false)}
                            className="font-semibold text-on-surface"
                        >
                            Beneficios
                        </a>
                        <a href="https://forms.gle/uVSW131HtsJnKzE17" target='_blank' className="mt-2 px-6 py-3 bg-primary-container text-on-primary-container rounded-xl font-bold">
                            Inscribirme Ahora
                        </a>
                    </div>
                </div>
            )}

            <main>
                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center pt-24 overflow-hidden" id="inicio">
                    {/* Fondo de respaldo inmediato (se ve mientras carga el shader) */}
                    <div className="absolute inset-0 z-[-1] hero-gradient"></div>
                    
                    {/* ShaderBackground como fondo principal */}
                    <div className="absolute inset-0 z-0">
                        <ShaderBackground />
                    </div>
                    
                    {/* Overlay con gradiente hero */}
                    <div className="absolute inset-0 z-[1]" style={{ 
                        background: "linear-gradient(135deg, rgba(11, 19, 38, 0.7) 0%, rgba(59, 1, 145, 0.6) 50%, rgba(107, 70, 193, 0.5) 100%)"
                    }}></div>
                    
                    {/* Contenido del hero */}
                    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full grid grid-cols-1 md:grid-cols-2 gap-stack-lg items-center relative z-10">
                        <div className="space-y-stack-md text-center md:text-left flex flex-col items-center md:items-start mt-12 md:mt-0">
                            <h1 className="font-display-lg text-[32px] sm:text-[36px] md:text-display-lg text-on-surface leading-tight text-glow">
                                Conecta, lidera y <br /><span className="text-primary-container">transforma</span> tu futuro académico.
                            </h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto md:mx-0">
                                Únete a la comunidad de líderes más influyente de la UNT. <strong>SEDInvita 2026</strong> es el punto de partida para tu crecimiento profesional y personal.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <a href="https://forms.gle/uVSW131HtsJnKzE17" target='_blank' className="px-8 py-4 bg-on-primary-container text-on-primary rounded-2xl font-label-md text-label-md font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                    Inscribirme Ahora
                                </a>
                                <a href="#fases" target="_blank" className="px-8 py-4 glass-card text-on-surface rounded-2xl font-label-md text-label-md font-bold hover:bg-white/10 transition-colors">
                                    Fase Actual
                                </a>
                            </div>
                        </div>
                        <div className="flex justify-center items-center relative">
                            <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/20 blur-[100px] rounded-full"></div>
                            <div className="w-[300px] md:w-[500px] relative animate-float drop-shadow-2xl z-10">
                                <Image
                                    alt={images[currentImageIndex].alt}
                                    width={500}
                                    height={500}
                                    priority
                                    className={`object-contain transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                                        }`}
                                    src={images[currentImageIndex].src}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Chronogram Section (Phases) */}
                <section className="py-stack-lg bg-surface relative overflow-hidden" id="fases">
                    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                        <div className="text-center mb-stack-lg space-y-4">
                            <h2 className="font-headline-lg text-headline-lg text-on-surface">Fases de SEDInvita</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                                Diseñamos un camino estructurado para identificar el talento de cada estudiante que desea formar parte de SEDIPRO UNT.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
                            {/* Phase cards igual que el original... */}
                            <div className={`${CONFIG_FASES[1].clase} p-stack-md rounded-2xl group hover:border-primary/50 transition-all duration-500 relative`}>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="font-display-lg text-display-lg font-extrabold text-on-surface">01</span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-stack-sm">
                                    <Image
                                        alt="Background Hito"
                                        width={50}
                                        height={50}
                                        className="object-contain"
                                        src="/img/hito5.webp"
                                    />
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">FASE 1</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Inscripciones abiertas y evaluación preliminar. Primer acercamiento a tus aptitudes.
                                </p>
                            </div>
                            {/* Fase 2, 3, 4... */}
                            <div className={`${CONFIG_FASES[2].clase} p-stack-md rounded-2xl group hover:border-primary/50 transition-all duration-500 relative`}>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="font-display-lg text-display-lg font-extrabold text-on-surface">02</span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-stack-sm">
                                    <Image
                                        alt="Background Hito"
                                        width={50}
                                        height={50}
                                        className="object-contain"
                                        src="/img/hito3.webp"
                                    />
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">FASE 2</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Inducciones y dinámicas. Integración grupal y perfil profundo.
                                </p>
                            </div>
                            <div className={`${CONFIG_FASES[3].clase} p-stack-md rounded-2xl group hover:border-primary/50 transition-all duration-500 relative`}>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="font-display-lg text-display-lg font-extrabold text-on-surface">03</span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-stack-sm">
                                    <Image
                                        alt="Background Hito"
                                        width={50}
                                        height={50}
                                        className="object-contain"
                                        src="/img/hito4.webp"
                                    />
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">FASE 3</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Desarrollo de Proyecto y casos de estudio. Creatividad estratégica y defensa de ideas.
                                </p>
                            </div>
                            <div className={`${CONFIG_FASES[4].clase} p-stack-md rounded-2xl group hover:border-primary/50 transition-all duration-500 relative`}>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="font-display-lg text-display-lg font-extrabold text-on-surface">04</span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-stack-sm">
                                    <Image
                                        alt="Background Hito"
                                        width={50}
                                        height={50}
                                        className="object-contain"
                                        src="/img/hito2.webp"
                                    />
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">FASE 4</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Entrevistas personales y bienvenida. Evaluación final y ceremonia de ingreso oficial.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-stack-lg bg-surface-container-lowest relative overflow-hidden" id="beneficios">
                    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-stack-lg items-center">
                        <div className="lg:col-span-5 space-y-stack-md">
                            <h2 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface leading-tight">
                                ¿Por qué ser parte de <span className="text-primary">SEDIPRO UNT</span>?
                            </h2>
                            <p className="font-body-lg text-body-lg text-on-surface-variant">
                                Más que una organización, somos una incubadora de líderes. Descubre cómo potenciar tus habilidades blandas y técnicas en un entorno real.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                        <Check size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-headline-md text-body-lg font-bold text-on-surface">Metodología PMI + Ágil</h4>
                                        <p className="font-body-md text-body-md text-on-surface-variant">
                                            Aprende y aplica buenas prácticas en gestión de proyectos con estándares PMI y herramientas ágiles.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                        <Check size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-headline-md text-body-lg font-bold text-on-surface">Tres Enfoques de Impacto</h4>
                                        <p className="font-body-md text-body-md text-on-surface-variant">
                                            Trabajamos desde lo académico, social y ambiental para formar profesionales capacitados en dirección de proyectos.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                        <Check size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-headline-md text-body-lg font-bold text-on-surface">Formación de Líderes</h4>
                                        <p className="font-body-md text-body-md text-on-surface-variant">
                                            Desarrolla habilidades de liderazgo con valores como innovación, integridad, trabajo en equipo y vocación de servicio.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-12">
                                <div className="aspect-square rounded-2xl bg-surface-variant overflow-hidden relative">
                                    <Image
                                        alt="Imagen 1"
                                        fill
                                        className="object-cover"
                                        src="/img/info1.jpg"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                </div>
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                                    <Image
                                        alt="Imagen 2"
                                        fill
                                        className="object-cover"
                                        src="/img/info33.jpg"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                                    <Image
                                        alt="Imagen 3"
                                        fill
                                        className="object-cover"
                                        src="/img/info44.jpg"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                </div>
                                <div className="aspect-square rounded-2xl bg-surface-variant overflow-hidden relative">
                                    <Image
                                        alt="Imagen 4"
                                        fill
                                        className="object-cover"
                                        src="/img/info2.jpg"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-stack-lg px-margin-mobile relative overflow-hidden">
                    {/* Imagen de fondo */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            alt="Fondo Sedipro UNT"
                            fill
                            priority
                            className="object-cover"
                            src="/img/cta-fondo.webp"
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>

                    {/* Contenido */}
                    <div className="max-w-container-max mx-auto glass-card-extra-light rounded-[32px] p-stack-lg md:p-24 text-center space-y-stack-md relative z-10 border-white/5 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 pointer-events-none rounded-[32px]"></div>
                        <h2 className="font-display-lg text-headline-lg md:text-[56px] text-on-surface leading-tight relative z-10">
                            Tu oportunidad <br />te está esperando.
                        </h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto relative z-10">
                            ¿Estás preparado para el desafío? Inicia tu proceso de postulación hoy mismo y sé parte de la élite académica de la UNT.
                        </p>
                        <div className="pt-4 relative z-10">
                            <a href="https://forms.gle/uVSW131HtsJnKzE17" target='_blank' className="px-8 py-4 bg-primary text-on-secondary-container rounded-2xl font-label-md text-label-md font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                Inscribirme Ahora
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-12">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-stack-md">
                        <div className="flex flex-col gap-2 items-center md:items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 relative">
                                    <Image
                                        src="/logos/isotipo.webp"
                                        alt="Logo SEDIPRO UNT"
                                        width={32}
                                        height={32}
                                        className="w-auto h-auto object-contain"
                                    />
                                </div>
                                <span className="text-label-md font-headline-md font-bold text-on-surface">SEDIPRO UNT</span>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant font-label-sm text-label-sm">
                                Sección Estudiantil de Dirección de
                            </p>
                            <p className="font-body-md text-body-md text-on-surface-variant font-label-sm text-label-sm">
                                Proyectos de la UNT.
                            </p>
                        </div>

                        {/* Redes Sociales */}
                        <div className="flex gap-4">
                            <a
                                href="https://www.facebook.com/SediproUNT"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-110 transition-all duration-300"
                            >
                                <FaFacebookF size={18} />
                            </a>
                            <a
                                href="https://www.instagram.com/sedipro.unt/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-110 transition-all duration-300"
                            >
                                <FaInstagram size={18} />
                            </a>
                            <a
                                href="https://www.linkedin.com/company/sediprount/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-110 transition-all duration-300"
                            >
                                <FaLinkedinIn size={18} />
                            </a>
                            <a
                                href="https://www.youtube.com/c/SEDIPROUNT"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-110 transition-all duration-300"
                            >
                                <FaYoutube size={18} />
                            </a>
                            <a
                                href="https://www.tiktok.com/@sediprount"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="TikTok"
                                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-110 transition-all duration-300"
                            >
                                <FaTiktok size={18} />
                            </a>
                        </div>

                        {/* Hecho por Área de TI */}
                        <div className="flex items-center gap-2">
                            <span className="font-label-sm text-body-md text-on-surface-variant text-label-sm">
                                Hecho con
                            </span>
                            <Heart size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
                            <span className="font-label-sm text-body-md text-on-surface-variant text-label-sm">
                                por
                            </span>
                            <span className="font-label-sm text-label-md font-semibold text-orange-500 text-label-sm">
                                Área de TI
                            </span>
                            <div className="w-6 h-6 relative">
                                <Image
                                    alt="Logo Área de TI SEDIPRO"
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                    src="/img/area-ti.png"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-outline-variant/20 text-center">
                        <Link href="/login" className="w-full flex justify-center items-center gap-1 mt-1 group cursor-pointer">
                            <Lock size={14} className="text-outline-variant group-hover:text-primary transition-colors duration-200" />
                            <span className="text-xs text-outline-variant group-hover:text-primary transition-colors duration-200">
                                Administración
                            </span>
                        </Link>
                        <p className="text-xs text-on-surface-variant/60 mt-5">
                            © 2026 SEDIPRO UNT. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}