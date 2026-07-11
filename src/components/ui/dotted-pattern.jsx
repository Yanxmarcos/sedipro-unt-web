// src/components/ui/dotted-pattern.jsx

export function DottedPattern({
    size = 10,
    className,
    style,
}) {
    return (
        <div
            aria-hidden="true"
            className={`text-foreground/15 shadow-xl/5 ${className ?? ""}`}
            style={{
                backgroundImage:
                    "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: `${size}px ${size}px`,
                ...style,
            }}
        />
    );
}