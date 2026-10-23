import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { reducedMotion } from "../lib/env";

interface Props {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

/** Image that wipes open from the bottom while settling from a slight zoom. */
export function ClipImage({ src, alt, className = "", imgClassName = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion) return;
      const img = el.querySelector("img");
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out" });
      if (img) tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className={`h-full w-full object-cover ${imgClassName}`} />
    </div>
  );
}
