import { experience } from "../data/experience";
import { useLang } from "../i18n/lang";
import { RevealText } from "../components/RevealText";
import { Counter } from "../components/Counter";

export function Experience() {
  const { lang, t, tr } = useLang();

  return (
    <section id="experience" data-formation data-nav="experience" className="relative py-28 md:py-40">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <RevealText as="h2" className="text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.04] font-semibold tracking-[-0.05em]">
              {t.experience.heading}
            </RevealText>
            <p data-reveal className={`mt-5 text-fog-300 ${lang === "ja" ? "max-w-[20em]" : "max-w-[32ch]"}`}>
              {t.experience.sub}
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          {experience.map((e) => (
            <article key={e.org} data-reveal className="glass rounded-2xl p-6 md:p-10">
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-[clamp(1.6rem,2.6vw,2.25rem)] leading-tight font-semibold tracking-[-0.035em]">{tr(e.role)}</h3>
                  <p className="mt-1.5 text-fog-300">
                    {e.org}
                    {lang === "ja" ? "、" : ", "}
                    {tr(e.location)}
                  </p>
                </div>
                <span className="label pt-2">{tr(e.period)}</span>
              </header>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-white/10 py-8 md:grid-cols-4">
                {e.metrics.map((m) => (
                  <div key={m.label.en} className="flex flex-col-reverse justify-end gap-2">
                    <dt className="text-[13px] leading-snug text-fog-400">{tr(m.label)}</dt>
                    <dd
                      lang="en"
                      className="font-mono text-[clamp(1.8rem,3vw,2.6rem)] leading-none font-medium tracking-[-0.05em] text-heat"
                    >
                      <Counter metric={m} />
                    </dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-8 space-y-4">
                {e.points.map((pt) => (
                  <li key={pt.en} className="flex gap-3 leading-relaxed text-fog-200">
                    <span aria-hidden className="mt-[0.75em] h-px w-4 shrink-0 bg-heat" />
                    {tr(pt)}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-2">
                {e.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
