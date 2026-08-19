// src/app/crown-night/sections/Todos.jsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { TitleText, TypingText } from '../components'
import { staggerContainer, fadeIn } from '../utils/motion'
import { FaTicketAlt, FaGift, FaWhatsapp, FaEnvelope, FaUser, FaUsers } from 'react-icons/fa'

const Todos = () => {
    return (
        <section className="py-20 px-4" id="todos">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.25 }}
                className="max-w-7xl mx-auto flex flex-col"
            >
                <TypingText title="| Haz que tu candidato destaque" textStyles="text-center" />
                <TitleText
                    title={<>Apoya a tu candidato</>}
                    textStyles="text-center"
                />
                <p className="text-center text-foreground/60 text-base sm:text-lg font-light mt-2 mb-8">
                    Demuestra tu apoyo y participa automáticamente en nuestra gran rifa
                </p>

                {/* Cómo participar y Gran rifa - 2 columnas */}
                <motion.div
                    variants={fadeIn('up', 'tween', 0.3, 1)}
                    className="grid md:grid-cols-2 gap-6"
                >
                    {/* Columna Izquierda - Cómo participar */}
                    <div className="glass-card p-6 sm:p-8 rounded-[32px] border border-border/10 relative group hover:border-primary/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[32px] group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300" />
                        <div className="relative">
                            <h4 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <FaTicketAlt className="text-primary" />
                                ¿Cómo participar?
                            </h4>
                            <ol className="space-y-4">
                                <li className="flex gap-3 items-start">
                                    <span className="text-primary font-bold text-lg">1</span>
                                    <div>
                                        <p className="font-semibold text-foreground">Realiza el pago</p>
                                        <p className="text-foreground/60 text-sm">S/ 1.00 al candidato que deseas apoyar</p>
                                    </div>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="text-primary font-bold text-lg">2</span>
                                    <div>
                                        <p className="font-semibold text-foreground">Completa el formulario</p>
                                        <p className="text-foreground/60 text-sm">Con tus datos personales</p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Columna Derecha - Información de la rifa */}
                    <div className="glass-card p-6 sm:p-8 rounded-[32px] border border-border/10 relative group hover:border-primary/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[32px] group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300" />
                        <div className="relative">
                            <h4 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <FaGift className="text-primary" />
                                Gran rifa
                            </h4>
                            <p className="text-foreground/70 mb-4">
                                Al realizar tu compra, entras automáticamente a la rifa y podrás llevarte uno de nuestros increíbles premios.
                            </p>
                            <div className="bg-primary/10 rounded-xl p-4">
                                <p className="text-sm text-foreground/80 font-medium">
                                    🎁 ¡Participa y gana!
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Datos del formulario */}
                <motion.div
                    variants={fadeIn('up', 'tween', 0.4, 1)}
                    className="glass-card p-6 sm:p-8 rounded-[32px] border border-border/10 relative group hover:border-primary/30 transition-all duration-300 mt-6"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[32px] group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300" />
                    <div className="relative">
                        <h4 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                            <FaUser className="text-primary" />
                            Completa el formulario
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-foreground/5 rounded-xl p-3">
                                <FaUser className="text-primary/60 text-sm" />
                                <span className="text-foreground/70 text-sm">Nombres y apellidos</span>
                            </div>
                            <div className="flex items-center gap-3 bg-foreground/5 rounded-xl p-3">
                                <FaEnvelope className="text-primary/60 text-sm" />
                                <span className="text-foreground/70 text-sm">Correo electrónico</span>
                            </div>
                            <div className="flex items-center gap-3 bg-foreground/5 rounded-xl p-3">
                                <FaWhatsapp className="text-primary/60 text-sm" />
                                <span className="text-foreground/70 text-sm">Número de WhatsApp</span>
                            </div>
                            <div className="flex items-center gap-3 bg-foreground/5 rounded-xl p-3">
                                <FaUsers className="text-primary/60 text-sm" />
                                <span className="text-foreground/70 text-sm">Área a la que apoyas</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Foto de todos + Botón - 2 columnas */}
                <motion.div
                    variants={fadeIn('up', 'tween', 0.5, 1)}
                    className="grid md:grid-cols-2 gap-6 mt-6"
                >
                    {/* Botón de compra */}
                    <div className="glass-card p-6 sm:p-8 rounded-[32px] border border-border/10 relative group hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[32px] group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300" />
                        <div className="relative text-center">
                            <h4 className="text-2xl font-bold text-foreground mb-4">
                                ¡Listo para participar!
                            </h4>
                            <p className="text-foreground/70 mb-6">
                                Al realizar tu compra, entras automáticamente a la rifa y podrás llevarte uno de nuestros increíbles premios.
                            </p>
                            <a
                                href="https://forms.gle/VDYSJFaXWjomPJTm7"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-primary hover:bg-primary/80 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
                            >
                                <FaTicketAlt className="text-xl" />
                                Comprar voto
                            </a>
                            <p className="text-foreground/50 text-sm mt-4">
                                Al comprar, participas automáticamente en la rifa
                            </p>
                        </div>
                    </div>
                    {/* Foto de todos los candidatos */}
                    <div className="rounded-[32px] overflow-hidden glass-card border border-border/10 relative group hover:border-primary/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300" />

                        <div className="relative w-full h-[300px]">
                            <Image
                                src="/crown-night/todos1.webp"
                                alt="Todos los candidatos de Crown Night 2026"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 85vw, 45vw"
                                priority
                                quality={100}
                                unoptimized={true}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Dos afiches juntos */}
                <motion.div
                    variants={fadeIn('up', 'tween', 0.6, 1)}
                    className="grid md:grid-cols-2 gap-6 mt-6"
                >
                    <div className="rounded-[32px] overflow-hidden glass-card border border-border/10 relative group hover:border-primary/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[32px] group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300" />
                        <div className="relative w-full aspect-[2047/2560] max-h-[450px]">
                            <Image
                                src="/crown-night/apoya-tu-candidato.webp"
                                alt="Apoya a tu candidato"
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 85vw, 45vw"
                                quality={100}
                                unoptimized={true}
                            />
                        </div>
                    </div>
                    <div className="rounded-[32px] overflow-hidden glass-card border border-border/10 relative group hover:border-primary/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[32px] group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300" />
                        <div className="relative w-full aspect-[1023/1280] max-h-[450px]">
                            <Image
                                src="/crown-night/gran-rifa.webp"
                                alt="Gran Rifa Crown Night 2026"
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 85vw, 45vw"
                                quality={100}
                                unoptimized={true}
                            />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}

export default Todos