import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { reducedMotion } from "../lib/env";
import { getLenis } from "../lib/scroll";
import { logos, stackGroups } from "../data/stack";
import { RevealText } from "../components/RevealText";
import { useLang } from "../i18n/lang";

/** Logo band whose speed and direction follow scroll velocity. */
function LogoMarquee() {
  const { t } = useLang();
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || reducedMotion) return;
    let x = 0;
    let dir = 1;
    const tick = (_time: number, deltaMs: number) => {
      const v = getLenis()?.velocity ?? 0;
      if (v > 0.5) dir = 1;
      else if (v < -0.5) dir = -1;
      const speed = 42 + Math.min(Math.abs(v) * 16, 520);
      const half = el.scrollWidth / 2;
      x -= dir * speed * (deltaMs / 1000);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div className="relative mt-16 overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <ul ref={track} lang="en" aria-label={t.stack.technologies} className="flex w-max items-center will-change-transform">
        {[...logos, ...logos].map((l, i) => (
          <li
            key={`${l.title}-${i}`}
            aria-hidden={i >= logos.length || undefined}
            className="flex items-center gap-3 pr-14 text-fog-400 transition-colors duration-300 hover:text-fog-100"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 fill-current">
              <path d={l.path} />
            </svg>
            <span className="text-lg font-medium tracking-[-0.02em] whitespace-nowrap">{l.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stack() {
  const { lang, t, tr } = useLang();

  return (
    <section id="stack" data-nav="stack" className="relative py-28 md:py-40">
      <div className="shell">
        <RevealText as="h2" className="text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.04] font-semibold tracking-[-0.05em]">
          {t.stack.heading}
        </RevealText>
        <p data-reveal className={`mt-5 text-fog-300 ${lang === "ja" ? "max-w-[28em]" : "max-w-[46ch]"}`}>
          {t.stack.sub}
        </p>
      </div>

      <LogoMarquee />

      <div className="shell mt-16">
        <div
          data-reveal
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.07] lg:grid-cols-5"
        >
          {stackGroups.map((g) => (
            <div key={g.title.en} className="bg-ink-950/92 p-5 backdrop-blur-sm last:col-span-2 md:p-7 lg:last:col-span-1">
              <h3 className="label text-heat">{tr(g.title)}</h3>
              <ul className="mt-5 space-y-2.5">
                {g.items.map((item) => (
                  <li key={tr(item)} className="text-fog-200">
                    {tr(item)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
