import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { reducedMotion } from "../lib/env";
import { useLang } from "../i18n/lang";
import type { Metric } from "../data/projects";

const format = (m: Metric, v: number | string) => `${m.prefix ?? ""}${v}${m.suffix ?? ""}`;

/** Renders the final value in markup, then counts up from zero the first time it scrolls into view. */
export function Counter({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { tr } = useLang();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion || typeof metric.value !== "number") return;
      const target = metric.value;
      const state = { v: 0 };
      el.textContent = format(metric, 0);
      gsap.to(state, {
        v: target,
        duration: 1.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: () => {
          el.textContent = format(metric, Math.round(state.v));
        },
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className="tabular">
      {format(metric, typeof metric.value === "number" ? metric.value : tr(metric.value))}
    </span>
  );
}
