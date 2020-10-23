export class Player {
  constructor(id) {
    this.id = id;
    this.socket = undefined;
    this.game = null;
    this.name = 'No name set';
  }

  setSocket(socket) {
    this.socket = socket;
    this.update();
  }

  setName(name) {
    this.name = name;
    this.update();
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
    this.emit('client_error', err);
  }

  update() {
    let gameId;
    if (this.game) {
      gameId = this.game.id;
    } else {
      gameId = undefined;
    }

    this.emit('sync', {
      name: this.name,
      gameId,
    });
  }

  emit(tag, message) {
    this.socket.emit(tag, message);
    console.log(
      `sending player ${this.id.substring(1, 6)} the message ${tag}:`
    );
    console.log(message);
  }
}
