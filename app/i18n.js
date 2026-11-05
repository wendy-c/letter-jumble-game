import { createContext, useContext } from "react";
import { ageGroups } from "./games-data";

// The site's own words (menus, the home page, badges, Parent mode…) in English and 繁體中文.
// Words inside a game stay in that game's language, so they aren't here.
export const LanguageContext = createContext("en");

const strings = {
  en: {
    home: "Home",
    homeLink: "Rainbow Academy home",
    footer: "Learn, Play, Shine!",

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
    howOldIs: (name) => `Which class is ${name} in?`,
    players: "Players",
    rainbowCoinsHidden: " rainbow coins",
    addPlayer: "Or add a new player",
    yourName: "What’s your name?",
    howOld: "Which class are you in?",
    letsPlay: "Let’s play!",
    close: "Close",
    ageGroup: { k1: "K1", k2: "K2", k3: "K3" },

    greetingHi: (name) => (name ? `Hi ${name}!` : "Hi there!"),
    greetingQuestion: "What shall we play today?",
    pickAGame: "PICK A GAME",
    noGames: (name) => `No games are turned on for ${name} yet. Ask a grown-up to choose some in Parent mode.`,
    groups: { phonics: "Phonics", cambridge: "Cambridge YLE training", chinese: "中文", challenge: "Math", mochi: "Visit Mochi" },
    keepPlaying: "Keep playing",
    gameNotes: {},
    // Game names that change with the site's language, or (as functions) with the child's class.
    gameNames: { "math-logic": (label) => (label ? `${label} Challenge` : "Challenge") },

    badgesTitle: (name) => `${name}’s badges`,
    badgeCount: (earned, total) => `${earned} of ${total} badges`,
    noBadgesYet: "Get every answer in a topic right to earn its badge!",
    badgeEarned: (topic) => `${topic}: earned`,
    badgeNotYet: (topic) => `${topic}: not earned yet`,
    fastestTime: (time) => `Fastest: ${time}`,
    noRecordYet: "No record yet",
    collectThemAll: "COLLECT THEM ALL",

    // Rainbow Village's note: what to save up for next.
    villageMeetTofu: (cost) => `Save up ${cost} rainbow coins to meet Mochi’s best friend, Tofu.`,
    villageOpenPark: (cost) => `Save up ${cost} rainbow coins to open the park, where Mochi and Tofu play together.`,
    villageWhoToVisit: "Who shall we visit today?",
    // The note under each den's heading (Mochi's, Tofu's, the park).
    denNotes: {
      mochi: "Spend rainbow coins on yummy treats and pampering.",
      tofu: "Tofu is a little shy. She loves books, science and baking.",
      park: "Mochi and Tofu love playing together in the park.",
    },

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
    moreSettings: (game) => `More settings for ${game}`,
    questionsPerRound: "Questions per round",
    questionsPerRoundNote: "How many questions each round deals",
    on: "On",
    off: "Off",
    forAges: (ages) => ` · for ${ages}`,
    lockParentMode: "Done — lock parent mode",

    // Moving game records to another browser (in Parent mode).
    transferTitle: "Transfer game records to another browser",
    transferIntro: "Game records (every child, with their rainbow coins, badges, scores and progress) are saved in this browser only. To carry on in another browser, or on another phone, tablet or computer:",
    transferSteps: [
      "In this browser: tap “Generate”, then “Copy” to copy your code.",
      "Send the code to yourself, for example by message or email.",
      "In the other browser: open Rainbow Academy, then Parent mode (from the welcome card, or a player’s menu). Paste the code into “Load game records from another browser”, tap “Load” and check what will be loaded.",
    ],
    transferSendTitle: "Copy this browser’s game records",
    transferGenerate: "Generate",
    transferCodeLabel: "Your code",
    transferCopy: "Copy",
    transferCopied: "Copied!",
    transferLoadTitle: "Load game records from another browser",
    transferWarning: "Loading a code replaces all the game records in this browser: its children, coins, badges, scores and progress. This can’t be undone.",
    transferPasteLabel: "Paste the code here",
    transferLoad: "Load",
    transferProblems: {
      empty: "Paste a code first.",
      invalid: "That code doesn’t look right. Copy the whole code again, from “RAINBOW1-” to the end, and paste it here.",
      noPlayers: "That code has no children in it, so there’s nothing to load.",
    },
    transferConfirm: "Replace this browser’s game records with these children?",
    transferChild: (name, age, coins) => `${name}${age ? ` (${age})` : ""} · ${coins} rainbow coins`,
    transferConfirmNote: "Everything saved in this browser now will be gone. The home page opens once they’re loaded.",
    transferReplace: "Yes, replace them",
    transferCancel: "Cancel",
  },
  zh: {
    home: "主頁",
    homeLink: "Rainbow Academy 主頁",
    footer: "學中玩，玩中學，每個孩子都能發光發亮！",

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
    howOldIs: (name) => `${name} 讀哪一班？`,
    players: "玩家",
    rainbowCoinsHidden: " 個彩虹金幣",
    addPlayer: "或者加入新玩家",
    yourName: "你叫甚麼名字？",
    howOld: "你讀哪一班？",
    letsPlay: "一起玩吧！",
    close: "關閉",
    ageGroup: { k1: "K1（幼兒班）", k2: "K2（低班）", k3: "K3（高班）" },

    greetingHi: (name) => (name ? `你好 ${name}！` : "你好！"),
    greetingQuestion: "今天玩甚麼？",
    pickAGame: "選一個遊戲",
    noGames: (name) => `${name} 還沒有可以玩的遊戲。請家長在「家長模式」選擇遊戲。`,
    groups: { phonics: "自然拼讀", cambridge: "劍橋英語考試預備", chinese: "中文", challenge: "數學", mochi: "到彩虹鎮探望Mochi" },
    keepPlaying: "繼續玩",
    gameNotes: {
      cvc: "K1-K3 · 開頭、中間和結尾的音",
      digraphs: "K1-K3 · ch、sh、th、ph、wh、ck 和 ng",
      blends: "K1-K3 · br、cr、str、bl、cl、fl 等混合音",
      "magic-e": "K1-K3 · a_e、i_e、o_e 和 u_e：cake、kite、bone、cube",
      "r-controlled": "K1-K3 · ar、er、ir、or 和 ur：car、her、bird、corn、fur",
      starters: "K2-K3 · 劍橋 Starters · 12 個主題",
      "letter-jumble": "K2-K3 · 劍橋 Movers · 8 個主題",
      chinese: "K1-K2 · 認識中文字 · 廣東話",
      "chinese-advanced": "K2-K3 · 認識詞語 · 廣東話",
      "measure-words": "K3 · 量詞 · 廣東話",
      idioms: "K3 · 成語 · 廣東話",
      "math-logic": "K1-K3 · 數一數、加減和找規律 · 地圖上的 20 個關卡",
      "speed-quest": "加減速算，每次都嘗試打破自己的紀錄！",
      dragon: "用彩虹幣跟Mochi玩",
    },
    gameNames: { "math-logic": (label) => `${label ?? ""}大冒險`, "speed-quest": "彩虹速算站" },

    badgesTitle: (name) => `${name} 的徽章`,
    badgeCount: (earned, total) => `${earned} / ${total} 個徽章`,
    noBadgesYet: "一個主題全部答對，就可以得到徽章！",
    badgeEarned: (topic) => `${topic}：已得到`,
    badgeNotYet: (topic) => `${topic}：未得到`,
    fastestTime: (time) => `最快紀錄：${time}`,
    noRecordYet: "還沒有紀錄",
    collectThemAll: "快來集齊一套",

    villageMeetTofu: (cost) => `儲夠 ${cost} 個彩虹金幣，就可以認識 Mochi 的好朋友 Tofu。`,
    villageOpenPark: (cost) => `儲夠 ${cost} 個彩虹金幣，就可以打開公園，讓 Mochi 和 Tofu 一起玩。`,
    villageWhoToVisit: "今天去探望誰？",
    denNotes: {
      mochi: "用彩虹金幣買好吃的零食，好好照顧 Mochi。",
      tofu: "Tofu 有點害羞。她喜歡看書、科學和焗蛋糕。",
      park: "Mochi 和 Tofu 最喜歡一起在公園玩。",
    },

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
    moreSettings: (game) => `${game} 的更多設定`,
    questionsPerRound: "每輪題目數量",
    questionsPerRoundNote: "每一輪有多少題",
    on: "開啟",
    off: "關閉",
    forAges: (ages) => ` · 適合 ${ages}`,
    lockParentMode: "鎖上家長模式",

    transferTitle: "把遊戲紀錄轉移到另一個瀏覽器",
    transferIntro: "遊戲紀錄（每位孩子的彩虹金幣、徽章、分數和進度）只儲存在這個瀏覽器。如想在另一個瀏覽器，或另一部手機、平板或電腦繼續玩：",
    transferSteps: [
      "在這個瀏覽器：按「生成」，再按「複製」複製代碼。",
      "把代碼傳給自己，例如用訊息或電郵。",
      "在另一個瀏覽器：打開 Rainbow Academy，進入家長模式（從歡迎卡，或玩家選單）。把代碼貼在「從另一個瀏覽器載入遊戲紀錄」，按「載入」，再確認要載入的內容。",
    ],
    transferSendTitle: "複製這個瀏覽器的遊戲紀錄",
    transferGenerate: "生成",
    transferCodeLabel: "你的代碼",
    transferCopy: "複製",
    transferCopied: "已複製！",
    transferLoadTitle: "從另一個瀏覽器載入遊戲紀錄",
    transferWarning: "載入代碼會取代這個瀏覽器的所有遊戲紀錄：包括孩子、金幣、徽章、分數和進度，而且不能復原。",
    transferPasteLabel: "在這裏貼上代碼",
    transferLoad: "載入",
    transferProblems: {
      empty: "請先貼上代碼。",
      invalid: "這個代碼好像不正確。請由「RAINBOW1-」開始，再複製整個代碼，然後貼在這裏。",
      noPlayers: "這個代碼沒有任何孩子的紀錄，所以沒有東西可以載入。",
    },
    transferConfirm: "用這些孩子的紀錄取代這個瀏覽器的遊戲紀錄？",
    transferChild: (name, age, coins) => `${name}${age ? `（${age}）` : ""} · ${coins} 個彩虹金幣`,
    transferConfirmNote: "這個瀏覽器現有的紀錄會全部消失。載入後會打開主頁。",
    transferReplace: "確定取代",
    transferCancel: "取消",
  },
};

// Errors from creating a player (use-players) come in English; this gives the Chinese.
const playerErrors = [
  [/^Please type a name\.$/, () => "請輸入名字。"],
  [/^Names can be up to (\d+) letters long\.$/, (max) => `名字最多 ${max} 個字。`],
  [/^(.+) is already a player\. Tap their name above\.$/, (name) => `${name} 已經是玩家，請按上面的名字。`],
  [/^Please choose which class you’re in\.$/, () => "請選擇班級。"],
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

// A game's name in the site's words (`text`), for a child in class `age` ("k1"): the Challenge is
// named for the class ("K1 Challenge", K1大冒險), or just "Challenge" before anyone is playing.
export function gameName(text, game, age = null) {
  const name = text.gameNames[game.id] ?? game.name;
  return typeof name === "function" ? name(ageGroups.find((group) => group.id === age)?.label ?? null) : name;
}
