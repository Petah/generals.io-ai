const PF = require('pathfinding');
const State = require('./state');

const BLOCKED = 1;
const FREE = 0;

class PathFinding {

    constructor() {
        this.finder = new PF.AStarFinder({
            allowDiagonal: false,
            useCost: true,
        });
        this.finderIgnorePriority = new PF.AStarFinder({
            allowDiagonal: false,
            useCost: false,
        });
        this.finderIncludeCities = new PF.AStarFinder({
            allowDiagonal: false,
            useCost: true,
        });
    }

    update(state) {
        let matrix = [];
        let matrixIncludeCities = [];
        let costs = [];
        for (let r = 0; r < state.height; r++) {
            matrix[r] = [];
            matrixIncludeCities[r] = [];
            costs[r] = [];
            for (let c = 0; c < state.width; c++) {
                let col = state.rows[r][c];
                if (col.terrain === State.TILE_MOUNTAIN) {
                    matrix[r][c] = BLOCKED;
                    matrixIncludeCities[r][c] = BLOCKED;
                    costs[r][c] = 0;
                } else if (col.terrain === State.TILE_FOG_OBSTACLE) {
                    matrix[r][c] = BLOCKED;
                    matrixIncludeCities[r][c] = BLOCKED;
                    costs[r][c] = 0;
                } else if (col.wasCity) {
                    matrixIncludeCities[r][c] = FREE;
                    costs[r][c] = 10;
                    matrix[r][c] = BLOCKED;
                    if (col.terrain === state.playerIndex) {
                        costs[r][c] = Math.max(0, costs[r][c] - col.armies + 1);
                        matrix[r][c] = FREE;
                    } else if (col.wasEnemy) {
                        costs[r][c] += col.wasEnemy.armies;
                    }
                    state.rows[r][c].cost = costs[r][c];
                } else {
                    matrix[r][c] = FREE;
                    matrixIncludeCities[r][c] = FREE;
                    costs[r][c] = 10;
                    if (col.terrain === state.playerIndex) {
                        costs[r][c] = Math.max(0, costs[r][c] - col.armies + 1);
                    } else if (col.wasEnemy) {
                        costs[r][c] += col.wasEnemy.armies;
                    }
                    state.rows[r][c].cost = costs[r][c];
                }
            }
        }
        this.grid = new PF.Grid(state.width, state.height, matrix, costs);
        this.gridIncludeCities = new PF.Grid(state.width, state.height, matrixIncludeCities, costs);
    }

    findPath(x1, y1, x2, y2) {
        return this.finder.findPath(x1, y1, x2, y2, this.grid.clone());
    }

    findPathIgnorePriority(x1, y1, x2, y2) {
        return this.finderIgnorePriority.findPath(x1, y1, x2, y2, this.grid.clone());
    }

    findPathIncludeCities(x1, y1, x2, y2) {
        return this.finderIgnorePriority.findPath(x1, y1, x2, y2, this.gridIncludeCities.clone());
    }
}

module.exports = PathFinding;
