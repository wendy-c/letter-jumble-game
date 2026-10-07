export default function PictureClue({ puzzle, topic, round }) {
  return (
    <section className={`picture-panel picture-${puzzle.color}`} aria-label={`${puzzle.category} picture clue`}>
      <div className="picture-topline">
        <span className="category-label"><span className="category-dot" />{puzzle.category}</span>
        <span className="picture-count">{String(round + 1).padStart(2, "0")} <span>/ {String(topic.words.length).padStart(2, "0")}</span></span>
      </div>
      <div className="picture-art" role="img" aria-label={`Picture clue: ${topic.name.toLowerCase()}`}>
        <span className="art-sparkle sparkle-one" aria-hidden="true">✦</span>
        <span className="art-sparkle sparkle-two" aria-hidden="true">⋆</span>
        <span className="art-sparkle sparkle-three" aria-hidden="true">✧</span>
        {puzzle.picture.startsWith("/") ? (
          <img className="picture-image" key={puzzle.picture} src={puzzle.picture} alt="" width="128" height="128" />
        ) : (
          <span className="picture-emoji" aria-hidden="true">{puzzle.picture}</span>
        )}
        <span className="art-ground" aria-hidden="true" />
      </div>
    </section>
  );
}
