import { Game } from './game.js';
import { Player } from './player.js';
import { createLogger } from './logger';
import cryptoRandomString from 'crypto-random-string';

export class Manager {
  constructor() {
    this.games = {}; // id to game object dictionary (games have references to player ids)
    this.players = {}; // id to player object dictionary
    this.log = createLogger();
  }

  getGame(gameId) {
    if (gameId in this.games) {
      this.log(`getting existing game ${gameId}`);
      return this.games[gameId];
    }
    return null;
  }

  createGame() {
    const id = cryptoRandomString({ length: 4, characters: 'CDEHKMPRTUWXY' });
    const game = new Game(id);
    this.games[id] = game;
    this.log(`created game with id: ${id}`);
    return game;
  }

  // given an id, return the player object if it exists in the manager
  // otherwise create/store a new player object and return that
  getOrCreatePlayer(id) {
    if (id in this.players) {
      this.log('seen you before');
      return this.players[id];
    }
    this.log('hello noob');
    const player = new Player(id);
    this.players[id] = player;
    return player;
  }
}
