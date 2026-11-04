import { act, render, screen, waitFor, within } from "@testing-library/react";
import { track } from "@vercel/analytics";

jest.mock("@vercel/analytics", () => ({ track: jest.fn() }));
import { today } from "./math-data/math-data";
import userEvent from "@testing-library/user-event";
import GameApp from "./components/GameApp";
import { games } from "./games-data";
import { currentPathname, setPathname } from "../test/mock-navigation";
import { asVersion1 } from "../test/saved-players";
import { sounds } from "./lib/sounds";
import { makeTransferCode, readTransferCode, reloadHome } from "./lib/record-transfer";
import { dealtBy, forgetDeals } from "./lib/player-data";

jest.mock("./lib/sounds", () => ({ sounds: { correct: jest.fn(), oops: jest.fn(), coin: jest.fn(), sparkle: jest.fn() } }));
jest.mock("./lib/speech", () => ({ speakWord: jest.fn(), speakCantonese: jest.fn(), stopSpeaking: jest.fn() }));
// A topic's words are dealt from a seed. Here a seed's deal uses Math.random instead, which these
// tests pin (so the words come in their original order) or vary, and each seed (a new one for each
// deal) keeps its deal. Dealing from a seed itself is tested in app/lib/player-data.test.js.
jest.mock("./lib/player-data", () => {
  const actual = jest.requireActual("./lib/player-data");
  const { shuffledDeck } = jest.requireActual("./lib/spelling");
  const deals = new Map();
  let nextSeed = 0;
  return {
    ...actual,
    newDeckSeed: () => (nextSeed += 1),
    deckOrder: (deck, size, count) => {
      if (!Number.isInteger(deck)) return actual.deckOrder(deck, size, count);
      const key = `${deck}:${size}:${count}`;
      if (!deals.has(key)) deals.set(key, shuffledDeck(size, count, Math.random));
      return deals.get(key);
    },
    // For the tests: the words a saved seed dealt, and forgetting the deals before each test.
    dealtBy: (seed) => [...deals].find(([key]) => key.startsWith(`${seed}:`))?.[1] ?? null,
    forgetDeals: () => deals.clear(),
  };
});
// Loading game records from another browser reloads the page; here it's only noted.
jest.mock("./lib/record-transfer", () => ({ ...jest.requireActual("./lib/record-transfer"), reloadHome: jest.fn() }));
// After a right answer, the next question comes straight away (no 1-second wait in tests), and the
// toast stays up so tests can see it.
jest.mock("./lib/timing", () => ({ answerToastTime: 60000, nextQuestionPause: 0, mochiDriveTime: 0 }));

// The real dragon scene needs WebGL, which jsdom doesn't have.
jest.mock("./components/DragonScene", () => function MockDragonScene() {
  return <div data-testid="dragon-scene" />;
});

// The coin count lives in the header, as a link to Mochi.
// The player chip says how many coins they have, e.g. "Playing as Ada, 1 rainbow coin. Player options".
const coinsLabel = (count) => new RegExp(`, ${count} rainbow coins?\\. Player options$`);
const playersKey = "letter-jumble:players";
const whoIsPlaying = /Who.s playing/;

// Most tests skip the welcome card, the tour and the how-to-play cards, as if they'd been seen before.
const siteKey = "letter-jumble:site";
const welcomeClosedKey = "letter-jumble:welcome-closed";
const seenEverything = () => {
  window.localStorage.setItem(siteKey, JSON.stringify({ language: "en", howToSeen: games.map((game) => game.id), tutorialSeen: true }));
  window.sessionStorage.setItem(welcomeClosedKey, "true");
};

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  seenEverything();
  jest.clearAllMocks();
  forgetDeals();
  // A shuffle with random() just below 1 keeps the original order, so CVC games deal the
  // first 12 words in order (cat, hat, bat, ...). Tests about shuffling override this.
  jest.spyOn(Math, "random").mockReturnValue(0.9999999);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// With Math.random pinned, a topic's words are dealt in their original order.
const inOrder = (count) => [...Array(count).keys()];
const animalsDeck = { "letter-jumble/animals": inOrder(13) };
// Saved now: Animals dealt from a seed.
const animalsDealt = { "letter-jumble/animals": expect.any(Number) };

const ageFor = (gameName) => (/Letter Jumble/.test(gameName) ? "k3" : "k1");

// The current player's own site settings (language, whether they've had the tour), as saved.
function savedSettings() {
  const saved = JSON.parse(window.localStorage.getItem(playersKey));
  return saved?.players.find((player) => player.id === saved.current)?.settings ?? null;
}

// What's saved about the players, keyed "<game>/<topic>" as the tests describe it (see
// test/saved-players.js; the saved layout itself is tested in app/lib/player-data.test.js).
function storedPlayers() {
  return asVersion1(JSON.parse(window.localStorage.getItem(playersKey)));
}

async function addPlayer(user, name, age = "k3") {
  const dialog = screen.getByRole("dialog", { name: whoIsPlaying });
  await user.type(within(dialog).getByRole("textbox"), name);
  await user.click(within(dialog).getByRole("radio", { name: age.toUpperCase() }));
  await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));
}

// Opens a game, creating a player called Ada (of a suitable age) if the "Who's playing?" pop-up appears.
// A new player hasn't seen the game's how-to-play card yet: it's closed.
async function openGame(user, gameName, topicName) {
  await user.click(screen.getByRole("button", { name: new RegExp(gameName) }));
  if (screen.queryByRole("dialog", { name: whoIsPlaying })) await addPlayer(user, "Ada", ageFor(gameName));
  await user.click(screen.getByRole("button", { name: new RegExp(topicName) }));
  const howTo = screen.queryByRole("dialog", { name: /^How to play/ });
  if (howTo) await user.click(within(howTo).getByRole("button", { name: /Got it/ }));
}

// A link in the "Home › Game › Topic" breadcrumb trail.
function crumb(name) {
  return within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link", { name: new RegExp(name) });
}

// The front page's games, by name: the book cards and Mochi's car.
function shownGames() {
  return [...document.querySelectorAll("[data-game-name]")].map((card) => card.dataset.gameName);
}

// Lets the next question come up after a right answer (its pause is 0 in tests).
const nextQuestion = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

async function earnCoin(user) {
  for (const letter of ["b", "a", "t"]) {
    await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
  }
  await user.click(screen.getByRole("button", { name: /Check it/ }));
  await nextQuestion();
}

describe("Home", () => {
  it("starts on the game picker", () => {
    render(<GameApp />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we play today?");
    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "R & L Blends", "Magic E", "Letter Jumble - Starters", "Letter Jumble - Movers", "中文認字 · 入門篇", "中文認字 · 進階篇", "量詞配對", "成語", "Challenge", "Rainbow Speed Quest", "Mochi the Rainbow Dragon"]);
  });

  it("has Mochi, arms open, greet the player by name", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    render(<GameApp />);
    expect(await screen.findByRole("heading", { level: 1, name: "Hi Ada! What shall we play today?" })).toBeInTheDocument();
    expect(document.querySelector(".mochi-greeting img")).toHaveAttribute("src", "/images/mochi/welcome.svg");
    expect(screen.queryByRole("button", { name: /Mochi say hello/ })).not.toBeInTheDocument();
  });

  it("shows each game as a big picture, with no speaker buttons", async () => {
    render(<GameApp />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hi there! What shall we play today?");
    const cvc = screen.getByRole("button", { name: /CVC Sounds/ });
    expect(cvc.querySelector(".game-card-picture img")).toHaveAttribute("src", "/images/game-asset/animals/cat.svg");
    expect(cvc.querySelector(".category-card-number")).toBeNull();
    expect(document.querySelector(".game-card-speaker")).toBeNull();
    expect(document.querySelector(".mochi-drive-mochi")).toHaveAttribute("src", "/images/mochi/cloudmobile.svg");
  });

  it("shows Mochi in her convertible by the road to the Rainbow Village; anywhere on the card opens the dragon game", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    const user = userEvent.setup();
    const { unmount } = render(<GameApp />);
    expect(await screen.findByRole("heading", { level: 2, name: /Visit Mochi/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Go to Rainbow Village" }));
    expect(currentPathname()).toBe("/dragon");
    unmount();

    setPathname("/");
    const { unmount: unmount2 } = render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: "Mochi the Rainbow Dragon" }));
    expect(currentPathname()).toBe("/dragon");
    unmount2();

    // The road and the flowers too, not just the car and the sign.
    setPathname("/");
    render(<GameApp />);
    await user.click(await screen.findByText("Spend coins on treats and cuddles"));
    expect(currentPathname()).toBe("/dragon");
  });

  it("plays a Letter Jumble word and earns a rainbow coin", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Animals");
    for (const letter of ["b", "a", "t"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check it/ }));

    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("Amazing!");
    expect(toast).toHaveTextContent("+1");
    expect(toast).toHaveTextContent("You collected a rainbow coin!");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();
    expect(storedPlayers()).toEqual({
      players: [{ name: "Ada", coins: 1, age: "k3", decks: animalsDealt, results: { "letter-jumble/animals": [true] } }],
      current: "Ada",
    });
    expect(sounds.correct).toHaveBeenCalledTimes(1);

    // On to the next word by itself, with no button to press.
    await nextQuestion();
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();
  });

  it("asks to fill every box, then shows the right answer for a wrong word and moves on", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");

    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(screen.getByText("Fill every box before you check.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    for (const letter of ["t", "a", "b"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check it/ }));

    const reveal = screen.getByRole("dialog", { name: "The answer is…" });
    expect(reveal).toHaveTextContent("bat");
    expect(reveal.querySelector(".reveal-mascot img")).toHaveAttribute("src", "/images/mochi/wrong.svg");
    expect(sounds.oops).toHaveBeenCalledTimes(1);
    expect(sounds.correct).not.toHaveBeenCalled();
    expect(screen.getByLabelText(coinsLabel(0))).toBeInTheDocument();
    expect(storedPlayers().players[0].results).toEqual({ "letter-jumble/animals": [false] });

    await user.click(within(reveal).getByRole("button", { name: /Next question/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();
  });

  it("plays a CVC word with one missing letter and swaps a wrong pick", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "CVC Sounds", "Middle Sound");

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Letter 1 of 3, c")).toHaveClass("letter-given");

    await user.click(screen.getByRole("button", { name: "Letter o" }));
    await user.click(screen.getByRole("button", { name: "Letter a" }));
    expect(screen.getByRole("button", { name: "Letter 2 of 3, a" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Letter o" })).not.toHaveClass("tile-used");

    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Amazing!");
  });

  it("moves back through the menus", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "CVC Sounds", "Ending Sound");

    await user.click(crumb("CVC Sounds"));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
    await user.click(crumb("Home"));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we play today?");
  });

  it("shows the spelling guide when a grown-up has turned it on in Parent mode, not in the word menu", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k3", spellingGuide: true }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");
    expect(screen.getByLabelText("Spelling guide")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Letter 1 of 3, empty, single sound" })).toHaveClass("letter-slot-guide-other");

    await user.click(screen.getByRole("button", { name: "Browse Animals words" }));
    expect(within(screen.getByRole("dialog")).queryByRole("switch")).not.toBeInTheDocument();
  });

  it("shows the spelling guide only in the Letter Jumble game it's turned on for", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k3", spellingGuide: ["starters"] }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");
    expect(screen.queryByLabelText("Spelling guide")).not.toBeInTheDocument();
  });
});

