"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { badgeImage, topicsByGame } from "../badges";
import { games, gamesForPlayer, isGameAvailable } from "../games-data";
import AnswerPanel from "./AnswerPanel";
import AnswerRevealDialog, { chineseRevealLabels } from "./AnswerRevealDialog";
import BadgeCollection from "./BadgeCollection";
import ChineseGame from "./ChineseGame";
import Breadcrumbs from "./Breadcrumbs";
import CompletionDialog, { chineseCompletionText } from "./CompletionDialog";
import DragonDen from "./DragonDen";
import RainbowVillage from "./RainbowVillage";
import { dragons } from "../dragon-data";
import GameFooter from "./GameFooter";
import GameHeading from "./GameHeading";
import GamePicker from "./GamePicker";
import IdiomGame from "./IdiomGame";
import MeasureWordGame from "./MeasureWordGame";
import PictureClue from "./PictureClue";
import ParentMode from "./ParentMode";
import PlayerDialog from "./PlayerDialog";
import PlayerMenu from "./PlayerMenu";
import AnswerToast from "./AnswerToast";
import SiteHeader from "./SiteHeader";
import TopicMenu from "./TopicMenu";
import WordMenu from "./WordMenu";
import { getSpellingGuides, scramble, seededRandom, shuffled, shuffledDeck, slotCount } from "../lib/spelling";
import { speakWord, stopSpeaking } from "../lib/speech";
import { answerToastTime, nextQuestionPause } from "../lib/timing";
import { sounds } from "../lib/sounds";
import { usePlayers } from "../lib/use-players";
import { useSiteSettings } from "../lib/use-site-settings";
import HowToPlayDialog, { AboutButton, AboutDialog, HowToPlayButton, hasAbout, hasHowToPlay, howToLanguage } from "./HowToPlayDialog";
import { LanguageContext, textFor } from "../i18n";
import WelcomeDialog from "./WelcomeDialog";

const rewardMessages = ["Amazing!", "Well done!", "You did it!", "Fantastic!", "Brilliant!"];
const chineseRewardMessages = ["做得好！", "答對了！", "好棒呀！", "太厲害了！"];
const coinEarned = { en: "You collected a rainbow coin!", zh: "你得到一個彩虹金幣！" };

