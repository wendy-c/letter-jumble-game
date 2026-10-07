[320, 375].forEach((width) => {
  it(`phone ${width}`, () => {
    cy.viewport(width, 740);
    cy.visit("/", { onBeforeLoad: (win) => win.localStorage.setItem("letter-jumble:players", JSON.stringify({ players: [{ name: "Christopher", coins: 128 }], current: "Christopher" })) });
    cy.contains("button", "Letter Jumble").click();
    cy.contains("button", "Places and Travel").click();
    cy.wait(300);
    cy.screenshot(`${width}-heading`, { capture: "viewport", overwrite: true });
    cy.get(".letter-tile").each(($tile) => cy.wrap($tile).click());
    cy.contains("button", "Check word").click();
    cy.get(".answer-footer").scrollIntoView();
    cy.wait(300);
    cy.get(".answer-panel").screenshot(`${width}-footer`, { overwrite: true });
    cy.document().its("documentElement.scrollWidth").should("be.at.most", width);
  });
});
