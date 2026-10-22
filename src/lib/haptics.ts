/**
 * Safe, resilient tactile feedback helper for Mobile Web, PWA, and Capacitor.
 * Provides micro-haptics on button clicks, tab switches, and living orb interactions.
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'error' = 'light'): void => {
  if (typeof window === 'undefined') return;

  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      switch (type) {
        case 'light':
          navigator.vibrate(8);
          break;
        case 'medium':
          navigator.vibrate(18);
          break;
        case 'success':
          navigator.vibrate([12, 35, 18]);
          break;
        case 'error':
          navigator.vibrate([25, 40, 25]);
          break;
      }
    }
  } catch {
    // Silently continue if hardware does not support haptics
  }
};
