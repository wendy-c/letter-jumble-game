import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameApp from "./components/GameApp";
import { games } from "./games-data";
import { currentPathname, setPathname } from "../test/mock-navigation";
import { sounds } from "./lib/sounds";

jest.mock("./lib/sounds", () => ({ sounds: { correct: jest.fn(), oops: jest.fn(), coin: jest.fn(), sparkle: jest.fn() } }));
jest.mock("./lib/speech", () => ({ speakWord: jest.fn(), speakCantonese: jest.fn(), stopSpeaking: jest.fn() }));

// The real dragon scene needs WebGL, which jsdom doesn't have.
jest.mock("./components/DragonScene", () => function MockDragonScene() {
  return <div data-testid="dragon-scene" />;
});

// The coin count lives in the header, as a link to Mochi.
const coinsLabel = (count) => `${count} rainbow coins. Visit Mochi the Rainbow Dragon`;
const playersKey = "letter-jumble:players";
const whoIsPlaying = /Who.s playing/;

// Most tests skip the welcome and how-to-play cards, as if they'd been seen before.
const siteKey = "letter-jumble:site";
const welcomeClosedKey = "letter-jumble:welcome-closed";
const seenEverything = () => {
  window.localStorage.setItem(siteKey, JSON.stringify({ language: "en", howToSeen: games.map((game) => game.id) }));
  window.sessionStorage.setItem(welcomeClosedKey, "true");
};

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  seenEverything();
  jest.clearAllMocks();
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

const ageFor = (gameName) => (/Letter Jumble/.test(gameName) ? "5-6" : "3-4");

function storedPlayers() {
  return JSON.parse(window.localStorage.getItem(playersKey));
}

async function addPlayer(user, name, age = "5-6") {
  const dialog = screen.getByRole("dialog", { name: whoIsPlaying });
  await user.type(within(dialog).getByRole("textbox"), name);
  await user.click(within(dialog).getByRole("radio", { name: `${age} years old` }));
  await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));
}

// Opens a game, creating a player called Ada (of a suitable age) if the "Who's playing?" pop-up appears.
async function openGame(user, gameName, topicName) {
  await user.click(screen.getByRole("button", { name: new RegExp(gameName) }));
  if (screen.queryByRole("dialog", { name: whoIsPlaying })) await addPlayer(user, "Ada", ageFor(gameName));
  await user.click(screen.getByRole("button", { name: new RegExp(topicName) }));
}

// A link in the "Home › Game › Topic" breadcrumb trail.
function crumb(name) {
  return within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link", { name: new RegExp(name) });
}

function shownGames() {
  return [...document.querySelectorAll(".game-choice-card .category-card-name")].map((name) => name.textContent);
}

async function earnCoin(user) {
  for (const letter of ["b", "a", "t"]) {
    await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
  }
  await user.click(screen.getByRole("button", { name: /Check word/ }));
  await user.click(within(screen.getByRole("dialog", { name: /!$/ })).getByRole("button"));
}

