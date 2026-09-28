// src/components/contact/contact-button.jsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const EMAIL = "sedipro@unitru.edu.pe";
const EASE = [0.22, 1, 0.36, 1];

export function ContactButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [supportsHover, setSupportsHover] = useState(true);
  const openRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setSupportsHover(mq.matches);

    const handleChange = (e) => setSupportsHover(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } catch {}
      document.body.removeChild(ta);
    }
  };

  const openState = (value) => {
    openRef.current = value;
    setOpen(value);
  };

  const handleTap = () => {
    // En touch, el tap es la única fuente de verdad: abre primero, copia después.
    if (!openRef.current) {
      openState(true);
      return;
    }
    handleCopy();
  };

  // El hover solo se activa en dispositivos que realmente lo soportan
  // (mouse/trackpad). En touch, el navegador emula hover al tocar y
  // genera conflictos con el tap, así que lo desactivamos por completo.
  const hoverHandlers = supportsHover
    ? {
        onHoverStart: () => openState(true),
        onHoverEnd: () => openState(false),
        onFocus: () => openState(true),
        onBlur: () => openState(false),
      }
    : {};

  return (
    <motion.button
      type="button"
      layout
      onTap={handleTap}
      {...hoverHandlers}
      aria-label={
        copied ? "Email copiado" : open ? `Copiar ${EMAIL}` : "Mostrar email"
      }
      transition={{ layout: { duration: 0.55, ease: EASE } }}
      style={{ borderRadius: 12 }}
      className="focus-ring relative inline-flex h-11 cursor-pointer items-center justify-center border border-white bg-white px-5 text-sm font-semibold text-black shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl active:translate-y-0"
    >
      <motion.span
        layout="position"
        className="relative inline-flex items-center"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.span
              key="email"
              layout="position"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                <AnimatePresence initial={false} mode="wait">
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="inline-flex"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="inline-flex"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="tabular-nums">{EMAIL}</span>
            </motion.span>
          ) : (
            <motion.span
              key="contact"
              layout="position"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Contáctanos</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
