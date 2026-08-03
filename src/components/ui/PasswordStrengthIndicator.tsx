"use client";

import { calculatePasswordStrength } from "@/lib/passwordStrength";

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const { label, color, percentage, suggestions } = calculatePasswordStrength(password);

    if (!password) return null;

    return (
        <div className="flex flex-col gap-1.5">
            {/* Label + percentage */}
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium" style={{ color }}>
                    {label}
                </span>
                <span className="text-muted-foreground">{Math.round(percentage)}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Password strength: ${label}`}
                />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <ul
                    className="flex flex-wrap gap-x-3 gap-y-0.5"
                    aria-live="polite"
                    aria-label="Password improvement suggestions"
                >
                    {suggestions.map((s) => (
                        <li key={s} className="text-[11px] text-muted-foreground list-none">
                            • {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
