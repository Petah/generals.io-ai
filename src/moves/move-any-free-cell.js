module.exports = class {
    constructor() {
        this.name = 'Move any free cell';
    }

    process(ai) {
        for (let r = 0; r < ai.state.height; r++) {
            for (let c = 0; c < ai.state.width; c++) {
                let cell = ai.state.rows[r][c];
                if (cell.terrain === ai.state.playerIndex && cell.armies > 1) {
                    if (cell.armies >= ai.state.maxArmies / 2) {
                        continue;
                    }
                    var up = ai.state.getCellUp(cell.i);
                    var down = ai.state.getCellDown(cell.i);
                    var left = ai.state.getCellLeft(cell.i);
                    var right = ai.state.getCellRight(cell.i);
                    var directions = [up, down, left, right];

                    for (let i = 0; i < directions.length; i++) {
                        // Check outside map
                        if (!directions[i]) {
                            continue;
                        }

                        if (directions[i].terrain == TILE_EMPTY && !directions[i].wasCity) {
                            ai.debug('Move next');
                            ai._socket.emit('attack', cell.i, directions[i].i);
                            return true;
                        }
                        if (directions[i].terrain >= 0 && directions[i].terrain != ai.state.playerIndex && directions[i].armies < cell.armies - 1) {
                            ai.debug('Attack next');
                            ai._socket.emit('attack', cell.i, directions[i].i);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
};
