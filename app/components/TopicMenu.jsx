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

// A Rainbow Speed Quest topic's note: the record to beat.
function speedNote(record, chinese) {
  if (record === null) return chinese ? "10 題 · 還沒有紀錄" : "10 sums · no record yet";
  return chinese ? `紀錄：${formatTime(record)}` : `Record: ${formatTime(record)}`;
}

// `badgeFor(topic)` is the picture of a topic's badge once the child has finished it with every
// answer right (shown on its card), or null.
export default function TopicMenu({ titleAction = null, isCvc, isDigraph = false, isBlend = false, isMagicE = false, isChinese = false, isMeasure = false, isIdiom = false, isSpeed = false, badgeFor = () => null, recordFor = () => null, topics, progressFor = () => 0, roundSizeFor = (topic) => topic.wordsPerGame ?? topic.words.length, breadcrumbs, onSelectTopic }) {
  // Rainbow Speed Quest's heading follows the site's language. (The Challenge has its own map:
  // LevelMap.)
  const inChinese = useContext(LanguageContext) === "zh";
  return (
    <section className="game-wrap category-menu mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        {breadcrumbs}
        {isChinese || isMeasure || isIdiom ? null : (
          <p className="eyebrow">
            {isSpeed ? (inChinese ? "速算挑戰" : "SPEED QUEST") : "WELCOME TO SPELLING SCHOOL"}
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
        ) : isMagicE ? (
          <>
            <div className="title-row">
              <h1 id="game-title">Magic <span>E</span></h1>
              {titleAction}
            </div>
            <p className="heading-note">Add a magic e and the vowel says its name. Find the pair that’s missing!</p>
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
      <div className={`category-grid${isCvc && !isDigraph && !isBlend && !isMagicE ? " mode-grid" : ""}`}>
        {topics.map((topic) => (
            <ChoiceCard
              key={topic.id}
              color={topic.color}
              icon={topic.pattern
                ? <LetterPattern letters={topic.pattern} />
                : <img src={topic.icon} alt="" width="40" height="40" />}
              badge={badgeFor(topic) && { image: badgeFor(topic), label: inChinese || isChinese || isMeasure || isIdiom ? "全對徽章" : "Full score badge" }}
              name={isSpeed ? `${topic.name} · ${topic.english}` : topic.name}
              note={isSpeed ? speedNote(recordFor(topic), inChinese)
                : cardNote(isIdiom ? "idiom" : isChinese, isMeasure, progressFor(topic), roundSizeFor(topic))}
              onClick={() => onSelectTopic(topic)}
            />
        ))}
      </div>
      <GameFooter>{isChinese || isMeasure || isIdiom ? "選一個主題" : isSpeed ? (inChinese ? "選一個挑戰" : "PICK A QUEST") : isCvc ? "PICK A GAME" : "PICK A SPELL BOOK"}</GameFooter>
    </section>
  );
}
