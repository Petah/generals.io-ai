const PF = require('pathfinding');
const State = require('./state');

const BLOCKED = 1;
const FREE = 0;

class PathFinding {

    constructor(ai) {
        this.ai = ai;
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

    update() {
        let matrix = [];
        let matrixIncludeCities = [];
        let costs = [];
        for (var r = 0; r < this.ai.state.height; r++) {
            matrix[r] = [];
            matrixIncludeCities[r] = [];
            costs[r] = [];
            for (var c = 0; c < this.ai.state.width; c++) {
                let col = this.ai.state.rows[r][c];
                if (col.terrain === State.TILE_MOUNTAIN) {
                    matrix[r][c] = BLOCKED;
                    matrixIncludeCities[r][c] = BLOCKED;
                    costs[r][c] = 0;
                } else if (col.terrain === State.TILE_FOG_OBSTACLE) {
                    matrix[r][c] = BLOCKED;
                    matrixIncludeCities[r][c] = BLOCKED;
                    costs[r][c] = 0;
                } else if (col.cities !== -1) {
                    matrix[r][c] = BLOCKED;
                    matrixIncludeCities[r][c] = FREE;
                    costs[r][c] = 10;
                    if (col.terrain === this.ai.playerIndex) {
                        costs[r][c] = Math.max(0, costs[r][c] - col.armies + 1);
                    } else if (col.terrain >= 0) {
                        costs[r][c] += col.armies;
                    }
                    this.ai.state.rows[r][c].cost = costs[r][c];
                } else {
                    matrix[r][c] = FREE;
                    matrixIncludeCities[r][c] = FREE;
                    costs[r][c] = 10;
                    if (col.terrain === this.ai.playerIndex) {
                        costs[r][c] = Math.max(0, costs[r][c] - col.armies + 1);
                    } else if (col.terrain >= 0) {
                        costs[r][c] += col.armies;
                    }
                    this.ai.state.rows[r][c].cost = costs[r][c];
                }
            }
        }
        this.grid = new PF.Grid(this.ai.state.width, this.ai.state.height, matrix, costs);
        this.gridIncludeCities = new PF.Grid(this.ai.state.width, this.ai.state.height, matrixIncludeCities, costs);
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
