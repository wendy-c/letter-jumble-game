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

// The word's letters out of order. With a `random` source they're shuffled; without one they're
// mixed the same way every time for that round.
export function scramble(word, round, random) {
  const letters = word.split("");
  if (letters.length < 2) return letters;
  if (random) {
    // Reshuffle until the letters aren't in spelling order (a word like "zz" can't be mixed).
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const mixed = shuffled(letters, random);
      if (mixed.join("") !== word) return mixed;
    }
  }

  const shift = (round % (letters.length - 1)) + 1;
  const mixed = [...letters.slice(shift), ...letters.slice(0, shift)].reverse();
  if (mixed.join("") === word) mixed.push(mixed.shift());
  return mixed;
}

// The items in a new random order (a Fisher-Yates shuffle), leaving the original alone.
export function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

// A repeatable random source: the same text always gives the same numbers (FNV-1a hash
// seeding mulberry32). Used to mix answers once per deal, so a reload doesn't move them.
export function seededRandom(text) {
  let seed = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    seed = Math.imul(seed ^ text.charCodeAt(index), 16777619);
  }
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
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
  return word.answers[wordIndex % word.answers.length].replaceAll(" ", "").replaceAll("-", "").length;
}
