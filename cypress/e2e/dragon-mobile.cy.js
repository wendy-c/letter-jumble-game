const playersKey = "letter-jumble:players";

const phones = [
  ["iPhone SE", 375, 667],
  ["iPhone 14", 390, 844],
  ["Pixel 7", 412, 915],
  ["small Android", 360, 640],
];

function seedPlayer(win, extra = {}) {
  win.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Elly", coins: 50, age: "5-6", ...extra }], current: "Elly" }));
  // Skip the welcome and how-to-play cards, as if they'd been seen before.
  win.localStorage.setItem("letter-jumble:site", JSON.stringify({ language: "en", howToSeen: ["dragon"] }));
  win.sessionStorage.setItem("letter-jumble:welcome-closed", "true");
}

// Scrolls the way a finger can: only boxes that scroll (overflow auto/scroll) and the page. The
// browser's scrollIntoView would also scroll overflow-hidden boxes, uncovering things a child
// can never reach.
function scrollLikeAFinger(element) {
  const win = element.ownerDocument.defaultView;
  for (let box = element.parentElement; box; box = box.parentElement) {
    if (/auto|scroll/.test(win.getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight) {
      const offset = element.getBoundingClientRect().top - box.getBoundingClientRect().top;
      box.scrollTop += offset - (box.clientHeight - element.offsetHeight) / 2;
    }
  }
  const box = element.getBoundingClientRect();
  win.scrollBy(0, box.top - (win.innerHeight - box.height) / 2);
}

// Scrolls to the element, then checks a tap on its centre would land on it: not clipped,
// covered or off the page.
function expectTappable(element) {
  scrollLikeAFinger(element);
  const box = element.getBoundingClientRect();
  const win = element.ownerDocument.defaultView;
  const name = (element.getAttribute("aria-label") || element.textContent).trim();
  expect(box.width, `${name} width`).to.be.greaterThan(0);
  expect(box.top, `${name} top`).to.be.at.least(0);
  expect(box.bottom, `${name} bottom`).to.be.at.most(win.innerHeight);
  const hit = element.ownerDocument.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
  expect(element.contains(hit), `${name} is tappable (found ${hit?.outerHTML.slice(0, 80)})`).to.equal(true);
}

describe("Mochi's den on phones", () => {
  phones.forEach(([phone, width, height]) => {
    it(`can tap every control on ${phone} (${width}×${height})`, () => {
      cy.viewport(width, height);
      cy.visit("/dragon", { onBeforeLoad: seedPlayer });
      cy.get(".dragon-canvas", { timeout: 20000 }).should("be.visible");

      cy.get('.player-chip, .topbar a, nav[aria-label="Breadcrumb"] a, .how-to-open, .village-sign, .dragon-canvas').each(($element) => expectTappable($element[0]));

      cy.get('[role="tab"]').each(($tab) => {
        cy.wrap($tab).click({ scrollBehavior: "center" }).should("have.attr", "aria-selected", "true");
        cy.get('[role="tabpanel"] button').should("have.length.at.least", 1).each(($button) => expectTappable($button[0]));
        cy.wrap($tab).then(($current) => expectTappable($current[0]));
      });

      // The very last treat really works: it's at the bottom of the shelf on phones.
      cy.contains('[role="tab"]', "Treats").click({ scrollBehavior: "center" });
      cy.get('[role="tabpanel"] button').last().then(($button) => scrollLikeAFinger($button[0]));
      cy.get('[role="tabpanel"] button').last().click({ scrollBehavior: false });
      cy.get(".player-chip-coins").should("have.text", "48");
    });
  });
});

describe("Rainbow Village before Tofu moves in, on phones", () => {
  phones.forEach(([phone, width, height]) => {
    it(`can reach the village and Tofu's unlock on ${phone} (${width}×${height})`, () => {
      cy.viewport(width, height);
      cy.visit("/dragon", { onBeforeLoad: (win) => seedPlayer(win, { coins: 120 }) });
      cy.get(".dragon-canvas", { timeout: 20000 }).should("be.visible");
      cy.get(".village-sign").then(($sign) => expectTappable($sign[0])).click({ scrollBehavior: false });
      cy.contains("h1", "Rainbow Village");
      cy.get(".village-place, .tofu-unlock-button").each(($place) => expectTappable($place[0]));
      cy.get(".tofu-unlock-button").click({ scrollBehavior: false });
      cy.contains("h1", "Tofu the Fairy Dragon");
    });
  });
});

describe("Tofu's den and Rainbow Village on phones", () => {
  phones.forEach(([phone, width, height]) => {
    it(`can tap every control on ${phone} (${width}×${height})`, () => {
      cy.viewport(width, height);
      cy.visit("/dragon", { onBeforeLoad: (win) => seedPlayer(win, { unlocks: ["tofu"] }) });
      cy.contains("h1", "Rainbow Village");
      cy.get(".village-place:not(:disabled)").each(($place) => expectTappable($place[0]));

      cy.contains("button", "Tofu’s House").click();
      cy.get(".dragon-canvas", { timeout: 20000 }).should("be.visible");
      cy.get('[role="tab"]').each(($tab) => {
        cy.wrap($tab).click({ scrollBehavior: "center" }).should("have.attr", "aria-selected", "true");
        cy.get('[role="tabpanel"] button').should("have.length.at.least", 1).each(($button) => expectTappable($button[0]));
      });
    });
  });
});

describe("The park on phones", () => {
  phones.forEach(([phone, width, height]) => {
    it(`can tap every control on ${phone} (${width}×${height})`, () => {
      cy.viewport(width, height);
      cy.visit("/dragon/park", { onBeforeLoad: (win) => seedPlayer(win, { unlocks: ["tofu", "park"] }) });
      cy.contains("h1", "The Rainbow Park");
      cy.get(".dragon-canvas", { timeout: 20000 }).should("be.visible");
      cy.get('.village-sign, .dragon-action').each(($control) => expectTappable($control[0]));
    });
  });
});
