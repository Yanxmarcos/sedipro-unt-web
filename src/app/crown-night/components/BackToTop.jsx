// src/app/crown-night/components/BackToTop.jsx
'use client'

import { motion } from 'framer-motion'
import { FaArrowUp } from 'react-icons/fa'

const BackToTop = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="flex justify-center py-8 px-4 mb-5">
            <motion.button
                onClick={scrollToTop}
                className="inline-flex items-center gap-3 bg-primary hover:bg-primary/80 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <FaArrowUp className="text-xl" />
                Volver al inicio
            </motion.button>
        </div>
    )
}

export default BackToTop