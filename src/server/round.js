/* eslint-disable prefer-destructuring */
export class Round {
  constructor(turns) {
    this.turns = turns;
    this.currentTurn = this.turns[0];
  }

  getCurrentTurn() {
    return this.currentTurn;
  }

  getTurnByArtist(artist) {
    return this.turns.find((turn) => turn.getArtist() === artist);
  }

  allDrawingsIn() {
    return this.turns.every((turn) => turn.isDrawingSubmitted());
  }
}
