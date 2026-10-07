import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

// The real dragon scene needs WebGL, which jsdom doesn't have.
jest.mock("./components/DragonScene", () => function MockDragonScene() {
  return <div data-testid="dragon-scene" />;
});

const coinsLabel = (count) => `${count} rainbow coins collected`;
const playersKey = "letter-jumble:players";
const whoIsPlaying = /Who.s playing/;

beforeEach(() => {
  window.localStorage.clear();
});

function storedPlayers() {
  return JSON.parse(window.localStorage.getItem(playersKey));
}

async function addPlayer(user, name) {
  const dialog = screen.getByRole("dialog", { name: whoIsPlaying });
  await user.type(within(dialog).getByRole("textbox"), name);
  await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));
}

// Opens a game, creating a player called Ada if the "Who's playing?" pop-up appears.
async function openGame(user, gameName, topicName) {
  await user.click(screen.getByRole("button", { name: new RegExp(gameName) }));
  if (screen.queryByRole("dialog", { name: whoIsPlaying })) await addPlayer(user, "Ada");
  await user.click(screen.getByRole("button", { name: new RegExp(topicName) }));
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
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
    const gameCards = screen.getAllByRole("button").filter((button) => button.classList.contains("game-choice-card"));
    expect(gameCards.map((card) => card.querySelector(".category-card-name").textContent)).toEqual(["CVC Sounds", "Letter Jumble for Movers", "Rainbow Dragon"]);
    expect(screen.getByText("SPELLING SCHOOL")).toBeInTheDocument();
  });

  it("plays a Letter Jumble word and earns a rainbow coin", async () => {
    const user = userEvent.setup();
    render(<Home />);
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
    expect(storedPlayers()).toEqual({ players: [{ name: "Ada", coins: 1 }], current: "Ada" });

    await user.click(within(reward).getByRole("button"));
    expect(screen.getByLabelText("Word 2 of 13")).toBeInTheDocument();
  });

  it("does not reward a wrong or unfinished answer", async () => {
    const user = userEvent.setup();
    render(<Home />);
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
    render(<Home />);
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
    render(<Home />);
    await openGame(user, "CVC Sounds", "Ending Sound");

    await user.click(screen.getByRole("button", { name: /All sounds/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
    await user.click(screen.getByRole("button", { name: /Choose a game/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
  });

  it("turns on the spelling guide from the word menu", async () => {
    const user = userEvent.setup();
    render(<Home />);
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
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    const dialog = screen.getByRole("dialog", { name: whoIsPlaying });
    expect(within(dialog).getByLabelText(/name/)).toHaveFocus();
    expect(within(dialog).queryByRole("list")).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
  });

  it("creates a new player with just a name and opens the chosen game", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    await addPlayer(user, "Mia");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CVC Sounds");
    expect(screen.getByRole("button", { name: "Playing as Mia. Player options" })).toBeInTheDocument();
    expect(storedPlayers()).toEqual({ players: [{ name: "Mia", coins: 0 }], current: "Mia" });
  });

  it("shows a message instead of creating a blank or duplicate player", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0 }], current: null }));
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    const dialog = screen.getByRole("dialog", { name: whoIsPlaying });
    await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Please type a name.");

    await user.type(within(dialog).getByRole("textbox"), "ADA");
    await user.click(within(dialog).getByRole("button", { name: /Let.s play/ }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Ada is already a player.");
    expect(storedPlayers().players).toHaveLength(1);
  });

  it("picks an existing player and shows their coins", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({
      players: [{ name: "Ada", coins: 3 }, { name: "Elly", coins: 8 }],
      current: null,
    }));
    const user = userEvent.setup();
    render(<Home />);

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
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 2 }], current: "Ada" }));
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /Letter Jumble/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Letter Jumble");
  });

  it("switches player mid-game and stores coins under the new player", async () => {
    const user = userEvent.setup();
    render(<Home />);
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
      players: [{ name: "Ada", coins: 1 }, { name: "Elly", coins: 1 }],
      current: "Elly",
    });
  });

  it("logs out back to the picker and asks again next time", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await openGame(user, "Letter Jumble", "Animals");

    await user.click(screen.getByRole("button", { name: /Player options/ }));
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Choose an adventure!");
    expect(screen.queryByRole("button", { name: /Player options/ })).not.toBeInTheDocument();
    expect(storedPlayers()).toEqual({ players: [{ name: "Ada", coins: 0 }], current: null });

    await user.click(screen.getByRole("button", { name: /CVC Sounds/ }));
    expect(screen.getByRole("dialog", { name: whoIsPlaying })).toBeInTheDocument();
  });
});

describe("rainbow dragon", () => {
  it("asks who is playing, then spends their coins on Mochi", async () => {
    window.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 4 }], current: null }));
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /Rainbow Dragon/ }));
    await user.click(within(screen.getByRole("dialog", { name: whoIsPlaying })).getByRole("button", { name: /Ada/ }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mochi the Rainbow Dragon");
    expect(screen.getByText("RAINBOW DRAGON")).toBeInTheDocument();
    expect(screen.getByTestId("dragon-scene")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Bath, 3 rainbow coins/ }));
    expect(screen.getByLabelText(coinsLabel(1))).toBeInTheDocument();
    expect(storedPlayers().players).toEqual([{ name: "Ada", coins: 1 }]);
  });
});
