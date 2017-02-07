const State = require('./../state');
const findBiggestArmy = require('./find-biggest-army');
const findClosest = require('./find-closest');

module.exports = function(ai) {
    let biggestArmy = findBiggestArmy(ai);
    if (!biggestArmy) {
        return false;
    }
    let highestPriority = null;
    for (var r = 0; r < ai.state.height; r++) {
        for (var c = 0; c < ai.state.width; c++) {
            if (ai.state.rows[r][c].priority) {
                if (highestPriority === null || ai.state.rows[r][c].priority > highestPriority.priority) {
                    highestPriority =  ai.state.rows[r][c];
                }
            }
        }
    }
    if (highestPriority) {
        let path = ai.pathFinding.findPath(biggestArmy.x, biggestArmy.y, highestPriority.x, highestPriority.y);
        if (path.length > 1) {
            ai.debug('Move towards highest priority ' +
                ' h' + biggestArmy.x + ' ' + biggestArmy.y + ' ' +
                ' p' + highestPriority.x + ' ' + highestPriority.y + ' ' +
                ' p' + path[1][0] + ' ' + path[1][1]);
            let endIndex = path[1][1] * ai.state.width + path[1][0];
            ai._socket.emit('attack', biggestArmy.i, endIndex);
            return true;
        } else {
            ai.debug('No path to highest priority ' +
                ' h' + biggestArmy.x + ' ' + biggestArmy.y + ' ' +
                ' p' + highestPriority.x + ' ' + highestPriority.y);
        }
    } else {
        ai.debug('No highest priority.');
    }
    return false;
}
