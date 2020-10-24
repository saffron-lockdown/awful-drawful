import { createLogger } from './logger';

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
function gameplan(players, nRounds) {
  // Prompts are ensured to be unique over the whole game
  const prompts = getUniquePrompts(Object.keys(players).length * nRounds);
  const rounds = [];

  for (let i = 0; i < nRounds; i += 1) {
    const round = {};

    players.forEach((player) => {
      round[player.id] = {
        player,
        prompt: prompts.pop(),
        drawing: '',
        captions: {}, // will be submitting_player: caption
      };
    });
    rounds.push(round);
  }
  return rounds;
}

export class Game {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.roundNum = 0; // defines which round is currently being played
    this.captionRoundNum = 0; // defines which drawing is currently being captioned/voted on
    this.nRounds = 3;
    this.log = createLogger(this.id);
  }

  addPlayer(player) {
    this.players.push(player);
  }

  // emit a message to all players in a game
  emit(tag, message) {
    this.players.forEach((player) => {
      player.emit(tag, message);
    });
  }

  // output a list of all the players in the specified game
  listPlayers() {
    return this.players.map((player) => player.name).join(', ');
  }

  update() {
    this.emit('set-player-list', this.listPlayers());
  }

  start() {
    this.gameplan = gameplan(this.players, this.nRounds);
    console.log(this.gameplan);
    this.startDrawingPhase();
  }

  startDrawingPhase() {
    // send each player their prompt
    const round = this.gameplan[this.roundNum];
    Object.values(round).forEach((element) => {
      element.player.emit('set-prompt', element.prompt);
    });
  }

  postDrawing(player, drawing) {
    const round = this.gameplan[this.roundNum];
    round[player.id].drawing = drawing;

    console.log(`wow ${player.id.substring(1, 6)}, thats beautiful!`);
    if (this.allDrawingsIn()) {
      console.log('all the artwork has been collected');
      this.startCaptioningPhase();
    }
  }

  allDrawingsIn() {
    const round = this.gameplan[this.roundNum];

    return Object.values(round).every((element) => {
      return element.drawing !== '';
    });
  }

  startCaptioningPhase() {
    console.log('Time to caption these masterpieces!');

    const round = this.gameplan[this.roundNum];
    const submittingPlayer = Object.keys(round)[this.captionRoundNum];
    const element = round[submittingPlayer];

    this.emit('update-feed', element.drawing);
    this.captionRoundNum += 1;
  }
}
