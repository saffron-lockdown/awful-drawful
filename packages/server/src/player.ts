import { Socket } from 'socket.io';
import { Game } from './game';
import { createLogger, Logger } from './logger';

export class Player {
  _id: string;
  _game: Game | null;
  _name: string;
  log: Logger;
  _socket?: Socket;

  constructor(id) {
    this._id = id;
    this._game = null;
    this._name = '';
    this.log = createLogger(this._id.substring(0, 5));
  }

  getId() {
    return this._id;
  }

  getSocket() {
    return this._socket;
  }

  setSocket(socket) {
    this._socket = socket;
    this.update();
  }

  getName() {
    return this._name;
  }

  setName(name) {
    this._name = name;
    this.update();
  }

  getGame() {
    return this._game;
  }

  setGame(game) {
    this._game = game;
    this.update();
  }

  leaveGame() {
    if (this._game) {
      this._game.removePlayer(this);
      this._game = null;
      this.sync();
    }
  }

  startGame() {
    if (this._game) {
      this._game.start();
    }
  }

  postDrawing(drawing) {
    if (this._game) {
      const res = this._game.postDrawing(this, drawing);
      this.sync();
      return res;
    }
    return { error: 'not in a game' };
  }

  postCaption(caption) {
    if (this._game) {
      const res = this._game.postCaption(caption);
      this.sync();
      return res;
    }
    return { error: 'not in a game' };
  }

  chooseCaption(caption) {
    if (this._game) {
      const res = this._game.chooseCaption(this, caption);
      this.sync();
      return res;
    }
    return {};
  }

  // pushes game updates to all other players in the current game,
  // or just the current player if not in a game
  update() {
    if (this._game) {
      this._game.sync();
    } else {
      this.sync();
    }
  }

  // syncs the player state with the client
  sync() {
    // state saved against the game the player is currently in
    const gameState = this._game?.getState(this);
    // state saved against the player
    const playerState = {
      name: this._name,
    };
    const state = {
      ...gameState,
      ...playerState,
    };

    if (gameState && gameState.timeRemaining === gameState.timerDuration) {
      this.log(this._game && this._game._gameplan);
      this.log(gameState);
    }

    this.emit('sync', state);
  }

  emit(tag, message) {
    if (this._socket) {
      this._socket.emit(tag, message);
    }
  }
}
