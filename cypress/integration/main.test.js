/// <reference types="cypress" />

describe('Main', () => {
  beforeEach(() => {
    cy.visit('/');

    // wait for server to sync with client
    // TODO: find a better way to do this
    cy.wait(500);
  });

  it('does not set a default name', () => {
    cy.get('input[name=name]').should('have.value', '');
  });

  it('sets name', () => {
    cy.get('input[name=name]').clear();
    cy.get('input[name=name]').type('wz');
    cy.get('#set-name-button').click();

    cy.get('#name-display').should('contain', 'wz');

    cy.visit('/');

    cy.get('#name-display').should('contain', 'wz');
  });

  describe('with name set', () => {
    const gameIdDisplayRegex = /Game ID: ([A-Z]{4})/;

    beforeEach(() => {
      cy.get('input[name=name]').clear();
      cy.get('input[name=name]').type('wz');
      cy.get('#set-name-button').click();
    });

    it('returns an error if no room exists', () => {
      cy.get('input[name=gameId]').type('QWER').should('have.value', 'QWER');
      cy.get('#join-game-button').click();

      cy.get('#error-display').should('contain', 'Error: game does not exist');
    });

    it('join game', () => {
      cy.get('input[name=gameId]').type('ABCD').should('have.value', 'ABCD');
      cy.get('#join-game-button').click();

      cy.get('#game-id-display')
        .invoke('text')
        .should('match', gameIdDisplayRegex);
      cy.get('#player-list-display').should('contain', 'wz');
    });

    it('interaction with rooms', () => {
      cy.get('#create-game-button').click();

      cy.get('#game-id-display')
        .invoke('text')
        .should('match', gameIdDisplayRegex);
      cy.get('#player-list-display').should('contain', 'wz');

      // leave game and try to re-join
      cy.get('#game-id-display')
        .invoke('text')
        .then((val) => {
          // save ID from current room
          const id = val.match(gameIdDisplayRegex)[1];

          cy.get('#game-id-display').click();
          cy.get('#leave-game-button').click();

          cy.get('input[name=gameId]').should('be.empty');

          cy.get('input[name=gameId]').type(id);
          cy.get('#join-game-button').click();

          cy.get('#error-display').should(
            'contain',
            'Error: game does not exist'
          );
        });
    });

    describe('in lobby', () => {
      beforeEach(() => {
        cy.get('#create-game-button').click();
      });

      it('starts the game', () => {
        cy.get('#start-game-button').click();

        cy.get('#display')
          .invoke('text')
          .should('match', /Your prompt to draw is:/);
      });
    });
  });
});
