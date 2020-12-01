import { Caption } from './caption';
import { createLogger } from './logger';
import { shuffle } from './utils';

export class Turn {
  constructor(totalPlayers, artist, prompt) {
    this._totalPlayers = totalPlayers;
    this._artist = artist;
    this._prompt = prompt;
    this._drawing = null;
    this._drawingSubmitted = false;
    // Initialise the captions with the original prompt
    this._captions = [new Caption(this._artist, this._prompt)];
    this.log = createLogger();
  }

  getArtist() {
    return this._artist;
  }

  getPrompt() {
    return this._prompt;
  }

  getDrawing() {
    return this._drawing;
  }

  getCaptions() {
    return this._captions;
  }

  isDrawingSubmitted() {
    return this._drawingSubmitted;
  }

  hasPlayerSubmittedCaption(player) {
    return !!this._captions.find((caption) => caption.getPlayer() === player);
  }

  hasPlayerChosenCaption(player) {
    return !!this._captions.find((caption) =>
      caption.getChosenBy().includes(player)
    );
  }

  submitDrawing(drawing) {
    if (drawing === null) {
      this.log('null drawing submitted to turn');
    }
    this._drawing = drawing;
    this._drawingSubmitted = true;
  }

  submitCaption(caption) {
    this._captions.push(caption);
    this._captions = shuffle(this._captions);
  }

  allCaptionsIn() {
    return this._captions.length === this._totalPlayers;
  }

  chooseCaptionByText(player, captionText) {
    // record who chose what caption
    this.log('chooseCaptionByText');

    if (player !== this._artist && !this.hasPlayerChosenCaption(player)) {
      const chosenCaption = this._captions.find(
        (caption) => caption.getText() === captionText
      );
      chosenCaption.choose(player);
    }
  }

  allPlayersChosen() {
    this.log('allPlayersChosen');
    const totalChoices = this._captions.reduce((acc, caption) => {
      return acc + caption.getChosenBy().length;
    }, 0);
    return totalChoices === this._totalPlayers - 1; // artist doesn't choose
  }
}
