export class SubRound {
  constructor(totalPlayers, artist, prompt) {
    this.totalPlayers = totalPlayers;
    this.artist = artist;
    this.prompt = prompt;
    this.drawing = null;
    this.drawingSubmitted = false;
    this.captions = [];
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
  }

  allCaptionsIn() {
    return this.captions.length === this.totalPlayers;
  }

  chooseCaptionByText(playerId, captionText) {
    const chosenCaption = this.captions.find(
      (caption) => caption.text === captionText
    );
    chosenCaption.chosenBy.push(playerId);
  }

  allPlayersChosen() {
    const totalChoices = this.captions.reduce((acc, caption) => {
      return acc + caption.chosenBy.length;
    }, 0);
    return totalChoices === this.totalPlayers;
  }
}
