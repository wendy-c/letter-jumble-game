const playersKey = "letter-jumble:players";

function addPlayer(name, age = "5-6") {
  cy.get('[role="dialog"]').should("contain.text", "playing?").within(() => {
    cy.get("input").type(name);
    cy.contains('[role="radio"]', `${age} years old`).click();
    cy.contains("button", "play!").click();
  });
}

// Opens Letter Jumble. With a new player name, fills in the "Who's playing?" pop-up;
// pass null when a player is already selected (e.g. seeded in localStorage).
function visitLetterJumble(options, newPlayer = "Ada") {
  cy.visit("/", options);
  cy.contains("button", "Letter Jumble").click();
  if (newPlayer) addPlayer(newPlayer);
}

function visitCvcMode(mode) {
  cy.visit("/");
  cy.contains("button", "CVC Sounds").click();
  addPlayer("Ada", "3-4");
  cy.contains("button", mode).click();
}

function storedPlayers() {
  return cy.window().its("localStorage").invoke("getItem", playersKey).then((value) => JSON.parse(value));
}

describe("Movers spelling game", () => {
  it("lets a learner spell a word, check it, and continue", () => {
    visitLetterJumble();
    cy.contains("h1", "Letter Jumble");
    cy.get(".category-card").should("have.length", 8);
    cy.contains("button", "Animals").click();
    cy.contains("h1", "Animals");
    cy.get(".letter-bank .letter-tile").should("have.length", 3);
    cy.get('[aria-label="0 rainbow coins collected"]').should("exist");

    ["b", "a", "t"].forEach((letter, index) => {
      cy.get(`.letter-tile[data-letter="${letter}"]`).not(".tile-used").click();
      cy.get(".letter-slot").eq(index).should("contain.text", letter);
    });

    cy.contains("button", "Check word").click();
    cy.get(".reward-card").should("contain.text", "Amazing!");
    cy.contains("button", "Next word").should("not.exist");
    cy.get('[aria-label="1 rainbow coins collected"]').should("exist");
    cy.get(".reward-card").click();
    cy.contains("02 / 13");
    cy.get(".letter-bank .letter-tile").should("have.length", 7);

    ["d", "o", "l", "p", "h", "i", "n"].forEach((letter) => {
      cy.get(`.letter-tile[data-letter="${letter}"]`).not(".tile-used").click();
    });
    cy.contains("button", "Check word").click();
    cy.get(".reward-card").should("contain.text", "Well done!");
    cy.get('[aria-label="2 rainbow coins collected"]').should("exist");
    cy.get(".reward-card").click();
    cy.contains("03 / 13");
  });

  it("keeps collected rainbow coins after reloading the page", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();
    ["b", "a", "t"].forEach((letter) => {
      cy.get(`.letter-tile[data-letter="${letter}"]`).not(".tile-used").click();
    });
    cy.contains("button", "Check word").click();
    cy.get('[aria-label="1 rainbow coins collected"]').should("exist");
    storedPlayers().should("deep.equal", { players: [{ name: "Ada", coins: 1, age: "5-6" }], current: "Ada" });

    cy.reload();
    cy.contains("button", "Letter Jumble").click();
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("button", "Animals").click();
    cy.get('[aria-label="1 rainbow coins collected"]').should("exist");
  });

  it("starts from a previously saved rainbow coin count", () => {
    visitLetterJumble({
      onBeforeLoad(win) {
        win.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 7, age: "5-6" }], current: "Ada" }));
      },
    }, null);
    cy.contains("button", "Animals").click();
    cy.get('[aria-label="7 rainbow coins collected"]').should("exist");
  });

  it("does not reward an incorrect answer", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();

    ["b", "t", "a"].forEach((letter) => {
      cy.get(`.letter-tile[data-letter="${letter}"]`).not(".tile-used").click();
    });

    cy.contains("button", "Check word").click();
    cy.contains("Not quite");
    cy.get('[aria-label="0 rainbow coins collected"]').should("exist");
  });

  it("opens the word menu and starts a selected word with an empty answer", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();
    cy.get('.letter-tile[data-letter="b"]').click();
    cy.get(".letter-slot").eq(0).should("contain.text", "b");

    cy.get('button[aria-label="Browse Animals words"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get(".word-menu-item").should("have.length", 13);
    cy.get(".word-menu-item").contains("Panda").click();

    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("06 / 13");
    cy.get(".letter-slot").should("have.length", 5).each(($slot) => {
      expect($slot).to.have.attr("aria-label").and.match(/, empty$/);
    });
  });

  it("marks vowel and consonant teams and other sounds in the spelling guide", () => {
    visitLetterJumble();
    cy.contains("button", "Places and Travel").click();
    cy.get('button[aria-label="Browse Places and Travel words"]').click();
    cy.get('button[role="switch"]').contains("Spelling guide").click();
    cy.get(".word-menu-item").contains("Swimming pool").click();

    cy.get(".letter-slot").should("have.length", 12);
    cy.get(".letter-slot").eq(0).should("have.class", "letter-slot-guide-consonant");
    cy.get(".letter-slot").eq(1).should("have.class", "letter-slot-guide-consonant");
    cy.get(".letter-slot").eq(2).should("have.class", "letter-slot-guide-other");
    cy.get(".letter-slot").eq(3).should("have.class", "letter-slot-guide-other");
    cy.get(".letter-slot").eq(9).should("have.class", "letter-slot-guide-vowel");
    cy.get(".letter-slot").eq(10).should("have.class", "letter-slot-guide-vowel");
    cy.contains(".spelling-guide", "Vowel team");
    cy.contains(".spelling-guide", "Consonant team");
    cy.contains(".spelling-guide", "Other");
  });

  it("hides the spelling guide by default and toggles it on and off", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();
    cy.get('button[role="switch"]').should("not.exist");
    cy.get('.letter-slot[class*="letter-slot-guide-"]').should("not.exist");
    cy.get(".spelling-guide").should("not.exist");

    cy.get('button[aria-label="Browse Animals words"]').click();
    cy.get('[role="dialog"] button[role="switch"]').should("have.attr", "aria-checked", "false").click();
    cy.get('button[role="switch"]').should("have.attr", "aria-checked", "true");
    cy.get('[role="dialog"]').should("be.visible");
    cy.get("body").type("{esc}");
    cy.get(".letter-slot").eq(0).should("have.class", "letter-slot-guide-other");
    cy.contains(".spelling-guide", "Vowel team");

    cy.get('button[aria-label="Browse Animals words"]').click();
    cy.get('button[role="switch"]').click();
    cy.get("body").type("{esc}");
    cy.get('.letter-slot[class*="letter-slot-guide-"]').should("not.exist");
    cy.get(".spelling-guide").should("not.exist");
  });

  it("marks ph as a consonant team in dolphin", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();
    cy.get('button[aria-label="Browse Animals words"]').click();
    cy.get('button[role="switch"]').contains("Spelling guide").click();
    cy.get(".word-menu-item").contains("Dolphin").click();

    cy.get(".letter-slot").should("have.length", 7);
    [0, 1, 2, 5, 6].forEach((index) => {
      cy.get(".letter-slot").eq(index).should("have.class", "letter-slot-guide-other");
    });
    [3, 4].forEach((index) => {
      cy.get(".letter-slot").eq(index).should("have.class", "letter-slot-guide-consonant");
    });
  });

  it("marks sh and th as consonant teams", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();
    cy.get('button[aria-label="Browse Animals words"]').click();
    cy.get('button[role="switch"]').contains("Spelling guide").click();
    cy.get(".word-menu-item").contains("Shark").click();
    cy.get(".letter-slot").eq(0).should("have.class", "letter-slot-guide-consonant");
    cy.get(".letter-slot").eq(1).should("have.class", "letter-slot-guide-consonant");

    cy.contains("button", "All games").click();
    cy.contains("button", "Body and Face").click();
    cy.get('button[aria-label="Browse Body and Face words"]').click();
    cy.get(".word-menu-item").contains("Tooth").click();
    cy.get(".letter-slot").eq(3).should("have.class", "letter-slot-guide-consonant");
    cy.get(".letter-slot").eq(4).should("have.class", "letter-slot-guide-consonant");
  });

  it("closes the word menu with Escape", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();
    cy.get('button[aria-label="Browse Animals words"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("places tapped letters in the first available box", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();

    cy.get('.letter-tile[data-letter="t"]').click();
    cy.get('.letter-tile[data-letter="a"]').click();
    cy.get(".letter-slot").eq(0).should("contain.text", "t");
    cy.get(".letter-slot").eq(1).should("contain.text", "a");

    cy.get(".letter-slot").eq(0).click();
    cy.get('.letter-tile[data-letter="b"]').click();
    cy.get(".letter-slot").eq(0).should("contain.text", "b");
    cy.get(".letter-slot").eq(1).should("contain.text", "a");
  });

  it("speaks the current word with an available British female voice", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();
    cy.window().then((window) => {
      cy.stub(window.speechSynthesis, "cancel");
      cy.stub(window.speechSynthesis, "getVoices").returns([
        { name: "Google UK English Female", lang: "en-GB" },
        { name: "Daniel", lang: "en-GB" },
      ]);
      cy.stub(window.speechSynthesis, "speak").as("speakWord");
      window.SpeechSynthesisUtterance = function (text) {
        this.text = text;
      };
    });

    cy.get('button[aria-label="Hear the word"]').click();
    cy.get("@speakWord").should("have.been.calledOnce");
    cy.get("@speakWord").its("firstCall.args.0").should((utterance) => {
      expect(utterance.text).to.equal("bat");
      expect(utterance.lang).to.equal("en-GB");
      expect(utterance.voice.name).to.equal("Google UK English Female");
      expect(utterance.rate).to.be.closeTo(0.85, 0.001);
    });
  });

  it("explains when no female voice is available", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();
    cy.window().then((window) => {
      cy.stub(window.speechSynthesis, "getVoices").returns([
        { name: "Daniel", lang: "en-GB" },
      ]);
      cy.stub(window.speechSynthesis, "speak").as("speakWord");
    });

    cy.get('button[aria-label="Hear the word"]').click();
    cy.contains("A female voice isn’t available in this browser.");
    cy.get("@speakWord").should("not.have.been.called");
  });

  it("gives feedback when the answer is not yet complete", () => {
    visitLetterJumble();
    cy.contains("button", "Animals").click();
    cy.contains("button", "Check word").click();
    cy.contains("Fill every box before you check.");
  });

  it("opens another category and can return to the game selection", () => {
    visitLetterJumble();
    cy.contains("button", "Body and Face").click();
    cy.contains("01 / 13");
    cy.get(".letter-bank .letter-tile").should("have.length", 5);
    cy.contains("button", "All games").click();
    cy.contains("h1", "Letter Jumble");
  });
});

