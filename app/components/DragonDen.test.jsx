import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DragonDen from "./DragonDen";
import { dragonActionsById, dragons } from "../dragon-data";
import { sounds } from "../lib/sounds";

jest.mock("../lib/sounds", () => ({ sounds: { coin: jest.fn() } }));

// The real scene needs WebGL; this stand-in records commands and lets tests "tap" Mochi.
const commands = [];
jest.mock("./DragonScene", () => function MockDragonScene({ command, onPet, room, name }) {
  if (command) commands.push(command.id);
  return <button type="button" onClick={onPet} data-room={room}>{name}</button>;
});

function renderDen(coins, dragon = dragons.mochi) {
  let balance = coins;
  const onSpendCoins = jest.fn((amount) => {
    if (balance < amount) return false;
    balance -= amount;
    return true;
  });
  const view = render(<DragonDen dragon={dragon} coins={coins} onSpendCoins={onSpendCoins} />);
  return { ...view, onSpendCoins, rerenderWith: (next) => view.rerender(<DragonDen dragon={dragon} coins={next} onSpendCoins={onSpendCoins} />) };
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
  it("is at home for treats, walks to the bathroom for grooming and to the beach for activities", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderDen(10);
    const room = () => screen.getByRole("button", { name: "Mochi" }).dataset.room;
    expect(room()).toBe("home");
    await user.click(screen.getByRole("tab", { name: /Grooming/ }));
    expect(room()).toBe("bathroom");
    await user.click(screen.getByRole("tab", { name: /Activities/ }));
    expect(room()).toBe("beach");
    await user.click(screen.getByRole("tab", { name: /Treats/ }));
    expect(room()).toBe("home");
  });

  it("lists every treat, grooming item and activity with its price, one tab at a time", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderDen(10);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent.trim())).toEqual(["🍎 Treats", "🛁 Grooming", "🎨 Activities"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    const sections = {
      Treats: ["Apple, 1 rainbow coin", "Carrot, 1 rainbow coin", "Cupcake, 2 rainbow coins",
        "Chilli pepper, 3 rainbow coins", "Ice cream, 2 rainbow coins", "Milkshake, 2 rainbow coins",
        "Lemon, 1 rainbow coin", "Salad, 2 rainbow coins", "Noodles, 2 rainbow coins"],
      Grooming: ["Comb, 1 rainbow coin", "Bath, 3 rainbow coins", "Brush teeth, 1 rainbow coin"],
      Activities: ["Painting, 2 rainbow coins", "Ballet dancing, 2 rainbow coins", "Meditation, 2 rainbow coins", "Invite a friend, 3 rainbow coins", "Sandcastle, 2 rainbow coins"],
    };
    expect(screen.getByRole("tabpanel", { name: /Treats/ })).toHaveClass("dragon-actions-treat");
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
    expect(screen.getByRole("button", { name: /Carrot/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Mochi" }));
    expect(commands).toEqual(["apple"]);

    act(() => jest.advanceTimersByTime(dragonActionsById.apple.duration * 1000));
    expect(screen.getByRole("button", { name: /Carrot/ })).toBeEnabled();
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

  it("takes turns snuggling, twirling and waving when Mochi is tapped, for free", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { onSpendCoins } = renderDen(0);

    for (const [id, message] of [["pet", "Snuggles"], ["twirl", "twirl"], ["wave", "Hi hi"], ["pet", "Snuggles"]]) {
      await user.click(screen.getByRole("button", { name: "Mochi" }));
      expect(commands.at(-1)).toBe(id);
      expect(screen.getByText(new RegExp(message))).toBeInTheDocument();
      act(() => jest.advanceTimersByTime(dragonActionsById[id].duration * 1000));
    }
    expect(onSpendCoins).not.toHaveBeenCalled();
  });

  it("ignores taps while Mochi is still reacting", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderDen(0);
    await user.click(screen.getByRole("button", { name: "Mochi" }));
    await user.click(screen.getByRole("button", { name: "Mochi" }));
    expect(commands).toEqual(["pet"]);
  });
});

describe("Tofu's den", () => {
  it("has her own treats, grooming and kitchen activities, in her own rooms", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderDen(10, dragons.tofu);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tofu the Fairy Dragon");
    const room = () => screen.getByRole("button", { name: "Tofu" }).dataset.room;
    const items = () => within(screen.getByRole("tabpanel")).getAllByRole("button").map((button) => button.textContent.replace(/\d+$/, "").replace(/^\W+/u, ""));

    expect(room()).toBe("tofu-home");
    expect(items()).toEqual(["Apple", "Cupcake", "Chilli pepper", "Ice cream", "Lemon", "Milkshake"]);
    await user.click(screen.getByRole("tab", { name: /Grooming/ }));
    expect(room()).toBe("tofu-bathroom");
    await user.click(screen.getByRole("tab", { name: /Activities/ }));
    expect(room()).toBe("kitchen");
    expect(items()).toEqual(["Banana cupcakes", "Science", "Singing", "Reading"]);
  });

  it("reacts to treats in her own shy way", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderDen(10, dragons.tofu);
    await user.click(screen.getByRole("button", { name: "Chilli pepper, 3 rainbow coins" }));
    expect(commands).toEqual(["tofu-chilli"]);
    expect(dragonActionsById["tofu-chilli"].animation).toBe("shyChilli");
    expect(screen.getByText(dragonActionsById["tofu-chilli"].reaction)).toBeInTheDocument();
    expect(dragonActionsById["tofu-chilli"].reaction).not.toBe(dragonActionsById.chilli.reaction);
  });

  it("peeks, flutters and giggles when tapped", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderDen(0, dragons.tofu);
    expect(screen.getByText("H-hello… tap me gently?")).toBeInTheDocument();
    for (const id of ["tofu-shy", "tofu-flutter", "tofu-giggle"]) {
      await user.click(screen.getByRole("button", { name: "Tofu" }));
      expect(commands.at(-1)).toBe(id);
      act(() => jest.advanceTimersByTime(dragonActionsById[id].duration * 1000));
    }
  });
});
