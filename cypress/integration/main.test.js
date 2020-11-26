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
    beforeEach(() => {
      cy.get('input[name=name]').clear();
      cy.get('input[name=name]').type('wz');
      cy.get('#set-name-button').click();
    });

    it('returns an error if no room exists', () => {
      cy.get('input[name=gameId]').type('ABCD').should('have.value', 'ABCD');

      cy.get('#join-game-button').click();

      cy.get('#error-display').should('contain', 'Error: game does not exist');
    });

    it('interaction with rooms', () => {
      cy.get('#create-game-button').click();

      const regex = /Game ID: ([A-Z]{4})/;

      cy.get('#game-id-display').invoke('text').should('match', regex);
      cy.get('#player-list-display').should('contain', 'wz');

      // leave game and re-join
      cy.get('#game-id-display')
        .invoke('text')
        .then((val) => {
          // save ID from current room
          const id = val.match(regex)[1];

          cy.get('#leave-game-button').click();

          cy.get('input[name=gameId]').should('be.empty');

          cy.get('input[name=gameId]').type(id);

          cy.get('#join-game-button').click();

          cy.get('#game-id-display').invoke('text').should('match', regex);
          cy.get('#player-list-display').should('contain', 'wz');
        });
    });

    describe('in lobby', () => {
      beforeEach(() => {
        cy.get('#create-game-button').click();
      });

      it('starts the game', () => {
        cy.get('#start-game-button').click();

        cy.get('#prompt-display')
          .invoke('text')
          .should('match', /Your prompt to draw is:/);
      });
    });
  });
});
