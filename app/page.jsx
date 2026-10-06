"use client";

import { useEffect, useState } from "react";
import { categories } from "./game-data";

const rewardMessages = ["Amazing!", "Well done!", "You did it!", "Fantastic!", "Brilliant!"];
const vowelTeams = [
  "igh", "air", "are", "ear", "ure", "ire", "ay", "ee", "ow", "oo", "ar", "or",
  "ir", "ou", "oy", "ea", "oi", "aw", "ur", "er", "ai", "oa", "ew",
].sort((first, second) => second.length - first.length);
const consonantTeams = [
  "shr", "spl", "spr", "squ", "str", "thr", "scr", "br", "cr", "dr", "fr", "gr",
  "pr", "tr", "bl", "cl", "fl", "gl", "pl", "sl", "sc", "sk", "sm", "sn", "sp", "ph",
  "st", "sw", "tw", "sh", "th",
].sort((first, second) => second.length - first.length);
const femaleVoiceName = /\b(female|woman|sonia|hazel|kate|serena|fiona|susan|jenny|aria|libby|amy|emma|olivia|salli|joanna|kendra|samantha|victoria|zira|tessa|moira|karen|siri)\b/i;

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

function getSpellingGuides(answer) {
  return answer.toLowerCase().split(" ").flatMap((word) => {
    const vowelGuides = classifyTeams(word, vowelTeams, "vowel");
    const consonantGuides = classifyTeams(word, consonantTeams, "consonant");

    return word.split("").map((_, index) => (
      vowelGuides[index] !== "other" ? "vowel" : consonantGuides[index]
    ));
  });
}

function findFemaleVoice(voices) {
  const femaleVoices = voices.filter((voice) => femaleVoiceName.test(voice.name));
  const britishFemaleVoice = femaleVoices.find((voice) => /^en[-_]?(GB|UK)\b/i.test(voice.lang));
  return britishFemaleVoice ?? femaleVoices.find((voice) => /^en\b/i.test(voice.lang)) ?? femaleVoices[0];
}

const mascots = {
  ada: { src: "/images/mascot-left.png", width: 480, height: 361 },
  elly: { src: "/images/mascot-right.png", width: 480, height: 322 },
};

function WizardHat() {
  return (
    <svg className="wizard-hat" viewBox="0 0 100 92" aria-hidden="true">
      <ellipse cx="50" cy="76" rx="46" ry="12" fill="#a98cf2" stroke="#4b2e22" strokeWidth="4" />
      <path
        d="M27 74C33 52 37 30 47 12c4-7 12-9 18-4-6 0-10 4-11 10 5 18 12 38 19 56Z"
        fill="#8a6ae6"
        stroke="#4b2e22"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M29 64h43l3 10H26Z" fill="#ffd45e" stroke="#4b2e22" strokeWidth="3" strokeLinejoin="round" />
      <path d="m51 31 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#ffe27a" />
    </svg>
  );
}

function Mascot({ name, className = "" }) {
  const { src, width, height } = mascots[name];
  return (
    <span className={`mascot mascot-${name} ${className}`} aria-hidden="true">
      <img src={src} alt="" width={width} height={height} />
      <WizardHat />
    </span>
  );
}

