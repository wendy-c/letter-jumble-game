"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { badgeImage, topicsByGame } from "../badges";
import { gameAtRoute, gamePath, games, gamesForPlayer, isGameAvailable, perfectScoreBonus } from "../games-data";
import AnswerPanel from "./AnswerPanel";
import AnswerRevealDialog, { chineseRevealLabels } from "./AnswerRevealDialog";
import BadgeCollection from "./BadgeCollection";
import ChineseGame from "./ChineseGame";
import Breadcrumbs from "./Breadcrumbs";
import CompletionDialog, { chineseCompletionText, mathCompletionText, speedCompletionText } from "./CompletionDialog";
import DragonDen from "./DragonDen";
import RainbowVillage from "./RainbowVillage";
import { dragons } from "../dragon-data/dragon-data";
import GameFooter from "./GameFooter";
import GameHeading from "./GameHeading";
import GamePicker from "./GamePicker";
import IdiomGame from "./IdiomGame";
import LevelMap from "./LevelMap";
import SentenceGame from "./SentenceGame";
import MeasureWordGame from "./MeasureWordGame";
import MathGame from "./MathGame";
import { identify, track } from "../lib/analytics";
import { isLevelEarned, levelState, levelUnlockKey } from "../math-data/math-data";
import { speedRecordBonus } from "../math-data/speed-quest-data";
import PictureClue from "./PictureClue";
import ParentMode from "./ParentMode";
import PlayerDialog from "./PlayerDialog";
import PlayerMenu from "./PlayerMenu";
import AnswerToast from "./AnswerToast";
import SiteHeader from "./SiteHeader";
import TopicMenu from "./TopicMenu";
import WordMenu from "./WordMenu";
import { getSpellingGuides, scramble, seededRandom, shuffled, slotCount } from "../lib/spelling";
import { deckOrder, gameSetting, hasBadge, newDeckSeed, topicValue, unlocksOf } from "../lib/player-data";
import { speakWord, stopSpeaking } from "../lib/speech";
import { answerToastTime, nextQuestionPause } from "../lib/timing";
import { sounds } from "../lib/sounds";
import { usePlayers } from "../lib/use-players";
import HowToPlayDialog, { AboutButton, AboutDialog, HowToPlayButton, hasAbout, hasHowToPlay, howToLanguage } from "./HowToPlayDialog";
import { LanguageContext, gameName, textFor } from "../i18n";
import Tutorial from "./Tutorial";
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
    // (CVC's middle vowels and Magic E's pairs stay in a, e, i, o, u order.)
    ...(question.choices && !question.magicE && (question.missing !== 1 || question.gapLength) && { choices: shuffled(question.choices, random) }),
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
    loaded, site, players, currentPlayer, createPlayer, setPlayerAge, selectPlayer, logOut, addCoin, saveRecord, saveScore, spendCoins, saveProgress, saveDeck, setLastPlayed,
    setGameEnabled, setSpellingGuide, setQuestionCount, awardBadge, saveResult, unlock,
  } = usePlayers();
  const text = textFor(site.language);
  const [howToOpen, setHowToOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  // The welcome card: shown to a new family (no players yet) when they arrive, and whenever the
  // logo is tapped.
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  // The new family's tour of the app: null, or its step (0 asks which language they'd like).
  const [tutorialStep, setTutorialStep] = useState(null);
  const welcomedRef = useRef(false);
  const rainbowCoins = currentPlayer?.coins ?? 0;

  const { game: routeGame, moved: routeMoved } = gameAtRoute(gameId);
  // "/badges" is the current player's badge collection (with nobody playing, it goes home).
  const onBadgesPage = gameId === "badges" && !topicId && Boolean(currentPlayer);
  // "/parent" is parent mode, for managing each child's games.
  const onParentPage = gameId === "parent" && !topicId;
  // A game only opens once the saved player has loaded, the game suits their age, and a parent
  // hasn't turned it off for them.
  const allowed = Boolean(routeGame && loaded && currentPlayer?.age && isGameAvailable(routeGame, currentPlayer));
  const selectedGame = allowed ? routeGame : null;
  const isMath = selectedGame?.id === "math-logic";
  const isSpeed = selectedGame?.id === "speed-quest";
  // The Math games (Daily Challenge, Rainbow Speed Quest) are in the site's language.
  const isMathGame = isMath || isSpeed;
  const mathInChinese = isMathGame && site.language === "zh";
  // A game's topics: only those for the player's age (the Daily Challenge's levels), named in the
  // site's language where they have names in both.
  const gameTopics = (topicsByGame[selectedGame?.id] ?? [])
    .filter((topic) => !topic.ages || !currentPlayer?.age || topic.ages.includes(currentPlayer.age))
    .map((topic) => (topic.names ? { ...topic, name: topic.names[site.language] ?? topic.name, english: topic.focus?.[site.language] ?? topic.english } : topic));
  // The Daily Challenge's levels open one a day; a level that isn't open yet goes back to the list.
  const topicOpen = (topic) => !isMath || levelState(topic, currentPlayer) === "open";
  const routeTopic = (topicId && gameTopics.find((topic) => topic.id === topicId && topicOpen(topic))) || null;
  // The dragon game: "/dragon" is Rainbow Village once Tofu has moved in (Mochi's den before),
  // "/dragon/village" is always the village, and "/dragon/mochi" or "/dragon/tofu" is a dragon's
  // den. Tofu's house needs unlocking first, from the village.
  const tofuUnlocked = unlocksOf(currentPlayer, "dragon").includes("tofu");
  // The park (where Mochi and Tofu play together) can be unlocked once Tofu has moved in.
  const parkUnlocked = tofuUnlocked && unlocksOf(currentPlayer, "dragon").includes("park");
  const dragonPlace = selectedGame?.id === "dragon" ? topicId ?? (tofuUnlocked ? "village" : "mochi") : null;
  const isDragonPlace = (place) => place === "village" || place === "mochi" || (place === "tofu" && tofuUnlocked) || (place === "park" && parkUnlocked);
  const categoryKey = routeTopic ? `${selectedGame.id}/${routeTopic.id}` : null;
  // Every topic plays its words in a shuffled order, saved per player so leaving and coming
  // back continues the same order. Topics with `wordsPerGame` (CVC, 量詞) deal only that many; in
  // CVC Sounds, Digraphs and Blends a parent can choose how many (Parent mode).
  const roundSize = (topic) => Math.min(
    (selectedGame?.questionCount && gameSetting(currentPlayer, selectedGame.id, "questionCount")) || topic.wordsPerGame || Infinity,
    topic.words.length,
  );
  const handSize = routeTopic ? roundSize(routeTopic) : 0;
  // The dealt words: from the saved seed (or an order saved before seeds, until its round is done).
  const savedDeck = routeTopic ? topicValue(currentPlayer, "decks", categoryKey) : null;
  const deck = routeTopic ? deckOrder(savedDeck, routeTopic.words.length, handSize) : null;
  const validDeck = Boolean(deck) && deck.length === handSize && new Set(deck).size === handSize &&
    deck.every((index) => index < routeTopic.words.length);
  // The answers move around with every deal too: picture, noun and character choices, and CVC
  // letters (except the middle sound's a-e-i-o-u, which are always all there). They're mixed from
  // the dealt hand, so a reload mid-question doesn't move them.
  const dealSeed = validDeck ? `${categoryKey}:${Array.isArray(savedDeck) ? savedDeck.join(",") : savedDeck}` : "";
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
  // How the current question was answered: null, "right" or "wrong". Each question gets one try.
  const [answered, setAnswered] = useState(null);
  // Set once the last word of a topic is done, to show the "you finished" pop-up.
  const [completedTopic, setCompletedTopic] = useState(null);
  // When a timed round (Rainbow Speed Quest) started: { key, startedAt }. Only a round played from
  // its first question is timed.
  const [timer, setTimer] = useState({ key: null, startedAt: null });
  // For analytics: when the question on screen was shown, and the last question reported.
  const questionStartedAtRef = useRef(null);
  const lastDeckProgressRef = useRef(null);

  const isDigraph = selectedGame?.id === "digraphs";
  const isBlend = selectedGame?.id === "blends";
  const isMagicE = selectedGame?.id === "magic-e";
  const isRVowel = selectedGame?.id === "r-controlled";
  // Phonics games fill a gap in a shown word (one letter for CVC, two for a digraph, two or three
  // for a blend, a vowel with the e at the end for Magic E, and a vowel with its r for
  // R-Controlled Vowels).
  const isCvc = selectedGame?.id === "cvc" || isDigraph || isBlend || isMagicE || isRVowel;
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
  // What fills a gap: its letters, or for Magic E the vowel and the e as a pair ("a_e").
  const gapAnswer = (blank) => (puzzle?.magicE ? `${answerLetters[blank]}_e` : answerLetters.slice(blank, blank + gapLength));
  const complete = Boolean(puzzle) && placed.length === blanks.length &&
    placed.every((tile, slotIndex) => tile !== null && tiles[tile] === gapAnswer(blanks[slotIndex]));
  const allPlaced = placed.every((tile) => tile !== null);
  // The spelling guide is a parent setting for each child and Letter Jumble game (in Parent mode).
  const showSpellingGuide = Boolean(selectedGame?.spellingGuide && gameSetting(currentPlayer, selectedGame.id, "spellingGuide"));
  const guides = showSpellingGuide ? getSpellingGuides(answer) : null;

  useEffect(() => () => {
    stopSpeaking();
  }, []);

  // Analytics: every page, with the id of whoever's playing (and who that is, for what follows).
  useEffect(() => {
    if (!loaded) return;
    identify(currentPlayer?.id ?? null);
    track("page_view", {
      page_path: pathname || "/",
      page_location: window.location.href,
      page_title: document.title,
      ...(currentPlayer && { player_id: currentPlayer.id }),
    });
  }, [loaded, currentPlayer?.id, pathname]);

  // Analytics: each question's start (for the time spent on it), and each question reached in a
  // deck, once.
  useEffect(() => {
    questionStartedAtRef.current = categoryKey && currentPlayer && selectedCategory && round !== null
      ? Date.now()
      : null;
  }, [categoryKey, currentPlayer?.id, dealSeed, round]);

  useEffect(() => {
    if (!currentPlayer || !categoryKey || !selectedCategory || round === null) return;
    const progressKey = `${currentPlayer.id}:${dealSeed}:${categoryKey}:${round}`;
    if (lastDeckProgressRef.current === progressKey) return;
    lastDeckProgressRef.current = progressKey;
    track("deck_progress", {
      player_id: currentPlayer.id,
      game: selectedGame.id,
      topic: routeTopic.id,
      question_index: round + 1,
      deck_size: selectedCategory.words.length,
    });
  }, [categoryKey, currentPlayer?.id, dealSeed, round, routeTopic?.id, selectedCategory?.words.length, selectedGame?.id]);

  // Keep the address valid: a game's old address goes to its new one ("/letter-jumble/animals" to
  // "/movers/animals"), unknown games and topics go back up a level, and a game the current player
  // can't play goes back to the picker (asking who's playing if nobody is).
  useEffect(() => {
    if (!loaded || !gameId) return;
    if (onBadgesPage || onParentPage) return;
    if (!routeGame) {
      router.replace("/");
      return;
    }
    if (routeMoved) {
      router.replace(`${gamePath(routeGame)}${topicId ? `/${encodeURIComponent(topicId)}` : ""}`);
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
    if (topicId && !routeTopic && !(routeGame.id === "dragon" && isDragonPlace(topicId))) router.replace(gamePath(routeGame));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, gameId, topicId, routeGame, routeMoved, allowed, currentPlayer, routeTopic, router, tofuUnlocked, parkUnlocked, onBadgesPage, onParentPage]);

  // What's being played (a game's topic, or Mochi's game anywhere), remembered for the front page.
  const nowPlaying = selectedGame && (routeTopic || selectedGame.id === "dragon") ? `${selectedGame.id}/${routeTopic?.id ?? ""}` : null;
  useEffect(() => {
    if (nowPlaying) setLastPlayed(selectedGame.id, routeTopic?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying, currentPlayer?.id]);

  // The front page's "Keep playing": the game the player played last, if they can still play it,
  // straight back to its topic if it's still there (and, for a Challenge level, still open).
  const recent = (() => {
    const last = currentPlayer?.lastPlayed;
    const game = last && gamesForPlayer(currentPlayer).find((candidate) => candidate.id === last.game);
    if (!game) return null;
    const topic = last.topic && (topicsByGame[game.id] ?? []).find((candidate) => candidate.id === last.topic
      && (game.id !== "math-logic" || levelState(candidate, currentPlayer) === "open"));
    return {
      game,
      note: topic ? topic.names?.[site.language] ?? topic.name : null,
      onSelect: () => {
        track("keep_playing_clicked", {
          player_id: currentPlayer.id,
          game: game.id,
          ...(topic && { topic: topic.id }),
        });
        router.push(`${gamePath(game)}${topic ? `/${topic.id}` : ""}`);
      },
    };
  })();

  // A topic without a shuffled hand of words yet gets one dealt.
  useEffect(() => {
    if (!routeTopic || !currentPlayer || validDeck) return;
    // Keeps the child's saved place: dealing only happens the first time, or after a topic is
    // finished (when the place is already back at the start).
    saveDeck(categoryKey, newDeckSeed());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey, currentPlayer?.id, validDeck]);

  // Opening a topic (or switching player inside one) starts at the word that player got up to.
  useEffect(() => {
    if (!selectedCategory) return;
    const saved = topicValue(currentPlayer, "progress", categoryKey) ?? 0;
    const start = saved < selectedCategory.words.length ? saved : 0;
    setPosition({ key: categoryKey, round: start });
    setPlaced(Array(slotCount(selectedCategory.words[start], start)).fill(null));
    setVoiceMessage("");
    setAnswered(null);
    setChecked(false);
    setWordMenuOpen(false);
    setCompletedTopic(null);
    setTimer({ key: categoryKey, startedAt: selectedCategory.timed && start === 0 ? Date.now() : null });
    // Only when the topic, player or dealt words change, not on every progress save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey, currentPlayer?.id, validDeck]);

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
    router.push(gamePath(game));
  }

  function showGames() {
    router.push("/");
  }

  function showCategories() {
    router.push(gamePath(selectedGame));
  }

  function selectCategory(topic) {
    router.push(`${gamePath(selectedGame)}/${topic.id}`);
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

  // The player dialog picks players by name (names are unique); the store works with their ids.
  const idOf = (name) => players.find((player) => player.name === name)?.id ?? null;

  function choosePlayer(name, age) {
    selectPlayer(idOf(name));
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

  // The welcome card's form makes a new family's first player, then (once per browser) the tour
  // of the app starts on the front page.
  function createFirstPlayer(name, age) {
    const problem = createPlayer(name, age);
    if (problem) return problem;
    closeWelcome();
    if (!site.tutorialSeen) {
      setTutorialStep(0);
      router.push("/");
    }
    return null;
  }

  function finishTutorial() {
    site.markTutorialSeen();
    setTutorialStep(null);
  }

  // Spends the coins to move Tofu into Rainbow Village, then goes to meet her.
  function unlockTofu() {
    if (!spendCoins(dragons.tofu.unlockCost)) return;
    unlock("tofu");
    track("tofu_unlocked", { player_id: currentPlayer.id });
    sounds.sparkle?.();
    router.push("/dragon/tofu");
  }

  // Spends the coins to open the park, then goes there to play with Mochi and Tofu.
  function unlockPark() {
    if (!tofuUnlocked || !spendCoins(dragons.park.unlockCost)) return;
    unlock("park");
    track("park_unlocked", { player_id: currentPlayer.id });
    sounds.sparkle?.();
    router.push("/dragon/park");
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
    if (allPlaced) answerQuestion(complete, placed.map((tile) => tiles[tile]).join(""));
  }

  // A right answer earns a coin, cheers with a toast and moves on by itself (after
  // nextQuestionPause); a wrong one shows the right answer, to move on from. Only the first answer
  // counts towards the topic's score. `submittedAnswer` is what was picked or spelt, for analytics
  // (with how long the question took).
  function answerQuestion(correct, submittedAnswer = null) {
    if (answered) return;
    setAnswered(correct ? "right" : "wrong");
    saveResult(categoryKey, round, correct);
    if (currentPlayer) {
      const question = { player_id: currentPlayer.id, game: selectedGame.id, topic: routeTopic.id, question_index: round + 1 };
      track("answer", { ...question, answer: submittedAnswer, correct });
      if (questionStartedAtRef.current !== null) {
        track("question_time", { ...question, duration_ms: Math.max(0, Date.now() - questionStartedAtRef.current) });
        questionStartedAtRef.current = null;
      }
    }
    if (correct) {
      sounds.correct();
      const messages = inChinese || mathInChinese ? chineseRewardMessages : rewardMessages;
      setToast({ message: messages[rainbowCoins % messages.length], id: Date.now() });
      addCoin();
    } else {
      sounds.oops?.();
    }
  }

  // What the "not quite" card shows for the current question.
  function revealFor(question) {
    if (isMathGame) {
      const right = question.options.find((option) => option.correct);
      const note = question.prompt[site.language] ?? question.prompt.en;
      // A turning-grid puzzle shows the right grid itself.
      if (right.cells) return { text: "", cells: right.cells, label: right.name?.[site.language], note };
      // A shading puzzle shows the right shaded grid.
      if (right.shade) return { text: "", shade: right.shade, size: right.size, label: right.name?.[site.language], note };
      if (right.picture) return { text: right.name?.[site.language] ?? right.label, picture: right.picture, note };
      const picture = typeof question.picture === "string" ? question.picture : question.picture?.[site.language];
      return { text: right.reveal?.[site.language] ?? right.name?.[site.language] ?? right.label, picture, wide: Boolean(picture), note };
    }
    if (isMeasure) return { text: question.answers[0], picture: question.icon };
    if (isIdiom) return { text: question.idiom, picture: question.picture, note: question.meaning };
    if (question.sentence) return { text: question.character, picture: question.picture, note: question.sentence };
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
    const results = topicValue(currentPlayer, "results", categoryKey) ?? [];
    const count = selectedCategory.words.length;
    const correct = selectedCategory.words.filter((_, index) => results[index] === true).length;
    const badgeBefore = hasBadge(currentPlayer, categoryKey);
    const perfect = correct === count;
    const newBadge = perfect && !badgeBefore;
    if (newBadge) awardBadge(categoryKey);
    // Every answer right earns bonus coins too, each time.
    if (perfect) addCoin(perfectScoreBonus);
    // The best score shows on a Challenge level's tile on the map.
    saveScore(categoryKey, correct, count);
    // Finishing a Challenge level opens the next one straight away.
    const nextLevel = isMath ? gameTopics[gameTopics.indexOf(routeTopic) + 1] : null;
    const opensLevel = Boolean(nextLevel) && !isLevelEarned(nextLevel, currentPlayer);
    if (opensLevel) unlock(levelUnlockKey(nextLevel));
    // Analytics: a child reaching Challenge Level 15 (finishing Level 14 earns it), once each,
    // named for the class: "k1_challenge", "k2_challenge" or "k3_challenge".
    if (opensLevel && nextLevel.id.endsWith("-level-15")) track(`${nextLevel.id.split("-")[0]}_challenge`, { level: "15", player_id: currentPlayer.id });
    // A timed round with every answer right sets a record if it's the first or the fastest yet;
    // beating an earlier record earns a bonus.
    let speed = null;
    if (routeTopic.timed) {
      const time = timer.key === categoryKey && timer.startedAt ? Date.now() - timer.startedAt : null;
      const best = topicValue(currentPlayer, "records", categoryKey) ?? null;
      const newRecord = correct === count && time !== null && (best === null || time < best);
      if (newRecord) saveRecord(categoryKey, time);
      const bonus = newRecord && best !== null ? speedRecordBonus : 0;
      if (bonus) addCoin(bonus);
      speed = { time, best, newRecord, bonus };
    }
    setCompletedTopic({
      name: selectedCategory.name, count, correct, hasBadge: badgeBefore, bonus: perfect ? perfectScoreBonus : 0,
      badge: newBadge ? { name: routeTopic.name, image: badgeImage(selectedGame.id, routeTopic.id) } : null,
      nextLevel: opensLevel ? nextLevel.name : null,
      speed,
    });
    sounds.sparkle?.();
  }

  // From the end-of-topic card, straight to Mochi to spend the coins (a fresh hand next time,
  // as when going back to the topics).
  function visitMochiAfterTopic() {
    saveDeck(categoryKey, null);
    setCompletedTopic(null);
    router.push("/dragon");
  }

  // From the end-of-topic card when some answers were wrong: the same topic again, freshly dealt
  // and with a new score.
  function tryTopicAgain() {
    setCompletedTopic(null);
    shuffleQuestions();
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
    const seed = newDeckSeed();
    const newDeck = deckOrder(seed, routeTopic.words.length, handSize);
    saveDeck(categoryKey, seed);
    saveProgress(categoryKey, 0);
    setPosition({ key: categoryKey, round: 0 });
    setTimer({ key: categoryKey, startedAt: routeTopic.timed ? Date.now() : null });
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
  // Mochi's "?" is hidden on very narrow screens, where her how-to's pictures would be too small.
  const howToButton = gameHasHowTo && (
    <HowToPlayButton language={gameLanguage} onClick={() => setHowToOpen(true)} className={selectedGame.id === "dragon" ? "how-to-open-wide-only" : ""} />
  );
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
        { label: gameName(text, selectedGame, currentPlayer?.age), href: gamePath(selectedGame) },
        ...(routeTopic ? [{ label: routeTopic.name, href: `${gamePath(selectedGame)}/${routeTopic.id}` }] : []),
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
            onSetSpellingGuide={setSpellingGuide}
            onSetQuestionCount={setQuestionCount}
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
            recent={recent}
            playerName={currentPlayer?.name ?? null}
            playerAge={currentPlayer?.age ?? null}
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
              parkUnlocked={parkUnlocked}
              parkUnlockCost={dragons.park.unlockCost}
              onUnlockPark={unlockPark}
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
        ) : isMath ? (
          <LevelMap
            title={gameName(text, selectedGame, currentPlayer?.age)}
            levels={gameTopics}
            lockFor={(level) => levelState(level, currentPlayer)}
            scoreFor={(level) => topicValue(currentPlayer, "scores", `${selectedGame.id}/${level.id}`) ?? null}
            progressFor={(level) => topicValue(currentPlayer, "progress", `${selectedGame.id}/${level.id}`) ?? 0}
            mapKey={`letter-jumble:level-map:${currentPlayer?.id ?? ""}:${currentPlayer?.age ?? ""}`}
            breadcrumbs={breadcrumbs}
            onSelectLevel={selectCategory}
          />
        ) : (
          <TopicMenu
            titleAction={aboutButton || null}
            isCvc={isCvc}
            isDigraph={isDigraph}
            isBlend={isBlend}
            isMagicE={isMagicE}
            isRVowel={isRVowel}
            isChinese={isChinese}
            isMeasure={isMeasure}
            isIdiom={isIdiom}
            isSpeed={isSpeed}
            badgeFor={(topic) => (hasBadge(currentPlayer, `${selectedGame.id}/${topic.id}`) ? badgeImage(selectedGame.id, topic.id) : null)}
            recordFor={(topic) => topicValue(currentPlayer, "records", `${selectedGame.id}/${topic.id}`) ?? null}
            topics={gameTopics}
            progressFor={(topic) => topicValue(currentPlayer, "progress", `${selectedGame.id}/${topic.id}`) ?? 0}
            roundSizeFor={roundSize}
            breadcrumbs={breadcrumbs}
            onSelectTopic={selectCategory}
          />
        )
      ) : !playing ? null : isMathGame ? (
        <section className="game-wrap mx-auto w-full max-w-6xl" aria-labelledby="game-title">
          <GameHeading
            titleAction={howToButton}
            topic={selectedCategory}
            round={round}
            rainbowCoins={rainbowCoins}
            wordMenuOpen={wordMenuOpen}
            breadcrumbs={breadcrumbs}
            onOpenWordMenu={() => setWordMenuOpen(true)}
            eyebrow={isSpeed ? (mathInChinese ? "速算挑戰" : "SPEED QUEST") : mathInChinese ? "腦力挑戰" : "BRAIN CHALLENGE"}
            note={isSpeed ? (mathInChinese ? "看看你有多快！" : "How fast can you go?") : mathInChinese ? "看一看，數一數，想一想！" : "Look, count and think!"}
          />
          <MathGame
            key={`${selectedCategory.id}-${round}`}
            topic={selectedCategory}
            round={round}
            question={puzzle}
            onAnswer={answerQuestion}
            language={site.language}
            startedAt={timer.key === categoryKey ? timer.startedAt : null}
          />
          <GameFooter>{mathInChinese ? "一題一題慢慢來" : "ONE QUESTION AT A TIME"}</GameFooter>
        </section>
      ) : isIdiom ? (
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
            note={selectedCategory.kind === "sentence" ? "讀一讀句子，選出正確的感受！" : "讀一讀，選擇正確的圖象！"}
          />
          {selectedCategory.kind === "sentence" ? (
            <SentenceGame
              key={`${selectedCategory.id}-${round}`}
              topic={selectedCategory}
              round={round}
              question={puzzle}
              onAnswer={answerQuestion}
            />
          ) : (
            <ChineseGame
              key={`${selectedCategory.id}-${round}`}
              topic={selectedCategory}
              round={round}
              word={puzzle}
              onAnswer={answerQuestion}
            />
          )}
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
              isBlend={isBlend}
              isMagicE={isMagicE}
              isRVowel={isRVowel}
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
          onSelectWord={selectWord}
          onShuffle={shuffleQuestions}
          totalWords={routeTopic.words.length}
          language={gameLanguage}
          onClose={closeWordMenu}
        />
      )}
      {tutorialStep !== null && !selectedGame && !onBadgesPage && !onParentPage && (
        <Tutorial step={tutorialStep} language={site.language} onLanguage={site.setLanguage} onStep={setTutorialStep} onDone={finishTutorial} />
      )}
      {welcomeOpen && (
        <WelcomeDialog
          language={site.language}
          onCreate={players.length === 0 ? createFirstPlayer : null}
          onTransfer={players.length === 0 ? () => { closeWelcome(); router.push("/parent"); } : null}
          onClose={closeWelcome}
        />
      )}
      {howToShown && (
        <HowToPlayDialog game={{ ...selectedGame, name: gameName(text, selectedGame, currentPlayer?.age) }} language={gameLanguage} onClose={closeHowTo} />
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
          onSetAge={(name, age) => setPlayerAge(idOf(name), age)}
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
          bonus={completedTopic.bonus}
          text={inChinese ? chineseCompletionText : isSpeed ? speedCompletionText[site.language] : isMath ? mathCompletionText[site.language] : undefined}
          nextLevel={completedTopic.nextLevel}
          speed={completedTopic.speed}
          onDone={leaveCompletedTopic}
          onVisitMochi={currentPlayer && isGameAvailable(games.find((game) => game.id === "dragon"), currentPlayer) ? visitMochiAfterTopic : null}
          onTryAgain={tryTopicAgain}
        />
      )}
      {playing && answered === "wrong" && !completedTopic && (
        <AnswerRevealDialog
          reveal={revealFor(puzzle)}
          labels={inChinese || mathInChinese ? chineseRevealLabels : undefined}
          lang={inChinese || mathInChinese ? "zh-Hant-HK" : undefined}
          onContinue={nextWord}
        />
      )}
      {toast && (
        <AnswerToast
          key={toast.id}
          message={toast.message}
          earnedLabel={coinEarned[inChinese || mathInChinese ? "zh" : "en"]}
          lang={inChinese || mathInChinese ? "zh-Hant-HK" : undefined}
        />
      )}
    </main>
    </LanguageContext.Provider>
  );
}
