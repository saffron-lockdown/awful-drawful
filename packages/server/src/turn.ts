import { Caption } from './caption';
import { createLogger, Logger } from './logger';
import { Player } from './player';
import { shuffle } from './utils';

export class Turn {
  _totalPlayers: number;
  _artist: Player;
  _prompt: string;
  _drawingSubmitted: boolean;
  _drawing?: string;
  _captions: Caption[];
  log: Logger;

  constructor(totalPlayers, artist, prompt) {
    this._totalPlayers = totalPlayers;
    this._artist = artist;
    this._prompt = prompt;
    this._drawingSubmitted = false;
    // Initialise the captions with the original prompt
    this._captions = [new Caption(this._artist, this._prompt, true)];
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

  submitDrawing(drawing: string) {
    if (drawing === null) {
      this.log('null drawing submitted to turn');
    }

    // only allow one drawing to be submitted
    if (this._drawingSubmitted) {
      return;
    }

    this._drawing = drawing;
    this._drawingSubmitted = true;
  }

  submitCaption(caption: Caption) {
    // only allow one caption per player
    if (this._captions.find((c) => c.getPlayer() === caption.getPlayer())) {
      return { error: "can't submit empty caption!" };
    }
    // don't allow duplicate captions
    if (this._captions.find((c) => c.getText() === caption.getText())) {
      return { error: 'somebody else already submitted that!' };
    }
    this._captions.push(caption);
    this._captions = shuffle(this._captions);
    return {};
  }

  allCaptionsIn() {
    return this._captions.length === this._totalPlayers;
  }

  chooseCaptionByText(player: Player, captionText: string) {
    // record who chose what caption
    if (player !== this._artist && !this.hasPlayerChosenCaption(player)) {
      const chosenCaption = this._captions.find(
        (caption) => caption.getText() === captionText
      );
      if (!chosenCaption) {
        return { error: 'that doesnt match any of the available captions :(' };
      }
      if (chosenCaption.getPlayer() !== player) {
        chosenCaption.choose(player);
      } else {
        return { error: "you can't choose your own caption" };
      }
    }
    return {};
  }

  allPlayersChosen() {
    const totalChoices = this._captions.reduce((acc, caption) => {
      return acc + caption.getChosenBy().length;
    }, 0);
    return totalChoices === this._totalPlayers - 1; // artist doesn't choose
  }
}
