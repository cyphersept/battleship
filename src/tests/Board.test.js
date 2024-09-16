const Board = require("../js/Board.js");
const Ship = require("../js/Ship.js");
const defaultTest = {
  ship: () => new Ship(3),
  board: () => new Board(),
  pos: [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
};
let myShip, myBoard;
reset();

// Resets values after each test
function reset() {
  myShip = defaultTest.ship();
  myBoard = defaultTest.board();
  myBoard.placeShip(myShip, defaultTest.pos);
}

afterEach(() => reset());

describe("places ship on board", () => {
  it("place ship at coordinates", () => {
    expect(myBoard.ships[0].position).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
  });
  it("matches coordinates and ship length", () => {
    expect(myBoard.ships[0].position.length).toBe(myShip.length);
  });
  // it("does not exceed board size", () => {});
});

describe("receives attack at coordinate", () => {
  describe("attack hit", () => {
    const coord = myBoard.ships[0].position[0];
    it("ship is hit", () => {
      const didHit = myBoard.receiveAttack(coord);
      expect(didHit).toBe(true);
    });
    it("ship registers hit", () => {
      myBoard.receiveAttack(coord);
      expect(myShip.hits).toBe(1);
    });
  });
  describe("attack missed", () => {
    const coord = [1, 2];
    const didHit = myBoard.receiveAttack(coord);
    it("ship is not hit", () => {
      expect(didHit).toBe(false);
    });
  });
  describe("logs attack location", () => {
    it("was attacked", () => {
      const coord = [0, 0];
      myBoard.receiveAttack(coord);
      expect(myBoard.beenAttacked(coord)).toBe(true);
    });
    it("not attacked", () => {
      expect(myBoard.beenAttacked([0, 0])).toBe(false);
    });
  });
});

describe("reports all ship sunk", () => {
  it("not all sunk", () => {
    expect(myBoard.allSunk()).toBe(false);
  });

  it("all sunk", () => {
    for (const coord of myBoard.ships[0].position) {
      myBoard.receiveAttack(coord);
    }
    expect(myBoard.allSunk()).toBe(true);
  });
});

describe("helper functions", () => {
  it("checks if arrays are equal", () => {
    expect(
      myBoard.arrsMatch(myBoard.ships[0].position, myBoard.ships[0].position)
    ).toBe(true);
  });
});
