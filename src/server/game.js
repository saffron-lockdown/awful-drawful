export class Game {
  constructor(roomId, players) {
    this.roomId = roomId;
    this.players = players;
    this.stage = 'draw'; // draw, caption, vote, standings, etc
  }

  run() {}

  draw() {
    // send prompt to all devices
    for (player of this.players) {
      player.prompt = getPrompt();
    }
  }
}

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

export function getPrompt() {
  var descriptions = ['man-eating', 'hairless', 'cardboard', 'vegan'];
  var nouns = ['bicycle', 'yoghurt', 'cloud', 'Harry Potter'];
  return randomChoice(descriptions) + ' ' + randomChoice(nouns);
}

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}
