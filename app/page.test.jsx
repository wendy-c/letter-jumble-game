import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameApp from "./components/GameApp";
import { currentPathname, setPathname } from "../test/mock-navigation";
import { sounds } from "./lib/sounds";

jest.mock("./lib/sounds", () => ({ sounds: { correct: jest.fn(), coin: jest.fn(), sparkle: jest.fn() } }));
jest.mock("./lib/speech", () => ({ speakWord: jest.fn(), speakCantonese: jest.fn(), stopSpeaking: jest.fn() }));

// The real dragon scene needs WebGL, which jsdom doesn't have.
jest.mock("./components/DragonScene", () => function MockDragonScene() {
  return <div data-testid="dragon-scene" />;
});

const coinsLabel = (count) => `${count} rainbow coins collected`;
const playersKey = "letter-jumble:players";
const whoIsPlaying = /Who.s playing/;

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
  // A shuffle with random() just below 1 keeps the original order, so CVC games deal the
  // first 20 words in order (cat, hat, bat, ...). Tests about shuffling override this.
  jest.spyOn(Math, "random").mockReturnValue(0.9999999);
});

afterEach(() => {
  jest.restoreAllMocks();
});

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
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
    const gameCards = screen.getAllByRole("button").filter((button) => button.classList.contains("game-choice-card"));
    expect(gameCards.map((card) => card.querySelector(".category-card-name").textContent)).toEqual(["CVC Sounds", "中文認字 · 入門篇", "Letter Jumble for Movers", "中文認字 · 進階篇", "Mochi the Rainbow Dragon"]);
    expect(screen.getByText("SPELLING SCHOOL")).toBeInTheDocument();
  });

  it("plays a Letter Jumble word and earns a rainbow coin", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble", "Animals");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Animals");
    expect(screen.getByText("CAMBRIDGE MOVERS")).toBeInTheDocument();
    for (const letter of ["b", "a", "t"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check word/ }));

    const reward = screen.getByRole("dialog", { name: "Amazing!" });
    expect(within(reward).getByText("You collected a rainbow coin!")).toBeInTheDocument();
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();
    expect(storedPlayers()).toEqual({
      players: [{ name: "Ada", coins: 1, age: "5-6" }],
      current: "Ada",
    });
    expect(sounds.correct).toHaveBeenCalledTimes(1);

    await user.click(within(reward).getByRole("button"));
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();
  });

  it("does not reward a wrong or unfinished answer", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble", "Animals");

    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(screen.getByText("Fill every box before you check.")).toBeInTheDocument();

    for (const letter of ["t", "a", "b"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    expect(screen.getByText("Not quite — give it another try!")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText(coinsLabel(0))).toBeInTheDocument();
  });

  it("plays a CVC word with one missing letter and swaps a wrong pick", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "CVC Sounds", "Middle Sound");

    expect(screen.getByText("CVC SOUNDS")).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: /All sounds/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
    await user.click(screen.getByRole("button", { name: /Choose a game/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
  });

  it("turns on the spelling guide from the word menu", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble", "Animals");
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
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
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

    await user.click(screen.getByRole("button", { name: /Letter Jumble/ }));
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

    await user.click(screen.getByRole("button", { name: /Letter Jumble/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Letter Jumble");
  });

  it("switches player mid-game and stores coins under the new player", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble", "Animals");
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
        { name: "Ada", coins: 1, age: "5-6", progress: { "letter-jumble/animals": 1 } },
        { name: "Elly", coins: 1, age: "5-6", progress: { "letter-jumble/animals": 1 } },
      ],
      current: "Elly",
    });
  });

  it("logs out back to the picker and asks again next time", async () => {
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble", "Animals");

    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
    expect(screen.queryByRole("button", { name: /Player options/ })).not.toBeInTheDocument();
    expect(storedPlayers()).toEqual({ players: [{ name: "Ada", coins: 0, age: "5-6" }], current: null });

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
    expect(screen.getByText("RAINBOW DRAGON")).toBeInTheDocument();
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
    expect(shownGames()).toEqual(["CVC Sounds", "中文認字 · 入門篇", "Mochi the Rainbow Dragon"]);

    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: "Switch player" }));
    await user.click(within(screen.getByRole("list", { name: "Players" })).getByRole("button", { name: /Elly/ }));
    expect(shownGames()).toEqual(["Letter Jumble for Movers", "中文認字 · 進階篇", "Mochi the Rainbow Dragon"]);
  });

  it("shows every game to visitors before anyone is playing", () => {
    render(<GameApp />);
    expect(shownGames()).toEqual(["CVC Sounds", "中文認字 · 入門篇", "Letter Jumble for Movers", "中文認字 · 進階篇", "Mochi the Rainbow Dragon"]);
  });

  it("stays on the picker when the chosen game isn't for the new player's age", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /Letter Jumble/ }));
    await addPlayer(user, "Mia", "3-4");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
    expect(shownGames()).toEqual(["CVC Sounds", "中文認字 · 入門篇", "Mochi the Rainbow Dragon"]);
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
    await openGame(user, "Letter Jumble", "Animals");
    await earnCoin(user);
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /All games/ }));
    expect(screen.getByRole("button", { name: /Animals/ })).toHaveTextContent("1 of 13 spells learned");
    expect(screen.getByRole("button", { name: /Body and Face/ })).toHaveTextContent("13 spells to learn");

    // Like reloading the page: the address stays on the game's topic list.
    unmount();
    expect(currentPathname()).toBe("/letter-jumble");
    render(<GameApp />);
    await user.click(await screen.findByRole("button", { name: /Animals/ }));
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();
  });

  it("celebrates finishing a topic, then goes back to the topic list and starts it again next time", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 0, age: "5-6", progress: { "letter-jumble/animals": 12 } }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "Letter Jumble", "Animals");
    expect(screen.getByLabelText("Word 13 of 13")).toBeInTheDocument();

    for (const letter of ["w", "h", "a", "l", "e"]) {
      await user.click(screen.getByRole("button", { name: `Letter ${letter}` }));
    }
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    await user.click(within(screen.getByRole("dialog", { name: /!$/ })).getByRole("button"));

    const praise = screen.getByRole("dialog", { name: "You did it!" });
    expect(praise).toHaveTextContent("You finished all 13 Animals words.");
    expect(sounds.sparkle).toHaveBeenCalled();
    expect(storedPlayers().players[0].progress).toEqual({ "letter-jumble/animals": 0 });

    await user.click(within(praise).getByRole("button", { name: /Back to all topics/ }));
    expect(currentPathname()).toBe("/letter-jumble");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Animals/ })).toHaveTextContent("13 spells to learn");

    await user.click(screen.getByRole("button", { name: /Animals/ }));
    expect(screen.getByLabelText("Word 1 of 13")).toBeInTheDocument();
  });

  it("praises finishing a Chinese topic in Chinese", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 0, age: "3-4", progress: { "chinese/clothes": 6 } }],
      current: "Ada",
    }));
    setPathname("/chinese/clothes");
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(await screen.findByRole("button", { name: "top" }));
    await user.click(within(screen.getByRole("dialog", { name: /！$/ })).getByRole("button"));

    const praise = screen.getByRole("dialog", { name: "你好叻呀！" });
    expect(praise).toHaveTextContent("你學完「衣物」全部 7 個字");
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
        decks: { "cvc/middle-sound": [...Array(20).keys()] },
      }],
      current: "Ada",
    }));
    const user = userEvent.setup();
    render(<GameApp />);
    await openGame(user, "CVC Sounds", "Middle Sound");
    expect(screen.getByLabelText("Word 6 of 20")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /All sounds/ }));
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));
    expect(screen.getByLabelText("Word 1 of 20")).toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: "orange" }));
    expect(screen.getByText("唔係呢個，再試吓！")).toBeInTheDocument();
    expect(sounds.correct).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "red" }));
    const reward = screen.getByRole("dialog", { name: "好叻呀！" });
    expect(within(reward).getByText("你得到一個彩虹金幣！")).toBeInTheDocument();
    expect(sounds.correct).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();

    await user.click(within(reward).getByRole("button"));
    expect(screen.getByText("橙")).toHaveClass("chinese-character");
    expect(storedPlayers().players[0].progress).toEqual({ "chinese/colours": 1 });

    await user.click(screen.getByRole("button", { name: /所有主題/ }));
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
    await user.click(screen.getByRole("button", { name: /All sounds/ }));
    expect(currentPathname()).toBe("/cvc");
    await user.click(screen.getByRole("button", { name: /Choose a game/ }));
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
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
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
    expect(screen.queryByRole("link", { name: /rainbow coins/ })).not.toBeInTheDocument();
  });

  it("isn't shown when nobody is playing", () => {
    render(<GameApp />);
    expect(screen.queryByRole("link", { name: /rainbow coins/ })).not.toBeInTheDocument();
  });
});

