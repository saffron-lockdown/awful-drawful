export class Caption {
  constructor(player, text) {
    this.player = player;
    this.text = text;
    this.chosenBy = []; // players who choose this caption
  }

  getPlayer() {
    return this.player;
  }

  getChosenBy() {
    return this.chosenBy;
  }
}
