import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdiomGame from "./IdiomGame";
import { idiomTopics } from "../idioms-data";
import { speakCantonese } from "../lib/speech";

jest.mock("../lib/speech", () => ({ speakCantonese: jest.fn(), stopSpeaking: jest.fn() }));

const topic = idiomTopics[0];
const frog = topic.words.find((question) => question.idiom === "井底之蛙");

function renderQuestion(question = frog) {
  const onAnswer = jest.fn();
  const { container } = render(<IdiomGame topic={topic} round={0} question={question} onAnswer={onAnswer} />);
  return { onAnswer, container };
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

  it("gives one try: a wrong character is reported and the right one fills the gap", async () => {
    const { onAnswer } = renderQuestion();
    await userEvent.click(screen.getByRole("button", { name: "魚" }));
    await userEvent.click(screen.getByRole("button", { name: "蛙" }));
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: "魚" })).toHaveClass("chinese-option-wrong");
    expect(screen.getByRole("button", { name: "蛙" })).toHaveClass("chinese-option-right");
    expect(screen.getByLabelText("井底之蛙")).toBeInTheDocument();
  });

  it("fills the gap with the right character and reports it once", async () => {
    const { onAnswer } = renderQuestion();
    const right = screen.getByRole("button", { name: "蛙" });
    await userEvent.click(right);
    await userEvent.click(right);
    expect(screen.getByLabelText("井底之蛙")).toHaveTextContent("井底之蛙");
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it("reads the idiom and its meaning from the speaker button", async () => {
    renderQuestion();
    await userEvent.click(screen.getByRole("button", { name: "聽提示" }));
    expect(speakCantonese).toHaveBeenCalledWith("井底之蛙，比喻見識狹窄的人。", expect.any(Function));
  });
});
