"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export interface Toast {
    id: number;
    message: string;
    type: "success" | "error" | "info";
}

interface ToastNotificationProps {
    toasts: Toast[];
    onRemove: (id: number) => void;
}

export function ToastNotification({ toasts, onRemove }: ToastNotificationProps) {
    return (
        <div className="fixed top-6 right-6 z-50 space-y-3 max-w-md">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const colors = {
        success: "bg-green-500/90 border-green-400",
        error: "bg-red-500/90 border-red-400",
        info: "bg-purple-500/90 border-purple-400"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`${colors[toast.type]} backdrop-blur-md border rounded-2xl p-4 shadow-2xl flex items-center gap-3`}
        >
            {icons[toast.type]}
            <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-white/70 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
