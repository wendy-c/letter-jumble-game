// For the Introduction: every game, under its front-page heading, and which classes (K1, K2, K3)
// it's on for by default. Read from app/games-data.js, so it changes when the games do. (Parents
// can still turn any game on or off for a child in Parent mode.)
import { ageGroups, gameGroups, games, isGameForAge } from "../app/games-data";

const cell = { padding: "8px 14px", borderBottom: "1px solid #e8ddfa", textAlign: "left" };
const mark = { ...cell, textAlign: "center", width: 64 };

export default function GameGrades() {
  return (
    <table style={{ borderCollapse: "collapse", background: "#fff", borderRadius: 12, fontSize: 15, color: "#3d2b63" }}>
      <thead>
        <tr>
          <th style={cell}>Game</th>
          {ageGroups.map((age) => <th key={age.id} style={mark}>{age.label}</th>)}
        </tr>
      </thead>
      {gameGroups.map((group) => {
        const inGroup = games.filter((game) => game.group === group.id);
        if (inGroup.length === 0) return null;
        return (
          <tbody key={group.id}>
            <tr>
              <th colSpan={ageGroups.length + 1} style={{ ...cell, background: "#f5f0ff", color: "#6f50d0" }} lang={group.lang}>{group.name}</th>
            </tr>
            {inGroup.map((game) => (
              <tr key={game.id}>
                <td style={{ ...cell, fontWeight: 700 }}>{game.name}</td>
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
