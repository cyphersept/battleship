class Ship {
  constructor(length, initialHits = 0, name = "Ship") {
    this.length = length;
    this.hits = initialHits;
    this.sunk = false;
    this.position = null;
    this.name = name;
  }

  hit() {
    this.hits++;
    this.sunk = this.#isSunk();
    return this.hits;
  }

  setPosition(position) {
    this.position = position;
  }

  reset() {
    this.hits = 0;
    this.sunk = false;
    this.position = null;
  }

  isVertical() {
    return this.position[0][0] == this.position[1][0] - 1 ? 0 : 1;
  }

  #isSunk() {
    // console.log("Length " + this.length + " boat hit " + this.hits + " times");
    const status = this.hits >= this.length;
    return status;
  }
}

module.exports = { Ship };
