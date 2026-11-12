export type NavigationDirection = 'forward' | 'backward' | 'fade';

/**
 * Executes a state-updating navigation wrapped in the native View Transitions API
 * with directional types ('forward', 'backward', 'fade') and graceful progressive
 * enhancement fallback for all browsers.
 *
 * Grounded in Modern Web Guidance: directional-navigation-transitions & motion.
 */
export function transitionNavigate(
  updateDOM: () => void,
  direction: NavigationDirection = 'forward'
): void {
  const doc = document as any;

  // Feature detect native View Transitions API
  if (typeof doc === 'undefined' || !doc.startViewTransition) {
    updateDOM();
    return;
  }

  // Attempt directional view transition with types if supported (Chrome 125+, Safari 18.2+)
  try {
    doc.startViewTransition({
      update: updateDOM,
      types: [direction],
    });
  } catch {
    try {
      // Standard startViewTransition fallback (Chrome 111+, Firefox 144+)
      doc.startViewTransition(updateDOM);
    } catch {
      updateDOM();
    }
  }
}
