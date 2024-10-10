const { CPU, Human } = require("./Player.js");
const { Ship } = require("./Ship.js");
require("../style.css");

function Game() {
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

  const init = () => {
    // Randomly place ships on both boards
    for (const [size, name] of shipSet) {
      const currShip = new Ship(size, 0, name);
      player.board.placeShip(currShip);
      console.log(currShip.name + " placed at " + currShip.position);
    }
    for (const [size, name] of shipSet) {
      const currShip = new Ship(size, 0, name);
      opponent.board.placeShip(currShip);
    }

    renderBoard(document.querySelector(".player1 .board"), player.board);
    renderBoard(document.querySelector(".player2 .board"), opponent.board);
    renderShips(document.querySelector(".player1 .board"), player.board);
    renderShips(document.querySelector(".player2 .board"), opponent.board);
    setListeners();
    renderShipStatus(shipSet);
  };

  const setListeners = () => {
    document.querySelector(".player2 .board").onclick = launchPlayerAttack;
    document.getElementById("start").onclick = start;
    document.getElementById("random").onclick = randomize;
  };

  const start = () => {
    turn = player;
    updateMsg(player.name + "'s turn: choose a tile to attack");
    document.querySelector(".preparing").classList.remove("preparing");
  };

  const getCoords = (el) => {
    return [parseInt(el.dataset.x), parseInt(el.dataset.y)];
  };

  // Attack the targeted tile against the CPU
  const launchPlayerAttack = (e) => {
    // Forbids attacks if not on player's turn
    if (turn !== player) return;
    const coords = getCoords(e.target);
    const hitSuccess = opponent.board.receiveAttack(coords);

    // Cancels invalid attacks
    if (hitSuccess === undefined) return;

    // Updates game
    const status = hitSuccess ? "Hit" : "Miss";
    updateHit(e.target, hitSuccess);
    updateMsg(
      `${player.name} attacked ${coordName(coords)}. ${status}!\n${
        opponent.name
      } is thinking...`
    );
    turn = opponent;
    launchCPUAttack();
  };

  // Have the CPU target and attack a player tile
  const launchCPUAttack = async () => {
    // Launch and learn from attack
    await wait(1000);
    const coords = opponent.pickAttack(player.board);
    const hitSuccess = player.board.receiveAttack(coords);
    opponent.evaluateAttack(coords, hitSuccess, player.board);

    // Updates game
    const target = document.querySelector(
      `[data-x="${coords[0]}"][data-y="${coords[1]}"]`
    );
    const status = hitSuccess ? "Hit" : "Miss";
    updateHit(target, hitSuccess);
    updateMsg(
      `${opponent.name} attacked ${coordName(coords)}. ${status}!\n${
        player.name
      }'s turn:'`
    );
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
    const p1Status = document.querySelector(".player1 .list");
    const p2Status = document.querySelector(".player2 .list");
    for (const [size, name] of list) {
      const ship1 = template.content.cloneNode(true);
      ship1.querySelector(".ship-name").textContent = name;
      const ship2 = ship1.cloneNode(true);
      p1Status.appendChild(ship1);
      p2Status.appendChild(ship2);
      p1Status.lastElementChild.style.setProperty("--size", size);
      p2Status.lastElementChild.style.setProperty("--size", size);
    }
  };

  // Displays ship tokens on boards
  const renderShips = (el, board) => {
    for (const ship of board.ships) {
      renderShip(el, ship);
    }
  };

  // Renders token for a single ship
  const renderShip = (el, ship) => {
    const token = document.createElement("div");
    token.classList.add("ship-token");
    token.dataset.name = ship.name;
    el.appendChild(token);
    el.lastElementChild.style.setProperty("--size", ship.length);
    el.lastElementChild.style.setProperty("--vertical", ship.isVertical());
    el.lastElementChild.style.setProperty("--x", ship.position[0][0]);
    el.lastElementChild.style.setProperty("--y", ship.position[0][1]);
  };

  // Updates sunk markers on ship list
  const updateShips = (board) => {
    for (let i = 0; i < board.ships.length; i++) {
      if (board.ships[i].sunk) {
        const playerName = board.parentNode.querySelector(".name").textContent;
        const shipStatus = board.querySelector(`.status:nth-child(${i})`);
        shipStatus.classList.add("sunk");
        updateMsg(playerName + board.ships[i].name + "was sunk!", "concat");
      }
    }
  };

  // Translates coordinate pair to battleship board labels
  const coordName = ([x, y]) => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    return rows[y] + (x + 1);
  };

  // Marks hit or miss on board
  const updateHit = (el, hitSuccess) => {
    if (hitSuccess) el.classList.add("hit");
    else el.classList.add("miss");
  };

  // Changes message displayed to player
  const updateMsg = (msg, concatMode = false) => {
    const el = document.querySelector(".msg");
    el.textContent = concatMode ? el.textContent + msg : msg;
  };

  // Randomize ship positions
  const randomize = () => {
    // Delete ship tokens from board
    const oldTokens = document.querySelectorAll(".ship-token");
    for (const el of oldTokens) el.remove();

    // Render tokens at new ship positions
    player.board.randomizeAllShips();
    opponent.board.randomizeAllShips();
    renderShips(document.querySelector(".player1 .board"), player.board);
    renderShips(document.querySelector(".player2 .board"), opponent.board);
  };

  const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  // Clears all states
  const reset = () => {
    // Remove hit/miss markings from tiles and status
    const toClear = ["hit", "miss", "sunk", "disabled"];
    for (const tag of toClear) {
      const els = document.querySelectorAll("." + tag);
      els.forEach((el) => {
        el.classList.remove(tag);
      });
    }
    // Randomize ship positions
    this.randomize();
  };

  return { init };
}

Game().init();
