/** Decorative contour lines for the hero collage (no external image). */
export function HeroTopoIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-topo-fade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.45" />
          <stop offset="55%" stopColor="rgb(139 92 246)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#hero-topo-fade)" />
      <g stroke="rgb(79 70 229)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
        <path d="M-20 120 C 80 60, 160 200, 260 100 S 380 40, 420 130" />
        <path d="M-20 155 C 90 95, 170 230, 270 130 S 390 75, 430 165" />
        <path d="M-20 190 C 100 130, 180 260, 280 160 S 400 110, 440 200" />
        <path d="M-20 225 C 110 165, 190 290, 290 195 S 410 145, 450 235" />
        <path d="M-20 260 C 120 200, 200 320, 300 225 S 420 180, 460 270" />
        <path d="M-20 295 C 130 235, 210 350, 310 255 S 430 215, 470 305" />
        <path d="M-20 330 C 140 270, 220 380, 320 285 S 440 250, 480 340" />
      </g>
      <g stroke="rgb(51 65 85)" strokeWidth="0.9" strokeLinecap="round" opacity="0.22">
        <path d="M40 40 Q 200 120, 360 48" />
        <path d="M32 72 Q 198 150, 368 78" />
        <path d="M48 360 Q 210 280, 352 368" />
      </g>
    </svg>
  );
}
