import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "../lib/gsap";
import { coarsePointer, reducedMotion } from "../lib/env";

/** Pulls its child toward the cursor. The wrapper stays put so its bounds remain a stable reference. */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const inner = el?.firstElementChild as HTMLElement | null;
    if (!el || !inner || coarsePointer || reducedMotion) return;
    const xTo = gsap.quickTo(inner, "x", { duration: 0.9, ease: "elastic.out(1, 0.35)" });
    const yTo = gsap.quickTo(inner, "y", { duration: 0.9, ease: "elastic.out(1, 0.35)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(inner);
    };
  }, [strength]);

  return (
    <span ref={wrap} className="inline-block">
      {children}
    </span>
  );
}
