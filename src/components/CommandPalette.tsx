import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUpIcon,
  BriefcaseIcon,
  CopyIcon,
  CubeIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
  StackSimpleIcon,
  TranslateIcon,
  UserIcon,
  type Icon,
} from "@phosphor-icons/react";
import { gsap } from "../lib/gsap";
import { reducedMotion } from "../lib/env";
import { lockScroll, scrollToTarget } from "../lib/scroll";
import { copyText } from "../lib/toast";
import { profile } from "../data/profile";
import { useLang } from "../i18n/lang";

interface Action {
  id: string;
  group: "go" | "contact" | "links" | "language";
  label: string;
  keywords?: string;
  icon: Icon;
  run: () => void;
}

function download(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = "";
  a.click();
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { lang, setLang, t } = useLang();
  const a = t.palette.actions;

  // Keywords carry both languages so either works in the search box.
  const actions = useMemo<Action[]>(
    () => [
      { id: "about", group: "go", label: a.about, keywords: "about プロフィール", icon: UserIcon, run: () => scrollToTarget("#about") },
      { id: "work", group: "go", label: a.work, keywords: "work projects drone 実績 プロジェクト", icon: CubeIcon, run: () => scrollToTarget("#work") },
      { id: "experience", group: "go", label: a.experience, keywords: "experience l&t internship 経歴 インターン", icon: BriefcaseIcon, run: () => scrollToTarget("#experience") },
      { id: "stack", group: "go", label: a.stack, keywords: "stack skills tools スキル 技術", icon: StackSimpleIcon, run: () => scrollToTarget("#stack") },
      { id: "contact", group: "go", label: a.contact, keywords: "contact お問い合わせ 連絡", icon: PaperPlaneTiltIcon, run: () => scrollToTarget("#contact") },
      { id: "top", group: "go", label: a.top, keywords: "home top トップ", icon: ArrowUpIcon, run: () => scrollToTarget(0) },
      { id: "copy", group: "contact", label: a.copy, keywords: `email メール ${profile.email}`, icon: CopyIcon, run: () => void copyText(profile.email, t.toast.emailCopied, t.toast.copyFailed) },
      { id: "mail", group: "contact", label: a.mail, keywords: "email mail メール", icon: EnvelopeSimpleIcon, run: () => (window.location.href = `mailto:${profile.email}`) },
      { id: "resume", group: "contact", label: a.resume, keywords: "cv resume pdf レジュメ 履歴書", icon: DownloadSimpleIcon, run: () => download(profile.resume) },
      { id: "github", group: "links", label: a.github, keywords: "github code コード", icon: GithubLogoIcon, run: () => window.open(profile.github, "_blank", "noopener") },
      { id: "linkedin", group: "links", label: a.linkedin, keywords: "linkedin", icon: LinkedinLogoIcon, run: () => window.open(profile.linkedin, "_blank", "noopener") },
      { id: "lang", group: "language", label: a.lang, keywords: "language japanese english 日本語 英語 言語", icon: TranslateIcon, run: () => setLang(lang === "en" ? "ja" : "en") },
    ],
    [a, t, lang, setLang],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((action) => `${action.label} ${action.keywords ?? ""}`.toLowerCase().includes(q));
  }, [actions, query]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setIndex(0);
    lockScroll(true);
    input.current?.focus();
    if (!reducedMotion)
      gsap.fromTo(panel.current, { autoAlpha: 0, y: -14, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "expo.out" });
    return () => {
      lockScroll(false);
      returnFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  if (!open) return null;

  const run = (action: Action | undefined) => {
    if (!action) return;
    onClose();
    // Let the scroll lock release before navigating.
    requestAnimationFrame(() => action.run());
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[index]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[14vh]" onKeyDown={onKey}>
      <button type="button" aria-label={t.palette.close} onClick={onClose} className="absolute inset-0 cursor-default bg-ink-950/60 backdrop-blur-sm" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t.palette.label}
        className="glass relative w-full max-w-[560px] overflow-hidden rounded-2xl"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-5">
          <MagnifyingGlassIcon size={18} className="text-fog-400" />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.palette.search}
            aria-label={t.palette.search}
            aria-controls="palette-results"
            aria-activedescendant={results[index] ? `palette-${results[index].id}` : undefined}
            className="h-14 flex-1 bg-transparent text-[15px] text-fog-100 outline-none placeholder:text-fog-400"
          />
          <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-fog-400">Esc</kbd>
        </div>
        <ul id="palette-results" role="listbox" aria-label={t.palette.results} className="max-h-[52vh] overflow-y-auto p-2" data-lenis-prevent>
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-fog-400">{t.palette.empty}</li>}
          {results.map((action, i) => {
            const header = action.group !== lastGroup;
            lastGroup = action.group;
            const Icon = action.icon;
            return (
              <li key={action.id} role="presentation">
                {header && <p className="label px-3 pt-3 pb-2 text-[11px]">{t.palette.groups[action.group]}</p>}
                <button
                  id={`palette-${action.id}`}
                  type="button"
                  role="option"
                  aria-selected={i === index}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => run(action)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors ${
                    i === index ? "bg-white/[0.08] text-fog-100" : "text-fog-300"
                  }`}
                >
                  <Icon size={18} className={i === index ? "text-heat" : "text-fog-400"} />
                  {action.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
