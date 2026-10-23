import { certifications, education, languages } from "../data/credentials";
import { RevealText } from "../components/RevealText";

const heading = "text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.05] font-semibold tracking-[-0.045em]";

export function Credentials() {
  return (
    <section id="credentials" className="relative py-28 md:py-36">
      <div className="shell grid gap-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <RevealText as="h2" className={heading}>
            Education
          </RevealText>
          <ol className="mt-10 space-y-8">
            {education.map((e) => (
              <li key={e.institution} data-reveal className="border-t border-white/10 pt-6">
                <div className="label flex justify-between gap-4">
                  <span>{e.period}</span>
                  {e.detail && <span className="text-heat">{e.detail}</span>}
                </div>
                <h3 className="mt-3 text-xl leading-snug font-medium tracking-[-0.02em]">{e.degree}</h3>
                <p className="mt-1.5 text-fog-400">{e.institution}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <RevealText as="h2" className={heading}>
            Certifications
          </RevealText>
          <ul className="mt-10 space-y-6">
            {certifications.map((c) => (
              <li key={c.name} data-reveal className="flex items-start justify-between gap-6 border-t border-white/10 pt-6">
                <div>
                  <h3 className="text-lg leading-snug font-medium tracking-[-0.02em]">{c.name}</h3>
                  <p className="mt-1.5 text-fog-400">{c.issuer}</p>
                </div>
                {c.year && <span className="label shrink-0 pt-1">{c.year}</span>}
              </li>
            ))}
          </ul>

          <h3 className="label mt-16">Languages</h3>
          <ul data-reveal className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {languages.map((l) => (
              <li key={l.name} className="flex items-baseline justify-between gap-4 py-4">
                <span className="text-lg">
                  {l.name}
                  {l.native && (
                    <span lang={l.name === "Japanese" ? "ja" : "hi"} className="ml-3 text-fog-400">
                      {l.native}
                    </span>
                  )}
                </span>
                {l.level && <span className="label text-heat">{l.level}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