describe("players", () => {
  it("asks who is playing before entering a game, and stays on the picker if closed", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    const dialog = screen.getByRole("dialog", { name: whoIsPlaying });
    expect(within(dialog).getByLabelText(/name/)).toHaveFocus();
    expect(within(dialog).queryByRole("list")).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we play today?");
  });

  it("creates a new player with a name and age, and opens the chosen game", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    expect(within(screen.getByRole("radiogroup", { name: /Which class/ })).getAllByRole("radio").map((radio) => radio.textContent))
      .toEqual(["K1", "K2", "K3"]);
    await addPlayer(user, "Mia", "k1");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
    expect(screen.getByRole("button", { name: "Playing as Mia, 0 rainbow coins. Player options" })).toBeInTheDocument();
    expect(storedPlayers()).toEqual({ players: [{ name: "Mia", coins: 0, age: "k1" }], current: "Mia" });
  });

  it("shows a message instead of creating a blank or duplicate player", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0 }], current: null }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    const dialog = screen.getByRole("dialog", { name: whoIsPlaying });
    await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Please type a name.");

    await user.type(within(dialog).getByRole("textbox"), "ADA");
    await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Ada is already a player.");

    await user.clear(within(dialog).getByRole("textbox"));
    await user.type(within(dialog).getByRole("textbox"), "Theo");
    await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Please choose which class you’re in.");
    expect(storedPlayers().players).toHaveLength(1);
  });

  it("picks an existing player and shows their coins", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 3, age: "k3" }, { name: "Elly", coins: 8, age: "k3" }],
      current: null,
    }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /Letter Jumble - Movers/ }));
    const list = within(screen.getByRole("dialog", { name: whoIsPlaying })).getByRole("list", { name: "Players" });
    expect(within(list).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "AAda3 rainbow coins",
      "EElly8 rainbow coins",
    ]);
    await user.click(within(list).getByRole("button", { name: /Elly/ }));
    await user.click(screen.getByRole("button", { name: /Animals/ }));

    expect(screen.getByLabelText(coinsLabel(8))).toBeInTheDocument();
  });

  it("remembers the player, so entering another game doesn't ask again", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 2, age: "k3" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /Letter Jumble - Movers/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Letter Jumble");
  });

  it("switches player mid-game and stores coins under the new player", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");
    await earnCoin(user);
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: "Switch player" }));
    await addPlayer(user, "Elly");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Animals");
    expect(screen.getByLabelText(coinsLabel(0))).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Browse Animals words/ }));
    await user.click(screen.getByRole("button", { name: /^01\s*Bat/ }));
    await earnCoin(user);

    expect(storedPlayers()).toEqual({
      players: [
        { name: "Ada", coins: 1, age: "k3", progress: { "letter-jumble/animals": 1 }, decks: animalsDealt, results: { "letter-jumble/animals": [true] } },
        { name: "Elly", coins: 1, age: "k3", progress: { "letter-jumble/animals": 1 }, decks: animalsDealt, results: { "letter-jumble/animals": [true] } },
      ],
      current: "Elly",
    });
  });

  it("logs out back to the picker and asks again next time", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");

    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we play today?");
    expect(screen.queryByRole("button", { name: /Player options/ })).not.toBeInTheDocument();
    expect(storedPlayers()).toEqual({ players: [{ name: "Ada", coins: 0, age: "k3", decks: animalsDealt }], current: null });

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    expect(screen.getByRole("dialog", { name: whoIsPlaying })).toBeInTheDocument();
  });
});

describe("rainbow dragon", () => {
  it("asks who is playing, then spends their coins on Mochi", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 4, age: "k1" }], current: null }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /Rainbow Dragon/ }));
    await user.click(within(screen.getByRole("dialog", { name: whoIsPlaying })).getByRole("button", { name: /Ada/ }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mochi the Rainbow Dragon");
    expect(screen.getByTestId("dragon-scene")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Grooming/ }));
    await user.click(screen.getByRole("button", { name: /Bath, 3 rainbow coins/ }));
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();
    expect(storedPlayers().players).toEqual([{ name: "Ada", coins: 1, age: "k1" }]);
  });
});

describe("ages", () => {
  it("shows each age group only their own games, plus the dragon", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 0, age: "k1" }, { name: "Elly", coins: 0, age: "k3" }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "R & L Blends", "Magic E", "中文認字 · 入門篇", "K1 Challenge", "Rainbow Speed Quest", "Mochi the Rainbow Dragon"]);

    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: "Switch player" }));
    await user.click(within(screen.getByRole("list", { name: "Players" })).getByRole("button", { name: /Elly/ }));
    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "R & L Blends", "Magic E", "Letter Jumble - Starters", "Letter Jumble - Movers", "中文認字 · 進階篇", "量詞配對", "成語", "K3 Challenge", "Rainbow Speed Quest", "Mochi the Rainbow Dragon"]);
  });

  it("lists games under Phonics, Cambridge YLE training, 中文, Math and Visit Mochi, hiding empty headings", () => {
    const groups = () => screen.getAllByRole("heading", { level: 2 }).map((heading) => [
      heading.textContent.replace(heading.querySelector(".game-group-icon").textContent, ""),
      [...heading.closest("section").querySelectorAll("[data-game-name]")].map((card) => card.dataset.gameName),
    ]);
    const { unmount } = render(<GameApp />);
    expect(groups()).toEqual([
      ["Phonics", ["CVC Sounds", "Consonant Digraphs", "R & L Blends", "Magic E"]],
      ["Cambridge YLE training", ["Letter Jumble - Starters", "Letter Jumble - Movers"]],
      ["中文", ["中文認字 · 入門篇", "中文認字 · 進階篇", "量詞配對", "成語"]],
      ["Math", ["Challenge", "Rainbow Speed Quest"]],
      ["Visit Mochi", ["Mochi the Rainbow Dragon"]],
    ]);
    unmount();

    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    render(<GameApp />);
    expect(groups().map(([name]) => name)).toEqual(["Phonics", "中文", "Math", "Visit Mochi"]);
  });

  it("shows every game to visitors before anyone is playing", () => {
    render(<GameApp />);
    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "R & L Blends", "Magic E", "Letter Jumble - Starters", "Letter Jumble - Movers", "中文認字 · 入門篇", "中文認字 · 進階篇", "量詞配對", "成語", "Challenge", "Rainbow Speed Quest", "Mochi the Rainbow Dragon"]);
  });

  it("stays on the picker when the chosen game isn't for the new player's age", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /Letter Jumble - Movers/ }));
    await addPlayer(user, "Mia", "k1");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we play today?");
    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "R & L Blends", "Magic E", "中文認字 · 入門篇", "K1 Challenge", "Rainbow Speed Quest", "Mochi the Rainbow Dragon"]);
  });

  it("asks a player saved before ages existed which class they are in", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 5 }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    const dialog = screen.getByRole("dialog", { name: "Which class is Ada in?" });
    await user.click(within(dialog).getByRole("radio", { name: "K1" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
    expect(storedPlayers()).toEqual({ players: [{ name: "Ada", coins: 5, age: "k1" }], current: "Ada" });
  });
});

describe("progress", () => {
  it("carries on from the word the player got up to", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");
    await earnCoin(user);
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();

    await user.click(crumb("Letter Jumble - Movers"));
    expect(screen.getByRole("button", { name: /Animals/ })).toHaveTextContent("1 of 13 words learned");
    expect(screen.getByRole("button", { name: /Body and Face/ })).toHaveTextContent("13 words to learn");

    // Like reloading the page: the address stays on the game's topic list.
    unmount();
    expect(currentPathname()).toBe("/movers");
    render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: /Animals/ }));
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();
  });

  it("offers a visit to Mochi when a topic is finished, without the confetti", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada", coins: 0, age: "k3", progress: { "letter-jumble/animals": 12 }, decks: animalsDeck,
        results: { "letter-jumble/animals": Array(12).fill(true) },
      }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");
    for (const letter of ["w", "h", "a", "l", "e"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    await nextQuestion();

    const praise = await screen.findByRole("dialog", { name: "You did it!" });
    expect(praise.querySelector(".completion-confetti")).toBeNull();
    await user.click(within(praise).getByRole("button", { name: "Visit Mochi" }));
    expect(currentPathname()).toBe("/dragon");
    expect(screen.queryByRole("dialog", { name: "You did it!" })).not.toBeInTheDocument();
  });

  it("offers to try again, not a visit to Mochi, when some answers were wrong", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada", coins: 0, age: "k3", progress: { "letter-jumble/animals": 12 }, decks: animalsDeck,
        results: { "letter-jumble/animals": [false, ...Array(11).fill(true)] },
      }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");
    for (const letter of ["w", "h", "a", "l", "e"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    await nextQuestion();

    const card = await screen.findByRole("dialog", { name: "Good try!" });
    expect(within(card).getAllByRole("button").map((button) => button.textContent.trim())).toEqual(["Try again", "Back to all topics →"]);
    await user.click(within(card).getByRole("button", { name: "Try again" }));
    expect(screen.queryByRole("dialog", { name: "Good try!" })).not.toBeInTheDocument();
    expect(currentPathname()).toBe("/movers/animals");
    expect(screen.getByLabelText("Word 1 of 13")).toBeInTheDocument();
  });

  it("doesn't offer Mochi at the end of a topic when a grown-up has turned her off", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada", coins: 0, age: "k3", progress: { "letter-jumble/animals": 12 }, decks: animalsDeck,
        results: { "letter-jumble/animals": Array(12).fill(true) }, gameSettings: { dragon: false },
      }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");
    for (const letter of ["w", "h", "a", "l", "e"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    await nextQuestion();

    const praise = await screen.findByRole("dialog", { name: "You did it!" });
    expect(within(praise).queryByRole("button", { name: "Visit Mochi" })).not.toBeInTheDocument();
  });

  it("celebrates finishing a topic, then goes back to the topic list and starts it again next time", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada", coins: 0, age: "k3", progress: { "letter-jumble/animals": 12 }, decks: animalsDeck,
        results: { "letter-jumble/animals": Array(12).fill(true) },
      }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble - Movers", "Animals");
    expect(screen.getByLabelText("Word 13 of 13")).toBeInTheDocument();

    for (const letter of ["w", "h", "a", "l", "e"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    await nextQuestion();

    const praise = (await screen.findByRole("dialog", { name: "You did it!" }));
    expect(praise).toHaveTextContent("13 / 13 right");
    expect(praise).toHaveTextContent("You got every Animals word right.");
    expect(praise).toHaveTextContent("New badge! Animals is in your badge collection.");
    expect(sounds.sparkle).toHaveBeenCalled();
    expect(storedPlayers().players[0].progress).toEqual({ "letter-jumble/animals": 0 });
    expect(storedPlayers().players[0].badges).toEqual(["letter-jumble/animals"]);

    await user.click(within(praise).getByRole("button", { name: /Back to all topics/ }));
    expect(currentPathname()).toBe("/movers");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Animals/ })).toHaveTextContent("13 words to learn");

    await user.click(screen.getByRole("button", { name: /Animals/ }));
    expect(screen.getByLabelText("Word 1 of 13")).toBeInTheDocument();
  });

  it("praises finishing a Chinese topic in Chinese", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada", coins: 0, age: "k1", progress: { "chinese/clothes": 6 },
        decks: { "chinese/clothes": inOrder(7) }, results: { "chinese/clothes": Array(6).fill(true) },
      }],
      current: "Ada",
    }));
    setPathname("/chinese/clothes");
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(await screen.findByRole("button", { name: "top" }));
    await nextQuestion();

    const praise = (await screen.findByRole("dialog", { name: "你好叻呀！" }));
    expect(praise).toHaveTextContent("7 / 7 答對");
    expect(praise).toHaveTextContent("「衣物」全部答對");
    expect(praise).toHaveTextContent("你得到「衣物」徽章！");
    await user.click(within(praise).getByRole("button", { name: /返回所有主題/ }));
    expect(currentPathname()).toBe("/chinese");
  });

  it("keeps separate progress for each CVC mode", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada",
        coins: 0,
        age: "k1",
        progress: { "cvc/middle-sound": 5 },
        decks: { "cvc/middle-sound": [...Array(10).keys()] },
      }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "CVC Sounds", "Middle Sound");
    expect(screen.getByLabelText("Word 6 of 10")).toBeInTheDocument();
    await user.click(crumb("CVC Sounds"));
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));
    expect(screen.getByLabelText("Word 1 of 10")).toBeInTheDocument();
  });

  it("plays the correct-answer sound only for a correct answer", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "CVC Sounds", "Beginning Sound");

    await user.click(screen.getByRole("button", { name: "Letter j" }));
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(sounds.correct).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Letter c" }));
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(sounds.correct).toHaveBeenCalledTimes(1);
  });
});

describe("chinese characters", () => {
  it("lets a 3-4 year old match a character to its picture and earn a coin", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /中文認字/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("中文認字");
    expect(screen.getByRole("button", { name: /顏色/ })).toHaveTextContent("13 個字");
    await user.click(screen.getByRole("button", { name: /顏色/ }));

    expect(screen.getByText("紅")).toHaveClass("chinese-character");
    await user.click(screen.getByRole("button", { name: "red" }));
    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("做得好！");
    expect(toast).toHaveTextContent("你得到一個彩虹金幣！");
    expect(sounds.correct).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();

    await nextQuestion();
    expect(screen.getByText("橙")).toHaveClass("chinese-character");
    expect(storedPlayers().players[0].progress).toEqual({ "chinese/colours": 1 });

    await user.click(crumb("中文認字 · 入門篇"));
    expect(screen.getByRole("button", { name: /顏色/ })).toHaveTextContent("已學 1 / 13 個字");
  });

  it("isn't offered to 5-6 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("中文認字 · 入門篇");
  });

  it("offers a food topic whose rounds show phrases under the character", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /中文認字/ }));
    expect(screen.getAllByRole("button").filter((button) => button.classList.contains("category-card")).map((card) => card.querySelector(".category-card-name").textContent))
      .toEqual(["顏色", "食物", "水果", "動物", "衣物", "大自然"]);
    await user.click(screen.getByRole("button", { name: /食物/ }));

    expect(screen.getByText("餅", { selector: ".chinese-character" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "聽「餅乾」" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "biscuit" }));
    expect(screen.getByRole("status")).toHaveTextContent("！");
    expect(sounds.correct).toHaveBeenCalledTimes(1);
  });
});

