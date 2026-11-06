// Google Analytics (GA4). The measurement ID ("G-…") comes from NEXT_PUBLIC_GA_MEASUREMENT_ID; with
// none set (locally, in tests) nothing is sent. Players are known only by their id (a GUID), never
// their name. Events wait in `dataLayer` until Google's script (loaded in app/layout.jsx) arrives.
export const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

const on = () => Boolean(measurementId) && typeof window !== "undefined";

// Google's own way in: a queue of `arguments` objects.
function gtag() {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

let started = false;
function start() {
  if (started) return;
  started = true;
  window.gtag = window.gtag || gtag;
  gtag("js", new Date());
  // Page views are sent by the app (see GameApp), with the player's id, not by Google on its own.
  gtag("config", measurementId, { send_page_view: false });
}

// Who's playing: their id, or null for nobody.
export function identify(playerId) {
  if (!on()) return;
  start();
  gtag("config", measurementId, { send_page_view: false, user_id: playerId ?? undefined });
}

// An event: its name (letters, numbers and underscores) and its details.
export function track(event, params = {}) {
  if (!on()) return;
  start();
  gtag("event", event, params);
}
