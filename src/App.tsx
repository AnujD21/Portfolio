import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "./lib/gsap";
import { hasWebGL, reducedMotion } from "./lib/env";
import { initSmoothScroll, lockScroll, scrollToTarget } from "./lib/scroll";
import { SCENE_READY_EVENT, sceneState } from "./lib/sceneState";
import { Preloader } from "./components/Preloader";
import { Nav } from "./components/Nav";
import { CommandPalette } from "./components/CommandPalette";
import { Toaster } from "./components/Toaster";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Work } from "./sections/Work";
import { Experience } from "./sections/Experience";
import { Stack } from "./sections/Stack";
import { Credentials } from "./sections/Credentials";
import { Contact } from "./sections/Contact";
import { formationConfigs } from "./three/formations";
import { takeAnchor, useLang, type Lang } from "./i18n/lang";

const ParticleField = lazy(() => import("./three/ParticleField"));

function loadFonts(lang: Lang) {
  return Promise.all([
    document.fonts.load('500 1em "Geist Variable"'),
    document.fonts.load('400 1em "Geist Mono Variable"'),
    // Only the Japanese subsets this text touches are fetched; the rest load on demand.
    lang === "ja" ? document.fonts.load('500 1em "Noto Sans JP Variable"', "日本語のポートフォリオ") : null,
  ]).catch(() => undefined);
}

export default function App() {
  const webgl = useMemo(hasWebGL, []);
  const [booted, setBooted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { lang, t } = useLang();
  const bootLang = useRef(lang);

  const tasks = useMemo(() => {
    const fonts = loadFonts(bootLang.current);
    const scene = new Promise<void>((resolve) => {
      if (!webgl || sceneState.ready) return resolve();
      window.addEventListener(SCENE_READY_EVENT, () => resolve(), { once: true });
      window.setTimeout(resolve, 7000);
    });
    return [fonts, scene];
  }, [webgl]);

  useEffect(() => {
    if (!reducedMotion) document.documentElement.classList.add("motion-ok");
    const stop = initSmoothScroll();
    lockScroll(true);
    void tasks[0].then(() => setBooted(true));
    return stop;
  }, [tasks]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onReveal = useCallback(() => {
    setRevealed(true);
    lockScroll(false);
    gsap.to(sceneState, { intro: 1, duration: reducedMotion ? 0 : 2.8, ease: "power2.out" });
    ScrollTrigger.refresh();
  }, []);

  useGSAP(
    () => {
      if (!booted) return;

      // Each [data-formation] section advances the 3D scene by one formation as it scrolls in.
      // Windows never overlap, so the sum of their progress is the continuous formation index.
      const markers = gsap.utils.toArray<HTMLElement>("[data-formation]");
      if (import.meta.env.DEV && markers.length !== formationConfigs.length - 1)
        console.warn(`Expected ${formationConfigs.length - 1} formation markers, found ${markers.length}`);
      const progress = markers.map(() => 0);
      const sync = () => (sceneState.target = progress.reduce((a, b) => a + b, 0));
      markers.forEach((el, i) => {
        const update = (self: ScrollTrigger) => {
          progress[i] = self.progress;
          sync();
        };
        ScrollTrigger.create({ trigger: el, start: "top 80%", end: "top 20%", onUpdate: update, onRefresh: update });
      });

      if (!reducedMotion) {
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, overwrite: "auto" }),
        });
      }
    },
    { dependencies: [booted, lang], revertOnUpdate: true },
  );

  // After a language switch the content remounts with different text lengths:
  // bring back the section that was on screen, then re-measure once the new glyphs have loaded.
  const switched = useRef(false);
  useEffect(() => {
    if (!switched.current) {
      switched.current = true;
      return;
    }
    const anchor = takeAnchor();
    const el = anchor && document.getElementById(anchor.id);
    if (anchor && el) scrollToTarget(el.getBoundingClientRect().top + window.scrollY - anchor.offset, true);
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, [lang]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[90] rounded-full bg-heat px-5 py-3 text-ink-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {t.skip}
      </a>

      {webgl ? (
        <Suspense fallback={null}>
          <ParticleField />
        </Suspense>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_72%_40%,rgb(236_106_66/0.18),transparent_45%)]"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgb(8_9_11/0.75)_100%)]"
      />
      <div aria-hidden className="grain" />

      <Preloader tasks={tasks} onReveal={onReveal} />

      {booted && (
        <>
          <Nav visible={revealed} onOpenPalette={() => setPaletteOpen(true)} />
          <main key={lang} id="main" className="relative z-10">
            <Hero play={revealed} />
            <About />
            <Work />
            <Experience />
            <Stack />
            <Credentials />
            <Contact />
          </main>
        </>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Toaster />
    </>
  );
}
