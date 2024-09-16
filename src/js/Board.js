class Board {
  constructor() {
    this.ships = [];
  }
  #attacked = [];

  placeShip(ship, position) {
    this.ships.push({ ship, position });
  }
  receiveAttack(atkCoord) {
    this.#attacked.push(atkCoord);
    let hit = false;
    for (const ship of this.ships) {
      for (const shipCoord of ship.position) {
        if (this.arrsMatch(atkCoord, shipCoord)) {
          ship.ship.hit();
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
    return this.ships.every((sh) => sh.ship.sunk);
  }
  arrsMatch(arr1, arr2) {
    const match = arr1.every((el) => arr2.includes(el));
    return match;
  }
}

module.exports = Board;
