function getPrompt() {
  var descriptions = ['man-eating', 'hairless', 'cardboard', 'vegan'];
  var nouns = ['bicycle', 'yoghurt', 'cloud', 'Harry Potter'];
  return randomChoice(descriptions) + ' ' + randomChoice(nouns);
}

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

module.exports = getPrompt;
