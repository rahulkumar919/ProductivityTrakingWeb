/** Maps HTTP status codes and error objects to user-friendly messages. */
export function handleApiError(response: Response, defaultMessage: string): string {
    switch (response.status) {
        case 400:
            return "Invalid request. Please check your inputs.";
        case 401:
            return "Invalid mobile number or password.";
        case 409:
            return "Mobile number already registered.";
        case 500:
            return "Server error. Please try again later.";
        default:
            return defaultMessage;
    }
}

/** Extracts a user-friendly error message from any thrown value. */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred.";
}
