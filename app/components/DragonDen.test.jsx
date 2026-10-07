import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DragonDen from "./DragonDen";
import { dragonActionsById } from "../dragon-data";

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
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("DragonDen", () => {
  it("lists every treat and grooming item with its price", () => {
    renderDen(10);
    expect(screen.getByRole("heading", { name: "Treats" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Grooming" })).toBeInTheDocument();
    [
      "Apple, 1 rainbow coin",
      "Carrot sticks, 1 rainbow coin",
      "Rainbow cupcake, 2 rainbow coins",
      "Chilli pepper cookie, 3 rainbow coins",
      "Ice cream, 2 rainbow coins",
      "Comb, 1 rainbow coin",
      "Bath, 3 rainbow coins",
    ].forEach((name) => expect(screen.getByRole("button", { name })).toBeEnabled());
  });

  it("spends coins, plays the reaction and shows Mochi's message", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { onSpendCoins } = renderDen(10);

    await user.click(screen.getByRole("button", { name: /Chilli pepper cookie/ }));

    expect(onSpendCoins).toHaveBeenCalledWith(3);
    expect(commands).toEqual(["chilli"]);
    expect(screen.getByText(dragonActionsById.chilli.reaction)).toBeInTheDocument();
  });

  it("waits for one reaction to finish before the next", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { onSpendCoins } = renderDen(10);

    await user.click(screen.getByRole("button", { name: /Apple/ }));
    expect(screen.getByRole("button", { name: /Bath/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Mochi" }));
    expect(commands).toEqual(["apple"]);

    act(() => jest.advanceTimersByTime(dragonActionsById.apple.duration * 1000));
    expect(screen.getByRole("button", { name: /Bath/ })).toBeEnabled();
    expect(screen.getByText(/Tap Mochi for a snuggle/)).toBeInTheDocument();
    expect(onSpendCoins).toHaveBeenCalledTimes(1);
  });

  it("disables items the player can't afford and explains how to earn more", () => {
    const { rerenderWith } = renderDen(2);
    expect(screen.getByRole("button", { name: /Ice cream/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Bath/ })).toBeDisabled();
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