describe("CVC sounds game", () => {
  it("offers the games and the four CVC modes", () => {
    cy.visit("/");
    cy.contains("h1", "Choose an adventure!");
    cy.get(".game-choice-card").should("have.length", 4);
    cy.contains("button", "CVC Sounds").click();
    addPlayer("Ada", "3-4");
    cy.contains("h1", "CVC Sounds");
    cy.get(".category-card").should("have.length", 4);
    ["Beginning Sound", "Middle Sound", "Ending Sound", "Mixed Sounds"].forEach((mode) => {
      cy.contains(".category-card", mode).should("contain.text", "46");
    });
    cy.contains("button", "Choose a game").click();
    cy.contains("h1", "Choose an adventure!");
  });

  it("leaves only the beginning letter to fill in", () => {
    visitCvcMode("Beginning Sound");
    cy.contains("01 / 46");
    cy.get(".letter-slot").should("have.length", 1);
    cy.get(".letter-given").should("have.length", 2).then(($letters) => {
      expect([...$letters].map((letter) => letter.textContent)).to.deep.equal(["a", "t"]);
    });
    cy.get(".letter-slots").children().children().first().should("have.class", "letter-slot");
    cy.get(".letter-bank .letter-tile").should("have.length", 4);
    cy.get('[role="switch"]').should("not.exist");

    cy.get('.letter-tile[data-letter="c"]').click();
    cy.contains("button", "Check word").click();
    cy.get(".reward-card").should("contain.text", "Amazing!");
    cy.get(".reward-card").click();
    cy.contains("02 / 46");
  });

  it("offers every short vowel for the middle sound", () => {
    visitCvcMode("Middle Sound");
    cy.get(".letter-given").then(($letters) => {
      expect([...$letters].map((letter) => letter.textContent)).to.deep.equal(["c", "t"]);
    });
    cy.get(".letter-bank .letter-tile").then(($tiles) => {
      expect([...$tiles].map((tile) => tile.dataset.letter)).to.deep.equal(["a", "e", "i", "o", "u"]);
    });

    cy.get('.letter-tile[data-letter="o"]').click();
    cy.get('.letter-tile[data-letter="a"]').click();
    cy.get(".letter-slot").should("contain.text", "a");
    cy.get('.letter-tile[data-letter="o"]').should("not.have.class", "tile-used");
    cy.contains("button", "Check word").click();
    cy.get(".reward-card").should("exist");
  });

  it("says not quite when the wrong ending sound is picked", () => {
    visitCvcMode("Ending Sound");
    cy.get(".letter-given").then(($letters) => {
      expect([...$letters].map((letter) => letter.textContent)).to.deep.equal(["c", "a"]);
    });
    cy.get('.letter-tile[data-letter="x"]').click();
    cy.contains("button", "Check word").click();
    cy.contains("Not quite");
    cy.get(".reward-card").should("not.exist");

    cy.get(".letter-slot").click();
    cy.get(".letter-slot").should("not.contain.text", "x");
    cy.contains("button", "Check word").click();
    cy.contains("Fill every box before you check.");
  });

  it("mixes beginning, middle and ending sounds", () => {
    visitCvcMode("Mixed Sounds");
    const expectSlotAt = (position) => {
      cy.get(".letter-slots .letter-word").children().eq(position).should("have.class", "letter-slot");
    };
    expectSlotAt(0);
    cy.get('button[aria-label="Browse Mixed Sounds words"]').click();
    cy.get(".word-menu-item").contains("Hat").click();
    expectSlotAt(1);
    cy.get('button[aria-label="Browse Mixed Sounds words"]').click();
    cy.get(".word-menu-item").contains("Bat").click();
    expectSlotAt(2);
  });

  it("returns from a CVC mode to the list of sounds", () => {
    visitCvcMode("Beginning Sound");
    cy.contains("button", "All sounds").click();
    cy.contains("h1", "CVC Sounds");
  });
});

