const mp = require('../mp');
const findClosest = require('../src/moves/find-closest');
const pointDistance = require('../src/moves/point-distance');
const PathFinding = require('../src/path-finding');

console.log('Starting calculate paths worker');
const pathFinding = new PathFinding();

const countEnemyTilesInRange = (state, x, y, range) => {
    let count = 0;
    for (let r = 0; r < state.height; r++) {
        for (let c = 0; c < state.width; c++) {
            if (state.rows[r][c].wasEnemy) {
                if (pointDistance(x, y, c, r) <= range) {
                    count++;
                }
            }
        }
    }
    return count;
};

mp.on((state, respond) => {
    // console.log('Calculate priority map');
    let start = new Date().getTime();
    pathFinding.update(state);
    let priorityMap = [];
    for (let r = 0; r < state.height; r++) {
        priorityMap[r] = [];
        for (let c = 0; c < state.width; c++) {
            priorityMap[r][c] = 0;
            if (state.rows[r][c].wasGeneral) {
                priorityMap[r][c] = 10;
            } else if (state.rows[r][c].terrain === TILE_EMPTY || state.rows[r][c].terrain === TILE_MOUNTAIN || state.rows[r][c].terrain === state.playerIndex) {
                priorityMap[r][c] = 0;
            } else if (state.rows[r][c].terrain === TILE_FOG) {
                let count = countEnemyTilesInRange(state, c, r, 4);

                let [closest, distance] = findClosest(state, pathFinding, c, r, (cell) => {
                    if (cell.terrain === TILE_EMPTY || cell.terrain >= 0) {
                        return true;
                    }
                }, findClosest.TYPE_SHORTEST_PATH_IGNORE_PRIORITY);

                if (closest) {
                    if (closest.terrain >= 0 && closest.terrain !== state.playerIndex) {
                        priorityMap[r][c] = Math.min(1, Math.abs((distance / (state.width + state.height))) * 2);
                        priorityMap[r][c] += (count / 8);
                    } else {
                        priorityMap[r][c] = Math.abs((distance / (state.width + state.height)));
                        priorityMap[r][c] += (count / 8);
                    }
                    if (state.rows[r][c].notGeneral) {
                        priorityMap[r][c] = 0;
                    }
                }
            }
        }
    }
    // console.log('Calculated priority map in ' + (new Date().getTime() - start) + 'ms');

    respond(priorityMap);
});
