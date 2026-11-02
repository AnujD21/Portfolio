import { ArrowUpIcon, ArrowUpRightIcon, CopyIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { profile } from "../data/profile";
import { copyText } from "../lib/toast";
import { scrollToTarget } from "../lib/scroll";
import { useLang } from "../i18n/lang";
import { RevealText } from "../components/RevealText";
import { Magnetic } from "../components/Magnetic";
import { Roll } from "../components/Roll";

export function Contact() {
  const { lang, t } = useLang();
  const copy = () => void copyText(profile.email, t.toast.emailCopied, t.toast.copyFailed);

  return (
    <section id="contact" data-formation className="relative flex min-h-[100dvh] flex-col">
      <div className="shell flex flex-1 flex-col items-center justify-center py-32 text-center">
        <RevealText
          as="h2"
          className={`leading-[1.02] font-semibold tracking-[-0.065em] text-balance ${
            lang === "ja" ? "text-[clamp(2.4rem,6.5vw,6.5rem)]" : "text-[clamp(3rem,9.5vw,9rem)]"
          }`}
        >
          {t.contact.heading}
        </RevealText>
        <p data-reveal className={`mt-6 text-lg text-fog-300 ${lang === "ja" ? "max-w-[24em]" : "max-w-[42ch]"}`}>
          {t.contact.sub}
        </p>

        <div data-reveal className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <Magnetic strength={0.15}>
            <a
              href={`mailto:${profile.email}`}
              lang="en"
              className="link-underline block pb-1 text-[clamp(1.35rem,3.6vw,2.8rem)] font-medium tracking-[-0.035em] text-fog-100 transition-colors hover:text-white-hot"
            >
              {profile.email}
            </a>
          </Magnetic>
          <button
            type="button"
            onClick={copy}
            aria-label={t.contact.copy}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/12 text-fog-300 transition-colors hover:border-heat hover:text-heat active:scale-95"
          >
            <CopyIcon size={18} />
          </button>
        </div>

        <div data-reveal className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="group btn-ghost">
            <Roll>LinkedIn</Roll>
            <ArrowUpRightIcon size={16} />
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="group btn-ghost">
            <Roll>GitHub</Roll>
            <ArrowUpRightIcon size={16} />
          </a>
          <a href={profile.resume} download className="group btn-ghost">
            <Roll>{t.hero.resume}</Roll>
            <DownloadSimpleIcon size={16} />
          </a>
        </div>
      </div>

      <footer className="shell flex flex-col gap-4 border-t border-white/[0.08] py-8 text-sm text-fog-400 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}
          <span lang="ja" className="ml-3 text-fog-500">
            {profile.nameJa}
          </span>
        </p>
        <p>{t.contact.builtWith}</p>
        <button
          type="button"
          onClick={() => scrollToTarget(0)}
          className="link-underline inline-flex items-center gap-2 self-start text-fog-300 hover:text-fog-100 md:self-auto"
        >
          {t.contact.backToTop} <ArrowUpIcon size={14} />
        </button>
      </footer>
    </section>
  );
}
