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
  UserIcon,
  type Icon,
} from "@phosphor-icons/react";
import { gsap } from "../lib/gsap";
import { reducedMotion } from "../lib/env";
import { lockScroll, scrollToTarget } from "../lib/scroll";
import { copyText } from "../lib/toast";
import { profile } from "../data/profile";

interface Action {
  id: string;
  group: "Go to" | "Contact" | "Links";
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

  const actions = useMemo<Action[]>(
    () => [
      { id: "about", group: "Go to", label: "About", icon: UserIcon, run: () => scrollToTarget("#about") },
      { id: "work", group: "Go to", label: "Selected work", keywords: "projects drone", icon: CubeIcon, run: () => scrollToTarget("#work") },
      { id: "experience", group: "Go to", label: "Experience", keywords: "l&t internship", icon: BriefcaseIcon, run: () => scrollToTarget("#experience") },
      { id: "stack", group: "Go to", label: "Stack", keywords: "skills tools", icon: StackSimpleIcon, run: () => scrollToTarget("#stack") },
      { id: "contact", group: "Go to", label: "Contact", icon: PaperPlaneTiltIcon, run: () => scrollToTarget("#contact") },
      { id: "top", group: "Go to", label: "Back to top", keywords: "home", icon: ArrowUpIcon, run: () => scrollToTarget(0) },
      { id: "copy", group: "Contact", label: "Copy email address", keywords: profile.email, icon: CopyIcon, run: () => void copyText(profile.email, "Email copied") },
      { id: "mail", group: "Contact", label: "Write an email", keywords: "mail", icon: EnvelopeSimpleIcon, run: () => (window.location.href = `mailto:${profile.email}`) },
      { id: "resume", group: "Contact", label: "Download résumé", keywords: "cv resume pdf", icon: DownloadSimpleIcon, run: () => download(profile.resume) },
      { id: "github", group: "Links", label: "Open GitHub", icon: GithubLogoIcon, run: () => window.open(profile.github, "_blank", "noopener") },
      { id: "linkedin", group: "Links", label: "Open LinkedIn", icon: LinkedinLogoIcon, run: () => window.open(profile.linkedin, "_blank", "noopener") },
    ],
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => `${a.label} ${a.group} ${a.keywords ?? ""}`.toLowerCase().includes(q));
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

  const run = (a: Action | undefined) => {
    if (!a) return;
    onClose();
    // Let the scroll lock release before navigating.
    requestAnimationFrame(() => a.run());
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
      <button type="button" aria-label="Close command menu" onClick={onClose} className="absolute inset-0 cursor-default bg-ink-950/60 backdrop-blur-sm" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="glass relative w-full max-w-[560px] overflow-hidden rounded-2xl"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-5">
          <MagnifyingGlassIcon size={18} className="text-fog-400" />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions"
            aria-label="Search actions"
            aria-controls="palette-results"
            aria-activedescendant={results[index] ? `palette-${results[index].id}` : undefined}
            className="h-14 flex-1 bg-transparent text-[15px] text-fog-100 outline-none placeholder:text-fog-400"
          />
          <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-fog-400">Esc</kbd>
        </div>
        <ul id="palette-results" role="listbox" aria-label="Actions" className="max-h-[52vh] overflow-y-auto p-2" data-lenis-prevent>
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-fog-400">No matching actions. Try “email” or “work”.</li>}
          {results.map((a, i) => {
            const header = a.group !== lastGroup;
            lastGroup = a.group;
            const Icon = a.icon;
            return (
              <li key={a.id} role="presentation">
                {header && <p className="label px-3 pt-3 pb-2 text-[11px]">{a.group}</p>}
                <button
                  id={`palette-${a.id}`}
                  type="button"
                  role="option"
                  aria-selected={i === index}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => run(a)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors ${
                    i === index ? "bg-white/[0.08] text-fog-100" : "text-fog-300"
                  }`}
                >
                  <Icon size={18} className={i === index ? "text-heat" : "text-fog-400"} />
                  {a.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
