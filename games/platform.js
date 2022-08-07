/*
@title: base_platformer
@author: @farreltobias
*/

// bug fix
getTile = (x, y) => { 
  if (y < 0) return [];
  if (x < 0) return [];
  if (y >= height()) return [];
  if (x >= width()) return [];

  return getGrid()[width()*y+x] || [];
}

const createArray = (size) => [...Array(size).keys()];
const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

const player = "p";
const wall = "w";
const coin = "c";
const spike = "s";

// playing, win, loss
let status = "playing";

let didMoveRight = false;
let jumps = 0;
let size = 0;
let obstacle;
let counter = 0;

const killables = [coin, spike];

const playerDead = [
  player,
  bitmap`
................
................
................
................
................
................
................
................
................
.........33.....
.......33333....
......3333333...
...33333333333..
..3333333333333.
.33333333333333.
................`,
];

const playerAlive = [
  player,
  bitmap`
................
................
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
..333333333333..
................
................`,
];

const objects = [
  [
    wall,
    bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`,
  ],
  [
    coin,
    bitmap`
......0000......
....00222200....
...0226666660...
...0266226660...
..026626606660..
..026626606660..
..026626606660..
..026626606660..
..026626606660..
..026626606660..
..026626606660..
...0666006660...
...0666666660...
....00666600....
......0000......
................`,
  ],
  [
    spike,
    bitmap`
.....021111L0...
.....02111LL0...
.....0021LL0....
......021L0.....
......021L0.....
......022L0.....
......002L0.....
.......020......
.......020......
.......020......
........00......
........0.......
........0.......
................
................
................`,
  ],
];

setLegend(playerAlive, ...objects);

setSolids([player, wall]);

let level = 0;
const levels = [
  map`
...............
...............
...............
...............
...............
.......c.......
......ww.......
......ww.......
..ww..ww..www..
p.ww..ww..www..`,
];

const obstacles = [
  {
    width: 4,
    height: 1,
    border: 1,
    y: 6,
  },
  {
    width: 2,
    height: 2,
    border: 1,
    y: 9,
  },
  {
    width: 2,
    height: 3,
    border: 1,
    y: 9,
  },
  {
    width: 2,
    height: 2,
    border: 1,
    y: 5,
    doesFall: true,
  },
  {
    width: 3,
    height: 1,
    border: 1,
    y: 8,
  },
  {
    width: 2,
    height: 2,
    border: 1,
    y: 6,
  },
];

setMap(levels[level]);

onInput("d", () => {
  if (status === "loss") return;

  didMoveRight = true;

  if (getFirst(player).x === 10) return;

  getFirst(player).x++;
});

onInput("a", () => {
  if (status === "loss") return;

  getFirst(player).x--;
});

onInput("w", () => {
  if (status === "loss") return;

  if (jumps) return;

  jumps++;
  jump().then(async () => {
    jumps--;
  });
});

onInput("j", () => {
  nextGame();
});

const jump = async () => {
  await createArray(3).reduce(async (promise) => {
    await promise;

    getFirst(player).y--;

    checkIfKillablesWereTouched();

    await wait(100);
  }, Promise.resolve());

  await resetGravity();
};

const resetGravity = async () => {
  await createArray(3).reduce(async (promise) => {
    await promise;

    getFirst(player).y++;

    await wait(100);
  }, Promise.resolve());
};

const shake = () => {
  const gameCanvasContainer = document.querySelector(".game-canvas-container");

  gameCanvasContainer.classList.add("shake");

  setTimeout(() => {
    gameCanvasContainer.classList.remove("shake");
  }, 200);
};

// gravity
setInterval(() => {
  checkIfKillablesWereTouched();
  
  if (jumps || getFirst(player).y === 10) return;

  getFirst(player).y++;
}, 100);

const killPlayer = () => {
  status = "loss";

  addText("You lost!", {
    x: 10,
    y: 4,
    color: [255, 0, 0],
  });

  shake();

  setLegend(playerDead, ...objects);

  setTimeout(() => {
    setLegend(playerAlive, ...objects);

    setMap(levels[level]);

    getFirst(player).y = 10;
    getFirst(player).x = 0;

    clearText();

    status = "playing";
  }, 400);
};

const checkIfKillablesWereTouched = () => {
  const { y: playerY, x: playerX } = getFirst(player);

  const playerTochedKillable = getTile(playerX, playerY).some(({ type }) =>
    killables.includes(type)
  );

  console.log(playerX, playerY, getTile(playerX, playerY))

  if (playerTochedKillable) killPlayer();
};

const fallBlock = () => {
  getAll(spike).forEach((s) => {
    createArray()
  })
};

afterInput(() => {
  checkIfKillablesWereTouched();

  const { y: playerY, x: playerX } = getFirst(player);

  const playerIsBlocked = tilesWith(wall).some(
    ([{ y, x }]) => y === playerY && x === playerX + 1
  );
  const playerIsInScrollPosition = getFirst(player).x === 10;

  if (!playerIsInScrollPosition || !didMoveRight || playerIsBlocked || status === 'loss') return;

  objects.forEach(([letter]) => {
    getAll(letter).forEach((l) => {
      if (!l.x) l.remove();
      l.x--;
    });
  });

  if (!size) {
    const index = Math.floor(Math.random() * obstacles.length);
    obstacle = obstacles[index];

    size = obstacle.width + obstacle.border * 2;
  }

  const { width, border, height, y, doesFall } = obstacle;

  size -= 1;

  if (size <= width + border && size > border) {
    createArray(height).forEach((_, index, self) => {
      addSprite(14, y - index, wall);

      if (!index && doesFall) {
        addSprite(14, y - index + 1, spike);
      }
    });
  }

  didMoveRight = false;
});
