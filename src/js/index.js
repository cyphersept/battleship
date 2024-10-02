const { CPU, Human } = require("./Player.js");
const { Ship } = require("./Ship.js");
import "../style.css";

(function Game() {
  const player = new Human();
  const opponent = new CPU();
  const shipSet = [
    [5, "Carrier"],
    [4, "Battleship"],
    [3, "Cruiser"],
    [3, "Submarine"],
    [2, "Destroyer"],
  ];

  // Randomly place ships on both boards
  for (const [size, name] of shipSet) {
    player.board.placeShip(new Ship(size, 0, name));
    opponent.board.placeShip(new Ship(size, 0, name));
  }

  setListeners();
  const setListeners = () => {
    document.querySelector(".player1 .board").onclick = getCoord;
    document.querySelector(".player2 .board").onclick = getCoord;
  };

  const getCoord = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const maxX = e.target.clientWidth;
    const maxY = e.target.clientY;
    const coords = [Math.round((x * 10) / maxX), Math.round((y * 10) / maxY)];
    console.log(coords);
    return coords;
  };
  return { init };
})();