describe("Home", () => {
  it("starts on the game picker", () => {
    render(<GameApp />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we play today?");
    const gameCards = screen.getAllByRole("button").filter((button) => button.classList.contains("game-choice-card"));
    expect(gameCards.map((card) => card.querySelector(".category-card-name").textContent)).toEqual(["CVC Sounds", "Consonant Digraphs", "Letter Jumble for Starters", "Letter Jumble for Movers", "中文認字 · 入門篇", "中文認字 · 進階篇", "量詞配對", "成語", "Mochi the Rainbow Dragon"]);
  });

  it("has Mochi greet the player by name, and say it out loud when tapped", async () => {
    const { speakWord } = jest.requireMock("./lib/speech");
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    expect(await screen.findByRole("heading", { level: 1, name: "Hi Ada! What shall we play today?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hear Mochi say hello" }));
    expect(speakWord).toHaveBeenLastCalledWith("Hi Ada! What shall we play today?", expect.any(Function));
  });

  it("shows each game as a big picture, with a speaker that says what it is", async () => {
    const { speakCantonese, speakWord } = jest.requireMock("./lib/speech");
    const user = userEvent.setup();
    render(<GameApp />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hi there! What shall we play today?");
    const cvc = screen.getByRole("button", { name: /CVC Sounds/ });
    expect(cvc.querySelector(".game-card-picture img")).toHaveAttribute("src", "/images/game-asset/animals/cat.svg");
    expect(cvc.querySelector(".category-card-number")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Hear what this game is", description: "CVC Sounds" }));
    expect(speakWord).toHaveBeenLastCalledWith("CVC Sounds! Find the missing sound.", expect.any(Function));
    await user.click(screen.getByRole("button", { name: "Hear what this game is", description: "成語" }));
    expect(speakCantonese).toHaveBeenLastCalledWith("成語，一齊學成語！", expect.any(Function));
    expect(currentPathname()).toBe("/");
  });

  it("plays a Letter Jumble word and earns a rainbow coin", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble for Movers", "Animals");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Animals");
    for (const letter of ["b", "a", "t"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check word/ }));

    const reward = screen.getByRole("dialog", { name: "Amazing!" });
    expect(within(reward).getByText("You collected a rainbow coin!")).toBeInTheDocument();
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();
    expect(storedPlayers()).toEqual({
      players: [{ name: "Ada", coins: 1, age: "5-6", decks: animalsDeck, results: { "letter-jumble/animals": [true] } }],
      current: "Ada",
    });
    expect(sounds.correct).toHaveBeenCalledTimes(1);

    await user.click(within(reward).getByRole("button"));
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();
  });

  it("asks to fill every box, then shows the right answer for a wrong word and moves on", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble for Movers", "Animals");

    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(screen.getByText("Fill every box before you check.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    for (const letter of ["t", "a", "b"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check word/ }));

    const reveal = screen.getByRole("dialog", { name: "The answer is…" });
    expect(reveal).toHaveTextContent("bat");
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

    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(screen.getByRole("dialog", { name: "Amazing!" })).toBeInTheDocument();
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

  it("turns on the spelling guide from the word menu", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble for Movers", "Animals");
    expect(screen.queryByLabelText("Spelling guide")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Browse Animals words" }));
    await user.click(screen.getByRole("switch", { name: /Spelling guide/ }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Spelling guide")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Letter 1 of 3, empty, single sound" })).toHaveClass("letter-slot-guide-other");
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
    expect(within(screen.getByRole("radiogroup", { name: /How old/ })).getAllByRole("radio").map((radio) => radio.textContent))
      .toEqual(["3-4 years old", "5-6 years old"]);
    await addPlayer(user, "Mia", "3-4");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
    expect(screen.getByRole("button", { name: "Playing as Mia. Player options" })).toBeInTheDocument();
    expect(storedPlayers()).toEqual({ players: [{ name: "Mia", coins: 0, age: "3-4" }], current: "Mia" });
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
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Please choose how old you are.");
    expect(storedPlayers().players).toHaveLength(1);
  });

  it("picks an existing player and shows their coins", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 3, age: "5-6" }, { name: "Elly", coins: 8, age: "5-6" }],
      current: null,
    }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /Letter Jumble for Movers/ }));
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
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 2, age: "5-6" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /Letter Jumble for Movers/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Letter Jumble");
  });

  it("switches player mid-game and stores coins under the new player", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble for Movers", "Animals");
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
        { name: "Ada", coins: 1, age: "5-6", progress: { "letter-jumble/animals": 1 }, decks: animalsDeck, results: { "letter-jumble/animals": [true] } },
        { name: "Elly", coins: 1, age: "5-6", progress: { "letter-jumble/animals": 1 }, decks: animalsDeck, results: { "letter-jumble/animals": [true] } },
      ],
      current: "Elly",
    });
  });

  it("logs out back to the picker and asks again next time", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble for Movers", "Animals");

    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we play today?");
    expect(screen.queryByRole("button", { name: /Player options/ })).not.toBeInTheDocument();
    expect(storedPlayers()).toEqual({ players: [{ name: "Ada", coins: 0, age: "5-6", decks: animalsDeck }], current: null });

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    expect(screen.getByRole("dialog", { name: whoIsPlaying })).toBeInTheDocument();
  });
});

describe("rainbow dragon", () => {
  it("asks who is playing, then spends their coins on Mochi", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 4, age: "3-4" }], current: null }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /Rainbow Dragon/ }));
    await user.click(within(screen.getByRole("dialog", { name: whoIsPlaying })).getByRole("button", { name: /Ada/ }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mochi the Rainbow Dragon");
    expect(screen.getByTestId("dragon-scene")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Grooming/ }));
    await user.click(screen.getByRole("button", { name: /Bath, 3 rainbow coins/ }));
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();
    expect(storedPlayers().players).toEqual([{ name: "Ada", coins: 1, age: "3-4" }]);
  });
});

describe("ages", () => {
  it("shows each age group only their own games, plus the dragon", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 0, age: "3-4" }, { name: "Elly", coins: 0, age: "5-6" }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "中文認字 · 入門篇", "Mochi the Rainbow Dragon"]);

    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: "Switch player" }));
    await user.click(within(screen.getByRole("list", { name: "Players" })).getByRole("button", { name: /Elly/ }));
    expect(shownGames()).toEqual(["Letter Jumble for Starters", "Letter Jumble for Movers", "中文認字 · 進階篇", "量詞配對", "成語", "Mochi the Rainbow Dragon"]);
  });

  it("lists games under Phonics, Cambridge YLE training, 中文 and Visit Mochi, hiding empty headings", () => {
    const groups = () => screen.getAllByRole("heading", { level: 2 }).map((heading) => [
      heading.textContent.replace(heading.querySelector(".game-group-icon").textContent, ""),
      [...heading.closest("section").querySelectorAll(".game-choice-card .category-card-name")].map((name) => name.textContent),
    ]);
    const { unmount } = render(<GameApp />);
    expect(groups()).toEqual([
      ["Phonics", ["CVC Sounds", "Consonant Digraphs"]],
      ["Cambridge YLE training", ["Letter Jumble for Starters", "Letter Jumble for Movers"]],
      ["中文", ["中文認字 · 入門篇", "中文認字 · 進階篇", "量詞配對", "成語"]],
      ["Visit Mochi", ["Mochi the Rainbow Dragon"]],
    ]);
    unmount();

    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    render(<GameApp />);
    expect(groups().map(([name]) => name)).toEqual(["Phonics", "中文", "Visit Mochi"]);
  });

  it("shows every game to visitors before anyone is playing", () => {
    render(<GameApp />);
    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "Letter Jumble for Starters", "Letter Jumble for Movers", "中文認字 · 入門篇", "中文認字 · 進階篇", "量詞配對", "成語", "Mochi the Rainbow Dragon"]);
  });

  it("stays on the picker when the chosen game isn't for the new player's age", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /Letter Jumble for Movers/ }));
    await addPlayer(user, "Mia", "3-4");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we play today?");
    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "中文認字 · 入門篇", "Mochi the Rainbow Dragon"]);
  });

  it("asks a player saved before ages existed how old they are", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 5 }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    const dialog = screen.getByRole("dialog", { name: "How old is Ada?" });
    await user.click(within(dialog).getByRole("radio", { name: "3-4 years old" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
    expect(storedPlayers()).toEqual({ players: [{ name: "Ada", coins: 5, age: "3-4" }], current: "Ada" });
  });
});

