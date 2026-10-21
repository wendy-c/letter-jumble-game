// A topic's badge picture. Not earned yet, it's greyed out under a question mark, so children
// can see what they're working towards.
export default function BadgeMedal({ image, earned }) {
  return (
    <span className={`badge-medal${earned ? " badge-medal-earned" : " badge-medal-locked"}`} aria-hidden="true">
      <img src={image} alt="" width="80" height="86" />
      {earned ? <span className="badge-shine">✦</span> : <span className="badge-lock">?</span>}
    </span>
  );
}
