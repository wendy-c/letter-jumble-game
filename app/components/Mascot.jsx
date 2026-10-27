// Mochi, the academy's mascot: "happy", "confused" (a wrong answer), "idea" (a light bulb, for
// finishing a topic) or "welcome" (a big smile and open arms, on the front page). Drawn by
// scripts/make-mochi.py.
const moods = {
  happy: "/images/mochi/happy.svg",
  confused: "/images/mochi/confused.svg",
  idea: "/images/mochi/idea.svg",
  welcome: "/images/mochi/welcome.svg",
};

export default function Mascot({ mood = "happy", className = "" }) {
  return (
    <span className={`mascot mascot-${mood} ${className}`} aria-hidden="true">
      <img src={moods[mood]} alt="" width="236" height="246" />
    </span>
  );
}
