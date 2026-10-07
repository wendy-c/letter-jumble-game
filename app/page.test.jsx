import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

const coinsLabel = (count) => `${count} rainbow coins collected`;

beforeEach(() => {
  window.localStorage.clear();
});

async function openGame(user, gameName, topicName) {
  await user.click(screen.getByRole("button", { name: new RegExp(gameName) }));
  await user.click(screen.getByRole("button", { name: new RegExp(topicName) }));
}

describe("Home", () => {
  it("starts on the game picker", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pick a game");
    const gameCards = screen.getAllByRole("button").filter((button) => button.classList.contains("game-choice-card"));
    expect(gameCards.map((card) => card.querySelector(".category-card-name").textContent)).toEqual(["CVC Sounds", "Letter Jumble"]);
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
    expect(window.localStorage.getItem("letter-jumble:rainbow-coins")).toBe("1");

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
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pick a game");
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
