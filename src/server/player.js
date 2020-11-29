import { createHash } from 'crypto';
import { createLogger } from './logger';

export class Player {
  constructor(id) {
    this._id = id;
    this._socket = null;
    this._game = null;
    this._name = '';
    this._errorMessage = null;
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
    if (this._game) {
      return this._game;
    }
    return null;
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

  sendError(err) {
    this._errorMessage = err;
    this.sync();
    // clear the error message for future refreshes
    this._errorMessage = null;
  }

  postDrawing(drawing) {
    if (this._game) {
      this._game.postDrawing(this, drawing);
      this.sync();
    }
  }

  postCaption(caption) {
    if (this._game) {
      this._game.postCaption(caption);
      this.sync();
    }
  }

  chooseCaption(caption) {
    if (this._game) {
      this._game.chooseCaption(this, caption);
      this.sync();
    }
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
    const data = {
      // state saved aginst the player
      name: this._name,
      errorMessage: this._errorMessage,
      // state saved against the game the player is currently in
      gameId: this._game && this._game.getId(),
      players: this._game && this._game.getPlayers(),
      scores: this._game && this._game.getScores(),
      phase: this._game && this._game.getPhase(),
      isWaiting: this._game && this._game.isPlayerWaiting(this),
      timerDuration: this._game && this._game.getTimerDuration(),
      timeRemaining: this._game && this._game.getTimeRemaining(),
      prompt: this._game && this._game.getPrompt(this),
      viewDrawing: this._game && this._game.getViewDrawing(),
      captions: this._game && this._game.getCaptions(),
      realPrompt: this._game && this._game.getRealPrompt(),
    };
    const stripped = {
      ...data,
      viewDrawing:
        data.viewDrawing &&
        createHash('sha1')
          .update(JSON.stringify(data.viewDrawing))
          .digest('hex'),
    };
    this.log('sync:');
    this.log(stripped);

    this.emit('sync', data);
  }

  emit(tag, message) {
    if (this._socket) {
      this._socket.emit(tag, message);
    }
  }
}