describe("CVC shuffling", () => {
  const seed = (extra = {}) => window.localStorage.setItem(playersKey, JSON.stringify({
    players: [{ name: "Ada", coins: 0, age: "3-4", ...extra }],
    current: "Ada",
  }));

  it("deals 20 different words at random and keeps them when coming back", async () => {
    seed();
    let calls = 0;
    Math.random.mockImplementation(() => ((calls += 1) * 0.37) % 1);
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    expect(screen.getByRole("button", { name: /Beginning Sound/ })).toHaveTextContent("20 spells to learn");
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));

    const deck = storedPlayers().players[0].decks["cvc/beginning-sound"];
    expect(deck).toHaveLength(20);
    expect(new Set(deck).size).toBe(20);
    expect(deck).not.toEqual([...Array(20).keys()]);
    expect(screen.getByLabelText("Word 1 of 20")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /All sounds/ }));
    await user.click(screen.getByRole("button", { name: /Beginning Sound/ }));
    expect(storedPlayers().players[0].decks["cvc/beginning-sound"]).toEqual(deck);
  });

  it("deals a fresh hand of words after finishing all 20", async () => {
    seed({ progress: { "cvc/beginning-sound": 19 }, decks: { "cvc/beginning-sound": [...Array(20).keys()] } });
    setPathname("/cvc/beginning-sound");
    const user = userEvent.setup();
    render(<GameApp />);

    // Word 20 of the original order is "web".
    expect(await screen.findByLabelText("Word 20 of 20")).toBeInTheDocument();
    expect(screen.getByLabelText("Letter 2 of 3, e")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Letter w" }));
    await user.click(screen.getByRole("button", { name: /Check word/ }));
    await user.click(within(screen.getByRole("dialog", { name: /!$/ })).getByRole("button"));

    const praise = screen.getByRole("dialog", { name: "You did it!" });
    expect(praise).toHaveTextContent("all 20 Beginning Sound words");
    await user.click(within(praise).getByRole("button", { name: /Back to all topics/ }));
    expect(currentPathname()).toBe("/cvc");
    expect(storedPlayers().players[0].decks).toBeUndefined();
  });
});

describe("chinese words for 5-6 year olds", () => {
  it("plays the jobs topic with whole words", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 0, age: "5-6" }], current: "Elly" }));
    const user = userEvent.setup();
    render(<GameApp />);

    await user.click(screen.getByRole("button", { name: /進階篇/ }));
    expect(currentPathname()).toBe("/chinese-advanced");
    expect(screen.getByRole("button", { name: /職業/ })).toHaveTextContent("27 個字");
    expect(screen.getByRole("button", { name: /家/ })).toHaveTextContent("18 個字");
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

