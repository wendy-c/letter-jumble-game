"use client";

import { useEffect, useState } from "react";
import { categories } from "./game-data";

const femaleVoiceName = /\b(female|woman|sonia|hazel|kate|serena|fiona|susan|jenny|aria|libby|amy|emma|olivia|salli|joanna|kendra|samantha|victoria|zira|tessa|moira|karen|siri)\b/i;

function findFemaleVoice(voices) {
  const femaleVoices = voices.filter((voice) => femaleVoiceName.test(voice.name));
  const britishFemaleVoice = femaleVoices.find((voice) => /^en[-_]?(GB|UK)\b/i.test(voice.lang));
  return britishFemaleVoice ?? femaleVoices.find((voice) => /^en\b/i.test(voice.lang)) ?? femaleVoices[0];
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

  const puzzle = selectedCategory?.words[round];
  const answer = puzzle?.answers[round % puzzle.answers.length] ?? "";
  const answerLetters = answer.replaceAll(" ", "");
  const tiles = puzzle ? scramble(answerLetters, round) : [];
  const complete = Boolean(puzzle) && placed.length === answerLetters.length &&
    placed.every((tile, index) => tile !== null && tiles[tile] === answerLetters[index]);
  const allPlaced = placed.every((tile) => tile !== null);
  const canContinue = checked && complete;

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
  }, []);

  function selectCategory(category) {
    setSelectedCategory(category);
    setRound(0);
    setPlaced(Array(category.words[0].answers[0].replaceAll(" ", "").length).fill(null));
    setChecked(false);
    setVoiceMessage("");
  }

  function showCategories() {
    setSelectedCategory(null);
    setRound(0);
    setPlaced([]);
    setChecked(false);
    setVoiceMessage("");
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
  }

  function handleSlotClick(slotIndex) {
    if (placed[slotIndex] !== null && placed[slotIndex] !== undefined) {
      setPlaced((current) => current.map((tile, index) => (index === slotIndex ? null : tile)));
      setChecked(false);
    }
  }

  function checkAnswer() {
    setChecked(true);
  }

  function nextWord() {
    const nextRound = (round + 1) % selectedCategory.words.length;
    setRound(nextRound);
    const nextAnswer = selectedCategory.words[nextRound].answers[
      nextRound % selectedCategory.words[nextRound].answers.length
    ];
    setPlaced(Array(nextAnswer.replaceAll(" ", "").length).fill(null));
    setChecked(false);
    setVoiceMessage("");
  }

  return (
    <main className="app-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8">
      <header className="topbar mx-auto flex w-full max-w-6xl items-center justify-between">
        <a className="brand" href="/" aria-label="Word Wave home">
          <span className="brand-mark" aria-hidden="true">w</span>
          <span>word<span className="brand-wave">wave</span></span>
        </a>
        <div className="exam-badge">
          <span className="badge-sparkle" aria-hidden="true">✳</span>
          CAMBRIDGE MOVERS
        </div>
      </header>

      {!selectedCategory ? (
        <section className="game-wrap category-menu mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <div className="menu-heading">
            <p className="eyebrow">A LITTLE WORD ADVENTURE</p>
            <h1 id="game-title">Pick your <span>adventure!</span></h1>
            <p className="heading-note">Choose a topic and let the word games begin.</p>
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
                  <span className="category-card-icon" aria-hidden="true">{category.icon}</span>
                  <span className="category-card-number">{String(index + 1).padStart(2, "0")}</span>
                </span>
                <span className="category-card-name">{category.name}</span>
                <span className="category-card-bottom">
                  <span>{category.words.length} words to discover</span>
                  <span className="category-card-arrow" aria-hidden="true">→</span>
                </span>
              </button>
            ))}
          </div>
          <footer className="game-footer">
            <span><span className="footer-star" aria-hidden="true">✦</span> Every word makes you wonder-full!</span>
            <span className="footer-right">PICK A TOPIC TO PLAY <span aria-hidden="true">♡</span></span>
          </footer>
        </section>
      ) : (
      <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
        <div className="game-heading">
          <div>
            <button className="category-back" type="button" onClick={showCategories}>
              <span aria-hidden="true">←</span> All games
            </button>
            <p className="eyebrow">A LITTLE WORD ADVENTURE</p>
            <h1 id="game-title">Picture <span>perfect!</span></h1>
            <p className="heading-note">{selectedCategory.name}: look, think, spell!</p>
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
        </div>

        <div className="game-card">
          <section className={`picture-panel picture-${puzzle.color}`} aria-label={`${puzzle.category} picture clue`}>
            <div className="picture-topline">
              <span className="category-label"><span className="category-dot" />{puzzle.category}</span>
              <span className="picture-count">{String(round + 1).padStart(2, "0")} <span>/ {String(selectedCategory.words.length).padStart(2, "0")}</span></span>
            </div>
            <div className="picture-art" role="img" aria-label={`Picture clue: ${selectedCategory.name.toLowerCase()}`}>
              <span className="art-sparkle sparkle-one" aria-hidden="true">✦</span>
              <span className="art-sparkle sparkle-two" aria-hidden="true">✳</span>
              <span className="art-sparkle sparkle-three" aria-hidden="true">✧</span>
              <span className="picture-emoji" aria-hidden="true">{puzzle.picture}</span>
              <span className="art-ground" aria-hidden="true" />
            </div>
            <div className="picture-caption">
              <span className="caption-icon" aria-hidden="true">✳</span>
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
                return (
                  <button
                    className={`letter-slot${filled ? " slot-filled" : ""}${isCorrect ? " slot-correct" : ""}${checked && filled && !isCorrect ? " slot-wrong" : ""}`}
                    type="button"
                    key={`${round}-${index}`}
                    aria-label={`Letter ${index + 1} of ${answerLetters.length}${filled ? `, ${tiles[tileIndex]}` : ", empty"}`}
                    onClick={() => handleSlotClick(index)}
                  >
                    {filled ? tiles[tileIndex] : <span className="slot-dot" />}
                  </button>
                );
              })}
            </div>

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
              <p className={`feedback${checked ? (complete ? " feedback-success" : " feedback-try") : ""}`} aria-live="polite">
                {checked
                  ? complete
                    ? "Brilliant! You got it!"
                    : allPlaced
                      ? "Not quite — give it another try!"
                      : "Fill every box before you check."
                  : " "}
              </p>
              {canContinue ? (
                <button className="action-button next-button" type="button" onClick={nextWord}>
                  Next word <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button className="action-button check-button" type="button" onClick={checkAnswer}>
                  Check word <span aria-hidden="true">✓</span>
                </button>
              )}
            </div>
          </section>
        </div>

        <footer className="game-footer">
          <span><span className="footer-star" aria-hidden="true">✦</span> Every word makes you wonder-full!</span>
          <span className="footer-right">ONE LETTER AT A TIME <span aria-hidden="true">♡</span></span>
        </footer>
      </section>
        )}
    </main>
  );
}
