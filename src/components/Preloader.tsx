import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { reducedMotion } from "../lib/env";
import { profile } from "../data/profile";

const VISITED_KEY = "ad:visited";

function isReturnVisit() {
  try {
    const seen = sessionStorage.getItem(VISITED_KEY) === "1";
    sessionStorage.setItem(VISITED_KEY, "1");
    return seen;
  } catch {
    return false;
  }
}

/**
 * Counts to 100 against real work (fonts, WebGL scene), never faster than a short minimum,
 * then lifts like a curtain. onReveal fires as the curtain starts to move.
 */
export function Preloader({ tasks, onReveal }: { tasks: Promise<unknown>[]; onReveal: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);
  const revealRef = useRef(onReveal);
  revealRef.current = onReveal;

  useEffect(() => {
    let done = 0;
    let finished = false;
    tasks.forEach((t) => t.finally(() => done++));
    const minMs = reducedMotion ? 0 : isReturnVisit() ? 500 : 1500;
    const start = performance.now();
    let shown = 0;

    const exit = () => {
      if (reducedMotion) {
        revealRef.current();
        setGone(true);
        return;
      }
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to(inner.current, { yPercent: -40, autoAlpha: 0, duration: 0.55, ease: "power3.in" })
        .call(() => revealRef.current(), [], 0.35)
        .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, 0.3);
    };

    const tick = () => {
      const timeCap = minMs ? Math.min(1, (performance.now() - start) / minMs) : 1;
      const target = Math.min(done / tasks.length, timeCap) * 100;
      shown += (target - shown) * 0.14;
      if (target - shown < 0.4) shown = target;
      if (count.current) count.current.textContent = String(Math.round(shown)).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`;
      if (shown >= 100 && !finished) {
        finished = true;
        gsap.ticker.remove(tick);
        exit();
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [tasks]);

  if (gone) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[80] bg-ink-950"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div ref={inner} className="flex h-full flex-col justify-between p-5 md:p-10">
        <div className="flex items-start justify-between">
          <span className="text-lg font-medium tracking-[-0.02em]">{profile.name}</span>
          <span className="label">{profile.role}</span>
        </div>
        <div className="flex items-end justify-between gap-8">
          <span
            ref={count}
            className="font-mono text-[clamp(4.5rem,15vw,12rem)] leading-[0.8] font-medium tracking-[-0.06em] text-fog-100 tabular"
          >
            000
          </span>
          <div className="mb-3 w-[38%] max-w-[360px]">
            <span className="label">Assembling scene</span>
            <span className="mt-3 block h-px w-full bg-white/10">
              <span ref={bar} className="block h-full origin-left scale-x-0 bg-heat" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
