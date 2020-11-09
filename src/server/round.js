/* eslint-disable prefer-destructuring */
export class Round {
  constructor(turns) {
    this.turns = turns;
    this.turnNum = 0;
  }

  getCurrentTurn() {
    return this.turns[this.turnNum];
  }

  advance() {
    this.turnNum += 1;
  }

  isOver() {
    return !!(this.turnNum === this.turns.length - 1);
  }

  getTurnByArtist(artist) {
    return this.turns.find((turn) => turn.getArtist() === artist);
  }

  allDrawingsIn() {
    return this.turns.every((turn) => turn.isDrawingSubmitted());
  }
}
