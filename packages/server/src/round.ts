import { Player } from './player';
import { Turn } from './turn';

/* eslint-disable prefer-destructuring */
export class Round {
  _turns: Turn[];
  _turnNum: number;

  constructor(turns) {
    this._turns = turns;
    this._turnNum = 0;
  }

  getCurrentTurn() {
    return this._turns[this._turnNum];
  }

  advance() {
    this._turnNum += 1;
  }

  isOver() {
    return !!(this._turnNum === this._turns.length - 1);
  }

  getTurnByArtist(artist: Player) {
    return this._turns.find((turn) => turn.getArtist() === artist);
  }

  allDrawingsIn() {
    return this._turns.every((turn) => turn.isDrawingSubmitted());
  }
}