describe("players", () => {
  it("keeps each player's coins separate, and logs out", () => {
    visitLetterJumble(undefined, "Mia");
    cy.get('button[aria-label^="Playing as Mia"]').should("contain.text", "Mia");
    cy.contains("button", "Animals").click();
    ["b", "a", "t"].forEach((letter) => {
      cy.get(`.letter-tile[data-letter="${letter}"]`).not(".tile-used").click();
    });
    cy.contains("button", "Check word").click();
    cy.get(".reward-card").click();

    cy.get('button[aria-label$="Player options"]').click();
    cy.contains('[role="menuitem"]', "Switch player").click();
    cy.get('[role="dialog"] .player-option').should("have.length", 1).and("contain.text", "Mia");
    addPlayer("Theo");
    cy.get('[aria-label="0 rainbow coins collected"]').should("exist");

    cy.reload();
    cy.get('button[aria-label^="Playing as Theo"]').click();
    cy.contains('[role="menuitem"]', "Switch player").click();
    cy.get('[role="dialog"] .player-option').contains("Mia").click();
    cy.contains("button", "Letter Jumble").click();
    cy.contains("button", "Animals").should("contain.text", "1 of 13 spells learned").click();
    cy.get('[aria-label="1 rainbow coins collected"]').should("exist");
    cy.contains("02 / 13");

    cy.get('button[aria-label$="Player options"]').click();
    cy.contains('[role="menuitem"]', "Log out").click();
    cy.contains("h1", "Choose an adventure!");
    storedPlayers().should("deep.equal", {
      players: [
        { name: "Mia", coins: 1, age: "5-6", progress: { "letter-jumble/animals": 1 } },
        { name: "Theo", coins: 0, age: "5-6" },
      ],
      current: null,
    });
  });
});

