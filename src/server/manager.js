import { Game } from './game.js';
import { Player } from './player.js';

export class Manager {
  constructor() {
    this.games = {}; // id to game object dictionary (games have references to player ids)
    this.players = {}; // id to player object dictionary
  }

  // given an id, return the game object if it exists in the manager
  // otherwise create/store a new game object and return that
  getOrCreateGame(gameId) {
    if (gameId in this.games) {
      console.log(`getting existing game ${gameId}`);
      return this.games[gameId];
    }
    const game = new Game(gameId);
    this.games[gameId] = game;
    return game;
  }

  // given an id, return the player object if it exists in the manager
  // otherwise create/store a new player object and return that
  getOrCreatePlayer(id) {
    if (id in this.players) {
      console.log('seen you before');
      return this.players[id];
    }
    console.log('hello noob');
    const player = new Player(id);
    this.players[id] = player;
    return player;
  }

  // emit a message to all players in a game
  messageGame(gameId, tag, message) {
    const game = this.games[gameId];

    game.players.forEach((playerId) => {
      this.players[playerId].emit(tag, message);
    });
  }

  // output a list of all the players in the specified game
  listPlayersInGame(gameId) {
    let playerList = '';
    this.games[gameId].players.forEach((element) => {
      playerList += `${this.players[element].name}, `;
    });
    return playerList;
  }
}
