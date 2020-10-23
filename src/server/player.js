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

  getGame() {
    if (this.game) {
      return this.game.id;
    }
    return undefined;
  }

  joinGame(game) {
    this.game = game;
    this.update();
  }

  update() {
    this.emit('sync', {
      name: this.name,
      gameId: this.getGame(),
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
