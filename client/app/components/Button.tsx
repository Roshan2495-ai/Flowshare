"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    icon?: ReactNode;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variants = {
        primary: "bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/20",
        secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 h-12 text-base",
        lg: "px-8 h-14 text-lg"
    };

    return (
        <motion.button
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : icon ? (
                icon
            ) : null}
            {children}
        </motion.button>
    );
}
