import { Round } from './round';
import { SubRound } from './subRound';
import { createLogger } from './logger';

const PHASES = {
  LOBBY: 'LOBBY',
  DRAW: 'DRAW',
  CAPTION: 'CAPTION',
  GUESS: 'GUESS',
  REVEAL: 'REVEAL',
};

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

// Return a random prompt
export function getPrompt() {
  const descriptions = ['man-eating', 'hairless', 'cardboard', 'vegan'];
  const nouns = ['bicycle', 'yoghurt', 'cloud', 'Harry Potter'];
  return `${randomChoice(descriptions)} ${randomChoice(nouns)}`;
}

// Return a list of n unique prompts
export function getUniquePrompts(nPrompts) {
  const prompts = [];

  while (prompts.length < nPrompts) {
    const newPrompt = getPrompt();

    if (!prompts.includes(newPrompt)) {
      prompts.push(newPrompt);
    }
  }

  return prompts;
}

// return a plan of the game based on the number
// of rounds and players.
// each round has one object per player. The object contains
// the player id, prompt, and spaces for the image and captions.
export function gameplan(players, nRounds) {
  // Prompts are ensured to be unique over the whole game
  const prompts = getUniquePrompts(Object.keys(players).length * nRounds);
  const rounds = [];

  for (let i = 0; i < nRounds; i += 1) {
    // for each round, create a set of subRounds equal to the number of players/prompts
    const subRounds = players.map(
      (player, index) => new SubRound(players.length, player, prompts[index])
    );
    const round = new Round(subRounds);
    rounds.push(round);
  }
  return rounds;
}

export class Game {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.phase = PHASES.LOBBY; // defines which phase of the game we're in
    this.roundNum = 0; // defines which round is currently being played
    this.nRounds = 3;
    this.log = createLogger(this.id);
    this.timer = null;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => p !== player);
  }

  // output a list of all the players in the specified game
  listPlayers() {
    return this.players.map((player) => player.getName()).join(', ');
  }

  getPhase() {
    return this.phase;
  }

  getCurrentRound() {
    if (!this.gameplan) {
      return null;
    }
    return this.gameplan[this.roundNum];
  }

  getCurrentSubRound() {
    this.log('getCurrentSubRound');
    return this.getCurrentRound().getCurrentSubRound();
  }

  getTimeRemaining() {
    return this.timeRemaining;
  }

  // get the prompt for a specific player for the current round
  getPrompt(player) {
    this.log('getPrompt');
    const round = this.getCurrentRound();
    if (!round) {
      return null;
    }
    const subRound = round.getSubRoundByArtist(player);
    return subRound.getPrompt();
  }

  // get the current drawing to be either captioned or guessed for the current subRound
  getViewDrawing() {
    this.log('getViewDrawing');
    const round = this.getCurrentRound();
    if (!round) {
      return null;
    }
    return this.getCurrentSubRound().getDrawing();
  }

  // get the captions from the current subRound
  getCaptions() {
    this.log('getCaptions');
    const round = this.getCurrentRound();
    if (!round) {
      return null;
    }
    return round.getCurrentSubRound().getCaptions();
  }

  getRealPrompt() {
    this.log('getRealPrompt');
    const round = this.getCurrentRound();
    if (!round || this.getPhase() !== PHASES.REVEAL) {
      return null;
    }

    return round.getCurrentSubRound().getPrompt();
  }

  // returns true if the player has completed their actions for the current game phase
  isPlayerWaiting(player) {
    this.log('isPlayerWaiting');
    const round = this.getCurrentRound();
    if (!round) {
      return false;
    }
    const phase = this.getPhase();
    if (phase === PHASES.DRAW) {
      return round.getSubRoundByArtist(player).isDrawingSubmitted();
    }
    if (phase === PHASES.CAPTION) {
      return this.getCurrentSubRound().hasPlayerSubmittedCaption(player);
    }
    // otherwise PHASE.GUESS
    // player should wait if they have selected a caption
    return this.getCurrentSubRound().hasPlayerChosenCaption;
  }

  start() {
    this.gameplan = gameplan(this.players, this.nRounds);
    this.log('starting game');
    this.log(this.gameplan);
    this.startDrawingPhase();
  }

  startDrawingPhase() {
    this.phase = PHASES.DRAW;

    // start a 30 second timer
    this.timeRemaining = 30;
    this.sync();

    // this timer should be cancelled whenever starting a new phase
    this.timer = setInterval(() => {
      this.timeRemaining -= 1;
      this.sync();

      if (this.timeRemaining === 0) {
        this.startCaptioningPhase();
      }
    }, 1000);
  }

  // submit a drawing for a player in the current round
  postDrawing(player, drawing) {
    const round = this.getCurrentRound();
    const subRound = round.getSubRoundByArtist(player);
    subRound.submitDrawing(drawing);

    this.log(`wow ${player.getId().substring(1, 6)}, thats beautiful!`);
    if (round.allDrawingsIn()) {
      this.log('all the artwork has been collected');
      this.startCaptioningPhase();
    }
  }

  startCaptioningPhase() {
    // cancel any existing timers
    clearInterval(this.timer);
    this.phase = PHASES.CAPTION;
    this.log('Time to caption these masterpieces!');

    this.sync();
  }

  // submit a caption for a player in the current subRound
  postCaption(player, caption) {
    const subRound = this.getCurrentSubRound();
    subRound.submitCaption(caption);

    if (subRound.allCaptionsIn()) {
      this.log('all captions are in: ', subRound.captions);
      this.startGuessingPhase();
    }
  }

  startGuessingPhase() {
    this.phase = PHASES.GUESS;
    this.log('Guess the correct caption!');

    this.sync();
  }

  chooseCaption(player, captionText) {
    const subRound = this.getCurrentSubRound();
    subRound.chooseCaptionByText(player.getId(), captionText);

    if (subRound.allPlayersChosen()) {
      this.startRevealPhase();
    }
  }

  startRevealPhase() {
    this.phase = PHASES.REVEAL;
    this.log('revealing real prompt!');

    this.sync();
  }

  // syncs players state for all players in the game
  sync() {
    this.log('syncing all players, current game plan:');
    this.log(this.gameplan);
    this.players.forEach((player) => {
      player.sync();
    });
  }
}
