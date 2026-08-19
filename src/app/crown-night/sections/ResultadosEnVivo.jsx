// src/app/crown-night/sections/ResultadosEnVivo.jsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  BarChart3, 
  ExternalLink, 
  Shield, 
  RefreshCw,
  TrendingUp 
} from 'lucide-react'
import { TitleText, TypingText } from '../components'
import { staggerContainer, fadeIn } from '../utils/motion'

const ResultadosEnVivo = () => {
    return (
        <section className="py-20 px-4 relative z-10" id="resultados">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.25 }}
                className="max-w-7xl mx-auto flex flex-col items-center"
            >

                <TypingText title="| Resultados en tiempo real" textStyles="text-center" />
                <TitleText
                    title={<>Resultados de la <span className="text-primary">votación</span></>}
                    textStyles="text-center"
                />

                <motion.p
                    variants={fadeIn('up', 'tween', 0.2, 1)}
                    className="mt-4 text-base sm:text-lg text-foreground/60 text-center max-w-2xl"
                >
                    Resultados de apoyo registrados y validados durante la jornada de votación.
                </motion.p>

                {/* Contenedor principal */}
                <motion.div
                    variants={fadeIn('up', 'tween', 0.3, 1)}
                    className="mt-10 w-full max-w-4xl"
                >
                    <div className="relative glass-card rounded-3xl p-6 md:p-10 border border-border/10 overflow-hidden group hover:border-primary/30 transition-all duration-500">
                        {/* Fondo con gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-500" />

                        {/* Elementos decorativos */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-secondary/5 blur-3xl" />

                        <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                            {/* Imagen del Hito */}
                            <div className="relative w-full lg:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden flex-shrink-0">
                                <Image
                                    src="/img/hito2.webp"
                                    alt="Hito SEDIPRO - Crown Night 2026"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 90vw, 40vw"
                                    priority
                                />
                                {/* Overlay sutil */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-transparent" />
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                        <BarChart3 className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground/40 uppercase tracking-wider">
                                        Datos en tiempo real
                                    </span>
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                                    Resultados oficiales
                                </h3>

                                <p className="text-sm sm:text-base text-foreground/60 max-w-lg mb-6 lg:mb-8">
                                    Consulta los cómputos actualizados de la votación. 
                                    Los datos se actualizan automáticamente desde el registro oficial de SEDIPRO UNT.
                                </p>

                                {/* Botón principal */}
                                <a
                                    href="https://script.google.com/a/macros/unitru.edu.pe/s/AKfycbznPLlb78sz9HIjFwUrh-KHhdITMES2Wf9Y7Qg1AGR02U2AH2cS34vw0jjWl4FjD2q7/exec"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]"
                                >
                                    <span>Ver Resultados</span>
                                    <ExternalLink className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </a>

                                {/* Indicadores de seguridad y actualización */}
                                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-foreground/30">
                                    {/* <div className="flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>Los datos mostrados son de carácter informativo</span>
                                    </div> */}
                                    <div className="flex items-center gap-1.5">
                                        {/* <RefreshCw className="w-3.5 h-3.5" /> */}
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>Los datos mostrados pueden estar sujetos a cambios</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}

export default ResultadosEnVivo