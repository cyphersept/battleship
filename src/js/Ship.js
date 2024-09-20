class Ship {
  constructor(length, initialHits = 0) {
    this.length = length;
    this.hits = initialHits;
    this.sunk = false;
    this.position = null;
  }

  hit() {
    this.hits++;
    this.sunk = this.#isSunk();
    return this.hits;
  }

  setPosition(position) {
    this.position = position;
  }

  #isSunk() {
    // console.log("Length " + this.length + " boat hit " + this.hits + " times");
    const status = this.hits >= this.length;
    return status;
  }
}

module.exports = Ship;
