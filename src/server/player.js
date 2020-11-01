import { createLogger } from './logger';

export class Player {
  constructor(id) {
    this.id = id;
    this.socket = null;
    this.log = createLogger(this.id);
    this.game = null;
    this.state = {
      name: '',
      errorMessage: null,
    };
  }

  setSocket(socket) {
    this.socket = socket;
    this.update();
  }

  setName(name) {
    this.state.name = name;
    this.update();
  }

  getName() {
    return this.state.name;
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

    this.update();
  }

  leaveGame() {
    if (this.game) {
      this.game.removePlayer(this);
      this.game = null;
      this.update();
    }
  }

  sendError(err) {
    this.state.errorMessage = err;
    this.sync();
    this.state.errorMessage = null;
  }

  setPrompt(prompt) {
    this.state.prompt = prompt;

    // prompt is secret to player, so only sync required
    this.sync();
  }

  setCaptions(captions) {
    this.state.captions = captions;
    this.sync();
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

  // syncs the player and any game are in
  update() {
    if (this.game) {
      this.game.sync();
    } else {
      this.sync();
    }
  }

  // syncs the player state with the client
  sync() {
    const isWaiting = this.game && this.game.isPlayerWaiting(this);
    const data = {
      ...this.state,
      gameId: this.getGameId(),
      playerList: this.game && this.game.listPlayers(),
      prompt: this.game && this.game.getPrompt(this),
      viewDrawing: this.game && this.game.getViewDrawing(),
      viewDrawingFrom: this.game && this.game.getViewDrawingFrom(),
      phase: this.game && this.game.getPhase(),
      isWaiting,
    };
    this.log('sync:');
    this.log(data);
    this.emit('sync', data);
  }

  emit(tag, message) {
    this.socket.emit(tag, message);
  }
}
