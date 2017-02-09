const State = require('./../state');
const findBiggestArmy = require('./find-biggest-army');
const findClosest = require('./find-closest');

module.exports = function(ai) {
    let highestPriority = null;
    for (let r = 0; r < ai.state.height; r++) {
        for (let c = 0; c < ai.state.width; c++) {
            if (ai.state.priorityMap[r][c]) {
                if (highestPriority === null || ai.state.priorityMap[r][c] > ai.state.priorityMap[highestPriority.y][highestPriority.x]) {
                    highestPriority =  ai.state.rows[r][c];
                }
            }
        }
    }

    let biggestArmy = findBiggestArmy(ai, (cell) => {
        let path = ai.pathFinding.findPath(cell.x, cell.y, highestPriority.x, highestPriority.y);
        if (path.length === 2 && cell.armies < highestPriority.armies / 2) {
            ai.debug('Avoiding ' + cell.x + ' ' + cell.y + ' armies ' + cell.armies);
            return false;
        }
        return true;
    });
    if (!biggestArmy) {
        return false;
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
