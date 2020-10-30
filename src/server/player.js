import { createLogger } from './logger';

export class Player {
  constructor(id) {
    this.id = id;
    this.socket = null;
    this.log = createLogger(this.id.substring(0, 5));
    this.game = null;
    this.state = {
      name: 'No name set',
      errorMessage: null,
      prompt: null,
      viewDrawing: null,
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
    return undefined;
  }

  joinGame(game) {
    this.game = game;
    // Add player reference in game
    game.addPlayer(this);

    this.update();
  }

  leaveGame() {
    if (this.game) {
      this.game = null;
      this.update();
    }
  }

  setError(err) {
    this.state.errorMessage = err;
    this.sync();
  }

  setPrompt(prompt) {
    this.state.prompt = prompt;

    // prompt is secret to player, so only sync required
    this.sync();
  }

  setViewDrawing(drawing) {
    this.state.viewDrawing = drawing;

    this.sync();
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
    this.emit('sync', {
      ...this.state,
      gameId: this.getGameId(),
      playerList: this.game && this.game.listPlayers(),
    });
  }

  emit(tag, message) {
    this.socket.emit(tag, message);
    this.log(`sending player ${this.id.substring(1, 6)} the message ${tag}:`);

    // remove viewDrawing because it's too big
    const strippedMessage = {
      ...message,
      viewDrawing: message.viewDrawing ? 'TRUNCATED' : message.viewDrawing,
    };
    this.log(strippedMessage);
  }
}
