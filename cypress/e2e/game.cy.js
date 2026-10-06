describe("Movers spelling game", () => {
  it("lets a learner spell a word, check it, and continue", () => {
    cy.visit("/");
    cy.contains("h1", "Pick your");
    cy.get(".category-card").should("have.length", 6);
    cy.contains("button", "Animals").click();
    cy.contains(".heading-note", "Animals");
    cy.get(".letter-bank .letter-tile").should("have.length", 3);

    ["b", "a", "t"].forEach((letter, index) => {
      cy.get(`.letter-tile[data-letter="${letter}"]`).not(".tile-used").click();
      cy.get(".letter-slot").eq(index).should("contain.text", letter);
    });

    cy.contains("button", "Check word").click();
    cy.contains("Brilliant! You got it!");
    cy.contains("button", "Next word").click();
    cy.contains("02 / 13");
    cy.get(".letter-bank .letter-tile").should("have.length", 7);
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
    cy.contains("01 / 10");
    cy.get(".letter-bank .letter-tile").should("have.length", 5);
    cy.contains("button", "All games").click();
    cy.contains("h1", "Pick your");
  });
});
