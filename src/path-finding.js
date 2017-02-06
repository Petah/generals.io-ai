const PF = require('pathfinding');
const State = require('./state');

class PathFinding {

    constructor(ai) {
        this.ai = ai;
        this.finder = new PF.AStarFinder({
            allowDiagonal: false,
        });
    }

    update() {
        let matrix = this.ai.state.rows.map((row) => {
            return row.map((col) => {
                if ((col.terrain == State.TILE_EMPTY || col.terrain == State.TILE_FOG || col.terrain >= 0) && col.cities < 0) {
                    return 0;
                }
                return 1;
            });
        })
        this.grid = new PF.Grid(matrix);
    }

    findPath(x1, y1, x2, y2) {
        return this.finder.findPath(x1, y1, x2, y2, this.grid.clone());
    }
}

module.exports = PathFinding;