function scramble(word, round) {
  const letters = word.split("");
  if (letters.length < 2) return letters;

  const shift = (round % (letters.length - 1)) + 1;
  const mixed = [...letters.slice(shift), ...letters.slice(0, shift)].reverse();
  if (mixed.join("") === word) mixed.push(mixed.shift());
  return mixed;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [rainbowCoins, setRainbowCoins] = useState(0);
  const [rewardMessage, setRewardMessage] = useState("");
  const [wordMenuOpen, setWordMenuOpen] = useState(false);
  const [showSpellingGuide, setShowSpellingGuide] = useState(false);

  const puzzle = selectedCategory?.words[round];
  const answer = puzzle?.answers[round % puzzle.answers.length] ?? "";
  const answerLetters = answer.replaceAll(" ", "");
  const spellingGuides = getSpellingGuides(answer);
  const tiles = puzzle ? scramble(answerLetters, round) : [];
  const complete = Boolean(puzzle) && placed.length === answerLetters.length &&
    placed.every((tile, index) => tile !== null && tiles[tile] === answerLetters[index]);
  const allPlaced = placed.every((tile) => tile !== null);

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!wordMenuOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setWordMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wordMenuOpen]);

  function selectCategory(category) {
    setSelectedCategory(category);
    setRound(0);
    setPlaced(Array(category.words[0].answers[0].replaceAll(" ", "").length).fill(null));
    setChecked(false);
    setVoiceMessage("");
    setRewardMessage("");
  }

  function showCategories() {
    setSelectedCategory(null);
    setRound(0);
    setPlaced([]);
    setChecked(false);
    setVoiceMessage("");
    setRewardMessage("");
  }

  function speakWord() {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setVoiceMessage("Word audio isn’t available in this browser.");
      return;
    }

    const voice = findFemaleVoice(window.speechSynthesis.getVoices());
    if (!voice) {
      setVoiceMessage("A female voice isn’t available in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.voice = voice;
    utterance.lang = voice.lang || "en-GB";
    utterance.rate = 0.85;
    utterance.onstart = () => setVoiceMessage("Listen to the word.");
    utterance.onend = () => setVoiceMessage("");
    utterance.onerror = () => setVoiceMessage("Sorry, the word audio couldn’t be played.");

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setVoiceMessage("Sorry, the word audio couldn’t be played.");
    }
  }

  function placeTile(tileIndex) {
    setPlaced((current) => {
      const nextSlot = current.indexOf(null);
      if (nextSlot === -1 || current.includes(tileIndex)) return current;
      const next = [...current];
      next[nextSlot] = tileIndex;
      return next;
    });
    setChecked(false);
    setRewardMessage("");
  }

  function handleSlotClick(slotIndex) {
    if (placed[slotIndex] !== null && placed[slotIndex] !== undefined) {
      setPlaced((current) => current.map((tile, index) => (index === slotIndex ? null : tile)));
      setChecked(false);
      setRewardMessage("");
    }
  }

  function checkAnswer() {
    setChecked(true);
    if (complete && !checked) {
      setRewardMessage(rewardMessages[rainbowCoins % rewardMessages.length]);
      setRainbowCoins((current) => current + 1);
    }
  }

  function nextWord() {
    selectWord((round + 1) % selectedCategory.words.length);
  }

  function selectWord(wordIndex) {
    const selectedWord = selectedCategory.words[wordIndex];
    const selectedAnswer = selectedWord.answers[wordIndex % selectedWord.answers.length];

    setRound(wordIndex);
    setPlaced(Array(selectedAnswer.replaceAll(" ", "").length).fill(null));
    setChecked(false);
    setVoiceMessage("");
    setRewardMessage("");
    setWordMenuOpen(false);
    window.speechSynthesis?.cancel();
  }

  return (
    <main className="app-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8">
      <header className="topbar mx-auto flex w-full max-w-6xl items-center justify-between">
        <a className="brand" href="/" aria-label="Word Wave home">
        <img className="brand-logo" src="/images/logo.png" alt="" width="80" height="80" />
          <span>Learn with<span className="brand-wave"> Ada and Elly</span></span>
        </a>
        <div className="exam-badge">
          <span className="badge-sparkle" aria-hidden="true">✦</span>
          CAMBRIDGE MOVERS
        </div>
      </header>

      {!selectedCategory ? (
        <section className="game-wrap category-menu mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <div className="menu-heading">
            <p className="eyebrow">WELCOME TO SPELLING SCHOOL</p>
            <h1 id="game-title">Letter <span>Jumble</span></h1>
            <p className="heading-note">Pick a spell book and start today’s magic lesson.</p>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <button
                className={`category-card category-${category.color}`}
                type="button"
                key={category.id}
                onClick={() => selectCategory(category)}
              >
                <span className="category-card-top">
                  <span className="category-card-icon" aria-hidden="true"><img src={category.icon} alt="" width="40" height="40" /></span>
                  <span className="category-card-number">{String(index + 1).padStart(2, "0")}</span>
                </span>
                <span className="category-card-name">{category.name}</span>
                <span className="category-card-bottom">
                  <span>{category.words.length} spells to learn</span>
                  <span className="category-card-arrow" aria-hidden="true">→</span>
                </span>
              </button>
            ))}
          </div>
          <footer className="game-footer">
            <span><span className="footer-star" aria-hidden="true">✦</span> Every word is a little bit of magic!</span>
            <span className="footer-right">PICK A SPELL BOOK <span aria-hidden="true">♡</span></span>
          </footer>
        </section>
      ) : (
      <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
        <div className="game-heading">
          <div>
            <button className="category-back" type="button" onClick={showCategories}>
              <span aria-hidden="true">←</span> All games
            </button>
            <p className="eyebrow">TODAY’S MAGIC LESSON</p>
            <h1 id="game-title">{selectedCategory.name}</h1>
            <p className="heading-note">Look, think, cast the spell!</p>
          </div>
            <div className="progress-card" aria-label={`Word ${round + 1} of ${selectedCategory.words.length}`}>
              <div className="progress-copy">
                <span>YOUR PROGRESS</span>
                <strong><span>{String(round + 1).padStart(2, "0")}</span> / {String(selectedCategory.words.length).padStart(2, "0")}</strong>
              </div>
              <div className="progress-track" aria-hidden="true">
                <span style={{ width: `${((round + 1) / selectedCategory.words.length) * 100}%` }} />
              </div>
            </div>
          <div className="heading-progress">
            <div className="rainbow-coin-tools">
              <div className="rainbow-coin-counter" aria-label={`${rainbowCoins} rainbow coins collected`}>
                <img className="rainbow-coin-icon coin-pop" key={rainbowCoins} src="/images/rainbow-coin.svg" alt="" width="32" height="32" />
                <span className="coin-count">{rainbowCoins}</span>
                <span className="coin-label">RAINBOW COINS</span>
              </div>
              <button
                className="hamburger-button"
                type="button"
                aria-label={`Browse ${selectedCategory.name} words`}
                aria-expanded={wordMenuOpen}
                aria-haspopup="dialog"
                onClick={() => setWordMenuOpen(true)}
              >
                <span aria-hidden="true"><i /><i /><i /></span>
              </button>
            </div>
          </div>
        </div>

        <div className="game-card">
          <section className={`picture-panel picture-${puzzle.color}`} aria-label={`${puzzle.category} picture clue`}>
            <div className="picture-topline">
              <span className="category-label"><span className="category-dot" />{puzzle.category}</span>
              <span className="picture-count">{String(round + 1).padStart(2, "0")} <span>/ {String(selectedCategory.words.length).padStart(2, "0")}</span></span>
            </div>
            <div className="picture-art" role="img" aria-label={`Picture clue: ${selectedCategory.name.toLowerCase()}`}>
              <span className="art-sparkle sparkle-one" aria-hidden="true">✦</span>
              <span className="art-sparkle sparkle-two" aria-hidden="true">⋆</span>
              <span className="art-sparkle sparkle-three" aria-hidden="true">✧</span>
              {puzzle.picture.startsWith("/") ? (
                <img className="picture-image" key={puzzle.picture} src={puzzle.picture} alt="" width="128" height="128" />
              ) : (
                <span className="picture-emoji" aria-hidden="true">{puzzle.picture}</span>
              )}
              <span className="art-ground" aria-hidden="true" />
            </div>
            <div className="picture-caption">
              <Mascot name="ada" className="mascot-caption" />
              <p>What can you see?</p>
            </div>
          </section>

          <section className="answer-panel" aria-label="Spell the word">
            <div className="answer-intro">
              <span className="step-number">01</span>
              <div>
                <h2>Spell it out</h2>
                <p>Tap letters to fill the boxes</p>
              </div>
              <button className="voice-button" type="button" onClick={speakWord} aria-label="Hear the word" title="Hear the word">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                </svg>
              </button>
            </div>
            <p className={`voice-status${voiceMessage ? " voice-status-visible" : ""}`} aria-live="polite">
              {voiceMessage}
            </p>

            <div className="letter-slots" aria-label="Your answer">
              {answer.split("").map((letter, characterIndex) => {
                if (letter === " ") {
                  return <span className="word-space" aria-hidden="true" key={`space-${characterIndex}`} />;
                }
                const index = answer.slice(0, characterIndex).replaceAll(" ", "").length;
                const tileIndex = placed[index];
                const filled = tileIndex !== null && tileIndex !== undefined;
                const isCorrect = checked && filled && tiles[tileIndex] === letter;
                const guide = showSpellingGuide ? spellingGuides[index] : null;
                const guideLabel = guide ? `, ${guide === "other" ? "single sound" : `${guide} team`}` : "";
                return (
                  <button
                    className={`letter-slot${guide ? ` letter-slot-guide-${guide}` : ""}${filled ? " slot-filled" : ""}${isCorrect ? " slot-correct" : ""}${checked && filled && !isCorrect ? " slot-wrong" : ""}`}
                    type="button"
                    key={`${round}-${index}`}
                    aria-label={`Letter ${index + 1} of ${answerLetters.length}${filled ? `, ${tiles[tileIndex]}` : ", empty"}${guideLabel}`}
                    onClick={() => handleSlotClick(index)}
                  >
                    {filled ? tiles[tileIndex] : null}
                  </button>
                );
              })}
            </div>

            {showSpellingGuide && (
              <div className="spelling-guide" aria-label="Spelling guide">
                <span className="spelling-guide-title">Spelling guide</span>
                <span className="spelling-guide-item"><i className="guide-mark guide-mark-vowel" aria-hidden="true" /> Vowel team</span>
                <span className="spelling-guide-item"><i className="guide-mark guide-mark-consonant" aria-hidden="true" /> Consonant team</span>
                <span className="spelling-guide-item"><i className="guide-mark guide-mark-other" aria-hidden="true" /> Other</span>
              </div>
            )}

            <div className="tile-instructions">
              <span className="step-number">02</span>
              <span>Tap letters in spelling order</span>
              <span className="instruction-line" />
            </div>

            <div className="letter-bank" aria-label="Scrambled letters">
              {tiles.map((letter, index) => {
                const isPlaced = placed.includes(index);
                return (
                  <button
                    className={`letter-tile${isPlaced ? " tile-used" : ""}`}
                    type="button"
                    key={`${round}-${index}`}
                    data-letter={letter}
                    aria-label={`Letter ${letter}${isPlaced ? ", placed" : ""}`}
                    onClick={() => {
                      if (isPlaced) {
                        setPlaced((current) => current.map((tile) => (tile === index ? null : tile)));
                        setChecked(false);
                        setRewardMessage("");
                      } else {
                        placeTile(index);
                      }
                    }}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            <div className="answer-footer">
              {checked && !complete && <Mascot name="elly" className="mascot-feedback" />}
              <p className={`feedback${checked ? (complete ? " feedback-success" : " feedback-try") : ""}`} aria-live="polite">
                {checked
                  ? complete
                    ? " "
                    : allPlaced
                      ? "Not quite — give it another try!"
                      : "Fill every box before you check."
                  : " "}
              </p>
              <button className="action-button check-button" type="button" onClick={checkAnswer}>
                Check word <span aria-hidden="true">🪄</span>
              </button>
            </div>
          </section>
        </div>

        <footer className="game-footer">
          <span><span className="footer-star" aria-hidden="true">✦</span> Every word is a little bit of magic!</span>
          <span className="footer-right">ONE LETTER AT A TIME <span aria-hidden="true">♡</span></span>
        </footer>
      </section>
        )}
      {wordMenuOpen && selectedCategory && (
        <div className="word-menu-overlay" onClick={() => setWordMenuOpen(false)}>
          <aside
            className="word-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="word-menu-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="word-menu-header">
              <div>
                <p className="eyebrow">CHOOSE A SPELL TO PRACTISE</p>
                <h2 id="word-menu-title">{selectedCategory.name}</h2>
                <p className="word-menu-count">{selectedCategory.words.length} words in this game</p>
              </div>
              <button
                className="word-menu-close"
                type="button"
                aria-label="Close word menu"
                onClick={() => setWordMenuOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="word-menu-settings">
              <button
                className="spelling-guide-toggle"
                type="button"
                role="switch"
                aria-checked={showSpellingGuide}
                onClick={() => setShowSpellingGuide((current) => !current)}
              >
                <span className="spelling-guide-toggle-copy">
                  <span className="spelling-guide-toggle-title">Spelling guide</span>
                  <span className="spelling-guide-toggle-note">Show vowel and consonant teams</span>
                </span>
                <span className="toggle-track" aria-hidden="true"><span className="toggle-thumb" /></span>
              </button>
            </div>
            <nav className="word-menu-list" aria-label={`${selectedCategory.name} words`}>
              {selectedCategory.words.map((word, index) => {
                const displayWord = word.answers[index % word.answers.length];
                const title = displayWord.charAt(0).toLocaleUpperCase() + displayWord.slice(1);
                const isCurrent = index === round;

                return (
                  <button
                    className={`word-menu-item${isCurrent ? " word-menu-item-current" : ""}`}
                    type="button"
                    key={`${selectedCategory.id}-${index}`}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => selectWord(index)}
                  >
                    <span className="word-menu-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="word-menu-name">{title}</span>
                    {isCurrent && <span className="word-menu-playing">PLAYING</span>}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
      {selectedCategory && rewardMessage && complete && (
        <div className="reward-overlay">
          <div className="reward-dialog" role="dialog" aria-modal="true" aria-labelledby="reward-title">
            <button
              className="reward-card"
              type="button"
              autoFocus
              aria-label={`${rewardMessage} You earned a rainbow coin. Tap to go to the next word.`}
              onClick={nextWord}
            >
              <span className="reward-sparkle reward-sparkle-one" aria-hidden="true">✦</span>
              <span className="reward-sparkle reward-sparkle-two" aria-hidden="true">✧</span>
              <span className="reward-cast" aria-hidden="true">
                <Mascot name="ada" className="mascot-reward mascot-reward-left" />
                <img className="reward-coin" src="/images/rainbow-coin.svg" alt="" width="84" height="84" />
                <Mascot name="elly" className="mascot-reward mascot-reward-right" />
              </span>
              <span className="reward-kicker">MAGIC REWARD</span>
              <span className="reward-title" id="reward-title">{rewardMessage}</span>
              <span className="reward-coin-earned">You collected a rainbow coin!</span>
              <span className="reward-continue">Tap to play the next word <span aria-hidden="true">→</span></span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