describe("routes", () => {
  const seedPlayer = (age = "k1") => window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age }], current: "Ada" }));

  it("gives every game and topic its own address", async () => {
    seedPlayer();
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    expect(currentPathname()).toBe("/cvc");
    await user.click(screen.getByRole("button", { name: /Middle Sound/ }));
    expect(currentPathname()).toBe("/cvc/middle-sound");
    await user.click(crumb("CVC Sounds"));
    expect(currentPathname()).toBe("/cvc");
    await user.click(crumb("Home"));
    expect(currentPathname()).toBe("/");

    await user.click(screen.getByRole("button", { name: /Rainbow Dragon/ }));
    expect(currentPathname()).toBe("/dragon");
  });

  it("opens a topic straight from its address", async () => {
    seedPlayer();
    setPathname("/chinese/food");
    render(<GameApp />);
    expect(await screen.findByText("餅", { selector: ".chinese-character" })).toBeInTheDocument();
  });

  it("follows the back and forward buttons", async () => {
    seedPlayer();
    render(<GameApp />);
    act(() => setPathname("/cvc"));
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
    act(() => setPathname("/"));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we play today?");
  });

  it("asks who's playing when a game's address is opened with nobody playing, then opens it", async () => {
    setPathname("/cvc");
    const user = userEvent.setup();
    render(<GameApp />);

    const dialog = await screen.findByRole("dialog", { name: whoIsPlaying });
    expect(currentPathname()).toBe("/");
    await user.type(within(dialog).getByRole("textbox"), "Mia");
    await user.click(within(dialog).getByRole("radio", { name: "K1" }));
    await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));

    expect(currentPathname()).toBe("/cvc");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
  });

  it.each([
    ["an unknown game", "/space-race", "/", "k1"],
    ["an unknown topic", "/cvc/backwards", "/cvc", "k1"],
    ["a game for another age", "/movers/animals", "/", "k1"],
    ["a topic under Mochi's den", "/dragon/anything", "/dragon", "k1"],
  ])("sends %s back up a level", async (label, from, to, age) => {
    seedPlayer(age);
    setPathname(from);
    render(<GameApp />);
    await waitFor(() => expect(currentPathname()).toBe(to));
  });
});

describe("coins in the player chip", () => {
  it("shows the player's coins in their chip, with no link to anywhere", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 12, age: "k1" }], current: "Ada" }));
    render(<GameApp />);
    const chip = await screen.findByRole("button", { name: "Playing as Ada, 12 rainbow coins. Player options" });
    expect(chip.querySelector(".player-chip-coins")).toHaveTextContent("12");
    expect(screen.queryByRole("link", { name: /rainbow coins/ })).not.toBeInTheDocument();
  });

  it("shows no coins when nobody is playing", () => {
    render(<GameApp />);
    expect(screen.queryByLabelText(/rainbow coin/)).not.toBeInTheDocument();
  });
});

describe("CVC shuffling", () => {
  const seed = (extra = {}) => window.localStorage.setItem(playersKey, JSON.stringify({
    players: [{ name: "Ada", coins: 0, age: "k1", ...extra }],
    current: "Ada",
  }));

  it("deals 10 different words at random and keeps them when coming back", async () => {
    seed();
    let calls = 0;
    Math.random.mockImplementation(() => ((calls += 1) * 0.37) % 1);
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    expect(screen.getByRole("button", { name: /Beginning Sound/ })).toHaveTextContent("10 words to learn");
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));

    const dealtSeed = storedPlayers().players[0].decks["cvc/beginning-sound"];
    expect(dealtSeed).toEqual(expect.any(Number));
    const deck = dealtBy(dealtSeed);
    expect(deck).toHaveLength(10);
    expect(new Set(deck).size).toBe(10);
    expect(deck).not.toEqual([...Array(10).keys()]);
    expect(screen.getByLabelText("Word 1 of 10")).toBeInTheDocument();

    await user.click(crumb("CVC Sounds"));
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));
    expect(storedPlayers().players[0].decks["cvc/beginning-sound"]).toBe(dealtSeed);
  });

  it("deals a fresh hand of words after finishing all 10", async () => {
    seed({
      progress: { "cvc/beginning-sound": 9 }, decks: { "cvc/beginning-sound": [...Array(10).keys()] },
      results: { "cvc/beginning-sound": Array(9).fill(true) },
    });
    setPathname("/cvc/beginning-sound");
    const user = userEvent.setup();
    render(<GameApp />);

    // Word 10 of the original order is "jam".
    expect(await screen.findByLabelText("Word 10 of 10")).toBeInTheDocument();
    expect(screen.getByLabelText("Letter 2 of 3, a")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Letter j" }));
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    await nextQuestion();

    const praise = (await screen.findByRole("dialog", { name: "You did it!" }));
    expect(praise).toHaveTextContent("10 / 10 right");
    await user.click(within(praise).getByRole("button", { name: /Back to all topics/ }));
    expect(currentPathname()).toBe("/cvc");
    expect(storedPlayers().players[0].decks).toBeUndefined();
    expect(storedPlayers().players[0].results).toBeUndefined();
  });
});

describe("chinese words for 5-6 year olds", () => {
  it("plays the jobs topic with whole words", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /進階篇/ }));
    expect(currentPathname()).toBe("/chinese-advanced");
    expect(screen.getByRole("button", { name: /職業/ })).toHaveTextContent("34 個字");
    expect(screen.getByRole("button", { name: /家/ })).toHaveTextContent("20 個字");
    await user.click(screen.getByRole("button", { name: /職業/ }));
    expect(currentPathname()).toBe("/chinese-advanced/jobs");

    expect(screen.getByText("警察", { selector: ".chinese-character" })).toHaveClass("chinese-character-pair");
    await user.click(screen.getByRole("button", { name: "police officer" }));
    expect(screen.getByRole("status")).toHaveTextContent("！");
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("fits long words like 飛行服務員 on a wider card", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Elly", coins: 0, age: "k3", progress: { "chinese-advanced/jobs": 10 } }],
      current: "Elly",
    }));
    setPathname("/chinese-advanced/jobs");
    render(<GameApp />);
    expect(screen.getByText("飛行服務員", { selector: ".chinese-character" })).toHaveClass("chinese-character-long", "chinese-character-5");
  });

  it("isn't offered to 3-4 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("中文認字 · 進階篇");
  });

  it("plays the home topic", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    setPathname("/chinese-advanced/home");
    const user = userEvent.setup();
    render(<GameApp />);

    expect(await screen.findByText("客廳", { selector: ".chinese-character" })).toHaveClass("chinese-character-pair");
    await user.click(screen.getByRole("button", { name: "living room" }));
    expect(screen.getByRole("status")).toHaveTextContent("！");
  });
});

describe("breadcrumbs", () => {
  it("shows Home › game › topic, with the current page last", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    setPathname("/chinese-advanced/jobs");
    const user = userEvent.setup();
    render(<GameApp />);

    const trail = await screen.findByRole("navigation", { name: "Breadcrumb" });
    expect(within(trail).getAllByRole("listitem").map((item) => item.textContent)).toEqual([" Home", "中文認字 · 進階篇", "職業"]);
    expect(within(trail).getByText("職業")).toHaveAttribute("aria-current", "page");
    expect(within(trail).getByRole("link", { name: /Home/ })).toHaveAttribute("href", "/");

    await user.click(crumb("中文認字 · 進階篇"));
    expect(currentPathname()).toBe("/chinese-advanced");
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem")).toHaveLength(2);
    await user.click(crumb("Home"));
    expect(currentPathname()).toBe("/");
    expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).not.toBeInTheDocument();
  });

  it("shows the trail in Mochi's den", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    setPathname("/dragon");
    render(<GameApp />);
    const trail = await screen.findByRole("navigation", { name: "Breadcrumb" });
    expect(within(trail).getAllByRole("listitem").map((item) => item.textContent)).toEqual([" Home", "Mochi the Rainbow Dragon"]);
  });
});

describe("Magic E", () => {
  const seed = () => window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k1" }], current: "Elly" }));

  it("has a game for each long vowel and a mixed one, for every class", async () => {
    seed();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Magic E/ }));
    expect(currentPathname()).toBe("/magic-e");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Magic E");
    expect(screen.getAllByRole("button").filter((button) => button.classList.contains("category-card")).map((card) => card.querySelector(".category-card-name").textContent))
      .toEqual(["Long A · a_e", "Long I · i_e", "Long O · o_e", "Long U · u_e", "Mixed Magic E"]);
  });

  it("shows the word with its vowel and e missing under one arch, and fills both with the right pair", async () => {
    seed();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Magic E/ }));
    await user.click(screen.getByRole("button", { name: /Long A/ }));

    // With the order pinned, the first word is "bake": b, a gap, k, and a gap for the e.
    expect(screen.getByText("Which vowel and magic e fill the gaps?")).toBeInTheDocument();
    expect(screen.getByLabelText("Gap: a vowel and a magic e")).toBeInTheDocument();
    expect(screen.getByLabelText("Letter 2 of 4, empty")).toBeInTheDocument();
    expect(screen.getByLabelText("Letter 4 of 4, empty")).toBeInTheDocument();
    const choices = within(screen.getByLabelText("Magic e choices")).getAllByRole("button");
    expect(choices.map((choice) => choice.getAttribute("aria-label"))).toEqual(["Letter a, magic e", "Letter i, magic e", "Letter o, magic e", "Letter u, magic e"]);

    await user.click(screen.getByRole("button", { name: "Letter a, magic e" }));
    expect(screen.getByLabelText("Letter 2 of 4, a")).toBeInTheDocument();
    expect(screen.getByLabelText("Letter 4 of 4, e")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(screen.getByRole("status")).toHaveTextContent("!");
    expect(storedPlayers().players[0].results).toEqual({ "magic-e/a-e": [true] });
  });

  it("marks a wrong pair, and both of its boxes", async () => {
    seed();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Magic E/ }));
    await user.click(screen.getByRole("button", { name: /Long A/ }));
    await user.click(screen.getByRole("button", { name: "Letter i, magic e" }));
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(screen.getByLabelText("Letter 2 of 4, i")).toHaveClass("slot-wrong");
    expect(screen.getByLabelText("Letter 4 of 4, e")).toHaveClass("slot-wrong");
  });
});

describe("R & L Blends", () => {
  const seed = () => window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k1" }], current: "Elly" }));

  it("has R Blends, L Blends and Mixed Blends, 10 words each, for 3-4 year olds", async () => {
    seed();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /R & L Blends/ }));
    expect(currentPathname()).toBe("/blends");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("R & L Blends");
    expect(screen.getAllByRole("button").filter((button) => button.classList.contains("category-card")).map((card) => card.querySelector(".category-card-name").textContent))
      .toEqual(["R Blends", "L Blends", "Mixed Blends"]);
    expect(screen.getByRole("button", { name: /Mixed Blends/ })).toHaveTextContent("10 words to learn");
  });

  it("shows the word with its blend missing and fills it with the right blend", async () => {
    seed();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /R & L Blends/ }));
    await user.click(screen.getByRole("button", { name: /R Blends/ }));

    // With the order pinned, the first word is "bread": a wide gap, then "ead".
    expect(screen.getByText("Which blend fills the gap?")).toBeInTheDocument();
    const gap = screen.getByLabelText("Letter 1 of 5, empty");
    expect(gap).toHaveClass("letter-slot-wide");
    expect(within(screen.getByLabelText("Blend choices")).getAllByRole("button")).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "Letter br" }));
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(screen.getByRole("status")).toHaveTextContent("!");
    expect(storedPlayers().players[0].results).toEqual({ "blends/r-blends": [true] });
  });
});

describe("Consonant Digraphs", () => {
  const seed = () => window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k1" }], current: "Elly" }));

  it("has three modules of 10 words for 3-4 year olds", async () => {
    seed();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Consonant Digraphs/ }));
    expect(currentPathname()).toBe("/digraphs");
    expect(screen.getAllByRole("button").filter((button) => button.classList.contains("category-card")).map((card) => card.querySelector(".category-card-name").textContent))
      .toEqual(["ch · sh · th", "ph · wh · ck · ng", "Mixed Digraphs"]);
    expect(screen.getByRole("button", { name: /Mixed Digraphs/ })).toHaveTextContent("10 words to learn");
  });

  it("shows the word with a two-letter gap and fills it with the right digraph", async () => {
    seed();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Consonant Digraphs/ }));
    await user.click(screen.getByRole("button", { name: /ch · sh · th/ }));

    // With the order pinned, the first word is "chair": one wide gap, then "air".
    expect(screen.getByLabelText("Word 1 of 10")).toBeInTheDocument();
    expect(dealtBy(storedPlayers().players[0].decks["digraphs/ch-sh-th"])).toHaveLength(10);
    const gap = screen.getByLabelText("Letter 1 of 5, empty");
    expect(gap).toHaveClass("letter-slot-wide");
    expect(screen.getByLabelText("Letter 3 of 5, a")).toHaveClass("letter-given");
    expect(screen.getAllByRole("button", { name: /^Letter (ch|sh|th)$/ })).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "Letter ch" }));
    expect(screen.getByLabelText("Letter 1 of 5, ch")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(screen.getByRole("status")).toHaveTextContent("!");
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("shows the right word after a wrong digraph", async () => {
    seed();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Consonant Digraphs/ }));
    await user.click(screen.getByRole("button", { name: /ch · sh · th/ }));
    await user.click(screen.getByRole("button", { name: "Letter sh" }));
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(screen.getByRole("dialog", { name: "The answer is…" })).toHaveTextContent("chair");
    expect(storedPlayers().players[0].coins).toBe(0);
  });
});

