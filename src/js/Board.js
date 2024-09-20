class Board {
  constructor(size = 10) {
    this.ships = [];
    this.size = size;
  }
  #attacked = [];
  #occupied() {
    return this.ships.reduce(
      (result, ship) => result.concat(ship.position),
      []
    );
  }

  placeShip(ship, position) {
    const positionValid = this.#validateShipPos(ship, position);
    if (positionValid) {
      ship.setPosition(position);
      this.ships.push(ship);
    }
    return positionValid;
  }
  receiveAttack(atkCoord) {
    if (this.beenAttacked(atkCoord) || !this.#coordInBounds(atkCoord))
      return undefined;
    let hit = false;
    this.#attacked.push(atkCoord);
    for (const ship of this.ships) {
      for (const shipCoord of ship.position) {
        if (this.arrsMatch(atkCoord, shipCoord)) {
          ship.hit();
          hit = true;
          break;
        }
      }
    }
    return hit;
  }

  beenAttacked(coord) {
    return !!this.#attacked.find((el) => this.arrsMatch(coord, el));
  }

  allSunk() {
    return this.ships.every((ship) => ship.sunk);
  }
  randomCoord() {
    return [
      Math.floor(Math.random() * this.size),
      Math.floor(Math.random() * this.size),
    ];
  }

  // Lists squares adjacent to a coordinate
  adjacentSquares([x, y]) {
    const arr = [];
    if (x - 1 >= 0) arr.push([x - 1, y]);
    if (y - 1 >= 0) arr.push[(x, y - 1)];
    if (x + 1 < this.size) arr.push([x + 1, y]);
    if (y + 1 < this.size) arr.push([x, y + 1]);
    return arr;
  }

  arrsMatch(arr1, arr2) {
    const match1 = arr1.every((el) => arr2.includes(el));
    const match2 = arr2.every((el) => arr1.includes(el));
    return match1 && match2;
  }

  // Checks if a coordinate is on the board
  #coordInBounds(coordPair) {
    return coordPair.every((n) => n >= 0 && n < this.size);
  }

  // Checks if a ship can be placed at a set of coordinates
  #validateShipPos(ship, position) {
    // All position coordinates are within board's boundaries
    const inBounds = position.every((el) => this.#coordInBounds(el));

    // Every coordinate is within 1 space of another (no diagonals)
    const continuous = position.every(([x1, y1]) =>
      position.some(
        ([x2, y2]) =>
          (Math.abs(x1 - x2) == 1 && y1 == y2) ||
          (Math.abs(y1 - y2) == 1 && x1 == x2)
      )
    );

    // No position overlaps another ship's coordinates
    const noOverlap = position.every(([x1, y1]) =>
      // Every coordinate must either belong to the same ship, or have a different x or y
      this.ships.every((comparedShip) =>
        comparedShip.position.every(
          ([x2, y2]) => Object.is(ship, comparedShip) || x1 !== x2 || y1 !== y2
        )
      )
    );

    return inBounds && continuous && noOverlap;
  }
}

module.exports = Board;
