"use client";

import React, { useState } from "react";
import { Eye, EyeOff, XCircle } from "lucide-react";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
    name: string;
    error?: string;
    required?: boolean;
    containerClassName?: string;
}

export function PasswordInput({
    label,
    name,
    error,
    required,
    containerClassName = "",
    className = "",
    id,
    ...rest
}: PasswordInputProps) {
    const [show, setShow] = useState(false);
    const inputId = id ?? name;
    const errorId = `${inputId}-error`;

    return (
        <div className={`flex flex-col gap-1 ${containerClassName}`}>
            <label htmlFor={inputId} className="text-sm font-medium text-foreground/80">
                {label}
                {required && (
                    <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                )}
            </label>

            <div className="relative flex items-center">
                <input
                    id={inputId}
                    name={name}
                    type={show ? "text" : "password"}
                    required={required}
                    aria-required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    className={[
                        "h-11 w-full rounded-lg border bg-background pl-3 pr-10 text-sm text-foreground outline-none",
                        "transition-all duration-150",
                        "focus:border-primary focus:ring-2 focus:ring-primary/20",
                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-border",
                        className,
                    ].join(" ")}
                    {...rest}
                />
                <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            {error && (
                <p
                    id={errorId}
                    role="alert"
                    className="flex items-center gap-1 text-xs text-red-500 animate-in fade-in duration-200"
                >
                    <XCircle size={13} className="shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}