describe("Letter Jumble - Starters", () => {
  it("is offered to 5-6 year olds before Movers, with Pets and Farm and Wild Animals", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);
    expect(shownGames().indexOf("Letter Jumble - Starters")).toBe(shownGames().indexOf("Letter Jumble - Movers") - 1);

    await user.click(screen.getByRole("button", { name: /Letter Jumble - Starters/ }));
    expect(currentPathname()).toBe("/starters");
    expect(screen.getByRole("button", { name: /Pets and Farm/ })).toHaveTextContent("17 words to learn");
    expect(screen.getByRole("button", { name: /Wild Animals/ })).toHaveTextContent("20 words to learn");
  });

  it("spells a Starters word and earns a coin", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Letter Jumble - Starters/ }));
    await user.click(screen.getByRole("button", { name: /Pets and Farm/ }));

    // With the order pinned, the first word is "cat".
    expect(screen.getByLabelText("Word 1 of 17")).toBeInTheDocument();
    for (const letter of ["c", "a", "t"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(screen.getByRole("status")).toHaveTextContent("!");
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("isn't offered to 3-4 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("Letter Jumble - Starters");
  });

  it("shows the hyphen in T-shirt and only asks for its letters", async () => {
    // T-shirt (word 7) dealt second, with the first word done: a round in progress keeps its order.
    const key = "starters/clothing-and-accessories";
    const deck = { [key]: [0, 7, ...[...Array(18).keys()].filter((index) => index !== 0 && index !== 7)] };
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Elly", coins: 0, age: "k3", decks: deck, progress: { [key]: 1 }, results: { [key]: [true] } }], current: "Elly",
    }));
    setPathname("/starters/clothing-and-accessories");
    const user = userEvent.setup();
    render(<GameApp />);

    expect(await screen.findByLabelText("Letter 2 of 7, -")).toHaveClass("letter-given");
    const tiles = screen.getAllByRole("button", { name: /^Letter [a-z]$/ }).map((tile) => tile.getAttribute("aria-label").at(-1));
    expect(tiles.sort()).toEqual(["h", "i", "r", "s", "t", "t"]);
    for (const letter of ["t", "s", "h", "i", "r", "t"]) {
      await user.click(screen.getAllByRole("button", { name: `Letter ${letter}` }).find((tile) => !tile.disabled && !tile.classList.contains("tile-used")));
    }
    await user.click(screen.getByRole("button", { name: /Check it/ }));
    expect(screen.getByRole("status")).toHaveTextContent("!");
  });
});

describe("感受 (feelings)", () => {
  it("fills the gap in a sentence with a feeling, each choice showing Mochi or Tofu", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    setPathname("/chinese-advanced/feelings");
    const user = userEvent.setup();
    render(<GameApp />);
    // With the order pinned, the first sentence is 自信's.
    const sentence = await screen.findByLabelText("小明每天努力練習鋼琴，所以在表演時非常空格。");
    expect(sentence).toBeInTheDocument();
    const choices = within(screen.getByRole("group", { name: "感受的選擇" })).getAllByRole("button");
    expect(choices).toHaveLength(4);
    choices.forEach((choice) => expect(choice.querySelector("img")).toHaveAttribute("src", expect.stringMatching(/^\/images\/(game-asset\/feelings|mochi)\//)));

    await user.click(screen.getByRole("button", { name: /自信/ }));
    expect(screen.getByRole("status")).toHaveTextContent("！");
    expect(storedPlayers().players[0].results).toEqual({ "chinese-advanced/feelings": [true] });
  });
});

describe("measure words", () => {
  it("deals 20 random questions for 5-6 year olds and plays one", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /量詞配對/ }));
    expect(currentPathname()).toBe("/measure-words");
    expect(screen.getByRole("button", { name: /量詞/ })).toHaveTextContent("每次 20 題");
    await user.click(screen.getByRole("button", { name: /量詞/ }));

    const deck = dealtBy(storedPlayers().players[0].decks["measure-words/measure-words"]);
    expect(deck).toHaveLength(20);
    expect(screen.getByLabelText("Word 1 of 20")).toBeInTheDocument();

    // With the order pinned, the first question is 一個橙.
    expect(screen.getByLabelText("一個，空格")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /橙/ }));
    expect(screen.getByRole("status")).toHaveTextContent("！");
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("isn't offered to 3-4 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("量詞配對");
  });
});

describe("成語", () => {
  it("fills the gap in an idiom for 5-6 year olds", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /成語/ }));
    expect(currentPathname()).toBe("/idioms");
    await user.click(screen.getByRole("button", { name: /成語/ }));

    expect(dealtBy(storedPlayers().players[0].decks["idioms/idioms"])).toHaveLength(20);
    expect(screen.getByLabelText("Word 1 of 20")).toBeInTheDocument();

    // With the order pinned, the first question is 打草驚蛇.
    expect(screen.getByText("比喻做事不機密，使對方起了警覺。")).toBeInTheDocument();
    expect(screen.getByLabelText("打草驚空格")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "蛇" }));
    expect(screen.getByRole("status")).toHaveTextContent("！");
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("isn't offered to 3-4 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("成語");
  });
});

describe("answers move around", () => {
  // Where 紅's picture sits, when it's the first question of a dealt hand (`deck`, a seed).
  function redSpot(deck) {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1", decks: { "chinese/colours": deck } }], current: "Ada" }));
    setPathname("/chinese/colours");
    const { unmount } = render(<GameApp />);
    const spot = [...document.querySelectorAll(".chinese-option")].findIndex((option) => option.dataset.character === "紅");
    unmount();
    return spot;
  }

  it("puts the right answer in a different place with each new deal, but not on a reload", () => {
    // Each deal is saved as its own seed (with the order pinned, 紅 is always dealt first).
    const deals = [11, 22, 33, 44, 55, 66];
    const spots = deals.map(redSpot);
    spots.forEach((spot) => expect(spot).toBeGreaterThanOrEqual(0));
    expect(new Set(spots).size).toBeGreaterThan(1);
    expect(redSpot(deals[2])).toBe(spots[2]);
  });
});

describe("one try per question", () => {
  const seedClothes = (results, extra = {}) => window.localStorage.setItem(playersKey, JSON.stringify({
    players: [{
      name: "Ada", coins: 0, age: "k1", progress: { "chinese/clothes": 6 },
      decks: { "chinese/clothes": inOrder(7) }, results: { "chinese/clothes": results }, ...extra,
    }],
    current: "Ada",
  }));

  it("shows the right picture and character after a wrong pick, with no coin and no second try", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    setPathname("/chinese/colours");
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(await screen.findByRole("button", { name: "orange" }));
    const reveal = screen.getByRole("dialog", { name: "正確答案是……" });
    expect(reveal).toHaveTextContent("紅");
    expect(reveal.querySelector(".reveal-picture")).toHaveAttribute("src", "/images/game-asset/colours/red.svg");
    expect(screen.getByRole("button", { name: "red" })).toBeDisabled();
    expect(screen.getByLabelText(coinsLabel(0))).toBeInTheDocument();

    await user.click(within(reveal).getByRole("button", { name: /下一題/ }));
    expect(screen.getByText("橙")).toHaveClass("chinese-character");
    expect(storedPlayers().players[0].results).toEqual({ "chinese/colours": [false] });
  });

  it("shows the score at the end, and no badge unless every answer was right", async () => {
    seedClothes([true, false, true, true, false, true]);
    setPathname("/chinese/clothes");
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(await screen.findByRole("button", { name: "top" }));
    await nextQuestion();

    const done = (await screen.findByRole("dialog", { name: "繼續加油！" }));
    expect(within(done).getByLabelText("5 / 7 答對")).toBeInTheDocument();
    expect(done).toHaveTextContent("全部答對就可以得到「衣物」徽章，再試一次吧！");
    expect(storedPlayers().players[0].badges).toBeUndefined();

    // Trying again starts a new score.
    await user.click(within(done).getByRole("button", { name: /返回所有主題/ }));
    expect(storedPlayers().players[0].results).toBeUndefined();
  });

  it("counts a skipped question as not right", async () => {
    seedClothes([true, true, null, true, true, true]);
    setPathname("/chinese/clothes");
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(await screen.findByRole("button", { name: "top" }));
    await nextQuestion();
    expect(within((await screen.findByRole("dialog", { name: "繼續加油！" }))).getByLabelText("6 / 7 答對")).toBeInTheDocument();
  });

  it("awards the badge for a perfect score, even after a wrong last answer the first time round", async () => {
    seedClothes(Array(6).fill(true));
    setPathname("/chinese/clothes");
    const user = userEvent.setup();
    render(<GameApp />);

    const wrong = (await screen.findAllByRole("button")).find((button) => button.classList.contains("chinese-option") && button.getAttribute("aria-label") !== "top");
    await user.click(wrong);
    await user.click(within(screen.getByRole("dialog", { name: "正確答案是……" })).getByRole("button", { name: /下一題/ }));
    expect(within((await screen.findByRole("dialog", { name: "繼續加油！" }))).getByLabelText("6 / 7 答對")).toBeInTheDocument();
    expect(storedPlayers().players[0].badges).toBeUndefined();
  });

  it("only counts the first answer, so going back can't change the score", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    setPathname("/chinese/colours");
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(await screen.findByRole("button", { name: "orange" }));
    await user.click(within(screen.getByRole("dialog", { name: "正確答案是……" })).getByRole("button"));
    await user.click(screen.getByRole("button", { name: /Browse/ }));
    await user.click(screen.getByRole("button", { name: /^01/ }));
    await user.click(screen.getByRole("button", { name: "red" }));
    expect(storedPlayers().players[0].results).toEqual({ "chinese/colours": [false] });
  });
});

describe("badges", () => {
  // "My badges" in the player menu opens the badge page.
  const openBadges = async (user) => {
    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: /My badges/ }));
    expect(currentPathname()).toBe("/badges");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    return screen.getByRole("region", { name: "Ada’s badges" });
  };

  it("shows earned badges and a placeholder for every unfinished topic of the player's games", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 0, age: "k3", badges: ["letter-jumble/animals", "idioms/idioms"] }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    const collection = await openBadges(user);

    expect(within(collection).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent))
      .toEqual(["CVC Sounds", "Consonant Digraphs", "R & L Blends", "Magic E", "Letter Jumble - Starters", "Letter Jumble - Movers", "中文認字 · 進階篇", "量詞配對", "成語", "K3 Challenge", "Rainbow Speed Quest"]);
    expect(collection).toHaveTextContent("2 of 64 badges");
    expect(within(collection).getByRole("listitem", { name: "Animals: earned" })).toBeInTheDocument();
    expect(within(collection).getByRole("listitem", { name: "成語: earned" })).toBeInTheDocument();
    const movers = within(collection).getByRole("region", { name: "Letter Jumble - Movers" });
    expect(within(movers).getByRole("listitem", { name: "Body and Face: not earned yet" })).toBeInTheDocument();

    // The breadcrumb leads back home.
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem").map((item) => item.textContent))
      .toEqual([" Home", "My badges"]);
    await user.click(crumb("Home"));
    expect(currentPathname()).toBe("/");
  });

  it("shows each Rainbow Speed Quest topic's fastest time under its badge", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 0, age: "k1", badges: ["speed-quest/within-10"], records: { "speed-quest/within-10": 42500 } }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    const collection = await openBadges(user);
    const speed = within(collection).getByRole("region", { name: "Rainbow Speed Quest" });
    expect(within(speed).getByRole("listitem", { name: "Within 10: earned · Fastest: 0:42" })).toHaveTextContent("Fastest: 0:42");
    expect(within(speed).getByRole("listitem", { name: "Within 20: not earned yet · No record yet" })).toBeInTheDocument();
    // Other games' badges have no time.
    expect(within(collection).getByRole("region", { name: "CVC Sounds" })).not.toHaveTextContent(/Fastest|No record/);
  });

  it("shows a module's badge on its card once it's been finished with every answer right", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k3", badges: ["letter-jumble/animals"] }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Letter Jumble - Movers/ }));
    const card = (name) => screen.getAllByRole("button").find((button) => button.querySelector(".category-card-name")?.textContent === name);
    expect(within(card("Animals")).getByRole("img", { name: "Full score badge" })).toHaveAttribute("src", "/images/badges/letter-jumble/animals.svg");
    expect(within(card("Body and Face")).queryByRole("img", { name: "Full score badge" })).toBeNull();
    // No numbers on the cards any more.
    expect(document.querySelector(".category-card-number")).toBeNull();
  });

  it("sends the badge page home when nobody is playing", async () => {
    setPathname("/badges");
    render(<GameApp />);
    await waitFor(() => expect(currentPathname()).toBe("/"));
    expect(screen.queryByRole("region", { name: /badges/ })).not.toBeInTheDocument();
  });

  it("encourages a player with no badges yet", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    const collection = await openBadges(user);
    expect(collection).toHaveTextContent("0 of 43 badges");
    expect(collection).toHaveTextContent("Get every answer in a topic right to earn its badge!");
  });

  it("doesn't award the same badge twice", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada", coins: 0, age: "k1", progress: { "chinese/clothes": 6 }, badges: ["chinese/clothes"],
        decks: { "chinese/clothes": inOrder(7) }, results: { "chinese/clothes": Array(6).fill(true) },
      }],
      current: "Ada",
    }));
    setPathname("/chinese/clothes");
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: "top" }));
    await nextQuestion();
    expect((await screen.findByRole("dialog", { name: "你好叻呀！" }))).not.toHaveTextContent("徽章");
    expect(storedPlayers().players[0].badges).toEqual(["chinese/clothes"]);
  });
});

