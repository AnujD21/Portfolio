import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { TOAST_EVENT } from "../lib/toast";

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number>(undefined);

  useEffect(() => {
    const show = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMessage(null), 2400);
    };
    window.addEventListener(TOAST_EVENT, show);
    return () => {
      window.removeEventListener(TOAST_EVENT, show);
      window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[65] flex justify-center px-4">
      <div
        className={`glass flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm text-fog-100 transition-[opacity,transform] duration-500 ease-(--ease-out-expo) ${
          message ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <CheckIcon size={16} weight="bold" className="text-heat" />
        {message}
      </div>
    </div>
  );
}
