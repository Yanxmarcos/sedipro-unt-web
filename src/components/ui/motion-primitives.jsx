// src/components/ui/motion-primitives.jsx
"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

export function FadeIn({
    children,
    delay = 0,
    duration = 0.8,
    className,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: EASE }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function ScaleUnblur({
    children,
    delay = 0,
    duration = 1,
    className,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.7, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration, delay, ease: EASE }}
            style={{ transformOrigin: "center" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}