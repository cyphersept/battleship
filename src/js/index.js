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

    renderBoard(getBoardEl(player), player.board);
    renderBoard(getBoardEl(opponent), opponent.board);
    renderShips(getBoardEl(player), player.board);
    renderShips(getBoardEl(opponent), opponent.board);
    renderShipStatus(shipSet);
    setListeners();
  };

  const setListeners = () => {
    getBoardEl(opponent).onclick = launchPlayerAttack;
    document.getElementById("start").onclick = start;
    document.getElementById("random").onclick = randomize;
    document.querySelector(".modal button").onclick = reset;
    document
      .querySelector(".spotlight")
      .addEventListener("mousemove", followMouse);
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
    updateMsg(`${player.name} attacked ${coordName(coords)}. ${status}!`);
    updateMsg(`${opponent.name} is thinking...`, "concat");
    updateStatus(opponent);
    turn = opponent;
    launchCPUAttack();
  };

  // Have the CPU target and attack a player tile
  const launchCPUAttack = async () => {
    // Simulate thinking phase
    await wait(1000);

    // Launch and learn from attack
    const coords = opponent.pickAttack(player.board);
    const hitSuccess = player.board.receiveAttack(coords);
    opponent.evaluateAttack(coords, hitSuccess, player.board);

    // Updates game
    const target = document.querySelector(
      `[data-x="${coords[0]}"][data-y="${coords[1]}"]`
    );
    const status = hitSuccess ? "Hit" : "Miss";
    updateHit(target, hitSuccess);
    updateMsg(`${opponent.name} attacked ${coordName(coords)}. ${status}!`);
    updateMsg(`${player.name}'s turn:`, "concat");
    updateStatus(player);
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
      p1Status.lastElementChild.dataset.name = name;
      p2Status.lastElementChild.dataset.name = name;
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
    el.lastElementChild.setAttribute("draggable", "true");
    el.lastElementChild.style.setProperty("--size", ship.length);
    el.lastElementChild.style.setProperty("--vertical", ship.isVertical());
    el.lastElementChild.style.setProperty("--x", ship.position[0][0]);
    el.lastElementChild.style.setProperty("--y", ship.position[0][1]);
  };

  // Updates sunk markers on ship list
  const updateStatus = (targetPlayer) => {
    const board = targetPlayer.board;
    // Update status of newly sunk ships
    for (const currShip of board.ships) {
      if (currShip.sunk) {
        const playerEl = getBoardEl(targetPlayer).parentNode;
        const shipStatus = playerEl.querySelector(
          `.ship[data-name="${currShip.name}"]`
        );
        // Only update unupdated DOM elements
        if (!shipStatus.classList.contains("sunk")) {
          shipStatus.classList.add("sunk");
          const str = targetPlayer.name + "'s " + currShip.name + " was sunk!";
          updateMsg(str, "concat");
        }
      }
    }
    if (board.allSunk()) victory();
  };

  const findPlayerFromEl = (el) => {
    return el.matches(".player1 *") ? player : opponent;
  };

  // Finds the corresponding Ship instance for a token on the board
  const findShipFromToken = (token) => {
    const parentPlayer = findPlayerFromEl(token);
    const name = token.dataset.name;
    const obj = parentPlayer.board.ships.find((ship) => ship.name == name);
    return obj;
  };

  // Rotates a ship's position
  const rotateShip = (e) => {
    const board = findPlayerFromEl(e.target).board;
    const ship = findShipFromToken(e.target);
    const vertical = ship.isVertical();
    const rotatedPos = board.rotatePosition(ship.position, vertical);

    // Proceed if rotated position is valid
    if (board.placeShip(ship, rotatedPos)) {
      const rotated = 1 - vertical;
      e.target.style.setProperty("--vertical", rotated);
    }
    // Play shake animation if invalid
    else {
      e.target.classList.remove("shake");
      e.target.classList.add("shake");
    }
  };

  const victory = () => {
    const { victor, loser } = findVictor();
    const victoryMargin = loser.board.ships.filter((ship) => ship.sunk).length;
    const index = victor === player ? 4 + victoryMargin : victoryMargin - 1;
    const msgs = [
      ["Narrow defeat", "You were bested but not beaten"],
      ["Valiant defeat", "So close yet so far"],
      ["Honourable loss", "Better luck next time"],
      ["Crushing defeat", "The enemy proceeds unhindered"],
      ["Catastrophe", "...What even?"],
      ["Pyrrhic victory", "You won, but at what cost?"],
      ["Close victory", "Enemy eradicated with heavy casualties"],
      ["Clean Victory", ""],
      ["Naval domination", "Nothing gets past you"],
      ["Ruler of the seas", "Nary a scratch to be found"],
    ];
    toggleModal(true);
    document.querySelector(".modal .victory-msg").textContent = msgs[index][0];
    document.querySelector(".modal .subtitle").textContent = msgs[index][1];
  };

  // Toggles victory modal visibility
  const toggleModal = (visibility) => {
    document.querySelector(".modal").hidden =
      visibility ?? !document.querySelector(".modal").hidden;
  };

  const findVictor = () => {
    if (player.board.allSunk()) return { victor: opponent, loser: player };
    if (opponent.board.allSunk()) return { victor: player, loser: opponent };
    else return false;
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
    el.textContent = concatMode ? el.textContent + "\n" + msg : msg;
  };

  // Randomize ship positions
  const randomize = () => {
    const oldTokens = document.querySelectorAll(".ship-token");

    // Delete ship tokens from board
    for (const el of oldTokens) el.remove();

    // Render tokens at new ship positions
    player.board.randomizeAllShips();
    opponent.board.randomizeAllShips();
    renderShips(document.querySelector(".player1 .board"), player.board);
    renderShips(document.querySelector(".player2 .board"), opponent.board);
  };

  // Wait in real time
  const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  // Find the element of the corresponding player's board
  const getBoardEl = (targetPlayer) =>
    targetPlayer == player
      ? document.querySelector(".player1 .board")
      : document.querySelector(".player2 .board");

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

  const followMouse = (e) => {
    const cursor = document.querySelector(".spotlight");
    cursor.style.left = e.clientX - 55 + "px";
    cursor.style.top = e.clientY - 55 + "px";
  };

  const initDrag = (draggable) => {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    const board = draggable.closest(".board");
    const boardRect = board.getBoundingClientRect();

    draggable.addEventListener("dragstart", (e) => {
      startX = e.clientX;
      startY = e.clientY;
    });

    draggable.addEventListener("drag", (e) => {
      endX = e.clientX;
      endY = e.clientY;
    });

    draggable.addEventListener("dragend", (e) => {
      const dx = Math.abs(endX - startX);
      const dy = Math.abs(endY - startY);

      const distance = Math.sqrt(dx * dx + dy * dy);
      console.log(`Distance dragged: ${distance.toFixed(2)} pixels`);
    });
  };

  return { init };
}

Game().init();
