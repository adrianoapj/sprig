/*
@title: Introduction game
@author: Riya and Christy
*/

const player = "p";
const goal = "g";

setLegend(
  [ player, bitmap`
................
................
................
................
.....5555.......
....555555......
....5555555.....
....5555555.....
....5555555.....
.....555555.....
.....555555.....
......5555......
................
................
................
................`],
  [ goal, bitmap`
................
................
................
....444444......
...44....44.....
...4......4.....
...4.......4....
...4.......4....
...4.......4....
...44......4....
....4......4....
....44....44....
.....444444.....
................
................
................`]
);

let level = 0;
const levels = [
  map`
p..g`
];

const currentLevel = levels[level];
setMap(currentLevel);

setSolids([player]);

onInput("d", () => {
  getFirst(player).x += 1;
});

setInterval(() => {
  dispatch({
    type: 'popup',
  });
}, 15000);


afterInput(() => {
  // count the number of tiles with goals
  const targetNumber = tilesWith(goal).length;
  
  // count the number of tiles with goals and boxes
  const numberCovered = tilesWith(goal, player).length;

  if (numberCovered === targetNumber) {
    // increase the current level number
    addText("you win!", { y: 6 });

    dispatch({
      type: 'paywall',
    });

    nextGame();
    
  }
});