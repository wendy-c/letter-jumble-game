"use client";

import { useCallback, useEffect, useState } from "react";
import { categories } from "./game-data";
import { cvcModes } from "./cvc-data";
import { chineseTopics } from "./chinese-data";
import { gamesForAge, isGameForAge } from "./games-data";
import AnswerPanel from "./components/AnswerPanel";
import GameFooter from "./components/GameFooter";
import GameHeading from "./components/GameHeading";
import GamePicker from "./components/GamePicker";
import PictureClue from "./components/PictureClue";
import PlayerDialog from "./components/PlayerDialog";
import PlayerMenu from "./components/PlayerMenu";
import ChineseGame from "./components/ChineseGame";
import RewardDialog, { chineseRewardLabels } from "./components/RewardDialog";
import SiteHeader from "./components/SiteHeader";
import DragonDen from "./components/DragonDen";
import TopicMenu from "./components/TopicMenu";
import WordMenu from "./components/WordMenu";
import { getSpellingGuides, scramble, slotCount } from "./lib/spelling";
import { speakWord, stopSpeaking } from "./lib/speech";
import { sounds } from "./lib/sounds";
import { usePlayers } from "./lib/use-players";

const rewardMessages = ["Amazing!", "Well done!", "You did it!", "Fantastic!", "Brilliant!"];
const chineseRewardMessages = ["好叻呀！", "做得好！", "答啱咗！", "好棒呀！", "你真係叻！"];

