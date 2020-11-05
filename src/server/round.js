/* eslint-disable prefer-destructuring */
export class Round {
  constructor(subRounds) {
    this.subRounds = subRounds;
    this.currentSubRound = this.subRounds[0];
  }

  getCurrentSubRound() {
    return this.currentSubRound;
  }

  getSubRoundByArtist(artist) {
    return this.subRounds.find((subRound) => subRound.getArtist() === artist);
  }

  allDrawingsIn() {
    return this.subRounds.every((subRound) => subRound.isDrawingSubmitted());
  }
}
