// src/components/layout/page-backdrop.jsx

// src/components/layout/page-backdrop.jsx
import { ShaderFlow } from "../shaders/shader-flow";

export function PageBackdrop() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 h-screen w-full overflow-hidden"
        >
            <div className="absolute inset-0 opacity-50 md:opacity-100">
                <ShaderFlow
                    brightness={3}
                    iterations={10}
                    flowSpeed={[0, 0.1]}
                    className="absolute inset-0 h-full w-full"
                />
            </div>
        </div>
    );
}