describe("tour for a new family", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.setItem(siteKey, JSON.stringify({ language: "en", howToSeen: [] }));
  });

  async function createFirstPlayer(user) {
    const welcome = await screen.findByRole("dialog", { name: "Welcome to Rainbow Academy!" });
    await user.type(within(welcome).getByRole("textbox"), "Ada");
    await user.click(within(welcome).getByRole("radio", { name: "K1" }));
    await user.click(within(welcome).getByRole("button", { name: /Let’s Start/ }));
  }

  it("asks which language they'd like, then points out the books, Mochi, the player menu and Parent mode", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await createFirstPlayer(user);

    const language = screen.getByRole("dialog", { name: "Hello, what language do you prefer?" });
    expect(language).toHaveTextContent("你好！你想用哪種語言？");
    await user.click(within(language).getByRole("button", { name: "繁體中文" }));

    // The site and the rest of the tour are in Chinese now.
    expect(savedSettings()).toMatchObject({ language: "zh" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("今天玩甚麼？");
    expect(screen.getByRole("dialog", { name: "選一本魔法書！" })).toHaveTextContent("1 / 4");
    await user.click(screen.getByRole("button", { name: /下一步/ }));
    expect(screen.getByRole("dialog", { name: "探望 Mochi" })).toHaveTextContent("彩虹金幣");
    await user.click(screen.getByRole("button", { name: /上一步/ }));
    expect(screen.getByRole("dialog", { name: "選一本魔法書！" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /下一步/ }));
    await user.click(screen.getByRole("button", { name: /下一步/ }));
    expect(screen.getByRole("dialog", { name: "玩家選單" })).toHaveTextContent("轉換玩家");
    await user.click(screen.getByRole("button", { name: /下一步/ }));
    expect(screen.getByRole("dialog", { name: "家長模式" })).toHaveTextContent("其他年齡組別");
    await user.click(screen.getByRole("button", { name: /開始玩吧/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(savedSettings()).toMatchObject({ tutorialSeen: true });
  });

  it("can be skipped, in English, and isn't shown again", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<GameApp />);
    await createFirstPlayer(user);
    await user.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByRole("dialog", { name: "Pick a magic book!" })).toHaveTextContent("1 of 4");
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(savedSettings()).toMatchObject({ language: "en", tutorialSeen: true });
    unmount();

    // A new visit: no welcome card or tour, now there's a player and the tour was seen.
    window.sessionStorage.clear();
    render(<GameApp />);
    await screen.findByRole("heading", { level: 1, name: /What shall we play today/ });
    expect(screen.queryByRole("dialog", { name: /what language/ })).not.toBeInTheDocument();
  });
});

describe("welcome card", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("greets a new family in English, with no language switch, and makes their first player", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    const welcome = await screen.findByRole("dialog", { name: "Welcome to Rainbow Academy!" });
    expect(welcome).toHaveTextContent("This app was created by a software engineer and a mother of two");
    expect(welcome).toHaveTextContent("Learn, Play, Shine!");
    expect(welcome.querySelector(".welcome-logo")).toHaveAttribute("src", "/images/logo.png");
    expect(within(welcome).queryByRole("switch")).not.toBeInTheDocument();
    expect(document.querySelector(".brand-logo")).toHaveAttribute("src", "/images/logo-name-beta.png");

    // "Let's Start" creates the player from the form (and asks for what's missing first).
    await user.click(within(welcome).getByRole("button", { name: /Let’s Start/ }));
    expect(within(welcome).getByRole("alert")).toHaveTextContent("Please type a name.");
    await user.type(within(welcome).getByRole("textbox"), "Ada");
    await user.click(within(welcome).getByRole("radio", { name: "K1" }));
    await user.click(within(welcome).getByRole("button", { name: /Let’s Start/ }));

    // The welcome card closes and the new player's tour starts.
    expect(screen.queryByRole("dialog", { name: /Welcome/ })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Hello, what language do you prefer?" })).toBeInTheDocument();
    expect(storedPlayers()).toEqual({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" });
    expect(savedSettings()).toMatchObject({ language: "en" });
  });

  it("greets in 繁體 once the site's language has been changed in the player menu", async () => {
    window.localStorage.setItem(siteKey, JSON.stringify({ language: "zh", howToSeen: [], tutorialSeen: true }));
    const user = userEvent.setup();
    render(<GameApp />);
    const chinese = await screen.findByRole("dialog", { name: "歡迎來到 Rainbow Academy！" });
    expect(chinese).toHaveTextContent("學中玩，玩中學，每個孩子都能發光發亮！");
    expect(within(chinese).queryByRole("switch")).not.toBeInTheDocument();

    await user.click(within(chinese).getByRole("button", { name: /一起玩吧！/ }));
    expect(within(chinese).getByRole("alert")).toHaveTextContent("請輸入名字。");
    await user.type(within(chinese).getByRole("textbox"), "Ada");
    await user.click(within(chinese).getByRole("radio", { name: "K1（幼兒班）" }));
    await user.click(within(chinese).getByRole("button", { name: /一起玩吧！/ }));
    // The new player keeps the language, and their tour starts.
    expect(screen.queryByRole("dialog", { name: /歡迎/ })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Hello, what language do you prefer?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("今天玩甚麼？");
    expect(savedSettings()).toEqual({ language: "zh", tutorialSeen: false });
  });

  it("isn't shown to a family that already has players", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    render(<GameApp />);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays closed for the rest of the visit once closed", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<GameApp />);
    await user.click(within(await screen.findByRole("dialog", { name: /Welcome/ })).getByRole("button", { name: "Close" }));
    unmount();
    render(<GameApp />);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens from the logo, which also goes home; with players already, its button just closes it", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    setPathname("/cvc");
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(await screen.findByRole("link", { name: "Rainbow Academy home" }));

    expect(currentPathname()).toBe("/");
    const welcome = screen.getByRole("dialog", { name: "Welcome to Rainbow Academy!" });
    expect(within(welcome).queryByRole("textbox")).not.toBeInTheDocument();
    await user.click(within(welcome).getByRole("button", { name: /Let’s Start/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(storedPlayers().players).toHaveLength(1);
  });
});

describe("site language", () => {
  it("switches the site's words from the player menu, but games keep their own language", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k3" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Player options/ }));
    const language = screen.getByRole("menuitemcheckbox", { name: /Language/ });
    expect(language).toHaveAttribute("aria-checked", "false");
    await user.click(language);

    expect(screen.getByRole("menuitemcheckbox", { name: /語言/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitem", { name: /我的徽章/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("今天玩甚麼？");
    expect(screen.getByRole("heading", { level: 2, name: /劍橋英語考試預備/ })).toBeInTheDocument();
    expect(savedSettings()).toMatchObject({ language: "zh" });

    // Inside an English game, the game's words stay English; the breadcrumb is the site's.
    await user.click(screen.getByRole("button", { name: /Letter Jumble - Movers/ }));
    await user.click(screen.getByRole("button", { name: /Animals/ }));
    expect(screen.getByRole("button", { name: /Check it/ })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem")[0]).toHaveTextContent("主頁");
  });
});

describe("how to play", () => {
  beforeEach(() => window.localStorage.setItem(siteKey, JSON.stringify({ language: "en", howToSeen: [] })));

  it("explains a game when its first topic starts, then from the ? beside the title", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k3" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Letter Jumble - Movers/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Animals/ }));
    const howTo = screen.getByRole("dialog", { name: "How to play Letter Jumble - Movers" });
    expect(howTo.querySelector(".how-to-icon")).toBeNull();
    expect(within(howTo).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Look at the picture, tap the speaker if you need a hint.",
      "Tap the letters in spelling order to fill the boxes.",
      "Tap “Check it”.",
      "A right answer earns a rainbow coin. Get a whole topic right to earn its badge and 5 bonus coins!",
    ]);
    await user.click(within(howTo).getByRole("button", { name: /Got it/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const help = screen.getByRole("button", { name: "How to play" });
    expect(help).toHaveTextContent(/^\?$/);
    expect(help.closest(".title-row")).toContainElement(screen.getByRole("heading", { level: 1 }));
    await user.click(help);
    expect(screen.getByRole("dialog", { name: "How to play Letter Jumble - Movers" })).toBeInTheDocument();
  });

  it("shows CVC Sounds' three numbered steps", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    setPathname("/cvc/beginning-sound");
    render(<GameApp />);
    const howTo = await screen.findByRole("dialog", { name: "How to play" });
    expect(howTo.querySelector(".eyebrow")).toBeNull();
    expect(within(howTo).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Look at the picture and tap the speaker icon for a hint.",
      "Tap the letter that fills the gap.",
      "Tap “Check it” when you’re done.",
    ]);
    expect(within(howTo).queryByRole("heading", { name: "Need a revision?" })).not.toBeInTheDocument();
  });

  it("has the ? only beside a module's title, not on a game's list of topics", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    window.localStorage.setItem(siteKey, JSON.stringify({ language: "en", howToSeen: ["chinese"] }));
    setPathname("/chinese");
    const user = userEvent.setup();
    render(<GameApp />);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("中文認字");
    expect(screen.queryByRole("button", { name: "玩法" })).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /顏色/ })[0]);
    expect(screen.getByRole("button", { name: "玩法" })).toBeInTheDocument();
  });

  it("explains both 中文認字 games in three numbered steps, without icons", async () => {
    const steps = ["讀一讀，按喇叭聽聽提示。", "按一按正確的圖畫。", "答對可得到彩虹金幣，全部答對更可得到徽章和額外 5 個彩虹金幣！"];
    for (const [age, path, title] of [["k1", "/chinese/colours", "中文認字 · 入門篇：玩法"], ["k3", "/chinese-advanced/jobs", "中文認字 · 進階篇：玩法"]]) {
      window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age }], current: "Ada" }));
      setPathname(path);
      const { unmount } = render(<GameApp />);
      const howTo = await screen.findByRole("dialog", { name: title });
      expect(howTo.querySelector(".eyebrow")).toBeNull();
      expect(howTo.querySelector(".how-to-icon")).toBeNull();
      expect(within(howTo).getAllByRole("listitem").map((item) => item.textContent)).toEqual(steps);
      unmount();
    }
  });

  it("has an About this game info button, instead of ?, beside CVC Sounds", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    setPathname("/cvc");
    const user = userEvent.setup();
    render(<GameApp />);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "How to play" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "About this game" }));
    const about = screen.getByRole("dialog", { name: "About CVC Sounds" });
    expect(about).toHaveTextContent("The CVC (Consonant-Vowel-Consonant) games are designed to help children develop phonics skills");
    await user.click(within(about).getByRole("button", { name: /Got it/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains Chinese games only in Chinese, and English games only in English, whatever the site's language", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1" }], current: "Ada" }));
    setPathname("/chinese/colours");
    const { unmount } = render(<GameApp />);
    const chinese = await screen.findByRole("dialog", { name: "中文認字 · 入門篇：玩法" });
    expect(chinese).toHaveTextContent("按一按正確的圖畫。");
    unmount();

    window.localStorage.setItem(siteKey, JSON.stringify({ language: "zh", howToSeen: [] }));
    setPathname("/cvc/ending-sound");
    render(<GameApp />);
    expect(await screen.findByRole("dialog", { name: "How to play" })).toHaveTextContent("Tap the letter that fills the gap.");
  });

  it("has how-to-play steps for every game", async () => {
    const { hasHowToPlay } = await import("./components/HowToPlayDialog");
    expect(games.filter((game) => !hasHowToPlay(game.id)).map((game) => game.id)).toEqual([]);
  });
});

