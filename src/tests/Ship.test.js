const Ship = require("../js/Ship.js");

describe("create ship with length, hits, sunk", () => {
  it("ship 1", () => {
    const myShip = new Ship(5);
    expect(myShip.length).toBe(5);
  });
  it("ship 2", () => {
    const myShip = new Ship(4);
    expect(myShip.length).toBe(4);
  });
});

describe("hits the ship", () => {
  it("increase hit count by 1", () => {
    const myShip = new Ship(5);
    expect(myShip.hit()).toBe(1);
  });
  it("sinks ships with enough hits", () => {
    const myShip = new Ship(5, 4);
    expect(myShip.hit()).toBe(5);
    expect(myShip.sunk).toBe(true);
  });
});
