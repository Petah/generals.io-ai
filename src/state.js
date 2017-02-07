const patch = require('./patch');
const findClosest = require('./moves/find-closest');

const TILE_EMPTY = -1;
const TILE_MOUNTAIN = -2;
const TILE_FOG = -3;
const TILE_FOG_OBSTACLE = -4;

class State {

    constructor(ai) {
        this.generals = null;
        this.cities = [];
        this.map = [];
        this.log = [];
        this.chat = [];
        this.rows = null;
        this.fogPriorityCalculated = false;
    }

    update(ai, data) {
        this.scores = data.scores;
        this.stars = data.stars;
        this.turn = data.turn;
        this.cities = patch(this.cities, data.cities_diff);
        this.map = patch(this.map, data.map_diff);
        this.generals = data.generals;
        this.playerIndex = ai.playerIndex;

        // The first two terms in |map| are the dimensions.
        this.width = this.map[0];
        this.height = this.map[1];
        this.size = this.width * this.height;

        // The next |size| terms are army values.
        // armies[0] is the top-left corner of the map.
        this.armies = this.map.slice(2, this.size + 2);
        this.armiesLength = this.armies.length;

        // The last |size| terms are terrain values.
        // terrain[0] is the top-left corner of the map.
        this.terrain = this.map.slice(this.size + 2, this.size + 2 + this.size);
        this.terrainLength = this.terrain.length;

        this.minArmies = 999999;
        this.maxArmies = 0;

        if (this.rows === null) {
            this.rows = [];
            for (var r = 0; r < this.height; r++) {
                var row = [];
                for (var c = 0; c < this.width; c++) {
                    let i = r * this.width + c;
                    row.push({
                        i: i,
                        x: c,
                        y: r,
                        priority: 0,
                        general: -1,
                        wasGeneral: false,
                        cost: 0,
                    });
                }
                this.rows.push(row);
            }
        }

        for (var r = 0; r < this.height; r++) {
            for (var c = 0; c < this.width; c++) {
                let i = r * this.width + c;

                let general = this.generals.indexOf(i);
                if (this.terrain[i] !== ai.playerIndex) {
                    if (general !== -1) {
                        this.rows[r][c].wasGeneral = true;
                    }
                } else {
                    this.rows[r][c].wasGeneral = false;
                }

                if (this.rows[r][c].terrain !== TILE_MOUNTAIN) {
                    this.rows[r][c].terrain = this.terrain[i];
                    this.rows[r][c].armies = this.armies[i];
                    this.rows[r][c].cities = this.cities.indexOf(i);
                    this.rows[r][c].general = general;
                }

                // Prioritise generals
                if (this.rows[r][c].wasGeneral) {
                    this.rows[r][c].priority = 1;
                } else if (this.rows[r][c].terrain === TILE_EMPTY) {
                    this.rows[r][c].priority = 0;
                } else if (this.rows[r][c].terrain === ai.playerIndex) {
                    this.rows[r][c].priority = 0;
                }

                // Min/max armies
                if (this.terrain[i] === ai.playerIndex) {
                    this.minArmies = Math.min(this.minArmies, this.armies[i]);
                    this.maxArmies = Math.max(this.maxArmies, this.armies[i]);
                }
            }
        }

        this.base = data.generals && data.generals.length && data.generals[ai.playerIndex] >= 0 ? this.getCell(data.generals[ai.playerIndex]) : null;
    }

    updatePriority(ai) {
        // Calculate fog priority
        // if (!this.fogPriorityCalculated || this.turn % 20 === 0) {
        //     this.fogPriorityCalculated = true;
            let r = this.turn % this.height;
            // for (var r = 0; r < this.height; r++) {
                for (var c = 0; c < this.width; c++) {
                    if (this.rows[r][c].terrain === TILE_FOG) {
                        let [closest, distance] = findClosest(ai, c, r, (cell) => {
                            if (cell.terrain === TILE_EMPTY || cell.terrain >= 0) {
                                return true;
                            }
                        }, findClosest.TYPE_SHORTEST_PATH_IGNORE_PRIORITY);
                        if (closest) {
                            if (closest.terrain >= 0 && closest.terrain !== ai.playerIndex) {
                                this.rows[r][c].priority = Math.min(1, Math.abs((distance / (this.width + this.height))) * 2);
                            } else {
                                this.rows[r][c].priority = Math.abs((distance / (this.width + this.height)));
                            }
                        }
                    }
                }
            // }
        // }
    }

    forEachCell(callback) {
        for (var r = 0; r < this.height; r++) {
            for (var c = 0; c < this.width; c++) {
                if (callback(this.rows[r][c])) {
                    return;
                }
            }
        }
    }

    getCell(i) {
        let r = Math.floor(i / this.width);
        let c = i % this.width;
        return this.rows[r][c];
    }

    getCellUp(i) {
        let r = Math.floor(i / this.width);
        let c = i % this.width;
        r--;
        if (r < 0) {
            return null;
        }
        return this.rows[r][c];
    }

    getCellDown(i) {
        let r = Math.floor(i / this.width);
        let c = i % this.width;
        r++;
        if (r >= this.height) {
            return null;
        }
        return this.rows[r][c];
    }

    getCellLeft(i) {
        let r = Math.floor(i / this.width);
        let c = i % this.width;
        c--;
        if (c < 0) {
            return null;
        }
        return this.rows[r][c];
    }

    getCellRight(i) {
        let r = Math.floor(i / this.width);
        let c = i % this.width;
        c++;
        if (c >= this.width) {
            return null;
        }
        return this.rows[r][c];
    }

    isCellUpTerrain(i, type) {
        var cell = this.getCellUp(i);
        return cell && cell.terrain === type;
    }

    isCellDownTerrain(i, type) {
        var cell = this.getCellDown(i);
        return cell && cell.terrain === type;
    }

    isCellLeftTerrain(i, type) {
        var cell = this.getCellLeft(i);
        return cell && cell.terrain === type;
    }

    isCellRightTerrain(i, type) {
        var cell = this.getCellRight(i);
        return cell && cell.terrain === type;
    }
}

module.exports = State;

module.exports.TILE_EMPTY = TILE_EMPTY;
module.exports.TILE_MOUNTAIN = TILE_MOUNTAIN;
module.exports.TILE_FOG = TILE_FOG;
module.exports.TILE_FOG_OBSTACLE = TILE_FOG_OBSTACLE;
