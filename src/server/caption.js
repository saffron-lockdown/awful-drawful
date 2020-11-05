export class Caption {
  constructor(player, text) {
    this.player = player;
    this.text = text;
    this.chosenBy = []; // ids of the players who choose this caption
  }
}
