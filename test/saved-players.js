// For tests that check what was saved: the saved players (version 2, see app/lib/player-data.js)
// in version 1's shape, each player's data keyed "<game>/<topic>" as the tests describe it, without
// ids or settings, and who's playing by name.
import { flattenPlayer } from "../app/lib/player-data";

const isEmpty = (value) => value === undefined || (Array.isArray(value) ? value.length === 0 : typeof value === "object" && value !== null && Object.keys(value).length === 0);

// One player, like that.
export function playerAsVersion1(player) {
  if (!player) return player;
  const { id: _id, settings: _settings, howToSeen: _seen, ...flat } = flattenPlayer(player);
  return Object.fromEntries(Object.entries(flat).filter(([, value]) => !isEmpty(value)));
}

export function asVersion1(saved) {
  if (!saved) return saved;
  return { players: saved.players.map(playerAsVersion1), current: saved.players.find((player) => player.id === saved.current)?.name ?? null };
}