describe("progress", () => {
  it("carries on from the word the player got up to", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<GameApp />);
    await openGame(user, "Letter Jumble for Movers", "Animals");
    await earnCoin(user);
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();

    await user.click(crumb("Letter Jumble for Movers"));
    expect(screen.getByRole("button", { name: /Animals/ })).toHaveTextContent("1 of 13 words learned");
    expect(screen.getByRole("button", { name: /Body and Face/ })).toHaveTextContent("13 words to learn");

    // Like reloading the page: the address stays on the game's topic list.
    unmount();
    expect(currentPathname()).toBe("/letter-jumble");
    render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: /Animals/ }));
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();
  });

  it("celebrates finishing a topic, then goes back to the topic list and starts it again next time", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada", coins: 0, age: "5-6", progress: { "letter-jumble/animals": 12 }, decks: animalsDeck,
        results: { "letter-jumble/animals": Array(12).fill(true) },
      }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble for Movers", "Animals");
    expect(screen.getByLabelText("Word 13 of 13")).toBeInTheDocument();

    for (const letter of ["w", "h", "a", "l", "e"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    await user.click(within(screen.getByRole("dialog", { name: /!$/ })).getByRole("button"));

    const praise = screen.getByRole("dialog", { name: "You did it!" });
    expect(praise).toHaveTextContent("13 / 13 right");
    expect(praise).toHaveTextContent("You got every Animals word right.");
    expect(praise).toHaveTextContent("New badge! Animals is in your badge collection.");
    expect(sounds.sparkle).toHaveBeenCalled();
    expect(storedPlayers().players[0].progress).toEqual({ "letter-jumble/animals": 0 });
    expect(storedPlayers().players[0].badges).toEqual(["letter-jumble/animals"]);

    await user.click(within(praise).getByRole("button", { name: /Back to all topics/ }));
    expect(currentPathname()).toBe("/letter-jumble");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Animals/ })).toHaveTextContent("13 words to learn");

    await user.click(screen.getByRole("button", { name: /Animals/ }));
    expect(screen.getByLabelText("Word 1 of 13")).toBeInTheDocument();
  });

  it("praises finishing a Chinese topic in Chinese", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada", coins: 0, age: "3-4", progress: { "chinese/clothes": 6 },
        decks: { "chinese/clothes": inOrder(7) }, results: { "chinese/clothes": Array(6).fill(true) },
      }],
      current: "Ada",
    }));
    setPathname("/chinese/clothes");
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(await screen.findByRole("button", { name: "top" }));
    await user.click(within(screen.getByRole("dialog", { name: /！$/ })).getByRole("button"));

    const praise = screen.getByRole("dialog", { name: "你好叻呀！" });
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
        age: "3-4",
        progress: { "cvc/middle-sound": 5 },
        decks: { "cvc/middle-sound": [...Array(12).keys()] },
      }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "CVC Sounds", "Middle Sound");
    expect(screen.getByLabelText("Word 6 of 12")).toBeInTheDocument();
    await user.click(crumb("CVC Sounds"));
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));
    expect(screen.getByLabelText("Word 1 of 12")).toBeInTheDocument();
  });

  it("plays the correct-answer sound only for a correct answer", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "CVC Sounds", "Beginning Sound");

    await user.click(screen.getByRole("button", { name: "Letter j" }));
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(sounds.correct).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Letter c" }));
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(sounds.correct).toHaveBeenCalledTimes(1);
  });
});

describe("chinese characters", () => {
  it("lets a 3-4 year old match a character to its picture and earn a coin", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /中文認字/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("中文認字");
    expect(screen.getByRole("button", { name: /顏色/ })).toHaveTextContent("13 個字");
    await user.click(screen.getByRole("button", { name: /顏色/ }));

    expect(screen.getByText("紅")).toHaveClass("chinese-character");
    await user.click(screen.getByRole("button", { name: "red" }));
    const reward = screen.getByRole("dialog", { name: "做得好！" });
    expect(within(reward).getByText("你得到一個彩虹金幣！")).toBeInTheDocument();
    expect(sounds.correct).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();

    await user.click(within(reward).getByRole("button"));
    expect(screen.getByText("橙")).toHaveClass("chinese-character");
    expect(storedPlayers().players[0].progress).toEqual({ "chinese/colours": 1 });

    await user.click(crumb("中文認字 · 入門篇"));
    expect(screen.getByRole("button", { name: /顏色/ })).toHaveTextContent("已學 1 / 13 個字");
  });

  it("isn't offered to 5-6 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("中文認字 · 入門篇");
  });

  it("offers a food topic whose rounds show phrases under the character", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /中文認字/ }));
    expect(screen.getAllByRole("button").filter((button) => button.classList.contains("category-card")).map((card) => card.querySelector(".category-card-name").textContent))
      .toEqual(["顏色", "食物", "水果", "動物", "衣物"]);
    await user.click(screen.getByRole("button", { name: /食物/ }));

    expect(screen.getByText("餅", { selector: ".chinese-character" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "聽「餅乾」" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "biscuit" }));
    expect(screen.getByRole("dialog", { name: /！$/ })).toBeInTheDocument();
    expect(sounds.correct).toHaveBeenCalledTimes(1);
  });
});

