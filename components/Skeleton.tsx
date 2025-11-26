"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
    animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
    className,
    variant = "rectangular",
    width,
    height,
    animation = "pulse",
}: SkeletonProps) {
    const baseStyles = "bg-stark/10 relative overflow-hidden";

    const variantStyles = {
        text: "rounded",
        circular: "rounded-full",
        rectangular: "",
    };

    const animationStyles = {
        pulse: "animate-pulse",
        wave: "skeleton-wave",
        none: "",
    };

    const style: React.CSSProperties = {
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
    };

    return (
        <div
            className={cn(
                baseStyles,
                variantStyles[variant],
                animationStyles[animation],
                className
            )}
            style={style}
        />
    );
}

// Pre-built skeleton patterns
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className="h-4"
                    width={i === lines - 1 ? "60%" : "100%"}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("border border-stark/10 p-6 space-y-4", className)}>
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="h-4 w-3/4" />
                    <Skeleton variant="text" className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-32 w-full" />
            <SkeletonText lines={2} />
        </div>
    );
}

export function SkeletonPlayer({ className }: { className?: string }) {
    return (
        <div className={cn("fixed bottom-0 left-0 right-0 bg-void-deep border-t border-signal/30 p-4", className)}>
            <div className="flex items-center gap-4">
                {/* Album art */}
                <Skeleton className="w-12 h-12 shrink-0" />

                {/* Track info */}
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="h-4 w-32" />
                    <Skeleton variant="text" className="h-3 w-24" />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="circular" width={32} height={32} />
                </div>
            </div>

            {/* Progress bar */}
            <Skeleton className="h-1 w-full mt-3" />
        </div>
    );
}

export function SkeletonSingleLaunch({ className }: { className?: string }) {
    return (
        <div className={cn("w-full max-w-2xl border border-signal/30 bg-void-deep/50", className)}>
            {/* Header */}
            <div className="p-4 border-b border-stark/10 flex items-center gap-2">
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" className="h-4 w-40" />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Artwork */}
                <Skeleton className="w-full md:w-48 aspect-square shrink-0" />

                {/* Info */}
                <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                        <Skeleton variant="text" className="h-3 w-24" />
                        <Skeleton variant="text" className="h-8 w-full" />
                        <Skeleton variant="text" className="h-4 w-32" />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Skeleton className="h-10 w-28" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SkeletonHero({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col items-center text-center gap-8", className)}>
            <Skeleton className="w-48 h-48" />
            <div className="space-y-4">
                <Skeleton variant="text" className="h-16 w-80 mx-auto" />
                <Skeleton variant="text" className="h-4 w-48 mx-auto" />
            </div>
            <Skeleton className="h-20 w-64" />
        </div>
    );
}
