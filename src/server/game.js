export class Game {
  constructor(roomId, players) {
    this.roomId = roomId;
    this.players = players;
    this.stage = 'draw'; // draw, caption, vote, standings, etc
  }

  playerNames() {
    var id;
    var result = '';
    for (id in this.players) {
      result += this.players[id].name + ',\n';
    }

    return result;
  }

  // In development - not used
  draw() {
    const prompts = getUniquePrompts(this.players.length);

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
