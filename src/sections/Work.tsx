import { useRef, useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { ScrollTrigger, useGSAP, gsap } from "../lib/gsap";
import { scrollToTarget } from "../lib/scroll";
import { featured, type Project } from "../data/projects";
import { RevealText } from "../components/RevealText";
import { Counter } from "../components/Counter";
import { ClipImage } from "../components/ClipImage";
import { Roll } from "../components/Roll";
import { useLang } from "../i18n/lang";

function ProjectBlock({ project: p }: { project: Project }) {
  const { t, tr } = useLang();
  // Names that read the same in both languages keep Latin typography on the Japanese page.
  const latinTitle = p.title.en === p.title.ja;
  return (
    <article
      id={p.slug}
      data-formation
      data-project
      aria-labelledby={`${p.slug}-title`}
      className="relative flex min-h-[100dvh] items-start pt-[46svh] pb-20 md:items-center md:py-32"
    >
      {/* Phones: the formation shows in the empty header band, then the text slides over it on an
          opaque sheet instead of mixing with the fixed particles behind it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[calc(46svh-7rem)] bottom-0 bg-[linear-gradient(to_bottom,transparent,var(--color-ink-950)_6rem)] md:hidden"
      />
      <div className="shell relative">
        <div className="max-w-[620px] md:w-[52%] lg:w-[45%]">
          <p data-reveal className="label flex flex-wrap gap-x-5 gap-y-1">
            <span className="text-heat">{p.year}</span>
            <span>{tr(p.context)}</span>
          </p>
          <RevealText
            as="h3"
            id={`${p.slug}-title`}
            lang={latinTitle ? "en" : undefined}
            className="mt-5 text-[clamp(2.6rem,5.4vw,5rem)] leading-[1.02] font-semibold tracking-[-0.05em] text-balance"
          >
            {tr(p.title)}
          </RevealText>
          {p.kicker && (
            <p data-reveal lang="ja" className="mt-3 text-lg text-fog-400">
              {p.kicker}
            </p>
          )}
          <p data-reveal className="mt-6 text-[17px] leading-relaxed text-pretty text-fog-300">
            {tr(p.summary)}
          </p>

          <dl data-reveal className="mt-10 grid grid-cols-3 gap-5 border-t border-white/10 pt-6">
            {p.metrics.map((m) => (
              <div key={m.label.en} className="flex flex-col-reverse justify-end gap-2">
                <dt className="text-[13px] leading-snug text-fog-400">{tr(m.label)}</dt>
                <dd
                  lang={typeof m.value === "number" ? "en" : undefined}
                  className="font-mono text-[clamp(1.5rem,2.5vw,2.3rem)] leading-none font-medium tracking-[-0.05em] text-fog-100">
                  <Counter metric={m} />
                </dd>
              </div>
            ))}
          </dl>

          <ul data-reveal className="mt-8 space-y-3">
            {p.points.map((pt) => (
              <li key={pt.en} className="flex gap-3 text-[15px] leading-relaxed text-fog-300">
                <span aria-hidden className="mt-[0.75em] h-px w-4 shrink-0 bg-heat" />
                {tr(pt)}
              </li>
            ))}
          </ul>

          {p.media && (
            <figure className="mt-10">
              <div className="grid grid-cols-2 gap-3">
                {p.media.map((m) => (
                  <ClipImage
                    key={m.src}
                    src={m.src}
                    alt={tr(m.alt)}
                    className="group aspect-video rounded-2xl border border-white/10 bg-ink-900"
                    imgClassName="transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.05]"
                  />
                ))}
              </div>
              {p.mediaCaption && <figcaption className="mt-3 text-[13px] text-fog-400">{tr(p.mediaCaption)}</figcaption>}
            </figure>
          )}

          <div data-reveal className="mt-8 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>

          {(p.github || p.live) && (
            <div data-reveal className="mt-8 flex flex-wrap gap-3">
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className="group btn-primary h-11 px-5 text-sm">
                  <Roll>{t.work.liveDemo}</Roll>
                  <ArrowUpRightIcon size={15} weight="bold" />
                </a>
              )}
              {p.github && (
                <a href={p.github} target="_blank" rel="noreferrer" className="group btn-ghost h-11 px-5 text-sm">
                  <Roll>{t.work.viewCode}</Roll>
                  <ArrowUpRightIcon size={15} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function Work() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { lang, t, tr } = useLang();

  useGSAP(
    () => {
      const blocks = gsap.utils.toArray<HTMLElement>("[data-project]", root.current);
      blocks.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
      // The rail only shows while a project is on screen.
      ScrollTrigger.create({
        trigger: blocks[0],
        endTrigger: blocks[blocks.length - 1],
        start: "top 60%",
        end: "bottom 40%",
        onToggle: (self) => gsap.to(rail.current, { autoAlpha: self.isActive ? 1 : 0, duration: 0.5 }),
      });
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} data-nav="work" className="relative">
      <div className="shell pt-24 md:pt-36">
        <RevealText
          as="h2"
          className={`leading-[1.02] font-semibold tracking-[-0.065em] ${
            lang === "ja" ? "text-[clamp(2.8rem,8vw,7.5rem)]" : "text-[clamp(3.3rem,10.5vw,10rem)]"
          }`}
        >
          {t.work.heading}
        </RevealText>
        <p data-reveal className={`mt-6 text-lg text-fog-300 ${lang === "ja" ? "max-w-[30em]" : "max-w-[44ch]"}`}>
          {t.work.sub}
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-5 hidden md:right-10 xl:block">
          <div ref={rail} className="glass pointer-events-auto invisible sticky top-[calc(100dvh-232px)] w-[248px] rounded-2xl px-4 py-3">
            <ol aria-label={t.work.rail} className="flex flex-col items-end gap-0.5">
              {featured.map((p, i) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => scrollToTarget(`#${p.slug}`)}
                    aria-current={active === i ? "true" : undefined}
                    className="group flex items-center gap-3 py-1.5 text-[13px]"
                  >
                    <span
                      className={`transition-colors duration-500 ${active === i ? "text-fog-100" : "text-fog-500 group-hover:text-fog-300"}`}
                    >
                      {tr(p.title)}
                    </span>
                    <span
                      aria-hidden
                      className={`h-px transition-all duration-500 ease-(--ease-out-expo) ${active === i ? "w-8 bg-heat" : "w-4 bg-fog-500"}`}
                    />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
        {featured.map((p) => (
          <ProjectBlock key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}
