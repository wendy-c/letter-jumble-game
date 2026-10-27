import GameApp from "../app/components/GameApp";
import { ada, elly, withStorage } from "./helpers";

// The whole app at an address, as a player would see it. Each story sets the saved players and
// settings first (see helpers.js). Links and buttons that change the address are recorded in the
// Actions panel rather than followed.
export default {
  title: "Pages",
  component: GameApp,
  parameters: { page: true },
  beforeEach: withStorage(),
};

const at = (pathname, storage) => ({
  parameters: { nextjs: { navigation: { pathname } } },
  ...(storage && { beforeEach: withStorage(storage) }),
});

export const Home = at("/");
export const HomeAge5To6 = at("/", { players: [elly, ada] });
export const WelcomeNewFamily = at("/", { players: [], welcomeClosed: false });
export const HomeInChinese = at("/", { language: "zh" });

export const CvcSounds = at("/cvc");
export const CvcBeginningSound = at("/cvc/beginning-sound");
export const CvcHowToPlay = at("/cvc/beginning-sound", { howToSeen: [] });
export const ConsonantDigraphs = at("/digraphs/ch-sh-th");
export const ChineseColours = at("/chinese/colours");

export const LetterJumbleMovers = at("/letter-jumble", { players: [elly] });
export const MoversAnimals = at("/letter-jumble/animals", { players: [elly] });
export const MeasureWords = at("/measure-words", { players: [elly] });
export const Idioms = at("/idioms", { players: [elly] });

export const MyBadges = at("/badges", { players: [{ ...ada, badges: ["cvc/beginning-sound", "chinese/colours"] }] });
export const ParentMode = at("/parent");

export const MochisDen = at("/dragon");
export const RainbowVillage = at("/dragon/village");
export const RainbowVillageWithTofu = at("/dragon/village", { players: [{ ...elly, unlocks: ["tofu"] }] });
export const TofusDen = at("/dragon/tofu", { players: [{ ...elly, unlocks: ["tofu"] }] });
