import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LetterSlots from "./LetterSlots";

function renderSlots(props) {
  const onSlotClick = jest.fn();
  render(
    <LetterSlots
      answer="cat"
      round={0}
      blanks={[0, 1, 2]}
      placed={[null, null, null]}
      tiles={["t", "a", "c"]}
      checked={false}
      guides={null}
      onSlotClick={onSlotClick}
      {...props}
    />,
  );
  return { onSlotClick };
}

describe("LetterSlots", () => {
  it("shows an empty slot for every letter in Letter Jumble", () => {
    renderSlots();
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Letter 1 of 3, empty" })).toBeInTheDocument();
  });

  it("shows given letters around a single gap in CVC Sounds", () => {
    renderSlots({ blanks: [1], placed: [null], tiles: ["a", "e", "i", "o", "u"] });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByLabelText("Letter 1 of 3, c")).toHaveClass("letter-given");
    expect(screen.getByLabelText("Letter 3 of 3, t")).toHaveClass("letter-given");
    expect(screen.getByRole("button", { name: "Letter 2 of 3, empty" })).toHaveClass("letter-slot");
  });

  it("shows placed letters and marks them right or wrong once checked", () => {
    renderSlots({ placed: [2, 0, null], checked: true });
    expect(screen.getByRole("button", { name: "Letter 1 of 3, c" })).toHaveClass("slot-filled", "slot-correct");
    expect(screen.getByRole("button", { name: "Letter 2 of 3, t" })).toHaveClass("slot-wrong");
    expect(screen.getByRole("button", { name: "Letter 3 of 3, empty" })).not.toHaveClass("slot-filled");
  });

  it("keeps each word of a multi-word answer together", () => {
    const { container } = render(
      <LetterSlots
        answer="ice skates"
        round={0}
        blanks={[...Array(9).keys()]}
        placed={Array(9).fill(null)}
        tiles={"iceskates".split("")}
        checked={false}
        guides={null}
        onSlotClick={jest.fn()}
      />,
    );
    const words = container.querySelectorAll(".letter-word");
    expect(words).toHaveLength(2);
    expect(words[0].children).toHaveLength(3);
    expect(words[1].children).toHaveLength(6);
    expect(container.querySelector(".letter-slots")).toHaveStyle("--word-letters: 6");
  });

  it("adds spelling guide marks and labels only when guides are given", () => {
    renderSlots({ answer: "ship", blanks: [0, 1, 2, 3], placed: Array(4).fill(null), tiles: "pihs".split(""), guides: ["consonant", "consonant", "other", "other"] });
    expect(screen.getByRole("button", { name: "Letter 1 of 4, empty, consonant team" })).toHaveClass("letter-slot-guide-consonant");
    expect(screen.getByRole("button", { name: "Letter 3 of 4, empty, single sound" })).toHaveClass("letter-slot-guide-other");
  });

  it("reports the slot index, not the letter position, when tapped", async () => {
    const { onSlotClick } = renderSlots({ blanks: [2], placed: [0], tiles: ["t", "x"] });
    await userEvent.click(screen.getByRole("button", { name: "Letter 3 of 3, t" }));
    expect(onSlotClick).toHaveBeenCalledWith(0);
  });
});
