const Board = require("../js/Board.js");
const { CPU, Human, Player } = require("../js/Player.js");

let myPlayer = new Player();
let myCPU = new CPU();
let myHuman = new Human();
let someBoard = new Board();

beforeEach(() => {
  myPlayer = new Player();
  myCPU = new CPU();
  myHuman = new Human();
  someBoard = new Board();
});

beforeEach(() => {
  jest.spyOn(global.Math, "random").mockReturnValue(0.75);
});

afterEach(() => {
  jest.spyOn(global.Math, "random").mockRestore();
});

it("generates board for player", () => {
  expect(myPlayer.board.prototype).toEqual(someBoard.prototype);
});

describe("correct class inheritance", () => {
  it("CPU extends player", () => {
    expect(myCPU.prototype).toEqual(myPlayer.prototype);
  });
  it("Human extends player", () => {
    expect(myHuman.prototype).toEqual(myPlayer.prototype);
  });
});

describe("CPU attack AI", () => {
  it("targets random valid square", () => {
    const atk = myCPU.pickAttack(myHuman.board);
    expect(myHuman.board.receiveAttack(atk)).not.toBe(undefined);
  });
  it("targets nearby squares on hit", () => {
    const atk = [0, 0];
    const mockOutcome = true;
    myCPU.evaluateAttack(atk, mockOutcome, myHuman.board);
    expect(myCPU.pickAttack(myHuman.board)).toEqual([0, 1]);
  });
});
