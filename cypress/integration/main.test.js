/// <reference types="cypress" />

describe('Main', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should return an error if no room exists', () => {
    cy.get('input[name=gameId]').type('ABCD').should('have.value', 'ABCD');

    cy.get('#join-game-button').click();

    cy.get('#error-display').should('contain', 'Error: game does not exist');
  });
});
