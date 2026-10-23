import { useRef } from "react";
import { ArrowDownIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { gsap, useGSAP } from "../lib/gsap";
import { reducedMotion } from "../lib/env";
import { scrollToTarget } from "../lib/scroll";
import { profile } from "../data/profile";
import { RevealText } from "../components/RevealText";
import { Magnetic } from "../components/Magnetic";
import { Roll } from "../components/Roll";

export function Hero({ play }: { play: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (reducedMotion) return;
      if (!play) {
        gsap.set(q("[data-hero]"), { autoAlpha: 0 });
        return;
      }
      gsap
        .timeline({ delay: 0.25 })
        .fromTo(q("[data-hero='eyebrow']"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0)
        .to(
          q("[data-hero='eyebrow'] [data-text]"),
          { duration: 1.4, scrambleText: { text: profile.availability, chars: "01", revealDelay: 0.35, speed: 0.6 } },
          0,
        )
        .fromTo(
          q("[data-hero='fade']"),
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 1.3, ease: "expo.out", stagger: 0.12 },
          0.35,
        );

      // Hero drifts apart as you scroll away from it.
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(q("[data-hero='name']"), { yPercent: -22, ease: "none", scrollTrigger: st });
      gsap.to(q("[data-hero='top']"), { y: -80, autoAlpha: 0, ease: "none", scrollTrigger: { ...st, end: "70% top" } });
    },
    { dependencies: [play], scope: root, revertOnUpdate: true },
  );

  return (
    <section id="top" ref={root} className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden pt-28 pb-4 md:pt-32 md:pb-6">
      <div data-hero="top" className="shell">
        <p data-hero="eyebrow" className="label flex items-center gap-2.5 text-fog-300">
          <span aria-hidden className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-heat opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-heat" />
          </span>
          <span data-text>{profile.availability}</span>
        </p>
        <p
          data-hero="fade"
          className="mt-7 max-w-[21ch] text-[clamp(1.7rem,3.3vw,2.9rem)] leading-[1.1] font-medium tracking-[-0.035em] text-balance"
        >
          I build vision, sensor-fusion and edge systems that keep working when the{" "}
          <span className="text-heat">network doesn't.</span>
        </p>
        <div data-hero="fade" className="mt-9 flex flex-wrap items-center gap-3">
          <Magnetic>
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget("#work");
              }}
              className="group btn-primary"
            >
              <Roll>View work</Roll>
              <ArrowDownIcon size={17} weight="bold" />
            </a>
          </Magnetic>
          <Magnetic>
            <a href={profile.resume} download className="group btn-ghost">
              <Roll>Résumé</Roll>
              <DownloadSimpleIcon size={17} />
            </a>
          </Magnetic>
        </div>
      </div>

      <div data-hero="name" className="shell">
        <RevealText
          as="h1"
          mode="chars"
          play={play}
          delay={0.15}
          className="text-[29vw] leading-[0.98] font-semibold tracking-[-0.068em] text-fog-100 md:text-[clamp(4.4rem,20.5vw,23rem)] md:leading-[1.02] md:whitespace-nowrap"
        >
          {profile.name}
        </RevealText>
      </div>
    </section>
  );
}
