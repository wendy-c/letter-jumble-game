export default function GameFooter({ children }) {
  return (
    <footer className="game-footer">
      <span><span className="footer-star" aria-hidden="true">✦</span> Every word is a little bit of magic!</span>
      <span className="footer-right">{children} <span aria-hidden="true">♡</span></span>
    </footer>
  );
}
