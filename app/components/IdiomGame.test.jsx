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
  it("shows the picture, the meaning and four idioms to choose from", () => {
    const { container } = renderQuestion();
    expect(container.querySelector(".idiom-picture")).toHaveAttribute("src", "/images/idioms/frog-well.svg");
    expect(screen.getByText("比喻見識狹窄的人。")).toBeInTheDocument();
    const options = screen.getAllByRole("button").filter((button) => button.classList.contains("idiom-option"));
    expect(options).toHaveLength(4);
    expect(options.map((option) => option.textContent)).toContain("井底之蛙");
    expect(speakCantonese).not.toHaveBeenCalled();
  });

  it("greys out a wrong idiom and encourages another try", async () => {
    const { onCorrect } = renderQuestion();
    const wrong = frog.options.find((option) => !option.correct);
    await userEvent.click(screen.getByRole("button", { name: wrong.idiom }));
    expect(screen.getByRole("button", { name: wrong.idiom })).toBeDisabled();
    expect(screen.getByText("唔係呢個，再試吓！")).toBeInTheDocument();
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it("shows the idiom under the picture when it's right, and reports it once", async () => {
    const { onCorrect, container } = renderQuestion();
    const right = screen.getByRole("button", { name: "井底之蛙" });
    await userEvent.click(right);
    await userEvent.click(right);
    expect(container.querySelector(".idiom-answer")).toHaveTextContent("井底之蛙");
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it("reads the meaning as a hint from the speaker button", async () => {
    renderQuestion();
    await userEvent.click(screen.getByRole("button", { name: "聽提示" }));
    expect(speakCantonese).toHaveBeenCalledWith("比喻見識狹窄的人。", expect.any(Function));
  });
});