describe("ages", () => {
  it("shows a 3-4 year old the CVC game and the dragon, but not Letter Jumble", () => {
    cy.visit("/");
    cy.contains("button", "CVC Sounds").click();
    addPlayer("Mia", "3-4");
    cy.contains("button", "Choose a game").click();
    cy.get(".game-choice-card").should("have.length", 3);
    cy.contains(".game-choice-card", "CVC Sounds");
    cy.contains(".game-choice-card", "中文認字");
    cy.contains(".game-choice-card", "Rainbow Dragon");
    cy.contains(".game-choice-card", "Letter Jumble").should("not.exist");
  });
});

describe("rainbow dragon", () => {
  it("shows Mochi in 3D and spends coins on treats", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 3, age: "3-4" }], current: "Ada" }));
      },
    });
    cy.contains("button", "Rainbow Dragon").click();
    cy.contains("h1", "Mochi the Rainbow Dragon");
    cy.get(".dragon-canvas", { timeout: 20000 }).should("be.visible");

    cy.get('button[aria-label="Ice cream, 2 rainbow coins"]').click();
    cy.get('[aria-label="1 rainbow coins collected"]').should("exist");
    cy.get(".dragon-bubble").should("contain.text", "brrr");
    cy.get('button[aria-label="Apple, 1 rainbow coin"]').should("be.disabled");

    cy.get('button[aria-label="Apple, 1 rainbow coin"]', { timeout: 8000 }).should("be.enabled").click();
    cy.get('[aria-label="0 rainbow coins collected"]').should("exist");
    cy.contains("out of rainbow coins");
    storedPlayers().should("deep.equal", { players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" });
  });
});