describe("shuffle questions", () => {
  it("deals a fresh hand from the whole list for a topic that plays only some of its words", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 0, age: "k1", decks: { "cvc/beginning-sound": inOrder(10) }, progress: { "cvc/beginning-sound": 4 }, results: { "cvc/beginning-sound": [true, false, true, true] } }],
      current: "Ada",
    }));
    setPathname("/cvc/beginning-sound");
    let calls = 0;
    Math.random.mockImplementation(() => ((calls += 1) * 0.37) % 1);
    const user = userEvent.setup();
    render(<GameApp />);
    expect(await screen.findByLabelText("Word 5 of 10")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Browse/ }));
    await user.click(screen.getByRole("button", { name: /Shuffle questions/ }));

    const player = storedPlayers().players[0];
    const dealt = dealtBy(player.decks["cvc/beginning-sound"]);
    expect(dealt).toHaveLength(10);
    expect(dealt).not.toEqual(inOrder(10));
    expect(dealt.some((index) => index >= 10)).toBe(true);
    expect(player.progress["cvc/beginning-sound"]).toBe(0);
    expect(player.results).toBeUndefined();
    expect(screen.getByLabelText("Word 1 of 10")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shuffles every word of a topic that plays them all, labelled in the game's language", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1", decks: { "chinese/clothes": inOrder(7) } }], current: "Ada" }));
    setPathname("/chinese/clothes");
    let calls = 0;
    Math.random.mockImplementation(() => ((calls += 1) * 0.37) % 1);
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: /Browse/ }));
    await user.click(screen.getByRole("button", { name: /打亂題目次序/ }));
    const deck = dealtBy(storedPlayers().players[0].decks["chinese/clothes"]);
    expect([...deck].sort()).toEqual(inOrder(7));
    expect(deck).not.toEqual(inOrder(7));
  });
});

describe("Tofu and Rainbow Village", () => {
  const seedPlayer = (extra) => window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1", ...extra }], current: "Ada" }));

  it("starts in Mochi's den, whose road sign leads to the village and Tofu's house to save up for", async () => {
    seedPlayer({ coins: 37 });
    setPathname("/dragon");
    const user = userEvent.setup();
    render(<GameApp />);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Mochi the Rainbow Dragon");
    expect(screen.queryByRole("button", { name: /Unlock Tofu/ })).not.toBeInTheDocument();

    const sign = screen.getByRole("button", { name: "Go to Rainbow Village" });
    expect(sign.closest(".dragon-stage-wrap")).not.toBeNull();
    await user.click(sign);
    expect(currentPathname()).toBe("/dragon/village");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Rainbow Village");
    expect(document.querySelector(".village-scene")).toHaveAttribute("src", "/images/village/village-start.svg");
    expect(screen.queryByRole("button", { name: /Park/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Visit Tofu’s House" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unlock Tofu: 37 of 100 rainbow coins" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Visit Mochi’s House" }));
    expect(currentPathname()).toBe("/dragon/mochi");
  });

  it("spends 100 coins in the village to unlock Tofu, then meets her in her house", async () => {
    seedPlayer({ coins: 120 });
    setPathname("/dragon/village");
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: "Unlock Tofu for 100 rainbow coins" }));

    expect(currentPathname()).toBe("/dragon/tofu");
    expect(storedPlayers().players[0]).toMatchObject({ coins: 20, unlocks: ["tofu"] });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tofu the Fairy Dragon");
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem").map((item) => item.textContent))
      .toEqual([" Home", "Mochi the Rainbow Dragon", "Tofu’s House"]);
  });

  it("shows each den's note in the site's language", async () => {
    seedPlayer({ unlocks: ["tofu"] });
    window.localStorage.setItem(siteKey, JSON.stringify({ language: "zh", howToSeen: games.map((game) => game.id), tutorialSeen: true }));
    setPathname("/dragon/tofu");
    render(<GameApp />);
    expect(await screen.findByText("Tofu 有點害羞。她喜歡看書、科學和焗蛋糕。")).toHaveAttribute("lang", "zh-Hant-HK");
  });

  it("says what to save up for in the site's language", async () => {
    seedPlayer({ unlocks: ["tofu"] });
    window.localStorage.setItem(siteKey, JSON.stringify({ language: "zh", howToSeen: games.map((game) => game.id), tutorialSeen: true }));
    setPathname("/dragon");
    render(<GameApp />);
    expect(await screen.findByText("儲夠 100 個彩虹金幣，就可以打開公園，讓 Mochi 和 Tofu 一起玩。")).toHaveAttribute("lang", "zh-Hant-HK");
  });

  it("starts at Rainbow Village once Tofu has moved in, with the park locked", async () => {
    seedPlayer({ unlocks: ["tofu"] });
    setPathname("/dragon");
    const user = userEvent.setup();
    render(<GameApp />);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Rainbow Village");
    expect(screen.getByRole("button", { name: "Unlock the park: 0 of 100 rainbow coins" })).toBeDisabled();
    expect(screen.getByText(/Save up 100 rainbow coins to open the park/)).toBeInTheDocument();
    expect(document.querySelector(".village-scene")).toHaveAttribute("src", "/images/village/village.svg");
    expect(screen.queryByRole("button", { name: /Unlock Tofu/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Visit Mochi’s House" }));
    expect(currentPathname()).toBe("/dragon/mochi");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mochi the Rainbow Dragon");
    expect(screen.queryByRole("button", { name: /Unlock Tofu/ })).not.toBeInTheDocument();

    await user.click(crumb("Mochi the Rainbow Dragon"));
    await user.click(screen.getByRole("button", { name: "Visit Tofu’s House" }));
    expect(currentPathname()).toBe("/dragon/tofu");

    await user.click(screen.getByRole("button", { name: "Go to Rainbow Village" }));
    expect(currentPathname()).toBe("/dragon/village");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Rainbow Village");
  });

  it("spends 100 coins in the village to open the park, where Mochi and Tofu play together", async () => {
    seedPlayer({ coins: 130, unlocks: ["tofu"] });
    setPathname("/dragon/village");
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: "Unlock the park for 100 rainbow coins" }));

    expect(currentPathname()).toBe("/dragon/park");
    expect(storedPlayers().players[0]).toMatchObject({ coins: 30, unlocks: ["tofu", "park"] });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The Rainbow Park");
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem").map((item) => item.textContent))
      .toEqual([" Home", "Mochi the Rainbow Dragon", "The Park"]);
    // Just the four activities: no Food or Grooming tabs.
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "Things to do with Mochi and Tofu" })).getAllByRole("button").map((button) => button.textContent))
      .toEqual(["Have a picnic2", "Hide and seek2", "Blow bubbles2", "Ride scooters2", "Dance party2"]);

    await user.click(screen.getByRole("button", { name: "Hide and seek, 2 rainbow coins" }));
    expect(storedPlayers().players[0].coins).toBe(28);
    expect(screen.getByText(/ready or not/)).toBeInTheDocument();

    // Back in the village, the park is open to visit.
    await user.click(screen.getByRole("button", { name: "Go to Rainbow Village" }));
    expect(screen.getByRole("button", { name: "Visit The Park" })).toBeInTheDocument();
    expect(screen.getByText("Who shall we visit today?")).toBeInTheDocument();
  });

  it("has no park to unlock before Tofu moves in, and sends the park's address back until it's open", async () => {
    seedPlayer({ coins: 300 });
    setPathname("/dragon/village");
    const { unmount } = render(<GameApp />);
    await screen.findByRole("heading", { level: 1, name: /Rainbow Village/ });
    expect(screen.queryByRole("button", { name: /park/i })).not.toBeInTheDocument();
    unmount();

    setPathname("/dragon/park");
    render(<GameApp />);
    await waitFor(() => expect(currentPathname()).toBe("/dragon"));
  });

  it("sends Tofu's address back to the start until she's unlocked", async () => {
    seedPlayer({ coins: 5 });
    setPathname("/dragon/tofu");
    render(<GameApp />);
    await screen.findByRole("heading", { level: 1 });
    expect(currentPathname()).toBe("/dragon");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mochi the Rainbow Dragon");
  });
});

