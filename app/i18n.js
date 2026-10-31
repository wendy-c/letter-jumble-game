import { createContext, useContext } from "react";

// The site's own words (menus, the home page, badges, Parent mode…) in English and 繁體中文.
// Words inside a game stay in that game's language, so they aren't here.
export const LanguageContext = createContext("en");

const strings = {
  en: {
    home: "Home",
    homeLink: "Rainbow Academy home",
    footer: "Every word is a little bit of magic!",

    playerOptions: (name, coins) => `Playing as ${name}, ${coins} rainbow ${coins === 1 ? "coin" : "coins"}. Player options`,
    switchPlayer: "Switch player",
    myBadges: "My badges",
    parentMode: "Parent mode",
    logOut: "Log out",
    language: "Language",
    languageSwitch: "Language: English or 繁體中文",

    beforeWeStart: "BEFORE WE START",
    whosPlaying: "Who’s playing?",
    oneQuickQuestion: "ONE QUICK QUESTION",
    howOldIs: (name) => `How old is ${name}?`,
    players: "Players",
    rainbowCoinsHidden: " rainbow coins",
    addPlayer: "Or add a new player",
    yourName: "What’s your name?",
    howOld: "How old are you?",
    letsPlay: "Let’s play!",
    close: "Close",
    ageGroup: { "3-4": "3-4 years old", "5-6": "5-6 years old" },

    greetingHi: (name) => (name ? `Hi ${name}!` : "Hi there!"),
    greetingQuestion: "What shall we play today?",
    pickAGame: "PICK A GAME",
    noGames: (name) => `No games are turned on for ${name} yet. Ask a grown-up to choose some in Parent mode.`,
    groups: { phonics: "Phonics", cambridge: "Cambridge YLE training", chinese: "中文", challenge: "Challenge", mochi: "Visit Mochi" },
    gameNotes: {},

    badgesTitle: (name) => `${name}’s badges`,
    badgeCount: (earned, total) => `${earned} of ${total} badges`,
    noBadgesYet: "Get every answer in a topic right to earn its badge!",
    badgeEarned: (topic) => `${topic}: earned`,
    badgeNotYet: (topic) => `${topic}: not earned yet`,
    collectThemAll: "COLLECT THEM ALL",

    forGrownUps: "FOR GROWN-UPS",
    grownUpsOnly: "Grown-ups only! Answer this to manage each child’s games.",
    whatIs: "What is",
    notRight: "That’s not right — here’s another one.",
    continue: "Continue",
    noChildren: "No user yet. Add a player then come back to choose their games.",
    parentIntro: "Turn games on or off for each child. Games for their age are on to begin with; you can also turn on games for other ages.",
    allGamesOff: (name) => `All games are off — ${name} can’t play anything yet.`,
    spellingGuide: "Spelling guide",
    spellingGuideNote: "Colour vowel and consonant teams in this game’s words",
    on: "On",
    off: "Off",
    forAges: (ages) => ` · for ${ages}`,
    lockParentMode: "Done — lock parent mode",
  },
  zh: {
    home: "主頁",
    homeLink: "Rainbow Academy 主頁",
    footer: "每個字都是小小的魔法！",

    playerOptions: (name, coins) => `${name} 正在玩，有 ${coins} 個彩虹金幣。玩家選項`,
    switchPlayer: "轉換玩家",
    myBadges: "我的徽章",
    parentMode: "家長模式",
    logOut: "登出",
    language: "語言",
    languageSwitch: "語言：English 或 繁體中文",

    beforeWeStart: "開始之前",
    whosPlaying: "誰在玩？",
    oneQuickQuestion: "一個小問題",
    howOldIs: (name) => `${name} 幾歲？`,
    players: "玩家",
    rainbowCoinsHidden: " 個彩虹金幣",
    addPlayer: "或者加入新玩家",
    yourName: "你叫甚麼名字？",
    howOld: "你幾歲？",
    letsPlay: "一起玩吧！",
    close: "關閉",
    ageGroup: { "3-4": "3-4 歲", "5-6": "5-6 歲" },

    greetingHi: (name) => (name ? `你好 ${name}！` : "你好！"),
    greetingQuestion: "今天玩甚麼？",
    pickAGame: "選一個遊戲",
    noGames: (name) => `${name} 還沒有可以玩的遊戲。請家長在「家長模式」選擇遊戲。`,
    groups: { phonics: "自然拼讀", cambridge: "劍橋英語考試預備", chinese: "中文", challenge: "挑戰", mochi: "探望 Mochi 和彩虹村" },
    gameNotes: {
      cvc: "3-4 歲 · 開頭、中間和結尾的音",
      digraphs: "3-6 歲 · ch、sh、th、ph、wh、ck 和 ng",
      blends: "3-6 歲 · br、cr、str、bl、cl、fl 等混合音",
      starters: "5-6 歲 · 劍橋 Starters · 12 個主題",
      "letter-jumble": "5-6 歲 · 劍橋 Movers · 8 個主題",
      chinese: "3-4 歲 · 認識中文字 · 廣東話",
      "chinese-advanced": "5-6 歲 · 認識詞語 · 廣東話",
      "measure-words": "5-6 歲 · 量詞 · 廣東話",
      idioms: "5-6 歲 · 成語 · 廣東話",
      "math-logic": "所有年齡 · 數一數、加減和找規律 · 6 個關卡",
      dragon: "用彩虹幣買零食，跟Mochi玩",
    },

    badgesTitle: (name) => `${name} 的徽章`,
    badgeCount: (earned, total) => `${earned} / ${total} 個徽章`,
    noBadgesYet: "一個主題全部答對，就可以得到徽章！",
    badgeEarned: (topic) => `${topic}：已得到`,
    badgeNotYet: (topic) => `${topic}：未得到`,
    collectThemAll: "快來集齊一套",

    forGrownUps: "家長專用",
    grownUpsOnly: "家長專用！答對這條題目，就可以管理孩子的遊戲。",
    whatIs: "請問",
    notRight: "答錯了，再試另一題。",
    continue: "繼續",
    noChildren: "還沒有帳戶。請先加入玩家，再回來選擇遊戲。",
    parentIntro: "為每位孩子開啟或關閉遊戲。適合他們年齡的遊戲會先開啟，你也可以開啟其他年齡的遊戲。",
    allGamesOff: (name) => `所有遊戲都已關閉，${name} 暫時不能玩。`,
    spellingGuide: "拼字指引",
    spellingGuideNote: "在這個遊戲的英文字中，用顏色標示元音和輔音組合",
    on: "開啟",
    off: "關閉",
    forAges: (ages) => ` · 適合 ${ages}`,
    lockParentMode: "完成，鎖上家長模式",
  },
};

// Errors from creating a player (use-players) come in English; this gives the Chinese.
const playerErrors = [
  [/^Please type a name\.$/, () => "請輸入名字。"],
  [/^Names can be up to (\d+) letters long\.$/, (max) => `名字最多 ${max} 個字。`],
  [/^(.+) is already a player\. Tap their name above\.$/, (name) => `${name} 已經是玩家，請按上面的名字。`],
  [/^Please choose how old you are\.$/, () => "請選擇年齡。"],
];

export function translatePlayerError(language, message) {
  if (language !== "zh" || !message) return message;
  for (const [pattern, translate] of playerErrors) {
    const match = message.match(pattern);
    if (match) return translate(match[1]);
  }
  return message;
}

export function textFor(language) {
  return strings[language] ?? strings.en;
}

// The site's words in the chosen language, e.g. `const text = useText(); text.home`.
export function useText() {
  return textFor(useContext(LanguageContext));
}

export function useLanguage() {
  return useContext(LanguageContext);
}
