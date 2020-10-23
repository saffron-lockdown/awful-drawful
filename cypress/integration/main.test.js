/// <reference types="cypress" />

describe('Main', () => {
  beforeEach(() => {
    cy.visit('/');

    // wait for server to sync with client
    // TODO: find a better way to do this
    cy.wait(500);
  });

  it('sets a default name', () => {
    cy.get('input[name=name]').should('have.value', 'No name set');
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

    cy.get('#player-list-display').should('contain', 'No name set');
  });

  it('joins an existing room', () => {
    cy.get('#create-game-button').click();

    cy.get('#join-game-button').click();

    cy.get('#game-id-display')
      .invoke('text')
      .should('match', /Game ID: [a-z0-9]{4}/);

    cy.get('input[name=gameId]')
      .invoke('val')
      .should('match', /[a-z0-9]{4}/);

    cy.get('#player-list-display').should('contain', 'No name set');
  });

  it('leaves a room', () => {
    cy.get('#create-game-button').click();

    cy.get('#leave-game-button').click();

    cy.get('#game-id-display').should('contain', 'Game ID: ');

    cy.get('input[name=gameId]').should('be.empty');
  });

  it('sets name', () => {
    cy.get('input[name=name]').clear();
    cy.get('input[name=name]').type('wz');

    cy.get('#set-name-button').click();

    cy.visit('/');

    cy.get('input[name=name]').should('have.value', 'wz');
  });
});
