import { isRightAnswer, makeGrownUpQuestion } from "./grown-up-question";

describe("grown-up question", () => {
  it("multiplies a number from 3-11 by one from 3-9", () => {
    expect(makeGrownUpQuestion(() => 0)).toEqual({ text: "3 × 3", answer: 9 });
    expect(makeGrownUpQuestion(() => 0.9999)).toEqual({ text: "11 × 9", answer: 99 });
    for (let index = 0; index < 50; index += 1) {
      const { text, answer } = makeGrownUpQuestion();
      const [first, second] = text.split(" × ").map(Number);
      expect(first).toBeGreaterThanOrEqual(3);
      expect(first).toBeLessThanOrEqual(11);
      expect(second).toBeGreaterThanOrEqual(3);
      expect(second).toBeLessThanOrEqual(9);
      expect(answer).toBe(first * second);
    }
  });

  it("only accepts the exact answer as a whole number", () => {
    const question = { text: "14 × 7", answer: 98 };
    expect(isRightAnswer(question, "98")).toBe(true);
    expect(isRightAnswer(question, " 98 ")).toBe(true);
    ["97", "", "98.0", "9 8", "ninety-eight", "098x"].forEach((typed) => expect(isRightAnswer(question, typed)).toBe(false));
  });
});
