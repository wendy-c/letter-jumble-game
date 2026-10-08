"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { categories } from "../game-data";
import { cvcModes } from "../cvc-data";
import { chineseTopics } from "../chinese-data";
import { games, gamesForAge, isGameForAge } from "../games-data";
import AnswerPanel from "./AnswerPanel";
import ChineseGame from "./ChineseGame";
import CoinLink from "./CoinLink";
import CompletionDialog, { chineseCompletionText } from "./CompletionDialog";
import DragonDen from "./DragonDen";
import GameFooter from "./GameFooter";
import GameHeading from "./GameHeading";
import GamePicker from "./GamePicker";
import PictureClue from "./PictureClue";
import PlayerDialog from "./PlayerDialog";
import PlayerMenu from "./PlayerMenu";
import RewardDialog, { chineseRewardLabels } from "./RewardDialog";
import SiteHeader from "./SiteHeader";
import TopicMenu from "./TopicMenu";
import WordMenu from "./WordMenu";
import { getSpellingGuides, scramble, shuffledDeck, slotCount } from "../lib/spelling";
import { speakWord, stopSpeaking } from "../lib/speech";
import { sounds } from "../lib/sounds";
import { usePlayers } from "../lib/use-players";

const rewardMessages = ["Amazing!", "Well done!", "You did it!", "Fantastic!", "Brilliant!"];
const chineseRewardMessages = ["好叻呀！", "做得好！", "答啱咗！", "好棒呀！", "你真係叻！"];

const topicsByGame = {
  cvc: cvcModes,
  chinese: chineseTopics,
  "letter-jumble": categories,
};

// Routes: "/" is the game picker, "/<game>" lists a game's topics (or is Mochi's den),
// and "/<game>/<topic>" plays a topic. The address is the source of truth for where we are.
function parsePath(pathname) {
  const [gameId = null, topicId = null] = (pathname ?? "/").split("/").filter(Boolean).map(decodeURIComponent);
  return { gameId, topicId };
}

