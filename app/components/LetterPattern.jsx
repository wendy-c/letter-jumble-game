export default function LetterPattern({ letters }) {
  return (
    <span className="letter-pattern">
      {letters.map((letter, index) => (
        letter === null
          ? <span className="letter-pattern-blank" key={index} />
          : <span key={index}>{letter}</span>
      ))}
    </span>
  );
}
