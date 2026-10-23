import { useEffect, useRef, useState } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import { isMac, reducedMotion } from "../lib/env";
import { lockScroll, scrollToTarget } from "../lib/scroll";
import { profile } from "../data/profile";
import { Roll } from "./Roll";

export const navLinks = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
] as const;

function go(e: React.MouseEvent, target: string) {
  e.preventDefault();
  scrollToTarget(target);
}

export function Nav({ visible, onOpenPalette }: { visible: boolean; onOpenPalette: () => void }) {
  const header = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(() => {
    gsap.fromTo(
      progress.current,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
    );

    let hidden = false;
    let raised = false;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        if (y > 24 !== raised) {
          raised = y > 24;
          setScrolled(raised);
        }
        const hide = self.direction === 1 && y > 480;
        if (hide !== hidden) {
          hidden = hide;
          gsap.to(header.current, { yPercent: hide ? -150 : 0, duration: 0.6, ease: "expo.out", overwrite: true });
        }
      },
    });

    gsap.utils.toArray<HTMLElement>("[data-nav]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (self.isActive) setActive(el.dataset.nav ?? "");
          else if (self.direction === -1 && el.dataset.nav === "about") setActive("");
        },
      });
    });
  });

  useGSAP(() => {
    if (!visible) return;
    if (reducedMotion) {
      gsap.set(header.current, { autoAlpha: 1 });
      return;
    }
    gsap.fromTo(
      header.current,
      { autoAlpha: 0, y: -16 },
      { autoAlpha: 1, y: 0, duration: 1.1, delay: 0.7, ease: "expo.out", clearProps: "y" },
    );
  }, [visible]);

  useEffect(() => {
    lockScroll(menuOpen);
    if (!menuOpen) return;
    const q = gsap.utils.selector(menu);
    if (!reducedMotion) {
      gsap.fromTo(menu.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(q("[data-item]"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.06, delay: 0.05 });
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [menuOpen]);

  const closeAndGo = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    setMenuOpen(false);
    requestAnimationFrame(() => scrollToTarget(target));
  };

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px]">
        <div ref={progress} className="h-full origin-left scale-x-0 bg-heat" />
      </div>

      <header ref={header} className="invisible fixed inset-x-0 top-0 z-40 pt-3 md:pt-4">
        <div className="shell">
          <nav
            aria-label="Primary"
            className={`flex h-14 items-center justify-between rounded-full pr-2 pl-4 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
              scrolled ? "glass" : ""
            }`}
          >
            <a href="#top" onClick={(e) => go(e, "#top")} className="group flex items-center gap-2.5 font-medium tracking-[-0.02em]">
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-full bg-[radial-gradient(circle,#ffe3d3_0%,#ec6a42_45%,rgb(236_106_66/0)_72%)] transition-transform duration-500 group-hover:scale-125"
              />
              <Roll>{profile.name}</Roll>
            </a>

            <ul className="hidden items-center gap-1 md:flex">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={(e) => go(e, `#${l.id}`)}
                    aria-current={active === l.id ? "true" : undefined}
                    className={`group inline-flex rounded-full px-3.5 py-2 text-sm transition-colors duration-300 ${
                      active === l.id ? "bg-white/[0.07] text-fog-100" : "text-fog-400 hover:text-fog-100"
                    }`}
                  >
                    <Roll>{l.label}</Roll>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenPalette}
                aria-label="Open command menu"
                className="hidden h-10 items-center gap-1 rounded-full border border-white/10 px-3 font-mono text-xs text-fog-300 transition-colors hover:border-white/25 hover:text-fog-100 md:inline-flex"
              >
                <kbd className="font-mono">{isMac ? "⌘" : "Ctrl"}</kbd>
                <kbd className="font-mono">K</kbd>
              </button>
              <a href="#contact" onClick={(e) => go(e, "#contact")} className="group btn-primary h-10 px-5 text-sm">
                <Roll>Get in touch</Roll>
              </a>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-fog-100 md:hidden"
              >
                <ListIcon size={18} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={menu}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-ink-950/96 px-5 pt-5 pb-10 backdrop-blur-xl md:hidden"
        >
          <div className="flex h-14 items-center justify-between pl-4">
            <span className="font-medium">{profile.name}</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10"
            >
              <XIcon size={18} />
            </button>
          </div>
          <ul className="mt-14 flex flex-col gap-2 pl-4">
            {[...navLinks, { id: "contact", label: "Contact" }].map((l) => (
              <li key={l.id} className="overflow-hidden">
                <a
                  data-item
                  href={`#${l.id}`}
                  onClick={(e) => closeAndGo(e, `#${l.id}`)}
                  className={`block text-[clamp(2.6rem,12vw,4rem)] leading-[1.1] font-semibold tracking-[-0.05em] ${
                    active === l.id ? "text-heat" : "text-fog-100"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-2 pl-4 text-fog-300">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <div className="flex gap-5">
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