describe("parent mode", () => {
  const seedChildren = (extra = {}) => window.localStorage.setItem(playersKey, JSON.stringify({
    players: [{ name: "Ada", coins: 0, age: "k1", ...extra }, { name: "Elly", coins: 0, age: "k3" }],
    current: "Ada",
  }));
  const parentPage = () => screen.getByRole("region", { name: "Parent mode" });

  async function openParentMode(user) {
    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: /Parent mode/ }));
    expect(currentPathname()).toBe("/parent");
  }

  // With Math.random pinned just below 1, the grown-up question is always 11 × 9.
  async function passGrownUpCheck(user) {
    await openParentMode(user);
    expect(within(parentPage()).getByLabelText(/What is/)).toHaveAccessibleName(/^What is 11 × 9 ?\?$/);
    await user.type(within(parentPage()).getByLabelText(/What is/), "99");
    await user.click(within(parentPage()).getByRole("button", { name: /Continue/ }));
  }

  describe("moving game records to another browser", () => {
    const transfer = () => within(parentPage()).getByRole("region", { name: "Transfer game records to another browser" });
    // A code from "another browser" with these players in it.
    const codeFor = (players) => {
      const saved = { [playersKey]: JSON.stringify({ players, current: players[0].name }), [siteKey]: JSON.stringify({ language: "zh", howToSeen: [], tutorialSeen: true }) };
      const keys = Object.keys(saved);
      return makeTransferCode({ length: keys.length, key: (index) => keys[index], getItem: (key) => saved[key] });
    };

    it("explains the steps, and makes a code of this browser's game records to copy", async () => {
      seedChildren({ coins: 37, badges: ["cvc/beginning-sound"] });
      const user = userEvent.setup();
      render(<GameApp />);
      await passGrownUpCheck(user);
      expect(transfer()).toHaveTextContent("In this browser: tap “Generate”, then “Copy” to copy your code.");
      expect(transfer()).toHaveTextContent("Loading a code replaces all the game records in this browser");

      await user.click(within(transfer()).getByRole("button", { name: "Generate" }));
      const code = within(transfer()).getByLabelText("Your code").value;
      expect(code).toMatch(/^RAINBOW1-/);
      const { players } = readTransferCode(code);
      expect(players.map((player) => [player.name, player.coins, player.games.cvc?.badges])).toEqual([["Ada", 37, ["beginning-sound"]], ["Elly", 0, undefined]]);

      await user.click(within(transfer()).getByRole("button", { name: "Copy" }));
      expect(within(transfer()).getByRole("button", { name: "Copied!" })).toBeInTheDocument();
      expect(await navigator.clipboard.readText()).toBe(code);
    });

    it("loads a code from another browser only after showing what it replaces this browser's records with", async () => {
      seedChildren();
      const user = userEvent.setup();
      render(<GameApp />);
      await passGrownUpCheck(user);
      await user.click(within(transfer()).getByLabelText("Paste the code here"));
      await user.paste(codeFor([{ name: "Mia", coins: 12, age: "k2", badges: ["cvc/beginning-sound"] }]));
      await user.click(within(transfer()).getByRole("button", { name: "Load" }));

      const confirm = within(transfer()).getByRole("alertdialog", { name: "Replace this browser’s game records with these children?" });
      expect(confirm).toHaveTextContent("Mia (K2) · 12 rainbow coins");
      // Nothing's replaced until it's confirmed.
      expect(storedPlayers().players.map((player) => player.name)).toEqual(["Ada", "Elly"]);

      await user.click(within(confirm).getByRole("button", { name: "Yes, replace them" }));
      expect(JSON.parse(window.localStorage.getItem(playersKey))).toEqual({ players: [{ name: "Mia", coins: 12, age: "k2", badges: ["cvc/beginning-sound"] }], current: "Mia" });
      expect(JSON.parse(window.localStorage.getItem(siteKey)).language).toBe("zh");
      expect(reloadHome).toHaveBeenCalledTimes(1);
    });

    it("keeps this browser's records when the loading is cancelled", async () => {
      seedChildren();
      const user = userEvent.setup();
      render(<GameApp />);
      await passGrownUpCheck(user);
      await user.click(within(transfer()).getByLabelText("Paste the code here"));
      await user.paste(codeFor([{ name: "Mia", coins: 12, age: "k2" }]));
      await user.click(within(transfer()).getByRole("button", { name: "Load" }));
      await user.click(within(transfer()).getByRole("button", { name: "Cancel" }));
      expect(within(transfer()).queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(storedPlayers().players.map((player) => player.name)).toEqual(["Ada", "Elly"]);
      expect(reloadHome).not.toHaveBeenCalled();
    });

    it("says what's wrong with a code that can't be loaded", async () => {
      seedChildren();
      const user = userEvent.setup();
      render(<GameApp />);
      await passGrownUpCheck(user);
      const box = within(transfer()).getByLabelText("Paste the code here");
      await user.click(within(transfer()).getByRole("button", { name: "Load" }));
      expect(within(transfer()).getByRole("alert")).toHaveTextContent("Paste a code first.");
      await user.click(box);
      await user.paste("RAINBOW1-not really a code");
      await user.click(within(transfer()).getByRole("button", { name: "Load" }));
      expect(within(transfer()).getByRole("alert")).toHaveTextContent("That code doesn’t look right.");
      // Half a code (cut off when copying) doesn't load either.
      await user.clear(box);
      await user.click(box);
      await user.paste(codeFor([{ name: "Mia", coins: 12, age: "k2" }]).slice(0, 40));
      await user.click(within(transfer()).getByRole("button", { name: "Load" }));
      expect(within(transfer()).getByRole("alert")).toHaveTextContent("That code doesn’t look right.");
      expect(storedPlayers().players.map((player) => player.name)).toEqual(["Ada", "Elly"]);
    });

    it("lets a new browser go from the welcome card to Parent mode to load its records", async () => {
      // A new browser: no players, and the welcome card not yet closed this visit.
      window.sessionStorage.clear();
      const user = userEvent.setup();
      render(<GameApp />);
      const welcome = await screen.findByRole("dialog", { name: "Welcome to Rainbow Academy!" });
      await user.click(within(welcome).getByRole("button", { name: "Already playing in another browser? Bring your game records here" }));
      expect(currentPathname()).toBe("/parent");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await user.type(within(parentPage()).getByLabelText(/What is/), "99");
      await user.click(within(parentPage()).getByRole("button", { name: /Continue/ }));
      await user.click(within(transfer()).getByLabelText("Paste the code here"));
      await user.paste(codeFor([{ name: "Mia", coins: 12, age: "k2" }]));
      await user.click(within(transfer()).getByRole("button", { name: "Load" }));
      await user.click(within(transfer()).getByRole("button", { name: "Yes, replace them" }));
      expect(storedPlayers().players.map((player) => player.name)).toEqual(["Mia"]);
      expect(reloadHome).toHaveBeenCalledTimes(1);
    });
  });

  it("lists every game for each child, with only their age's games on to begin with", async () => {
    seedChildren();
    const user = userEvent.setup();
    render(<GameApp />);
    await passGrownUpCheck(user);

    // The spelling guide and question counts are folded away until a game's arrow is tapped.
    const switches = (name) => within(within(parentPage()).getByRole("region", { name })).getAllByRole("switch")
      .map((toggle) => [document.getElementById(toggle.getAttribute("aria-labelledby")).textContent, toggle.getAttribute("aria-checked")]);
    expect(switches(/Ada/)).toEqual([
      ["CVC Sounds", "true"], ["Consonant Digraphs", "true"], ["R & L Blends", "true"], ["Magic E", "true"], ["Letter Jumble - Starters", "false"],
      ["Letter Jumble - Movers", "false"], ["中文認字 · 入門篇", "true"],
      ["中文認字 · 進階篇", "false"], ["量詞配對", "false"], ["成語", "false"], ["K1 Challenge", "true"], ["Rainbow Speed Quest", "true"], ["Mochi the Rainbow Dragon", "true"],
    ]);
    expect(switches(/Elly/)).toEqual([
      ["CVC Sounds", "true"], ["Consonant Digraphs", "true"], ["R & L Blends", "true"], ["Magic E", "true"], ["Letter Jumble - Starters", "true"],
      ["Letter Jumble - Movers", "true"], ["中文認字 · 入門篇", "false"],
      ["中文認字 · 進階篇", "true"], ["量詞配對", "true"], ["成語", "true"], ["K3 Challenge", "true"], ["Rainbow Speed Quest", "true"], ["Mochi the Rainbow Dragon", "true"],
    ]);
    const ada = within(parentPage()).getByRole("region", { name: /Ada/ });
    expect(within(ada).getAllByRole("button", { name: /More settings for/ }).map((button) => button.getAttribute("aria-label"))).toEqual([
      "More settings for CVC Sounds", "More settings for Consonant Digraphs", "More settings for R & L Blends", "More settings for Magic E",
      "More settings for Letter Jumble - Starters", "More settings for Letter Jumble - Movers",
    ]);
    expect(within(parentPage()).queryByRole("button", { name: /Focus/ })).not.toBeInTheDocument();
  });

  it("turns the spelling guide on for one child's Letter Jumble game, under that game's switch", async () => {
    seedChildren();
    const user = userEvent.setup();
    render(<GameApp />);
    await passGrownUpCheck(user);
    const elly = within(parentPage()).getByRole("region", { name: /Elly/ });
    const guideFor = (name) => within(within(elly).getByRole("switch", { name }).closest("li")).getByRole("switch", { name: /Spelling guide/ });
    // Folded away under the arrow below "On".
    expect(within(within(elly).getByRole("switch", { name: "Letter Jumble - Starters" }).closest("li")).queryByRole("switch", { name: /Spelling guide/ })).not.toBeInTheDocument();
    const arrow = within(elly).getByRole("button", { name: "More settings for Letter Jumble - Starters" });
    expect(arrow).toHaveAttribute("aria-expanded", "false");
    await user.click(arrow);
    expect(arrow).toHaveAttribute("aria-expanded", "true");
    await user.click(within(elly).getByRole("button", { name: "More settings for Letter Jumble - Movers" }));
    await user.click(guideFor("Letter Jumble - Starters"));
    expect(guideFor("Letter Jumble - Starters")).toHaveAttribute("aria-checked", "true");
    expect(guideFor("Letter Jumble - Movers")).toHaveAttribute("aria-checked", "false");
    expect(storedPlayers().players.find((player) => player.name === "Elly").spellingGuide).toEqual(["starters"]);
    expect(storedPlayers().players.find((player) => player.name === "Ada").spellingGuide).toBeUndefined();

    await user.click(guideFor("Letter Jumble - Starters"));
    expect(storedPlayers().players.find((player) => player.name === "Elly").spellingGuide).toBeUndefined();
  });

  it("chooses how many questions a round of CVC Sounds, Digraphs or Blends has, 10 to begin with", async () => {
    seedChildren();
    const user = userEvent.setup();
    render(<GameApp />);
    await passGrownUpCheck(user);
    const ada = within(parentPage()).getByRole("region", { name: /Ada/ });
    await user.click(within(ada).getByRole("button", { name: "More settings for CVC Sounds" }));
    const counts = within(ada).getByRole("radiogroup", { name: "Questions per round" });
    expect(within(counts).getAllByRole("radio").map((radio) => [radio.textContent, radio.getAttribute("aria-checked")])).toEqual([
      ["5", "false"], ["10", "true"], ["15", "false"], ["20", "false"],
    ]);
    await user.click(within(counts).getByRole("radio", { name: "5" }));
    expect(storedPlayers().players.find((player) => player.name === "Ada").questionCounts).toEqual({ cvc: 5 });
    await user.click(within(counts).getByRole("radio", { name: "10" }));
    expect(storedPlayers().players.find((player) => player.name === "Ada").questionCounts).toBeUndefined();
  });

  it("deals the chosen number of questions", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "k1", questionCounts: { cvc: 15 } }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    expect(screen.getByRole("button", { name: /Beginning Sound/ })).toHaveTextContent("15 words to learn");
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));
    expect(screen.getByLabelText("Word 1 of 15")).toBeInTheDocument();
    expect(dealtBy(storedPlayers().players[0].decks["cvc/beginning-sound"])).toHaveLength(15);
  });

  it("turning a game off hides it from that child only", async () => {
    seedChildren();
    const user = userEvent.setup();
    render(<GameApp />);
    await passGrownUpCheck(user);

    const ada = within(parentPage()).getByRole("region", { name: /Ada/ });
    await user.click(within(ada).getByRole("switch", { name: /Mochi/ }));
    expect(within(ada).getByRole("switch", { name: /Mochi/ })).toHaveAttribute("aria-checked", "false");
    await user.click(within(parentPage()).getByRole("button", { name: /Done/ }));

    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "R & L Blends", "Magic E", "中文認字 · 入門篇", "K1 Challenge", "Rainbow Speed Quest"]);
    expect(storedPlayers().players.find((player) => player.name === "Elly").gameSettings).toBeUndefined();
    act(() => setPathname("/dragon"));
    await waitFor(() => expect(currentPathname()).toBe("/"));
  });

  it("turning on a game for another age lets that child play it", async () => {
    seedChildren();
    const user = userEvent.setup();
    render(<GameApp />);
    await passGrownUpCheck(user);

    const ada = within(parentPage()).getByRole("region", { name: /Ada/ });
    const movers = within(ada).getByRole("switch", { name: /Letter Jumble - Movers/ });
    expect(movers.closest(".parent-mode-setting")).toHaveTextContent("Off · for K2, K3");
    await user.click(movers);
    await user.click(within(parentPage()).getByRole("button", { name: /Done/ }));

    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "R & L Blends", "Magic E", "Letter Jumble - Movers", "中文認字 · 入門篇", "K1 Challenge", "Rainbow Speed Quest", "Mochi the Rainbow Dragon"]);
    await user.click(screen.getByRole("button", { name: /Letter Jumble - Movers/ }));
    expect(currentPathname()).toBe("/movers");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Letter Jumble");
  });

  it("needs a right answer to the grown-up question, every time", async () => {
    seedChildren();
    const user = userEvent.setup();
    render(<GameApp />);

    await openParentMode(user);
    expect(within(parentPage()).queryByRole("switch")).not.toBeInTheDocument();
    await user.type(within(parentPage()).getByLabelText(/What is/), "170");
    await user.click(within(parentPage()).getByRole("button", { name: /Continue/ }));
    expect(within(parentPage()).getByRole("alert")).toHaveTextContent("That’s not right");
    expect(within(parentPage()).getByLabelText(/What is/)).toHaveValue("");
    expect(within(parentPage()).queryByRole("switch")).not.toBeInTheDocument();

    await user.type(within(parentPage()).getByLabelText(/What is/), "99");
    await user.click(within(parentPage()).getByRole("button", { name: /Continue/ }));
    // Each child's settings, and moving game records to another browser.
    expect(within(parentPage()).getAllByRole("region").map((region) => region.getAttribute("aria-labelledby")))
      .toEqual(["parent-child-Ada", "parent-child-Elly", "record-transfer-title"]);

    // Done locks it again and goes home.
    await user.click(within(parentPage()).getByRole("button", { name: /Done/ }));
    expect(currentPathname()).toBe("/");
    expect(screen.queryByRole("region", { name: "Parent mode" })).not.toBeInTheDocument();
    await openParentMode(user);
    expect(within(parentPage()).queryByRole("switch")).not.toBeInTheDocument();
  });

  it("is a page of its own, with a way home", async () => {
    seedChildren();
    setPathname("/parent");
    render(<GameApp />);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Parent mode");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem").map((item) => item.textContent))
      .toEqual([" Home", "Parent mode"]);
    expect(screen.getByLabelText(/What is/)).toBeInTheDocument();
  });

  it("is in the player menu, not the header", async () => {
    seedChildren();
    render(<GameApp />);
    expect(screen.queryByRole("button", { name: "Parent mode" })).not.toBeInTheDocument();
  });

  it("tells a child with no games to ask a grown-up", () => {
    seedChildren({ gameSettings: { cvc: false, digraphs: false, blends: false, "magic-e": false, chinese: false, "math-logic": false, "speed-quest": false, dragon: false } });
    render(<GameApp />);
    expect(shownGames()).toEqual([]);
    expect(screen.getByText(/No games are turned on for Ada yet/)).toBeInTheDocument();
  });
});

describe("Letter Jumble - Movers's address", () => {
  it("is /movers, and an old /letter-jumble address goes there, topic and saved progress included", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Elly", coins: 0, age: "k3", progress: { "letter-jumble/animals": 3 }, badges: ["letter-jumble/body-and-face"] }], current: "Elly",
    }));
    setPathname("/letter-jumble/animals");
    const { unmount } = render(<GameApp />);
    await waitFor(() => expect(currentPathname()).toBe("/movers/animals"));
    // The same saved place: word 4.
    expect(await screen.findByLabelText("Word 4 of 13")).toBeInTheDocument();
    unmount();

    setPathname("/letter-jumble");
    const user = userEvent.setup();
    render(<GameApp />);
    await waitFor(() => expect(currentPathname()).toBe("/movers"));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Letter Jumble");
    await user.click(screen.getByRole("button", { name: /Food and Drink/ }));
    expect(currentPathname()).toBe("/movers/food-and-drink");
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link", { name: "Letter Jumble - Movers" })).toHaveAttribute("href", "/movers");
  });
});

describe("shuffled questions", () => {
  it("deals every topic's words in a random order, kept until the topic is finished", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "k3" }], current: "Elly" }));
    let calls = 0;
    Math.random.mockImplementation(() => ((calls += 1) * 0.37) % 1);
    setPathname("/movers/animals");
    render(<GameApp />);

    await screen.findByLabelText("Word 1 of 13");
    const deck = dealtBy(storedPlayers().players[0].decks["letter-jumble/animals"]);
    expect([...deck].sort((first, second) => first - second)).toEqual(inOrder(13));
    expect(deck).not.toEqual(inOrder(13));
  });

  it("keeps a child's saved place when their words are first shuffled", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Elly", coins: 0, age: "k3", progress: { "chinese-advanced/jobs": 4 } }],
      current: "Elly",
    }));
    setPathname("/chinese-advanced/jobs");
    render(<GameApp />);
    expect(await screen.findByLabelText(/^Word 5 of/)).toBeInTheDocument();
  });
});


