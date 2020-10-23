export class Player {
  constructor(id) {
    this.id = id;
    this.socket = undefined;
    this.name = 'No name set';
  }

  update() {
    this.emit('set-name', this.name);
  }

  emit(tag, message) {
    this.socket.emit(tag, message);
    console.log(
      `sending player ${this.id.substring(1, 6)} the message ${tag}: ${message}`
    );
  }
}
