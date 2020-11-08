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
    // Initialise the captions to be the initial prompt
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
    return this.captions.map((caption) => {
      return {
        playerName: caption.player.getName(),
        text: caption.text,
        chosenBy: caption.chosenBy.map((chooser) => chooser.getName()),
      };
    });
  }

  isDrawingSubmitted() {
    return this.drawingSubmitted;
  }

  hasPlayerSubmittedCaption(player) {
    return !!this.captions.find((caption) => caption.player === player);
  }

  hasPlayerChosenCaption(player) {
    return !!this.captions.find((caption) => caption.chosenBy.includes(player));
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
    // record who chose what caption, return an object describing points arising from this choice
    this.log('chooseCaptionByText');
    const points = {};

    if (player !== this.artist && !this.hasPlayerChosenCaption(player)) {
      const chosenCaption = this.captions.find(
        (caption) => caption.text === captionText
      );
      chosenCaption.chosenBy.push(player);

      // 1000 points for a player that chooses the original prompt
      if (chosenCaption.player === this.artist) {
        points[player.getId()] = 1000;
      }

      // 200 points for the player who's caption is chosen (whether they're the artist or not)
      points[chosenCaption.player.getId()] = 200;
    }
    return points;
  }

  allPlayersChosen() {
    this.log('allPlayersChosen');
    const totalChoices = this.captions.reduce((acc, caption) => {
      return acc + caption.chosenBy.length;
    }, 0);
    return totalChoices === this.totalPlayers - 1; // artist doesn't choose
  }
}
