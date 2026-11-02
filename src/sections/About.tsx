import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "../lib/gsap";
import { reducedMotion } from "../lib/env";
import { facts, manifesto } from "../data/profile";
import { segmentJa, useLang } from "../i18n/lang";

export function About() {
  const root = useRef<HTMLElement>(null);
  const { lang, t, tr } = useLang();

  useGSAP(
    () => {
      const p = root.current?.querySelector<HTMLElement>("[data-manifesto]");
      if (!p || reducedMotion) return;
      // Words brighten in step with the scroll, so the paragraph reads at the pace you move.
      // Japanese has no spaces, so its words are marked with zero-width spaces when rendered.
      const split = SplitText.create(p, lang === "ja" ? { type: "words", wordDelimiter: "\u200B" } : { type: "words" });
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

  const text = (s: string) => (lang === "ja" ? segmentJa(s) : s);

  return (
    <section id="about" ref={root} data-formation data-nav="about" className="relative py-36 md:py-56">
      <h2 className="sr-only">{t.nav.about}</h2>
      <div className="shell">
        <p
          data-manifesto
          className={`text-[clamp(1.9rem,4.6vw,4.3rem)] leading-[1.08] font-medium tracking-[-0.04em] text-pretty ${
            lang === "ja" ? "max-w-[15em]" : "max-w-[24ch] md:max-w-[28ch]"
          }`}
        >
          {manifesto[lang].map((part) =>
            part.hl ? (
              <span key={part.text} className="text-heat">
                {text(part.text)}
              </span>
            ) : (
              text(part.text)
            ),
          )}
        </p>
        <dl
          data-reveal
          className={`mt-20 grid gap-x-8 gap-y-10 border-t border-white/10 pt-8 md:mt-28 lg:grid-cols-4 ${
            lang === "ja" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"
          }`}
        >
          {facts.map((f) => (
            <div key={f.label.en}>
              <dt className="label">{tr(f.label)}</dt>
              <dd className="mt-3 text-lg text-fog-100">{tr(f.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
