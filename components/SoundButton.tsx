"use client";

import { ReactNode, useCallback } from "react";
import { useSound } from "@/contexts/SoundContext";

interface SoundButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    as?: "button" | "div" | "a";
    href?: string;
    target?: string;
    rel?: string;
}

export default function SoundButton({
    children,
    className = "",
    onClick,
    disabled = false,
    as = "button",
    href,
    target,
    rel,
}: SoundButtonProps) {
    const { playSound } = useSound();

    const handleMouseEnter = useCallback(() => {
        if (!disabled) {
            playSound("hover");
        }
    }, [disabled, playSound]);

    const handleClick = useCallback(() => {
        if (!disabled) {
            playSound("click");
            onClick?.();
        }
    }, [disabled, onClick, playSound]);

    const Component = as;

    if (as === "a") {
        return (
            <a
                href={href}
                target={target}
                rel={rel}
                className={className}
                onMouseEnter={handleMouseEnter}
                onClick={handleClick}
            >
                {children}
            </a>
        );
    }

    return (
        <Component
            className={className}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            disabled={disabled}
        >
            {children}
        </Component>
    );
}
