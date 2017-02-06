const findBiggestArmy = require('./find-biggest-army');

const moveRandom = (ai, cell) => {
    let bailout = 100;
    while (bailout > 0) {
        // If we own this tile, make a random move starting from it.
        let index = cell.i;
        let row = Math.floor(index / ai.state.width);
        let col = index % ai.state.width;
        let endIndex = index;

        let rand = Math.random();
        if (rand < 0.25 && col > 0) { // left
            endIndex--;
            ai.debug('Left');
        } else if (rand < 0.5 && col < ai.state.width - 1) { // right
            endIndex++;
            ai.debug('Right');
        } else if (rand < 0.75 && row < ai.state.height - 1) { // down
            endIndex += ai.state.width;
            ai.debug('Down');
        } else if (row > 0) { //up
            endIndex -= ai.state.width;
            ai.debug('Up');
        } else {
            ai.debug('Skip');
            return false;
        }

        if (endIndex >= ai.state.size) {
            ai.debug('Invalid');
            return false;
        }

        // Would we be attacking a city? Don't attack cities.
        // if (ai.state.cities.indexOf(endIndex) >= 0 && ai.state.armies[index] < ai.state.armies[endIndex]) {
        //     ai.debug('City');
        //     return false;
        // }

        ai._socket.emit('attack', index, endIndex);
        return true;
    }
    ai.debug('Bail out');
    return false;
}

module.exports = function(ai) {
    let biggest = findBiggestArmy(ai);
    if (biggest !== null) {
        ai.debug('Move biggest.');
        if (moveRandom(ai, biggest)) {
            return true;
        }
    }
    return false;
};