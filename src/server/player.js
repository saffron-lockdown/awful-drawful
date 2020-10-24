import { createLogger } from './logger';

export class Player {
  constructor(id) {
    this.id = id;
    this.socket = undefined;
    this.game = null;
    this.name = 'No name set';
    this.log = createLogger(this.id);
  }

  setSocket(socket) {
    this.socket = socket;
    this.update();
  }

  setName(name) {
    this.name = name;
    this.update();
  }

  getGameId() {
    if (this.game) {
      return this.game.id;
    }
    return undefined;
  }

  joinGame(game) {
    this.game = game;
    this.update();
  }

  leaveGame() {
    if (this.game) {
      this.game = undefined;
      this.update();
    }
  }

  setError(err) {
    this.emit('client-error', err);
  }

  update() {
    this.emit('sync', {
      name: this.name,
      gameId: this.getGameId(),
    });
  }

  emit(tag, message) {
    this.socket.emit(tag, message);
    this.log(`sending player ${this.id.substring(1, 6)} the message ${tag}:`);
    this.log(message);
  }
}