describe("routes", () => {
  const seedPlayer = (age = "3-4") => window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age }], current: "Ada" }));

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
    await user.click(within(dialog).getByRole("radio", { name: "3-4 years old" }));
    await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));

    expect(currentPathname()).toBe("/cvc");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
  });

  it.each([
    ["an unknown game", "/space-race", "/", "3-4"],
    ["an unknown topic", "/cvc/backwards", "/cvc", "3-4"],
    ["a game for another age", "/letter-jumble/animals", "/", "3-4"],
    ["a topic under Mochi's den", "/dragon/anything", "/dragon", "3-4"],
  ])("sends %s back up a level", async (label, from, to, age) => {
    seedPlayer(age);
    setPathname(from);
    render(<GameApp />);
    await waitFor(() => expect(currentPathname()).toBe(to));
  });
});

describe("coins on the home page", () => {
  it("shows the player's coins and links them to Mochi", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 12, age: "3-4" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);

    const link = await screen.findByRole("link", { name: "12 rainbow coins. Visit Mochi the Rainbow Dragon" });
    expect(link).toHaveAttribute("href", "/dragon");
    await user.click(link);

    expect(currentPathname()).toBe("/dragon");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mochi the Rainbow Dragon");
    // It stays in the header on every page.
    expect(screen.getByRole("link", { name: coinsLabel(12) })).toBeInTheDocument();
  });

  it("shows 0 when nobody is playing", () => {
    render(<GameApp />);
    expect(screen.getByRole("link", { name: coinsLabel(0) })).toBeInTheDocument();
  });
});

describe("CVC shuffling", () => {
  const seed = (extra = {}) => window.localStorage.setItem(playersKey, JSON.stringify({
    players: [{ name: "Ada", coins: 0, age: "3-4", ...extra }],
    current: "Ada",
  }));

  it("deals 12 different words at random and keeps them when coming back", async () => {
    seed();
    let calls = 0;
    Math.random.mockImplementation(() => ((calls += 1) * 0.37) % 1);
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    expect(screen.getByRole("button", { name: /Beginning Sound/ })).toHaveTextContent("12 words to learn");
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));

    const deck = storedPlayers().players[0].decks["cvc/beginning-sound"];
    expect(deck).toHaveLength(12);
    expect(new Set(deck).size).toBe(12);
    expect(deck).not.toEqual([...Array(12).keys()]);
    expect(screen.getByLabelText("Word 1 of 12")).toBeInTheDocument();

    await user.click(crumb("CVC Sounds"));
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));
    expect(storedPlayers().players[0].decks["cvc/beginning-sound"]).toEqual(deck);
  });

  it("deals a fresh hand of words after finishing all 12", async () => {
    seed({
      progress: { "cvc/beginning-sound": 11 }, decks: { "cvc/beginning-sound": [...Array(12).keys()] },
      results: { "cvc/beginning-sound": Array(11).fill(true) },
    });
    setPathname("/cvc/beginning-sound");
    const user = userEvent.setup();
    render(<GameApp />);

    // Word 12 of the original order is "bed".
    expect(await screen.findByLabelText("Word 12 of 12")).toBeInTheDocument();
    expect(screen.getByLabelText("Letter 2 of 3, e")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Letter b" }));
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    await user.click(within(screen.getByRole("dialog", { name: /!$/ })).getByRole("button"));

    const praise = screen.getByRole("dialog", { name: "You did it!" });
    expect(praise).toHaveTextContent("12 / 12 right");
    await user.click(within(praise).getByRole("button", { name: /Back to all topics/ }));
    expect(currentPathname()).toBe("/cvc");
    expect(storedPlayers().players[0].decks).toBeUndefined();
    expect(storedPlayers().players[0].results).toBeUndefined();
  });
});

describe("chinese words for 5-6 year olds", () => {
  it("plays the jobs topic with whole words", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
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
    expect(screen.getByRole("dialog", { name: /！$/ })).toBeInTheDocument();
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("fits long words like 飛行服務員 on a wider card", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Elly", coins: 0, age: "5-6", progress: { "chinese-advanced/jobs": 10 } }],
      current: "Elly",
    }));
    setPathname("/chinese-advanced/jobs");
    render(<GameApp />);
    expect(screen.getByText("飛行服務員", { selector: ".chinese-character" })).toHaveClass("chinese-character-long", "chinese-character-5");
  });

  it("isn't offered to 3-4 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("中文認字 · 進階篇");
  });

  it("plays the home topic", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
    setPathname("/chinese-advanced/home");
    const user = userEvent.setup();
    render(<GameApp />);

    expect(await screen.findByText("客廳", { selector: ".chinese-character" })).toHaveClass("chinese-character-pair");
    await user.click(screen.getByRole("button", { name: "living room" }));
    expect(screen.getByRole("dialog", { name: /！$/ })).toBeInTheDocument();
  });
});

