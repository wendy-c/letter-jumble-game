import CoinLink from "./CoinLink";

export default {
  title: "Components/Header/CoinLink",
  component: CoinLink,
  args: { coins: 37 },
};

export const Coins = {};
export const NoCoins = { args: { coins: 0 } };
