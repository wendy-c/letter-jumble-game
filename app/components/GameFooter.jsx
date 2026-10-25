import { useText } from "../i18n";

export default function GameFooter({ children }) {
  const text = useText();
  return (
    <footer className="game-footer">
      <span><span className="footer-star" aria-hidden="true">✦</span> {text.footer}</span>
      <span className="footer-right">{children} <span aria-hidden="true">♡</span></span>
    </footer>
  );
}
