// src/app/crown-night/components/InsightCard.jsx
'use client'

import { motion } from 'framer-motion'
import { fadeIn } from '../utils/motion'

const InsightCard = ({ index, date, activity, evaluation, status = 'upcoming' }) => {
    // Configuración de colores según estado
    const statusStyles = {
        completed: {
            border: 'border-foreground/10',
            bg: 'bg-foreground/1',
            dateColor: 'text-foreground/30',
            textColor: 'text-foreground/40',
            dotColor: 'bg-foreground/20'
        },
        current: {
            border: 'border-yellow-400/50',
            bg: 'bg-yellow-400/10',
            dateColor: 'text-yellow-400',
            textColor: 'text-foreground/80',
            dotColor: 'bg-yellow-400'
        },
        upcoming: {
            border: 'border-border/10',
            bg: 'bg-foreground/5',
            dateColor: 'text-primary',
            textColor: 'text-foreground',
            dotColor: 'bg-primary/60'
        }
    }

    const style = statusStyles[status] || statusStyles.upcoming

    return (
        <motion.div
            variants={fadeIn('up', 'spring', index * 0.5, 1)}
            className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 glass-card rounded-2xl p-4 md:p-5 border transition-all duration-300 items-start ${style.border} ${style.bg} hover:border-primary/30`}
        >
            {/* Fecha - Columna 1 */}
            <div className="md:col-span-2 flex items-center gap-3">
                <span className={`text-lg md:text-xl font-bold ${style.dateColor}`}>
                    {date}
                </span>
            </div>

            {/* Actividad - Columna 2 */}
            <div className="md:col-span-5 flex items-start">
                <p className={`text-base md:text-lg font-medium leading-relaxed ${style.textColor}`}>
                    {activity}
                </p>
            </div>

            {/* Evaluación - Columna 3 */}
            <div className="md:col-span-5 flex items-start">
                <p className={`text-sm md:text-base leading-relaxed ${style.textColor} opacity-70`}>
                    {evaluation}
                </p>
            </div>
        </motion.div>
    )
}

export default InsightCard