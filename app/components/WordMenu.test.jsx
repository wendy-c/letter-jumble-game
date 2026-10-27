import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WordMenu from "./WordMenu";

const topic = {
  id: "animals",
  name: "Animals",
  words: [{ answers: ["bat"] }, { answers: ["dolphin"] }, { answers: ["lift", "elevator"] }],
};

function renderMenu(props) {
  const handlers = {
    onSelectWord: jest.fn(),
    onClose: jest.fn(),
  };
  render(
    <WordMenu
      topic={topic}
      round={1}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe("WordMenu", () => {
  it("lists every word, capitalised, and marks the one being played", () => {
    renderMenu();
    expect(screen.getByRole("dialog", { name: "Animals" })).toBeInTheDocument();
    expect(screen.getByText("3 words in this game")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bat/ })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: /Dolphin/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("PLAYING")).toBeInTheDocument();
  });

  it("shows the answer that matches the word's position", () => {
    renderMenu();
    expect(screen.getByRole("button", { name: /Lift/ })).toBeInTheDocument();
  });

  it("picks a word", async () => {
    const { onSelectWord } = renderMenu();
    await userEvent.click(screen.getByRole("button", { name: /Bat/ }));
    expect(onSelectWord).toHaveBeenCalledWith(0);
  });

  it("has no spelling guide switch (it's in Parent mode)", () => {
    renderMenu();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("closes with the close button, the backdrop or Escape, but not a click inside", async () => {
    const { onClose } = renderMenu();

    await userEvent.click(screen.getByRole("heading", { name: "Animals" }));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Close word menu" }));
    await userEvent.click(document.querySelector(".word-menu-overlay"));
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
