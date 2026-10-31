// Every game's questions with the picture each one shows, arranged as on the front page: by
// category (Phonics, Cambridge…), then game, then module. A picture that fails to load gets a red
// border. Click a picture to copy its path.
import { useState } from "react";
import { topicsByGame } from "../app/badges";
import { dragons } from "../app/dragon-data";
import { gameGroups, games } from "../app/games-data";

// What a question shows: its picture and a short label, for each kind of game.
function questionAsset(gameId, question) {
  if (gameId === "measure-words") return { picture: question.icon, label: `一${question.character}${question.noun}` };
  if (gameId === "idioms") return { picture: question.picture, label: question.idiom, wide: true };
  // Daily Challenge: its picture (or the right pattern piece), named as in the question menu.
  if (gameId === "math-logic" || gameId === "speed-quest") {
    const right = question.options.find((option) => option.correct);
    const picture = typeof question.picture === "object" && question.picture ? question.picture.en : question.picture;
    return { picture: picture ?? right.picture ?? null, label: question.answers[0], note: `Answer: ${question.answer}`, wide: Boolean(picture) };
  }
  if (question.character) return { picture: question.picture, label: question.character, note: question.english };
  return { picture: question.picture, label: question.word };
}

// Mochi's game has no questions: its modules are the dragons' homes and their buttons' pictures.
const dragonModules = Object.values(dragons).map((dragon) => ({
  id: dragon.id,
  name: dragon.house,
  items: dragon.actions.map((action) => ({ picture: action.icon, label: action.label })),
}));

function modulesFor(game) {
  if (game.id === "dragon") return dragonModules;
  return (topicsByGame[game.id] ?? []).map((topic) => ({
    id: topic.id,
    name: topic.english ? `${topic.name} · ${topic.english}` : topic.name,
    items: topic.words.map((question) => questionAsset(game.id, question)),
  }));
}

const border = "#e8ddfa";

function Asset({ picture, label, note, wide }) {
  const [missing, setMissing] = useState(false);
  return (
    <li>
      <button
        type="button"
        title={picture ? `Copy ${picture}` : label}
        onClick={() => picture && navigator.clipboard?.writeText(picture)}
        style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "center", gap: 4, border: `2px solid ${missing ? "#ff6f6f" : border}`, borderRadius: 14, background: "#fff", padding: 8, cursor: "copy", font: "inherit", color: "inherit" }}
      >
        {picture
          ? <img src={picture} alt="" onError={() => setMissing(true)} style={{ width: "100%", height: wide ? 110 : 76, objectFit: "contain" }} loading="lazy" />
          : <span style={{ display: "flex", height: 76, alignItems: "center", fontSize: 12, color: "#8a80a6" }}>No picture</span>}
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        {note && <span style={{ fontSize: 11, color: "#8a80a6" }}>{note}</span>}
      </button>
    </li>
  );
}

function GameQuestions({ group }) {
  const groups = gameGroups.filter((candidate) => !group || candidate.id === group);
  return (
    <div style={{ fontFamily: "Fredoka, sans-serif", color: "#3d2b63" }}>
      {groups.map((category) => (
        <section key={category.id} style={{ marginBottom: 40 }}>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px", fontSize: 26 }} lang={category.lang}>
            <img src={category.icon} alt="" width="36" height="36" />
            {category.name}
          </h1>
          {games.filter((game) => game.group === category.id).map((game) => {
            const modules = modulesFor(game);
            return (
              <section key={game.id} style={{ marginBottom: 28, padding: 16, border: `2px solid ${border}`, borderRadius: 20, background: "#fbf8ff" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 4px", fontSize: 21 }}>
                  <img src={game.picture} alt="" width="32" height="32" />
                  {game.name}
                </h2>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "#8a80a6" }}>
                  {modules.length} modules · {modules.reduce((total, module) => total + module.items.length, 0)} questions
                </p>
                {modules.map((module) => {
                  const wide = module.items.some((item) => item.wide);
                  return (
                    <section key={module.id} style={{ marginBottom: 18 }}>
                      <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>
                        {module.name} <span style={{ fontWeight: 400, color: "#8a80a6" }}>({module.items.length})</span>
                      </h3>
                      <ul style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${wide ? 200 : 104}px, 1fr))`, gap: 10, margin: 0, padding: 0, listStyle: "none" }}>
                        {module.items.map((item, index) => <Asset key={`${item.label}-${index}`} {...item} />)}
                      </ul>
                    </section>
                  );
                })}
              </section>
            );
          })}
        </section>
      ))}
    </div>
  );
}

export default {
  title: "Game Questions",
  component: GameQuestions,
  parameters: { layout: "padded" },
};

export const AllGames = { args: {} };
export const Phonics = { args: { group: "phonics" } };
export const Cambridge = { args: { group: "cambridge" } };
export const Chinese = { args: { group: "chinese" } };
export const Challenge = { args: { group: "challenge" } };
export const VisitMochi = { args: { group: "mochi" } };
