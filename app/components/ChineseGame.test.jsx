import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChineseGame from "./ChineseGame";
import { chineseTopics } from "../chinese-data";
import { speakCantonese } from "../lib/speech";

jest.mock("../lib/speech", () => ({ speakCantonese: jest.fn(), stopSpeaking: jest.fn() }));

const colours = chineseTopics[0];
const red = colours.words[0];

function renderRound(word = red, round = 0) {
  const onCorrect = jest.fn();
  render(<ChineseGame topic={colours} round={round} word={word} onCorrect={onCorrect} />);
  return { onCorrect };
}

beforeEach(() => jest.clearAllMocks());

describe("ChineseGame", () => {
  it("shows the character without saying it, so the learner reads it first", () => {
    renderRound();
    expect(screen.getByText("紅")).toHaveClass("chinese-character");
    expect(screen.getByText("紅")).toHaveAttribute("lang", "zh-Hant-HK");
    expect(speakCantonese).not.toHaveBeenCalled();
  });

  it("says the character in Cantonese as a hint from the corner speaker button", async () => {
    renderRound();
    const hint = screen.getByRole("button", { name: "聽提示" });
    expect(hint).toHaveClass("voice-button");
    expect(hint.closest(".answer-intro")).not.toBeNull();

    await userEvent.click(hint);
    expect(speakCantonese).toHaveBeenCalledTimes(1);
    expect(speakCantonese).toHaveBeenCalledWith("紅", expect.any(Function));
  });

  it("offers four pictures to choose from", () => {
    renderRound();
    const choices = screen.getAllByRole("button").filter((button) => button.classList.contains("chinese-option"));
    expect(choices.map((choice) => choice.dataset.character)).toEqual(red.options.map((option) => option.character));
  });

  it("greys out a wrong picture and encourages another try", async () => {
    const { onCorrect } = renderRound();
    const wrong = red.options.find((option) => option.character !== "紅");

    await userEvent.click(screen.getByRole("button", { name: wrong.english }));

    expect(screen.getByRole("button", { name: wrong.english })).toBeDisabled();
    expect(screen.getByText("唔係呢個，再試吓！")).toBeInTheDocument();
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it("reports the right picture once", async () => {
    const { onCorrect } = renderRound();
    const right = screen.getByRole("button", { name: "red" });

    await userEvent.click(right);
    await userEvent.click(right);

    expect(right).toHaveClass("chinese-option-right");
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it("shows two-character words like 彩色 on a wider card", () => {
    renderRound(colours.words.at(-1), 12);
    expect(screen.getByText("彩色")).toHaveClass("chinese-character-pair");
  });
});

describe("phrases", () => {
  const food = chineseTopics.find((topic) => topic.id === "food");
  const biscuit = food.words[0];

  it("shows everyday phrases under the character, with the character highlighted", () => {
    render(<ChineseGame topic={food} round={0} word={biscuit} onCorrect={jest.fn()} />);
    const list = screen.getByRole("list", { name: "常見詞語" });
    const phrases = screen.getAllByRole("button", { name: /^聽「/ });
    expect(phrases.map((phrase) => phrase.textContent)).toEqual(["餅乾", "月餅"]);
    expect(list).toHaveAttribute("lang", "zh-Hant-HK");
    phrases.forEach((phrase) => {
      expect(phrase.querySelector("mark")).toHaveTextContent("餅");
    });
  });

  it("reads a phrase in Cantonese when it's tapped", async () => {
    render(<ChineseGame topic={food} round={0} word={biscuit} onCorrect={jest.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "聽「月餅」" }));
    expect(speakCantonese).toHaveBeenCalledWith("月餅", expect.any(Function));
  });

  it("shows no phrases for topics without them", () => {
    renderRound();
    expect(screen.queryByRole("list", { name: "常見詞語" })).not.toBeInTheDocument();
  });
});
