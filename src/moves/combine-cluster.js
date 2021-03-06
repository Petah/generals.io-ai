module.exports = class {
    constructor() {
        this.name = 'Combine cluster';
    }

    process(ai) {
        for (let r = 0; r < ai.state.height; r++) {
            for (let c = 0; c < ai.state.width; c++) {
                let cell = ai.state.rows[r][c];

                if (cell.terrain === ai.state.playerIndex && cell.armies > 1 && cell.armies > ai.state.averageArmies) {
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

                        if (directions[i].terrain === ai.state.playerIndex && directions[i].armies > ai.state.averageArmies) {
                            ai.log('Combine cluster ' + cell.x + ':' + cell.y + ' ' + cell.armies + ' with ' + directions[i].x + ':' + directions[i].y + ' ' + directions[i].armies);
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
