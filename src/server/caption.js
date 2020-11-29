export class Caption {
  constructor(player, text) {
    this.player = player;
    this.text = text;
    this.chosenBy = []; // players who choose this caption
  }

  getPlayer() {
    return this.player;
  }

  getText() {
    return this.text;
  }

  getChosenBy() {
    return this.chosenBy;
  }

  choose(player) {
    this.chosenBy.push(player);
  }
}