describe("Challenge", () => {
  const level1 = "math-logic/k1-level-1";
  const seedPlayer = (extra = {}, age = "k1") => window.localStorage.setItem(playersKey, JSON.stringify({
    players: [{ name: "Ada", coins: 0, age, ...extra }], current: "Ada",
  }));
  const inChinese = () => window.localStorage.setItem(siteKey, JSON.stringify({ language: "zh", howToSeen: games.map((game) => game.id), tutorialSeen: true }));
  // The map's level tiles: [name, locked?].
  const levelNames = () => screen.getAllByRole("button", { name: /^Level \d+ · / }).map((level) => [level.getAttribute("aria-label").match(/Level \d+/)[0], level.disabled]);
  const tile = (number) => screen.getByRole("button", { name: new RegExp(`^Level ${number} · `) });

  it("gives each class twenty levels of its own on a map, named for the class, with only Level 1 open to begin with", async () => {
    seedPlayer();
    const user = userEvent.setup();
    const { unmount } = render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /K1 Challenge/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("K1 Challenge");
    expect(levelNames()).toEqual(Array.from({ length: 20 }, (_, index) => [`Level ${index + 1}`, index > 0]));
    expect(tile(1)).toHaveAccessibleName("Level 1 · Numbers under 10 · Mochi is here");
    expect(tile(2)).toHaveAccessibleName("Level 2 · locked: finish Level 1 to open");
    unmount();

    seedPlayer({}, "k2");
    setPathname("/math-logic");
    const { unmount: unmountK2 } = render(<GameApp />);
    expect(levelNames()).toHaveLength(20);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("K2 Challenge");
    expect(tile(1)).toHaveAccessibleName(/Numbers to 20/);
    unmountK2();

    seedPlayer({}, "k3");
    setPathname("/math-logic");
    render(<GameApp />);
    expect(levelNames()).toHaveLength(20);
    expect(tile(1)).toHaveAccessibleName(/Numbers to 100/);
  });

  it("gives K3 sums to type on a number pad", async () => {
    const k3Level1 = "math-logic/k3-level-1";
    // Level 1's third question is 7 + 6.
    seedPlayer({ decks: { [k3Level1]: inOrder(10) }, progress: { [k3Level1]: 2 } }, "k3");
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /K3 Challenge/ }));
    await user.click(tile(1));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Type the answer on the number pad.");
    const pad = screen.getByRole("group", { name: "Number pad" });
    expect(within(pad).getByRole("button", { name: "Check my answer" })).toBeDisabled();
    await user.click(within(pad).getByRole("button", { name: "1" }));
    await user.click(within(pad).getByRole("button", { name: "4" }));
    await user.click(within(pad).getByRole("button", { name: "Rub out" }));
    await user.click(within(pad).getByRole("button", { name: "3" }));
    expect(pad.querySelector("output")).toHaveTextContent("13");
    await user.click(within(pad).getByRole("button", { name: "Check my answer" }));
    expect(storedPlayers().players[0].results[k3Level1][2]).toBe(true);
  });

  it("takes a typed number bond answer from the keyboard too, and shows the right one when it's wrong", async () => {
    const k3Level1 = "math-logic/k3-level-1";
    // Level 1's ninth question: 17 is 8 and 9.
    seedPlayer({ decks: { [k3Level1]: inOrder(10) }, progress: { [k3Level1]: 8 } }, "k3");
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /K3 Challenge/ }));
    await user.click(tile(1));
    expect(screen.getByRole("img", { name: "Number bond: 17 is ? and 9" })).toBeInTheDocument();
    await user.keyboard("9");
    expect(screen.getByRole("img", { name: "Number bond: 17 is 9 and 9" })).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "The answer is…" })).toHaveTextContent("8");
    expect(storedPlayers().players[0].results[k3Level1][8]).toBe(false);
  });

  it("doesn't open a level that's still locked, or another age's, from its address", () => {
    seedPlayer();
    setPathname("/math-logic/k1-level-2");
    const { unmount } = render(<GameApp />);
    expect(currentPathname()).toBe("/math-logic");
    unmount();
    setPathname("/math-logic/k2-level-1");
    render(<GameApp />);
    expect(currentPathname()).toBe("/math-logic");
  });

  it("answers by tapping a choice, then moves on", async () => {
    seedPlayer({ decks: { [level1]: inOrder(10) }, progress: { [level1]: 5 } });
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /K1 Challenge/ }));
    await user.click(tile(1));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Which number is missing?");
    expect(screen.getByRole("list", { name: "4, 5, ?, 7, 8" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "6" }));
    expect(storedPlayers().players[0].results[level1][5]).toBe(true);
    await nextQuestion();
    expect(screen.getByLabelText("Word 7 of 10")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("What comes next?");
  });

  it("asks in Chinese when the site is in Chinese", async () => {
    seedPlayer({ decks: { [level1]: inOrder(10) }, progress: { [level1]: 2 } });
    inChinese();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /K1大挑戰/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("K1大挑戰");
    await user.click(screen.getByRole("button", { name: /^第 1 關 · / }));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("豬媽媽到水果店買蘋果，狐狸店長的籃子裏差多少個蘋果？");
    expect(document.querySelector(".math-picture")).toHaveAttribute("src", "/images/game-asset/math/fruit-stand.svg");
  });

  it("shows the answer after a wrong pick", async () => {
    seedPlayer({ decks: { [level1]: inOrder(10) }, progress: { [level1]: 6 } });
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /K1 Challenge/ }));
    await user.click(tile(1));
    await user.click(screen.getByRole("button", { name: "dragonfly" }));
    const reveal = screen.getByRole("dialog", { name: "The answer is…" });
    expect(reveal).toHaveTextContent("bee");
    expect(storedPlayers().players[0].results[level1][6]).toBe(false);
  });

  it("opens the next level straight away when a level is finished, even with some answers wrong, and puts the score on its tile", async () => {
    seedPlayer({ decks: { [level1]: inOrder(10) }, progress: { [level1]: 9 }, results: { [level1]: [false, ...Array(8).fill(true)] } });
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /K1 Challenge/ }));
    await user.click(tile(1));
    await user.click(screen.getByRole("button", { name: "4" }));
    await nextQuestion();

    const card = await screen.findByRole("dialog", { name: "Good try!" });
    expect(card).toHaveTextContent("Level 2 is open now!");
    expect(card).not.toHaveTextContent("bonus");
    expect(storedPlayers().players[0].unlocks).toEqual([`math-logic/k1-level-2@${today()}`]);
    expect(storedPlayers().players[0].scores).toEqual({ [level1]: [9, 10] });
    await user.click(within(card).getByRole("button", { name: /Back to the map/ }));
    // Mochi starts where she was, on Level 1, then walks on to Level 2.
    expect(tile(1)).toHaveAccessibleName("Level 1 · 9 of 10 right · Mochi is here");
    expect(tile(1).closest("li")).toHaveTextContent("9/10");
    expect(tile(2)).toBeEnabled();
    await waitFor(() => expect(tile(2)).toHaveAccessibleName(/Mochi is here/));
    expect(tile(1)).toHaveAccessibleName("Level 1 · 9 of 10 right");
    expect(tile(3)).toHaveAccessibleName("Level 3 · locked: finish Level 2 to open");
  });

  it("gives a level's badge and 5 bonus coins for getting every answer right, and keeps the best score", async () => {
    seedPlayer({ coins: 3, decks: { [level1]: inOrder(10) }, progress: { [level1]: 9 }, results: { [level1]: Array(9).fill(true) }, scores: { [level1]: [7, 10] } });
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /K1 Challenge/ }));
    await user.click(tile(1));
    await user.click(screen.getByRole("button", { name: "4" }));
    await nextQuestion();

    const card = await screen.findByRole("dialog", { name: "You did it!" });
    expect(card).toHaveTextContent("+5 bonus rainbow coins for getting them all right!");
    // 3, then 1 for the right answer and 5 for them all.
    expect(storedPlayers().players[0].coins).toBe(9);
    expect(storedPlayers().players[0].badges).toEqual([level1]);
    expect(storedPlayers().players[0].scores).toEqual({ [level1]: [10, 10] });
    await user.click(within(card).getByRole("button", { name: /Back to the map/ }));
    expect(tile(1).closest("li")).toHaveTextContent("★ 10/10");
  });

  it("tells analytics when a child reaches Level 15, and not for other levels", async () => {
    // Plays the last question of a level, with the levels up to it already open.
    const finishLevel = async (number) => {
      const key = `math-logic/k1-level-${number}`;
      setPathname("/");
      seedPlayer({
        decks: { [key]: inOrder(10) }, progress: { [key]: 9 }, results: { [key]: Array(9).fill(true) },
        unlocks: Array.from({ length: number - 1 }, (_, index) => `math-logic/k1-level-${index + 2}@2000-01-01`),
      });
      const user = userEvent.setup();
      const view = render(<GameApp />);
      await user.click(screen.getByRole("button", { name: /K1 Challenge/ }));
      await user.click(tile(number));
      await user.click(within(screen.getByRole("group", { name: "Choices" })).getAllByRole("button")[0]);
      if (screen.queryByRole("dialog", { name: "The answer is…" })) await user.click(screen.getByRole("button", { name: /Next question/ }));
      await nextQuestion();
      await screen.findByRole("dialog", { name: /You did it!|Good try!/ });
      expect(storedPlayers().players[0].unlocks).toContain(`math-logic/k1-level-${number + 1}@${today()}`);
      view.unmount();
    };

    await finishLevel(12);
    expect(track).not.toHaveBeenCalled();
    await finishLevel(14);
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("k1-challenge", { level: "15" });
  });

  it("has a level opened today ready to play, with no waiting for tomorrow", async () => {
    seedPlayer({ unlocks: [`math-logic/k1-level-2@${today()}`] });
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /K1 Challenge/ }));
    expect(tile(2)).toBeEnabled();
    expect(tile(3)).toBeDisabled();
  });

  it("is called K1大挑戰 (for a K1 child) under 數學 in Chinese", () => {
    seedPlayer();
    inChinese();
    render(<GameApp />);
    const heading = screen.getByRole("heading", { level: 2, name: /數學/ });
    expect(heading.closest("section")).toHaveTextContent("K1大挑戰");
    expect(heading.closest("section")).toHaveTextContent("彩虹速算站");
  });
});

describe("Rainbow Speed Quest", () => {
  const key = "speed-quest/within-10";
  // With Math.random pinned, the first ten sums are dealt in order: 1 + 1 … 1 + 9, then 2 + 1.
  const answers = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "3"];
  const seedPlayer = (extra = {}) => window.localStorage.setItem(playersKey, JSON.stringify({
    players: [{ name: "Ada", coins: 0, age: "k1", ...extra }], current: "Ada",
  }));

  async function playRound(user, wrongAt = -1) {
    await user.click(screen.getByRole("button", { name: /Rainbow Speed Quest/ }));
    await user.click(screen.getByRole("button", { name: /Within 10/ }));
    expect(screen.getByRole("timer")).toBeInTheDocument();
    for (const [index, answer] of answers.entries()) {
      const pick = index === wrongAt ? String(Number(answer) + 1) : answer;
      await user.click(within(screen.getByRole("group", { name: "Choices" })).getByRole("button", { name: pick }));
      if (index === wrongAt) await user.click(screen.getByRole("button", { name: /Next question/ }));
      await nextQuestion();
    }
  }

  it("times a round of ten sums and saves the first record when all ten are right", async () => {
    seedPlayer();
    const user = userEvent.setup();
    render(<GameApp />);
    await playRound(user);
    const card = await screen.findByRole("dialog", { name: "You did it!" });
    expect(card).toHaveTextContent(/Your time: \d+:\d\d/);
    expect(card).toHaveTextContent("That’s your first record!");
    expect(storedPlayers().players[0].records[key]).toBeGreaterThanOrEqual(0);
    // A coin for each sum, and 5 for getting them all right.
    expect(storedPlayers().players[0].coins).toBe(15);
  });

  it("gives 10 bonus coins for beating a record", async () => {
    seedPlayer({ records: { [key]: 999999 } });
    const user = userEvent.setup();
    render(<GameApp />);
    await playRound(user);
    const card = await screen.findByRole("dialog", { name: "You did it!" });
    expect(card).toHaveTextContent("New record!");
    expect(card).toHaveTextContent("+10 rainbow coins for beating your record!");
    expect(storedPlayers().players[0].records[key]).toBeLessThan(999999);
    // 10 sums, 5 for them all right and 10 for the record.
    expect(storedPlayers().players[0].coins).toBe(25);
  });

  it("keeps the record when a sum was wrong", async () => {
    seedPlayer({ records: { [key]: 1 } });
    const user = userEvent.setup();
    render(<GameApp />);
    await playRound(user, 3);
    const card = await screen.findByRole("dialog", { name: "Good try!" });
    expect(card).toHaveTextContent("Your record: 0:00");
    expect(storedPlayers().players[0].records[key]).toBe(1);
    expect(storedPlayers().players[0].coins).toBe(9);
  });

  it("shows the record on the topic's card", async () => {
    seedPlayer({ records: { [key]: 65000 } });
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Rainbow Speed Quest/ }));
    expect(screen.getByRole("button", { name: /Within 10/ })).toHaveTextContent("Record: 1:05");
    expect(screen.getByRole("button", { name: /Within 20/ })).toHaveTextContent("no record yet");
  });
});
