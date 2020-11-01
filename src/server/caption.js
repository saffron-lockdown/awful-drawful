export class Caption {
  constructor(playerId, text) {
    this.playerId = playerId;
    this.text = text;
    this.chosenBy = []; // ids of the players who choose this caption
  }
}
