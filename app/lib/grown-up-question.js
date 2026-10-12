// A maths question to keep young children out of parent mode: a two-digit number times a
// single digit (e.g. 14 × 7) is easy for a grown-up to work out, but beyond a 3-6 year old.
export function makeGrownUpQuestion(random = Math.random) {
  const first = 11 + Math.floor(random() * 9); // 11-19
  const second = 3 + Math.floor(random() * 7); // 3-9
  return { text: `${first} × ${second}`, answer: first * second };
}

export function isRightAnswer(question, typed) {
  return /^\s*\d+\s*$/.test(typed) && Number(typed) === question.answer;
}
