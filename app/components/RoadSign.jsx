// A wooden road sign on a post, its plank an arrow pointing `left` or `right`, with one or two
// `lines` of words on it.
export default function RoadSign({ lines, direction = "left" }) {
  const right = direction === "right";
  // Drawn pointing left; pointing right mirrors the plank, post and nails (not the words).
  const x = (value) => (right ? 160 - value : value);
  const plank = right
    ? "M130 14H12a6 6 0 0 0-6 6v44a6 6 0 0 0 6 6h118l24-28Z"
    : "M30 14h118a6 6 0 0 1 6 6v44a6 6 0 0 1-6 6H30L6 42Z";
  const middle = right ? 72 : 88;
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true">
      <g stroke="#4b2e22" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <path d={`M${x(100)} 50v56`} strokeWidth="14" />
        <path d={`M${x(100)} 50v56`} stroke="#b9794a" strokeWidth="7" />
        <path d={`M${right ? 46 : 86} 106h28`} strokeWidth="5" />
        <path d={plank} fill="#e0a56a" />
        <path d={right ? "M18 26h108M18 58h108" : "M34 26h108M34 58h108"} stroke="#c98a55" strokeWidth="2.5" />
        <circle cx={x(140)} cy="20" r="2.5" fill="#4b2e22" stroke="none" />
        <circle cx={x(140)} cy="64" r="2.5" fill="#4b2e22" stroke="none" />
      </g>
      {lines.length === 1 ? (
        <text x={middle} y="47" textAnchor="middle" fontSize="16" fontWeight="700" fill="#4b2e22">{lines[0]}</text>
      ) : (
        <>
          <text x={middle} y="38" textAnchor="middle" fontSize="15" fontWeight="700" fill="#4b2e22">{lines[0]}</text>
          <text x={middle} y="55" textAnchor="middle" fontSize="15" fontWeight="700" fill="#4b2e22">{lines[1]}</text>
        </>
      )}
    </svg>
  );
}
