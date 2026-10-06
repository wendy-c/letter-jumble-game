describe("Movers spelling game", () => {
  it("lets a learner spell a word, check it, and continue", () => {
    cy.visit("/");
    cy.contains("h1", "Letter Jumble");
    cy.get(".category-card").should("have.length", 6);
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

  it("does not reward an incorrect answer", () => {
    cy.visit("/");
    cy.contains("button", "Animals").click();

    ["b", "t", "a"].forEach((letter) => {
      cy.get(`.letter-tile[data-letter="${letter}"]`).not(".tile-used").click();
    });

    cy.contains("button", "Check word").click();
    cy.contains("Not quite");
    cy.get('[aria-label="0 rainbow coins collected"]').should("exist");
  });

  it("opens the word menu and starts a selected word with an empty answer", () => {
    cy.visit("/");
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
    cy.visit("/");
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
    cy.visit("/");
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
    cy.visit("/");
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
    cy.visit("/");
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
    cy.visit("/");
    cy.contains("button", "Animals").click();
    cy.get('button[aria-label="Browse Animals words"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get("body").type("{esc}");
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("places tapped letters in the first available box", () => {
    cy.visit("/");
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
    cy.visit("/");
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
    cy.visit("/");
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
    cy.visit("/");
    cy.contains("button", "Animals").click();
    cy.contains("button", "Check word").click();
    cy.contains("Fill every box before you check.");
  });

  it("opens another category and can return to the game selection", () => {
    cy.visit("/");
    cy.contains("button", "Body and Face").click();
    cy.contains("01 / 12");
    cy.get(".letter-bank .letter-tile").should("have.length", 5);
    cy.contains("button", "All games").click();
    cy.contains("h1", "Letter Jumble");
  });
});
