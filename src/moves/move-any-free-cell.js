const State = require('./../state');

module.exports = function(ai) {
    let moved = false;
    ai.state.forEachCell((cell) => {
        if (cell.terrain === ai.playerIndex && cell.armies > 1) {
            var up = ai.state.getCellUp(cell.i);
            var down = ai.state.getCellDown(cell.i);
            var left = ai.state.getCellLeft(cell.i);
            var right = ai.state.getCellRight(cell.i);
            var directions = [up, down, left, right];

            for (var i = 0; i < directions.length; i++) {
                var direction = directions[i];
                if (!direction) {
                    continue;
                }
                if (direction.terrain == State.TILE_EMPTY && direction.cities === -1) {
                    ai.debug('Move next');
                    moved = true;
                    ai._socket.emit('attack', cell.i, direction.i);
                    return true;
                }
                if (direction.terrain >= 0 && direction.terrain != ai.playerIndex && direction.armies < cell.armies - 1) {
                    ai.debug('Attack next');
                    moved = true;
                    ai._socket.emit('attack', cell.i, direction.i);
                    return true;
                }
            }
        }
    });
    return moved;
}
