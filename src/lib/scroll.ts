import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { reducedMotion } from "./env";

let lenis: Lenis | null = null;

export function getLenis() {
  return lenis;
}

/** Smooth scrolling driven by GSAP's ticker so Lenis and ScrollTrigger share one frame loop. */
export function initSmoothScroll() {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  if (reducedMotion) return () => {};

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
  });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function scrollToTarget(target: string | number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { duration: immediate ? 0 : 1.6, immediate });
    return;
  }
  const top =
    typeof target === "number"
      ? target
      : (document.querySelector<HTMLElement>(target)?.getBoundingClientRect().top ?? 0) + window.scrollY;
  window.scrollTo({ top, behavior: immediate || reducedMotion ? "auto" : "smooth" });
}
