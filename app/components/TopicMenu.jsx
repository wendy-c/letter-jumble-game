import ChoiceCard from "./ChoiceCard";
import GameFooter from "./GameFooter";
import LetterPattern from "./LetterPattern";

function cardNote(isChinese, isMeasure, done, total) {
  if (isMeasure || isChinese === "idiom") return done > 0 ? `已答 ${done} / ${total} 題` : `每次 ${total} 題`;
  if (isChinese) return done > 0 ? `已學 ${done} / ${total} 個字` : `${total} 個字`;
  return done > 0 ? `${done} of ${total} spells learned` : `${total} spells to learn`;
}

export default function TopicMenu({ isCvc, isChinese = false, isMeasure = false, isIdiom = false, topics, progressFor = () => 0, breadcrumbs, onSelectTopic }) {
  return (
    <section className="game-wrap category-menu mx-auto w-full max-w-6xl" aria-labelledby="game-title">
      <div className="menu-heading">
        {breadcrumbs}
        {isChinese || isMeasure || isIdiom ? null : <p className="eyebrow">WELCOME TO SPELLING SCHOOL</p>}
        {isIdiom ? (
          <>
            <h1 id="game-title" lang="zh-Hant-HK">成<span>語</span></h1>
            <p className="heading-note" lang="zh-Hant-HK">看圖畫和解釋，把成語缺少的字填上！</p>
          </>
        ) : isMeasure ? (
          <>
            <h1 id="game-title" lang="zh-Hant-HK">量詞<span>配對</span></h1>
            <p className="heading-note" lang="zh-Hant-HK">一個蘋果、一枝鉛筆——選擇正確的名詞配量詞！</p>
          </>
        ) : isChinese ? (
          <>
            <h1 id="game-title" lang="zh-Hant-HK">中文<span>認字</span></h1>
            <p className="heading-note" lang="zh-Hant-HK">選一個主題，齊玩認字遊戲！</p>
          </>
        ) : isCvc ? (
          <>
            <h1 id="game-title">CVC <span>Sounds</span></h1>
            <p className="heading-note">Listen for the missing sound and pick the right letter.</p>
          </>
        ) : (
          <>
            <h1 id="game-title">Letter <span>Jumble</span></h1>
            <p className="heading-note">Pick a spell book and start today’s magic lesson.</p>
          </>
        )}
      </div>
      <div className={`category-grid${isCvc ? " mode-grid" : ""}`}>
        {topics.map((topic, index) => (
          <ChoiceCard
            key={topic.id}
            color={topic.color}
            icon={topic.pattern
              ? <LetterPattern letters={topic.pattern} />
              : <img src={topic.icon} alt="" width="40" height="40" />}
            number={index + 1}
            name={topic.name}
            note={cardNote(isIdiom ? "idiom" : isChinese, isMeasure, progressFor(topic), topic.wordsPerGame ?? topic.words.length)}
            onClick={() => onSelectTopic(topic)}
          />
        ))}
      </div>
      <GameFooter>{isChinese || isMeasure || isIdiom ? "選一個主題" : isCvc ? "PICK A SOUND" : "PICK A SPELL BOOK"}</GameFooter>
    </section>
  );
}
