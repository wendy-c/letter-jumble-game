import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MeasureWordGame from "./MeasureWordGame";
import { measureWordTopics } from "../measure-words-data";
import { speakCantonese } from "../lib/speech";

jest.mock("../lib/speech", () => ({ speakCantonese: jest.fn(), stopSpeaking: jest.fn() }));

const topic = measureWordTopics[0];
const pencil = topic.words.find((question) => question.answers[0] === "一枝鉛筆");

function renderQuestion(question = pencil) {
  const onAnswer = jest.fn();
  render(<MeasureWordGame topic={topic} round={0} question={question} onAnswer={onAnswer} />);
  return { onAnswer };
}

beforeEach(() => jest.clearAllMocks());

describe("MeasureWordGame", () => {
  it("shows 一 + the measure word with a blank, and four nouns with icons", () => {
    renderQuestion();
    expect(screen.getByLabelText("一枝，空格")).toBeInTheDocument();
    const options = screen.getAllByRole("button").filter((button) => button.classList.contains("measure-option"));
    expect(options).toHaveLength(4);
    expect(screen.getByRole("button", { name: /鉛筆/ }).querySelector("img")).toHaveAttribute("src", "/images/game-asset/measure-words/pencil.svg");
    expect(speakCantonese).not.toHaveBeenCalled();
  });

  it("gives one try: a wrong noun is reported and the right one fills the blank", async () => {
    const { onAnswer } = renderQuestion();
    const wrong = pencil.options.find((option) => !option.correct);
    await userEvent.click(screen.getByRole("button", { name: new RegExp(wrong.noun) }));
    await userEvent.click(screen.getByRole("button", { name: /鉛筆/ }));
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: new RegExp(wrong.noun) })).toHaveClass("chinese-option-wrong");
    expect(screen.getByLabelText("一枝鉛筆")).toBeInTheDocument();
    screen.getAllByRole("button").filter((button) => button.classList.contains("measure-option"))
      .forEach((option) => expect(option).toBeDisabled());
  });

  it("fills the blank with the right noun and reports it once", async () => {
    const { onAnswer } = renderQuestion();
    const right = screen.getByRole("button", { name: /鉛筆/ });
    await userEvent.click(right);
    await userEvent.click(right);
    expect(screen.getByLabelText("一枝鉛筆")).toBeInTheDocument();
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it("reads 一 + the measure word as a hint from the speaker button", async () => {
    renderQuestion();
    await userEvent.click(screen.getByRole("button", { name: "聽提示" }));
    expect(speakCantonese).toHaveBeenCalledWith("一枝", expect.any(Function));
  });
});
