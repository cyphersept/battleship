const { CPU, Human } = require("./Player.js");
const { Ship } = require("./Ship.js");
require("../style.css");

(function Game() {
  const player = new Human();
  const opponent = new CPU();
  var turn;
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
  renderShipStatus(shipSet);

  const setListeners = () => {
    document.querySelector(".player2 .board").onclick = launchPlayerAttack;
    document.getElementById("start").onclick = start;
  };

  const start = () => {
    turn = player;
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

  // Attack the targeted tile against the CPU
  const launchPlayerAttack = (e) => {
    if (turn !== player) return;
    const coords = [e.target.dataset.x, e.target.dataset.y];
    const hitSuccess = player.board.receiveAttack(coords);
    updateHit(e.target, hitSuccess);
    turn = opponent;
    launchCPUAttack();
  };

  // Have the CPU target and attack a player tile
  const launchCPUAttack = () => {
    const coords = opponent.pickAttack(player.board);
    const hitSuccess = player.board.receiveAttack(coords);
    opponent.evaluateAttack(coords, hitSuccess, player.board); // Learn from attack
    // TO DO const target;
    updateHit(target, hitSuccess);
    turn = player;
  };

  // Generates tiles for board
  const renderBoard = (el, board) => {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < board.size; i++) {
      for (let j = 0; j < board.size; j++) {
        const tile = document.createElement("li");
        tile.classList.add("tile");
        tile.dataset.x = j;
        tile.dataset.y = i;
        fragment.appendChild(tile);
      }
    }
    el.appendChild(fragment);
  };

  // Displays ship list for both players
  const renderShipStatus = (list) => {
    const template = document.getElementById("ship-template");
    const p1Status = document.querySelector(".player1 .status");
    const p2Status = document.querySelector(".player2 .status");
    for (const [size, name] of list) {
      const ship1 = template.content.cloneNode(true);
      ship1.style.setProperty("--size", size);
      ship1.firstChild.textContent = name;
      const ship2 = ship1.cloneNode(true);
      p1Status.appendChild(ship1);
      p2Status.appendChild(ship2);
    }
  };

  // Displays ship tokens on boards
  const renderShips = (el, board) => {
    for (const [size, name] of board.ships) {
      const token = document.createElement("div");
      token.classList.add("ship-token");
      token.setAttribute("--size", size);
      token.dataset.name = name;

      el.appendChild(token);
    }
  };

  // Updates sunk markers on ship list
  const updateShips = (ships, board) => {
    for (let i = 0; i < ships.length; i++) {
      if (ships[i].sunk) {
        const playerName = board.parentNode.querySelector(".name").textContent;
        const shipStatus = board.querySelector(`.status:nth-child(${i})`);
        shipStatus.classList.add("sunk");
        updateMsg(playerName + ships[i].name + "was sunk!");
      }
    }
  };
  const renderShip = () => {};

  // Marks hit or miss on board
  const updateHit = (el, hitSuccess) => {
    if (hitSuccess) el.classList.add("hit");
    else el.classList.add("miss");
  };

  const updateMsg = (msg) => {
    const el = document.querySelector(".msg");
    el.textContent = msg;
  };

  // Randomize ship positions
  const randomize = () => {
    player.board.randomizeAllShips();
    opponent.board.randomizeAllShips();
  };

  // Clears all states
  const reset = () => {
    //TODO: RESET BOARDS
    const toClear = ["hit", "miss", "sunk", "disabled"];
    for (const tag of toClear) {
      const els = document.querySelectorAll("." + tag);
      els.forEach((el) => {
        el.classList.remove(tag);
      });
    }
  };

  return { init };
})();
