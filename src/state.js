const patch = require('./patch');

const TILE_EMPTY = -1;
const TILE_MOUNTAIN = -2;
const TILE_FOG = -3;
const TILE_FOG_OBSTACLE = -4;

class State {

    constructor(ai) {
        this.ai = ai;
        this.generals = null;
        this.cities = [];
        this.map = [];
        this.log = [];
        this.chat = [];
    }

    update(data) {
        this.scores = data.scores;
        this.stars = data.stars;
        this.turn = data.turn;
        this.cities = patch(this.cities, data.cities_diff);
        this.map = patch(this.map, data.map_diff);
        this.generals = data.generals;
        this.playerIndex = this.ai.playerIndex;

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

        this.rows = [];
        for (var r = 0; r < this.height; r++) {
            var row = [];
            for (var c = 0; c < this.width; c++) {
                let i = r * this.width + c;
                if (this.terrain[i] === this.ai.playerIndex) {
                    this.minArmies = Math.min(this.minArmies, this.armies[i]);
                    this.maxArmies = Math.max(this.maxArmies, this.armies[i]);
                }
                row.push({
                    i: i,
                    x: c,
                    y: r,
                    terrain: this.terrain[i],
                    armies: this.armies[i],
                    cities: this.cities.indexOf(i),
                    general: this.generals.indexOf(i),
                });
            }
            this.rows.push(row);
        }

        this.base = data.generals && data.generals.length && data.generals[this.ai.playerIndex] >= 0 ? this.getCell(data.generals[this.ai.playerIndex]) : null;
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
