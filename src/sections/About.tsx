import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { reducedMotion } from "../lib/env";
import { facts } from "../data/profile";

export function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const p = root.current?.querySelector<HTMLElement>("[data-manifesto]");
      if (!p || reducedMotion) return;
      // Words brighten in step with the scroll, so the paragraph reads at the pace you move.
      const split = SplitText.create(p, { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 55%", scrub: 0.6 },
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} data-formation data-nav="about" className="relative py-36 md:py-56">
      <h2 className="sr-only">About</h2>
      <div className="shell">
        <p
          data-manifesto
          className="max-w-[24ch] text-[clamp(1.9rem,4.6vw,4.3rem)] leading-[1.08] font-medium tracking-[-0.04em] text-pretty md:max-w-[28ch]"
        >
          I'm a computer science engineer specialising in AI and machine learning. The part I love is when a model
          leaves the notebook and has to <span className="text-heat">survive the real world</span>: a drone
          searching debris with no internet, a chiller plant run from a browser, an invoice nobody has to retype.
        </p>
        <dl data-reveal className="mt-20 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/10 pt-8 md:mt-28 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="label">{f.label}</dt>
              <dd className="mt-3 text-lg text-fog-100">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
