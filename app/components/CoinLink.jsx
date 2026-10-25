import { useRouter } from "next/navigation";
import { useText } from "../i18n";

// The player's rainbow coins, shown on the home page. Tapping them visits Mochi, where
// the coins can be spent.
export default function CoinLink({ coins }) {
  const router = useRouter();
  const text = useText();
  return (
    <a
      className="coin-link"
      href="/dragon"
      aria-label={text.coins(coins)}
      onClick={(event) => {
        event.preventDefault();
        router.push("/dragon");
      }}
    >
      <img src="/images/rainbow-coin.svg" alt="" width="26" height="26" />
      <span className="coin-link-count">{coins}</span>
      <img className="coin-link-mochi" src="/images/icons/dragon.svg" alt="" width="26" height="26" />
    </a>
  );
}
