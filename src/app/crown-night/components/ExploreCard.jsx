// src/app/crown-night/components/ExploreCard.jsx
'use client'

import { motion } from 'framer-motion'
import { fadeIn } from '../utils/motion'
import {
    FaFacebookF,
    FaInstagram,
    FaTiktok,
    FaTicketAlt
} from 'react-icons/fa'

const ExploreCard = ({ id, imgUrl, title, index, active, handleClick, area, career, color, social }) => (
    <motion.div
        variants={fadeIn('right', 'spring', index * 0.5, 0.75)}
        className={`relative ${
            active === id 
                ? 'lg:flex-[3.5] flex-[10]' 
                : 'lg:flex-[0.5] flex-[2]'
        } flex items-center justify-center min-w-[120px] sm:min-w-[170px] h-[500px] sm:h-[550px] md:h-[600px] lg:h-[700px] transition-[flex] duration-[0.7s] ease-out cursor-pointer rounded-[24px] overflow-hidden`}
        onClick={() => handleClick(id)}
    >
        <img
            src={imgUrl}
            alt={title}
            className="absolute w-full h-full object-cover object-top"
        />

        {active !== id ? (
            <h3 className="font-semibold text-[14px] sm:text-[18px] lg:text-[26px] text-white absolute z-0 lg:bottom-20 lg:rotate-[-90deg] lg:origin-[0,0] whitespace-nowrap">
                {title.split(' ').slice(0, 2).join(' ')}
            </h3>
        ) : (
            <>
                {/* Redes Sociales - Solo cuando está expandido */}
                {social && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 z-20 flex flex-col items-center gap-1 sm:gap-1.5">
                        <div className="flex gap-2 sm:gap-3">
                            <a
                                href={social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-black/40 backdrop-blur-sm hover:bg-black/70 p-2 sm:p-2.5 lg:p-3 rounded-full transition-all duration-300 hover:scale-110"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Facebook"
                            >
                                <FaFacebookF className="text-white text-[12px] sm:text-[14px] lg:text-[16px]" />
                            </a>
                            {/* <a
                                href={social.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-black/40 backdrop-blur-sm hover:bg-black/70 p-2 sm:p-2.5 lg:p-3 rounded-full transition-all duration-300 hover:scale-110"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Instagram"
                            >
                                <FaInstagram className="text-white text-[12px] sm:text-[14px] lg:text-[16px]" />
                            </a> */}
                            <a
                                href={social.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-black/40 backdrop-blur-sm hover:bg-black/70 p-2 sm:p-2.5 lg:p-3 rounded-full transition-all duration-300 hover:scale-110"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="TikTok"
                            >
                                <FaTiktok className="text-white text-[12px] sm:text-[14px] lg:text-[16px]" />
                            </a>
                        </div>
                        <p className="text-white text-[10px] sm:text-[11px] lg:text-[12px] font-bold tracking-wider text-center">
                            Apoyar en redes
                        </p>
                    </div>
                )}

                <div className="absolute bottom-0 p-4 sm:p-6 lg:p-8 justify-start w-full flex-col bg-gradient-to-t from-background/90 to-transparent rounded-b-[24px]">
                    {/* Botón Comprar voto - Línea separada arriba del área */}
                    {/* <a
                        href="https://forms.gle/VDYSJFaXWjomPJTm7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-sm hover:bg-black/70 px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-xl transition-all duration-300 hover:scale-105 text-white text-[10px] sm:text-[11px] lg:text-[12px] font-light tracking-wider mb-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FaTicketAlt className="text-[10px] sm:text-[11px] lg:text-[12px]" />
                        Comprar voto
                    </a> */}
                    
                    <p 
                        className="mt-2 font-bold text-[16px] sm:text-[18px] leading-[20px] uppercase tracking-wider"
                        style={{ color: color }}
                    >
                        {area}
                    </p>
                    <h2 className="mt-[8px] sm:mt-[12px] font-semibold text-[18px] sm:text-[24px] lg:text-[32px] text-white leading-tight">
                        {title}
                    </h2>
                    <p className="text-[12px] sm:text-[14px] text-gray-300 mt-1 font-light">
                        {career}
                    </p>
                </div>
            </>
        )}
    </motion.div>
)

export default ExploreCard