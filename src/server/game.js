// return a plan of the game based on the number
// of rounds and players.
// each round has one object per player. The object contains
// the player id, prompt, and spaces for the image and captions.
function gameplan(players, nRounds) {
  // Prompts are ensured to be unique over the whole game
  var prompts = getUniquePrompts(Object.keys(players).length * nRounds);

  var rounds = [];
  var i;
  for (i = 0; i < nRounds; i++) {
    var round = [];
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
  constructor(roomId, players) {
    this.roomId = roomId;
    this.players = players;
    this.stage = 'draw'; // draw, caption, vote, standings, etc
    this.nRounds = 3;
    this.gameplan = gameplan(this.players, this.nRounds);
  }

  // return player names as a string to display
  playerNames() {
    var id;
    var result = '';
    for (id in this.players) {
      result += this.players[id].name + ',\n';
    }

    return result;
  }

  draw(round) {
    var i;
    for (i = 0; i < this.players.length; i++) {
      console.log(
        'sent prompt ' + prompts[i] + ' to player ' + this.players[i] // TODO
      );
    }
  }
}

// Return a list of n unique prompts
export function getUniquePrompts(nPrompts) {
  var prompts = [];

  while (prompts.length < nPrompts) {
    const newPrompt = getPrompt();

    if (!prompts.includes(newPrompt)) {
      prompts.push(newPrompt);
    }
  }

  return prompts;
}

// Return a random prompt
export function getPrompt() {
  var descriptions = ['man-eating', 'hairless', 'cardboard', 'vegan'];
  var nouns = ['bicycle', 'yoghurt', 'cloud', 'Harry Potter'];
  return randomChoice(descriptions) + ' ' + randomChoice(nouns);
}

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}