describe("breadcrumbs", () => {
  it("shows Home › game › topic, with the current page last", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
    setPathname("/chinese-advanced/jobs");
    const user = userEvent.setup();
    render(<GameApp />);

    const trail = await screen.findByRole("navigation", { name: "Breadcrumb" });
    expect(within(trail).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["🏠 Home", "中文認字 · 進階篇", "職業"]);
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
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    setPathname("/dragon");
    render(<GameApp />);
    const trail = await screen.findByRole("navigation", { name: "Breadcrumb" });
    expect(within(trail).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["🏠 Home", "Mochi the Rainbow Dragon"]);
  });
});

describe("Consonant Digraphs", () => {
  const seed = () => window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "3-4" }], current: "Elly" }));

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
    expect(storedPlayers().players[0].decks["digraphs/ch-sh-th"]).toHaveLength(10);
    const gap = screen.getByLabelText("Letter 1 of 5, empty");
    expect(gap).toHaveClass("letter-slot-wide");
    expect(screen.getByLabelText("Letter 3 of 5, a")).toHaveClass("letter-given");
    expect(screen.getAllByRole("button", { name: /^Letter (ch|sh|th)$/ })).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "Letter ch" }));
    expect(screen.getByLabelText("Letter 1 of 5, ch")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(screen.getByRole("dialog", { name: /!$/ })).toBeInTheDocument();
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("shows the right word after a wrong digraph", async () => {
    seed();
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Consonant Digraphs/ }));
    await user.click(screen.getByRole("button", { name: /ch · sh · th/ }));
    await user.click(screen.getByRole("button", { name: "Letter sh" }));
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(screen.getByRole("dialog", { name: "The answer is…" })).toHaveTextContent("chair");
    expect(storedPlayers().players[0].coins).toBe(0);
  });
});

describe("Letter Jumble for Starters", () => {
  it("is offered to 5-6 year olds before Movers, with Pets and Farm and Wild Animals", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);
    expect(shownGames().indexOf("Letter Jumble for Starters")).toBe(shownGames().indexOf("Letter Jumble for Movers") - 1);

    await user.click(screen.getByRole("button", { name: /Letter Jumble for Starters/ }));
    expect(currentPathname()).toBe("/starters");
    expect(screen.getByRole("button", { name: /Pets and Farm/ })).toHaveTextContent("17 words to learn");
    expect(screen.getByRole("button", { name: /Wild Animals/ })).toHaveTextContent("20 words to learn");
  });

  it("spells a Starters word and earns a coin", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Letter Jumble for Starters/ }));
    await user.click(screen.getByRole("button", { name: /Pets and Farm/ }));

    // With the order pinned, the first word is "cat".
    expect(screen.getByLabelText("Word 1 of 17")).toBeInTheDocument();
    for (const letter of ["c", "a", "t"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(screen.getByRole("dialog", { name: /!$/ })).toBeInTheDocument();
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("isn't offered to 3-4 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("Letter Jumble for Starters");
  });

  it("shows the hyphen in T-shirt and only asks for its letters", async () => {
    const deck = { "starters/clothing-and-accessories": [7, ...[...Array(18).keys()].filter((index) => index !== 7)] };
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6", decks: deck }], current: "Elly" }));
    setPathname("/starters/clothing-and-accessories");
    const user = userEvent.setup();
    render(<GameApp />);

    expect(await screen.findByLabelText("Letter 2 of 7, -")).toHaveClass("letter-given");
    const tiles = screen.getAllByRole("button", { name: /^Letter [a-z]$/ }).map((tile) => tile.getAttribute("aria-label").at(-1));
    expect(tiles.sort()).toEqual(["h", "i", "r", "s", "t", "t"]);
    for (const letter of ["t", "s", "h", "i", "r", "t"]) {
      await user.click(screen.getAllByRole("button", { name: `Letter ${letter}` }).find((tile) => !tile.disabled && !tile.classList.contains("tile-used")));
    }
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(screen.getByRole("dialog", { name: /!$/ })).toBeInTheDocument();
  });
});

describe("measure words", () => {
  it("deals 20 random questions for 5-6 year olds and plays one", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /量詞配對/ }));
    expect(currentPathname()).toBe("/measure-words");
    expect(screen.getByRole("button", { name: /量詞/ })).toHaveTextContent("每次 20 題");
    await user.click(screen.getByRole("button", { name: /量詞/ }));

    const deck = storedPlayers().players[0].decks["measure-words/measure-words"];
    expect(deck).toHaveLength(20);
    expect(screen.getByLabelText("Word 1 of 20")).toBeInTheDocument();

    // With the order pinned, the first question is 一個橙.
    expect(screen.getByLabelText("一個，空格")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /橙/ }));
    expect(screen.getByRole("dialog", { name: /！$/ })).toBeInTheDocument();
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("isn't offered to 3-4 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("量詞配對");
  });
});

