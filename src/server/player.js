import { createHash } from 'crypto';
import { createLogger } from './logger';

export class Player {
  constructor(id) {
    this.id = id;
    this.socket = null;
    this.log = createLogger(this.id.substring(0, 5));
    this.game = null;
    this.name = '';
    this.errorMessage = null;
  }

  getId() {
    return this.id;
  }

  setSocket(socket) {
    this.socket = socket;
    this.update();
  }

  getSocket() {
    return this.socket;
  }

  setName(name) {
    this.name = name;
    this.update();
  }

  getName() {
    return this.name;
  }

  getGameId() {
    if (this.game) {
      return this.game.id;
    }
    return null;
  }

  joinGame(game) {
    this.game = game;
    // Add player reference in game
    game.addPlayer(this);
  }

  leaveGame() {
    if (this.game) {
      this.game.removePlayer(this);
      this.game = null;
      this.sync();
    }
  }

  startGame() {
    if (this.game) {
      this.game.start();
    }
  }

  sendError(err) {
    this.errorMessage = err;
    this.sync();
    // clear the error message for future refreshes
    this.errorMessage = null;
  }

  postDrawing(drawing) {
    if (this.game) {
      this.game.postDrawing(this, drawing);
      this.sync();
    }
  }

  postCaption(caption) {
    if (this.game) {
      this.game.postCaption(this, caption);
      this.sync();
    }
  }

  chooseCaption(caption) {
    if (this.game) {
      this.game.chooseCaption(this, caption);
      this.sync();
    }
  }

  // pushes game updates to all other players in the current game,
  // or just the current player if not in a game
  update() {
    if (this.game) {
      this.game.sync();
    } else {
      this.sync();
    }
  }

  // syncs the player state with the client
  sync() {
    const data = {
      // state saved aginst the player
      name: this.name,
      errorMessage: this.errorMessage,
      // state saved against the game the player is currently in
      gameId: this.getGameId(),
      players: this.game && this.game.getPlayers(),
      scores: this.game && this.game.getScores(),
      phase: this.game && this.game.getPhase(),
      isWaiting: this.game && this.game.isPlayerWaiting(this),
      timerDuration: this.game && this.game.getTimerDuration(),
      timeRemaining: this.game && this.game.getTimeRemaining(),
      prompt: this.game && this.game.getPrompt(this),
      viewDrawing: this.game && this.game.getViewDrawing(),
      captions: this.game && this.game.getCaptions(),
      realPrompt: this.game && this.game.getRealPrompt(),
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
    if (this.socket) {
      this.socket.emit(tag, message);
    }
  }
}
