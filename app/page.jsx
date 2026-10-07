"use client";

import { useCallback, useEffect, useState } from "react";
import { categories } from "./game-data";
import { cvcModes } from "./cvc-data";
import { games } from "./games-data";
import AnswerPanel from "./components/AnswerPanel";
import GameFooter from "./components/GameFooter";
import GameHeading from "./components/GameHeading";
import GamePicker from "./components/GamePicker";
import PictureClue from "./components/PictureClue";
import PlayerDialog from "./components/PlayerDialog";
import PlayerMenu from "./components/PlayerMenu";
import RewardDialog from "./components/RewardDialog";
import SiteHeader from "./components/SiteHeader";
import TopicMenu from "./components/TopicMenu";
import WordMenu from "./components/WordMenu";
import { getSpellingGuides, scramble, slotCount } from "./lib/spelling";
import { speakWord, stopSpeaking } from "./lib/speech";
import { usePlayers } from "./lib/use-players";

const rewardMessages = ["Amazing!", "Well done!", "You did it!", "Fantastic!", "Brilliant!"];

export default function Home() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const { players, currentPlayer, createPlayer, selectPlayer, logOut, addCoin } = usePlayers();
  const rainbowCoins = currentPlayer?.coins ?? 0;
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  // The game chosen before anyone was playing; it opens once a player is picked.
  const [pendingGame, setPendingGame] = useState(null);
  const [rewardMessage, setRewardMessage] = useState("");
  const [wordMenuOpen, setWordMenuOpen] = useState(false);
  const [showSpellingGuide, setShowSpellingGuide] = useState(false);

  const puzzle = selectedCategory?.words[round];
  const answer = puzzle?.answers[round % puzzle.answers.length] ?? "";
  const answerLetters = answer.replaceAll(" ", "");
  const isCvc = selectedGame?.id === "cvc";
  const gameTopics = isCvc ? cvcModes : categories;
  // Positions the learner fills in: every letter in Letter Jumble, one letter in CVC Sounds.
  const blanks = puzzle?.missing !== undefined ? [puzzle.missing] : answerLetters.split("").map((_, index) => index);
  const tiles = puzzle ? puzzle.choices ?? scramble(answerLetters, round) : [];
  const complete = Boolean(puzzle) && placed.length === blanks.length &&
    placed.every((tile, slotIndex) => tile !== null && tiles[tile] === answerLetters[blanks[slotIndex]]);
  const allPlaced = placed.every((tile) => tile !== null);
  const guides = showSpellingGuide && !isCvc ? getSpellingGuides(answer) : null;

  useEffect(() => () => {
    stopSpeaking();
  }, []);

  const closeWordMenu = useCallback(() => setWordMenuOpen(false), []);
  const closePlayerDialog = useCallback(() => {
    setPlayerDialogOpen(false);
    setPendingGame(null);
  }, []);

  function resetAnswer() {
    setChecked(false);
    setRewardMessage("");
  }

  function selectCategory(category) {
    setSelectedCategory(category);
    setRound(0);
    setPlaced(Array(slotCount(category.words[0], 0)).fill(null));
    setVoiceMessage("");
    resetAnswer();
  }

  function requestGame(game) {
    if (currentPlayer) {
      selectGame(game);
    } else {
      setPendingGame(game);
      setPlayerDialogOpen(true);
    }
  }

  function finishChoosingPlayer() {
    if (pendingGame) selectGame(pendingGame);
    closePlayerDialog();
  }

  function choosePlayer(name) {
    selectPlayer(name);
    finishChoosingPlayer();
  }

  function addPlayer(name) {
    const problem = createPlayer(name);
    if (!problem) finishChoosingPlayer();
    return problem;
  }

  function handleLogOut() {
    logOut();
    setWordMenuOpen(false);
    showGames();
  }

  function selectGame(game) {
    setSelectedGame(game);
    showCategories();
  }

  function showGames() {
    setSelectedGame(null);
    showCategories();
  }

  function showCategories() {
    setSelectedCategory(null);
    setRound(0);
    setPlaced([]);
    setVoiceMessage("");
    resetAnswer();
  }

  function placeTile(tileIndex) {
    setPlaced((current) => {
      if (current.includes(tileIndex)) return current;
      // With a single gap, tapping another letter swaps it in.
      if (current.length === 1) return [tileIndex];
      const nextSlot = current.indexOf(null);
      if (nextSlot === -1) return current;
      const next = [...current];
      next[nextSlot] = tileIndex;
      return next;
    });
    resetAnswer();
  }

  function handleTileClick(tileIndex) {
    if (placed.includes(tileIndex)) {
      setPlaced((current) => current.map((tile) => (tile === tileIndex ? null : tile)));
      resetAnswer();
    } else {
      placeTile(tileIndex);
    }
  }

  function handleSlotClick(slotIndex) {
    if (placed[slotIndex] !== null && placed[slotIndex] !== undefined) {
      setPlaced((current) => current.map((tile, index) => (index === slotIndex ? null : tile)));
      resetAnswer();
    }
  }

  function checkAnswer() {
    setChecked(true);
    if (complete && !checked) {
      setRewardMessage(rewardMessages[rainbowCoins % rewardMessages.length]);
      addCoin();
    }
  }

  function nextWord() {
    selectWord((round + 1) % selectedCategory.words.length);
  }

  function selectWord(wordIndex) {
    setRound(wordIndex);
    setPlaced(Array(slotCount(selectedCategory.words[wordIndex], wordIndex)).fill(null));
    setVoiceMessage("");
    resetAnswer();
    setWordMenuOpen(false);
    stopSpeaking();
  }

  return (
    <main className="app-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8">
      <SiteHeader badge={selectedGame?.badge ?? "SPELLING SCHOOL"}>
        {currentPlayer && (
          <PlayerMenu player={currentPlayer} onSwitch={() => setPlayerDialogOpen(true)} onLogOut={handleLogOut} />
        )}
      </SiteHeader>

      {!selectedGame ? (
        <GamePicker games={games} onSelectGame={requestGame} />
      ) : !selectedCategory ? (
        <TopicMenu isCvc={isCvc} topics={gameTopics} onBack={showGames} onSelectTopic={selectCategory} />
      ) : (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            isCvc={isCvc}
            topic={selectedCategory}
            round={round}
            rainbowCoins={rainbowCoins}
            wordMenuOpen={wordMenuOpen}
            onBack={showCategories}
            onOpenWordMenu={() => setWordMenuOpen(true)}
          />

          <div className="game-card">
            <PictureClue puzzle={puzzle} topic={selectedCategory} round={round} />
            <AnswerPanel
              isCvc={isCvc}
              answer={answer}
              round={round}
              blanks={blanks}
              placed={placed}
              tiles={tiles}
              checked={checked}
              complete={complete}
              allPlaced={allPlaced}
              guides={guides}
              voiceMessage={voiceMessage}
              onSpeak={() => speakWord(answer, setVoiceMessage)}
              onSlotClick={handleSlotClick}
              onTileClick={handleTileClick}
              onCheck={checkAnswer}
            />
          </div>

          <GameFooter>ONE LETTER AT A TIME</GameFooter>
        </section>
      )}

      {wordMenuOpen && selectedCategory && (
        <WordMenu
          topic={selectedCategory}
          round={round}
          showGuideToggle={!isCvc}
          showSpellingGuide={showSpellingGuide}
          onToggleSpellingGuide={() => setShowSpellingGuide((current) => !current)}
          onSelectWord={selectWord}
          onClose={closeWordMenu}
        />
      )}
      {playerDialogOpen && (
        <PlayerDialog
          players={players}
          currentName={currentPlayer?.name}
          onSelect={choosePlayer}
          onCreate={addPlayer}
          onClose={closePlayerDialog}
        />
      )}
      {selectedCategory && rewardMessage && complete && (
        <RewardDialog message={rewardMessage} onContinue={nextWord} />
      )}
    </main>
  );
}