describe("成語", () => {
  it("fills the gap in an idiom for 5-6 year olds", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /成語/ }));
    expect(currentPathname()).toBe("/idioms");
    await user.click(screen.getByRole("button", { name: /成語/ }));

    expect(storedPlayers().players[0].decks["idioms/idioms"]).toHaveLength(20);
    expect(screen.getByLabelText("Word 1 of 20")).toBeInTheDocument();

    // With the order pinned, the first question is 打草驚蛇.
    expect(screen.getByText("比喻做事不機密，使對方起了警覺。")).toBeInTheDocument();
    expect(screen.getByLabelText("打草驚空格")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "蛇" }));
    expect(screen.getByRole("dialog", { name: /！$/ })).toBeInTheDocument();
    expect(storedPlayers().players[0].coins).toBe(1);
  });

  it("isn't offered to 3-4 year olds", () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    render(<GameApp />);
    expect(shownGames()).not.toContain("成語");
  });
});

describe("answers move around", () => {
  // Where 紅's picture sits, when it's the first question of a dealt hand.
  function redSpot(deck) {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4", decks: { "chinese/colours": deck } }], current: "Ada" }));
    setPathname("/chinese/colours");
    const { unmount } = render(<GameApp />);
    const spot = [...document.querySelectorAll(".chinese-option")].findIndex((option) => option.dataset.character === "紅");
    unmount();
    return spot;
  }

  it("puts the right answer in a different place with each new deal, but not on a reload", () => {
    const deal = (rest) => [0, ...rest];
    const deals = [
      deal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
      deal([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]),
      deal([5, 1, 9, 3, 11, 7, 2, 12, 4, 8, 6, 10]),
      deal([2, 4, 6, 8, 10, 12, 1, 3, 5, 7, 9, 11]),
      deal([7, 3, 11, 1, 9, 5, 12, 8, 2, 10, 4, 6]),
      deal([9, 12, 3, 6, 1, 4, 7, 10, 2, 5, 8, 11]),
    ];
    const spots = deals.map(redSpot);
    spots.forEach((spot) => expect(spot).toBeGreaterThanOrEqual(0));
    expect(new Set(spots).size).toBeGreaterThan(1);
    expect(redSpot(deals[2])).toBe(spots[2]);
  });
});

describe("one try per question", () => {
  const seedClothes = (results, extra = {}) => window.localStorage.setItem(playersKey, JSON.stringify({
    players: [{
      name: "Ada", coins: 0, age: "3-4", progress: { "chinese/clothes": 6 },
      decks: { "chinese/clothes": inOrder(7) }, results: { "chinese/clothes": results }, ...extra,
    }],
    current: "Ada",
  }));

  it("shows the right picture and character after a wrong pick, with no coin and no second try", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
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
    await user.click(within(screen.getByRole("dialog", { name: /！$/ })).getByRole("button"));

    const done = screen.getByRole("dialog", { name: "繼續加油！" });
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
    await user.click(within(screen.getByRole("dialog", { name: /！$/ })).getByRole("button"));
    expect(within(screen.getByRole("dialog", { name: "繼續加油！" })).getByLabelText("6 / 7 答對")).toBeInTheDocument();
  });

  it("awards the badge for a perfect score, even after a wrong last answer the first time round", async () => {
    seedClothes(Array(6).fill(true));
    setPathname("/chinese/clothes");
    const user = userEvent.setup();
    render(<GameApp />);

    const wrong = (await screen.findAllByRole("button")).find((button) => button.classList.contains("chinese-option") && button.getAttribute("aria-label") !== "top");
    await user.click(wrong);
    await user.click(within(screen.getByRole("dialog", { name: "正確答案是……" })).getByRole("button", { name: /下一題/ }));
    expect(within(screen.getByRole("dialog", { name: "繼續加油！" })).getByLabelText("6 / 7 答對")).toBeInTheDocument();
    expect(storedPlayers().players[0].badges).toBeUndefined();
  });

  it("only counts the first answer, so going back can't change the score", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
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
      players: [{ name: "Ada", coins: 0, age: "5-6", badges: ["letter-jumble/animals", "idioms/idioms"] }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    const collection = await openBadges(user);

    expect(within(collection).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent))
      .toEqual(["Letter Jumble for Starters", "Letter Jumble for Movers", "中文認字 · 進階篇", "量詞配對", "成語"]);
    expect(collection).toHaveTextContent("2 of 22 badges");
    expect(within(collection).getByRole("listitem", { name: "Animals: earned" })).toBeInTheDocument();
    expect(within(collection).getByRole("listitem", { name: "成語: earned" })).toBeInTheDocument();
    const movers = within(collection).getByRole("region", { name: "Letter Jumble for Movers" });
    expect(within(movers).getByRole("listitem", { name: "Body and Face: not earned yet" })).toBeInTheDocument();

    // The breadcrumb leads back home.
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem").map((item) => item.textContent))
      .toEqual(["🏠 Home", "My badges"]);
    await user.click(crumb("Home"));
    expect(currentPathname()).toBe("/");
  });

  it("sends the badge page home when nobody is playing", async () => {
    setPathname("/badges");
    render(<GameApp />);
    await waitFor(() => expect(currentPathname()).toBe("/"));
    expect(screen.queryByRole("region", { name: /badges/ })).not.toBeInTheDocument();
  });

  it("encourages a player with no badges yet", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    const collection = await openBadges(user);
    expect(collection).toHaveTextContent("0 of 12 badges");
    expect(collection).toHaveTextContent("Get every answer in a topic right to earn its badge!");
  });

  it("doesn't award the same badge twice", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{
        name: "Ada", coins: 0, age: "3-4", progress: { "chinese/clothes": 6 }, badges: ["chinese/clothes"],
        decks: { "chinese/clothes": inOrder(7) }, results: { "chinese/clothes": Array(6).fill(true) },
      }],
      current: "Ada",
    }));
    setPathname("/chinese/clothes");
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: "top" }));
    await user.click(within(screen.getByRole("dialog", { name: /！$/ })).getByRole("button"));
    expect(screen.getByRole("dialog", { name: "你好叻呀！" })).not.toHaveTextContent("徽章");
    expect(storedPlayers().players[0].badges).toEqual(["chinese/clothes"]);
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
    await user.click(within(welcome).getByRole("radio", { name: "3-4 years old" }));
    await user.click(within(welcome).getByRole("button", { name: /Let’s Start/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(storedPlayers()).toEqual({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" });
    expect(JSON.parse(window.localStorage.getItem(siteKey))).toMatchObject({ language: "en" });
  });

  it("greets in 繁體 once the site's language has been changed in the player menu", async () => {
    window.localStorage.setItem(siteKey, JSON.stringify({ language: "zh", howToSeen: [] }));
    const user = userEvent.setup();
    render(<GameApp />);
    const chinese = await screen.findByRole("dialog", { name: "歡迎來到 Rainbow Academy！" });
    expect(chinese).toHaveTextContent("學中玩，玩中學，閃耀每一天！");
    expect(within(chinese).queryByRole("switch")).not.toBeInTheDocument();

    await user.click(within(chinese).getByRole("button", { name: /一起玩吧！/ }));
    expect(within(chinese).getByRole("alert")).toHaveTextContent("請輸入名字。");
    await user.type(within(chinese).getByRole("textbox"), "Ada");
    await user.click(within(chinese).getByRole("radio", { name: "3-4 歲" }));
    await user.click(within(chinese).getByRole("button", { name: /一起玩吧！/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("今天玩甚麼？");
  });

  it("isn't shown to a family that already has players", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
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
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
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
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "5-6" }], current: "Ada" }));
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
    expect(JSON.parse(window.localStorage.getItem(siteKey))).toMatchObject({ language: "zh" });

    // Inside an English game, the game's words stay English; the breadcrumb is the site's.
    await user.click(screen.getByRole("button", { name: /Letter Jumble for Movers/ }));
    await user.click(screen.getByRole("button", { name: /Animals/ }));
    expect(screen.getByRole("button", { name: /Check word/ })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getAllByRole("listitem")[0]).toHaveTextContent("主頁");
  });
});

