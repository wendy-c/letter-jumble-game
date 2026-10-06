describe("coin shots", () => {
  it("captures", () => {
    cy.viewport(1280, 900);
    cy.visit("/");
    cy.contains("button", "Animals").click();
    cy.get(".rainbow-coin-counter").screenshot("coin-counter", { overwrite: true, padding: 10 });
    ["b", "a", "t"].forEach((l) => cy.get(`.letter-tile[data-letter="${l}"]`).not(".tile-used").click());
    cy.contains("button", "Check word").click();
    cy.wait(900);
    cy.get(".reward-card").screenshot("coin-reward", { overwrite: true });
  });
});
