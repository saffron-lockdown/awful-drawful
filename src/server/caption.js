export class Caption {
  constructor(player, text) {
    this._player = player;
    this._text = text;
    this._chosenBy = []; // players who choose this caption
  }

  getPlayer() {
    return this._player;
  }

  getText() {
    return this._text;
  }

  getChosenBy() {
    return this._chosenBy;
  }

  choose(player) {
    this._chosenBy.push(player);
  }
}
