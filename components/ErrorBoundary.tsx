"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-void-deep border border-signal/30 text-center">
                    <AlertTriangle className="w-12 h-12 text-signal mb-4" />
                    <h2 className="text-xl font-bold text-signal mb-2 glitch-text" data-text="SYSTEM_ERROR">
                        SYSTEM_ERROR
                    </h2>
                    <p className="font-mono text-xs text-stark/50 mb-4 max-w-md">
                        {this.state.error?.message || "An unexpected error occurred"}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-signal/10 border border-signal/50 text-signal font-mono text-sm hover:bg-signal/20 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        RETRY
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Compact error fallback for smaller components
export function CompactErrorFallback({ onRetry }: { onRetry?: () => void }) {
    return (
        <div className="flex items-center gap-2 p-2 bg-signal/10 border border-signal/30 text-signal font-mono text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>ERROR</span>
            {onRetry && (
                <button onClick={onRetry} className="ml-auto hover:underline">
                    RETRY
                </button>
            )}
        </div>
    );
}