describe("chinese characters", () => {
  it("matches a character to its colour picture and earns a coin", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
      },
    });
    cy.contains("button", "中文認字").click();
    cy.contains("button", "顏色").click();
    cy.contains(".chinese-character", "紅");
    cy.get(".chinese-option").should("have.length", 4).find("img").each(($img) => {
      expect($img[0].naturalWidth).to.be.greaterThan(0);
    });

    cy.get('.chinese-option[data-character="橙"]').click().should("be.disabled");
    cy.contains("唔係呢個，再試吓！");
    cy.get('.chinese-option[data-character="紅"]').click();
    cy.get(".reward-card").should("contain.text", "好叻呀！");
    cy.get('[aria-label="1 rainbow coins collected"]').should("exist");
    cy.get(".reward-card").click();
    cy.contains(".chinese-character", "橙");
    cy.contains("02 / 13");
  });

  it("shows everyday phrases for the food topic", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem(playersKey, JSON.stringify({ players: [{ name: "Ada", coins: 0, age: "3-4" }], current: "Ada" }));
      },
    });
    cy.contains("button", "中文認字").click();
    cy.contains("button", "食物").click();
    cy.contains(".chinese-character", "餅");
    cy.get(".chinese-phrase").should("have.length", 2).first().should("contain.text", "餅乾").find("mark").should("have.text", "餅");
    cy.get('button[aria-label="提示"]').should("be.visible");
    cy.get(".chinese-option img").each(($img) => expect($img[0].naturalWidth).to.be.greaterThan(0));
    cy.get('.chinese-option[data-character="餅"]').click();
    cy.get(".reward-card").should("exist");
  });
});

