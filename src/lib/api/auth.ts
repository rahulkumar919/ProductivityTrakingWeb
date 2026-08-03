/** Typed API client for authentication and profile endpoints. */

export interface LoginRequest {
    mobileNumber: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterRequest {
    name: string;
    mobileNumber: string;
    password: string;
}

export interface ProfileResponse {
    _id?: string;
    name?: string;
    mobileNumber?: string;
    profession?: string;
    studyHours?: number;
    codingHours?: number;
    gymTime?: number;
    [key: string]: unknown;
}

export interface ProfileUpdateRequest {
    name?: string;
    mobileNumber?: string;
    profession?: string;
    studyHours?: number;
    codingHours?: number;
    gymTime?: number;
}

async function handleResponse(res: Response, defaultMessage: string): Promise<void> {
    if (!res.ok) {
        let message = defaultMessage;
        try {
            const data = await res.json();
            if (data?.error) message = data.error;
        } catch {
            // ignore parse errors
        }
        throw new Error(message);
    }
}

export async function loginUser(data: LoginRequest): Promise<void> {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    await handleResponse(res, "Login failed. Please try again.");
}

export async function registerUser(data: RegisterRequest): Promise<void> {
    const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    await handleResponse(res, "Registration failed. Please try again.");
}

export async function fetchProfile(): Promise<ProfileResponse> {
    const res = await fetch("/api/profile", {
        credentials: "include",
    });
    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized. Please log in again.");
        throw new Error("Failed to load profile.");
    }
    return res.json();
}

export async function updateProfile(data: ProfileUpdateRequest): Promise<void> {
    const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    await handleResponse(res, "Failed to save profile.");
}
