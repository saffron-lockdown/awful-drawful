export class Caption {
  constructor(player, text) {
    this.player = player;
    this.text = text;
    this.chosenBy = []; // players who choose this caption
  }
}
