function rollDice(sides){
    return Math.floor(Math.random() * sides + 1)
}

function rollRange(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function weightedChoice(events, size, weights) {
  if (weights != null) {
    if (events.length !== weights.length) {
      throw Error("Events and weights must have the same length.");
    }

    if (weights.some(weight => weight < 0)) {
      throw Error("Weights cannot contain negative values.");
    }
  } else{
    if (weights.length === 0) {
      // If no weights are provided, assign equal weights
      weights = new Array(events.length).fill(1);
    }
  }

  const choices = []


  for (let i = 0; i < size; i++) {
    let totalWeight = 0;
    const random = Math.random() * weights.reduce((a, b) => a + b, 0);

    for (let j = 0; j < events.length; j++) {
      totalWeight += weights[j];
      if (random < totalWeight) {
        choices.push(events[j]);
        break;
      }
    }
  }

  return choices;
}

function weightedChoiceRemoved(events, size, weights) {
  let eventsCopy = events.slice();
  let weightsCopy = (weights != null) ? weights.slice() : new Array(events.length).fill(1);
  if (eventsCopy.length !== weightsCopy.length) {
    throw Error("Events and weights must have the same length.");
  }

  if (weightsCopy.some(weight => weight < 0)) {
    throw Error("Weights cannot contain negative values.");
  }

  const choices = [];

  // Limit the size to the number of available events
  size = Math.min(size, eventsCopy.length);

  for (let i = 0; i < size; i++) {
    if (eventsCopy.length === 0) {
      // If there are no more events to choose from, break out of the loop.
      break;
    }

    let totalWeight = 0;
    const random = Math.random() * weightsCopy.reduce((a, b) => a + b, 0);

    for (let j = 0; j < eventsCopy.length; j++) {
      totalWeight += weightsCopy[j];
      if (random < totalWeight) {
        choices.push(eventsCopy[j]);
        // Remove the selected event and its weight from the copies
        eventsCopy.splice(j, 1);
        weightsCopy.splice(j, 1);
        break;
      }
    }
  }

  return choices;
}

module.exports = {weightedChoice,weightedChoiceRemoved, rollDice}