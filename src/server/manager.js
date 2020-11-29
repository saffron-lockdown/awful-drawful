import { Game } from './game.js';
import { Player } from './player.js';
import { createLogger } from './logger';
import cryptoRandomString from 'crypto-random-string';

export class Manager {
  constructor() {
    this._games = {}; // id to game object dictionary (games have references to player ids)
    this._players = {}; // id to player object dictionary
    this.log = createLogger();
  }

  getGame(gameId) {
    if (gameId in this._games) {
      this.log(`getting existing game ${gameId}`);
      return this._games[gameId];
    }
    return null;
  }

  createGame() {
    const id = cryptoRandomString({ length: 4, characters: 'CDEHKMPRTUWXY' });
    const game = new Game(id);
    this._games[id] = game;
    this.log(`created game with id: ${id}`);
    return game;
  }

  // given an id, return the player object if it exists in the manager
  // otherwise create/store a new player object and return that
  getOrCreatePlayer(id) {
    if (id in this._players) {
      this.log('seen you before');
      return this._players[id];
    }
    this.log('hello noob');
    const player = new Player(id);
    this._players[id] = player;
    return player;
  }
}
