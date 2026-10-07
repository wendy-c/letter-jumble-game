const mascots = {
  ada: { src: "/images/mascot-left.png", width: 480, height: 361 },
  elly: { src: "/images/mascot-right.png", width: 480, height: 322 },
};

function WizardHat() {
  return (
    <svg className="wizard-hat" viewBox="0 0 100 92" aria-hidden="true">
      <ellipse cx="50" cy="76" rx="46" ry="12" fill="#a98cf2" stroke="#4b2e22" strokeWidth="4" />
      <path
        d="M27 74C33 52 37 30 47 12c4-7 12-9 18-4-6 0-10 4-11 10 5 18 12 38 19 56Z"
        fill="#8a6ae6"
        stroke="#4b2e22"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M29 64h43l3 10H26Z" fill="#ffd45e" stroke="#4b2e22" strokeWidth="3" strokeLinejoin="round" />
      <path d="m51 31 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#ffe27a" />
    </svg>
  );
}

export default function Mascot({ name, className = "" }) {
  const { src, width, height } = mascots[name];
  return (
    <span className={`mascot mascot-${name} ${className}`} aria-hidden="true">
      <img src={src} alt="" width={width} height={height} />
      <WizardHat />
    </span>
  );
}
