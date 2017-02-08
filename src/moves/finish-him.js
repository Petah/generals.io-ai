const State = require('./../state');
const findBiggestArmy = require('./find-biggest-army');
const findClosest = require('./find-closest');

module.exports = function(ai, factor) {
    for (let r = 0; r < ai.state.height; r++) {
        for (let c = 0; c < ai.state.width; c++) {
            let cell = ai.state.rows[r][c];

            if (cell.terrain >= 0 && cell.terrain !== ai.playerIndex && cell.wasGeneral) {
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

                    if (directions[i].terrain === ai.playerIndex && directions[i].armies > cell.armies) {
                        ai.log('Finish him ' + cell.x + ':' + cell.y + ' ' + cell.armies + ' with ' + directions[i].x + ':' + directions[i].y + ' ' + directions[i].armies);
                        ai._socket.emit('attack', directions[i].i, cell.i);
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
