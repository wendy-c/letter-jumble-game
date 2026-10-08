const vowelTeams = [
  "igh", "air", "are", "ear", "ure", "ire", "ay", "ee", "ow", "oo", "ar", "or",
  "ir", "ou", "oy", "ea", "oi", "aw", "ur", "er", "ai", "oa", "ew",
].sort((first, second) => second.length - first.length);
const consonantTeams = [
  "shr", "spl", "spr", "squ", "str", "thr", "scr", "br", "cr", "dr", "fr", "gr",
  "pr", "tr", "bl", "cl", "fl", "gl", "pl", "sl", "sc", "sk", "sm", "sn", "sp", "ph",
  "st", "sw", "tw", "sh", "th",
].sort((first, second) => second.length - first.length);

function classifyTeams(word, teams, type) {
  const guides = Array(word.length).fill("other");

  for (let index = 0; index < word.length; index += 1) {
    if (guides[index] !== "other") continue;

    const team = teams.find((candidate) => word.startsWith(candidate, index));
    if (team) {
      for (let offset = 0; offset < team.length; offset += 1) {
        guides[index + offset] = type;
      }
    }
  }

  return guides;
}

export function getSpellingGuides(answer) {
  return answer.toLowerCase().split(" ").flatMap((word) => {
    const vowelGuides = classifyTeams(word, vowelTeams, "vowel");
    const consonantGuides = classifyTeams(word, consonantTeams, "consonant");

    return word.split("").map((_, index) => (
      vowelGuides[index] !== "other" ? "vowel" : consonantGuides[index]
    ));
  });
}

export function scramble(word, round) {
  const letters = word.split("");
  if (letters.length < 2) return letters;

  const shift = (round % (letters.length - 1)) + 1;
  const mixed = [...letters.slice(shift), ...letters.slice(0, shift)].reverse();
  if (mixed.join("") === word) mixed.push(mixed.shift());
  return mixed;
}

// `count` different positions from 0..size-1, in random order (a Fisher-Yates shuffle).
export function shuffledDeck(size, count, random = Math.random) {
  const indices = Array.from({ length: size }, (_, index) => index);
  for (let index = size - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [indices[index], indices[swap]] = [indices[swap], indices[index]];
  }
  return indices.slice(0, Math.min(count, size));
}

export function slotCount(word, wordIndex) {
  if (word.missing !== undefined) return 1;
  return word.answers[wordIndex % word.answers.length].replaceAll(" ", "").length;
}
