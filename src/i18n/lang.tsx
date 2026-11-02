import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { jaModel, Parser } from "budoux";
import { ui, type UIStrings } from "./ui";

export type Lang = "en" | "ja";
/** A string written in both languages. */
export type Text = Record<Lang, string>;

const STORAGE_KEY = "ad:lang";
const JA_PATH = /^\/ja(\/|$)/;

/** URL wins (so /ja links always open in Japanese), then the visitor's last choice, then the browser language. */
function detectLang(): Lang {
  if (JA_PATH.test(location.pathname)) return "ja";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ja") return saved;
  } catch {
    // Storage can be blocked; fall through to the browser language.
  }
  return navigator.languages?.[0]?.toLowerCase().startsWith("ja") ? "ja" : "en";
}

function syncDocument(lang: Lang) {
  const t = ui[lang];
  document.documentElement.lang = lang;
  document.title = t.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
  const onJaPath = JA_PATH.test(location.pathname);
  if (onJaPath !== (lang === "ja")) history.replaceState(null, "", `${lang === "ja" ? "/ja" : "/"}${location.search}${location.hash}`);
}

/**
 * Switching language remounts the page content, so we remember which element sat at the top of
 * the viewport and restore it afterwards. Text lengths differ between languages, so a raw scrollY would drift.
 */
let pendingAnchor: { id: string; offset: number } | null = null;

function captureAnchor() {
  const line = 120;
  let spanning: typeof pendingAnchor = null;
  let below: typeof pendingAnchor = null;
  // Children follow their parents in document order, so the last element crossing the line is the most specific.
  for (const el of document.querySelectorAll<HTMLElement>("main [id]")) {
    const r = el.getBoundingClientRect();
    if (r.top <= line && r.bottom > line) spanning = { id: el.id, offset: r.top };
    else if (!below && r.top > line) below = { id: el.id, offset: r.top };
  }
  pendingAnchor = spanning ?? below;
}

export function takeAnchor() {
  const a = pendingAnchor;
  pendingAnchor = null;
  return a;
}

interface LangValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: UIStrings;
  tr: (value: Text | string) => string;
}

const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useLayoutEffect(() => syncDocument(lang), [lang]);

  const setLang = useCallback((next: Lang) => {
    captureAnchor();
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not persisted; the URL still carries the choice.
    }
    setLangState(next);
  }, []);

  const value = useMemo<LangValue>(
    () => ({ lang, setLang, t: ui[lang], tr: (v) => (typeof v === "string" ? v : v[lang]) }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

let phraseParser: Parser | null = null;

/**
 * Splits Japanese into phrases (BudouX, the model behind Chrome's word-break: auto-phrase) joined by
 * zero-width spaces, so the word-by-word reveal brightens whole phrases and lines never break mid-word.
 */
export function segmentJa(text: string) {
  phraseParser ??= new Parser(jaModel);
  return phraseParser.parse(text).join("\u200B");
}