describe("how to play", () => {
  beforeEach(() => window.localStorage.setItem(siteKey, JSON.stringify({ language: "en", howToSeen: [] })));

  it("explains a game when its first topic starts, then from the ? beside the title", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "5-6" }], current: "Ada" }));
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(screen.getByRole("button", { name: /Letter Jumble for Movers/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Animals/ }));
    const howTo = screen.getByRole("dialog", { name: "How to play Letter Jumble for Movers" });
    expect(howTo).toHaveTextContent("Tap the letters in spelling order");
    await user.click(within(howTo).getByRole("button", { name: /Got it/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const help = screen.getByRole("button", { name: "How to play" });
    expect(help).toHaveTextContent(/^\?$/);
    expect(help.closest(".title-row")).toContainElement(screen.getByRole("heading", { level: 1 }));
    await user.click(help);
    expect(screen.getByRole("dialog", { name: "How to play Letter Jumble for Movers" })).toBeInTheDocument();
  });

  it("shows CVC Sounds' three numbered steps", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
    setPathname("/cvc/beginning-sound");
    render(<GameApp />);
    const howTo = await screen.findByRole("dialog", { name: "How to play" });
    expect(howTo.querySelector(".eyebrow")).toBeNull();
    expect(within(howTo).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Look at the picture and tap the speaker icon for a hint.",
      "Tap the letter that fills the gap.",
      "Tap “Check word” when you’re done.",
    ]);
    expect(within(howTo).queryByRole("heading", { name: "Need a revision?" })).not.toBeInTheDocument();
  });

  it("has the ? only beside a module's title, not on a game's list of topics", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
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
    const steps = ["讀一讀，按喇叭聽聽提示。", "按一按正確的圖畫。", "答對可得到彩虹金幣，全部答對更可得到徽章！"];
    for (const [age, path, title] of [["3-4", "/chinese/colours", "中文認字 · 入門篇：玩法"], ["5-6", "/chinese-advanced/jobs", "中文認字 · 進階篇：玩法"]]) {
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
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
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
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
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
      players: [{ name: "Ada", coins: 0, age: "3-4", decks: { "cvc/beginning-sound": inOrder(12) }, progress: { "cvc/beginning-sound": 4 }, results: { "cvc/beginning-sound": [true, false, true, true] } }],
      current: "Ada",
    }));
    setPathname("/cvc/beginning-sound");
    let calls = 0;
    Math.random.mockImplementation(() => ((calls += 1) * 0.37) % 1);
    const user = userEvent.setup();
    render(<GameApp />);
    expect(await screen.findByLabelText("Word 5 of 12")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Browse/ }));
    await user.click(screen.getByRole("button", { name: /Shuffle questions/ }));

    const player = storedPlayers().players[0];
    expect(player.decks["cvc/beginning-sound"]).toHaveLength(12);
    expect(player.decks["cvc/beginning-sound"]).not.toEqual(inOrder(12));
    expect(player.decks["cvc/beginning-sound"].some((index) => index >= 12)).toBe(true);
    expect(player.progress["cvc/beginning-sound"]).toBe(0);
    expect(player.results).toBeUndefined();
    expect(screen.getByLabelText("Word 1 of 12")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shuffles every word of a topic that plays them all, labelled in the game's language", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4", decks: { "chinese/clothes": inOrder(7) } }], current: "Ada" }));
    setPathname("/chinese/clothes");
    let calls = 0;
    Math.random.mockImplementation(() => ((calls += 1) * 0.37) % 1);
    const user = userEvent.setup();
    render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: /Browse/ }));
    await user.click(screen.getByRole("button", { name: /打亂題目次序/ }));
    const deck = storedPlayers().players[0].decks["chinese/clothes"];
    expect([...deck].sort()).toEqual(inOrder(7));
    expect(deck).not.toEqual(inOrder(7));
  });
});

