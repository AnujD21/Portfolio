/** Hover text roll: the label slides up and an identical copy follows from below. */
export function Roll({ children }: { children: string }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="inline-block transition-transform duration-500 ease-(--ease-out-expo) group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 inline-block translate-y-full transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}
