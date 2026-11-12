export function Squiggle({
  children,
  color = "#F2B33D",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span className="relative inline-block">
      {children}
      <style>{`
        @keyframes squiggle-wipe {
          0% {
            clip-path: inset(0 100% 0 0);
          }
          100% {
            clip-path: inset(0 0 0 0);
          }
        }
        .animate-squiggle {
          animation: squiggle-wipe 3.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        fill="none"
        className="pointer-events-none absolute left-0 -bottom-2 h-3 w-full sm:-bottom-3 animate-squiggle"
      >
        <path
          d="M2 7 Q14 1 26 7 T50 7 T74 7 T98 7 T122 7 T146 7 T170 7 T198 7"
          stroke="#0F8B8D"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
