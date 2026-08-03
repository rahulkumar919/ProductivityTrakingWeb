/**
 * Client-side validation utility functions.
 * These mirror the server-side Zod schemas for real-time feedback.
 */

/** Returns an error message if the mobile number is invalid, undefined if valid. */
export function validateMobileNumber(mobile: string): string | undefined {
    if (!mobile || mobile.trim().length === 0) return "Mobile number is required.";
    const trimmed = mobile.trim();
    if (trimmed.length < 8) return "Mobile number must be at least 8 digits.";
    if (trimmed.length > 16) return "Mobile number must be at most 16 digits.";
    if (!/^[0-9+\-\s()]+$/.test(trimmed)) return "Mobile number contains invalid characters.";
    return undefined;
}

/** Returns an error message if the password is invalid, undefined if valid. */
export function validatePassword(password: string): string | undefined {
    if (!password || password.length === 0) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return undefined;
}

/** Returns an error message if the name is invalid, undefined if valid. */
export function validateName(name: string): string | undefined {
    if (!name || name.trim().length === 0) return "Name is required.";
    if (name.trim().length < 2) return "Name must be at least 2 characters.";
    return undefined;
}

/**
 * Validates numeric profile fields (study hours, coding hours, gym time).
 * Returns a warning string for out-of-range values, an error for negatives,
 * or undefined if the value is acceptable.
 */
export function validateProfileField(field: string, value: unknown): string | undefined {
    if (value === "" || value === null || value === undefined) return undefined;
    const num = Number(value);
    if (isNaN(num)) return `${field} must be a number.`;
    if (num < 0) return `${field} cannot be negative.`;
    // Soft warnings (not hard errors) for unreasonably large values
    if (field === "studyHours" && num > 24) return `${field}: value seems high (max 24h/day).`;
    if (field === "codingHours" && num > 24) return `${field}: value seems high (max 24h/day).`;
    if (field === "gymTime" && num > 480) return `${field}: value seems high (max 480 min/day).`;
    return undefined;
}
