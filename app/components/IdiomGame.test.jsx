import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdiomGame from "./IdiomGame";
import { idiomTopics } from "../idioms-data";
import { speakCantonese } from "../lib/speech";

jest.mock("../lib/speech", () => ({ speakCantonese: jest.fn(), stopSpeaking: jest.fn() }));

const topic = idiomTopics[0];
const frog = topic.words.find((question) => question.idiom === "井底之蛙");

function renderQuestion(question = frog) {
  const onCorrect = jest.fn();
  const { container } = render(<IdiomGame topic={topic} round={0} question={question} onCorrect={onCorrect} />);
  return { onCorrect, container };
}

beforeEach(() => jest.clearAllMocks());

describe("IdiomGame", () => {
  it("shows the picture, the idiom with a gap, the meaning and four characters to choose from", () => {
    const { container } = renderQuestion();
    expect(container.querySelector(".idiom-picture")).toHaveAttribute("src", "/images/idioms/frog-well.svg");
    expect(screen.getByLabelText("井底之空格")).toHaveTextContent("井底之？");
    expect(screen.getByText("比喻見識狹窄的人。")).toBeInTheDocument();
    const options = screen.getAllByRole("button").filter((button) => button.classList.contains("idiom-option"));
    expect(options.map((option) => option.textContent).sort()).toEqual(["蛙", "魚", "貓", "鳥"].sort());
    expect(speakCantonese).not.toHaveBeenCalled();
  });

  it("greys out a wrong character and encourages another try", async () => {
    const { onCorrect } = renderQuestion();
    await userEvent.click(screen.getByRole("button", { name: "魚" }));
    expect(screen.getByRole("button", { name: "魚" })).toBeDisabled();
    expect(screen.getByText("唔係呢個，再試吓！")).toBeInTheDocument();
    expect(screen.getByLabelText("井底之空格")).toBeInTheDocument();
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it("fills the gap with the right character and reports it once", async () => {
    const { onCorrect } = renderQuestion();
    const right = screen.getByRole("button", { name: "蛙" });
    await userEvent.click(right);
    await userEvent.click(right);
    expect(screen.getByLabelText("井底之蛙")).toHaveTextContent("井底之蛙");
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it("reads the meaning as a hint from the speaker button", async () => {
    renderQuestion();
    await userEvent.click(screen.getByRole("button", { name: "聽提示" }));
    expect(speakCantonese).toHaveBeenCalledWith("比喻見識狹窄的人。", expect.any(Function));
  });
});
