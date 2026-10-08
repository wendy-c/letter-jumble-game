import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DragonDen from "./DragonDen";
import { dragonActionsById } from "../dragon-data";
import { sounds } from "../lib/sounds";

jest.mock("../lib/sounds", () => ({ sounds: { coin: jest.fn() } }));

// The real scene needs WebGL; this stand-in records commands and lets tests "tap" Mochi.
const commands = [];
jest.mock("./DragonScene", () => function MockDragonScene({ command, onPet }) {
  if (command) commands.push(command.id);
  return <button type="button" onClick={onPet}>Mochi</button>;
});

function renderDen(coins) {
  let balance = coins;
  const onSpendCoins = jest.fn((amount) => {
    if (balance < amount) return false;
    balance -= amount;
    return true;
  });
  const view = render(<DragonDen coins={coins} onSpendCoins={onSpendCoins} onBack={jest.fn()} />);
  return { ...view, onSpendCoins, rerenderWith: (next) => view.rerender(<DragonDen coins={next} onSpendCoins={onSpendCoins} onBack={jest.fn()} />) };
}

beforeEach(() => {
  commands.length = 0;
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("DragonDen", () => {
  it("lists every treat, grooming item and activity with its price, one tab at a time", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderDen(10);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent.trim())).toEqual(["🍎 Treats", "🛁 Grooming", "🎨 Activities"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    const sections = {
      Treats: ["Apple, 1 rainbow coin", "Carrot sticks, 1 rainbow coin", "Rainbow cupcake, 2 rainbow coins",
        "Chilli pepper, 3 rainbow coins", "Ice cream, 2 rainbow coins", "Milkshake, 2 rainbow coins"],
      Grooming: ["Comb, 1 rainbow coin", "Bath, 3 rainbow coins"],
      Activities: ["Painting, 2 rainbow coins", "Ballet dancing, 2 rainbow coins"],
    };
    for (const [tab, items] of Object.entries(sections)) {
      await user.click(screen.getByRole("tab", { name: new RegExp(tab) }));
      const panel = screen.getByRole("tabpanel", { name: new RegExp(tab) });
      expect(within(panel).getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual(items);
      items.forEach((name) => expect(within(panel).getByRole("button", { name })).toBeEnabled());
    }
  });

  it("moves between tabs with the arrow keys", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderDen(10);
    screen.getByRole("tab", { name: /Treats/ }).focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Grooming/ })).toHaveFocus();
    expect(screen.getByRole("tab", { name: /Grooming/ })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: /Activities/ })).toHaveFocus();
  });

  it("spends coins, plays the reaction and shows Mochi's message", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { onSpendCoins } = renderDen(10);

    await user.click(screen.getByRole("button", { name: /Chilli pepper/ }));

    expect(onSpendCoins).toHaveBeenCalledWith(3);
    expect(sounds.coin).toHaveBeenCalledTimes(1);
    expect(commands).toEqual(["chilli"]);
    expect(screen.getByText(dragonActionsById.chilli.reaction)).toBeInTheDocument();
  });

  it("waits for one reaction to finish before the next", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { onSpendCoins } = renderDen(10);

    await user.click(screen.getByRole("button", { name: /Apple/ }));
    expect(screen.getByRole("button", { name: /Carrot sticks/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Mochi" }));
    expect(commands).toEqual(["apple"]);

    act(() => jest.advanceTimersByTime(dragonActionsById.apple.duration * 1000));
    expect(screen.getByRole("button", { name: /Carrot sticks/ })).toBeEnabled();
    expect(screen.getByText(/Tap Mochi for a snuggle/)).toBeInTheDocument();
    expect(onSpendCoins).toHaveBeenCalledTimes(1);
  });

  it("disables items the player can't afford and explains how to earn more", () => {
    const { rerenderWith } = renderDen(2);
    expect(screen.getByRole("button", { name: /Ice cream/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Chilli pepper/ })).toBeDisabled();
    expect(screen.queryByText(/out of rainbow coins/)).not.toBeInTheDocument();

    rerenderWith(0);
    expect(screen.getByRole("button", { name: /Apple/ })).toBeDisabled();
    expect(screen.getByText(/out of rainbow coins/)).toBeInTheDocument();
  });

  it("gives free snuggles when Mochi is tapped", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { onSpendCoins } = renderDen(0);

    await user.click(screen.getByRole("button", { name: "Mochi" }));

    expect(commands).toEqual(["pet"]);
    expect(onSpendCoins).not.toHaveBeenCalled();
    expect(screen.getByText(dragonActionsById.pet.reaction)).toBeInTheDocument();
  });
});
