const Board = require("../js/Board.js");

class Player {
  constructor(name = "Player") {
    this.board = new Board();
    this.name = name;
  }
}

class Human extends Player {
  constructor(name) {
    super(name);
  }
}

class CPU extends Player {
  constructor(name) {
    super(name);
    this.plans = [];
  }

  // Pick a square to attack based on known information
  pickAttack(opponentBoard) {
    if (this.plans.length == 0) return this.#randomAttack(opponentBoard);
    else return this.#smartAttack(opponentBoard);
  }

  // Selects a random, unattacked coordinate to attack
  #randomAttack(opponentBoard) {
    let validTarget = false;
    while (!validTarget) {
      const coord = opponentBoard.randomCoord();
      validTarget = opponentBoard.beenAttacked(coord) ? false : coord;
    }
    console.log(validTarget);
    return validTarget;
  }

  // Selects a coordinate next to a known hit
  #smartAttack(opponentBoard) {
    let validTarget = false;
    // Pick a random unattacked coordinate from the plan list
    while (!validTarget) {
      const i = Math.floor(Math.random() * this.plans.length);
      const j = Math.floor(Math.random() * this.plans[i].length);
      if (!opponentBoard.beenAttacked(this.plans[i][j]))
        validTarget = this.plans[i][j];
      // Remove chosen coordinate from plans
      this.plans[i].splice([j], 1);
      // Remove cluster from plans if all coordinates have been chosen
      if (this.plans[i].length == 0) this.plans.splice(i, 1);
    }
    return validTarget;
  }

  // Makes plans based on information gained from attack
  evaluateAttack(coord, outcome, opponentBoard) {
    if (outcome) {
      this.plans.push(opponentBoard.adjacentSquares(coord));
    }
  }
}

module.exports = { CPU, Human, Player };
