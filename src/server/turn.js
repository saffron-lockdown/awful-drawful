import { Caption } from './caption';
import { createLogger } from './logger';
import { shuffle } from './utils';

export class Turn {
  constructor(totalPlayers, artist, prompt) {
    this.totalPlayers = totalPlayers;
    this.artist = artist;
    this.prompt = prompt;
    this.drawing = null;
    this.drawingSubmitted = false;
    // Initialise the captions with the original prompt
    this.captions = [new Caption(this.artist, this.prompt)];
    this.log = createLogger();
  }

  getArtist() {
    return this.artist;
  }

  getPrompt() {
    return this.prompt;
  }

  getDrawing() {
    return this.drawing;
  }

  getCaptions() {
    return this.captions;
  }

  isDrawingSubmitted() {
    return this.drawingSubmitted;
  }

  hasPlayerSubmittedCaption(player) {
    return !!this.captions.find((caption) => caption.getPlayer() === player);
  }

  hasPlayerChosenCaption(player) {
    return !!this.captions.find((caption) =>
      caption.getChosenBy().includes(player)
    );
  }

  submitDrawing(drawing) {
    this.drawing = drawing;
    this.drawingSubmitted = true;
  }

  submitCaption(caption) {
    this.captions.push(caption);
    this.captions = shuffle(this.captions);
  }

  allCaptionsIn() {
    return this.captions.length === this.totalPlayers;
  }

  chooseCaptionByText(player, captionText) {
    // record who chose what caption
    this.log('chooseCaptionByText');

    if (player !== this.artist && !this.hasPlayerChosenCaption(player)) {
      const chosenCaption = this.captions.find(
        (caption) => caption.getText() === captionText
      );
      chosenCaption.choose(player);
    }
  }

  allPlayersChosen() {
    this.log('allPlayersChosen');
    const totalChoices = this.captions.reduce((acc, caption) => {
      return acc + caption.getChosenBy().length;
    }, 0);
    return totalChoices === this.totalPlayers - 1; // artist doesn't choose
  }
}
