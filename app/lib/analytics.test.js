// Google Analytics: nothing is sent until it's set up, then events queue in dataLayer for Google's
// script, players known only by their id.
const load = (id) => {
  let analytics;
  jest.isolateModules(() => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = id;
    analytics = require("./analytics");
  });
  return analytics;
};
const queued = () => (window.dataLayer ?? []).map((entry) => [...entry]);

beforeEach(() => {
  delete window.dataLayer;
  delete window.gtag;
});
afterAll(() => {
  delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
});

describe("analytics", () => {
  it("sends nothing without a measurement ID", () => {
    const { identify, track } = load("");
    identify("player-1");
    track("answer", { correct: true });
    expect(window.dataLayer).toBeUndefined();
  });

  it("starts Google Analytics once, without its own page views, then queues each event", () => {
    const { identify, track } = load("G-TEST123");
    identify("player-1");
    track("page_view", { page_path: "/cvc", player_id: "player-1" });
    track("answer", { player_id: "player-1", answer: "cat", correct: true });
    const [js, config, who, page, answer] = queued();
    expect(js[0]).toBe("js");
    expect(config).toEqual(["config", "G-TEST123", { send_page_view: false }]);
    expect(who).toEqual(["config", "G-TEST123", { send_page_view: false, user_id: "player-1" }]);
    expect(page).toEqual(["event", "page_view", { page_path: "/cvc", player_id: "player-1" }]);
    expect(answer).toEqual(["event", "answer", { player_id: "player-1", answer: "cat", correct: true }]);
    expect(typeof window.gtag).toBe("function");
  });
});
