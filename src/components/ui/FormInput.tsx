"use client";

import React from "react";
import { XCircle } from "lucide-react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    error?: string;
    required?: boolean;
    containerClassName?: string;
}

export function FormInput({
    label,
    name,
    error,
    required,
    containerClassName = "",
    className = "",
    id,
    ...rest
}: FormInputProps) {
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

            <input
                id={inputId}
                name={name}
                required={required}
                aria-required={required}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={[
                    "h-11 rounded-lg border bg-background px-3 text-sm text-foreground outline-none",
                    "transition-all duration-150",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                    error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-border",
                    className,
                ].join(" ")}
                {...rest}
            />

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
