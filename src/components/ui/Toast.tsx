"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
    error: <XCircle size={18} className="text-red-500   shrink-0" />,
    warning: <AlertTriangle size={18} className="text-yellow-500 shrink-0" />,
    info: <Info size={18} className="text-blue-500  shrink-0" />,
};

const BG: Record<ToastType, string> = {
    success: "border-green-500/30 bg-green-500/10",
    error: "border-red-500/30   bg-red-500/10",
    warning: "border-yellow-500/30 bg-yellow-500/10",
    info: "border-blue-500/30  bg-blue-500/10",
};

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        if (duration <= 0) return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            role="status"
            aria-live="polite"
            className={[
                "fixed top-4 right-4 z-50 flex items-start gap-3 rounded-xl border p-4 shadow-xl",
                "max-w-sm w-full text-sm text-foreground",
                "animate-in slide-in-from-top-2 fade-in duration-300",
                BG[type],
            ].join(" ")}
        >
            {ICONS[type]}
            <p className="flex-1 leading-snug">{message}</p>
            <button
                onClick={onClose}
                aria-label="Dismiss notification"
                className="text-muted-foreground hover:text-foreground transition-colors"
            >
                <X size={15} />
            </button>
        </div>
    );
}
