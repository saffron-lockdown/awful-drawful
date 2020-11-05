import { Caption } from './caption';

export class SubRound {
  constructor(totalPlayers, artist, prompt) {
    this.totalPlayers = totalPlayers;
    this.artist = artist;
    this.prompt = prompt;
    this.drawing = null;
    this.drawingSubmitted = false;
    // Initialise the captions to be the initial prompt
    this.captions = [new Caption(this.artist, this.prompt)];
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
        playerName: caption.player.name,
        text: caption.text,
        chosenBy: caption.chosenBy.map((chooser) => chooser.name),
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
    return !!this.captions.find((caption) =>
      caption.chosenBy.includes(player.getId())
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

  chooseCaptionByText(player, captionText) {
    if (player !== this.artist) {
      const chosenCaption = this.captions.find(
        (caption) => caption.text === captionText
      );
      chosenCaption.chosenBy.push(player);
    }
  }

  allPlayersChosen() {
    const totalChoices = this.captions.reduce((acc, caption) => {
      return acc + caption.chosenBy.length;
    }, 0);
    return totalChoices === this.totalPlayers - 1; // artist doesn't choose
  }
}
