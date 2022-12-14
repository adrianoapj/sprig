/*
@title: flightless_bird
@author: ced
*/

setLegend({
  d: bitmap`
.00000.0000.000.
................
................
...0000000000...
..0.0..0...0.0..
..0.00000000.0..
..000......000..
..0.0......0.0..
..0.0......0.0..
..0.0......0.0..
..000......0.0..
..0.0......0.0..
..000...00.000..
..0.0......0.0..
..0.0......000..
..0.0......0.0..`,
  '8': bitmap`
.0000.000000.000
0....0......0...
0....0......0...
0....0......0...
.0000.000000.000
................
00.0000.00000.00
..0....0.....0..
..0....0.....0..
..0....0.....0..
00.0000.00000.00
................
0000.0000.00000.
....0....0.....0
....0....0.....0
....0....0.....0`,
  '7': bitmap`
.5555.555555.555
5....5......5...
5....5......5...
5....5......5...
.5555.555555.555
................
55.5555.55555.55
..5....5.....5..
..5....5.....5..
..5....5.....5..
55.5555.55555.55
................
5555.5555.55555.
....5....5.....5
....5....5.....5
....5....5.....5`,
    c: bitmap`
.00000.0000.000.
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................`,
    l: bitmap`
.00000.0000.000.
................
.......5........
......555.......
......555.......
.....555.5......
.....55.55......
......555.......
................
................
................
................
................
................
................
................`,
    o: bitmap`
................
................
.......5........
......555.......
......555.......
.....555.5......
.....55.55......
......555.......
................
................
................
................
................
................
................
................`,
    i: bitmap`
......5555......
....55....55....
..55........55..
.5............5.
5.55........55.5
5...55....55...5
5.....5555.....5
5..5....5......5
5.5.....5......5
5....5..5......5
5...5...5......5
.5......5.....5.
..55....5...55..
....55..5.55....
......5555......
................ `,    
    p: bitmap`
.......000......
.....00..00.....
....0......0....
....0......000..
.....00...000...
....0..000......
....0....00.....
....0.....0.....
....0......0....
...0........0...
...0...0....0...
..0....0....0...
..0....0...0....
...0000...0.....
.......000......
......0...0.....`,
    'I': allOf('i', 'o'),
    
    /* that's a dub */
    'w': allOf('p', 'd')
})

setSolids(["p", "8", "7"]);
setPushables({ p: ["7"] });
// setZOrder(["p","r", "0"]);

let level = 0;
const levels = [
        map`
8888888888
8ccccclc88
8.......d8
8p.....888
888888.888
888888.888`,
        map`
8ccclcccc8
8........8
8p.......8
8888.....d
8888...888
8888...888`,
        map`
8cclccccc8
8........8
8p.......8
8888.....d
8888...888
8888...888`,
];

setMap(levels[level]);

let move = [0, 0];
onInput(   "up", _ => move = [ 0, -1])
// onInput( "down", _ => move = [ 0,  1])
// onInput( "left", _ => move = [-1,  0])
onInput("right", _ => move = [ 1,  0])

/* ice cube launching special power! */
onInput(    "l", _ => {
    const { x, y } = getFirst("p");
    addSprite("i", x+1, y);
})
/* reset level */
onInput(    "j", _ => setMap(levels[level]));

const isBrick = ({ type }) => ['7', '8'].includes(type);

let tick = 0;
setInterval(_ => {
    /* turn ice cube + rain drop = blue brick */
    // BUG:
    // replace('I', '7');
    // matches not just ['i', 'o'], but ['i', 'i'] and ['o', 'o']
    for (const {x, y} of getAll('i'))
        if (getTile(x, y).some(x => x.type == "o"))
            clearTile(x, y), addSprite("7", x, y);

        
    /* gravity */
    for (const o of getAll("o")) o.y += 1;
    for (const o of getAll("7")) o.y += 1;

    /* flying ice cubes */
    for (const i of getAll("i")) i.x += 1;

    
    /* player movement! */
    const { x, y } = getFirst("p");
    getFirst("p").x += move[0];
    getFirst("p").y += move[1] + ((getTile(x, y+1) ?? []).some(isBrick) == 0);
    move = [0, 0];
    
    
    tick++;
    /* leaks ("l") drip drops ("o") every 4th tick */
    if (tick%4 == 0) {
        for (const {x, y} of getAll("l"))
            addSprite("o", x, y);
    }

    
    /* ice and drops break on bricks */
    for (const t of ["i", "o"].flatMap(getAll))
        if (getTile(t.x, t.y).some(isBrick))
            t.remove();


    /* next map when player touch door */
    if (match("w").length > 0 && levels[level+1])
        setMap(levels[++level]);
}, 200);