const welcomeClosedKey = "letter-jumble:welcome-closed";
const readSession = (key) => {
  try {
    return window.sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};
const writeSession = (key) => {
  try {
    window.sessionStorage.setItem(key, "true");
  } catch {
    // Storage can be blocked; the card just shows again next time.
  }
};

function mixAnswers(question, random) {
  return {
    ...question,
    ...(question.options && { options: shuffled(question.options, random) }),
    ...(question.choices && (question.missing !== 1 || question.gapLength) && { choices: shuffled(question.choices, random) }),
  };
}

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
    setGameEnabled, awardBadge, saveResult, unlock,
  } = usePlayers();
  const site = useSiteSettings();
  const text = textFor(site.language);
  const [howToOpen, setHowToOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  // The welcome card: shown to a new family (no players yet) when they arrive, and whenever the
  // logo is tapped.
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const welcomedRef = useRef(false);
  const rainbowCoins = currentPlayer?.coins ?? 0;

  const routeGame = games.find((game) => game.id === gameId) ?? null;
  // "/badges" is the current player's badge collection (with nobody playing, it goes home).
  const onBadgesPage = gameId === "badges" && !topicId && Boolean(currentPlayer);
  // "/parent" is parent mode, for managing each child's games.
  const onParentPage = gameId === "parent" && !topicId;
  // A game only opens once the saved player has loaded, the game suits their age, and a parent
  // hasn't turned it off for them.
  const allowed = Boolean(routeGame && loaded && currentPlayer?.age && isGameAvailable(routeGame, currentPlayer));
  const selectedGame = allowed ? routeGame : null;
  const gameTopics = topicsByGame[selectedGame?.id] ?? [];
  const routeTopic = (topicId && gameTopics.find((topic) => topic.id === topicId)) || null;
  // The dragon game: "/dragon" is Rainbow Village once Tofu has moved in (Mochi's den before),
  // "/dragon/village" is always the village, and "/dragon/mochi" or "/dragon/tofu" is a dragon's
  // den. Tofu's house needs unlocking first, from the village.
  const tofuUnlocked = Boolean(currentPlayer?.unlocks?.includes("tofu"));
  const dragonPlace = selectedGame?.id === "dragon" ? topicId ?? (tofuUnlocked ? "village" : "mochi") : null;
  const isDragonPlace = (place) => place === "village" || place === "mochi" || (place === "tofu" && tofuUnlocked);
  const categoryKey = routeTopic ? `${selectedGame.id}/${routeTopic.id}` : null;
  // Every topic plays its words in a shuffled order, saved per player so leaving and coming
  // back continues the same order. Topics with `wordsPerGame` (CVC, 量詞) deal only that many.
  const handSize = routeTopic ? Math.min(routeTopic.wordsPerGame ?? Infinity, routeTopic.words.length) : 0;
  const deck = routeTopic ? currentPlayer?.decks?.[categoryKey] : null;
  const validDeck = Boolean(deck) && deck.length === handSize && new Set(deck).size === handSize &&
    deck.every((index) => index < routeTopic.words.length);
  // The answers move around with every deal too: picture, noun and character choices, and CVC
  // letters (except the middle sound's a-e-i-o-u, which are always all there). They're mixed from
  // the dealt hand, so a reload mid-question doesn't move them.
  const dealSeed = validDeck ? `${categoryKey}:${deck.join(",")}` : "";
  const selectedCategory = routeTopic && validDeck
    ? { ...routeTopic, words: deck.map((index, position) => mixAnswers(routeTopic.words[index], seededRandom(`${dealSeed}:${position}`))) }
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
  // A right answer's toast ("Amazing! +1"): { message, id }, cleared after answerToastTime.
  const [toast, setToast] = useState(null);
  const [wordMenuOpen, setWordMenuOpen] = useState(false);
  const [showSpellingGuide, setShowSpellingGuide] = useState(false);
  // How the current question was answered: null, "right" or "wrong". Each question gets one try.
  const [answered, setAnswered] = useState(null);
  // Set once the last word of a topic is done, to show the "you finished" pop-up.
  const [completedTopic, setCompletedTopic] = useState(null);

  const isDigraph = selectedGame?.id === "digraphs";
  // Phonics games fill a gap in a shown word (one letter for CVC, two for a digraph).
  const isCvc = selectedGame?.id === "cvc" || isDigraph;
  const isChinese = Boolean(selectedGame?.id.startsWith("chinese"));
  const isMeasure = selectedGame?.id === "measure-words";
  const isIdiom = selectedGame?.id === "idioms";
  // Games played in Chinese, answered by tapping a picture or word rather than letters.
  const inChinese = isChinese || isMeasure || isIdiom;
  const puzzle = round === null ? undefined : selectedCategory?.words[round];
  const answer = puzzle?.answers[round % puzzle.answers.length] ?? "";
  const answerLetters = answer.replaceAll(" ", "");
  // Positions the learner fills in: every letter in Letter Jumble (a hyphen, as in T-shirt, is
  // shown), one letter in CVC Sounds.
  const blanks = puzzle?.missing !== undefined
    ? [puzzle.missing]
    : answerLetters.split("").flatMap((letter, index) => (letter === "-" ? [] : [index]));
  const tiles = puzzle ? puzzle.choices ?? scramble(answerLetters.replaceAll("-", ""), round, seededRandom(`${dealSeed}:${round}:tiles`)) : [];
  // How many letters each gap holds: two for a digraph, otherwise one.
  const gapLength = puzzle?.gapLength ?? 1;
  const complete = Boolean(puzzle) && placed.length === blanks.length &&
    placed.every((tile, slotIndex) => tile !== null && tiles[tile] === answerLetters.slice(blanks[slotIndex], blanks[slotIndex] + gapLength));
  const allPlaced = placed.every((tile) => tile !== null);
  const guides = showSpellingGuide && !isCvc && !inChinese ? getSpellingGuides(answer) : null;

  useEffect(() => () => {
    stopSpeaking();
  }, []);

  // Keep the address valid: unknown games and topics go back up a level, and a game the
  // current player can't play goes back to the picker (asking who's playing if nobody is).
  useEffect(() => {
    if (!loaded || !gameId) return;
    if (onBadgesPage || onParentPage) return;
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
    if (topicId && !routeTopic && !(routeGame.id === "dragon" && isDragonPlace(topicId))) router.replace(`/${routeGame.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, gameId, topicId, routeGame, allowed, currentPlayer, routeTopic, router, tofuUnlocked, onBadgesPage, onParentPage]);

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
    setAnswered(null);
    setChecked(false);
    setWordMenuOpen(false);
    setCompletedTopic(null);
    // Only when the topic, player or dealt words change, not on every progress save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey, currentPlayer?.name, validDeck]);

  // After a right answer, on to the next question by itself. Leaving the topic (or picking another
  // word) first cancels it.
  useEffect(() => {
    if (answered !== "right" || completedTopic) return undefined;
    const timer = setTimeout(nextWord, nextQuestionPause);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, round, categoryKey, completedTopic]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), answerToastTime);
    return () => clearTimeout(timer);
  }, [toast]);

  const closeWordMenu = useCallback(() => setWordMenuOpen(false), []);
  const closePlayerDialog = useCallback(() => {
    setPlayerDialogOpen(false);
    setPendingGame(null);
    setAskAgeFor(null);
  }, []);

  function resetAnswer() {
    setAnswered(null);
    setChecked(false);
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

  // Once closed, it stays closed for the rest of the visit (this browser tab's session).
  useEffect(() => {
    if (!loaded || welcomedRef.current) return;
    welcomedRef.current = true;
    if (players.length === 0 && !readSession(welcomeClosedKey)) setWelcomeOpen(true);
  }, [loaded, players.length]);

  function closeWelcome() {
    writeSession(welcomeClosedKey);
    setWelcomeOpen(false);
  }

  // The logo goes home and shows the welcome card.
  function openWelcome() {
    router.push("/");
    setWelcomeOpen(true);
  }

  // The welcome card's form makes a new family's first player.
  function createFirstPlayer(name, age) {
    const problem = createPlayer(name, age);
    if (!problem) closeWelcome();
    return problem;
  }

  // Spends the coins to move Tofu into Rainbow Village, then goes to meet her.
  function unlockTofu() {
    if (!spendCoins(dragons.tofu.unlockCost)) return;
    unlock("tofu");
    sounds.sparkle?.();
    router.push("/dragon/tofu");
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

  // Spelling: checking a filled-in word is its one try. (Checking with empty boxes just asks
  // to fill them.)
  function checkAnswer() {
    setChecked(true);
    if (allPlaced) answerQuestion(complete);
  }

  // A right answer earns a coin, cheers with a toast and moves on by itself (after
  // nextQuestionPause); a wrong one shows the right answer, to move on from. Only the first answer
  // counts towards the topic's score.
  function answerQuestion(correct) {
    if (answered) return;
    setAnswered(correct ? "right" : "wrong");
    saveResult(categoryKey, round, correct);
    if (correct) {
      sounds.correct();
      const messages = inChinese ? chineseRewardMessages : rewardMessages;
      setToast({ message: messages[rainbowCoins % messages.length], id: Date.now() });
      addCoin();
    } else {
      sounds.oops?.();
    }
  }

  // What the "not quite" card shows for the current question.
  function revealFor(question) {
    if (isMeasure) return { text: question.answers[0], picture: question.icon };
    if (isIdiom) return { text: question.idiom, picture: question.picture, note: question.meaning };
    if (inChinese) return { text: question.character, picture: question.picture };
    return { text: answer, picture: question.picture };
  }

  function nextWord() {
    if (round === selectedCategory.words.length - 1) {
      finishTopic();
      return;
    }
    selectWord(round + 1);
  }

  // The last word is done: start the topic again next time and show the score. Only getting
  // every question right earns the topic's badge (once).
  function finishTopic() {
    saveProgress(categoryKey, 0);
    setAnswered(null);
    const results = currentPlayer?.results?.[categoryKey] ?? [];
    const count = selectedCategory.words.length;
    const correct = selectedCategory.words.filter((_, index) => results[index] === true).length;
    const hasBadge = Boolean(currentPlayer?.badges?.includes(categoryKey));
    const newBadge = correct === count && !hasBadge;
    if (newBadge) awardBadge(categoryKey);
    setCompletedTopic({ name: selectedCategory.name, count, correct, hasBadge, badge: newBadge ? { name: routeTopic.name, image: badgeImage(selectedGame.id, routeTopic.id) } : null });
    sounds.sparkle?.();
  }

  function leaveCompletedTopic() {
    // Next time deals a freshly shuffled hand of words. (Not before leaving: dealing straight
    // away would reset the screen under the pop-up.)
    saveDeck(categoryKey, null);
    setCompletedTopic(null);
    showCategories();
  }

  // Deals a fresh, shuffled hand of questions and starts it from the first one. Topics that play
  // only some of their words (wordsPerGame) pick them again from the whole list. A new hand starts
  // a new score, so earlier answers in this round are forgotten.
  function shuffleQuestions() {
    const newDeck = shuffledDeck(routeTopic.words.length, handSize);
    saveDeck(categoryKey, newDeck);
    saveProgress(categoryKey, 0);
    setPosition({ key: categoryKey, round: 0 });
    setPlaced(Array(slotCount(routeTopic.words[newDeck[0]], 0)).fill(null));
    setVoiceMessage("");
    resetAnswer();
    setWordMenuOpen(false);
    stopSpeaking();
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
  // How to play: shown before a game is played for the first time (after the welcome card), and
  // whenever its "How to play" button is tapped.
  const gameHasHowTo = Boolean(selectedGame && hasHowToPlay(selectedGame.id));
  // It opens by itself once a topic is being played (or in the dragon's home), not on the list
  // of topics.
  const startingToPlay = Boolean(routeTopic) || selectedGame?.id === "dragon";
  const howToShown = gameHasHowTo && site.loaded && !welcomeOpen && !playerDialogOpen &&
    (howToOpen || (startingToPlay && !site.howToSeen.includes(selectedGame.id)));
  const gameLanguage = selectedGame ? howToLanguage(selectedGame.id, site.language) : site.language;
  const howToButton = gameHasHowTo && <HowToPlayButton language={gameLanguage} onClick={() => setHowToOpen(true)} />;
  // A game's list of topics shows "About this game" (an info button) where it has one; the "?"
  // is only beside a module's title (and in the dragons' homes).
  const aboutButton = selectedGame && hasAbout(selectedGame.id) && <AboutButton onClick={() => setAboutOpen(true)} />;
  function closeHowTo() {
    site.markHowToSeen(selectedGame.id);
    setHowToOpen(false);
  }
  const breadcrumbs = selectedGame && (
    <Breadcrumbs
      items={[
        { label: text.home, href: "/" },
        { label: selectedGame.name, href: `/${selectedGame.id}` },
        ...(routeTopic ? [{ label: routeTopic.name, href: `/${selectedGame.id}/${routeTopic.id}` }] : []),
        ...(dragonPlace && topicId && dragons[topicId] ? [{ label: dragons[topicId].house, href: `/dragon/${topicId}` }] : []),
      ]}
    />
  );

  return (
    <LanguageContext.Provider value={site.language}>
    <main className="app-shell min-h-screen px-4 py-5 sm:px-8 sm:py-8">
      <SiteHeader onBrandClick={openWelcome}>
        {currentPlayer && (
          <PlayerMenu
            player={currentPlayer}
            onSwitch={() => setPlayerDialogOpen(true)}
            onBadges={() => router.push("/badges")}
            onParentMode={() => router.push("/parent")}
            onLanguage={site.setLanguage}
            onLogOut={handleLogOut}
            coins={rainbowCoins}
          />
        )}
      </SiteHeader>

      {onParentPage ? (
        // Only in the browser, once players have loaded: its grown-up question is random.
        loaded && (
          <ParentMode
            players={players}
            breadcrumbs={<Breadcrumbs items={[{ label: text.home, href: "/" }, { label: text.parentMode, href: "/parent" }]} />}
            onSetGameEnabled={setGameEnabled}
            onDone={() => router.push("/")}
          />
        )
      ) : onBadgesPage ? (
        <BadgeCollection
          player={currentPlayer}
          breadcrumbs={<Breadcrumbs items={[{ label: text.home, href: "/" }, { label: text.myBadges, href: "/badges" }]} />}
        />
      ) : !selectedGame ? (
        // Wait for the saved player before showing games, so the right ones show and an early
        // tap doesn't ask "Who's playing?" for someone who's already playing.
        loaded && (
          <GamePicker
            games={gamesForPlayer(currentPlayer)}
            playerName={currentPlayer?.name ?? null}
            onSelectGame={requestGame}
            emptyMessage={currentPlayer && text.noGames(currentPlayer.name)}
          />
        )
      ) : !routeTopic ? (
        selectedGame.id === "dragon" ? (
          dragonPlace === "village" ? (
            <RainbowVillage
              breadcrumbs={breadcrumbs}
              titleAction={howToButton}
              tofuUnlocked={tofuUnlocked}
              coins={rainbowCoins}
              unlockCost={dragons.tofu.unlockCost}
              onUnlockTofu={unlockTofu}
              onVisit={(place) => router.push(`/dragon/${place}`)}
            />
          ) : isDragonPlace(dragonPlace) && (
            <DragonDen
              titleAction={howToButton}
              key={dragonPlace}
              dragon={dragons[dragonPlace]}
              coins={rainbowCoins}
              onSpendCoins={spendCoins}
              breadcrumbs={breadcrumbs}
              onGoToVillage={() => router.push("/dragon/village")}
            />
          )
        ) : (
          <TopicMenu
            titleAction={aboutButton || null}
            isCvc={isCvc}
            isDigraph={isDigraph}
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
            titleAction={howToButton}
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
            onAnswer={answerQuestion}
          />
          <GameFooter>一題一題慢慢學</GameFooter>
        </section>
      ) : isMeasure ? (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            titleAction={howToButton}
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
            onAnswer={answerQuestion}
          />
          <GameFooter>一題一題慢慢學</GameFooter>
        </section>
      ) : isChinese ? (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            titleAction={howToButton}
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
            onAnswer={answerQuestion}
          />
          <GameFooter>一字一字慢慢學</GameFooter>
        </section>
      ) : (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            titleAction={howToButton}
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
              isDigraph={isDigraph}
              answer={answer}
              round={round}
              blanks={blanks}
              gapLength={gapLength}
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
          onShuffle={shuffleQuestions}
          totalWords={routeTopic.words.length}
          language={gameLanguage}
          onClose={closeWordMenu}
        />
      )}
      {welcomeOpen && (
        <WelcomeDialog
          language={site.language}
          onCreate={players.length === 0 ? createFirstPlayer : null}
          onClose={closeWelcome}
        />
      )}
      {howToShown && (
        <HowToPlayDialog game={selectedGame} language={gameLanguage} onClose={closeHowTo} />
      )}
      {aboutOpen && selectedGame && hasAbout(selectedGame.id) && (
        <AboutDialog game={selectedGame} onClose={() => setAboutOpen(false)} />
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
          correct={completedTopic.correct}
          hasBadge={completedTopic.hasBadge}
          badge={completedTopic.badge}
          text={inChinese ? chineseCompletionText : undefined}
          onDone={leaveCompletedTopic}
        />
      )}
      {playing && answered === "wrong" && !completedTopic && (
        <AnswerRevealDialog
          reveal={revealFor(puzzle)}
          labels={inChinese ? chineseRevealLabels : undefined}
          lang={inChinese ? "zh-Hant-HK" : undefined}
          onContinue={nextWord}
        />
      )}
      {toast && (
        <AnswerToast
          key={toast.id}
          message={toast.message}
          earnedLabel={coinEarned[inChinese ? "zh" : "en"]}
          lang={inChinese ? "zh-Hant-HK" : undefined}
        />
      )}
    </main>
    </LanguageContext.Provider>
  );
}
