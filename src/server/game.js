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
  let i;
  for (i = 0; i < nRounds; i += 1) {
    const round = [];

    var player;
    for (player in players) {
      round.push({
        player: player,
        prompt: prompts.pop(),
        image: '',
        captions: {}, // will be submitting_player: caption
      });
    }

    rounds.push(round);
  }
  return rounds;
}

export class Game {
  constructor(gameId) {
    this.gameId = gameId;
    this.players = [];
    this.stage = 'draw'; // draw, caption, vote, standings, etc
    this.nRounds = 3;
    this.gameplan = gameplan(this.players, this.nRounds); // TODO this needs to be done once game is started, not while players are joining
  }

  addPlayer(id) {
    this.players.push(id);
  }

  draw() {
    // TODO
    let i;
    for (i = 0; i < this.players.length; i += 1) {
      console.log(
        `sent prompt to player ${this.players[i]}` // TODO
      );
    }
  }
}
