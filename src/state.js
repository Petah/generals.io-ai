const patch = require('./patch');
const findClosest = require('./moves/find-closest');

class State {

    constructor(ai) {
        this.turn = 0;
        this.generals = null;
        this.cities = [];
        this.map = [];
        this.log = [];
        this.chat = [];
        this.rows = null;
        this.fogPriorityCalculated = false;
        this.stats = ai.stats;
        this.priorityMap = null;
    }

    update(data) {
        this.scores = data.scores;
        this.stars = data.stars;
        this.turn = data.turn;
        this.cities = patch(this.cities, data.cities_diff);
        this.map = patch(this.map, data.map_diff);
        this.generals = data.generals;

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
        this.averageArmies = 0;
        this.totalArmies = 0;
        this.armiesCount = 0;

        if (this.rows === null) {
            this.rows = [];
            for (let r = 0; r < this.height; r++) {
                var row = [];
                for (let c = 0; c < this.width; c++) {
                    let i = r * this.width + c;
                    row.push({
                        i: i,
                        x: c,
                        y: r,
                        priority: 0,
                        general: -1,
                        wasGeneral: false,
                        notGeneral: null,
                        wasCity: null,
                        wasEnemy: null,
                        cost: 0,
                    });
                }
                this.rows.push(row);
            }
        }

        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                let i = r * this.width + c;

                let general = this.generals.indexOf(i);
                if (this.terrain[i] !== this.playerIndex) {
                    if (general !== -1) {
                        this.rows[r][c].wasGeneral = true;
                    }
                } else {
                    this.rows[r][c].wasGeneral = false;
                }

                if (this.rows[r][c].notGeneral === null) {
                    if (general === -1 && this.terrain[i] !== TILE_FOG && this.terrain[i] !== TILE_FOG_OBSTACLE) {
                        this.rows[r][c].notGeneral = true;
                    }
                }

                if (this.rows[r][c].terrain !== TILE_MOUNTAIN) {
                    this.rows[r][c].terrain = this.terrain[i];
                    this.rows[r][c].armies = this.armies[i];
                    this.rows[r][c].cities = this.cities.indexOf(i);
                    this.rows[r][c].general = general;
                }

                if (this.rows[r][c].cities >= 0 && this.rows[r][c].wasCity === null) {
                    this.rows[r][c].wasCity = true;
                }

                if (this.rows[r][c].terrain >= 0 && this.rows[r][c].terrain !== this.playerIndex) {
                    this.rows[r][c].wasEnemy = {
                        playerIndex: this.rows[r][c].terrain,
                        armies: this.rows[r][c].armies,
                    };
                } else if (this.rows[r][c].terrain === TILE_EMPTY || this.rows[r][c].terrain === this.playerIndex) {
                    this.rows[r][c].wasEnemy = null;
                }

                // Min/max armies
                if (this.terrain[i] === this.playerIndex) {
                    this.minArmies = Math.min(this.minArmies, this.armies[i]);
                    this.maxArmies = Math.max(this.maxArmies, this.armies[i]);
                    if (this.armies[i] > 1) {
                        this.totalArmies += this.armies[i] - 1;
                        this.armiesCount++
                    }
                }
            }
        }

        this.averageArmies = this.totalArmies / this.armiesCount;

        this.base = data.generals && data.generals.length && data.generals[this.playerIndex] >= 0 ? this.getCell(data.generals[this.playerIndex]) : null;
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
