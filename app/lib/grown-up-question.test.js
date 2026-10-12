import { isRightAnswer, makeGrownUpQuestion } from "./grown-up-question";

describe("grown-up question", () => {
  it("multiplies a number from 11-19 by one from 3-9", () => {
    expect(makeGrownUpQuestion(() => 0)).toEqual({ text: "11 × 3", answer: 33 });
    expect(makeGrownUpQuestion(() => 0.9999)).toEqual({ text: "19 × 9", answer: 171 });
    for (let index = 0; index < 50; index += 1) {
      const { text, answer } = makeGrownUpQuestion();
      const [first, second] = text.split(" × ").map(Number);
      expect(first).toBeGreaterThanOrEqual(11);
      expect(first).toBeLessThanOrEqual(19);
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
