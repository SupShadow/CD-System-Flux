import { useEffect, useRef } from "react";

type EventTarget = Window | Document | HTMLElement | MediaQueryList | null;

/**
 * Custom hook for adding event listeners with automatic cleanup
 * Prevents memory leaks from improperly cleaned up listeners
 *
 * @param eventName - Name of the event to listen for
 * @param handler - Event handler function
 * @param element - Target element (defaults to window)
 * @param options - Event listener options
 */
export function useEventListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void,
    element?: Window | null,
    options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (event: DocumentEventMap[K]) => void,
    element: Document | null,
    options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof HTMLElementEventMap>(
    eventName: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    element: HTMLElement | null,
    options?: boolean | AddEventListenerOptions
): void;

export function useEventListener(
    eventName: string,
    handler: (event: Event) => void,
    element: EventTarget = typeof window !== "undefined" ? window : null,
    options?: boolean | AddEventListenerOptions
): void {
    // Keep handler in ref to avoid re-registering on every render
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!element?.addEventListener) return;

        const eventListener = (event: Event) => {
            handlerRef.current(event);
        };

        element.addEventListener(eventName, eventListener, options);

        return () => {
            element.removeEventListener(eventName, eventListener, options);
        };
    }, [eventName, element, options]);
}

/**
 * Hook for listening to window resize events with optional debouncing
 *
 * @param handler - Callback for resize events
 * @param debounceMs - Optional debounce delay in milliseconds
 */
export function useWindowResize(
    handler: (width: number, height: number) => void,
    debounceMs: number = 0
): void {
    const handlerRef = useRef(handler);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleResize = () => {
            if (debounceMs > 0) {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    handlerRef.current(window.innerWidth, window.innerHeight);
                }, debounceMs);
            } else {
                handlerRef.current(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener("resize", handleResize);

        // Call handler immediately with current dimensions
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [debounceMs]);
}

/**
 * Hook for listening to keyboard events
 *
 * @param key - Key to listen for (e.g., "Escape", "Enter")
 * @param handler - Callback when key is pressed
 * @param options - Additional options
 */
export function useKeyPress(
    key: string,
    handler: (event: KeyboardEvent) => void,
    options: {
        target?: EventTarget;
        eventType?: "keydown" | "keyup" | "keypress";
        enabled?: boolean;
    } = {}
): void {
    const { target = typeof window !== "undefined" ? window : null, eventType = "keydown", enabled = true } = options;

    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!enabled || !target?.addEventListener) return;

        const listener = (event: Event) => {
            const keyEvent = event as KeyboardEvent;
            if (keyEvent.key === key) {
                handlerRef.current(keyEvent);
            }
        };

        target.addEventListener(eventType, listener as EventListener);

        return () => {
            target.removeEventListener(eventType, listener as EventListener);
        };
    }, [key, target, eventType, enabled]);
}

/**
 * Hook for detecting clicks outside an element
 *
 * @param ref - Ref to the element
 * @param handler - Callback when clicking outside
 */
export function useClickOutside<T extends HTMLElement>(
    ref: React.RefObject<T | null>,
    handler: (event: MouseEvent | TouchEvent) => void
): void {
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            if (!ref.current || ref.current.contains(target)) {
                return;
            }
            handlerRef.current(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref]);
}
