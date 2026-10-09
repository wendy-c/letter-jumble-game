import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MeasureWordGame from "./MeasureWordGame";
import { measureWordTopics } from "../measure-words-data";
import { speakCantonese } from "../lib/speech";

jest.mock("../lib/speech", () => ({ speakCantonese: jest.fn(), stopSpeaking: jest.fn() }));

const topic = measureWordTopics[0];
const pencil = topic.words.find((question) => question.answers[0] === "一枝鉛筆");

function renderQuestion(question = pencil) {
  const onCorrect = jest.fn();
  render(<MeasureWordGame topic={topic} round={0} question={question} onCorrect={onCorrect} />);
  return { onCorrect };
}

beforeEach(() => jest.clearAllMocks());

describe("MeasureWordGame", () => {
  it("shows 一 + the measure word with a blank, and four nouns with icons", () => {
    renderQuestion();
    expect(screen.getByLabelText("一枝，空格")).toBeInTheDocument();
    const options = screen.getAllByRole("button").filter((button) => button.classList.contains("measure-option"));
    expect(options).toHaveLength(4);
    expect(screen.getByRole("button", { name: /鉛筆/ })).toHaveTextContent("✏️");
    expect(speakCantonese).not.toHaveBeenCalled();
  });

  it("greys out a wrong noun and encourages another try", async () => {
    const { onCorrect } = renderQuestion();
    const wrong = pencil.options.find((option) => !option.correct);
    await userEvent.click(screen.getByRole("button", { name: new RegExp(wrong.noun) }));
    expect(screen.getByRole("button", { name: new RegExp(wrong.noun) })).toBeDisabled();
    expect(screen.getByText("唔係呢個，再試吓！")).toBeInTheDocument();
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it("fills the blank with the right noun and reports it once", async () => {
    const { onCorrect } = renderQuestion();
    const right = screen.getByRole("button", { name: /鉛筆/ });
    await userEvent.click(right);
    await userEvent.click(right);
    expect(screen.getByLabelText("一枝鉛筆")).toBeInTheDocument();
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it("reads 一 + the measure word as a hint from the speaker button", async () => {
    renderQuestion();
    await userEvent.click(screen.getByRole("button", { name: "聽提示" }));
    expect(speakCantonese).toHaveBeenCalledWith("一枝", expect.any(Function));
  });
});
