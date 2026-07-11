// src/components/layout/providers.jsx
"use client";

import { ReducedMotionProvider } from "@/lib/motion";
import { SmoothScroll } from "@/components/layout/smooth-scroll";

export function Providers({ children }) {
    return (
        <ReducedMotionProvider>
            <SmoothScroll>{children}</SmoothScroll>
        </ReducedMotionProvider>
    );
}