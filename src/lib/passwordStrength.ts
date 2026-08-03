export interface StrengthMetrics {
    score: number;       // 0–5
    label: string;
    color: string;       // Tailwind-compatible hex
    percentage: number;  // 0–100
    suggestions: string[];
}

/**
 * Calculates password strength metrics.
 * Score rules:
 *  0 — less than 8 characters (Too Short)
 *  1–5 — starts at 1 for ≥8 chars, +1 each for: lowercase, uppercase, digit, special char
 */
export function calculatePasswordStrength(password: string): StrengthMetrics {
    if (!password || password.length < 8) {
        return {
            score: 0,
            label: "Too Short",
            color: "#ef4444",
            percentage: 0,
            suggestions: ["Use at least 8 characters"],
        };
    }

    let score = 1;
    const suggestions: string[] = [];

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasLower) score++;
    else suggestions.push("Add lowercase letters");

    if (hasUpper) score++;
    else suggestions.push("Add uppercase letters");

    if (hasDigit) score++;
    else suggestions.push("Add numbers");

    if (hasSpecial) score++;
    else suggestions.push("Add special characters (e.g. !@#$)");

    const map: Record<number, { label: string; color: string }> = {
        1: { label: "Very Weak", color: "#ef4444" },
        2: { label: "Weak", color: "#f97316" },
        3: { label: "Fair", color: "#eab308" },
        4: { label: "Good", color: "#84cc16" },
        5: { label: "Strong", color: "#22c55e" },
    };

    const { label, color } = map[score] ?? map[1];

    return {
        score,
        label,
        color,
        percentage: (score / 5) * 100,
        suggestions,
    };
}
