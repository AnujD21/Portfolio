import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { reducedMotion } from "../lib/env";

interface Props {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  /** "chars" rises letter by letter; "lines" slides each line up from behind a mask. */
  mode?: "lines" | "chars";
  /** Omit to trigger on scroll. Pass a boolean to hold the reveal until it turns true. */
  play?: boolean;
}

export function RevealText({ as: Tag = "h2", children, className, id, delay = 0, mode = "lines", play }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion) return;
      if (play === false) {
        gsap.set(el, { autoAlpha: 0 });
        return;
      }
      gsap.set(el, { autoAlpha: 1 });
      const split = SplitText.create(el, {
        type: mode === "chars" ? "lines,chars" : "lines",
        mask: "lines",
      });
      gsap.from(mode === "chars" ? split.chars : split.lines, {
        yPercent: 118,
        duration: mode === "chars" ? 1.4 : 1.15,
        ease: "expo.out",
        stagger: mode === "chars" ? 0.05 : 0.09,
        delay,
        scrollTrigger: play === undefined ? { trigger: el, start: "top 88%", once: true } : undefined,
        // Unwrap the masks afterwards so descenders are never clipped and resizes reflow naturally.
        onComplete: () => split.revert(),
      });
    },
    { dependencies: [play], scope: ref, revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
