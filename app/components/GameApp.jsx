"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { topicsByGame } from "../badges";
import { games, gamesForPlayer, isGameAvailable } from "../games-data";
import AnswerPanel from "./AnswerPanel";
import BadgeCollection from "./BadgeCollection";
import ChineseGame from "./ChineseGame";
import Breadcrumbs from "./Breadcrumbs";
import CoinLink from "./CoinLink";
import CompletionDialog, { chineseCompletionText } from "./CompletionDialog";
import DragonDen from "./DragonDen";
import GameFooter from "./GameFooter";
import GameHeading from "./GameHeading";
import GamePicker from "./GamePicker";
import IdiomGame from "./IdiomGame";
import MeasureWordGame from "./MeasureWordGame";
import PictureClue from "./PictureClue";
import ParentMode from "./ParentMode";
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
    setGameEnabled, awardBadge,
  } = usePlayers();
  const [parentModeOpen, setParentModeOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const rainbowCoins = currentPlayer?.coins ?? 0;

  const routeGame = games.find((game) => game.id === gameId) ?? null;
  // A game only opens once the saved player has loaded, the game suits their age, and a parent
  // hasn't turned it off for them.
  const allowed = Boolean(routeGame && loaded && currentPlayer?.age && isGameAvailable(routeGame, currentPlayer));
  const selectedGame = allowed ? routeGame : null;
  const gameTopics = topicsByGame[selectedGame?.id] ?? [];
  const routeTopic = (topicId && gameTopics.find((topic) => topic.id === topicId)) || null;
  const categoryKey = routeTopic ? `${selectedGame.id}/${routeTopic.id}` : null;
  // Every topic plays its words in a shuffled order, saved per player so leaving and coming
  // back continues the same order. Topics with `wordsPerGame` (CVC, 量詞) deal only that many.
  const handSize = routeTopic ? Math.min(routeTopic.wordsPerGame ?? Infinity, routeTopic.words.length) : 0;
  const deck = routeTopic ? currentPlayer?.decks?.[categoryKey] : null;
  const validDeck = Boolean(deck) && deck.length === handSize && new Set(deck).size === handSize &&
    deck.every((index) => index < routeTopic.words.length);
  const selectedCategory = routeTopic && validDeck
    ? { ...routeTopic, words: deck.map((index) => routeTopic.words[index]) }
    : null;

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
  const isChinese = Boolean(selectedGame?.id.startsWith("chinese"));
  const isMeasure = selectedGame?.id === "measure-words";
  const isIdiom = selectedGame?.id === "idioms";
  // Games played in Chinese, answered by tapping a picture or word rather than letters.
  const inChinese = isChinese || isMeasure || isIdiom;
  const puzzle = round === null ? undefined : selectedCategory?.words[round];
  const answer = puzzle?.answers[round % puzzle.answers.length] ?? "";
  const answerLetters = answer.replaceAll(" ", "");
  // Positions the learner fills in: every letter in Letter Jumble, one letter in CVC Sounds.
  const blanks = puzzle?.missing !== undefined ? [puzzle.missing] : answerLetters.split("").map((_, index) => index);
  const tiles = puzzle ? puzzle.choices ?? scramble(answerLetters, round) : [];
  const complete = Boolean(puzzle) && placed.length === blanks.length &&
    placed.every((tile, slotIndex) => tile !== null && tiles[tile] === answerLetters[blanks[slotIndex]]);
  const allPlaced = placed.every((tile) => tile !== null);
  const guides = showSpellingGuide && !isCvc && !inChinese ? getSpellingGuides(answer) : null;
  const solved = inChinese ? chineseSolved : complete;

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

  // A topic without a shuffled hand of words yet gets one dealt.
  useEffect(() => {
    if (!routeTopic || !currentPlayer || validDeck) return;
    // Keeps the child's saved place: dealing only happens the first time, or after a topic is
    // finished (when the place is already back at the start).
    saveDeck(categoryKey, shuffledDeck(routeTopic.words.length, handSize));
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
    // Until the saved player has loaded we can't tell who's playing.
    if (!loaded) return;
    if (currentPlayer?.age) {
      selectGame(game);
      return;
    }
    setPendingGame(game);
    setAskAgeFor(currentPlayer ? currentPlayer.name : null);
    setPlayerDialogOpen(true);
  }

  // Opens the game that was waiting, if this player can play it, or leaves a game they can't.
  function finishChoosingPlayer(player) {
    if (pendingGame) {
      if (isGameAvailable(pendingGame, player)) selectGame(pendingGame);
    } else if (selectedGame && !isGameAvailable(selectedGame, player)) {
      showGames();
    }
    closePlayerDialog();
  }

  function choosePlayer(name, age) {
    selectPlayer(name);
    finishChoosingPlayer({ ...players.find((player) => player.name === name), age });
  }

  function addPlayer(name, age) {
    const problem = createPlayer(name, age);
    if (!problem) finishChoosingPlayer({ name, age });
    return problem;
  }

  const closeParentMode = useCallback(() => setParentModeOpen(false), []);

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

  // The last word is done: start the topic again next time, celebrate, and award the topic's
  // badge the first time.
  function finishTopic() {
    saveProgress(categoryKey, 0);
    setRewardMessage("");
    const newBadge = !currentPlayer?.badges?.includes(categoryKey);
    if (newBadge) awardBadge(categoryKey);
    setCompletedTopic({ name: selectedCategory.name, count: selectedCategory.words.length, badge: newBadge ? routeTopic : null });
    sounds.sparkle?.();
  }

  function leaveCompletedTopic() {
    // Next time deals a freshly shuffled hand of words. (Not before leaving: dealing straight
    // away would reset the screen under the pop-up.)
    saveDeck(categoryKey, null);
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
  const breadcrumbs = selectedGame && (
    <Breadcrumbs
      items={[
        { label: "Home", href: "/" },
        { label: selectedGame.name, href: `/${selectedGame.id}` },
        ...(routeTopic ? [{ label: routeTopic.name, href: `/${selectedGame.id}/${routeTopic.id}` }] : []),
      ]}
    />
  );

  return (
    <main className={`app-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8${selectedGame?.id === "dragon" ? " app-shell-fit" : ""}`}>
      <SiteHeader>
        {currentPlayer && (
          <PlayerMenu
            player={currentPlayer}
            onSwitch={() => setPlayerDialogOpen(true)}
            onBadges={() => setBadgesOpen(true)}
            onParentMode={() => setParentModeOpen(true)}
            onLogOut={handleLogOut}
          />
        )}
        <CoinLink coins={rainbowCoins} />
      </SiteHeader>

      {!selectedGame ? (
        // Wait for the saved player before showing games, so the right ones show and an early
        // tap doesn't ask "Who's playing?" for someone who's already playing.
        loaded && (
          <GamePicker
            games={gamesForPlayer(currentPlayer)}
            onSelectGame={requestGame}
            emptyMessage={currentPlayer && `No games are turned on for ${currentPlayer.name} yet. Ask a grown-up to choose some in Parent mode.`}
          />
        )
      ) : !routeTopic ? (
        selectedGame.id === "dragon" ? (
          <DragonDen coins={rainbowCoins} onSpendCoins={spendCoins} breadcrumbs={breadcrumbs} />
        ) : (
          <TopicMenu
            isCvc={isCvc}
            isChinese={isChinese}
            isMeasure={isMeasure}
            isIdiom={isIdiom}
            topics={gameTopics}
            progressFor={(topic) => currentPlayer?.progress?.[`${selectedGame.id}/${topic.id}`] ?? 0}
            breadcrumbs={breadcrumbs}
            onSelectTopic={selectCategory}
          />
        )
      ) : !playing ? null : isIdiom ? (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            topic={selectedCategory}
            round={round}
            rainbowCoins={rainbowCoins}
            wordMenuOpen={wordMenuOpen}
            breadcrumbs={breadcrumbs}
            onOpenWordMenu={() => setWordMenuOpen(true)}
            eyebrow="今日魔法堂"
            note="看圖畫，學成語！"
          />
          <IdiomGame
            key={`${selectedCategory.id}-${round}`}
            topic={selectedCategory}
            round={round}
            question={puzzle}
            onCorrect={handleChineseCorrect}
          />
          <GameFooter>一題一題慢慢學</GameFooter>
        </section>
      ) : isMeasure ? (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            topic={selectedCategory}
            round={round}
            rainbowCoins={rainbowCoins}
            wordMenuOpen={wordMenuOpen}
            breadcrumbs={breadcrumbs}
            onOpenWordMenu={() => setWordMenuOpen(true)}
            eyebrow="今日魔法堂"
            note="一個、一枝、一張……哪個量詞才是對的？"
          />
          <MeasureWordGame
            key={`${selectedCategory.id}-${round}`}
            topic={selectedCategory}
            round={round}
            question={puzzle}
            onCorrect={handleChineseCorrect}
          />
          <GameFooter>一題一題慢慢學</GameFooter>
        </section>
      ) : isChinese ? (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            topic={selectedCategory}
            round={round}
            rainbowCoins={rainbowCoins}
            wordMenuOpen={wordMenuOpen}
            breadcrumbs={breadcrumbs}
            onOpenWordMenu={() => setWordMenuOpen(true)}
            eyebrow="今日魔法堂"
            note="讀一讀，選擇正確的圖象！"
          />
          <ChineseGame
            key={`${selectedCategory.id}-${round}`}
            topic={selectedCategory}
            round={round}
            word={puzzle}
            onCorrect={handleChineseCorrect}
          />
          <GameFooter>一字一字慢慢學</GameFooter>
        </section>
      ) : (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            isCvc={isCvc}
            topic={selectedCategory}
            round={round}
            rainbowCoins={rainbowCoins}
            wordMenuOpen={wordMenuOpen}
            breadcrumbs={breadcrumbs}
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
          showGuideToggle={!isCvc && !inChinese}
          showSpellingGuide={showSpellingGuide}
          onToggleSpellingGuide={() => setShowSpellingGuide((current) => !current)}
          onSelectWord={selectWord}
          onClose={closeWordMenu}
        />
      )}
      {badgesOpen && currentPlayer && (
        <BadgeCollection player={currentPlayer} onClose={() => setBadgesOpen(false)} />
      )}
      {parentModeOpen && (
        <ParentMode
          players={players}
          onSetGameEnabled={setGameEnabled}
          onClose={closeParentMode}
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
          badge={completedTopic.badge}
          text={inChinese ? chineseCompletionText : undefined}
          onDone={leaveCompletedTopic}
        />
      )}
      {playing && rewardMessage && solved && !completedTopic && (
        <RewardDialog message={rewardMessage} onContinue={nextWord} labels={inChinese ? chineseRewardLabels : undefined} />
      )}
    </main>
  );
}
