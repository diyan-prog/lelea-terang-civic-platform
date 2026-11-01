import { Link } from "react-router"

export function LogoMark({
  size = 48,
  light,
}: {
  size?: number
  light?: boolean
}) {
  return (
    <img
      src="/Indramayu.png"
      alt="Logo Indramayu"
      width={size}
      height={size}
      className="shrink-0 rounded object-contain"
    />
  )
}
export function Logo({ light }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5"
      aria-label="Lelea Terang, beranda"
    >
      <LogoMark light={light} />
      <span
        className={`flex flex-col text-[15px] font-extrabold leading-[1.05] tracking-wide ${
          light ? "text-white" : "text-navy"
        }`}
      >
        <span>LELEA</span>
        <span className={light ? "text-sun" : "text-teal"}>TERANG</span>
      </span>
    </Link>
  )
}

export function VillageIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 460"
      className={className}
      role="img"
      aria-label="Ilustrasi desa dengan sawah, rumah genteng, pohon kelapa, bukit, dan petani bertopi caping"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CDEBEE" />
          <stop offset="1" stopColor="#F4FBF9" />
        </linearGradient>
      </defs>
      <rect width="560" height="460" fill="url(#sky)" />
      <circle cx="440" cy="90" r="44" fill="#F2B632" opacity=".25" />
      <circle cx="440" cy="90" r="30" fill="#F2B632" />
      <g fill="#fff" opacity=".9">
        <ellipse cx="130" cy="80" rx="46" ry="14" />
        <ellipse cx="160" cy="68" rx="30" ry="12" />
        <ellipse cx="320" cy="130" rx="38" ry="11" />
        <ellipse cx="342" cy="120" rx="24" ry="10" />
      </g>
      <path
        d="M0 250 Q90 160 190 235 T360 220 T560 210 V300 H0Z"
        fill="#7DBE9A"
      />
      <path d="M0 270 Q120 210 250 265 T560 240 V320 H0Z" fill="#4FA27E" />
      {/* rice field terraces */}
      <path d="M0 460V310 Q140 290 280 315 T560 300 V460Z" fill="#A8D37B" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M0 ${335 + i * 25} Q150 ${318 + i * 25} 290 ${338 + i * 25} T560 ${326 + i * 25}`}
          stroke={i % 2 ? "#8FC15F" : "#C6E49A"}
          strokeWidth="9"
          fill="none"
        />
      ))}
      {/* houses */}
      <g>
        <rect x="90" y="262" width="74" height="48" fill="#FBF3E4" />
        <path d="M80 264 127 228 174 264Z" fill="#C8573A" />
        <path
          d="M80 264 127 228 174 264"
          stroke="#A8442D"
          strokeWidth="3"
          fill="none"
        />
        <rect x="116" y="278" width="20" height="32" fill="#0B4F5C" />
        <rect x="98" y="276" width="14" height="14" fill="#CDEBEE" />
        <rect x="142" y="276" width="14" height="14" fill="#CDEBEE" />
      </g>
      <g>
        <rect x="200" y="272" width="62" height="40" fill="#FFF8EC" />
        <path d="M192 274 231 244 270 274Z" fill="#D9694A" />
        <rect x="222" y="287" width="18" height="25" fill="#0F8B8D" />
        <rect x="205" y="284" width="12" height="12" fill="#CDEBEE" />
      </g>
      <g>
        <rect x="320" y="266" width="80" height="46" fill="#FBF3E4" />
        <path d="M310 268 360 230 410 268Z" fill="#C8573A" />
        <rect x="350" y="282" width="20" height="30" fill="#0B4F5C" />
        <rect x="328" y="280" width="14" height="14" fill="#CDEBEE" />
        <rect x="378" y="280" width="14" height="14" fill="#CDEBEE" />
      </g>
      {/* palms */}
      {[
        [40, 300],
        [285, 292],
        [450, 285],
        [505, 300],
      ].map(([x, y], i) => (
        <g key={i}>
          <path
            d={`M${x} ${y} Q${x + 6} ${y - 60} ${x + 2} ${y - 110}`}
            stroke="#8B6A4A"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          {[-60, -25, 15, 55, 100].map((a, k) => (
            <path
              key={k}
              d={`M${x + 2} ${y - 110} q${Math.sin((a * Math.PI) / 180) * 50} ${-18 + Math.abs(a) * 0.3} ${Math.sin((a * Math.PI) / 180) * 70} ${Math.abs(a) * 0.2 + 12}`}
              stroke="#2F8F5B"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
      {/* farmers */}
      {[
        [170, 372, 1],
        [400, 402, -1],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s} 1)`}>
          <path d="M-18 -34 0 -52 18 -34Z" fill="#F2B632" />
          <circle cx="0" cy="-30" r="8" fill="#E0A97C" />
          <path d="M-9 -22h18l4 28H-13Z" fill={i ? "#0F8B8D" : "#D64545"} />
          <path
            d="M-10 6V28M10 6V28"
            stroke="#1E3A4C"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M14 -16 30 8"
            stroke="#8B6A4A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  )
}
