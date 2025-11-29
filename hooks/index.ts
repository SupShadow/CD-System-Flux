export { usePageVisibility } from "./usePageVisibility";
export { useIsMobile } from "./useIsMobile";
export { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from "./useKeyboardShortcuts";
export { useBeatDetection } from "./useBeatDetection";
export type { BeatState } from "./useBeatDetection";
export { useScrollPosition } from "./useScrollPosition";

// Animation and timer utilities
export { useAnimationLoop, useInterval, useThrottledCallback } from "./useAnimationLoop";
export { useEventListener, useWindowResize, useKeyPress, useClickOutside } from "./useEventListener";

// Android-specific hooks
export { useDeviceInfo, useIsAndroid, useIsLowEndDevice } from "./useDeviceInfo";
export type { DeviceInfo } from "./useDeviceInfo";
export { useHapticFeedback } from "./useHapticFeedback";
export type { HapticPattern, HapticFeedback } from "./useHapticFeedback";
export { useAndroidBackButton, usePreventAccidentalBack } from "./useAndroidBackButton";
export type { AndroidBackButtonOptions } from "./useAndroidBackButton";

// Performance optimizations
export { usePerformanceOptimizations, usePerformanceSetting } from "./usePerformanceOptimizations";
export type { PerformanceSettings, PerformanceLevel, PerformanceOptimizations } from "./usePerformanceOptimizations";