describe("Tofu and Rainbow Village", () => {
  const seedPlayer = (extra) => window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4", ...extra }], current: "Ada" }));

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
      .toEqual(["🏠 Home", "Mochi the Rainbow Dragon", "Tofu’s House"]);
  });

  it("starts at Rainbow Village once Tofu has moved in, with the park locked", async () => {
    seedPlayer({ unlocks: ["tofu"] });
    setPathname("/dragon");
    const user = userEvent.setup();
    render(<GameApp />);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Rainbow Village");
    expect(screen.getByRole("button", { name: "Park, coming soon" })).toBeDisabled();
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
    players: [{ name: "Ada", coins: 0, age: "3-4", ...extra }, { name: "Elly", coins: 0, age: "5-6" }],
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

  it("lists every game for each child, with only their age's games on to begin with", async () => {
    seedChildren();
    const user = userEvent.setup();
    render(<GameApp />);
    await passGrownUpCheck(user);

    const switches = (name) => within(within(parentPage()).getByRole("region", { name })).getAllByRole("switch")
      .map((toggle) => [toggle.querySelector(".spelling-guide-toggle-title").textContent, toggle.getAttribute("aria-checked")]);
    expect(switches(/Ada/)).toEqual([
      ["CVC Sounds", "true"], ["Consonant Digraphs", "true"], ["Letter Jumble for Starters", "false"], ["Letter Jumble for Movers", "false"], ["中文認字 · 入門篇", "true"],
      ["中文認字 · 進階篇", "false"], ["量詞配對", "false"], ["成語", "false"], ["Mochi the Rainbow Dragon", "true"],
    ]);
    expect(switches(/Elly/)).toEqual([
      ["CVC Sounds", "false"], ["Consonant Digraphs", "false"], ["Letter Jumble for Starters", "true"], ["Letter Jumble for Movers", "true"], ["中文認字 · 入門篇", "false"],
      ["中文認字 · 進階篇", "true"], ["量詞配對", "true"], ["成語", "true"], ["Mochi the Rainbow Dragon", "true"],
    ]);
    expect(within(parentPage()).queryByRole("button", { name: /Focus/ })).not.toBeInTheDocument();
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

    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "中文認字 · 入門篇"]);
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
    const movers = within(ada).getByRole("switch", { name: /Letter Jumble for Movers/ });
    expect(movers).toHaveTextContent("Off · for 5-6 years old");
    await user.click(movers);
    await user.click(within(parentPage()).getByRole("button", { name: /Done/ }));

    expect(shownGames()).toEqual(["CVC Sounds", "Consonant Digraphs", "Letter Jumble for Movers", "中文認字 · 入門篇", "Mochi the Rainbow Dragon"]);
    await user.click(screen.getByRole("button", { name: /Letter Jumble for Movers/ }));
    expect(currentPathname()).toBe("/letter-jumble");
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
    expect(within(parentPage()).getAllByRole("region")).toHaveLength(2);

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
      .toEqual(["🏠 Home", "Parent mode"]);
    expect(screen.getByLabelText(/What is/)).toBeInTheDocument();
  });

  it("is in the player menu, not the header", async () => {
    seedChildren();
    render(<GameApp />);
    expect(screen.queryByRole("button", { name: "Parent mode" })).not.toBeInTheDocument();
  });

  it("tells a child with no games to ask a grown-up", () => {
    seedChildren({ gameSettings: { cvc: false, digraphs: false, chinese: false, dragon: false } });
    render(<GameApp />);
    expect(shownGames()).toEqual([]);
    expect(screen.getByText(/No games are turned on for Ada yet/)).toBeInTheDocument();
  });
});

describe("shuffled questions", () => {
  it("deals every topic's words in a random order, kept until the topic is finished", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
    let calls = 0;
    Math.random.mockImplementation(() => ((calls += 1) * 0.37) % 1);
    setPathname("/letter-jumble/animals");
    render(<GameApp />);

    await screen.findByLabelText("Word 1 of 13");
    const deck = storedPlayers().players[0].decks["letter-jumble/animals"];
    expect([...deck].sort((first, second) => first - second)).toEqual(inOrder(13));
    expect(deck).not.toEqual(inOrder(13));
  });

  it("keeps a child's saved place when their words are first shuffled", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Elly", coins: 0, age: "5-6", progress: { "chinese-advanced/jobs": 4 } }],
      current: "Elly",
    }));
    setPathname("/chinese-advanced/jobs");
    render(<GameApp />);
    expect(await screen.findByLabelText(/^Word 5 of/)).toBeInTheDocument();
  });
});