export default function Home() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const {
    players, currentPlayer, createPlayer, setPlayerAge, selectPlayer, logOut, addCoin, spendCoins, saveProgress,
  } = usePlayers();
  const rainbowCoins = currentPlayer?.coins ?? 0;
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  // A player saved before ages existed, who needs to say how old they are before playing.
  const [askAgeFor, setAskAgeFor] = useState(null);
  // The game chosen before anyone was playing; it opens once a player is picked.
  const [pendingGame, setPendingGame] = useState(null);
  const [rewardMessage, setRewardMessage] = useState("");
  const [wordMenuOpen, setWordMenuOpen] = useState(false);
  const [showSpellingGuide, setShowSpellingGuide] = useState(false);

  const puzzle = selectedCategory?.words[round];
  const answer = puzzle?.answers[round % puzzle.answers.length] ?? "";
  const answerLetters = answer.replaceAll(" ", "");
  const isCvc = selectedGame?.id === "cvc";
  const isChinese = selectedGame?.id === "chinese";
  const gameTopics = isCvc ? cvcModes : isChinese ? chineseTopics : categories;
  // Positions the learner fills in: every letter in Letter Jumble, one letter in CVC Sounds.
  const blanks = puzzle?.missing !== undefined ? [puzzle.missing] : answerLetters.split("").map((_, index) => index);
  const tiles = puzzle ? puzzle.choices ?? scramble(answerLetters, round) : [];
  const complete = Boolean(puzzle) && placed.length === blanks.length &&
    placed.every((tile, slotIndex) => tile !== null && tiles[tile] === answerLetters[blanks[slotIndex]]);
  const allPlaced = placed.every((tile) => tile !== null);
  const guides = showSpellingGuide && !isCvc && !isChinese ? getSpellingGuides(answer) : null;
  // The Chinese game answers by tapping a picture rather than filling in letters.
  const [chineseSolved, setChineseSolved] = useState(false);
  const solved = isChinese ? chineseSolved : complete;

  useEffect(() => () => {
    stopSpeaking();
  }, []);

  const closeWordMenu = useCallback(() => setWordMenuOpen(false), []);
  const closePlayerDialog = useCallback(() => {
    setPlayerDialogOpen(false);
    setPendingGame(null);
    setAskAgeFor(null);
  }, []);

  const progressKey = (topic) => `${selectedGame?.id}/${topic.id}`;

  function resetAnswer() {
    setChineseSolved(false);
    setChecked(false);
    setRewardMessage("");
  }

  // Opens a topic at the word the player got up to (or the start once it's been completed).
  function selectCategory(category, progress = currentPlayer?.progress) {
    const saved = progress?.[progressKey(category)] ?? 0;
    const start = saved < category.words.length ? saved : 0;
    setSelectedCategory(category);
    setRound(start);
    setPlaced(Array(slotCount(category.words[start], start)).fill(null));
    setVoiceMessage("");
    resetAnswer();
  }

  function requestGame(game) {
    if (currentPlayer?.age) {
      selectGame(game);
      return;
    }
    setPendingGame(game);
    setAskAgeFor(currentPlayer ? currentPlayer.name : null);
    setPlayerDialogOpen(true);
  }

  // Opens the game that was waiting, if it suits the player's age, or leaves a game that doesn't.
  function finishChoosingPlayer(name, age) {
    if (pendingGame) {
      if (isGameForAge(pendingGame, age)) selectGame(pendingGame);
      else showGames();
    } else if (selectedGame && !isGameForAge(selectedGame, age)) {
      showGames();
    } else if (selectedCategory) {
      // Pick up the new player's own place in this topic.
      selectCategory(selectedCategory, players.find((player) => player.name === name)?.progress);
    }
    closePlayerDialog();
  }

  function choosePlayer(name, age) {
    selectPlayer(name);
    finishChoosingPlayer(name, age);
  }

  function addPlayer(name, age) {
    const problem = createPlayer(name, age);
    if (!problem) finishChoosingPlayer(name, age);
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
      sounds.correct();
      setRewardMessage(rewardMessages[rainbowCoins % rewardMessages.length]);
      addCoin();
    }
  }

  function handleChineseCorrect() {
    if (chineseSolved) return;
    setChineseSolved(true);
    sounds.correct();
    setRewardMessage(chineseRewardMessages[rainbowCoins % chineseRewardMessages.length]);
    addCoin();
  }

  function nextWord() {
    selectWord((round + 1) % selectedCategory.words.length);
  }

  function selectWord(wordIndex) {
    saveProgress(progressKey(selectedCategory), wordIndex);
    setRound(wordIndex);
    setPlaced(Array(slotCount(selectedCategory.words[wordIndex], wordIndex)).fill(null));
    setVoiceMessage("");
    resetAnswer();
    setWordMenuOpen(false);
    stopSpeaking();
  }

  return (
    <main className={`app-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8${selectedGame?.id === "dragon" ? " app-shell-fit" : ""}`}>
      <SiteHeader badge={selectedGame?.badge ?? "SPELLING SCHOOL"}>
        {currentPlayer && (
          <PlayerMenu player={currentPlayer} onSwitch={() => setPlayerDialogOpen(true)} onLogOut={handleLogOut} />
        )}
      </SiteHeader>

      {!selectedGame ? (
        <GamePicker games={gamesForAge(currentPlayer?.age)} onSelectGame={requestGame} />
      ) : !selectedCategory ? (
        selectedGame.id === "dragon" ? (
          <DragonDen coins={rainbowCoins} onSpendCoins={spendCoins} onBack={showGames} />
        ) : (
          <TopicMenu
            isCvc={isCvc}
            isChinese={isChinese}
            topics={gameTopics}
            progressFor={(topic) => currentPlayer?.progress?.[progressKey(topic)] ?? 0}
            onBack={showGames}
            onSelectTopic={(topic) => selectCategory(topic)}
          />
        )
      ) : isChinese ? (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            topic={selectedCategory}
            round={round}
            rainbowCoins={rainbowCoins}
            wordMenuOpen={wordMenuOpen}
            onBack={showCategories}
            onOpenWordMenu={() => setWordMenuOpen(true)}
            backLabel="所有主題"
            eyebrow="今日嘅魔法堂"
            note="睇吓個字，揀啱嘅圖畫！"
          />
          <ChineseGame
            key={`${selectedCategory.id}-${round}`}
            topic={selectedCategory}
            round={round}
            word={puzzle}
            onCorrect={handleChineseCorrect}
          />
          <GameFooter>一個一個字慢慢學</GameFooter>
        </section>
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
          showGuideToggle={!isCvc && !isChinese}
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
          askAgeFor={askAgeFor}
          onSelect={choosePlayer}
          onCreate={addPlayer}
          onSetAge={setPlayerAge}
          onClose={closePlayerDialog}
        />
      )}
      {selectedCategory && rewardMessage && solved && (
        <RewardDialog message={rewardMessage} onContinue={nextWord} labels={isChinese ? chineseRewardLabels : undefined} />
      )}
    </main>
  );
}
