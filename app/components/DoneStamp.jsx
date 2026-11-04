import { useId } from "react";

// The Rainbow Academy's "done" stamp, on a module finished with every answer right: a round
// rubber stamp in rainbow ink, "RAINBOW ACADEMY" round the edge and a big star saying "DONE!".
// The ink is a little worn in places, as a real stamp's would be (but not the "DONE!").
export default function DoneStamp({ label, className = "" }) {
  const id = useId().replace(/:/g, "");
  const ink = `url(#${id}-ink)`;
  const star = (cx, cy, outer, inner) => Array.from({ length: 10 }, (_, point) => {
    const radius = point % 2 ? inner : outer;
    const angle = (point * Math.PI) / 5 - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
  return (
    <svg className={`done-stamp ${className}`} viewBox="-60 -60 120 120" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff4f6d" />
          <stop offset="0.22" stopColor="#ff8a3d" />
          <stop offset="0.42" stopColor="#f5b800" />
          <stop offset="0.6" stopColor="#2fb36a" />
          <stop offset="0.8" stopColor="#2f8cf0" />
          <stop offset="1" stopColor="#8a4fe8" />
        </linearGradient>
        {/* Round the top, from low on the left to low on the right. */}
        <path id={`${id}-edge`} d="M-36.4 21A42 42 0 1 1 36.4 21" />
        <filter id={`${id}-worn`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -12 8.4" result="ink" />
          <feComposite in="SourceGraphic" in2="ink" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id}-worn)`}>
        <circle r="55" fill="#ffffff" fillOpacity="0.5" stroke={ink} strokeWidth="5" />
        <circle r="36" fill="none" stroke={ink} strokeWidth="2.5" />
        <text fill={ink} fontSize="12.5" fontWeight="800" letterSpacing="1.6" fontFamily="'Fredoka', 'Arial Rounded MT Bold', Arial, sans-serif">
          <textPath href={`#${id}-edge`} startOffset="50%" textAnchor="middle">RAINBOW ACADEMY</textPath>
        </text>
        <polygon points={star(-12, 44, 3.6, 1.6)} fill={ink} />
        <polygon points={star(0, 46, 4.4, 2)} fill={ink} />
        <polygon points={star(12, 44, 3.6, 1.6)} fill={ink} />
        <polygon points={star(0, 2, 35, 20)} fill={ink} strokeLinejoin="round" stroke={ink} strokeWidth="3" />
      </g>
      {/* Clear, not worn, so it's easy to read. */}
      <text y="8" fill="#ffffff" fontSize="13" fontWeight="900" letterSpacing="0.3" textAnchor="middle" fontFamily="'Fredoka', 'Arial Rounded MT Bold', Arial, sans-serif">DONE!</text>
    </svg>
  );
}
