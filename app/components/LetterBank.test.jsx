import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LetterBank from "./LetterBank";

describe("LetterBank", () => {
  it("shows each tile and greys out the placed ones", () => {
    render(<LetterBank label="Scrambled letters" round={0} tiles={["t", "a", "b"]} placed={[2, null, null]} onTileClick={jest.fn()} />);

    expect(screen.getByLabelText("Scrambled letters")).toHaveClass("letter-bank");
    expect(screen.getByRole("button", { name: "Letter b, placed" })).toHaveClass("tile-used");
    expect(screen.getByRole("button", { name: "Letter t" })).not.toHaveClass("tile-used");
  });

  it("reports which tile was tapped", async () => {
    const onTileClick = jest.fn();
    render(<LetterBank label="Letter choices" round={0} tiles={["a", "e", "i"]} placed={[null]} onTileClick={onTileClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Letter e" }));
    expect(onTileClick).toHaveBeenCalledWith(1);
  });
});
