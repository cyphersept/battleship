const Board = require("./Board.js");

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
  constructor(name = "CPU") {
    super(name);
    this.plans = [];
    this.searchArea = [];
  }

  // Pick a square to attack based on known information
  pickAttack(opponentBoard) {
    if (this.searchArea.length == 0) return this.#randomAttack(opponentBoard);
    else return this.#smartAttack(opponentBoard);
  }

  // Selects a random, unattacked coordinate to attack
  #randomAttack(opponentBoard) {
    let validTarget = false;
    while (!validTarget) {
      const coord = opponentBoard.randomCoord();
      validTarget = opponentBoard.beenAttacked(coord) ? false : coord;
    }
    return validTarget;
  }

  // Selects a coordinate next to a known hit
  #smartAttack(opponentBoard) {
    let validTarget = false;
    // // Pick a random unattacked coordinate from the plan list
    // while (!validTarget) {
    //   const i = Math.floor(Math.random() * this.plans.length);
    //   const j = Math.floor(Math.random() * this.plans[i].length);
    //   if (!opponentBoard.beenAttacked(this.plans[i][j]))
    //     validTarget = this.plans[i][j];

    //   // Remove chosen coordinate from plans
    //   this.plans[i].splice(j, 1);

    //   // Remove cluster from plans if all coordinates have been chosen
    //   if (this.plans[i].length == 0) this.plans.splice(i, 1);
    // }
    // return validTarget;

    while (!validTarget) {
      const i = Math.floor(Math.random() * this.searchArea.length);
      const searchCoord = this.searchArea[i];
      const delta = this.#distanceToAdjacentHit(searchCoord);
      const nextInStreak = delta
        ? [delta[0] + searchCoord[0], delta[1] + searchCoord[1]]
        : false;

      // If a streak has been found, continue it
      if (nextInStreak) {
        if (
          opponentBoard.coordInBounds(nextInStreak) &&
          !opponentBoard.beenAttacked(nextInStreak)
        ) {
          validTarget = nextInStreak;
        }
      }
      // Else target a random valid adjacent tile
      else {
        const adjacent = opponentBoard.adjacentSquares(searchCoord);
        const valid = adjacent.filter(
          (adjCoord) => !opponentBoard.beenAttacked(adjCoord)
        );
        const j = Math.floor(Math.random() * valid.length);
        validTarget = valid[j];
      }
    }
    return validTarget;
  }

  // Identifies direction of nearest adjacent hit
  #distanceToAdjacentHit(coord) {
    for (let i = 0; i < this.searchArea.length; i++) {
      const xDif = coord[0] - this.searchArea[i][0];
      const yDif = coord[1] - this.searchArea[i][1];
      if (Math.abs(xDif) + Math.abs(yDif) === 1) return [xDif, yDif];
    }
    return false;
  }

  // Makes plans based on information gained from attack
  evaluateAttack(coord, hit, opponentBoard) {
    //   if (hit) {
    //     const adjacent = opponentBoard.adjacentSquares(coord);
    //     const ship = opponentBoard.shipAt(coord);

    //     // Remembers adjacent squares of successful attack
    //     this.plans.push(adjacent);

    //     // If a ship was sunk, removes its cluster from the attack plans
    //     if (ship.sunk) {
    //       for (const sunkCoord of ship.position) {
    //         for (let i = 0; i < this.plans.length; i++) {
    //           if (opponentBoard.arrsMatch(sunkCoord, this.plans[i]))
    //             this.plans.splice(i, 1);
    //         }
    //       }
    //     }
    //   }
    // }
    if (hit) {
      const ship = opponentBoard.shipAt(coord);
      this.searchArea.push(coord);
      if (!ship.sunk) return;

      // Remove positions of sunken ships from search area
      for (const sunkCoord of ship.position) {
        for (let i = 0; i < this.searchArea.length; i++) {
          if (opponentBoard.arrsMatch(sunkCoord, this.searchArea[i]))
            this.searchArea.splice(i, 1);
        }
      }
    }
  }
}

module.exports = { CPU, Human, Player };
