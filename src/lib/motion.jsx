// src/lib/motion.jsx
"use client";

import { motion } from "motion/react";
import {
    createContext,
    useContext,
    useSyncExternalStore,
} from "react";

function subscribeToReducedMotion(callback) {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
    return false;
}

const ReducedMotionContext = createContext(false);

export function useReducedMotion() {
    return useContext(ReducedMotionContext);
}

export function ReducedMotionProvider({ children }) {
    const prefersReducedMotion = useSyncExternalStore(
        subscribeToReducedMotion,
        getReducedMotionSnapshot,
        getReducedMotionServerSnapshot
    );

    return (
        <ReducedMotionContext.Provider value={prefersReducedMotion}>
            {children}
        </ReducedMotionContext.Provider>
    );
}

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const fadeInDown = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const reducedMotionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

export const defaultTransition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
};

export const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
};

export function MotionDiv({
    variants = fadeInUp,
    children,
    className,
    ...props
}) {
    const prefersReducedMotion = useReducedMotion();

    const activeVariants = prefersReducedMotion ? reducedMotionVariants : variants;
    const activeTransition = prefersReducedMotion
        ? { duration: 0.01 }
        : defaultTransition;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={activeVariants}
            transition={activeTransition}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function MotionSection({
    variants = fadeInUp,
    children,
    className,
    ...props
}) {
    const prefersReducedMotion = useReducedMotion();

    const activeVariants = prefersReducedMotion ? reducedMotionVariants : variants;
    const activeTransition = prefersReducedMotion
        ? { duration: 0.01 }
        : defaultTransition;

    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={activeVariants}
            transition={activeTransition}
            className={className}
            {...props}
        >
            {children}
        </motion.section>
    );
}

export function StaggerContainer({
    children,
    className,
    ...props
}) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={prefersReducedMotion ? reducedMotionVariants : staggerContainer}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
    ...props
}) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            variants={prefersReducedMotion ? reducedMotionVariants : fadeInUp}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}