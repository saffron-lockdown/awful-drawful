import { createLogger } from './logger';

const PHASES = {
  LOBBY: 'LOBBY',
  DRAW: 'DRAW',
  CAPTION: 'CAPTION',
  GUESS: 'GUESS',
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

function allDrawingsIn(round) {
  return round.every((subRound) => subRound.drawingSubmitted);
}

// return a plan of the game based on the number
// of rounds and players.
// each round has one object per player. The object contains
// the player id, prompt, and spaces for the image and captions.
function gameplan(players, nRounds) {
  // Prompts are ensured to be unique over the whole game
  const prompts = getUniquePrompts(Object.keys(players).length * nRounds);
  const rounds = [];

  for (let i = 0; i < nRounds; i += 1) {
    const round = [];

    players.forEach((player) => {
      // shape of a subRound
      round.push({
        player,
        prompt: prompts.pop(),
        drawing: null,
        drawingSubmitted: false,
        captions: [], // will be submitting_player: caption
      });
    });
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
    this.captionRoundNum = 0; // defines which drawing is currently being captioned/voted on
    this.nRounds = 3;
    this.log = createLogger(this.id);
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

  // get the prompt for a specific player for the current round
  getPrompt(player) {
    this.log('getPrompt');
    const round = this.getCurrentRound();
    if (!round) {
      return null;
    }
    return round.find((subRound) => subRound.player === player).prompt;
  }

  // get the current drawing to be either captioned or guessed for the current subRound
  getViewDrawing() {
    this.log('getViewDrawing');
    const round = this.getCurrentRound();
    if (!round) {
      return null;
    }

    const subRound = round[this.captionRoundNum];
    return subRound.drawing;
  }

  // get the captions from the current subRound
  getCaptions() {
    this.log('getCaptions');
    const round = this.getCurrentRound();
    if (!round) {
      return null;
    }

    const subRound = round[this.captionRoundNum];
    return subRound.captions;
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
      return round.find((subRound) => subRound.player === player)
        .drawingSubmitted;
    }
    if (phase === PHASES.CAPTION) {
      const subRound = round[this.captionRoundNum];
      return !!subRound.captions.find(
        (caption) => caption.playerId === player.getId()
      );
    }
    // otherwise PHASE.GUESS
    const subRound = round[this.captionRoundNum];

    // player is waiting if they have selected a caption
    return subRound.captions.find((caption) =>
      caption.chosenBy.includes(player.getId())
    );
  }

  start() {
    this.gameplan = gameplan(this.players, this.nRounds);
    this.log('starting game');
    this.log(this.gameplan);
    this.startDrawingPhase();
  }

  startDrawingPhase() {
    this.phase = PHASES.DRAW;

    // send each player their prompt
    this.sync();
  }

  // submit a drawing for a player in the current round
  postDrawing(player, drawing) {
    const round = this.getCurrentRound();
    const subRound = round.find((r) => r.player === player);
    subRound.drawing = drawing;
    subRound.drawingSubmitted = true;

    this.log(`wow ${player.getId().substring(1, 6)}, thats beautiful!`);
    if (allDrawingsIn(round)) {
      this.log('all the artwork has been collected');
      this.startCaptioningPhase();
    }
  }

  startCaptioningPhase() {
    this.phase = PHASES.CAPTION;
    this.log('Time to caption these masterpieces!');

    this.sync();
    // this.captionRoundNum += 1;
  }

  // submit a caption for a player in the current subRound
  postCaption(player, caption) {
    const round = this.getCurrentRound();
    const subRound = round[this.captionRoundNum];

    subRound.captions.push({
      playerId: player.getId(),
      caption,
      chosenBy: [], // ids of the players who choose this caption
    });

    if (this.allCaptionsIn(subRound)) {
      this.log('all captions are in: ', subRound.captions);
      this.startGuessingPhase();
    }
  }

  allCaptionsIn(subRound) {
    return subRound.captions.length === this.players.length;
  }

  startGuessingPhase() {
    this.phase = PHASES.GUESS;
    this.log('Guess the correct caption!');

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