export default function GameApp() {
  const pathname = usePathname();
  const router = useRouter();
  const { gameId, topicId } = parsePath(pathname);

  const {
    loaded, players, currentPlayer, createPlayer, setPlayerAge, selectPlayer, logOut, addCoin, spendCoins, saveProgress, saveDeck,
  } = usePlayers();
  const rainbowCoins = currentPlayer?.coins ?? 0;

  const routeGame = games.find((game) => game.id === gameId) ?? null;
  // A game only opens once the saved player has loaded and the game suits their age.
  const allowed = Boolean(routeGame && loaded && currentPlayer?.age && isGameForAge(routeGame, currentPlayer.age));
  const selectedGame = allowed ? routeGame : null;
  const gameTopics = topicsByGame[selectedGame?.id] ?? [];
  const routeTopic = (topicId && gameTopics.find((topic) => topic.id === topicId)) || null;
  const categoryKey = routeTopic ? `${selectedGame.id}/${routeTopic.id}` : null;
  // Topics with `wordsPerGame` (CVC) play a shuffled hand of that many words, saved per player
  // so leaving and coming back continues the same words.
  const deck = routeTopic?.wordsPerGame ? currentPlayer?.decks?.[categoryKey] : null;
  const validDeck = Boolean(deck) && deck.length === Math.min(routeTopic.wordsPerGame, routeTopic.words.length) &&
    deck.every((index) => index < routeTopic.words.length);
  const selectedCategory = routeTopic?.wordsPerGame
    ? (validDeck ? { ...routeTopic, words: deck.map((index) => routeTopic.words[index]) } : null)
    : routeTopic;

  // Where we are in the open topic. `key` says which topic this belongs to, so a stale round
  // from another topic is never shown while switching.
  const [position, setPosition] = useState({ key: null, round: 0 });
  const round = position.key === categoryKey ? position.round : null;

  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  // A player saved before ages existed, who needs to say how old they are before playing.
  const [askAgeFor, setAskAgeFor] = useState(null);
  // The game chosen before anyone was playing; it opens once a player is picked.
  const [pendingGame, setPendingGame] = useState(null);
  const [rewardMessage, setRewardMessage] = useState("");
  const [wordMenuOpen, setWordMenuOpen] = useState(false);
  const [showSpellingGuide, setShowSpellingGuide] = useState(false);
  // The Chinese game answers by tapping a picture rather than filling in letters.
  const [chineseSolved, setChineseSolved] = useState(false);
  // Set once the last word of a topic is done, to show the "you finished" pop-up.
  const [completedTopic, setCompletedTopic] = useState(null);

  const isCvc = selectedGame?.id === "cvc";
  const isChinese = selectedGame?.id === "chinese";
  const puzzle = round === null ? undefined : selectedCategory?.words[round];
  const answer = puzzle?.answers[round % puzzle.answers.length] ?? "";
  const answerLetters = answer.replaceAll(" ", "");
  // Positions the learner fills in: every letter in Letter Jumble, one letter in CVC Sounds.
  const blanks = puzzle?.missing !== undefined ? [puzzle.missing] : answerLetters.split("").map((_, index) => index);
  const tiles = puzzle ? puzzle.choices ?? scramble(answerLetters, round) : [];
  const complete = Boolean(puzzle) && placed.length === blanks.length &&
    placed.every((tile, slotIndex) => tile !== null && tiles[tile] === answerLetters[blanks[slotIndex]]);
  const allPlaced = placed.every((tile) => tile !== null);
  const guides = showSpellingGuide && !isCvc && !isChinese ? getSpellingGuides(answer) : null;
  const solved = isChinese ? chineseSolved : complete;

  useEffect(() => () => {
    stopSpeaking();
  }, []);

  // Keep the address valid: unknown games and topics go back up a level, and a game the
  // current player can't play goes back to the picker (asking who's playing if nobody is).
  useEffect(() => {
    if (!loaded || !gameId) return;
    if (!routeGame) {
      router.replace("/");
      return;
    }
    if (!allowed) {
      router.replace("/");
      if (!currentPlayer?.age) {
        setPendingGame(routeGame);
        setAskAgeFor(currentPlayer ? currentPlayer.name : null);
        setPlayerDialogOpen(true);
      }
      return;
    }
    if (topicId && !routeTopic) router.replace(`/${routeGame.id}`);
  }, [loaded, gameId, topicId, routeGame, allowed, currentPlayer, routeTopic, router]);

  // A shuffled topic without a hand of words yet gets one dealt.
  useEffect(() => {
    if (!routeTopic?.wordsPerGame || !currentPlayer || validDeck) return;
    saveDeck(categoryKey, shuffledDeck(routeTopic.words.length, routeTopic.wordsPerGame));
    saveProgress(categoryKey, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey, currentPlayer?.name, validDeck]);

  // Opening a topic (or switching player inside one) starts at the word that player got up to.
  useEffect(() => {
    if (!selectedCategory) return;
    const saved = currentPlayer?.progress?.[categoryKey] ?? 0;
    const start = saved < selectedCategory.words.length ? saved : 0;
    setPosition({ key: categoryKey, round: start });
    setPlaced(Array(slotCount(selectedCategory.words[start], start)).fill(null));
    setVoiceMessage("");
    setChineseSolved(false);
    setChecked(false);
    setRewardMessage("");
    setWordMenuOpen(false);
    setCompletedTopic(null);
    // Only when the topic, player or dealt words change, not on every progress save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey, currentPlayer?.name, validDeck]);

  const closeWordMenu = useCallback(() => setWordMenuOpen(false), []);
  const closePlayerDialog = useCallback(() => {
    setPlayerDialogOpen(false);
    setPendingGame(null);
    setAskAgeFor(null);
  }, []);

  function resetAnswer() {
    setChineseSolved(false);
    setChecked(false);
    setRewardMessage("");
  }

  function selectGame(game) {
    router.push(`/${game.id}`);
  }

  function showGames() {
    router.push("/");
  }

  function showCategories() {
    router.push(`/${selectedGame.id}`);
  }

  function selectCategory(topic) {
    router.push(`/${selectedGame.id}/${topic.id}`);
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
  function finishChoosingPlayer(age) {
    if (pendingGame) {
      if (isGameForAge(pendingGame, age)) selectGame(pendingGame);
    } else if (selectedGame && !isGameForAge(selectedGame, age)) {
      showGames();
    }
    closePlayerDialog();
  }

  function choosePlayer(name, age) {
    selectPlayer(name);
    finishChoosingPlayer(age);
  }

  function addPlayer(name, age) {
    const problem = createPlayer(name, age);
    if (!problem) finishChoosingPlayer(age);
    return problem;
  }

  function handleLogOut() {
    logOut();
    setWordMenuOpen(false);
    showGames();
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
    if (round === selectedCategory.words.length - 1) {
      finishTopic();
      return;
    }
    selectWord(round + 1);
  }

  // The last word is done: start the topic again next time, and celebrate.
  function finishTopic() {
    saveProgress(categoryKey, 0);
    setRewardMessage("");
    setCompletedTopic({ name: selectedCategory.name, count: selectedCategory.words.length });
    sounds.sparkle?.();
  }

  function leaveCompletedTopic() {
    // A shuffled topic deals a fresh hand of words next time. (Not before leaving: dealing
    // straight away would reset the screen under the pop-up.)
    if (routeTopic.wordsPerGame) saveDeck(categoryKey, null);
    setCompletedTopic(null);
    showCategories();
  }

  function selectWord(wordIndex) {
    saveProgress(categoryKey, wordIndex);
    setPosition({ key: categoryKey, round: wordIndex });
    setPlaced(Array(slotCount(selectedCategory.words[wordIndex], wordIndex)).fill(null));
    setVoiceMessage("");
    resetAnswer();
    setWordMenuOpen(false);
    stopSpeaking();
  }

  const playing = Boolean(selectedCategory && puzzle);

  return (
    <main className={`app-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8${selectedGame?.id === "dragon" ? " app-shell-fit" : ""}`}>
      <SiteHeader badge={selectedGame?.badge ?? "SPELLING SCHOOL"}>
        {currentPlayer && !gameId && <CoinLink coins={rainbowCoins} />}
        {currentPlayer && (
          <PlayerMenu player={currentPlayer} onSwitch={() => setPlayerDialogOpen(true)} onLogOut={handleLogOut} />
        )}
      </SiteHeader>

      {!selectedGame ? (
        <GamePicker games={gamesForAge(currentPlayer?.age)} onSelectGame={requestGame} />
      ) : !routeTopic ? (
        selectedGame.id === "dragon" ? (
          <DragonDen coins={rainbowCoins} onSpendCoins={spendCoins} onBack={showGames} />
        ) : (
          <TopicMenu
            isCvc={isCvc}
            isChinese={isChinese}
            topics={gameTopics}
            progressFor={(topic) => currentPlayer?.progress?.[`${selectedGame.id}/${topic.id}`] ?? 0}
            onBack={showGames}
            onSelectTopic={selectCategory}
          />
        )
      ) : !playing ? null : isChinese ? (
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

      {wordMenuOpen && playing && (
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
      {completedTopic && (
        <CompletionDialog
          topicName={completedTopic.name}
          count={completedTopic.count}
          text={isChinese ? chineseCompletionText : undefined}
          onDone={leaveCompletedTopic}
        />
      )}
      {playing && rewardMessage && solved && !completedTopic && (
        <RewardDialog message={rewardMessage} onContinue={nextWord} labels={isChinese ? chineseRewardLabels : undefined} />
      )}
    </main>
  );
}
