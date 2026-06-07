export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
    >
      <span
        className="block h-full w-1/3 animate-[loading_1.4s_ease-in-out_infinite] bg-[var(--color-orange)]"
        aria-hidden
      />
      <span className="sr-only">Loading...</span>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
