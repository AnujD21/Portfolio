const mq = (query: string) =>
  typeof window !== "undefined" && window.matchMedia(query).matches;

/** Read once at boot. Motion-heavy features check these instead of re-querying. */
export const reducedMotion = mq("(prefers-reduced-motion: reduce)");
export const coarsePointer = mq("(hover: none), (pointer: coarse)");

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
