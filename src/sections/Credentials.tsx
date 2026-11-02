import { certifications, education, languages } from "../data/credentials";
import { useLang } from "../i18n/lang";
import { RevealText } from "../components/RevealText";

const heading = "text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.05] font-semibold tracking-[-0.045em]";

export function Credentials() {
  const { t, tr } = useLang();

  return (
    <section id="credentials" className="relative py-28 md:py-36">
      <div className="shell grid gap-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <RevealText as="h2" className={heading}>
            {t.credentials.education}
          </RevealText>
          <ol className="mt-10 space-y-8">
            {education.map((e) => (
              <li key={e.institution.en} data-reveal className="border-t border-white/10 pt-6">
                <div className="label flex justify-between gap-4">
                  <span>{tr(e.period)}</span>
                  {e.detail && <span className="text-heat">{e.detail}</span>}
                </div>
                <h3 className="mt-3 text-xl leading-snug font-medium tracking-[-0.02em]">{tr(e.degree)}</h3>
                <p className="mt-1.5 text-fog-400">{tr(e.institution)}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <RevealText as="h2" className={heading}>
            {t.credentials.certifications}
          </RevealText>
          <ul className="mt-10 space-y-6">
            {certifications.map((c) => (
              <li key={c.name.en} data-reveal className="flex items-start justify-between gap-6 border-t border-white/10 pt-6">
                <div>
                  <h3 className="text-lg leading-snug font-medium tracking-[-0.02em]">{tr(c.name)}</h3>
                  <p className="mt-1.5 text-fog-400">{tr(c.issuer)}</p>
                </div>
                {c.year && <span className="label shrink-0 pt-1">{c.year}</span>}
              </li>
            ))}
          </ul>

          <h3 className="label mt-16">{t.credentials.languages}</h3>
          <ul data-reveal className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {languages.map((l) => {
              const name = tr(l.name);
              return (
                <li key={l.name.en} className="flex items-baseline justify-between gap-4 py-4">
                  <span className="text-lg">
                    {name}
                    {l.native && l.native.text !== name && (
                      <span lang={l.native.lang} className="ml-3 text-fog-400">
                        {l.native.text}
                      </span>
                    )}
                  </span>
                  {l.level && (
                    <span lang="en" className="label text-heat">
                      {l.level}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
