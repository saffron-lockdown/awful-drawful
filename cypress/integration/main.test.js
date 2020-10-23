/// <reference types="cypress" />

describe('Main', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('returns an error if no room exists', () => {
    cy.get('input[name=gameId]').type('ABCD').should('have.value', 'ABCD');

    cy.get('#join-game-button').click();

    cy.get('#error-display').should('contain', 'Error: game does not exist');
  });

  it('creates a room', () => {
    cy.get('#create-game-button').click();

    cy.get('#game-id-display')
      .invoke('text')
      .should('match', /Game ID: [a-z0-9]{4}/);

    cy.get('input[name=gameId]')
      .invoke('val')
      .should('match', /[a-z0-9]{4}/);
  });

  it('leaves a room', () => {
    cy.get('#create-game-button').click();

    cy.get('#leave-game-button').click();

    cy.get('#game-id-display').should('contain', 'Game ID: ');

    cy.get('input[name=gameId]').should('be.empty');
  });
});
