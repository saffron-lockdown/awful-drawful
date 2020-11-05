import { Caption } from './caption';

export class SubRound {
  constructor(totalPlayers, artist, prompt) {
    this.totalPlayers = totalPlayers;
    this.artist = artist;
    this.prompt = prompt;
    this.drawing = null;
    this.drawingSubmitted = false;
    // Initialise the captions to be the initial prompt
    this.captions = [new Caption(this.artist.getId(), this.prompt)];
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
    return !!this.captions.find(
      (caption) => caption.playerId === player.getId()
    );
  }

  hasPlayerChosenCaption(player) {
    return (
      player === this.artist ||
      !!this.captions.find((caption) =>
        caption.chosenBy.includes(player.getId())
      )
    );
  }

  submitDrawing(drawing) {
    this.drawing = drawing;
    this.drawingSubmitted = true;
  }

  submitCaption(caption) {
    this.captions.push(caption);
    this.captions.sort(() => Math.random() - 0.5);
  }

  allCaptionsIn() {
    return this.captions.length === this.totalPlayers;
  }

  chooseCaptionByText(playerId, captionText) {
    if (playerId !== this.artist.getId()) {
      const chosenCaption = this.captions.find(
        (caption) => caption.text === captionText
      );
      chosenCaption.chosenBy.push(playerId);
    }
  }

  allPlayersChosen() {
    const totalChoices = this.captions.reduce((acc, caption) => {
      return acc + caption.chosenBy.length;
    }, 0);
    return totalChoices === this.totalPlayers - 1; // artist doesn't choose
  }
}
