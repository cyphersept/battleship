class Player {
  constructor(name) {
    this.board = new Board();
    this.name = name;
  }
}

class CPUPlayer extends Player {
  constructor(name) {
    super(name);
  }
}
