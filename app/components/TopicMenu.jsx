import { useContext } from "react";
import { LanguageContext } from "../i18n";
import ChoiceCard from "./ChoiceCard";
import { formatTime } from "./MathGame";
import GameFooter from "./GameFooter";
import LetterPattern from "./LetterPattern";

function cardNote(isChinese, isMeasure, done, total) {
  if (isMeasure || isChinese === "idiom") return done > 0 ? `已答 ${done} / ${total} 題` : `每次 ${total} 題`;
  if (isChinese) return done > 0 ? `已學 ${done} / ${total} 個字` : `${total} 個字`;
  return done > 0 ? `${done} of ${total} words learned` : `${total} words to learn`;
}

// A Daily Challenge level's note: how far through it is, or when it opens.
function levelNote(lock, before, done, total, chinese) {
  if (lock === "tomorrow") return chinese ? "明天開放" : "Opens tomorrow";
  if (lock !== "open") return chinese ? `完成${before.name}就可以玩` : `Finish ${before.name} to open`;
  if (done > 0) return chinese ? `已答 ${done} / ${total} 題` : `${done} of ${total} questions done`;
  return chinese ? `${total} 題` : `${total} questions`;
}

// A Rainbow Speed Quest topic's note: the record to beat.
function speedNote(record, chinese) {
  if (record === null) return chinese ? "10 題 · 還沒有紀錄" : "10 sums · no record yet";
  return chinese ? `紀錄：${formatTime(record)}` : `Record: ${formatTime(record)}`;
}

// `lockFor(topic)` says whether a topic can be played: "open", "tomorrow" or "locked" (the Daily
// Challenge's later levels open one a day).
export default function TopicMenu({ titleAction = null, isCvc, isDigraph = false, isBlend = false, isChinese = false, isMeasure = false, isIdiom = false, isMath = false, isSpeed = false, lockFor = () => "open", recordFor = () => null, topics, progressFor = () => 0, breadcrumbs, onSelectTopic }) {
  // The Daily Challenge's heading follows the site's language.
  const inChinese = useContext(LanguageContext) === "zh";
  return (
    <section className="game-wrap category-menu mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        {breadcrumbs}
        {isChinese || isMeasure || isIdiom ? null : (
          <p className="eyebrow">
            {isSpeed ? (inChinese ? "速算挑戰" : "SPEED QUEST") : isMath ? (inChinese ? "腦力挑戰" : "BRAIN CHALLENGE") : "WELCOME TO SPELLING SCHOOL"}
          </p>
        )}
        {isSpeed ? (
          <>
            <div className="title-row">
              {inChinese
                ? <h1 id="game-title" lang="zh-Hant-HK">彩虹<span>速算站</span></h1>
                : <h1 id="game-title">Rainbow <span>Speed Quest</span></h1>}
              {titleAction}
            </div>
            <p className="heading-note">
              {inChinese ? "加減速算，每次都嘗試打破自己的紀錄！" : "Speed calculation of addition and subtraction. Try to break your own record each time!"}
            </p>
          </>
        ) : isMath ? (
          <>
            <div className="title-row">
              {inChinese
                ? <h1 id="game-title" lang="zh-Hant-HK">每日<span>大挑戰</span></h1>
                : <h1 id="game-title">Daily <span>Challenge</span></h1>}
              {titleAction}
            </div>
            <p className="heading-note">
              {inChinese ? "每個人都由第一關開始。完成一關，第二天就可以玩下一關！" : "Everyone starts at Level 1. Finish a level, and the next one opens the day after!"}
            </p>
          </>
        ) : isIdiom ? (
          <>
            <div className="title-row">
              <h1 id="game-title" lang="zh-Hant-HK">成<span>語</span></h1>
              {titleAction}
            </div>
            <p className="heading-note" lang="zh-Hant-HK">看圖畫和解釋，把成語缺少的字填上！</p>
          </>
        ) : isMeasure ? (
          <>
            <div className="title-row">
              <h1 id="game-title" lang="zh-Hant-HK">量詞<span>配對</span></h1>
              {titleAction}
            </div>
            <p className="heading-note" lang="zh-Hant-HK">一個蘋果、一枝鉛筆——選擇正確的名詞配量詞！</p>
          </>
        ) : isChinese ? (
          <>
            <div className="title-row">
              <h1 id="game-title" lang="zh-Hant-HK">中文<span>認字</span></h1>
              {titleAction}
            </div>
            <p className="heading-note" lang="zh-Hant-HK">選一個主題，齊玩認字遊戲！</p>
          </>
        ) : isBlend ? (
          <>
            <div className="title-row">
              <h1 id="game-title">R &amp; L <span>Blends</span></h1>
              {titleAction}
            </div>
            <p className="heading-note">Say the sounds together. Find the blend that’s missing!</p>
          </>
        ) : isDigraph ? (
          <>
            <div className="title-row">
              <h1 id="game-title">Consonant <span>Digraphs</span></h1>
              {titleAction}
            </div>
            <p className="heading-note">Two letters, one sound. Find the pair that’s missing!</p>
          </>
        ) : isCvc ? (
          <>
            <div className="title-row">
              <h1 id="game-title">CVC <span>Sounds</span></h1>
              {titleAction}
            </div>
            <p className="heading-note">Listen for the missing sound and pick the right letter.</p>
          </>
        ) : (
          <>
            <div className="title-row">
              <h1 id="game-title">Letter <span>Jumble</span></h1>
              {titleAction}
            </div>
            <p className="heading-note">Pick a spell book and start today’s magic lesson.</p>
          </>
        )}
      </div>
      <div className={`category-grid${isCvc && !isDigraph && !isBlend ? " mode-grid" : ""}`}>
        {topics.map((topic, index) => {
          const lock = lockFor(topic);
          const locked = lock !== "open";
          return (
            <ChoiceCard
              key={topic.id}
              color={topic.color}
              icon={topic.pattern
                ? <LetterPattern letters={topic.pattern} />
                : <img src={topic.icon} alt="" width="40" height="40" />}
              number={index + 1}
              name={isMath || isSpeed ? `${topic.name} · ${topic.english}` : topic.name}
              note={isSpeed ? speedNote(recordFor(topic), inChinese)
                : isMath ? levelNote(lock, topics[index - 1], progressFor(topic), topic.words.length, inChinese)
                : cardNote(isIdiom ? "idiom" : isChinese, isMeasure, progressFor(topic), topic.wordsPerGame ?? topic.words.length)}
              locked={locked}
              onClick={() => onSelectTopic(topic)}
            />
          );
        })}
      </div>
      <GameFooter>{isChinese || isMeasure || isIdiom ? "選一個主題" : isSpeed ? (inChinese ? "選一個挑戰" : "PICK A QUEST") : isMath ? (inChinese ? "選一個關卡" : "PICK A LEVEL") : isCvc ? "PICK A GAME" : "PICK A SPELL BOOK"}</GameFooter>
    </section>
  );
}
