// For the Introduction: every game, under its front-page heading, its modules, and which classes
// (K1, K2, K3) it's on for by default. Read from app/games-data.js and app/badges.js, so it
// changes when the games do. (Parents can still turn any game on or off for a child in Parent mode.)
import { topicsByGame } from "../app/badges";
import { ageGroups, gameGroups, games, isGameForAge } from "../app/games-data";

// A game's modules, by name. The Daily Challenge's 60 levels are summed up, and Mochi's game has
// places rather than modules.
function modulesOf(game) {
  if (game.id === "math-logic") return ["Levels 1–20 for each class"];
  if (game.id === "dragon") return ["Mochi’s House", "Tofu’s House", "The Park"];
  return (topicsByGame[game.id] ?? []).map((topic) => topic.name);
}

const tag = { display: "inline-block", margin: "2px 4px 2px 0", borderRadius: 999, background: "#f5f0ff", padding: "2px 9px", whiteSpace: "nowrap" };

const cell = { padding: "8px 14px", borderBottom: "1px solid #e8ddfa", textAlign: "left" };
const mark = { ...cell, textAlign: "center", width: 64 };

export default function GameGrades() {
  return (
    <table style={{ borderCollapse: "collapse", background: "#fff", borderRadius: 12, fontSize: 15, color: "#3d2b63" }}>
      <thead>
        <tr>
          <th style={cell}>Game</th>
          <th style={cell}>Modules</th>
          {ageGroups.map((age) => <th key={age.id} style={mark}>{age.label}</th>)}
        </tr>
      </thead>
      {gameGroups.map((group) => {
        const inGroup = games.filter((game) => game.group === group.id);
        if (inGroup.length === 0) return null;
        return (
          <tbody key={group.id}>
            <tr>
              <th colSpan={ageGroups.length + 2} style={{ ...cell, background: "#f5f0ff", color: "#6f50d0" }} lang={group.lang}>{group.name}</th>
            </tr>
            {inGroup.map((game) => (
              <tr key={game.id}>
                <td style={{ ...cell, fontWeight: 700, whiteSpace: "nowrap" }}>{game.name}</td>
                <td style={{ ...cell, maxWidth: 440, color: "#6f50d0", fontSize: 13 }}>
                  {modulesOf(game).map((name) => <span key={name} style={tag}>{name}</span>)}
                </td>
                {ageGroups.map((age) => (
                  <td key={age.id} style={mark} aria-label={isGameForAge(game, age.id) ? `${age.label}: yes` : `${age.label}: no`}>
                    {isGameForAge(game, age.id) ? <span style={{ color: "#3fae6a", fontWeight: 700 }}>✓</span> : <span style={{ color: "#c9c0dc" }}>–</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        );
      })}
    </table>
  );
}
