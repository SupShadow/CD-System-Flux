"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

const toastIcons: Record<ToastType, ReactNode> = {
    success: <CheckCircle className="w-4 h-4" />,
    error: <XCircle className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
};

const toastStyles: Record<ToastType, string> = {
    success: "border-green-500/50 bg-green-500/10 text-green-400",
    error: "border-signal/50 bg-signal/10 text-signal",
    warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
    info: "border-blue-500/50 bg-blue-500/10 text-blue-400",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
                "flex items-center gap-3 px-4 py-3 border backdrop-blur-md font-mono text-sm shadow-lg",
                toastStyles[toast.type]
            )}
        >
            {toastIcons[toast.type]}
            <span className="flex-1">{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                className="opacity-50 hover:opacity-100 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = "info", duration: number = 4000) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const toast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, toast]);

            if (duration > 0) {
                setTimeout(() => {
                    dismissToast(id);
                }, duration);
            }
        },
        [dismissToast]
    );

    const showError = useCallback(
        (message: string) => showToast(message, "error", 6000),
        [showToast]
    );

    const showSuccess = useCallback(
        (message: string) => showToast(message, "success", 3000),
        [showToast]
    );

    const showWarning = useCallback(
        (message: string) => showToast(message, "warning", 5000),
        [showToast]
    );

    const showInfo = useCallback(
        (message: string) => showToast(message, "info", 4000),
        [showToast]
    );

    const value: ToastContextValue = {
        showToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        dismissToast,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 max-w-sm">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
